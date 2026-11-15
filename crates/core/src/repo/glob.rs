use regex::Regex;

use crate::{Error, Result};

#[derive(Clone, Debug)]
pub struct Glob {
    regex: Regex,
    base: String,
}

impl Glob {
    pub fn new(glob: &str) -> Result<Self> {
        let glob = glob.trim_start_matches("./").trim_start_matches('/');
        let bad = |why: &str| Error::BadPattern(format!("`{glob}`: {why}"));
        if glob.is_empty() {
            return Err(bad("empty"));
        }
        let anchored = glob.contains('/');
        let mut out = String::from(if anchored { "^" } else { "^(?:.*/)?" });
        out.push_str(&translate(glob).ok_or_else(|| bad("a `[` is not closed"))?);
        out.push('$');
        let regex = Regex::new(&out).map_err(|error| bad(&error.to_string()))?;
        let base = if anchored {
            base_of(glob)
        } else {
            String::new()
        };
        Ok(Self { regex, base })
    }

    pub fn matches(&self, path: &str) -> bool {
        self.regex.is_match(path)
    }

    pub fn base(&self) -> &str {
        &self.base
    }
}

fn translate(glob: &str) -> Option<String> {
    let chars: Vec<char> = glob.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    while i < chars.len() {
        match chars[i] {
            '*' if chars.get(i + 1) == Some(&'*') => {
                let slash = chars.get(i + 2) == Some(&'/');
                out.push_str(if slash { "(?:.*/)?" } else { ".*" });
                i += if slash { 3 } else { 2 };
                continue;
            }
            '*' => out.push_str("[^/]*"),
            '?' => out.push_str("[^/]"),
            '[' => {
                let close = (i + 2..chars.len()).find(|&j| chars[j] == ']')?;
                out.push_str(&class(&chars[i + 1..close]));
                i = close;
            }
            c => out.push_str(&regex::escape(&c.to_string())),
        }
        i += 1;
    }
    Some(out)
}

fn class(inner: &[char]) -> String {
    let (negated, inner) = match inner.first() {
        Some('!' | '^') => (true, &inner[1..]),
        _ => (false, inner),
    };
    let mut out = String::from(if negated { "[^" } else { "[" });
    for &c in inner {
        match c {
            '-' => out.push('-'),
            c => out.push_str(&regex::escape(&c.to_string())),
        }
    }
    out.push(']');
    out
}

fn base_of(glob: &str) -> String {
    let parts: Vec<&str> = glob.split('/').collect();
    parts[..parts.len() - 1]
        .iter()
        .take_while(|part| !part.contains(['*', '?', '[']))
        .copied()
        .collect::<Vec<_>>()
        .join("/")
}

#[cfg(test)]
mod tests {
    use super::Glob;

    fn hits(glob: &str, path: &str) -> bool {
        Glob::new(glob).unwrap().matches(path)
    }

    #[test]
    fn a_glob_without_a_slash_matches_a_name_at_any_depth() {
        assert!(hits("*.ts", "a.ts"));
        assert!(hits("*.ts", "src/deep/a.ts"));
        assert!(!hits("*.ts", "src/a.tsx"));
        assert!(hits("README.md", "docs/README.md"));
    }

    #[test]
    fn a_glob_with_a_slash_matches_the_whole_path() {
        assert!(hits("src/*.ts", "src/a.ts"));
        assert!(!hits("src/*.ts", "src/deep/a.ts"));
        assert!(hits("src/**/*.ts", "src/a.ts"));
        assert!(hits("src/**/*.ts", "src/x/y/a.ts"));
        assert!(!hits("src/**/*.ts", "lib/a.ts"));
        assert!(hits("**/test/*", "a/test/b"));
    }

    #[test]
    fn classes_and_single_characters() {
        assert!(hits("file?.[jt]s", "file1.js"));
        assert!(!hits("file?.[!jt]s", "file1.js"));
        assert!(hits("[a-c]*", "beta"));
    }

    #[test]
    fn the_base_is_the_glob_s_leading_plain_folders() {
        assert_eq!(Glob::new("src/lib/**/*.rs").unwrap().base(), "src/lib");
        assert_eq!(Glob::new("*.rs").unwrap().base(), "");
        assert_eq!(Glob::new("s*/x.rs").unwrap().base(), "");
    }

    #[test]
    fn a_bad_glob_is_refused() {
        assert!(Glob::new("[abc").is_err());
        assert!(Glob::new("").is_err());
    }
}
