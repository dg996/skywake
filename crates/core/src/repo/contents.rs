use std::collections::HashMap;
use std::io;
use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use futures::{StreamExt, TryStreamExt, stream};

use crate::cache::{ChunkCache, Scoped, Shared, Source};
use crate::store::bundles;
use crate::sync::lock;
use crate::{Bundled, Chunk, Data, Error, Hash, Objects, Result};

const READS_AT_ONCE: usize = 64;

#[derive(Clone)]
pub struct Chunks {
    pub cache: Arc<ChunkCache>,
    pub folder: String,
}

pub(super) struct Contents<'a> {
    objects: &'a Objects,
    chunks: Option<&'a Chunks>,
    memory: Option<&'a Scoped>,
}

struct Stored<'a> {
    objects: &'a Objects,
    folder: &'a str,
    bundled: Option<Bundled>,
}

#[async_trait]
impl Source for Stored<'_> {
    async fn fetch(&self, hash: Hash) -> io::Result<Vec<u8>> {
        let read = match &self.bundled {
            Some(bundled) => self.objects.get_bundled(bundled).await,
            None => self.objects.get_chunk(hash).await,
        };
        read.map_err(io::Error::other)
    }

    fn shared(&self) -> Option<Shared> {
        (!self.folder.is_empty()).then(|| Shared::chunks(self.folder).at(self.bundled))
    }
}

impl<'a> Contents<'a> {
    pub(super) fn new(
        objects: &'a Objects,
        chunks: Option<&'a Chunks>,
        memory: Option<&'a Scoped>,
    ) -> Self {
        Self {
            objects,
            chunks,
            memory,
        }
    }

    pub(super) async fn load(&self, files: Vec<(String, Data)>) -> Result<Vec<(String, Vec<u8>)>> {
        let mut early = self.bundled(&files).await;
        stream::iter(files)
            .map(|(path, data)| {
                let early = match &data {
                    Data::Bundled(bundled) => early.remove(&bundled.chunk.hash),
                    _ => None,
                };
                async move {
                    let bytes = match early {
                        Some(bytes) => bytes,
                        None => self.read(&data).await?,
                    };
                    Ok::<_, Error>((path, bytes))
                }
            })
            .buffered(READS_AT_ONCE)
            .try_collect()
            .await
    }

    async fn bundled(&self, files: &[(String, Data)]) -> HashMap<Hash, Vec<u8>> {
        let missing: Vec<Bundled> = files
            .iter()
            .filter_map(|(_, data)| match data {
                Data::Bundled(bundled) => Some(*bundled),
                _ => None,
            })
            .filter(|bundled| !self.held(bundled.chunk.hash))
            .collect();
        let got = Mutex::new(HashMap::with_capacity(missing.len()));
        bundles::get_many(self.objects, missing, |hash, data| {
            if let Some(memory) = self.memory {
                memory.insert(hash, &data);
            }
            lock(&got).insert(hash, data);
        })
        .await;
        got.into_inner().unwrap_or_default()
    }

    pub(super) async fn whole(&self, data: &Data) -> Result<Vec<u8>> {
        self.read(data).await
    }

    async fn read(&self, data: &Data) -> Result<Vec<u8>> {
        match data {
            Data::Inline(bytes) => Ok(bytes.clone()),
            Data::Bundled(bundled) => self.chunk(bundled.chunk.hash, Some(*bundled)).await,
            Data::Chunks(chunks) => {
                let parts: Vec<Vec<u8>> = stream::iter(chunks.to_vec())
                    .map(|chunk| self.sized(chunk))
                    .buffered(READS_AT_ONCE)
                    .try_collect()
                    .await?;
                Ok(parts.concat())
            }
        }
    }

    async fn sized(&self, chunk: Chunk) -> Result<Vec<u8>> {
        let bytes = self.chunk(chunk.hash, None).await?;
        if bytes.len() != chunk.size as usize {
            return Err(Error::Corrupt(format!(
                "chunk {} has {} bytes, but its file says {}",
                chunk.hash,
                bytes.len(),
                chunk.size
            )));
        }
        Ok(bytes)
    }

    fn held(&self, hash: Hash) -> bool {
        self.memory.is_some_and(|memory| memory.get(hash).is_some())
            || self.chunks.is_some_and(|chunks| chunks.cache.has(hash))
    }

    async fn chunk(&self, hash: Hash, bundled: Option<Bundled>) -> Result<Vec<u8>> {
        if let Some(bytes) = self.memory.and_then(|memory| memory.get(hash)) {
            return Ok(bytes.to_vec());
        }
        let bytes = self.fetch(hash, bundled).await?;
        if let Some(memory) = self.memory {
            memory.insert(hash, &bytes);
        }
        Ok(bytes)
    }

    async fn fetch(&self, hash: Hash, bundled: Option<Bundled>) -> Result<Vec<u8>> {
        let Some(chunks) = self.chunks else {
            return match bundled {
                Some(bundled) => self.objects.get_bundled(&bundled).await,
                None => self.objects.get_chunk(hash).await,
            };
        };
        let source = Stored {
            objects: self.objects,
            folder: &chunks.folder,
            bundled,
        };
        Ok(chunks.cache.get(&source, hash).await?)
    }
}
