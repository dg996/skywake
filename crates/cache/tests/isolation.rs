mod common;

use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use object_store::memory::InMemory;
use object_store::prefix::PrefixStore;
use object_store::{ObjectStore, ObjectStoreExt};
use skywake_cache::Node;
use skywake_core::cache::ChunkCache;
use skywake_core::store::refs::Pass;
use skywake_core::{Bundled, Chunk, Hash, Objects};
use tempfile::tempdir;

use common::{TOKEN, serve};

async fn two_folders() -> (Arc<InMemory>, String, Hash, Vec<u8>) {
    let bucket = Arc::new(InMemory::new());
    let a: Arc<dyn ObjectStore> = Arc::new(PrefixStore::new(bucket.clone(), "a"));
    let data: Vec<u8> = (0..200_000u32).map(|i| (i * 13 % 251) as u8).collect();
    let hash = Objects::new(a).put_chunk(data.clone()).await.unwrap();
    let dir = tempdir().unwrap().keep();
    let cache = ChunkCache::new(dir, u64::MAX).unwrap();
    let node = Node::new(
        Arc::new(cache),
        Objects::new(bucket.clone()),
        Some(TOKEN.into()),
    );
    (bucket, serve(node).await, hash, data)
}

async fn get(url: &str, hash: Hash, folder: &str, bearer: &str) -> (u16, Vec<u8>) {
    let response = reqwest::Client::new()
        .get(format!("{url}/chunks/{hash}?in={folder}"))
        .bearer_auth(bearer)
        .send()
        .await
        .unwrap();
    let status = response.status().as_u16();
    (status, response.bytes().await.unwrap().to_vec())
}

fn pass(folder: &str) -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    Pass {
        folder: folder.into(),
        access: "read".into(),
        protected: vec![],
        expires: now + 600,
    }
    .sign(TOKEN)
}

#[tokio::test]
async fn a_folder_without_the_chunk_is_not_served_the_cached_copy() {
    let (_, url, hash, data) = two_folders().await;
    assert_eq!(get(&url, hash, "a", TOKEN).await, (200, data));
    assert_eq!(get(&url, hash, "b", TOKEN).await.0, 404);
}

#[tokio::test]
async fn a_folder_that_holds_the_chunk_too_is_served_it() {
    let (bucket, url, hash, data) = two_folders().await;
    assert_eq!(get(&url, hash, "a", TOKEN).await.0, 200);
    let b: Arc<dyn ObjectStore> = Arc::new(PrefixStore::new(bucket, "b"));
    Objects::new(b).put_chunk(data.clone()).await.unwrap();
    assert_eq!(get(&url, hash, "b", TOKEN).await, (200, data));
}

#[tokio::test]
async fn a_folder_keeps_its_chunk_once_proved() {
    let (bucket, url, hash, data) = two_folders().await;
    assert_eq!(get(&url, hash, "a", TOKEN).await.0, 200);
    let path = object_store::path::Path::from(format!("a/chunks/{hash}"));
    bucket.delete(&path).await.unwrap();
    assert_eq!(get(&url, hash, "a", TOKEN).await, (200, data));
}

#[tokio::test]
async fn a_pass_reads_only_its_own_folder() {
    let (_, url, hash, data) = two_folders().await;
    assert_eq!(get(&url, hash, "a", &pass("a")).await, (200, data));
    assert_eq!(get(&url, hash, "a", &pass("b")).await.0, 401);
    assert_eq!(get(&url, hash, "", &pass("a")).await.0, 401);
    assert_eq!(get(&url, hash, "a", "not-a-pass").await.0, 401);
}

#[tokio::test]
async fn a_bundle_read_skips_chunks_the_folder_does_not_hold() {
    let (bucket, url, hash, data) = two_folders().await;
    assert_eq!(get(&url, hash, "a", TOKEN).await.0, 200);
    let fake = Hash::of(b"a bundle folder b made up");
    let path = object_store::path::Path::from(format!("b/bundles/{fake}"));
    bucket.put(&path, vec![0u8; 64].into()).await.unwrap();
    let wanted = vec![Bundled {
        chunk: Chunk {
            hash,
            size: data.len() as u32,
        },
        bundle: fake,
        offset: 0,
        len: 64,
    }];
    let reply = reqwest::Client::new()
        .post(format!("{url}/bundles/{fake}?in=b"))
        .bearer_auth(TOKEN)
        .body(postcard::to_allocvec(&wanted).unwrap())
        .send()
        .await
        .unwrap();
    assert_eq!(reply.status().as_u16(), 200);
    assert_eq!(reply.bytes().await.unwrap().to_vec(), vec![0]);
}
