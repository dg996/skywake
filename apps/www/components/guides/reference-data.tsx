// Guide: how to save a big set of reference files once, keep it safe from
// changes, and give every agent on a machine the same copy with one download.
import { ArrowRight, File, Lock, X } from "lucide-react";

import type { HomeMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import {
  Article,
  ArticleHero,
  Chapter,
  Checklist,
  Code,
  Note,
  Questions,
  Tree,
} from "@/components/guides/guide";

export function ReferenceDataGuide({
  locale,
  title,
}: {
  locale: Locale;
  t: HomeMessages;
  title: string;
}) {
  return (
    <>
      <ArticleHero
        locale={locale}
        name="Shared reference data"
        title={title}
        dek="A step-by-step guide to saving a large reference set one time, keeping it safe from changes, and giving every agent on a machine the same copy."
        meta={["12 min read", "TypeScript", "Beginner friendly"]}
        cover={<ReferenceCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Twenty agents, twenty downloads"],
          ["plan", "What we’re building"],
          ["save", "1. Save the reference set once"],
          ["lock", "2. Make it read-only for agents"],
          ["read", "3. Read only the part you need"],
          ["machine", "4. One copy per machine"],
          ["release", "5. Ship a new release"],
          ["real", "Running it for real"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Twenty agents, twenty downloads" />
        <p>
          Agents that work from the same big files, like a reference genome and its gene list, each
          download their own copy. Every agent is its own process, with no idea that another agent
          on the same machine already fetched the file. And a bucket is not a folder: to read a
          file, an agent has to download it first. When a new release lands mid-run, early agents
          keep the old files and later ones get the new ones, and their answers stop agreeing.{" "}
          <b>Twenty agents ask for the same files, and the bucket sends them twenty times.</b>
        </p>
        <p>
          The usual fixes each bring a new problem. Bake the files into the machine image, and you
          rebuild the image for every new release. Put them on a shared network drive, and you run
          one more system, where any job can change a file by mistake. Write a small cache script,
          and you have to decide who updates it, when, and to which version.
        </p>
        <TwoSetups />
        <p>
          In this guide we’ll save the reference set once, as a version that cannot change under
          anyone. Each machine downloads it <b>one time</b> into a local folder, and every agent on
          that machine reads from there. When a new release comes out, machines download only the
          files that changed.
        </p>

        <Chapter id="plan" title="What we’re building" />
        <p>By the end, you’ll have:</p>
        <div>
          <Checklist
            items={[
              "The reference set saved once in your own bucket, with every release kept.",
              "A protected branch and a read-only key, so no agent can change the files.",
              "Reads of just a slice of a big file, for agents that need only a little.",
              "One local copy per machine, shared by every agent on it.",
              "A way to ship a new release that sends machines only what changed.",
            ]}
          />
        </div>
        <p>
          You’ll need a Skywake API key and Node. Set <code>SKYWAKE_URL</code> and{" "}
          <code>SKYWAKE_KEY</code>, then install the SDK with <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Save the reference set once" />
        <p>
          Start with the folder you already download today. Ours holds a few chromosomes and a list
          of genes:
        </p>
        <Tree
          root="grch38"
          items={[
            ["chr1.fa", "large, read by every agent"],
            ["chr2.fa", "the one a patch will change"],
            ["genes.gtf", "where each gene sits"],
          ]}
        />
        <p>
          We’ll save it in a <b>namespace</b>, which is a repository of files, on a branch called{" "}
          <code>main</code>. A branch works like a Git branch for files: each save is a{" "}
          <b>commit</b>, a fixed version you can always come back to.
        </p>
        <Code
          file="save-refs.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const genome = await sky.createNamespace("refs/genome");
const main = await genome.createBranch("main");
const release = await main.commitFolder("./grch38", {
  message: "GRCh38, first release",
});
`}
        />
        <p>
          <code>commitFolder</code> uploads every file and returns the new commit. Big files go up
          in parts on their own, so you don’t need to split them. Keep <code>release</code>: it
          names this exact version of the set, and we’ll use it again.
        </p>

        <Chapter id="lock" step={2} title="Make it read-only for agents" />
        <p>
          Reference data should never change by accident. We’ll lock it in two ways. First, we{" "}
          <b>protect</b> <code>main</code>. A protected branch only changes through a merge, so not
          even an admin can commit to it directly.
        </p>
        <p>
          Second, we give the agents their own key. It has the <code>read</code> role, and it only
          reaches this one namespace.
        </p>
        <Code
          file="lock.ts"
          code={`
await main.protect();

const agents = await sky.keys.create("agents", "read", {
  namespaces: "refs/genome",
});
`}
        />
        <p>
          <code>agents.key</code> is shown only this once, so store it as a secret right away. From
          now on, a write with this key fails with “this needs the <code>write</code> role”. A
          direct commit to <code>main</code> fails too, even with an admin key.
        </p>
        <Note title="Tip: one key per use">
          <p>
            Give agents the read key and nothing else. Keep the key that ships releases in your
            release script. If an agent’s key ever leaks, the worst it can do is read.
          </p>
        </Note>

        <Chapter id="read" step={3} title="Read only the part you need" />
        <p>
          Every agent connects with the read key. We’ll put that in one small file, so the agent
          code stays short:
        </p>
        <Code
          file="refs.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.AGENT_KEY!,
});

export const refs = sky.namespace("refs/genome").branch("main");
`}
        />
        <p>
          Some agents need only a small piece of a big file: one gene, one region. They don’t need
          the whole chromosome. A <b>range read</b> asks for just those bytes, so the agent can
          start work at once.
        </p>
        <Code
          file="read.ts"
          code={`
import { refs } from "./refs.ts";

const release = process.env.REFS_RELEASE!;

// Only the bytes this agent needs, at the agreed release.
const piece = await refs.read("chr1.fa", {
  offset: 120_000,
  length: 600,
  at: release,
});
`}
        />
        <p>
          The <code>at</code> line pins the read to the first release. Even if a new release lands
          while the agent runs, it keeps reading the same version. Every agent you start with the
          same <code>REFS_RELEASE</code> sees the very same bytes.
        </p>

        <Chapter id="machine" step={4} title="One copy per machine" />
        <p>
          Most agents read a lot of the set, again and again. For them, the best place for the files
          is the machine’s own disk. We’ll download the set once per machine, into one folder, and
          point every agent at that folder.
        </p>
        <p>
          <code>syncRefs</code> does the work. On a new machine it checks out the whole set. It
          writes the commit it got into a small <code>.release</code> file. Next time, if that
          commit is still the newest, it does nothing.
        </p>
        <Code
          file="sync-refs.ts"
          code={`
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { refs } from "./refs.ts";

export const REFS = process.env.REFS_DIR ?? "/srv/refs";

export async function syncRefs(dir = REFS) {
  const mark = join(dir, ".release");
  const have = await readFile(mark, "utf8").catch(() => "");
  const { head } = await refs.info();
  if (have === head) return;

  if (!have) {
    await refs.checkout(dir, { at: head });
  } else {
    // Only the files that changed since this machine's release.
    const changed = new Map<string, string>();
    for (const commit of await refs.changes(have)) {
      for (const change of commit.changes) {
        changed.set(change.path, change.kind);
      }
    }
    for (const [path, kind] of changed) {
      const file = join(dir, path);
      await rm(file, { force: true });
      if (kind === "removed") continue;
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, await refs.readStream(path, { at: head }));
    }
  }
  await writeFile(mark, head);
}
`}
        />
        <p>
          Run it once when the machine starts, before any agent. Then each agent reads plain files
          from the folder, with no network at all:
        </p>
        <Code
          file="start.ts"
          code={`
import { syncRefs } from "./sync-refs.ts";

// Once when the machine starts, before any agent runs.
await syncRefs();
`}
        />
        <Code
          file="agent.ts"
          code={`
import { readFile } from "node:fs/promises";
import { REFS } from "./sync-refs.ts";

const genes = await readFile(\`\${REFS}/genes.gtf\`, "utf8");
`}
        />
        <p>
          That’s the twenty downloads gone. Twenty agents start, and the machine has already
          downloaded the set once. Start the machine again tomorrow and <code>syncRefs</code> sees
          the same release and downloads nothing.
        </p>

        <Chapter id="release" step={5} title="Ship a new release" />
        <p>
          A patch for chromosome 2 comes out, with a new file for chromosome Y. Remember,{" "}
          <code>main</code> only changes through a merge. So we <b>fork</b> it first: a fork is a
          new branch that starts as an exact copy, and it copies no data.
        </p>
        <p>
          We save the new folder on the fork, then <b>merge</b> it into <code>main</code>. A merge
          brings the fork’s changes into <code>main</code> as one new commit.
        </p>
        <Code
          file="release.ts"
          code={`
const next = await main.fork("next");
await next.commitFolder("./grch38-p2", { message: "GRCh38 patch 2" });

const merged = await next.mergeInto("main");
if (merged.conflicts.length === 0) await next.delete();
`}
        />
        <p>
          We sent the whole new folder, but Skywake records only the files that differ:{" "}
          <code>chr2.fa</code> changed and <code>chrY.fa</code> is new. The next time a machine runs{" "}
          <code>syncRefs</code>, it asks for the changes since its <code>.release</code> and
          downloads just those two files:
        </p>
        <ReleaseUpdate />
        <p>
          Agents pinned to the first release with <code>at</code> still read the old{" "}
          <code>chr2.fa</code>. Every release stays in the history, so nothing they depend on
          disappears.
        </p>

        <Chapter id="real" title="Running it for real" />
        <p>The steps above are all you need. A few things help once many machines use them:</p>
        <ul>
          <li>
            <b>Each machine downloads once.</b> A new machine fetches the full set on its first
            start. After that, it fetches only what a release changed, however many agents it runs.
          </li>
          <li>
            <b>Update between jobs.</b> <code>syncRefs</code> replaces changed files in place. If
            your agents never stop, sync into a new folder named after the release, then move agents
            to it.
          </li>
          <li>
            <b>Agents elsewhere read slices.</b> An agent in a short-lived sandbox has no local copy
            to share. Give it the read key and let it use range reads, as in step 3.
          </li>
          <li>
            <b>Every answer has a version.</b> Log the <code>.release</code> commit next to each
            result. Weeks later, you can read the exact files that answer came from.
          </li>
          <li>
            <b>It all stays yours.</b> The files live in your own bucket. There is no network drive
            or extra server to run.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Can an agent change the reference files by mistake?",
              <p key="a">
                Not through Skywake. Its key has the read role, so every write fails. And{" "}
                <code>main</code> is protected, so even a key that can write must go through a
                merge.
              </p>,
            ],
            [
              "Does a new release upload everything again?",
              <p key="a">
                <code>commitFolder</code> sends the whole folder, but only files that differ count
                as changes. Machines download only those.
              </p>,
            ],
            [
              "How do I go back to an older release?",
              <p key="a">
                Every release is a commit, and commits are kept. Read any file with <code>at</code>{" "}
                set to the release you want, or check out that commit into its own folder.
              </p>,
            ],
            [
              "What if a file is bigger than the machine’s memory?",
              <p key="a">
                Checkout and <code>readStream</code> stream files to disk, so a file never has to
                fit in memory at once.
              </p>,
            ],
            [
              "What if a release adds or removes whole folders?",
              <p key="a">
                <code>syncRefs</code> handles changes to single files, which is how most reference
                releases change. For a bigger reshuffle, check out the new release into a fresh
                folder instead.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

const ROW = "flex h-9 items-center gap-2.5 border-b border-border px-1 whitespace-nowrap";
const MONO = "font-mono text-[12px]";

/** The cover: the shared folder on one machine, read-only, read by every agent. */
function ReferenceCover() {
  const files = ["chr1.fa", "chr2.fa", "chrY.fa", "genes.gtf"];
  return (
    <div className="grid">
      <div className={ROW}>
        <Lock className="size-3.5 text-muted-foreground" />
        <span className={MONO}>/srv/refs</span>
        <span className="ml-auto text-[12px] text-muted-foreground">Read-only</span>
      </div>
      {files.map((name) => (
        <div key={name} className={`${ROW} pl-6`}>
          <File className="size-3.5 text-muted-foreground" />
          <span className={MONO}>{name}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 pt-3 text-[12px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-signal" />
        Downloaded once · read by 20 agents
      </div>
    </div>
  );
}

/** Today's setup next to the one we build: twenty downloads, then one. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">The usual setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> 20 downloads
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agents</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">What we’ll build</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>1 download</span>
            <span className={box}>/srv/refs</span>
            <span className="t-eyebrow px-1 text-signal">One machine</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agents</span>
        </div>
      </div>
    </figure>
  );
}

/** What one machine does when patch 2 lands: two files fetched, the rest kept. */
function ReleaseUpdate() {
  const rows: [name: string, what: string, fetched: boolean][] = [
    ["chr1.fa", "Kept", false],
    ["chr2.fa", "Downloaded · changed", true],
    ["chrY.fa", "Downloaded · new", true],
    ["genes.gtf", "Kept", false],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">syncRefs after patch 2</p>
      <ul className="mt-3 grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {rows.map(([name, what, fetched]) => (
          <li key={name} className="t-small flex items-center gap-3 px-4 py-2.5">
            <span className={`${MONO} text-foreground`}>{name}</span>
            <span className={`ml-auto ${fetched ? "text-signal" : "text-muted-foreground"}`}>
              {what}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
