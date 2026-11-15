// Guide: how to run long agent jobs on sandboxes that can die, saving each
// step as it lands and picking the job up on a new machine. Read top to bottom.
import { ArrowRight, GitBranch, X } from "lucide-react";

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

export function SandboxesGuide({
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
        name="Agent storage and sandboxes"
        title={title}
        dek="A step-by-step guide to saving an agent’s work as it goes, so when a sandbox crashes, a new one picks the job up right where it stopped."
        meta={["12 min read", "TypeScript", "Beginner friendly"]}
        cover={<SandboxCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Why sandboxes lose work"],
          ["plan", "What we’re building"],
          ["base", "1. Save the base workspace once"],
          ["fork", "2. Give the sandbox its own branch"],
          ["session", "3. Say who is working there"],
          ["work", "4. Save after every step"],
          ["resume", "5. Pick the job up on a new machine"],
          ["finish", "6. Keep the result, drop the sandbox"],
          ["scale", "Running many sandboxes"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Why sandboxes lose work" />
        <p>
          Sandboxes are cheap, short-lived machines you can throw away. That is great for safety and
          bad for long jobs. Anything an agent writes lives on the sandbox’s own disk, and when the
          machine is taken back, the disk goes with it. The job starts again from the beginning.{" "}
          <b>The work was done. It was just kept on a disk that no longer exists.</b>
        </p>
        <p>
          The usual fixes each leave a gap. Copy the files to a bucket when the job ends, and a
          crash before the end still loses everything. Upload them every few minutes, and you lose
          the last few minutes. Worse, the note that says how far the job got can run ahead of the
          files that were really saved, so the next machine skips work or does it twice.
        </p>
        <TwoSetups />
        <p>
          In this guide we’ll give the sandbox a working folder that is saved in your own bucket,
          one small save after every step. Each save holds the changed file <b>and</b> a note of how
          far the job got, together. When a machine dies, a new one opens the same folder and goes
          on from the last save.
        </p>

        <Chapter id="plan" title="What we’re building" />
        <p>By the end, you’ll have:</p>
        <div>
          <Checklist
            items={[
              "A base workspace, saved once, that every sandbox starts from.",
              "A branch per sandbox, so each job works on its own copy.",
              "A save after every step, with the file and the progress note together.",
              "A way to see which sandbox is alive, and which one has stopped.",
              "A crashed job that carries on from its last save on a new machine.",
            ]}
          />
        </div>
        <p>
          You’ll need a Skywake API key and Node. Set <code>SKYWAKE_URL</code> and{" "}
          <code>SKYWAKE_KEY</code>, then install the SDK with <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="base" step={1} title="Save the base workspace once" />
        <p>
          Every sandbox in our story starts from the same project: the shop app, with its 40 test
          files still written for the old runner.
        </p>
        <Tree
          root="workspace"
          items={[
            ["package.json"],
            ["src/cart.js"],
            ["tests/t01.test.js", "the first of 40"],
            ["tests/…"],
            ["tests/t40.test.js"],
          ]}
        />
        <p>
          We’ll save it once, as a branch called <code>base</code>. A branch is a line of saved
          versions of a folder, like a Git branch for files. Each save is a commit.
        </p>
        <Code
          file="save-base.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const app = await sky.createNamespace("sandboxes/shop-app");
const base = await app.createBranch("base");
await base.commitFolder("./workspace", { message: "Base workspace" });
`}
        />
        <p>
          The namespace <code>sandboxes/shop-app</code> holds this project’s branches. You do this
          step once, not once per sandbox.
        </p>

        <Chapter id="fork" step={2} title="Give the sandbox its own branch" />
        <p>
          When a sandbox starts, it gets its own branch, named after it. We make it with a{" "}
          <b>fork</b>: a new branch that starts exactly where <code>base</code> is. A fork copies
          nothing, so it is ready at once, however big the workspace.
        </p>
        <Code
          file="new-sandbox.ts"
          code={`
const sandbox = await base.fork("sb-1842");
await sandbox.checkout("./sandbox");
`}
        />
        <p>
          <code>checkout</code> writes the branch’s files into a normal folder on the sandbox’s
          disk. The agent works there with its usual tools. Other sandboxes get their own forks, so
          they never touch each other’s files.
        </p>

        <Chapter id="session" step={3} title="Say who is working there" />
        <p>
          Later, a new machine will need to know one thing: is the old sandbox really gone, or just
          slow? Two small ideas answer that.
        </p>
        <p>
          A <b>session</b> is a heartbeat. While the sandbox is alive, it tells Skywake “still here”
          every 20 seconds. If a minute passes without one, the session ends. A <b>claim</b> is a
          note on the branch that says which session is working on it. It ends with the session.
        </p>
        <Code
          file="session.ts"
          code={`
import { hostname } from "node:os";

const session = await app.startSession(\`sb-1842 on \${hostname()}\`);
session.keepAlive();
await sandbox.claim("", session.id);
`}
        />
        <p>
          The empty path claims the whole branch. Every save we make next also carries the session’s
          id, so the history shows which machine did what.
        </p>

        <Chapter id="work" step={4} title="Save after every step" />
        <p>
          Now the job itself. The agent goes through the test files in order. After each one, we
          save two files in one commit: the test it just changed, and <code>progress.json</code>, a
          tiny note that says how many files are done.
        </p>
        <Code
          file="work.ts"
          code={`
import { readFile, readdir } from "node:fs/promises";

const saved = await readFile("./sandbox/progress.json", "utf8")
  .catch(() => \`{ "done": 0 }\`);
const progress = JSON.parse(saved);
const tests = (await readdir("./sandbox/tests")).sort();

for (const name of tests.slice(progress.done)) {
  const path = \`tests/\${name}\`;
  await migrate(\`./sandbox/\${path}\`);
  progress.done += 1;
  await sandbox.write(
    {
      [path]: await readFile(\`./sandbox/\${path}\`, "utf8"),
      "progress.json": JSON.stringify(progress),
    },
    \`Migrated \${path}\`,
    session.id,
  );
}
`}
        />
        <p>
          Here <code>migrate</code> stands for your agent: it rewrites one file in place. The loop
          starts from <code>progress.done</code>, so on a fresh sandbox it starts at the first file,
          and after a crash it starts after the last saved one.
        </p>
        <p>
          The important part is that the test and the note go in the <b>same commit</b>. A commit is
          saved whole or not at all. So the note can never say 31 while only 29 files are saved.
        </p>
        <Note title="Tip: make each step safe to run twice">
          <p>
            If the machine dies while the agent is halfway through a file, that file was not saved
            yet. The new machine will do it again. Write steps that give the same result when they
            run twice, and this costs you one step, not a broken file.
          </p>
        </Note>

        <Chapter id="resume" step={5} title="Pick the job up on a new machine" />
        <p>
          Now say the machine is taken away after file 31. Its heartbeats stop, and about a minute
          later its session ends and the claim goes with it.
        </p>
        <p>
          A new sandbox starts on another machine. Make the client as in step 1, then open the same
          branch:
        </p>
        <Code
          file="resume.ts"
          code={`
const app = sky.namespace("sandboxes/shop-app");
const sandbox = app.branch("sb-1842");

// The old machine's session ends a minute after its last heartbeat.
while ((await sandbox.claims()).length > 0) {
  await new Promise((wait) => setTimeout(wait, 5_000));
}
await sandbox.checkout("./sandbox");
`}
        />
        <p>
          We wait until no one claims the branch, so two machines never work on it at once. Then
          checkout brings back every saved file, and <code>progress.json</code> says 31.
        </p>
        <p>
          Now run the code from steps 3 and 4 again, unchanged. The new machine starts its own
          session, claims the branch, and the loop goes on at file 32.
        </p>
        <Timeline />

        <Chapter id="finish" step={6} title="Keep the result, drop the sandbox" />
        <p>
          When the last file is done, the job is finished. The progress note has done its work, so
          we delete it. Then we look at what changed, and <b>merge</b> the sandbox into{" "}
          <code>base</code>, which brings its changes into that branch.
        </p>
        <Code
          file="finish.ts"
          code={`
await sandbox.commit(
  "Job done",
  [{ path: "progress.json", delete: true }],
  session.id,
);
const changed = await sandbox.diff("base");
console.log(\`\${changed.length} files changed\`);

const merged = await sandbox.mergeInto("base");
if (merged.conflicts.length === 0) {
  await session.end();
  await sandbox.delete();
}
`}
        />
        <p>
          The diff lists the 40 tests and nothing else. After the merge, the next sandbox that forks{" "}
          <code>base</code> starts with the new tests. The sandbox’s branch is deleted, and the
          machine can be thrown away with nothing left on it to lose.
        </p>
        <p>
          If the job’s output is not meant for <code>base</code>, skip the merge. Read what you need
          from the branch, then delete it.
        </p>

        <Chapter id="scale" title="Running many sandboxes" />
        <p>The same steps work for one sandbox or a thousand. A few things to know as you grow:</p>
        <ul>
          <li>
            <b>One base, many forks.</b> Each sandbox forks the same base. A fork copies nothing:
            about 95 ms for a workspace of any size.
          </li>
          <li>
            <b>Saved means saved.</b> Killing a machine with <code>kill -9</code> loses no saved
            writes. Only the step in progress runs again.
          </li>
          <li>
            <b>See who is alive.</b> <code>app.sessions()</code> lists the sandboxes that still send
            heartbeats. A branch with no claim is free for a new machine to pick up.
          </li>
          <li>
            <b>Clean up as you go.</b> Delete each sandbox’s branch when its job is done. The base
            stays.
          </li>
          <li>
            <b>It all stays yours.</b> Every save lands in your own bucket, not on a machine you
            rent for an hour.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "What if the machine dies in the middle of a save?",
              <p key="a">
                A commit is saved whole or not at all. Because the file and its progress note go in
                the same commit, the new machine always finds them in agreement.
              </p>,
            ],
            [
              "What about work the agent did but had not saved yet?",
              <p key="a">
                That is lost with the machine, and that step runs again. Save after every step that
                took real time, like a model call or a long build.
              </p>,
            ],
            [
              "Can the new machine start sooner than a minute?",
              <p key="a">
                Yes. Pass a shorter time when you start the session, like{" "}
                <code>app.startSession(label, 15)</code>, and send heartbeats more often to match,
                like <code>session.keepAlive(5_000)</code>. The session then ends 15 seconds after
                the last heartbeat.
              </p>,
            ],
            [
              "Can I undo a step that went wrong?",
              <p key="a">
                Yes. Every save is a commit, and <code>sandbox.log()</code> lists them. Call{" "}
                <code>sandbox.reset(commit)</code> to put the files back as they were at that
                commit, as a new commit on top.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the sandbox branch's history, across the crash. */
function SandboxCover() {
  const row = "flex h-9 items-center gap-2.5 border-b border-border px-1 whitespace-nowrap";
  const mono = "font-mono text-[12px]";
  return (
    <div className="grid">
      <div className={row}>
        <GitBranch className="size-3.5 text-muted-foreground" /> sb-1842
        <span className={`ml-auto ${mono} text-muted-foreground`}>sandboxes/shop-app</span>
      </div>
      <div className={`${row} ${mono} text-muted-foreground`}>
        Migrated tests/t30.test.js
        <span className="ml-auto">machine-a</span>
      </div>
      <div className={`${row} ${mono} text-muted-foreground`}>
        Migrated tests/t31.test.js
        <span className="ml-auto">machine-a</span>
      </div>
      <div className={`${row} ${mono} border-dashed text-[color:var(--love)]`}>
        <X className="size-3.5" /> machine-a stopped
      </div>
      <div className={`${row} ${mono} rounded-md border-transparent bg-foreground/[0.06] px-2`}>
        Migrated tests/t32.test.js
        <span className="ml-auto flex items-center gap-1.5 text-signal">
          <span className="size-1.5 rounded-full bg-signal" />
          machine-b
        </span>
      </div>
    </div>
  );
}

/** The usual sandbox next to ours: work stuck on a disk that dies, then work saved as it goes. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">The usual setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Sandbox disk</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Machine dies
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Start again at file 1</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">What we’ll build</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Sandbox branch</span>
            <span className="t-eyebrow px-1 text-signal">Saved every step</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Any machine, from file 32</span>
        </div>
      </div>
    </figure>
  );
}

/** The 40 files of the job: 31 saved by the machine that died, the rest by the next one. */
function Timeline() {
  const files = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <figure className="grid gap-4 rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">One job, two machines</p>
      <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
        {files.map((n) => (
          <span
            key={n}
            className={`h-5 rounded-[3px] ${n <= 31 ? "bg-foreground/25" : "bg-signal"}`}
          />
        ))}
      </div>
      <div className="t-small grid gap-1.5 text-muted-foreground">
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-foreground/25" />
          Files 1 to 31 · saved by machine A before it died
        </p>
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-signal" />
          <span className="text-foreground">Files 32 to 40 · machine B, from the last save</span>
        </p>
      </div>
    </figure>
  );
}
