use std::collections::VecDeque;
use std::sync::Mutex;

use crate::sync::lock;
use crate::{Hash, Trees};

const KEPT: usize = 4;

pub(super) type View = (Hash, Trees);

#[derive(Default)]
pub(super) struct Views {
    held: Mutex<VecDeque<(Hash, View)>>,
}

impl Views {
    pub(super) fn get(&self, commit: Hash) -> Option<View> {
        let mut held = lock(&self.held);
        let at = held.iter().position(|(kept, _)| *kept == commit)?;
        let found = held.remove(at)?;
        held.push_back(found.clone());
        Some(found.1)
    }

    pub(super) fn keep(&self, commit: Hash, view: View) {
        let mut held = lock(&self.held);
        if held.iter().any(|(kept, _)| *kept == commit) {
            return;
        }
        if held.len() == KEPT {
            held.pop_front();
        }
        held.push_back((commit, view));
    }
}

#[cfg(test)]
mod tests {
    use std::sync::Arc;

    use object_store::memory::InMemory;

    use super::*;
    use crate::{Objects, model::Packs};

    fn view(n: u8) -> (Hash, View) {
        let trees = Trees::new(Objects::new(Arc::new(InMemory::new())), &Packs::default()).unwrap();
        (Hash::of(&[n]), (Hash::of(&[n]), trees))
    }

    #[test]
    fn keeps_the_most_recently_used_commits() {
        let views = Views::default();
        for n in 0..KEPT as u8 {
            let (commit, view) = view(n);
            views.keep(commit, view);
        }
        assert!(views.get(Hash::of(&[0])).is_some());
        let (commit, newest) = view(99);
        views.keep(commit, newest);
        assert!(views.get(Hash::of(&[0])).is_some());
        assert!(views.get(Hash::of(&[1])).is_none());
        assert!(views.get(commit).is_some());
    }
}
