use futures::future::try_join_all;
use regex::bytes::{Regex, RegexBuilder};

use super::contents::Bytes;
use super::find::join;
use super::glob::Glob;
use crate::ops::files;
use crate::{Data, Entry, Error, Hash, Repo, Result, Trees};

const FILE_MAX: u64 = 1 << 20;
const PARALLELISM: usize = 16;
const BATCH_BYTES: u64 = 256 << 20;
const SPLIT_BYTES: usize = 1 << 20;
const LINE_MAX: usize = 500;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Match {
    pub path: String,
    pub line: usize,
    pub text: String,
}

#[derive(Clone, Debug, Default)]
pub struct GrepOptions {
    pub folder: String,
    pub glob: Option<String>,
    pub ignore_case: bool,
    pub only: Option<Vec<String>>,
    pub limit: usize,
}

struct Scope {
    folder: String,
    glob: Option<Glob>,
}

impl Scope {
    fn new(options: &GrepOptions) -> Result<Self> {
        Ok(Self {
            folder: options.folder.trim_matches('/').to_string(),
            glob: options.glob.as_deref().map(Glob::new).transpose()?,
        })
    }

    fn inside(&self, path: &str) -> bool {
        under(path, &self.folder)
    }

    fn around(&self, path: &str) -> bool {
        self.inside(path) || under(&self.folder, path)
    }

    fn wanted(&self, path: &str) -> bool {
        self.inside(path) && self.glob.as_ref().is_none_or(|glob| glob.matches(path))
    }
}

fn under(path: &str, folder: &str) -> bool {
    folder.is_empty() || path == folder || path.starts_with(&format!("{folder}/"))
}

impl Repo {
    pub async fn grep(
        &self,
        branch: &str,
        at: Option<Hash>,
        pattern: &str,
        options: &GrepOptions,
    ) -> Result<Vec<Match>> {
        let pattern = RegexBuilder::new(pattern)
            .size_limit(1 << 20)
            .case_insensitive(options.ignore_case)
            .multi_line(true)
            .crlf(true)
            .build()
            .map_err(|error| Error::BadPattern(error.to_string()))?;
        let scope = Scope::new(options)?;
        let (root, trees) = self.tree_at(branch, at).await?;
        let candidates = match &options.only {
            Some(paths) => listed(&trees, root, &scope, paths).await?,
            None => everything(&trees, root, &scope).await?,
        };
        self.lines(candidates, &pattern, options.limit).await
    }

    async fn lines(
        &self,
        candidates: Vec<(String, Entry)>,
        pattern: &Regex,
        limit: usize,
    ) -> Result<Vec<Match>> {
        let contents = self.contents();
        let texts: Vec<(String, Data, u64)> = candidates
            .into_iter()
            .filter_map(|(path, entry)| match entry {
                Entry::File { size, data, .. } if size <= FILE_MAX => Some((path, data, size)),
                _ => None,
            })
            .collect();
        let mut found = Vec::new();
        for batch in batches(texts) {
            let loaded = contents.load(batch).await?;
            let pattern = pattern.clone();
            let wanted = limit - found.len();
            let matched = tokio::task::spawn_blocking(move || scan(&loaded, &pattern, wanted))
                .await
                .map_err(|error| Error::Io(std::io::Error::other(error)))?;
            found.extend(matched);
            if found.len() >= limit {
                break;
            }
        }
        Ok(found)
    }
}

fn batches(texts: Vec<(String, Data, u64)>) -> Vec<Vec<(String, Data)>> {
    let mut batches = vec![Vec::new()];
    let mut bytes = 0;
    for (path, data, size) in texts {
        if bytes >= BATCH_BYTES {
            batches.push(Vec::new());
            bytes = 0;
        }
        bytes += size;
        if let Some(batch) = batches.last_mut() {
            batch.push((path, data));
        }
    }
    batches
}

fn scan(files: &[(String, Bytes)], pattern: &Regex, limit: usize) -> Vec<Match> {
    let total: usize = files.iter().map(|(_, bytes)| bytes.len()).sum();
    let threads = std::thread::available_parallelism().map_or(1, |n| n.get());
    let threads = threads.min(total / SPLIT_BYTES + 1).min(files.len().max(1));
    if threads <= 1 {
        return scan_part(files, pattern, limit);
    }
    let size = files.len().div_ceil(threads);
    let mut found: Vec<Match> = std::thread::scope(|scope| {
        let parts: Vec<_> = files
            .chunks(size)
            .map(|part| scope.spawn(move || scan_part(part, pattern, limit)))
            .collect();
        parts
            .into_iter()
            .flat_map(|part| {
                part.join()
                    .unwrap_or_else(|panic| std::panic::resume_unwind(panic))
            })
            .collect()
    });
    found.truncate(limit);
    found
}

fn scan_part(files: &[(String, Bytes)], pattern: &Regex, limit: usize) -> Vec<Match> {
    let mut found = Vec::new();
    for (path, bytes) in files {
        if found.len() == limit {
            break;
        }
        if !pattern.is_match(bytes) || bytes.contains(&0) {
            continue;
        }
        matching_lines(bytes, pattern, |line, text| {
            found.push(Match {
                path: path.clone(),
                line,
                text: String::from_utf8_lossy(text)
                    .chars()
                    .take(LINE_MAX)
                    .collect(),
            });
            found.len() < limit
        });
    }
    found
}

