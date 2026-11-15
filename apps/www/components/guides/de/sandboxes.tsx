// Anleitung: So lassen Sie lange Agenten-Jobs auf Sandboxes laufen, die ausfallen können:
// jeden Schritt sofort speichern und den Job auf einer neuen Maschine fortsetzen. Von oben nach unten lesen.
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
        name="Agenten-Speicher und Sandboxes"
        title={title}
        dek="Eine Schritt-für-Schritt-Anleitung, mit der die Arbeit eines Agenten laufend gespeichert wird, sodass nach einem Sandbox-Absturz eine neue genau dort weitermacht, wo der Job aufgehört hat."
        meta={["12 Min. Lesezeit", "TypeScript", "Für Einsteiger"]}
        cover={<SandboxCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Warum Sandboxes Arbeit verlieren"],
          ["plan", "Was wir bauen"],
          ["base", "1. Speichern Sie den Basis-Workspace einmal"],
          ["fork", "2. Geben Sie der Sandbox einen eigenen Branch"],
          ["session", "3. Halten Sie fest, wer dort arbeitet"],
          ["work", "4. Speichern Sie nach jedem Schritt"],
          ["resume", "5. Setzen Sie den Job auf einer neuen Maschine fort"],
          ["finish", "6. Behalten Sie das Ergebnis, verwerfen Sie die Sandbox"],
          ["scale", "Viele Sandboxes betreiben"],
          ["questions", "Fragen"],
        ]}
      >
        <Chapter id="start" title="Warum Sandboxes Arbeit verlieren" />
        <p>
          Sandboxes sind günstige, kurzlebige Maschinen, die Sie wegwerfen können. Das ist gut für
          die Sicherheit und schlecht für lange Jobs. Alles, was ein Agent schreibt, liegt auf der
          eigenen Festplatte der Sandbox, und wenn die Maschine zurückgenommen wird, verschwindet
          die Festplatte mit ihr. Der Job beginnt wieder von vorn.{" "}
          <b>Die Arbeit war getan. Sie lag nur auf einer Festplatte, die es nicht mehr gibt.</b>
        </p>
        <p>
          Die üblichen Lösungen lassen jeweils eine Lücke. Kopieren Sie die Dateien erst am Ende des
          Jobs in einen Bucket, verliert ein Absturz vor dem Ende trotzdem alles. Laden Sie sie alle
          paar Minuten hoch, verlieren Sie die letzten paar Minuten. Schlimmer noch: Die Notiz, wie
          weit der Job gekommen ist, kann den tatsächlich gespeicherten Dateien vorauseilen. Dann
          überspringt die nächste Maschine Arbeit oder erledigt sie doppelt.
        </p>
        <TwoSetups />
        <p>
          In dieser Anleitung geben wir der Sandbox einen Arbeitsordner, der in Ihrem eigenen Bucket
          gespeichert wird, mit einer kleinen Sicherung nach jedem Schritt. Jede Sicherung enthält
          die geänderte Datei <b>und</b> eine Notiz, wie weit der Job gekommen ist, beides zusammen.
          Fällt eine Maschine aus, öffnet eine neue denselben Ordner und macht ab der letzten
          Sicherung weiter.
        </p>

        <Chapter id="plan" title="Was wir bauen" />
        <p>Am Ende haben Sie:</p>
        <div>
          <Checklist
            items={[
              "Einen Basis-Workspace, einmal gespeichert, von dem jede Sandbox startet.",
              "Einen Branch pro Sandbox, sodass jeder Job auf seiner eigenen Kopie arbeitet.",
              "Eine Sicherung nach jedem Schritt, mit Datei und Fortschrittsnotiz zusammen.",
              "Eine Möglichkeit zu sehen, welche Sandbox noch lebt und welche gestoppt ist.",
              "Einen abgestürzten Job, der auf einer neuen Maschine ab seiner letzten Sicherung weiterläuft.",
            ]}
          />
        </div>
        <p>
          Sie brauchen einen Skywake-API-Key und Node. Setzen Sie <code>SKYWAKE_URL</code> und{" "}
          <code>SKYWAKE_KEY</code> und installieren Sie dann das SDK mit{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="base" step={1} title="Speichern Sie den Basis-Workspace einmal" />
        <p>
          Jede Sandbox in unserem Beispiel startet vom selben Projekt: der Shop-App, deren 40
          Testdateien noch für den alten Test-Runner geschrieben sind.
        </p>
        <Tree
          root="workspace"
          items={[
            ["package.json"],
            ["src/cart.js"],
            ["tests/t01.test.js", "die erste von 40"],
            ["tests/…"],
            ["tests/t40.test.js"],
          ]}
        />
        <p>
          Wir speichern ihn einmal als Branch namens <code>base</code>. Ein Branch ist eine Folge
          gespeicherter Versionen eines Ordners, wie ein Git-Branch für Dateien. Jedes Speichern ist
          ein Commit.
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
          Der Namespace <code>sandboxes/shop-app</code> enthält die Branches dieses Projekts. Diesen
          Schritt machen Sie einmal, nicht einmal pro Sandbox.
        </p>

        <Chapter id="fork" step={2} title="Geben Sie der Sandbox einen eigenen Branch" />
        <p>
          Startet eine Sandbox, bekommt sie einen eigenen Branch, der nach ihr benannt ist. Wir
          erstellen ihn mit einem <b>Fork</b>: einem neuen Branch, der genau dort beginnt, wo{" "}
          <code>base</code> steht. Ein Fork kopiert nichts, er ist also sofort bereit, egal wie groß
          der Workspace ist.
        </p>
        <Code
          file="new-sandbox.ts"
          code={`
const sandbox = await base.fork("sb-1842");
await sandbox.checkout("./sandbox");
`}
        />
        <p>
          <code>checkout</code> schreibt die Dateien des Branches in einen normalen Ordner auf der
          Festplatte der Sandbox. Der Agent arbeitet dort mit seinen üblichen Tools. Andere
          Sandboxes bekommen eigene Forks und berühren so nie die Dateien der anderen.
        </p>

        <Chapter id="session" step={3} title="Halten Sie fest, wer dort arbeitet" />
        <p>
          Später muss eine neue Maschine eine Sache wissen: Ist die alte Sandbox wirklich weg oder
          nur langsam? Zwei kleine Konzepte beantworten das.
        </p>
        <p>
          Eine <b>Session</b> ist ein Herzschlag. Solange die Sandbox lebt, meldet sie Skywake alle
          20 Sekunden „noch da“. Vergeht eine Minute ohne Meldung, endet die Session. Ein{" "}
          <b>Claim</b> ist eine Notiz am Branch, die sagt, welche Session daran arbeitet. Er endet
          mit der Session.
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
          Der leere Pfad beansprucht den ganzen Branch. Jede weitere Sicherung trägt außerdem die ID
          der Session, sodass der Verlauf zeigt, welche Maschine was getan hat.
        </p>

        <Chapter id="work" step={4} title="Speichern Sie nach jedem Schritt" />
        <p>
          Jetzt der Job selbst. Der Agent geht die Testdateien der Reihe nach durch. Nach jeder
          speichern wir zwei Dateien in einem Commit: den gerade geänderten Test und{" "}
          <code>progress.json</code>, eine winzige Notiz, wie viele Dateien fertig sind.
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
          <code>migrate</code> steht hier für Ihren Agenten: Er schreibt eine Datei an Ort und
          Stelle um. Die Schleife beginnt bei <code>progress.done</code>. Auf einer frischen Sandbox
          startet sie also bei der ersten Datei, nach einem Absturz nach der zuletzt gespeicherten.
        </p>
        <p>
          Entscheidend ist, dass Test und Notiz im <b>selben Commit</b> landen. Ein Commit wird
          vollständig gespeichert oder gar nicht. Die Notiz kann also nie 31 sagen, während erst 29
          Dateien gespeichert sind.
        </p>
        <Note title="Tipp: Jeder Schritt sollte zweimal laufen dürfen">
          <p>
            Fällt die Maschine aus, während der Agent mitten in einer Datei ist, wurde diese Datei
            noch nicht gespeichert. Die neue Maschine macht sie noch einmal. Schreiben Sie Schritte,
            die bei zweifacher Ausführung dasselbe Ergebnis liefern. Dann kostet Sie das einen
            Schritt, keine kaputte Datei.
          </p>
        </Note>

        <Chapter id="resume" step={5} title="Setzen Sie den Job auf einer neuen Maschine fort" />
        <p>
          Angenommen, die Maschine wird nach Datei 31 weggenommen. Ihre Herzschläge hören auf, und
          etwa eine Minute später endet ihre Session und mit ihr der Claim.
        </p>
        <p>
          Eine neue Sandbox startet auf einer anderen Maschine. Erstellen Sie den Client wie in
          Schritt 1 und öffnen Sie dann denselben Branch:
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
          Wir warten, bis niemand den Branch mehr beansprucht, damit nie zwei Maschinen gleichzeitig
          daran arbeiten. Dann holt checkout jede gespeicherte Datei zurück, und{" "}
          <code>progress.json</code> sagt 31.
        </p>
        <p>
          Führen Sie jetzt den Code aus Schritt 3 und 4 unverändert erneut aus. Die neue Maschine
          startet ihre eigene Session, beansprucht den Branch, und die Schleife macht bei Datei 32
          weiter.
        </p>
        <Timeline />

        <Chapter
          id="finish"
          step={6}
          title="Behalten Sie das Ergebnis, verwerfen Sie die Sandbox"
        />
        <p>
          Ist die letzte Datei erledigt, ist der Job fertig. Die Fortschrittsnotiz hat ihren Zweck
          erfüllt, also löschen wir sie. Dann sehen wir uns die Änderungen an und <b>mergen</b> die
          Sandbox in <code>base</code>, wodurch ihre Änderungen in diesen Branch übernommen werden.
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
          Der Diff listet die 40 Tests und sonst nichts. Nach dem Merge startet die nächste Sandbox,
          die <code>base</code> forkt, mit den neuen Tests. Der Branch der Sandbox wird gelöscht,
          und die Maschine kann weggeworfen werden, ohne dass darauf noch etwas verloren gehen kann.
        </p>
        <p>
          Ist das Ergebnis des Jobs nicht für <code>base</code> gedacht, lassen Sie den Merge weg.
          Lesen Sie aus dem Branch, was Sie brauchen, und löschen Sie ihn dann.
        </p>

        <Chapter id="scale" title="Viele Sandboxes betreiben" />
        <p>
          Dieselben Schritte funktionieren für eine Sandbox oder tausend. Ein paar Dinge sollten Sie
          wissen, wenn Sie wachsen:
        </p>
        <ul>
          <li>
            <b>Eine Basis, viele Forks.</b> Jede Sandbox forkt dieselbe Basis. Ein Fork kopiert
            nichts: etwa 95 ms für einen Workspace beliebiger Größe.
          </li>
          <li>
            <b>Gespeichert heißt gespeichert.</b> Wird eine Maschine mit <code>kill -9</code>{" "}
            beendet, gehen keine gespeicherten Schreibvorgänge verloren. Nur der laufende Schritt
            wird wiederholt.
          </li>
          <li>
            <b>Sehen Sie, wer noch lebt.</b> <code>app.sessions()</code> listet die Sandboxes, die
            noch Herzschläge senden. Ein Branch ohne Claim ist frei für eine neue Maschine.
          </li>
          <li>
            <b>Räumen Sie laufend auf.</b> Löschen Sie den Branch jeder Sandbox, wenn ihr Job fertig
            ist. Die Basis bleibt.
          </li>
          <li>
            <b>Alles bleibt bei Ihnen.</b> Jede Sicherung landet in Ihrem eigenen Bucket, nicht auf
            einer Maschine, die Sie für eine Stunde mieten.
          </li>
        </ul>

        <Chapter id="questions" title="Fragen" />
        <Questions
          items={[
            [
              "Was, wenn die Maschine mitten beim Speichern ausfällt?",
              <p key="a">
                Ein Commit wird vollständig gespeichert oder gar nicht. Weil die Datei und ihre
                Fortschrittsnotiz im selben Commit landen, findet die neue Maschine sie immer im
                Einklang vor.
              </p>,
            ],
            [
              "Was ist mit Arbeit, die der Agent erledigt, aber noch nicht gespeichert hat?",
              <p key="a">
                Die geht mit der Maschine verloren, und dieser Schritt läuft erneut. Speichern Sie
                nach jedem Schritt, der echte Zeit gekostet hat, etwa einem Modellaufruf oder einem
                langen Build.
              </p>,
            ],
            [
              "Kann die neue Maschine früher als nach einer Minute starten?",
              <p key="a">
                Ja. Geben Sie beim Start der Session eine kürzere Zeit an, etwa{" "}
                <code>app.startSession(label, 15)</code>, und senden Sie passend dazu häufiger
                Herzschläge, etwa <code>session.keepAlive(5_000)</code>. Die Session endet dann 15
                Sekunden nach dem letzten Herzschlag.
              </p>,
            ],
            [
              "Kann ich einen fehlgeschlagenen Schritt rückgängig machen?",
              <p key="a">
                Ja. Jede Sicherung ist ein Commit, und <code>sandbox.log()</code> listet sie auf.
                Rufen Sie <code>sandbox.reset(commit)</code> auf, um die Dateien auf den Stand
                dieses Commits zurückzusetzen, als neuen Commit obendrauf.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** Das Cover: der Verlauf des Sandbox-Branches, über den Absturz hinweg. */
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

/** Die übliche Sandbox neben unserer: Arbeit auf einer Festplatte, die stirbt, dann laufend gespeicherte Arbeit. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Das übliche Setup</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Sandbox-Festplatte</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Maschine fällt aus
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Neustart bei Datei 1</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Was wir bauen</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Sandbox-Branch</span>
            <span className="t-eyebrow px-1 text-signal">Nach jedem Schritt gespeichert</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Beliebige Maschine, ab Datei 32</span>
        </div>
      </div>
    </figure>
  );
}

/** Die 40 Dateien des Jobs: 31 von der ausgefallenen Maschine gespeichert, der Rest von der nächsten. */
function Timeline() {
  const files = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <figure className="grid gap-4 rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">Ein Job, zwei Maschinen</p>
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
          Dateien 1 bis 31 · von Maschine A gespeichert, bevor sie ausfiel
        </p>
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-signal" />
          <span className="text-foreground">
            Dateien 32 bis 40 · Maschine B, ab der letzten Sicherung
          </span>
        </p>
      </div>
    </figure>
  );
}
