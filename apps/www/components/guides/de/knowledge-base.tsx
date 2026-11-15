// Anleitung: So bauen Sie eine große Wissensdatenbank, die Ihre Agenten durchsuchen
// können und die aktuell bleibt, sobald sich ein Dokument ändert. Zum Lesen von oben nach unten.
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
        name="Wissensdatenbank"
        title={title}
        dek="Eine Schritt-für-Schritt-Anleitung, mit der Ihre Agenten Millionen Dokumente durchsuchen, nutzen und zitieren können."
        meta={["15 Min. Lesezeit", "TypeScript", "Für Einsteiger"]}
        cover={<KnowledgeCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Warum das schwerer ist, als es aussieht"],
          ["plan", "Was wir bauen"],
          ["save", "1. Legen Sie Ihre Dokumente an einen Ort"],
          ["index", "2. Erstellen Sie daneben einen Suchindex"],
          ["fill", "3. Befüllen Sie den Index"],
          ["tool", "4. Geben Sie Ihrem Agenten ein Such-Tool"],
          ["update", "5. Halten Sie alles aktuell"],
          ["drafts", "6. Testen Sie große Änderungen in einem Entwurf"],
          ["scale", "Wachstum auf Millionen Dokumente"],
          ["questions", "Fragen"],
        ]}
      >
        <Chapter id="start" title="Warum das schwerer ist, als es aussieht" />
        <p>
          Einem Agenten das Wissen Ihres Unternehmens zu geben, klingt einfach, und die erste
          Version läuft meist an einem Nachmittag. Die Probleme beginnen Wochen später, wenn sich
          ein Dokument ändert und der Agent weiter die alte Fassung zitiert. Die meisten Setups
          halten zwei Kopien Ihres Wissens: die Dokumente selbst und eine daraus gebaute
          Suchdatenbank. Laufen die beiden auseinander, antwortet der Agent weiter, nur eben aus
          altem Text. <b>Das Dokument war richtig. Der Agent hat eine alte Kopie gelesen.</b>
        </p>
        <p>
          Die Lösungen klingen einfach. Ein Job, der beide synchron hält, oder Sie verzichten auf
          die Datenbank und lassen Agenten die Dateien direkt aus einem Object-Storage-Bucket lesen.
          Beides wird schwieriger, je mehr Wissen Sie haben. Der Sync-Job muss mehr kopieren und hat
          mehr Möglichkeiten zu scheitern. Und ein Bucket ist kein Ordner: Bevor ein Agent eine
          Datei öffnen kann, muss er sie herunterladen.{" "}
          <b>Wissensdatenbanken von Unternehmen umfassen oft Hunderte Gigabyte.</b>
        </p>
        <TwoSetups />
        <p>
          In dieser Anleitung zeigen wir den anderen Weg. Die Dokumente und ihr Suchindex liegen{" "}
          <b>im selben Bucket</b>, gebunden an dieselbe Version Ihrer Dokumente. Es gibt keine
          zweite Kopie, die zurückfallen kann, und Agenten lesen nur die Teile einer Datei, die sie
          brauchen.
        </p>

        <Chapter id="plan" title="Was wir bauen" />
        <p>Am Ende haben Sie:</p>
        <div>
          <Checklist
            items={[
              "Ihre Dokumente als Branch gespeichert, jede Änderung als Commit festgehalten.",
              "Einen Suchindex daneben, der Antworten nach Bedeutung und nach exakten Wörtern findet.",
              "Ein Such-Tool, das Ihr Agent aufrufen kann und das Ihnen sagt, welche Datei er genutzt hat.",
              "Eine Möglichkeit, ein Dokument zu ändern, sodass der Agent es sofort sieht.",
              "Entwürfe, mit denen Sie große Überarbeitungen testen, bevor Kunden sie sehen.",
            ]}
          />
        </div>
        <p>
          Sie brauchen einen Skywake-API-Key und Node. Setzen Sie <code>SKYWAKE_URL</code> und{" "}
          <code>SKYWAKE_KEY</code> und installieren Sie dann das SDK mit{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Legen Sie Ihre Dokumente an einen Ort" />
        <p>
          Beginnen Sie mit dem Ordner, den Sie schon haben. Markdown oder reiner Text funktioniert
          am besten, also das, was Ihr Help Center exportiert. Unserer sieht so aus:
        </p>
        <Tree
          root="help-center"
          items={[
            ["billing/refunds.md", "das Dokument, das sich ändern wird"],
            ["billing/invoices.md"],
            ["plans/annual.md"],
            ["account/reset-password.md"],
            ["account/sso.md"],
          ]}
        />
        <p>
          Wir speichern ihn als Branch namens <code>main</code>. Stellen Sie sich einen Branch wie
          einen Git-Branch für Dateien vor: Jedes Speichern ist ein Commit, und Sie können jederzeit
          zurückgehen und sehen, was sich geändert hat.
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
          Das war’s. <code>main</code> ist jetzt die einzig gültige Kopie Ihrer Dokumente,
          gespeichert in Ihrem eigenen Bucket.
        </p>

        <Chapter id="index" step={2} title="Erstellen Sie daneben einen Suchindex" />
        <p>
          Als Nächstes der Index. Für jedes Dokument speichert er zwei Dinge: den <b>Text</b>, damit
          er exakte Wörter finden kann, und einen <b>Vektor</b>, eine Liste von Zahlen, die die
          Bedeutung des Textes erfasst.
        </p>
        <p>
          Warum beides? Kunden fragen „Bekomme ich mein Geld zurück?“, während in Ihrem Dokument
          „Erstattung“ steht. Die Suche nach Bedeutung findet das. Sie tippen aber auch „SSO“ oder
          einen Fehlercode ein, und das findet die Suche nach Wörtern besser. Eine gute
          Wissensdatenbank braucht beides.
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
          Beachten Sie die Zeile mit <code>embed</code>. Sie nennen einmal ein Modell und senden ab
          dann einfachen Text. Die Vektoren erstellt der Server für Sie.
        </p>

        <Chapter id="fill" step={3} title="Befüllen Sie den Index" />
        <p>
          Jetzt kopieren wir jedes Dokument in den Index. <code>syncIndex</code> liest den Branch
          und schreibt ein Dokument pro Datei. Wir sagen ihm, wie aus einer Datei ein Dokument wird:
          Ihr Pfad ist die ID, und ihr Text kommt in beide Spalten.
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
          Der erste Lauf sendet jede Datei. Er gibt <code>synced.head</code> zurück, den Commit, bis
          zu dem synchronisiert wurde. Bewahren Sie diesen Wert auf. Beim nächsten Mal geben Sie ihn
          wieder mit, und nur die seitdem geänderten Dateien werden gesendet. Gelöschte Dateien
          werden auch aus dem Index entfernt.
        </p>

        <Chapter id="tool" step={4} title="Geben Sie Ihrem Agenten ein Such-Tool" />
        <p>
          Ihr Agent braucht ein Tool: die Dokumente durchsuchen. Wir führen beide Sucharten in einem
          einzigen Aufruf aus, einer sogenannten <b>hybriden</b> Suche. Dokumente, die beide finden,
          landen ganz oben, sodass auch eine Frage in den eigenen Worten des Kunden auf der
          richtigen Seite ankommt.
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
          Die ID jedes Treffers ist der Pfad der Datei. Geben Sie <code>searchDocs</code> Ihrem
          Agenten als Tool, lassen Sie ihn die zurückgegebenen Dateien lesen und bitten Sie ihn, die
          genutzte Datei zu nennen.
        </p>
        <Note title="Tipp: Immer die Datei zitieren">
          <p>
            Wirkt eine Antwort falsch, sagt Ihnen der Dateiname genau, welches Dokument Sie
            korrigieren müssen. Außerdem schafft das Vertrauen bei den Menschen, die die Antworten
            lesen.
          </p>
        </Note>

        <Chapter id="update" step={5} title="Halten Sie alles aktuell" />
        <p>
          Jetzt kommt der Teil, der im alten Setup kaputtging. Die Erstattungsrichtlinie ändert
          sich. Bearbeiten Sie das Dokument, committen Sie und synchronisieren Sie ab dem letzten
          Head:
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
          Nur <code>billing/refunds.md</code> wird erneut gesendet. Stellen Sie dem Agenten dieselbe
          Frage, und die Antwort hat sich geändert:
        </p>
        <Answers />
        <p>
          Führen Sie den Sync direkt nach jedem Commit aus, aus demselben Code, der den Commit
          erstellt. Es gibt keinen separaten Job zu überwachen und keine Nacht, in der er still
          ausfällt.
        </p>

        <Chapter id="drafts" step={6} title="Testen Sie große Änderungen in einem Entwurf" />
        <p>
          Kleine Änderungen können direkt in <code>main</code>. Aber angenommen, nächsten Monat
          starten neue Preise und die Hälfte Ihrer Abrechnungsdokumente ändert sich. Sie möchten
          sehen, wie der Agent antwortet, bevor es ein Kunde tut.
        </p>
        <p>
          Forken Sie die Dokumente und den Index in einen Entwurf. Ein Fork kopiert nichts, er ist
          also sofort da, selbst bei Tausenden Dokumenten. Kunden bekommen die ganze Zeit über
          weiter Antworten aus <code>main</code>.
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
          Richten Sie einen Test-Agenten auf den Entwurf und stellen Sie ihm die Fragen, die Kunden
          am häufigsten stellen. Wenn die Antworten gut sind, mergen Sie, und die neuen Dokumente
          und ihr Index gehen im selben Moment live.
        </p>

        <Chapter id="scale" title="Wachstum auf Millionen Dokumente" />
        <p>
          Alles oben funktioniert bei fünf Dokumenten genauso wie bei fünf Millionen. Ein paar Dinge
          sollten Sie wissen, wenn es wächst:
        </p>
        <ul>
          <li>
            <b>Syncs bleiben klein.</b> Jeder Sync sendet nur, was sich geändert hat. Eine große
            Wissensdatenbank zu aktualisieren, kostet also nicht mehr als eine kleine.
          </li>
          <li>
            <b>Die Suche bleibt schnell.</b> Eine warme Abfrage über 10 Millionen Vektoren dauert
            etwa 10 ms.
          </li>
          <li>
            <b>Entwürfe bleiben sofort verfügbar.</b> Ein Fork kopiert nichts, egal wie groß.
          </li>
          <li>
            <b>Alles bleibt bei Ihnen.</b> Dokumente und Index liegen in Ihrem eigenen Bucket. Es
            gibt keine zweite Datenbank, die Sie betreiben oder bezahlen müssen.
          </li>
        </ul>

        <Chapter id="questions" title="Fragen" />
        <Questions
          items={[
            [
              "Muss ich die Embeddings selbst erstellen?",
              <p key="a">
                Nein. Sie nennen am Index ein Modell, senden Text, und der Server erstellt die
                Embeddings. Wenn Sie möchten, können Sie trotzdem eigene Vektoren senden.
              </p>,
            ],
            [
              "Wie schnell taucht eine Änderung in der Suche auf?",
              <p key="a">
                Sobald der Sync sie schreibt. Die Suche nach Wörtern sieht jedes geschriebene
                Dokument, auch die neuesten.
              </p>,
            ],
            [
              "Kann ich sehen, was der Agent letzte Woche gelesen hat?",
              <p key="a">
                Ja. Jeder Commit der Dokumente bleibt erhalten, sodass Sie genau die Version öffnen
                können, aus der eine Antwort stammt.
              </p>,
            ],
            [
              "Was ist mit sehr langen Dokumenten?",
              <p key="a">
                Teilen Sie sie vor dem Indexieren in Abschnitte auf, ein Dokument pro Abschnitt. So
                führt jeder Treffer den Agenten zum richtigen Teil der Seite.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** Das Cover: die Suche, die der Leser gleich baut. */
function KnowledgeCover() {
  const Search = SNIPPETS[0]!;
  return <Search tone="blue" />;
}

/** Das heutige Setup neben dem von Skywake: ein Sync-Job, der ausfallen kann, dann gar keiner. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Das übliche Setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Dokumente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Sync-Job
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Suchdatenbank</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Was wir bauen</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Dokumente</span>
            <span className={box}>Ihr Index</span>
            <span className="t-eyebrow px-1 text-signal">Ein Bucket</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
    </figure>
  );
}

/** Dieselbe Frage vor und nach der Änderung. */
function Answers() {
  const bubble = "t-small max-w-[34ch] rounded-2xl px-4 py-2.5";
  return (
    <figure className="grid gap-3 rounded-xl border border-border p-5">
      <p className={`${bubble} ml-auto bg-foreground text-background`}>
        Kann ich für meinen Jahresplan eine Erstattung bekommen?
      </p>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-muted-foreground line-through decoration-1`}>
          Ja, innerhalb von 60 Tagen nach dem Kauf.
        </p>
        <span className="t-eyebrow pl-1 text-muted-foreground">Vor der Änderung</span>
      </div>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-foreground`}>
          Ja, in voller Höhe innerhalb von 30 Tagen nach dem Kauf.
        </p>
        <span className="t-eyebrow pl-1 text-signal">Danach · aus billing/refunds.md</span>
      </div>
    </figure>
  );
}
