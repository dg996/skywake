//! Many chunks of one bundle in one reply: for each, 1 and its bytes, or 0 when it can't be had.

use std::collections::HashSet;
use std::sync::Arc;

use axum::body::Bytes;
use axum::extract::{Path, Query, State};
use axum::http::{HeaderMap, StatusCode};
use axum::response::{IntoResponse, Response};
use skywake_core::cache::{BATCH_FILES_MAX, BATCH_MAX, InBundle};
use skywake_core::store::bundles;
use skywake_core::{Bundled, Hash, Objects};
use tracing::warn;

use super::mark_hot;
use super::source::{At, Kind};
use crate::Node;

pub(crate) async fn bundled(
    State(node): State<Arc<Node>>,
    Path(bundle): Path<String>,
    Query(at): Query<At>,
    headers: HeaderMap,
    body: Bytes,
) -> Response {
    if !node.may_read(&headers, &at.folder) {
        return StatusCode::UNAUTHORIZED.into_response();
    }
    let (Ok(bundle), Ok(wanted)) = (
        bundle.parse::<Hash>(),
        postcard::from_bytes::<Vec<Bundled>>(&body),
    ) else {
        return StatusCode::BAD_REQUEST.into_response();
    };
    let size: u64 = wanted.iter().map(|one| u64::from(one.chunk.size)).sum();
    let mut seen = HashSet::new();
    if wanted.len() > BATCH_FILES_MAX
        || size > BATCH_MAX
        || !wanted
            .iter()
            .all(|one| one.bundle == bundle && seen.insert(one.chunk.hash))
    {
        return StatusCode::BAD_REQUEST.into_response();
    }
    let Some(store) = node.store_in(&at.folder) else {
        return StatusCode::BAD_REQUEST.into_response();
    };
    let Ok(_permit) = node.requests.clone().try_acquire_owned() else {
        return StatusCode::SERVICE_UNAVAILABLE.into_response();
    };
    let objects = Objects::new(store);
    // A copy kept here may have come from another folder. Chunks this folder
    // was never served are read from its own bundle first, which proves it holds them.
    let folder = at.folder.as_str();
    let fresh: Vec<Bundled> = wanted
        .iter()
        .filter(|one| !node.vouched.knows(Kind::Chunks, folder, one.chunk.hash))
        .copied()
        .collect();
    if !fresh.is_empty() {
        bundles::get_many(&objects, fresh, |hash, data| {
            if let Err(error) = node.cache.insert(hash, &data) {
                warn!(%hash, %error, "can't write to the chunk cache");
            }
            node.vouched.vouch(Kind::Chunks, folder, hash);
        })
        .await;
    }
    let held = |one: &Bundled| node.vouched.knows(Kind::Chunks, folder, one.chunk.hash);
    node.cache
        .fetch_bundled(
            &objects,
            wanted.iter().filter(|one| held(one)).copied().collect(),
        )
        .await;
    let mut reply = Vec::with_capacity(size as usize + wanted.len());
    for at in wanted {
        if !held(&at) {
            reply.push(0);
            continue;
        }
        let source = InBundle {
            objects: objects.clone(),
            at,
        };
        match node.cache.get(&source, at.chunk.hash).await {
            Ok(data) if reply.len() + data.len() <= BATCH_MAX as usize + BATCH_FILES_MAX => {
                reply.push(1);
                reply.extend(data);
            }
            _ => reply.push(0),
        }
    }
    mark_hot(&node, &bundle.to_string(), reply.into_response())
}