fn matching_lines(text: &[u8], pattern: &Regex, mut each: impl FnMut(usize, &[u8]) -> bool) {
    let mut from = 0;
    let mut counted = 0;
    let mut number = 1;
    while from < text.len() {
        let Some(hit) = pattern.find_at(text, from) else {
            return;
        };
        let start = text[..hit.start()]
            .iter()
            .rposition(|&b| b == b'\n')
            .map_or(0, |at| at + 1)
            .max(from);
        let end = text[hit.start()..]
            .iter()
            .position(|&b| b == b'\n')
            .map_or(text.len(), |at| hit.start() + at);
        number += text[counted..start].iter().filter(|&&b| b == b'\n').count();
        counted = start;
        let line = text[start..end]
            .strip_suffix(b"\r")
            .unwrap_or(&text[start..end]);
        if pattern.is_match(line) && !each(number, line) {
            return;
        }
        from = end + 1;
    }
}

async fn everything(trees: &Trees, root: Hash, scope: &Scope) -> Result<Vec<(String, Entry)>> {
    let tree = match files::find(trees, root, &scope.folder).await? {
        Some(Entry::Dir { tree }) => tree,
        Some(_) => return Err(Error::NotAFolder(scope.folder.clone())),
        None => return Err(Error::NotFound(scope.folder.clone())),
    };
    Ok(files::walk(trees, tree)
        .await?
        .into_iter()
        .map(|(path, entry)| (join(&scope.folder, &path), entry))
        .filter(|(path, _)| scope.wanted(path))
        .collect())
}

async fn listed(
    trees: &Trees,
    root: Hash,
    scope: &Scope,
    paths: &[String],
) -> Result<Vec<(String, Entry)>> {
    let mut paths: Vec<&String> = paths.iter().filter(|path| scope.around(path)).collect();
    paths.sort();
    paths.dedup();
    let mut found = Vec::with_capacity(paths.len());
    for batch in paths.chunks(PARALLELISM) {
        let entries = try_join_all(batch.iter().map(|path| files::find(trees, root, path))).await?;
        for (path, entry) in batch.iter().zip(entries) {
            match entry {
                Some(Entry::Dir { tree }) => {
                    for (inner, entry) in files::walk(trees, tree).await? {
                        let inner = join(path, &inner);
                        if scope.wanted(&inner) {
                            found.push((inner, entry));
                        }
                    }
                }
                Some(entry) if scope.wanted(path) => found.push((path.to_string(), entry)),
                _ => {}
            }
        }
    }
    found.sort_by(|a, b| a.0.cmp(&b.0));
    found.dedup_by(|a, b| a.0 == b.0);
    Ok(found)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn regex(pattern: &str) -> Regex {
        RegexBuilder::new(pattern)
            .multi_line(true)
            .crlf(true)
            .build()
            .unwrap()
    }

    fn lines(text: &str, pattern: &str) -> Vec<(usize, String)> {
        let mut found = Vec::new();
        matching_lines(text.as_bytes(), &regex(pattern), |number, line| {
            found.push((number, String::from_utf8_lossy(line).into_owned()));
            true
        });
        found
    }

    fn file(path: &str, text: &str) -> (String, Bytes) {
        (path.to_string(), Bytes::from(text.as_bytes()))
    }

    #[test]
    fn numbers_each_matching_line_once() {
        let text = "needle needle\nhay\nneedle\n";
        assert_eq!(
            lines(text, "needle"),
            [(1, "needle needle".into()), (3, "needle".into())]
        );
    }

    #[test]
    fn finds_the_last_line_without_a_newline() {
        assert_eq!(lines("a\nb", "$"), [(1, "a".into()), (2, "b".into())]);
        assert_eq!(lines("a\nb", "b"), [(2, "b".into())]);
        assert!(lines("", "").is_empty());
        assert_eq!(lines("a\n", ""), [(1, "a".into())]);
    }

    #[test]
    fn treats_crlf_as_a_line_end() {
        assert_eq!(lines("foo\r\nbar\r\n", "foo$"), [(1, "foo".into())]);
        assert_eq!(lines("foo\r\nbar\r\n", "^bar"), [(2, "bar".into())]);
    }

    #[test]
    fn never_matches_across_lines() {
        assert!(lines("a\nb\n", "a\\nb").is_empty());
        assert_eq!(lines("x\na\nb\nab\n", "a\\n?b"), [(4, "ab".into())]);
    }

    #[test]
    fn skips_binary_files_and_keeps_bad_utf8_lines() {
        let files = [
            ("bin".to_string(), Bytes::from(&b"needle\0"[..])),
            ("bad".to_string(), Bytes::from(&b"\xffneedle\n"[..])),
        ];
        let found = scan(&files, &regex("needle"), 10);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].path, "bad");
        assert_eq!(found[0].text, "\u{fffd}needle");
    }

    #[test]
    fn keeps_file_order_and_the_limit_across_threads() {
        let big = "needle\n".repeat(200_000);
        let files: Vec<_> = (0..64).map(|n| file(&format!("f{n:02}"), &big)).collect();
        let found = scan(&files, &regex("needle"), 300_000);
        assert_eq!(found.len(), 300_000);
        assert!(
            found
                .windows(2)
                .all(|w| (&w[0].path, w[0].line) < (&w[1].path, w[1].line))
        );
        assert_eq!(found[200_000].path, "f01");
        assert_eq!(found[200_000].line, 1);
    }

    #[test]
    fn cuts_long_lines() {
        let long = "x".repeat(2 * LINE_MAX);
        let found = scan(&[file("a", &long)], &regex("x"), 10);
        assert_eq!(found[0].text.chars().count(), LINE_MAX);
    }
}
