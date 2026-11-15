//! Moving trees to and from disk, single files, diffs and merges.

pub(crate) mod diff;
pub mod files;
pub(crate) mod ignore;
pub(crate) mod merge;
pub mod walk;
pub(crate) mod worktree;
