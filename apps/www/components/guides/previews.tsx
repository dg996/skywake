// Guide: how to run every pull request's preview on its own full copy of the
// app's data, then ship the change or throw the copy away.
import { ArrowRight, GitBranch, Lock, X } from "lucide-react";

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

export function PreviewsGuide({
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
        name="Preview environments"
        title={title}
        dek="A step-by-step guide to giving each pull request a full copy of your app’s data, so reviewers see the change work before it ships, and nobody shares a staging."
        meta={["12 min read", "TypeScript", "Beginner friendly"]}
        cover={<PreviewsCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Why previews miss real bugs"],
          ["plan", "What we’re building"],
          ["save", "1. Keep your app’s data on main"],
          ["fork", "2. Give the pull request its own copy"],
          ["run", "3. Run the preview on the copy"],
          ["undo", "4. Undo and try again"],
          ["review", "5. Let reviewers look, not touch"],
          ["ship", "6. Ship it, or throw it away"],
          ["every", "Doing it for every pull request"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Why previews miss real bugs" />
        <p>
          Most previews run on seed data: a few made-up products, users and orders. The real data is
          big. Copying it for every pull request takes time and storage, and someone has to clean up
          the copies later. So the code gets reviewed, but the data it will meet in production does
          not. A change that reads every price as “12.00” passes review, then fails on the first
          euro price written “24,00”. <b>The code was reviewed. The data it met was not.</b>
        </p>
        <p>
          The usual fixes both have a cost. You can copy the real data for each pull request, and
          wait, and pay for every copy. Or you can keep one shared staging with real data, and let
          every pull request use it. Then one pull request’s migration rewrites the data that three
          others are testing on, and nobody knows whose change broke what.
        </p>
        <SharedOrOwn />
        <p>
          In this guide we’ll do it another way. Your app’s data lives in one place, on a branch
          called <code>main</code>. Each pull request gets its own copy of that branch, made in
          10 ms, because <b>a copy here shares the files instead of duplicating them</b>. The
          preview can change its copy, even break it, and <code>main</code> never notices. And we’ll
          catch that euro bug on the way.
        </p>

        <Chapter id="plan" title="What we’re building" />
        <p>By the end, you’ll have:</p>
        <div>
          <Checklist
            items={[
              "Your app’s data saved once, on a main branch that nothing can change by accident.",
              "A full copy of that data for each pull request, made in 10 ms.",
              "A preview that runs on its copy, and can break it safely.",
              "A read-only key, so reviewers can look without touching.",
              "One call to ship the change, and one to throw the copy away.",
            ]}
          />
        </div>
        <p>
          You’ll need a Skywake API key and Node. Use an admin key: steps 1 and 5 need one. Set{" "}
          <code>SKYWAKE_URL</code> and <code>SKYWAKE_KEY</code>, then install the SDK with{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Keep your app’s data on main" />
        <p>
          Start with the data your app reads: the catalog, settings, uploaded files. Ours is a small
          shop:
        </p>
        <Tree
          root="shop-data"
          items={[
            ["catalog/products.json", "prices like “12.00” and “24,00”"],
            ["catalog/stock.json"],
            ["config/shipping.json"],
            ["uploads/banner.txt"],
          ]}
        />
        <p>
          We’ll save it in a namespace, a repository of files, as a branch called <code>main</code>.
          A branch is a named version of your files, like a Git branch. Each save is a commit, so
          you can always see what changed and go back.
        </p>
        <Code
          file="save-data.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const shop = await sky.createNamespace("shop/data");
const main = await shop.createBranch("main");
await main.commitFolder("./shop-data", { message: "Shop data today" });
await main.protect();
`}
        />
        <p>
          The last line protects <code>main</code>. A protected branch changes only by merge. If any
          code tries to write to it directly, the write is refused, so no preview can touch the real
          data by mistake.
        </p>

        <Chapter id="fork" step={2} title="Give the pull request its own copy" />
        <p>
          Pull request 512 opens. We fork <code>main</code> into a new branch named after it. A fork
          is a new branch that starts exactly where another one is. It copies nothing: it shares
          main’s files until the pull request changes one.
        </p>
        <Code
          file="fork.ts"
          code={`
const pr = await main.fork("pr-512");
const start = (await pr.info()).head;
`}
        />
        <p>
          <code>pr-512</code> now has every file <code>main</code> has, with the same contents. We
          also keep <code>start</code>, the commit the copy began from. We’ll need it in step 4.
        </p>

        <Chapter id="run" step={3} title="Run the preview on the copy" />
        <p>
          The change under review moves prices into whole cents. Its migration reads the catalog,
          replaces each <code>price</code> with <code>cents</code>, and saves the result. We run it
          on the copy, exactly as it was written in the pull request:
        </p>
        <Code
          file="preview.ts"
          code={`
type Product = { id: string; price: string; currency: string };
const file = "catalog/products.json";

async function migrate(toCents: (price: string) => number) {
  const products: Product[] = JSON.parse(await pr.readText(file));
  const moved = products.map(({ price, ...product }) => ({
    ...product,
    cents: toCents(price),
  }));
  await pr.write(
    { [file]: JSON.stringify(moved, null, 2) },
    "PR 512: store prices in cents",
  );
}

await migrate((price) => Math.round(Number(price) * 100));
await pr.checkout("./previews/pr-512");
`}
        />
        <p>
          <code>checkout</code> writes the branch’s files into a local folder. Start the preview
          with that folder as its data, and open the shop.
        </p>
        <p>
          The mug costs 1200 cents, as it should. <b>The tote bag has no price.</b> Its price is
          “24,00”, and <code>Number(&quot;24,00&quot;)</code> is not a number, so it was saved as{" "}
          <code>null</code>. This is the bug seed data hides, found before anyone approved it,
          because the preview ran on the real catalog.
        </p>
        <p>
          Worse, the migration dropped the old <code>price</code> field, so on this copy the tote’s
          price is gone. On a shared staging, everyone would now be testing on broken data. Here,
          only <code>pr-512</code> changed. <code>main</code> has no new commit at all.
        </p>

        <Chapter id="undo" step={4} title="Undo and try again" />
        <p>
          The author fixes the migration to read a comma as a decimal point. Before running it
          again, we put the copy back the way it started. <code>reset</code> makes the branch’s
          files what they were at a commit, as one new commit on top, so even the broken try stays
          in the history.
        </p>
        <Code
          file="try-again.ts"
          code={`
await pr.reset(start, { message: "PR 512: undo the first try" });
const toCents = (price: string) =>
  Math.round(Number(price.replace(",", ".")) * 100);
await migrate(toCents);
await pr.checkout("./previews/pr-512");
`}
        />
        <p>Refresh the preview. Every product has a price now:</p>
        <TwoTries />
        <p>
          You can do this as many times as the change needs. Each try starts from the same real
          data, and nothing you do on the copy reaches anyone else.
        </p>

        <Chapter id="review" step={5} title="Let reviewers look, not touch" />
        <p>
          Reviewers should see the data the preview ran on, but not change it. We make them a key
          that can only read, only reach this namespace, and stops working after a week:
        </p>
        <Code
          file="review.ts"
          code={`
const review = await sky.keys.create("Review PR 512", "read", {
  namespaces: "shop/data",
  expiresInDays: 7,
});
`}
        />
        <p>
          Share <code>review.key</code> with the reviewer. With it, they can ask what the pull
          request changed in the data:
        </p>
        <Code
          file="reviewer.ts"
          code={`
const reviewer = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: review.key,
});
const copy = reviewer.namespace("shop/data").branch("pr-512");

const changed = await copy.diff("main", { against: "base" });
console.log(changed);
`}
        />
        <p>
          It prints one change: <code>catalog/products.json</code>, modified. The option{" "}
          <code>against: &quot;base&quot;</code> compares the copy with where it started, so only
          the pull request’s own changes show, not what landed on <code>main</code> since. The
          reviewer can read any file on the copy. If they try to write one, the request is refused.
        </p>
        <Note title="Tip: a read key sees the whole namespace">
          <p>
            A key is limited by namespace, not by branch. This one can also read <code>main</code>,
            which is handy for comparing. It cannot change either. If some data must stay private,
            keep it in its own namespace.
          </p>
        </Note>

        <Chapter id="ship" step={6} title="Ship it, or throw it away" />
        <p>
          The pull request is approved. Merging the branch brings its changes into <code>main</code>
          . Merging is how a protected branch changes, so this is the only way the new prices reach
          the real data.
        </p>
        <Code
          file="ship.ts"
          code={`
const merged = await pr.mergeInto("main", { message: "Ship PR 512" });
if (merged.conflicts.length === 0) {
  await pr.delete();
  await sky.keys.revoke(review.id);
}
`}
        />
        <p>
          <code>main</code> now stores prices in cents, the copy is gone, and the reviewer’s key no
          longer works. If <code>main</code> had changed the same file in the meantime, the merge
          would save nothing and list that file in <code>conflicts</code> instead.
        </p>
        <p>
          Not every change on a copy should ship. Test orders made while clicking around a preview,
          for example, should not. In that case skip the merge and only delete the branch. The copy
          is gone, and <code>main</code> never saw it.
        </p>

        <Chapter id="every" title="Doing it for every pull request" />
        <p>
          The steps above fit in one small function. Call it from your CI when a pull request is
          opened, merged or closed:
        </p>
        <Code
          file="on-pull-request.ts"
          code={`
export async function onPullRequest(n: number, event: string) {
  const branch = shop.branch(\`pr-\${n}\`);
  if (event === "opened") {
    await main.fork(branch.name);
    await branch.checkout(\`./previews/pr-\${n}\`);
  }
  if (event === "merged") {
    const { conflicts } = await branch.mergeInto("main");
    if (conflicts.length > 0) throw new Error(\`Conflicts: \${conflicts}\`);
  }
  if (event === "merged" || event === "closed") {
    await branch.delete();
  }
}
`}
        />
        <p>A few things to know as more pull requests run at once:</p>
        <ul>
          <li>
            <b>Copies are quick.</b> Creating a branch takes about 13 ms, and a fork copies nothing,
            whatever the size of your data.
          </li>
          <li>
            <b>Copies stay apart.</b> Two pull requests open at the same time each see only their
            own changes, never each other’s.
          </li>
          <li>
            <b>Real data stays safe.</b> <code>main</code> is protected, so it changes only when a
            pull request is merged.
          </li>
          <li>
            <b>Clean up is one call.</b> Deleting the branch removes the copy. There is no database
            or bucket left behind to find later.
          </li>
          <li>
            <b>It all stays yours.</b> Every copy lives in your own bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Does every preview cost a full copy of the data?",
              <p key="a">
                No. A fork copies nothing. It shares the files of the branch it came from, and only
                the files a pull request writes are saved again.
              </p>,
            ],
            [
              "What if main changed while the pull request was open?",
              <p key="a">
                If they changed different files, the merge simply combines them. If both changed the
                same file, the merge saves nothing, lists the file in <code>conflicts</code>, and
                leaves the branch as it is. Fork a fresh copy from the new <code>main</code> and run
                the change again.
              </p>,
            ],
            [
              "What happens to test data made in a preview?",
              <p key="a">
                It lives only on that pull request’s branch. Delete the branch and it is gone. It
                reaches <code>main</code> only if you merge.
              </p>,
            ],
            [
              "Can I see the copy as it was before a change?",
              <p key="a">
                Yes, while the branch exists. Every write is a commit, so you can read any file as
                it was at an older commit. After a merge, the change stays in the history of{" "}
                <code>main</code>.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the shop's data with one branch per open pull request. */
function PreviewsCover() {
  const row = "flex h-9 items-center gap-2.5 border-b border-border px-1 whitespace-nowrap";
  const prs = [
    ["pr-511", "Preview ready"],
    ["pr-512", "In review"],
    ["pr-513", "Preview ready"],
  ];
  return (
    <div className="grid">
      <div className={`${row} text-muted-foreground`}>
        <span className="font-mono text-[12px]">shop/data</span>
      </div>
      <div className={row}>
        <GitBranch className="size-3.5 text-muted-foreground" /> main
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Lock className="size-3" /> Protected
        </span>
      </div>
      {prs.map(([name, state]) => (
        <div
          key={name}
          className={
            name === "pr-512"
              ? `${row} rounded-md border-transparent bg-foreground/[0.06] pr-2 pl-6`
              : `${row} pl-6`
          }
        >
          <GitBranch className="size-3.5 text-muted-foreground" />
          <span className={name === "pr-512" ? "" : "text-muted-foreground"}>{name}</span>
          <span
            className={`ml-auto text-[12px] ${name === "pr-512" ? "text-signal" : "text-muted-foreground"}`}
          >
            {state}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One shared staging for every pull request, next to one copy per pull request. */
function SharedOrOwn() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  const prs = ["PR 511", "PR 512", "PR 513"];
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">The usual setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap gap-2">
            {prs.map((pr) => (
              <span key={pr} className={box}>
                {pr}
              </span>
            ))}
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> One shared staging
          </span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">What we’ll build</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>main</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            {prs.map((pr) => (
              <span key={pr} className={`${box} font-mono`}>
                {pr.replace("PR ", "pr-")}
              </span>
            ))}
            <span className="t-eyebrow px-1 text-signal">A copy each</span>
          </span>
        </div>
      </div>
    </figure>
  );
}

/** The catalog on the pull request's copy, after the first try and after the fix. */
function TwoTries() {
  const products: [name: string, first: string, second: string][] = [
    ["Mug", "1200", "1200"],
    ["Tote bag", "null", "2400"],
    ["Cap", "1850", "1850"],
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="t-eyebrow grid grid-cols-[1fr_6rem_6rem] gap-3 border-b border-border bg-card px-5 py-3 text-muted-foreground">
        <span>pr-512 · cents</span>
        <span className="text-right">First try</span>
        <span className="text-right text-signal">Second try</span>
      </div>
      {products.map(([name, first, second]) => (
        <div
          key={name}
          className="t-small grid grid-cols-[1fr_6rem_6rem] gap-3 border-b border-border px-5 py-3 last:border-b-0"
        >
          <span className="text-foreground">{name}</span>
          <span
            className={`text-right font-mono ${
              first === "null" ? "text-[color:var(--love)]" : "text-muted-foreground"
            }`}
          >
            {first}
          </span>
          <span className="text-right font-mono text-foreground">{second}</span>
        </div>
      ))}
      <p className="t-small border-t border-border bg-card px-5 py-3 text-muted-foreground">
        main, the whole time: unchanged
      </p>
    </figure>
  );
}
