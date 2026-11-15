use std::sync::{Arc, OnceLock};

use napi::Result;
use skywake_core::cache::{Memory, Scoped};
use skywake_core::{Chunks, Repo};

use crate::error::failure;
use crate::index::open::disk;

const MEMORY_MB: u64 = 1024;

pub(super) fn warmed(repo: Repo, location: &str, folder: Option<String>) -> Result<Repo> {
    let (objects, contents) = memories()?;
    let repo = repo.with_memory(
        Scoped::new(objects, location),
        Scoped::new(contents, location),
    );
    Ok(match (folder, disk()?) {
        (Some(folder), Some(cache)) => repo.with_chunks(Chunks { cache, folder }),
        _ => repo,
    })
}

type Memories = (Arc<Memory>, Arc<Memory>);

fn memories() -> Result<Memories> {
    static MEMORIES: OnceLock<std::result::Result<Memories, String>> = OnceLock::new();
    let memories = MEMORIES.get_or_init(|| {
        let mb = match std::env::var("SKYWAKE_FILES_MEMORY_MB") {
            Ok(mb) => mb
                .parse::<u64>()
                .map_err(|_| format!("SKYWAKE_FILES_MEMORY_MB: `{mb}` is not a whole number"))?,
            Err(_) => MEMORY_MB,
        };
        let bytes = mb << 20;
        Ok((
            Arc::new(Memory::new(bytes / 4)),
            Arc::new(Memory::new(bytes - bytes / 4)),
        ))
    });
    memories
        .clone()
        .map_err(|message| failure("internal", message))
}
