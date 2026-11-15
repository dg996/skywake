const CONTROL: Record<string, string> = { n: "\n", t: "\t", r: "\r", f: "\f" };

export function ways(pattern: string): string[] {
  const found: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\") i++;
    else if (c === "[") i = classEnd(pattern, i);
    else if (c === "(") depth++;
    else if (c === ")") depth--;
    else if (c === "|" && depth === 0) {
      found.push(pattern.slice(start, i));
      start = i + 1;
    }
  }
  found.push(pattern.slice(start));
  return found;
}

export function literals(pattern: string): string[] {
  const runs: string[] = [];
  let run = "";
  const close = (inner: string[] = []) => {
    if (run) runs.push(run);
    run = "";
    runs.push(...inner);
  };
  for (let i = 0; i < pattern.length; i++) {
    const atom = atomAt(pattern, i);
    i = atom.end;
    const repeat = quantifierAt(pattern, i + 1);
    if (repeat) i = repeat.end;
    if (repeat?.optional) {
      close();
    } else if (atom.char === null) {
      close(atom.inner);
    } else {
      run += atom.char;
      if (repeat) close();
    }
  }
  close();
  return runs;
}

interface Atom {
  char: string | null;
  inner: string[];
  end: number;
}

function atomAt(pattern: string, i: number): Atom {
  const c = pattern[i]!;
  if (c === "\\") return escapeAt(pattern, i);
  if (c === "[") return { char: null, inner: [], end: classEnd(pattern, i) };
  if (c === "(") return groupAt(pattern, i);
  if (".^$|)".includes(c)) return { char: null, inner: [], end: i };
  return { char: c, inner: [], end: i };
}

function escapeAt(pattern: string, i: number): Atom {
  const next = pattern[i + 1];
  if (next === undefined) return { char: null, inner: [], end: i };
  if (CONTROL[next]) return { char: CONTROL[next], inner: [], end: i + 1 };
  if (!/[A-Za-z0-9]/.test(next)) return { char: next, inner: [], end: i + 1 };
  if ("pPxuU".includes(next) && pattern[i + 2] === "{") {
    const brace = pattern.indexOf("}", i + 2);
    return { char: null, inner: [], end: brace < 0 ? pattern.length : brace };
  }
  return { char: null, inner: [], end: i + 1 };
}

function groupAt(pattern: string, i: number): Atom {
  const end = groupEnd(pattern, i);
  const body = groupBody(pattern.slice(i + 1, end));
  const inner = ways(body).length === 1 ? literals(body) : [];
  return { char: null, inner, end };
}

function groupBody(body: string): string {
  if (!body.startsWith("?")) return body;
  const named = /^\?P?<[^>]*>/.exec(body);
  if (named) return body.slice(named[0].length);
  if (/^\?[a-zA-Z-]*:/.test(body)) return body.slice(body.indexOf(":") + 1);
  return "";
}

function quantifierAt(pattern: string, at: number): { optional: boolean; end: number } | null {
  const c = pattern[at];
  let end = at;
  let optional: boolean;
  if (c === "*" || c === "?") optional = true;
  else if (c === "+") optional = false;
  else if (c === "{") {
    const match = /^\{(\d*)(,\d*)?\}/.exec(pattern.slice(at));
    if (!match) return null;
    optional = !match[1] || Number(match[1]) === 0;
    end = at + match[0].length - 1;
  } else return null;
  if (pattern[end + 1] === "?" || pattern[end + 1] === "+") end++;
  return { optional, end };
}

function classEnd(pattern: string, open: number): number {
  let i = open + 1;
  if (pattern[i] === "^") i++;
  if (pattern[i] === "]") i++;
  for (; i < pattern.length; i++) {
    if (pattern[i] === "\\") i++;
    else if (pattern[i] === "[" && pattern[i + 1] === ":") {
      const end = pattern.indexOf(":]", i + 2);
      if (end > 0) i = end + 1;
    } else if (pattern[i] === "]") return i;
  }
  return pattern.length - 1;
}

function groupEnd(pattern: string, open: number): number {
  let depth = 0;
  for (let i = open; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "\\") i++;
    else if (c === "[") i = classEnd(pattern, i);
    else if (c === "(") depth++;
    else if (c === ")" && --depth === 0) return i;
  }
  return pattern.length - 1;
}
