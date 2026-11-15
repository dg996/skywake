use std::cmp::Ordering;
use std::collections::VecDeque;
use std::sync::Arc;

use futures::{StreamExt, TryStreamExt, stream};

use crate::{Entry, Hash, Result, Tree, Trees};

const AHEAD: usize = 64;
const LOOK: usize = 4096;

enum Item {
    Found(String, Entry),
    Open(String, Hash),
}

pub struct Walk<'a> {
    trees: &'a Trees,
    queue: VecDeque<Item>,
}

impl<'a> Walk<'a> {
    pub fn new(trees: &'a Trees, prefix: &str, tree: Hash) -> Self {
        Self {
            trees,
            queue: VecDeque::from([Item::Open(prefix.to_string(), tree)]),
        }
    }

    pub async fn next(&mut self) -> Result<Option<(String, Entry)>> {
        loop {
            match self.queue.pop_front() {
                None => return Ok(None),
                Some(Item::Found(path, entry)) => return Ok(Some((path, entry))),
                Some(Item::Open(prefix, hash)) => {
                    let tree = match self.trees.cached(hash) {
                        Some(tree) => tree,
                        None => self.ahead(hash).await?,
                    };
                    let mut children: Vec<(&str, bool, Item)> = Vec::with_capacity(tree.len());
                    for (name, entry) in tree.iter() {
                        let path = join(&prefix, name);
                        if let Entry::Dir { tree } = entry {
                            children.push((name, true, Item::Open(path.clone(), *tree)));
                        }
                        children.push((name, false, Item::Found(path, entry.clone())));
                    }
                    if children.len() > tree.len() {
                        children.sort_unstable_by(|a, b| in_path_order((a.0, a.1), (b.0, b.1)));
                    }
                    for (_, _, item) in children.into_iter().rev() {
                        self.queue.push_front(item);
                    }
                }
            }
        }
    }

    async fn ahead(&self, hash: Hash) -> Result<Arc<Tree>> {
        let waiting = self
            .queue
            .iter()
            .take(LOOK)
            .filter_map(|item| match item {
                Item::Open(_, tree) => Some(*tree),
                Item::Found(..) => None,
            })
            .filter(|tree| self.trees.cached(*tree).is_none())
            .take(AHEAD - 1);
        let wanted: Vec<Hash> = std::iter::once(hash).chain(waiting).collect();
        stream::iter(wanted)
            .map(|tree| self.trees.get(tree))
            .buffer_unordered(AHEAD)
            .try_for_each(|_| async { Ok(()) })
            .await?;
        self.trees.get(hash).await
    }
}

fn in_path_order(a: (&str, bool), b: (&str, bool)) -> Ordering {
    key(a).cmp(key(b))
}

fn key((name, inside): (&str, bool)) -> impl Iterator<Item = u8> + '_ {
    name.bytes().chain(inside.then_some(b'/'))
}

fn join(prefix: &str, name: &str) -> String {
    match prefix {
        "" => name.to_string(),
        prefix => format!("{prefix}/{name}"),
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use object_store::memory::InMemory;

    use super::*;
    use crate::model::Packs;
    use crate::{Data, FILE_MODE, Objects};

    fn file() -> Entry {
        Entry::File {
            size: 0,
            modified_ns: 0,
            mode: FILE_MODE,
            data: Data::Inline(Vec::new()),
        }
    }

    #[tokio::test]
    async fn walks_in_the_order_of_sorted_paths() {
        let trees = Trees::new(Objects::new(Arc::new(InMemory::new())), &Packs::default()).unwrap();
        let inner: Tree = [("x".to_string(), file())].into_iter().collect();
        let inner = trees.add(inner).unwrap();
        let root: Tree = [
            ("a".to_string(), Entry::Dir { tree: inner }),
            ("a.txt".to_string(), file()),
            ("a-b".to_string(), file()),
            ("b".to_string(), Entry::Dir { tree: inner }),
            ("B".to_string(), file()),
        ]
        .into_iter()
        .collect();
        let root = trees.add(root).unwrap();
        let mut walk = Walk::new(&trees, "top", root);
        let mut paths = Vec::new();
        while let Some((path, _)) = walk.next().await.unwrap() {
            paths.push(path);
        }
        let mut sorted = paths.clone();
        sorted.sort();
        assert_eq!(paths, sorted);
        assert_eq!(paths.len(), 7);
        assert_eq!(paths[1], "top/a");
        assert_eq!(paths[4], "top/a/x");
        assert_eq!(paths[0], "top/B");
    }
}
