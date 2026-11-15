// Guide: how to give every RL rollout and eval its own clean copy of the
// environment, so a reward only reflects what the policy did.
import { ArrowRight, X } from "lucide-react";

import type { HomeMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { SNIPPETS } from "@/components/art/use-case-snippets";
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

export function RlGuide({ locale, title }: { locale: Locale; t: HomeMessages; title: string }) {
  return (
    <>
      <ArticleHero
        locale={locale}
        name="RL environments and evals"
        title={title}
        dek="A step-by-step guide to giving each rollout and eval its own clean copy of the environment, so a reward means what you think it means."
        meta={["12 min read", "TypeScript", "For RL and eval teams"]}
        cover={<RlCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "When the world gets easier"],
          ["plan", "What we’re building"],
          ["save", "1. Save the world once"],
          ["fork", "2. Give each rollout its own copy"],
          ["tools", "3. Let the policy work on its copy"],
          ["score", "4. Score the rollout"],
          ["finish", "5. Reset with one delete"],
          ["many", "6. Run them side by side"],
          ["real", "Running it for real"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="When the world gets easier" />
        <p>
          An environment is mostly files: a repository, some data, a config. Rollouts read them and
          write them. When rollouts share one copy, or reuse a container between tasks, whatever one
          run leaves behind becomes the starting point for the next. A bug fixed by an early rollout
          is already fixed for every rollout after it, and the scores go up for free.{" "}
          <b>The policy has not got better. The world has got easier.</b>
        </p>
        <p>
          The obvious fixes cost a lot. You can copy the whole environment for every rollout, but
          that is slow, and the copies pile up when you run hundreds at once. You can rebuild a
          clean container each time, but then every reset waits on a rebuild. And neither one tells
          you, afterwards, what a strange rollout actually changed.
        </p>
        <TwoWorlds />
        <p>
          In this guide we’ll do it the other way. We save the environment <b>once</b>, as a fixed
          version that nothing can change by accident. Each rollout gets its own copy of that
          version, which takes no time and copies no data. When the rollout ends, you look at
          exactly what it changed, and then delete it.
        </p>

        <Chapter id="plan" title="What we’re building" />
        <p>By the end, you’ll have:</p>
        <div>
          <Checklist
            items={[
              "Your task suite saved once, as a locked starting point.",
              "A fresh, private copy of it for every rollout, made in milliseconds.",
              "Tools your policy calls to read and write files on its own copy.",
              "A score for each rollout, and a list of exactly what it changed.",
              "Resets that are one delete, with odd rollouts kept for a closer look.",
            ]}
          />
        </div>
        <p>
          You’ll need a Skywake API key and Node. Set <code>SKYWAKE_URL</code> and{" "}
          <code>SKYWAKE_KEY</code>, then install the SDK with <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Save the world once" />
        <p>
          Our environment is a small suite of coding tasks. Each task has a short brief, some broken
          code, and a test the policy has to make pass:
        </p>
        <Tree
          root="task-suite"
          items={[
            ["package.json"],
            ["tasks/date-parser/README.md", "the brief"],
            ["tasks/date-parser/parse.js", "the bug lives here"],
            ["tasks/date-parser/test.js", "passes once it is fixed"],
            ["tasks/slugify/README.md"],
            ["tasks/slugify/slug.js"],
            ["tasks/slugify/test.js"],
          ]}
        />
        <p>
          We’ll save it as a branch called <code>main</code>. A branch is a line of saved versions
          of a folder, and each saved version is a <b>commit</b>, with its own id.
        </p>
        <Code
          file="save-world.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const suite = await sky.createNamespace("rl/task-suite");
const main = await suite.createBranch("main");
const start = await main.commitFolder("./task-suite", {
  message: "Task suite v3",
});
await main.protect();
`}
        />
        <p>
          Two things just happened. <code>start</code> is the id of the commit we saved: this is the
          world every rollout will begin in. And <code>main</code> is now <b>protected</b>, so it
          only changes by a merge. If a rollout tries to write to it directly, the write is refused.
        </p>

        <Chapter id="fork" step={2} title="Give each rollout its own copy" />
        <p>
          Now the key idea. A <b>fork</b> is a new branch that starts from an existing commit. It
          copies nothing. It points at the same files until someone changes one, and only that
          change is saved, on the fork alone.
        </p>
        <Code
          file="rollout.ts"
          code={`
import type { Branch } from "@skywake/sdk";

async function newRollout(id: string): Promise<Branch> {
  return main.fork(\`rollouts/\${id}\`, start);
}

const run = await newRollout("0001");
`}
        />
        <p>
          <code>run</code> holds every file of the suite, exactly as it was at <code>start</code>.
          Whatever the policy does from here stays on <code>rollouts/0001</code>.
        </p>
        <Note title="Tip: fork from the commit, not the branch">
          <p>
            We pass <code>start</code> on purpose. If the suite changes next week, a fork from{" "}
            <code>start</code> still gets this week’s files. Store the commit id next to each result
            and you can always rebuild the exact world a score came from.
          </p>
        </Note>

        <Chapter id="tools" step={3} title="Let the policy work on its copy" />
        <p>
          Your policy acts on the world through tools. We’ll give it two: read a file and write a
          file. Both are bound to one rollout, so the policy cannot reach any other copy, or{" "}
          <code>main</code>.
        </p>
        <Code
          file="tools.ts"
          code={`
function toolsFor(run: Branch) {
  return {
    readFile: (path: string) => run.readText(path),
    writeFile: (path: string, text: string) =>
      run.write({ [path]: text }, \`policy: write \${path}\`),
  };
}

const tools = toolsFor(run);
`}
        />
        <p>
          Hand <code>tools</code> to your agent loop. Each write becomes its own commit on the
          rollout, so you get a step-by-step record of what the policy did, for free.
        </p>

        <Chapter id="score" step={4} title="Score the rollout" />
        <p>
          Some rewards need a real folder on disk, like running a test. <code>checkout</code> writes
          the rollout’s files into a local folder. We run the task’s test there: it passes, reward
          1; it fails, reward 0.
        </p>
        <Code
          file="score.ts"
          code={`
import { execFileSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function score(run: Branch, task: string) {
  const dir = await mkdtemp(join(tmpdir(), "rollout-"));
  await run.checkout(dir);
  try {
    execFileSync("node", [\`tasks/\${task}/test.js\`], {
      cwd: dir,
      stdio: "ignore",
    });
    return 1;
  } catch {
    return 0;
  } finally {
    await rm(dir, { recursive: true });
  }
}

const reward = await score(run, "date-parser");
`}
        />
        <p>
          The local folder is only a scratch copy for the test, and we remove it right after. The
          rollout itself still lives on its branch.
        </p>

        <Chapter id="finish" step={5} title="Reset with one delete" />
        <p>
          Before you throw a rollout away, look at what it changed. <code>diff</code> lists every
          file the rollout added, removed or edited since it forked. That makes one kind of cheating
          easy to catch: a policy that “passes” by rewriting the test.
        </p>
        <Code
          file="finish.ts"
          code={`
async function finish(id: string, run: Branch) {
  const changed = await run.diff("main", { against: "base" });
  const touchedTests = changed.some((c) => c.path.endsWith("test.js"));
  if (touchedTests) {
    console.log(\`Look at rollouts/\${id}:\`, changed);
  } else {
    await run.delete();
  }
}

await finish("0001", run);
`}
        />
        <p>
          <code>{'against: "base"'}</code> compares the rollout with the commit it forked from, so
          only the policy’s own changes show. An honest rollout is deleted, and that is the whole
          reset. A rollout that edited a test stays on its branch, ready for you to open:
        </p>
        <Rollouts />
        <p>
          Both rollouts scored 1. Only the list of changed files tells them apart. The next rollout
          you start forks from <code>start</code> again, with the bug back in place.
        </p>

        <Chapter id="many" step={6} title="Run them side by side" />
        <p>
          Because each rollout is its own branch, you can run as many at once as your policy can
          serve. Here are eight, in parallel. <code>policy</code> is your own agent loop, called
          with the rollout’s tools.
        </p>
        <Code
          file="many.ts"
          code={`
const ids = Array.from({ length: 8 }, (_, i) => \`run-\${i}\`);

const rewards = await Promise.all(
  ids.map(async (id) => {
    const run = await newRollout(id);
    await policy(toolsFor(run));
    const reward = await score(run, "date-parser");
    await finish(id, run);
    return reward;
  }),
);
`}
        />
        <p>
          This is where a shared environment goes wrong, now fixed. We tested it with a policy that
          fixes the bug in only the first four rollouts it is given. Exactly four rewards came back
          as 1. No fix leaked from one rollout into another, and every honest rollout was gone when
          the batch finished.
        </p>

        <Chapter id="real" title="Running it for real" />
        <p>
          Nothing in the code above changes as your suite and your runs grow. A few things to know
          along the way:
        </p>
        <ul>
          <li>
            <b>Copies stay fast at any size.</b> Copying an environment takes about 95 ms, however
            big it is. Copying 20,000 files takes about 10 ms.
          </li>
          <li>
            <b>Copies stay small.</b> A fork copies no data. Each rollout only adds the files it
            writes.
          </li>
          <li>
            <b>Old results stay reproducible.</b> Keep the <code>start</code> commit next to every
            score. Any rollout can be replayed from the same world, months later.
          </li>
          <li>
            <b>It all stays yours.</b> Environments and rollouts live in your own bucket.
          </li>
        </ul>
        <h3>Shipping a new version of the suite</h3>
        <p>
          Since <code>main</code> is protected, you change it the careful way: fork it, edit the
          fork, and merge it back.
        </p>
        <Code
          file="new-version.ts"
          code={`
const v4 = await main.fork("suite-v4");
await v4.write(
  { "tasks/slugify/README.md": "Also handle tabs and many spaces." },
  "Task suite v4",
);
await v4.mergeInto("main");
`}
        />
        <p>
          New runs can fork from the new head of <code>main</code>. Runs that fork from the old{" "}
          <code>start</code> still get v3, file for file. So you can compare a checkpoint on v3 and
          v4 without keeping two copies of anything.
        </p>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Does every rollout copy the whole environment?",
              <p key="a">
                No. A fork copies no data, so a rollout over a large repository starts as fast as
                one over a tiny one. It only adds the files the policy writes.
              </p>,
            ],
            [
              "Can I see the steps a rollout took, not just the end state?",
              <p key="a">
                Yes. Each tool call that writes a file is its own commit on the rollout’s branch.
                Call <code>run.log()</code> to list them, in order, before you delete it.
              </p>,
            ],
            [
              "My environment needs a real folder. Does this still work?",
              <p key="a">
                Yes. <code>checkout</code> writes any rollout, or any older commit, into a local
                folder, as we did for the tests in step 4.
              </p>,
            ],
            [
              "What stops a buggy rollout from changing the starting state?",
              <p key="a">
                <code>main</code> is protected, so it only changes by merge. A direct write to it is
                refused. Protecting a branch needs an admin key.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: many runs from the same start, the best one standing out. */
function RlCover() {
  const Runs = SNIPPETS[4]!;
  return <Runs tone="blue" />;
}

/** One shared folder that each run leaves things in, next to one locked start and a copy per run. */
function TwoWorlds() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  const run = "t-small rounded-lg border border-border bg-card px-3 py-2 font-mono text-[12px]";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">The usual setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={run}>run 1</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Shared environment</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Left over from run 1
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={run}>run 2</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">What we’ll build</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>main</span>
            <span className="t-eyebrow px-1 text-signal">Saved once · locked</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap gap-2">
            {["rollouts/0001", "rollouts/0002", "rollouts/0003"].map((name) => (
              <span key={name} className={run}>
                {name}
              </span>
            ))}
          </span>
        </div>
      </div>
    </figure>
  );
}

/** Two rollouts with the same reward: the changed files tell the honest one from the cheat. */
function Rollouts() {
  const rows = [
    {
      name: "rollouts/0001",
      file: "tasks/date-parser/parse.js",
      outcome: "Deleted",
      flagged: false,
    },
    {
      name: "rollouts/0002",
      file: "tasks/date-parser/test.js",
      outcome: "Kept for review",
      flagged: true,
    },
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="t-eyebrow grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-card px-5 py-3 text-muted-foreground">
        <span>Rollout · what it changed</span>
        <span>Reward</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.name}
          className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"
        >
          <div className="grid gap-1">
            <span className="font-mono text-[13px] text-foreground">{row.name}</span>
            <span className="t-small font-mono text-muted-foreground">modified {row.file}</span>
            <span
              className={`t-eyebrow ${row.flagged ? "text-[color:var(--love)]" : "text-signal"}`}
            >
              {row.outcome}
            </span>
          </div>
          <span className="font-mono text-[13px] text-foreground tabular-nums">1</span>
        </div>
      ))}
    </figure>
  );
}
