use super::glob::Glob;
use crate::ops::files;
use crate::{Entry, Error, Hash, Repo, Result};

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Wanted {
    #[default]
    Any,
    Files,
    Folders,
}

impl Wanted {
    fn keeps(self, kind: &str) -> bool {
        match self {
            Wanted::Any => true,
            Wanted::Files => kind != "folder",
            Wanted::Folders => kind == "folder",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Found {
    pub path: String,
    pub kind: &'static str,
    pub size: u64,
}

impl Repo {
    pub async fn find(
        &self,
        branch: &str,
        at: Option<Hash>,
        folder: &str,
        glob: &str,
        wanted: Wanted,
        limit: usize,
    ) -> Result<Vec<Found>> {
        let glob = Glob::new(glob)?;
        let Some(start) = deepest(folder.trim_matches('/'), glob.base()) else {
            return Ok(Vec::new());
        };
        let (root, trees) = self.tree_at(branch, at).await?;
        let tree = match files::find(&trees, root, &start).await? {
            Some(Entry::Dir { tree }) => tree,
            Some(_) => return Err(Error::NotAFolder(start)),
            None if start.is_empty() => return Err(Error::NotFound(start)),
            None => return Ok(Vec::new()),
        };
        let mut found = Vec::new();
        let mut todo = vec![(start, tree)];
        while let Some((prefix, tree)) = todo.pop() {
            for (name, entry) in trees.get(tree).await?.iter() {
                let path = join(&prefix, name);
                let (kind, size) = describe(entry);
                if let Entry::Dir { tree } = entry {
                    todo.push((path.clone(), *tree));
                }
                if wanted.keeps(kind) && glob.matches(&path) {
                    found.push(Found { path, kind, size });
                }
            }
            todo.sort_by(|a, b| b.0.cmp(&a.0));
            if found.len() > limit {
                break;
            }
        }
        found.sort_by(|a, b| a.path.cmp(&b.path));
        found.truncate(limit);
        Ok(found)
    }
}

fn deepest(folder: &str, base: &str) -> Option<String> {
    let under =
        |inner: &str, outer: &str| inner == outer || inner.starts_with(&format!("{outer}/"));
    match (folder, base) {
        ("", base) => Some(base.to_string()),
        (folder, "") => Some(folder.to_string()),
        (folder, base) if under(base, folder) => Some(base.to_string()),
        (folder, base) if under(folder, base) => Some(folder.to_string()),
        _ => None,
    }
}

pub(super) fn join(prefix: &str, name: &str) -> String {
    match prefix {
        "" => name.to_string(),
        prefix => format!("{prefix}/{name}"),
    }
}

fn describe(entry: &Entry) -> (&'static str, u64) {
    match entry {
        Entry::Dir { .. } => ("folder", 0),
        Entry::File { size, .. } => ("file", *size),
        Entry::Symlink { .. } => ("symlink", 0),
    }
}
