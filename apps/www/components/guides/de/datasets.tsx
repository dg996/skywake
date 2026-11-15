// Guide: wie jedes trainierte Modell an die exakte Version der Daten gebunden
// wird, aus der es gelernt hat, und wie Sie die Daten sicher korrigieren, wenn ein Modell danebenliegt.
import { ArrowRight, Box, CircleHelp, GitBranch, GitCommitHorizontal } from "lucide-react";

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

export function DatasetsGuide({
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
        name="Dataset-Versionierung"
        title={title}
        dek="Eine Schritt-für-Schritt-Anleitung, mit der Sie Trainingsdaten als Versionen speichern, die Version hinter jedem Modell festhalten und fehlerhafte Daten korrigieren, ohne den nächsten Lauf eines anderen zu stören."
        meta={["12 Min. Lesezeit", "TypeScript", "Für Einsteiger geeignet"]}
        cover={<DatasetsCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Die Frage, die niemand beantworten konnte"],
          ["plan", "Was wir bauen"],
          ["save", "1. Das Dataset als Version speichern"],
          ["train", "2. Aus einer Version trainieren und sie notieren"],
          ["open", "3. Die Daten hinter einem Modell öffnen"],
          ["fix", "4. Die Daten auf einem Fork korrigieren"],
          ["diff", "5. Genau sehen, was sich geändert hat"],
          ["keep", "6. Neu trainieren und die Korrektur behalten"],
          ["real", "Im echten Betrieb"],
          ["questions", "Fragen"],
        ]}
      >
        <Chapter id="start" title="Die Frage, die niemand beantworten konnte" />
        <p>
          Ein Modell kennt seine Trainingsdaten nur über einen Ordnernamen. Der Ordner ändert sich
          ständig: Leute bereinigen ihn direkt an Ort und Stelle, und neue Exporte landen obendrauf.
          Das Modell ändert sich nicht. Eine Woche später zeigt der Name auf andere Daten, und wenn
          das Modell anfängt, Fehler zu machen, hat die erste Frage, woraus es gelernt hat, keine
          Antwort.{" "}
          <b>Das Modell ist in Production, und niemand kann sagen, woraus es gelernt hat.</b>
        </p>
        <p>
          Die üblichen Lösungen helfen ein wenig. Sie können den Ordner vor jedem Lauf kopieren, und
          bald haben Sie <code>tickets_v2</code>, <code>tickets_v2_clean</code> und{" "}
          <code>tickets_final</code>, jeweils eine vollständige Kopie, und immer noch keine
          Aufzeichnung, welche davon welches Modell trainiert hat. Oder Sie notieren Dateinamen und
          eine Prüfsumme. Das sagt Ihnen, dass sich die Daten geändert haben, aber die alten Daten
          bekommen Sie damit nicht zurück.
        </p>
        <Copies />
        <p>
          In diesem Guide führen wir stattdessen ein einziges Dataset mit vollständiger Historie.
          Jede Änderung ist ein Commit, eine gespeicherte Version mit eigener ID. Jedes Modell
          bekommt eine kleine Karte, die den Commit nennt, auf dem es trainiert wurde. Alte
          Versionen verschwinden nie, und eine Kopie für ein Experiment kostet nichts, weil sie
          nichts kopiert.
        </p>

        <Chapter id="plan" title="Was wir bauen" />
        <p>Am Ende haben Sie:</p>
        <div>
          <Checklist
            items={[
              "Ihre Trainingsdaten als Branch gespeichert, jede Änderung als Commit erhalten.",
              "Einen Trainingsschritt, der einen exakten Commit liest und ihn auf einer Model Card festhält.",
              "Eine Möglichkeit, die exakten Dateien hinter jedem Modell zu öffnen, auch Monate später.",
              "Forks, damit Sie die Daten bereinigen können, ohne die Läufe anderer zu berühren.",
              "Eine klare Liste dessen, was sich zwischen zwei Versionen geändert hat, bevor Sie eine Korrektur übernehmen.",
            ]}
          />
        </div>
        <p>
          Sie brauchen einen Skywake-API-Key und Node. Setzen Sie <code>SKYWAKE_URL</code> und{" "}
          <code>SKYWAKE_KEY</code> und installieren Sie dann das SDK mit{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Das Dataset als Version speichern" />
        <p>
          Beginnen Sie mit dem Ordner, aus dem Sie heute trainieren. Unserer besteht aus ein paar
          Dateien mit gelabelten Tickets, ein JSON-Objekt pro Zeile:
        </p>
        <Tree
          root="tickets"
          items={[
            ["train/billing.jsonl"],
            ["train/shipping.jsonl"],
            ["train/spam.jsonl", "hier liegt das Problem"],
            ["train/old-2019.jsonl"],
            ["eval/holdout.jsonl", "die Tickets, auf denen wir testen"],
          ]}
        />
        <p>
          Wir speichern ihn in einem Namespace, also einem Repository für Dateien, auf einem Branch
          namens <code>main</code>. Ein Branch funktioniert wie ein Git-Branch: Jedes Speichern ist
          ein Commit, und jeder Commit bleibt lesbar.
        </p>
        <Code
          file="save-data.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const data = await sky.createNamespace("ml/tickets");
const main = await data.createBranch("main");
const v1 = await main.commitFolder("./tickets", {
  message: "Support tickets, March export",
});
`}
        />
        <p>
          <code>v1</code> ist die ID des gerade erstellten Commits. Diese eine ID bezeichnet genau
          diese Dateien, für immer, egal was später mit <code>main</code> passiert.
        </p>

        <Chapter id="train" step={2} title="Aus einer Version trainieren und sie notieren" />
        <p>
          Jetzt der Teil, der in der Geschichte gefehlt hat. Vor dem Training schreiben wir den
          Branch in einen lokalen Ordner. <code>checkout</code> liest jede Datei aus einem einzigen
          Commit und sagt uns, aus welchem. Dann speichern wir diese ID auf einer Model Card.
        </p>
        <p>
          Die Karten liegen in einem eigenen Namespace, damit die Historie des Datasets nur
          Änderungen an den Daten zeigt.
        </p>
        <Code
          file="train.ts"
          code={`
import type { Branch } from "@skywake/sdk";

const models = await sky.createNamespace("ml/models");
const cards = await models.createBranch("main");

async function train(branch: Branch, model: string) {
  const commit = await branch.checkout(\`./runs/\${model}\`);
  // Your training code reads ./runs/<model> here.
  const card = { model, branch: branch.name, commit };
  await cards.write(
    { [\`\${model}.json\`]: JSON.stringify(card, null, 2) },
    \`Trained \${model}\`,
  );
  return commit;
}

await train(main, "ticket-tagger-v7");
`}
        />
        <p>
          Die Karte für v7 nennt jetzt <code>main</code> und die Commit-ID. Wenn jemand eine Minute
          später auf <code>main</code> committet, zeigt die Karte trotzdem auf die Dateien, die v7
          wirklich gesehen hat.
        </p>
        <Note title="Tipp: den Commit festhalten, nicht den Branch">
          <p>
            Ein Branch-Name wandert bei jedem Speichern weiter. Eine Commit-ID nie. Behalten Sie den
            Branch-Namen auf der Karte, damit sie leichter zu lesen ist, aber verlassen Sie sich
            immer auf den Commit.
          </p>
        </Note>

        <Chapter id="open" step={3} title="Die Daten hinter einem Modell öffnen" />
        <p>
          Angenommen, v7 sortiert plötzlich Erstattungsanfragen als Spam ein, und <code>main</code>{" "}
          hat sich seit dem Training geändert. Wir müssen nicht raten. Wir lesen die Karte und dann
          die Spam-Datei bei dem Commit, den sie nennt:
        </p>
        <Code
          file="open-data.ts"
          code={`
const card = JSON.parse(await cards.readText("ticket-tagger-v7.json"));
const bytes = await main.read("train/spam.jsonl", { at: card.commit });
console.log(new TextDecoder().decode(bytes));
`}
        />
        <p>
          Die Option <code>at</code> liest eine Datei so, wie sie bei einem älteren Commit war. Die
          Antwort liegt direkt vor uns: dieselbe Spam-Zeile zweimal und eine Erstattungsanfrage, die
          als Spam gelabelt ist. v7 hat genau das gelernt, was wir ihm beigebracht haben.
        </p>
        <SpamFile />

        <Chapter id="fix" step={4} title="Die Daten auf einem Fork korrigieren" />
        <p>
          Naheliegend wäre, die Datei direkt zu bearbeiten. Aber vielleicht trainiert gerade ein
          Kollege aus <code>main</code>, und eine halb fertige Bereinigung würde auch in seinem
          Modell landen.
        </p>
        <p>
          Also forken wir stattdessen. Ein Fork ist ein neuer Branch, der bei einem Commit Ihrer
          Wahl beginnt. Er kopiert keine Dateien, ist also schnell, egal wie groß die Daten sind,
          und nichts, was Sie darauf tun, berührt <code>main</code>. Wir starten ihn beim Commit von
          v7, also bei den Daten, die wir korrigieren.
        </p>
        <Code
          file="fix.ts"
          code={`
const fix = await main.fork("fix/spam-labels", card.commit);

const spam = {
  text: "You won a free cruise, click here",
  label: "spam",
};
await fix.commit("Fix spam labels, drop 2019 tickets", [
  { path: "train/spam.jsonl", text: JSON.stringify(spam) + "\\n" },
  { path: "train/old-2019.jsonl", delete: true },
]);
`}
        />
        <p>
          Ein Commit erledigt beides: <code>spam.jsonl</code> behält ein echtes Spam-Beispiel, und
          die veraltete Datei von 2019 ist weg. Auf <code>main</code> sind beide Dateien genau so
          wie vorher.
        </p>

        <Chapter id="diff" step={5} title="Genau sehen, was sich geändert hat" />
        <p>
          Bevor jemand auf der Korrektur trainiert, lohnt sich ein Blick darauf, was sie wirklich
          ändert. Ein Diff listet jede Datei auf, die sich zwischen zwei Branches unterscheidet.
        </p>
        <Code
          file="diff.ts"
          code={`
for await (const change of fix.allDiff("main", { against: "base" })) {
  console.log(change.kind, change.path);
}
`}
        />
        <p>
          <code>{`against: "base"`}</code> vergleicht mit dem letzten Commit, den beide Branches
          gemeinsam haben. Auch wenn <code>main</code> seitdem neue Versand-Tickets bekommen hat,
          zeigt der Diff also nur, was der Fork geändert hat:
        </p>
        <Changes />
        <p>
          Diese Liste gehört in einen Pull Request oder einen Trainingsbericht. Jeder sieht, Datei
          für Datei, was das nächste Modell anders lernen wird.
        </p>

        <Chapter id="keep" step={6} title="Neu trainieren und die Korrektur behalten" />
        <p>
          Trainieren Sie v8 aus dem Fork mit derselben Funktion <code>train</code>. Schneidet es auf
          den Holdout-Tickets besser ab, mergen Sie den Fork in <code>main</code>, damit der nächste
          Lauf aller auf sauberen Daten startet.
        </p>
        <Code
          file="keep.ts"
          code={`
await train(fix, "ticket-tagger-v8");

const merged = await fix.mergeInto("main");
if (merged.conflicts.length === 0) {
  console.log("main now has the fix:", merged.head);
}
`}
        />
        <p>
          Der Merge bringt die Korrektur nach <code>main</code> und behält die Versand-Tickets, die
          jemand dort inzwischen hinzugefügt hat. Und jetzt hat jedes Modell eine klare Quelle:
        </p>
        <Lineage />
        <p>
          Beide Commits bleiben nach dem Merge über <code>main</code> lesbar, auch wenn Sie den Fork
          löschen. Und <code>cards.log()</code> listet jeden Trainingslauf auf, den neuesten zuerst,
          als eigene kleine Historie.
        </p>

        <Chapter id="real" title="Im echten Betrieb" />
        <p>Ein paar Gewohnheiten, mit denen das funktioniert, während Team und Daten wachsen:</p>
        <ul>
          <li>
            <b>Schützen Sie main.</b> Lassen Sie <code>main</code> sich nur durch einen Merge
            ändern, damit jede Änderung an den Daten zuerst durch einen Fork und einen Diff geht.
          </li>
          <li>
            <b>Forks bleiben günstig.</b> Einen Branch anzulegen dauert etwa 13 ms, und er kopiert
            keine Dateien. Geben Sie jedem Experiment einen eigenen.
          </li>
          <li>
            <b>Jedes Modell lässt sich neu trainieren.</b> Checken Sie den Commit auf seiner Karte
            aus, und Sie bekommen genau dieselben Dateien zurück, Byte für Byte.
          </li>
          <li>
            <b>Alles bleibt bei Ihnen.</b> Die Daten und ihre Historie liegen in Ihrem eigenen
            Bucket, nicht in Kopien, die über Laptops verstreut sind.
          </li>
        </ul>
        <Code
          file="protect.ts"
          code={`
// Needs an admin key. Direct commits to main now fail.
await main.protect();

// Rebuild v7's training folder, exactly as it was.
await main.checkout("./runs/v7-again", { at: card.commit });
`}
        />

        <Chapter id="questions" title="Fragen" />
        <Questions
          items={[
            [
              "Kopiert ein Fork mein ganzes Dataset?",
              <p key="a">
                Nein. Ein Fork verweist auf einen bereits bestehenden Commit, er kopiert also keine
                Dateien, egal wie groß das Dataset ist.
              </p>,
            ],
            [
              "Was, wenn zwei Personen gleichzeitig dieselbe Datei bereinigen?",
              <p key="a">
                Jede arbeitet auf ihrem eigenen Fork. Der erste Merge geht durch. Hat der zweite
                Fork dieselbe Datei geändert, speichert sein Merge nichts und führt die Datei als
                Konflikt auf, sodass Sie entscheiden können, welche Version Sie behalten.
              </p>,
            ],
            [
              "Wie gehe ich zu einer älteren Version der Daten zurück?",
              <p key="a">
                Rufen Sie <code>reset</code> mit dem gewünschten Commit auf. Damit werden die
                Dateien wieder so, wie sie damals waren, als ein neuer Commit obendrauf, sodass die
                Historie dazwischen erhalten bleibt. Ist <code>main</code> geschützt, setzen Sie
                einen Fork zurück und mergen ihn.
              </p>,
            ],
            [
              "Kann ich jedes Modell sehen, das wir trainiert haben?",
              <p key="a">
                Ja. Jede Karte ist ein Commit im Namespace <code>ml/models</code>, also listet{" "}
                <code>cards.log()</code> jeden Trainingslauf auf, und jede Karte nennt ihre Daten.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

// On a narrow phone a long row scrolls on its own instead of widening the page.
const ROW =
  "flex h-9 items-center gap-2.5 overflow-x-auto border-b border-border px-1 whitespace-nowrap";
const MONO = "font-mono text-[12px]";

/** The cover: each model next to the commit of data it was trained on. */
function DatasetsCover() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)]">
      <div className={`${ROW} text-[12px] text-muted-foreground`}>
        <span className="w-36">Model</span>
        <span>Trained on</span>
      </div>
      {[
        ["ticket-tagger-v8", "fix/spam-labels", "cff0c59"],
        ["ticket-tagger-v7", "main", "a3c031e"],
      ].map(([model, branch, commit], i) => (
        <div key={model} className={ROW}>
          <Box className="size-3.5 text-muted-foreground" />
          <span className={`w-[7.5rem] ${i === 0 ? "" : "text-muted-foreground"}`}>{model}</span>
          <GitBranch className="size-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{branch}</span>
          <span className={`ml-auto ${MONO} ${i === 0 ? "text-signal" : "text-muted-foreground"}`}>
            {commit}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Folder copies with no link to the models, next to one history every model points into. */
function Copies() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Das übliche Setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {["tickets_v2/", "tickets_v2_clean/", "tickets_final/"].map((folder) => (
            <span key={folder} className={`${box} font-mono text-[12px]`}>
              {folder}
            </span>
          ))}
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <CircleHelp className="size-3.5" /> Welcher davon?
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Modell v7</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Was wir bauen</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={`${box} font-mono text-[12px]`}>a3c031e</span>
            <span className={`${box} font-mono text-[12px]`}>cff0c59</span>
            <span className="t-eyebrow px-1 text-signal">Eine Historie</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Jedes Modell nennt seinen Commit</span>
        </div>
      </div>
    </figure>
  );
}

/** What v7 actually learned from: spam.jsonl at v7's commit. */
function SpamFile() {
  const lines: [string, string, string?][] = [
    ["You won a free cruise, click here", "spam"],
    ["You won a free cruise, click here", "spam", "dieselbe Zeile zweimal"],
    ["I want a refund for my order", "spam", "eine Erstattung, als Spam gelabelt"],
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-card">
      <figcaption className="flex h-11 items-center gap-2 border-b border-border px-4 font-mono text-[12px] text-muted-foreground">
        train/spam.jsonl
        <span className="ml-auto flex items-center gap-1.5">
          <GitCommitHorizontal className="size-3.5" /> a3c031e
        </span>
      </figcaption>
      <ul className="grid py-2">
        {lines.map(([text, label, problem], i) => (
          <li
            key={i}
            className={`flex flex-wrap items-baseline gap-x-4 px-4 py-1.5 ${MONO} ${
              problem ? "bg-[color:var(--love)]/[0.06]" : ""
            }`}
          >
            <span className="text-foreground">
              “{text}” → {label}
            </span>
            {problem && <span className="text-[color:var(--love)]">{problem}</span>}
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** The diff the fork shows against main. */
function Changes() {
  const rows: [kind: string, path: string, note: string][] = [
    ["removed", "train/old-2019.jsonl", "veraltete Tickets"],
    ["modified", "train/spam.jsonl", "zwei fehlerhafte Zeilen entfernt"],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">fix/spam-labels im Vergleich mit main</p>
      <ul className="mt-3 grid grid-cols-[minmax(0,1fr)]">
        {rows.map(([kind, path, note]) => (
          <li key={path} className={ROW}>
            <span
              className={`w-20 ${MONO} ${kind === "removed" ? "text-[color:var(--love)]" : "text-signal"}`}
            >
              {kind}
            </span>
            <span className={`${MONO} text-foreground`}>{path}</span>
            <span className="t-small ml-auto text-muted-foreground">{note}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** The payoff: two models, each with a card that points to its own data. */
function Lineage() {
  const models = [
    {
      model: "ticket-tagger-v7",
      branch: "main",
      commit: "a3c031e",
      note: "Hat gelernt, dass manche Erstattungen Spam sind.",
      old: true,
    },
    {
      model: "ticket-tagger-v8",
      branch: "fix/spam-labels",
      commit: "cff0c59",
      note: "Auf der korrigierten Spam-Datei trainiert.",
      old: false,
    },
  ];
  return (
    <figure className="grid gap-3 rounded-xl border border-border p-5">
      {models.map(({ model, branch, commit, note, old }) => (
        <div
          key={model}
          className="grid gap-2 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <p
              className={`flex items-center gap-2 ${old ? "text-muted-foreground" : "text-foreground"}`}
            >
              <Box className="size-3.5" /> {model}
            </p>
            <p className="t-small mt-1 text-muted-foreground">{note}</p>
          </div>
          <div className={`flex items-center gap-2 self-start ${MONO} text-muted-foreground`}>
            <GitBranch className="size-3.5" /> {branch}
            <span className={old ? "" : "text-signal"}>@ {commit}</span>
          </div>
        </div>
      ))}
      <span className="t-eyebrow pl-1 text-signal">Jedes Modell, ein exakter Commit</span>
    </figure>
  );
}
