// Anleitung: So lassen Sie einen Agenten echte Dokumente auf seiner eigenen Kopie bearbeiten,
// lesen jede seiner Änderungen und lassen nur das in den echten Ordner, was Sie freigeben.
import { ArrowRight, Check, File, GitBranch, Lock, X } from "lucide-react";

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

export function DocumentAgentsGuide({
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
        name="Dokumenten-Agenten"
        title={title}
        dek="Eine Schritt-für-Schritt-Anleitung, mit der ein Agent eine eigene Kopie der Dateien eines Mandanten bekommt, Sie alles lesen, was er geändert hat, und nur das in den echten Ordner gelangt, was Sie freigeben."
        meta={["12 Min. Lesezeit", "TypeScript", "Für Einsteiger"]}
        cover={<ReviewCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Eine falsche Zeile im Hauptbuch"],
          ["plan", "Was wir bauen"],
          ["save", "1. Speichern und sperren Sie den Ordner"],
          ["copy", "2. Geben Sie dem Agenten eine eigene Kopie"],
          ["tools", "3. Geben Sie ihm Tools, die in die Kopie schreiben"],
          ["review", "4. Lesen Sie, was er geändert hat"],
          ["approve", "5. Eine Zeile korrigieren, den Rest freigeben"],
          ["record", "6. Den Verlauf behalten, notfalls rückgängig machen"],
          ["scale", "Für jeden Mandanten im Betrieb"],
          ["questions", "Fragen"],
        ]}
      >
        <Chapter id="start" title="Eine falsche Zeile im Hauptbuch" />
        <p>
          Agenten bekommen meist denselben Zugriff wie Menschen: den echten Ordner, mit
          Schreibrechten. Es gibt keinen Entwurf und kein „Sind Sie sicher?“. Was der Agent
          speichert, wird zur neuen Wahrheit, und hinterher ist schwer zu sagen, welche Zeilen er
          angefasst hat. Ein kleiner Fehler, etwa eine Reparatur, die als neue Ausstattung gebucht
          wird, geht mit dem nächsten Bericht hinaus, bevor ihn jemand bemerkt.{" "}
          <b>Der Fehler ist klein. Das Setup gibt nur niemandem die Chance, ihn zu finden.</b>
        </p>
        <p>
          Die üblichen Lösungen haben jeweils ihren Preis. Sie können den Ordner vor jedem Lauf
          kopieren, aber Mandantenordner sind groß, die Kopien stapeln sich, und jemand muss die
          guten Änderungen trotzdem von Hand zurückübertragen. Oder Sie lassen den Agenten nur
          Änderungen vorschlagen und tippen sie selbst ein. Das ist sicher, aber dann machen Sie die
          Arbeit doch wieder selbst. <b>Am Ende heißt es alles oder nichts:</b> dem Agenten voll
          vertrauen oder ihn gar nicht nutzen.
        </p>
        <TwoSetups />
        <p>
          In dieser Anleitung machen wir es andersherum. Der echte Ordner des Mandanten ist
          gesperrt. Der Agent arbeitet auf seiner eigenen Kopie, die nichts kostet, und jedes
          Speichern wird mit einer Begründung festgehalten. Sie lesen die Änderungen, korrigieren,
          was falsch ist, und geben frei. Auf keinem anderen Weg gelangt etwas in die echten
          Dateien.
        </p>

        <Chapter id="plan" title="Was wir bauen" />
        <p>Am Ende haben Sie:</p>
        <div>
          <Checklist
            items={[
              "Den Ordner eines Mandanten gespeichert und gesperrt, sodass nicht einmal Ihr eigener Code ihn direkt bearbeiten kann.",
              "Einen Agenten-Schlüssel, der nur diesen einen Mandanten erreicht.",
              "Eine private Kopie für jeden Agenten-Lauf, in Millisekunden bereit.",
              "Eine klare Liste der Änderungen des Agenten, Commit für Commit und Zeile für Zeile.",
              "Einen Freigabeschritt, den nur Sie ausführen können, und eine Möglichkeit, ihn später rückgängig zu machen.",
            ]}
          />
        </div>
        <p>
          Sie brauchen einen Skywake-API-Key mit der Admin-Rolle und Node. Setzen Sie{" "}
          <code>SKYWAKE_URL</code> und <code>SKYWAKE_KEY</code> und installieren Sie dann das SDK
          mit <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Speichern und sperren Sie den Ordner" />
        <p>
          Als durchgehendes Beispiel nehmen wir die Buchhaltung der Acme Bakery, eines kleinen
          Mandanten. Es ist ein kleiner Ordner: ein Hauptbuch, die Rechnungen des Quartals und eine
          Notiz der Buchhalterin.
        </p>
        <Tree
          root="acme-books"
          items={[
            ["ledger.csv", "die Datei, die der Agent bearbeitet"],
            ["invoices/millers-flour-0711.txt"],
            ["invoices/coldchain-0802.txt"],
            ["invoices/oven-repair-0915.txt", "die, bei der er sich irrt"],
            ["notes.md", "„kleine Reparaturen kommen unter Repairs“"],
          ]}
        />
        <p>
          Jeder Mandant bekommt seinen eigenen Namespace, ein Repository aus Dateien. Darin
          speichern wir den Ordner als Branch namens <code>main</code>. Ein Branch ist eine Folge
          gespeicherter Versionen, wie ein Git-Branch. Jedes Speichern ist ein Commit, und jeder
          Commit bleibt erhalten.
        </p>
        <Code
          file="save-folder.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const acme = await sky.createNamespace("clients/acme");
const main = await acme.createBranch("main");
const start = await main.commitFolder("./acme-books", {
  message: "Acme books before the Q3 close",
});
await main.protect();
`}
        />
        <p>
          <code>start</code> ist der Commit, den wir gerade erstellt haben. Bewahren Sie ihn auf: Er
          markiert, wo der Agent begonnen hat. Die letzte Zeile ist die wichtigste. Ein geschützter
          Branch ändert sich <b>nur durch einen Merge</b>, sodass selbst ein direkter Schreibvorgang
          mit Ihrem Admin-Schlüssel abgelehnt wird:
        </p>
        <Code
          file="output"
          code={`
branch \`main\` is protected; change it with a merge
`}
        />

        <Chapter id="copy" step={2} title="Geben Sie dem Agenten eine eigene Kopie" />
        <p>
          Der Agent sollte nicht Ihren Schlüssel nutzen. Wir erstellen ihm einen eigenen, mit der
          Rolle <b>write</b>, für genau diesen Mandanten, der nach einer Woche abläuft.
        </p>
        <p>
          Dann forkt der Agent <code>main</code>. Ein Fork ist ein neuer Branch, der genau dort
          beginnt, wo der alte steht. Er kopiert nichts, ist also sofort bereit, egal wie groß der
          Ordner ist.
        </p>
        <Code
          file="agent-copy.ts"
          code={`
const { key } = await sky.keys.create("bookkeeper", "write", {
  namespaces: "clients/acme",
  expiresInDays: 7,
});
const agentSky = new Skywake({ url: process.env.SKYWAKE_URL!, key });

const work = await agentSky
  .namespace("clients/acme")
  .branch("main")
  .fork("agent/q3-books");
`}
        />
        <p>
          Der Agent hat jetzt <code>agent/q3-books</code>, eine vollständige Kopie der Bücher von
          Acme. Mit seinem Schlüssel kann er diese Kopie lesen und schreiben. In <code>main</code>{" "}
          kann er nicht schreiben, und versucht er, den Ordner eines anderen Mandanten zu öffnen,
          lautet die Antwort <code>no access</code>.
        </p>

        <Chapter id="tools" step={3} title="Geben Sie ihm Tools, die in die Kopie schreiben" />
        <p>
          Ihr Agent arbeitet über Tools: kleine Funktionen, die das Modell aufrufen darf. Wir geben
          ihm drei. Er kann die Dateien auflisten, eine lesen und eine schreiben. Jedes Tool zeigt
          auf <code>work</code>, es gibt also keinen Weg zum echten Ordner.
        </p>
        <Code
          file="tools.ts"
          code={`
const tools = {
  list: async () => {
    const paths: string[] = [];
    for await (const entry of work.walk()) {
      if (entry.kind === "file") paths.push(entry.path);
    }
    return paths;
  },
  read: (path: string) => work.readText(path),
  write: (path: string, text: string, reason: string) =>
    work.write({ [path]: text }, reason),
};
`}
        />
        <p>
          Sehen Sie sich <code>write</code> an. Es verlangt vom Agenten eine <b>Begründung</b>, und
          diese Begründung wird zur Commit-Nachricht. So kommt jede Änderung mit den eigenen Worten
          des Agenten, warum er sie gemacht hat.
        </p>
        <Note title="Tipp: eine Änderung pro Schreibvorgang">
          <p>
            Bitten Sie den Agenten in Ihrem Prompt, pro Schreibvorgang eine Änderung zu machen und
            sie in einem kurzen Satz zu erklären. Kleine Commits mit klaren Begründungen lassen sich
            viel leichter prüfen als ein großes Speichern am Ende.
          </p>
        </Note>
        <p>
          Geben Sie die Tools nun Ihrem Modell und lassen Sie es arbeiten. In unserem Lauf hat der
          Agent drei Zeilen zu <code>ledger.csv</code> hinzugefügt, eine pro Rechnung, und eine neue
          Datei geschrieben, <code>q3-summary.md</code>. Das ergab zwei Commits auf seiner Kopie.{" "}
          <code>main</code> hat sich überhaupt nicht verändert.
        </p>

        <Chapter id="review" step={4} title="Lesen Sie, was er geändert hat" />
        <p>
          Der Lauf ist fertig. Jetzt sind Sie dran, mit Ihrem eigenen Schlüssel. Zuerst die
          Geschichte des Laufs: was jeder Commit seit <code>start</code> geändert hat, der Reihe
          nach.
        </p>
        <Code
          file="review.ts"
          code={`
const review = acme.branch("agent/q3-books");

const run = await review.changes(start);
for (const commit of run) {
  console.log(commit.message, commit.changes.map((c) => c.path));
}

const changed = await review.diff("main", { against: "base" });
`}
        />
        <p>
          <code>changes</code> listet die Commits einzeln. <code>diff</code> liefert ihre Summe:
          jede Datei, die der Agent hinzugefügt, entfernt oder geändert hat, verglichen mit dem
          Punkt, an dem seine Kopie begann.
        </p>
        <RunLog />
        <p>
          Die Zusammenfassung ist neu, die können Sie einfach lesen. Das Hauptbuch wurde geändert,
          also möchten Sie die genauen Zeilen sehen. Lesen Sie die Datei auf beiden Branches und
          behalten Sie die neuen Zeilen:
        </p>
        <Code
          file="lines.ts"
          code={`
const before = (await main.readText("ledger.csv")).split("\\n");
const after = (await review.readText("ledger.csv")).split("\\n");
const added = after.filter((line) => !before.includes(line));
`}
        />
        <p>
          <code>added</code> enthält die drei neuen Zeilen. Zwei sind richtig. Die dritte bucht die
          Ofenreparatur als <code>Equipment</code>, obwohl die Notizen von Acme sagen, dass kleine
          Reparaturen unter <code>Repairs</code> kommen.
        </p>

        <Chapter id="approve" step={5} title="Eine Zeile korrigieren, den Rest freigeben" />
        <p>
          Wegen einer falschen Zeile müssen Sie nicht den ganzen Lauf verwerfen. Korrigieren Sie sie
          auf der Kopie des Agenten, als weiteren Commit mit Ihrer eigenen Begründung. Dann mergen
          Sie: Die Änderungen der Kopie werden in <code>main</code> übernommen.
        </p>
        <Code
          file="approve.ts"
          code={`
const fixed = after.join("\\n").replace(
  "Hearth Oven Repair,845.00,Equipment",
  "Hearth Oven Repair,845.00,Repairs",
);
await review.write(
  { "ledger.csv": fixed },
  "Oven repair goes to Repairs",
);

const preview = await review.mergeInto("main", { dryRun: true });
if (preview.conflicts.length === 0) {
  await review.mergeInto("main", { message: "Approve Q3 books" });
}
`}
        />
        <p>
          Der Probelauf speichert nichts. Er sagt Ihnen nur, ob der Merge mit etwas kollidieren
          würde, das sich inzwischen auf <code>main</code> geändert hat. Hier ist alles frei, also
          geht der echte Merge durch: Das Hauptbuch auf <code>main</code> hat jetzt alle drei
          Zeilen, mit Ihrer Korrektur, und die Zusammenfassung ist auch da.
        </p>
        <ReviewedLines />
        <p>
          Eine Sache macht das Ganze sicher. Ein Merge in einen geschützten Branch erfordert die
          Rolle <b>admin</b>. Versucht der Agent, seine eigene Kopie zu mergen, bekommt er{" "}
          <code>this needs the `admin` role</code>. Der Agent kann die Arbeit erledigen. Freigeben
          können nur Sie.
        </p>

        <Chapter id="record" step={6} title="Den Verlauf behalten, notfalls rückgängig machen" />
        <p>
          Wochen später fragt ein Mandant, warum die Ofenreparatur unter Repairs steht. Jede Version
          des Hauptbuchs bleibt erhalten, mit der Nachricht, die sie erzeugt hat:
        </p>
        <Code
          file="record.ts"
          code={`
for (const version of await main.history("ledger.csv")) {
  console.log(version.message, version.size);
}
`}
        />
        <p>
          Die neueste Version ist <code>Approve Q3 books</code>, davor{" "}
          <code>Acme books before the Q3 close</code>. Die Freigabe ist ein Merge-Commit und hält
          fest, welchen Commit sie übernommen hat.
        </p>
        <p>
          Nach der Freigabe umentschieden? <code>main</code> ändert sich weiterhin nur durch einen
          Merge, also machen Sie es auf demselben Weg rückgängig: forken, die Freigabe auf dem Fork
          per Revert zurücknehmen und das zurückmergen. Ein Revert ist ein neuer Commit, der
          wiederherstellt, was ein alter geändert hat.
        </p>
        <Code
          file="undo.ts"
          code={`
const approved = (await main.log(1))[0]!;
const undo = await main.fork("undo/q3-books");
await undo.revert(approved.hash);
await undo.mergeInto("main", { message: "Undo the Q3 approval" });
`}
        />
        <p>
          Das Hauptbuch ist wieder so wie vor dem Lauf, und auch das Rückgängigmachen steht im
          Verlauf. Und wenn Ihnen ein Lauf gar nicht gefällt, brauchen Sie nichts davon. Löschen Sie
          seinen Branch, und <code>main</code> hat ihn nie gesehen:
        </p>
        <Code
          file="reject.ts"
          code={`
await acme.branch("agent/q4-draft").delete();
`}
        />

        <Chapter id="scale" title="Für jeden Mandanten im Betrieb" />
        <p>
          Ein Mandant ist der einfache Fall. Ein paar Dinge sollten Sie wissen, wenn Sie auf
          Hunderte Mandanten und viele Läufe am Tag wachsen:
        </p>
        <ul>
          <li>
            <b>Ein Namespace pro Mandant.</b> Nennen Sie sie <code>clients/acme</code>,{" "}
            <code>clients/globex</code> und geben Sie jedem Agenten einen Schlüssel nur für den
            Mandanten, an dem er arbeitet.
          </li>
          <li>
            <b>Kopien bleiben sofort verfügbar.</b> Ein Fork kopiert nichts, eine Kopie von 20.000
            Dateien ist also in etwa 10 ms bereit.
          </li>
          <li>
            <b>Kurzlebige Schlüssel.</b> Lassen Sie den Schlüssel des Agenten bald nach dem Job
            ablaufen, damit ein alter Schlüssel nicht für den nächsten genutzt werden kann.
          </li>
          <li>
            <b>Räumen Sie Branches auf.</b> Löschen Sie den Branch eines Laufs, sobald Sie ihn
            gemergt oder abgelehnt haben. <code>main</code> behält seinen eigenen Verlauf, inklusive
            Freigabe.
          </li>
          <li>
            <b>Alles bleibt bei Ihnen.</b> Jede Version jeder Datei liegt in Ihrem eigenen Bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Fragen" />
        <Questions
          items={[
            [
              "Kann der Agent seine eigene Arbeit freigeben?",
              <p key="a">
                Nein. Sein Schlüssel hat die Rolle write, und ein Merge in einen geschützten Branch
                erfordert die Rolle admin. Der Agent kann nur seine eigene Kopie ändern.
              </p>,
            ],
            [
              "Was, wenn zwei Läufe dieselbe Datei ändern?",
              <p key="a">
                Der erste Merge geht durch. Der Probelauf des zweiten nennt die kollidierende Datei,
                und nichts wird gespeichert. Lesen Sie beide Versionen und mergen Sie dann erneut
                mit <code>resolve</code>, indem Sie eine Seite übernehmen oder den Text selbst
                schreiben.
              </p>,
            ],
            [
              "Kann ein Agent die Dateien eines anderen Mandanten sehen?",
              <p key="a">
                Nicht, wenn Sie seinen Schlüssel einschränken. Ein Schlüssel für{" "}
                <code>clients/acme</code> bekommt bei jedem anderen Namespace „kein Zugriff“.
              </p>,
            ],
            [
              "Warum erscheint ein neuer Ordner als eine einzige Änderung?",
              <p key="a">
                Ein Diff listet einen neuen oder entfernten Ordner einmal, nicht einmal pro Datei
                darin. Nutzen Sie <code>walk</code> auf dem Branch des Agenten, um jede Datei darin
                zu sehen.
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

/** Das Cover: der Lauf eines Agenten, der auf Prüfung wartet, Datei für Datei. */
function ReviewCover() {
  return (
    <div className="grid">
      <div className={ROW}>
        <GitBranch className="size-3.5 text-muted-foreground" /> agent/q3-books
        <ArrowRight className="size-3 text-muted-foreground" /> main
        <span className="ml-auto flex items-center gap-1 rounded-full bg-signal/12 px-2 text-[12px] leading-5 text-signal">
          Waiting for you
        </span>
      </div>
      {[
        ["modified", "ledger.csv", "+3 lines"],
        ["added", "q3-summary.md", "new file"],
      ].map(([kind, path, note]) => (
        <div key={path} className={ROW}>
          <File className="size-3.5 text-muted-foreground" />
          <span className={MONO}>{path}</span>
          <span className="ml-auto text-[12px] text-muted-foreground">
            {kind} · {note}
          </span>
        </div>
      ))}
      <ul className={`grid gap-1.5 px-1 pt-3 ${MONO} text-muted-foreground`}>
        <li>+ 2026-07-11,Millers Flour Co.,1180.00,Supplies</li>
        <li>+ 2026-08-02,ColdChain Services,260.00,Repairs</li>
        <li className="text-foreground">+ 2026-09-15,Hearth Oven Repair,845.00,Equipment</li>
      </ul>
    </div>
  );
}

/** Das heutige Setup neben diesem: Der Agent schreibt in die echten Dateien oder in eine Kopie, die Sie freigeben. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Das übliche Setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Schreibt direkt hinein
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Echte Dateien des Mandanten</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Was wir bauen</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Eigene Kopie</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 text-signal">
            <Check className="size-3.5" /> Sie geben frei
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={`${box} flex items-center gap-1.5`}>
            <Lock className="size-3.5 text-muted-foreground" /> Echte Dateien des Mandanten
          </span>
        </div>
      </div>
    </figure>
  );
}

/** Der Lauf des Agenten, wie der Prüfer ihn zuerst sieht: jeder Commit, seine Begründung und seine Datei. */
function RunLog() {
  const commits = [
    ["Book 3 supplier invoices for Q3", "ledger.csv", "modified"],
    ["Write the Q3 summary", "q3-summary.md", "added"],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">agent/q3-books, seit start</p>
      <ol className="mt-3 grid divide-y divide-border">
        {commits.map(([message, path, kind], i) => (
          <li key={path} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
            <span className="t-small w-5 text-muted-foreground tabular-nums">{i + 1}</span>
            <span className="t-small text-foreground">{message}</span>
            <span className="ml-auto font-mono text-[12px] text-muted-foreground">
              {kind} · {path}
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** Die vom Agenten hinzugefügten Hauptbuchzeilen, mit der vor der Freigabe korrigierten. */
function ReviewedLines() {
  const line = "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-[12px]";
  return (
    <figure className="grid gap-2 rounded-xl border border-border p-5">
      <p className="t-eyebrow mb-1 text-muted-foreground">ledger.csv auf main, nach der Freigabe</p>
      <p className={`${line} bg-card text-foreground`}>
        <Check className="size-3.5 shrink-0 text-signal" />
        2026-07-11,Millers Flour Co.,1180.00,Supplies
      </p>
      <p className={`${line} bg-card text-foreground`}>
        <Check className="size-3.5 shrink-0 text-signal" />
        2026-08-02,ColdChain Services,260.00,Repairs
      </p>
      <div className={`${line} flex-wrap bg-card text-foreground`}>
        <Check className="size-3.5 shrink-0 text-signal" />
        <span>
          2026-09-15,Hearth Oven Repair,845.00,
          <span className="text-muted-foreground line-through decoration-1">Equipment</span>{" "}
          <span className="text-signal">Repairs</span>
        </span>
      </div>
      <span className="t-eyebrow pl-1 text-signal">
        Von Ihnen korrigiert · als ein Merge freigegeben
      </span>
    </figure>
  );
}
