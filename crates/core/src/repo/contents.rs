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

pub type Bytes = Arc<[u8]>;

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

    pub(super) async fn load(&self, files: Vec<(String, Data)>) -> Result<Vec<(String, Bytes)>> {
        let mut loaded = Vec::with_capacity(files.len());
        let mut missing = Vec::new();
        for (at, (path, data)) in files.into_iter().enumerate() {
            match self.cached(&data) {
                Some(bytes) => loaded.push((path, bytes)),
                None => {
                    loaded.push((path, Bytes::from([])));
                    missing.push((at, data));
                }
            }
        }
        for (at, bytes) in self.fetched(missing).await? {
            loaded[at].1 = bytes;
        }
        Ok(loaded)
    }

    pub(super) async fn whole(&self, data: &Data) -> Result<Bytes> {
        match self.cached(data) {
            Some(bytes) => Ok(bytes),
            None => self.read(data).await,
        }
    }

    fn cached(&self, data: &Data) -> Option<Bytes> {
        match data {
            Data::Inline(bytes) => Some(Bytes::from(bytes.as_slice())),
            Data::Bundled(bundled) => self.memory?.get(bundled.chunk.hash),
            Data::Chunks(chunks) => match chunks.as_slice() {
                [only] => self
                    .memory?
                    .get(only.hash)
                    .filter(|b| b.len() == only.size as usize),
                _ => None,
            },
        }
    }

    async fn fetched(&self, missing: Vec<(usize, Data)>) -> Result<Vec<(usize, Bytes)>> {
        let mut early = self.bundled(&missing).await;
        stream::iter(missing)
            .map(|(at, data)| {
                let early = match &data {
                    Data::Bundled(bundled) => early.remove(&bundled.chunk.hash),
                    _ => None,
                };
                async move {
                    let bytes = match early {
                        Some(bytes) => bytes,
                        None => self.read(&data).await?,
                    };
                    Ok::<_, Error>((at, bytes))
                }
            })
            .buffered(READS_AT_ONCE)
            .try_collect()
            .await
    }

    async fn bundled(&self, files: &[(usize, Data)]) -> HashMap<Hash, Bytes> {
        let missing: Vec<Bundled> = files
            .iter()
            .filter_map(|(_, data)| match data {
                Data::Bundled(bundled) => Some(*bundled),
                _ => None,
            })
            .filter(|bundled| !self.chunks.is_some_and(|c| c.cache.has(bundled.chunk.hash)))
            .collect();
        let got = Mutex::new(HashMap::with_capacity(missing.len()));
        bundles::get_many(self.objects, missing, |hash, data| {
            let bytes = Bytes::from(data);
            self.remember(hash, &bytes);
            lock(&got).insert(hash, bytes);
        })
        .await;
        got.into_inner().unwrap_or_default()
    }

    async fn read(&self, data: &Data) -> Result<Bytes> {
        match data {
            Data::Inline(bytes) => Ok(Bytes::from(bytes.as_slice())),
            Data::Bundled(bundled) => self.chunk(bundled.chunk.hash, Some(*bundled)).await,
            Data::Chunks(chunks) => {
                let parts: Vec<Bytes> = stream::iter(chunks.to_vec())
                    .map(|chunk| self.sized(chunk))
                    .buffered(READS_AT_ONCE)
                    .try_collect()
                    .await?;
                match <[Bytes; 1]>::try_from(parts) {
                    Ok([only]) => Ok(only),
                    Err(parts) => Ok(Bytes::from(parts.concat())),
                }
            }
        }
    }

    async fn sized(&self, chunk: Chunk) -> Result<Bytes> {
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

    async fn chunk(&self, hash: Hash, bundled: Option<Bundled>) -> Result<Bytes> {
        if let Some(bytes) = self.memory.and_then(|memory| memory.get(hash)) {
            return Ok(bytes);
        }
        let bytes = Bytes::from(self.fetch(hash, bundled).await?);
        self.remember(hash, &bytes);
        Ok(bytes)
    }

    fn remember(&self, hash: Hash, bytes: &Bytes) {
        if let Some(memory) = self.memory {
            memory.insert(hash, bytes.clone());
        }
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
