use std::fmt;
use std::path::{Path as FsPath, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use async_trait::async_trait;
use futures::stream::BoxStream;
use object_store::path::Path;
use object_store::{
    CopyOptions, GetOptions, GetResult, ListResult, MultipartUpload, ObjectMeta, ObjectStore,
    PutMultipartOptions, PutOptions, PutPayload, PutResult, RenameOptions, Result,
};
use skywake_core::cache::{Memory, Scoped};
use skywake_core::{GrepOptions, Repo, Wanted, open_store};

#[derive(Debug)]
struct Slow {
    inner: Arc<dyn ObjectStore>,
    latency: Duration,
    gets: AtomicU64,
}

impl fmt::Display for Slow {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "slow({})", self.inner)
    }
}

impl Slow {
    async fn wait(&self) {
        tokio::time::sleep(self.latency).await;
    }

    fn take(&self) -> u64 {
        self.gets.swap(0, Ordering::Relaxed)
    }
}

#[async_trait]
impl ObjectStore for Slow {
    async fn put_opts(
        &self,
        at: &Path,
        payload: PutPayload,
        opts: PutOptions,
    ) -> Result<PutResult> {
        self.wait().await;
        self.inner.put_opts(at, payload, opts).await
    }

    async fn put_multipart_opts(
        &self,
        at: &Path,
        opts: PutMultipartOptions,
    ) -> Result<Box<dyn MultipartUpload>> {
        self.inner.put_multipart_opts(at, opts).await
    }

    async fn get_opts(&self, at: &Path, options: GetOptions) -> Result<GetResult> {
        self.gets.fetch_add(1, Ordering::Relaxed);
        self.wait().await;
        self.inner.get_opts(at, options).await
    }

    fn delete_stream(
        &self,
        paths: BoxStream<'static, Result<Path>>,
    ) -> BoxStream<'static, Result<Path>> {
        self.inner.delete_stream(paths)
    }

    fn list(&self, prefix: Option<&Path>) -> BoxStream<'static, Result<ObjectMeta>> {
        self.inner.list(prefix)
    }

    fn list_with_offset(
        &self,
        prefix: Option<&Path>,
        offset: &Path,
    ) -> BoxStream<'static, Result<ObjectMeta>> {
        self.inner.list_with_offset(prefix, offset)
    }

    async fn list_with_delimiter(&self, prefix: Option<&Path>) -> Result<ListResult> {
        self.wait().await;
        self.inner.list_with_delimiter(prefix).await
    }

    async fn copy_opts(&self, from: &Path, to: &Path, options: CopyOptions) -> Result<()> {
        self.inner.copy_opts(from, to, options).await
    }

    async fn rename_opts(&self, from: &Path, to: &Path, options: RenameOptions) -> Result<()> {
        self.inner.rename_opts(from, to, options).await
    }
}

const NEEDLE: &str = "skywake_needle";
const HITS: usize = 20;

fn source_file(i: usize) -> String {
    let mut text = String::new();
    for line in 0..80 {
        text.push_str(&format!(
            "pub fn handler_{i}_{line}(request: &Request) -> Response {{ respond(request, {line}) }}\n"
        ));
    }
    if i < HITS {
        text.push_str(&format!("// {NEEDLE} {i}\n"));
    }
    text
}

fn write_tree(dir: &FsPath, files: usize) -> std::io::Result<Vec<String>> {
    let mut hits = Vec::new();
    for i in 0..files {
        let folder = format!("src/m{}/s{}", i % 50, i % 1000);
        std::fs::create_dir_all(dir.join(&folder))?;
        let path = format!("{folder}/f{i}.rs");
        std::fs::write(dir.join(&path), source_file(i))?;
        if i < HITS {
            hits.push(path);
        }
    }
    Ok(hits)
}

async fn timed<T>(label: &str, slow: &Slow, run: impl Future<Output = T>) -> T {
    let started = Instant::now();
    let out = run.await;
    println!(
        "{label:<34} {:>9.1} ms {:>7} GETs",
        started.elapsed().as_secs_f64() * 1e3,
        slow.take()
    );
    out
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = std::env::args().skip(1);
    let root = PathBuf::from(
        args.next()
            .ok_or("usage: grep_bench <dir> [files] [latency_ms]")?,
    );
    let files: usize = args.next().map_or(Ok(20_000), |n| n.parse())?;
    let latency = Duration::from_millis(args.next().map_or(Ok(20), |n| n.parse())?);
    let tree = root.join("tree");
    let bucket = root.join("bucket");
    let fresh = !bucket.exists();
    std::fs::create_dir_all(&bucket)?;
    let disk = open_store(bucket.to_str().ok_or("bucket path")?)?;
    let hits = if fresh {
        let hits = write_tree(&tree, files)?;
        let repo = Repo::new(disk.clone());
        repo.create_branch("main", None).await?;
        let started = Instant::now();
        repo.commit("main", &tree, "seed").await?;
        println!(
            "seeded {files} files in {:.1}s",
            started.elapsed().as_secs_f64()
        );
        hits
    } else {
        (0..HITS)
            .map(|i| format!("src/m{}/s{}/f{i}.rs", i % 50, i % 1000))
            .collect()
    };

    let started = Instant::now();
    let out = std::process::Command::new("rg")
        .args(["-c", NEEDLE])
        .arg(&tree)
        .output()?;
    let found = String::from_utf8_lossy(&out.stdout).lines().count();
    println!(
        "{:<34} {:>9.1} ms ({found} files)",
        "local rg",
        started.elapsed().as_secs_f64() * 1e3
    );

    let slow = Arc::new(Slow {
        inner: disk,
        latency,
        gets: AtomicU64::new(0),
    });
    let objects = Arc::new(Memory::new(256 << 20));
    let contents = Arc::new(Memory::new(1 << 30));
    for (round, cached) in [
        ("no cache", false),
        ("memory, cold", true),
        ("memory, warm", true),
    ] {
        let mut repo = Repo::new(slow.clone());
        if cached {
            repo = repo.with_memory(
                Scoped::new(objects.clone(), "bench"),
                Scoped::new(contents.clone(), "bench"),
            );
        }
        println!("-- {round}, {} ms per request", latency.as_millis());
        let found = timed(
            "find *.rs",
            &slow,
            repo.find("main", None, "", "*.rs", Wanted::Files, 1_000_000),
        )
        .await?;
        assert_eq!(found.len(), files);
        let only = GrepOptions {
            only: Some(hits.clone()),
            limit: 1000,
            ..GrepOptions::default()
        };
        let matched = timed(
            "grep, 20 candidates (indexed)",
            &slow,
            repo.grep("main", None, NEEDLE, &only),
        )
        .await?;
        assert_eq!(matched.len(), HITS);
        let all = GrepOptions {
            limit: 1000,
            ..GrepOptions::default()
        };
        let matched = timed(
            "grep, every file (scan)",
            &slow,
            repo.grep("main", None, NEEDLE, &all),
        )
        .await?;
        assert_eq!(matched.len(), HITS);
    }
    Ok(())
}
