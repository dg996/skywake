use std::collections::{HashMap, VecDeque};
use std::sync::{Arc, Mutex};

use crate::Hash;
use crate::sync::lock;

type Key = (Hash, Hash);

pub struct Memory {
    max_bytes: u64,
    held: Mutex<Held>,
}

#[derive(Default)]
struct Held {
    bytes: u64,
    data: HashMap<Key, Arc<[u8]>>,
    order: VecDeque<Key>,
}

impl Memory {
    pub fn new(max_bytes: u64) -> Self {
        Self {
            max_bytes,
            held: Mutex::default(),
        }
    }

    fn get(&self, key: Key) -> Option<Arc<[u8]>> {
        lock(&self.held).data.get(&key).cloned()
    }

    fn insert(&self, key: Key, data: Arc<[u8]>) {
        let size = data.len() as u64;
        if size > self.max_bytes / 8 {
            return;
        }
        let mut held = lock(&self.held);
        if held.data.contains_key(&key) {
            return;
        }
        while held.bytes + size > self.max_bytes {
            let Some(oldest) = held.order.pop_front() else {
                break;
            };
            if let Some(gone) = held.data.remove(&oldest) {
                held.bytes -= gone.len() as u64;
            }
        }
        held.bytes += size;
        held.data.insert(key, data);
        held.order.push_back(key);
    }

    pub fn bytes(&self) -> u64 {
        lock(&self.held).bytes
    }
}

#[derive(Clone)]
pub struct Scoped {
    memory: Arc<Memory>,
    scope: Hash,
}

impl Scoped {
    pub fn new(memory: Arc<Memory>, scope: &str) -> Self {
        let scope = Hash::of(scope.as_bytes());
        Self { memory, scope }
    }

    pub fn get(&self, hash: Hash) -> Option<Arc<[u8]>> {
        self.memory.get((self.scope, hash))
    }

    pub fn insert(&self, hash: Hash, data: Arc<[u8]>) {
        self.memory.insert((self.scope, hash), data);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn hash(n: u8) -> Hash {
        Hash::of(&[n])
    }

    fn scoped(max_bytes: u64) -> Scoped {
        Scoped::new(Arc::new(Memory::new(max_bytes)), "ours")
    }

    #[test]
    fn keeps_within_its_budget_dropping_the_oldest() {
        let memory = scoped(64);
        for n in 0..10 {
            memory.insert(hash(n), Arc::from([n; 8]));
        }
        assert_eq!(memory.memory.bytes(), 64);
        assert!(memory.get(hash(0)).is_none());
        assert_eq!(memory.get(hash(9)).as_deref(), Some(&[9; 8][..]));
    }

    #[test]
    fn a_scope_sees_only_what_it_put() {
        let memory = Arc::new(Memory::new(1024));
        let ours = Scoped::new(memory.clone(), "ours");
        let theirs = Scoped::new(memory, "theirs");
        ours.insert(hash(1), Arc::from(&b"secret"[..]));
        assert_eq!(ours.get(hash(1)).as_deref(), Some(&b"secret"[..]));
        assert!(theirs.get(hash(1)).is_none());
    }

    #[test]
    fn skips_what_would_crowd_out_everything_else() {
        let memory = scoped(64);
        memory.insert(hash(1), Arc::from([1; 9]));
        assert!(memory.get(hash(1)).is_none());
    }
}
