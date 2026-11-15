use futures::future::try_join_all;
use regex::{Regex, RegexBuilder};

use super::find::join;
use super::glob::Glob;
use crate::ops::files;
use crate::{Data, Entry, Error, Hash, Repo, Result, Trees};

const FILE_MAX: u64 = 1 << 20;
const PARALLELISM: usize = 16;
const BATCH: usize = 2_048;
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
        let texts: Vec<(String, Data)> = candidates
            .into_iter()
            .filter_map(|(path, entry)| match entry {
                Entry::File { size, data, .. } if size <= FILE_MAX => Some((path, data)),
                _ => None,
            })
            .collect();
        let mut found = Vec::new();
        for batch in texts.chunks(BATCH) {
            let loaded = contents.load(batch.to_vec()).await?;
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

fn scan(files: &[(String, Vec<u8>)], pattern: &Regex, limit: usize) -> Vec<Match> {
    let mut found = Vec::new();
    for (path, bytes) in files {
        if bytes.contains(&0) {
            continue;
        }
        let text = String::from_utf8_lossy(bytes);
        if !pattern.is_match(&text) {
            continue;
        }
        for (number, line) in text.lines().enumerate() {
            if !pattern.is_match(line) {
                continue;
            }
            found.push(Match {
                path: path.clone(),
                line: number + 1,
                text: line.chars().take(LINE_MAX).collect(),
            });
            if found.len() == limit {
                return found;
            }
        }
    }
    found
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
