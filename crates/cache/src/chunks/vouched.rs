//! Which folders this node has read a chunk or blob from itself.
//!
//! The cache keeps one copy of each piece of content, however many folders
//! hold it. A folder is served the copy only once the node has read the content
//! from that folder's bucket, so naming a hash gets nothing a folder does not
//! hold: knowing what another organization stores is not enough to read it.

use std::collections::{HashMap, HashSet};
use std::future::Future;
use std::io;
use std::sync::{Arc, Mutex};

use skywake_core::Hash;
use tokio::sync::OnceCell;

use super::source::Kind;
use crate::hold;

/// Pairs remembered before the set starts over; each costs 16 bytes.
const VOUCHED_MAX: usize = 4_000_000;

type Proof = Arc<OnceCell<Result<(), (io::ErrorKind, String)>>>;

#[derive(Default)]
pub(crate) struct Vouched {
    known: Mutex<HashSet<u128>>,
    /// Reads under way, so many asking at once for one folder's chunk cause one read.
    proving: Mutex<HashMap<u128, Proof>>,
}

impl Vouched {
    /// Whether `folder` holds `hash`: known already, or read from its bucket
    /// now with `read`, which must fail when the folder does not hold it.
    pub(super) async fn prove<F, Fut>(
        &self,
        kind: Kind,
        folder: &str,
        hash: Hash,
        read: F,
    ) -> io::Result<()>
    where
        F: FnOnce() -> Fut,
        Fut: Future<Output = io::Result<()>>,
    {
        let key = key(kind, folder, hash);
        if hold(&self.known).contains(&key) {
            return Ok(());
        }
        let proof = hold(&self.proving).entry(key).or_default().clone();
        let result = proof
            .get_or_init(|| async {
                let result = read()
                    .await
                    .map_err(|error| (error.kind(), error.to_string()));
                if result.is_ok() {
                    self.add(key);
                }
                hold(&self.proving).remove(&key);
                result
            })
            .await;
        result
            .clone()
            .map_err(|(kind, message)| io::Error::new(kind, message))
    }

    pub(super) fn knows(&self, kind: Kind, folder: &str, hash: Hash) -> bool {
        hold(&self.known).contains(&key(kind, folder, hash))
    }

    /// Records that this node just read `hash` from `folder`'s bucket itself.
    pub(super) fn vouch(&self, kind: Kind, folder: &str, hash: Hash) {
        self.add(key(kind, folder, hash));
    }

    fn add(&self, key: u128) {
        let mut known = hold(&self.known);
        if known.len() >= VOUCHED_MAX {
            // Forgetting only costs a read from the bucket the next time.
            known.clear();
        }
        known.insert(key);
    }
}

fn key(kind: Kind, folder: &str, hash: Hash) -> u128 {
    let mut hasher = blake3::Hasher::new();
    hasher.update(format!("{kind:?}").as_bytes());
    hasher.update(&[0]);
    hasher.update(folder.trim_matches('/').as_bytes());
    hasher.update(&[0]);
    hasher.update(hash.to_string().as_bytes());
    let digest = hasher.finalize();
    u128::from_le_bytes(digest.as_bytes()[..16].try_into().expect("16 bytes"))
}
