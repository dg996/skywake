use std::collections::VecDeque;
use std::sync::Mutex;

use crate::sync::lock;
use crate::{Hash, Trees};

const KEPT: usize = 4;
const ENTRIES_MAX: usize = 1_000_000;

pub(super) type View = (Hash, Trees);

pub(super) struct Views {
    entries_max: usize,
    held: Mutex<VecDeque<(Hash, View)>>,
}

impl Default for Views {
    fn default() -> Self {
        Self::new(ENTRIES_MAX)
    }
}

impl Views {
    fn new(entries_max: usize) -> Self {
        Self {
            entries_max,
            held: Mutex::default(),
        }
    }

    pub(super) fn get(&self, commit: Hash) -> Option<View> {
        let mut held = lock(&self.held);
        let at = held.iter().position(|(kept, _)| *kept == commit)?;
        let found = held.remove(at)?;
        held.push_back(found.clone());
        self.trim(&mut held);
        Some(found.1)
    }

    pub(super) fn keep(&self, commit: Hash, view: View) {
        let mut held = lock(&self.held);
        if held.iter().any(|(kept, _)| *kept == commit) {
            return;
        }
        held.push_back((commit, view));
        self.trim(&mut held);
    }

    fn trim(&self, held: &mut VecDeque<(Hash, View)>) {
        while held.len() > KEPT {
            held.pop_front();
        }
        let mut entries: usize = held.iter().map(|(_, (_, trees))| trees.entries()).sum();
        while entries > self.entries_max {
            let Some((_, (_, trees))) = held.pop_front() else {
                return;
            };
            entries -= trees.entries();
        }
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use object_store::memory::InMemory;

    use super::*;
    use crate::{Entry, Objects, Tree, model::Packs};

    fn view(n: u8, entries: usize) -> (Hash, View) {
        let trees = Trees::new(Objects::new(Arc::new(InMemory::new())), &Packs::default()).unwrap();
        let tree: Tree = (0..entries)
            .map(|i| {
                (
                    format!("{n}-{i}"),
                    Entry::Symlink {
                        target: String::new(),
                    },
                )
            })
            .collect();
        trees.add(tree).unwrap();
        (Hash::of(&[n]), (Hash::of(&[n]), trees))
    }

    #[test]
    fn keeps_the_most_recently_used_commits() {
        let views = Views::default();
        for n in 0..KEPT as u8 {
            let (commit, view) = view(n, 1);
            views.keep(commit, view);
        }
        assert!(views.get(Hash::of(&[0])).is_some());
        let (commit, newest) = view(99, 1);
        views.keep(commit, newest);
        assert!(views.get(Hash::of(&[0])).is_some());
        assert!(views.get(Hash::of(&[1])).is_none());
        assert!(views.get(commit).is_some());
    }

    #[test]
    fn keeps_within_an_entry_budget() {
        let views = Views::new(100);
        let (first, small) = view(1, 60);
        views.keep(first, small);
        let (second, large) = view(2, 60);
        views.keep(second, large);
        assert!(views.get(first).is_none());
        assert!(views.get(second).is_some());
        let (huge, too_big) = view(3, 101);
        views.keep(huge, too_big);
        assert!(views.get(huge).is_none());
    }

    #[test]
    fn notices_a_view_that_grew_after_it_was_kept() {
        let views = Views::new(100);
        let (first, view_one) = view(1, 10);
        let grows = view_one.1.clone();
        views.keep(first, view_one);
        let (second, view_two) = view(2, 10);
        views.keep(second, view_two);
        let more: Tree = (0..85)
            .map(|i| {
                (
                    format!("more-{i}"),
                    Entry::Symlink {
                        target: String::new(),
                    },
                )
            })
            .collect();
        grows.add(more).unwrap();
        assert!(views.get(second).is_some());
        assert!(views.get(first).is_none());
    }
}
