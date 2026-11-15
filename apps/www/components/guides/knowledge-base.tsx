// Guide: how to build a large knowledge base your agents can search, that
// stays current the moment a doc changes. Written to be read top to bottom.
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

export function KnowledgeBaseGuide({
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
        name="Knowledge base"
        title={title}
        dek="A step-by-step guide to giving your agents millions of docs they can search, refer & cite."
        meta={["15 min read", "TypeScript", "Beginner friendly"]}
        cover={<KnowledgeCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Why this is harder than it looks"],
          ["plan", "What we’re building"],
          ["save", "1. Put your docs in one place"],
          ["index", "2. Make a search index next to them"],
          ["fill", "3. Fill the index"],
          ["tool", "4. Give your agent a search tool"],
          ["update", "5. Keep it current"],
          ["drafts", "6. Test big changes on a draft"],
          ["scale", "Growing to millions of docs"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Why this is harder than it looks" />
        <p>
          Giving an agent your company’s knowledge sounds simple, and the first version usually
          works in an afternoon. The trouble starts weeks later, when a doc changes and the agent
          keeps quoting the old one. Most setups keep two copies of your knowledge: the docs
          themselves, and a search database built from them. When the two drift apart, the agent
          keeps answering, just from old text. <b>The doc was right. The agent read an old copy.</b>
        </p>
        <p>
          The fixes sound simple. Add a job that keeps the two in sync, or drop the database and let
          agents read the files straight from one object storage bucket. Both get harder as your
          knowledge grows. The sync job has more to copy and more ways to fail. And a bucket is not
          a folder: before an agent can open a file, it has to download it.{" "}
          <b>Company knowledge bases often run to hundreds of gigabytes.</b>
        </p>
        <TwoSetups />
        <p>
          In this guide we’ll show how to build it the other way. The docs and their search index
          live <b>in the same bucket</b>, tied to the same version of your docs. There is no second
          copy to fall behind, and agents read only the parts of a file they need.
        </p>

        <Chapter id="plan" title="What we’re building" />
        <p>By the end, you’ll have:</p>
        <div>
          <Checklist
            items={[
              "Your docs saved as a branch, with every change kept as a commit.",
              "A search index next to them that finds answers by meaning and by exact words.",
              "One search tool your agent can call, which tells you which file it used.",
              "A way to update a doc and have the agent see it right away.",
              "Drafts, so you can test big rewrites before customers see them.",
            ]}
          />
        </div>
        <p>
          You’ll need a Skywake API key and Node. Set <code>SKYWAKE_URL</code> and{" "}
          <code>SKYWAKE_KEY</code>, then install the SDK with <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Put your docs in one place" />
        <p>
          Start with the folder you already have. Markdown or plain text works best: whatever your
          help center exports. Ours looks like this:
        </p>
        <Tree
          root="help-center"
          items={[
            ["billing/refunds.md", "the one that will change"],
            ["billing/invoices.md"],
            ["plans/annual.md"],
            ["account/reset-password.md"],
            ["account/sso.md"],
          ]}
        />
        <p>
          We’ll save it as a branch called <code>main</code>. Think of a branch like a Git branch
          for files: each save is a commit, and you can always go back and see what changed.
        </p>
        <Code
          file="save-docs.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const help = await sky.createNamespace("support/help");
const main = await help.createBranch("main");
await main.commitFolder("./help-center", { message: "Help center today" });
`}
        />
        <p>
          That’s it. <code>main</code> is now the one true copy of your docs, stored in your own
          bucket.
        </p>

        <Chapter id="index" step={2} title="Make a search index next to them" />
        <p>
          Next, the index. For each doc it keeps two things: the <b>text</b>, so it can match exact
          words, and a <b>vector</b>, a list of numbers that captures what the text means.
        </p>
        <p>
          Why both? Customers ask “can I get my money back?” while your doc says “refund”. Search by
          meaning finds that. They also type “SSO” or an error code, and search by words finds that
          better. A good knowledge base needs both.
        </p>
        <Code
          file="create-index.ts"
          code={`
const search = await sky.indexes.create(
  "support/help-search",
  {
    vectors: [
      // The server makes the vectors with this model. No job to run.
      {
        name: "meaning",
        dims: 1536,
        embed: { model: "openai/text-embedding-3-small" },
      },
    ],
    attributes: [
      { name: "path", type: "string" },
      { name: "text", type: "text" },
    ],
  },
  { ifMissing: true },
);
`}
        />
        <p>
          Notice the <code>embed</code> line. You name a model once, and from then on you send plain
          text. The server makes the vectors for you.
        </p>

        <Chapter id="fill" step={3} title="Fill the index" />
        <p>
          Now we copy each doc into the index. <code>syncIndex</code> reads the branch and writes
          one document per file. We tell it how to turn a file into a document: its path is the id,
          and its text goes in both columns.
        </p>
        <Code
          file="sync.ts"
          code={`
import { syncIndex } from "@skywake/sdk";

type DocFile = { path: string; bytes: Uint8Array };

const document = ({ path, bytes }: DocFile) => {
  const text = new TextDecoder().decode(bytes);
  return {
    id: path,
    vectors: { meaning: text },
    attributes: { path, text },
  };
};

let synced = await syncIndex(main, search, { document });
`}
        />
        <p>
          The first run sends every file. It returns <code>synced.head</code>, the commit it synced
          to. Keep that value. Next time you pass it back, and only the files that changed since
          then are sent. Files you deleted are removed from the index too.
        </p>

        <Chapter id="tool" step={4} title="Give your agent a search tool" />
        <p>
          Your agent needs one tool: search the docs. We’ll run both kinds of search in a single
          call, called a <b>hybrid</b> search. Docs found by both rank highest, so a question in the
          customer’s own words still lands on the right page.
        </p>
        <Code
          file="tool.ts"
          code={`
export async function searchDocs(question: string) {
  const hits = await search.hybrid({
    searches: {
      meaning: {
        vector: { column: "meaning", value: question },
        topK: 30,
      },
      words: { query: question, topK: 30 },
    },
    topK: 5,
  });
  return hits.map((hit) => hit.id);
}
`}
        />
        <p>
          Each hit’s id is the file’s path. Hand <code>searchDocs</code> to your agent as a tool,
          let it read the files it gets back, and ask it to name the file it used.
        </p>
        <Note title="Tip: always cite the file">
          <p>
            When an answer looks wrong, the file name tells you exactly which doc to fix. It also
            builds trust with the people reading the answers.
          </p>
        </Note>

        <Chapter id="update" step={5} title="Keep it current" />
        <p>
          Here’s the part that broke in the old setup. The refund policy changes. Edit the doc,
          commit, and sync from the last head:
        </p>
        <Code
          file="update.ts"
          code={`
await main.write(
  { "billing/refunds.md": "Annual plans can be refunded within 30 days." },
  "Refunds: 30 days, not 60",
);
synced = await syncIndex(main, search, {
  document,
  since: synced.head,
});
`}
        />
        <p>
          Only <code>billing/refunds.md</code> is sent again. Ask the agent the same question, and
          the answer has changed:
        </p>
        <Answers />
        <p>
          Run the sync right after each commit, from the same code that makes the commit. There is
          no separate job to watch, and no night when it quietly stops.
        </p>

        <Chapter id="drafts" step={6} title="Test big changes on a draft" />
        <p>
          Small edits can go straight to <code>main</code>. But say new pricing launches next month
          and half your billing docs will change. You want to see how the agent answers before any
          customer does.
        </p>
        <p>
          Fork the docs and the index into a draft. A fork copies nothing, so it is instant even
          with thousands of docs. Customers keep getting answers from <code>main</code> the whole
          time.
        </p>
        <Code
          file="draft.ts"
          code={`
const draft = await main.fork("drafts/new-pricing", synced.head);
const draftSearch = await search.fork("drafts/new-pricing");

// Edit files on the draft, then bring its index up to date.
await syncIndex(draft, draftSearch, { document, since: synced.head });

// Happy with the answers? Publish both together.
const merged = await draft.mergeInto("main");
if (merged.conflicts.length === 0) {
  await search.merge("drafts/new-pricing");
}
`}
        />
        <p>
          Point a test agent at the draft and ask it the questions customers ask most. When the
          answers read well, merge, and the new docs and their index go live at the same moment.
        </p>

        <Chapter id="scale" title="Growing to millions of docs" />
        <p>
          Everything above works the same at five docs or five million. A few things to know as it
          grows:
        </p>
        <ul>
          <li>
            <b>Syncs stay small.</b> Each sync sends only what changed, so a big knowledge base
            costs no more to update than a small one.
          </li>
          <li>
            <b>Search stays fast.</b> A warm query over 10 million vectors takes about 10 ms.
          </li>
          <li>
            <b>Drafts stay instant.</b> Forking copies nothing, whatever the size.
          </li>
          <li>
            <b>It all stays yours.</b> Docs and index live in your own bucket. There is no second
            database to run or pay for.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Do I have to make the embeddings myself?",
              <p key="a">
                No. You name a model on the index, send text, and the server embeds it. You can
                still send your own vectors if you prefer.
              </p>,
            ],
            [
              "How fast does a change show up in search?",
              <p key="a">
                As soon as the sync writes it. Search by words sees every document written,
                including the newest ones.
              </p>,
            ],
            [
              "Can I see what the agent read last week?",
              <p key="a">
                Yes. Every commit of the docs is kept, so you can open the exact version an answer
                came from.
              </p>,
            ],
            [
              "What about very long docs?",
              <p key="a">
                Split them into sections before you index them, one document per section, so each
                hit points the agent to the right part of the page.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the search the reader is about to build. */
function KnowledgeCover() {
  const Search = SNIPPETS[0]!;
  return <Search tone="blue" />;
}

/** Today's setup next to the Skywake one: a sync job that can break, then no sync job at all. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">The usual setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Docs</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Sync job
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Search database</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">What we’ll build</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Docs</span>
            <span className={box}>Their index</span>
            <span className="t-eyebrow px-1 text-signal">One bucket</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
    </figure>
  );
}

/** The same question asked before and after the change. */
function Answers() {
  const bubble = "t-small max-w-[34ch] rounded-2xl px-4 py-2.5";
  return (
    <figure className="grid gap-3 rounded-xl border border-border p-5">
      <p className={`${bubble} ml-auto bg-foreground text-background`}>
        Can I get a refund on my annual plan?
      </p>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-muted-foreground line-through decoration-1`}>
          Yes, within 60 days of purchase.
        </p>
        <span className="t-eyebrow pl-1 text-muted-foreground">Before the change</span>
      </div>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-foreground`}>
          Yes, in full within 30 days of purchase.
        </p>
        <span className="t-eyebrow pl-1 text-signal">After · from billing/refunds.md</span>
      </div>
    </figure>
  );
}
