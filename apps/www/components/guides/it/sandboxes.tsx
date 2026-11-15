// Guida: come eseguire job lunghi di un agente su sandbox che possono morire,
// salvando ogni passo appena è fatto e riprendendo il job su una nuova macchina.
// Da leggere dall'inizio alla fine.
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
        name="Storage per agenti e sandbox"
        title={title}
        dek="Una guida passo passo per salvare il lavoro di un agente man mano che procede, così quando una sandbox va in crash, una nuova riprende il job esattamente da dove si era fermato."
        meta={["12 min di lettura", "TypeScript", "Adatta ai principianti"]}
        cover={<SandboxCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Perché le sandbox perdono il lavoro"],
          ["plan", "Cosa costruiamo"],
          ["base", "1. Salva una volta il workspace di base"],
          ["fork", "2. Dai alla sandbox il suo branch"],
          ["session", "3. Indica chi ci sta lavorando"],
          ["work", "4. Salva dopo ogni passo"],
          ["resume", "5. Riprendi il job su una nuova macchina"],
          ["finish", "6. Tieni il risultato, butta la sandbox"],
          ["scale", "Gestire molte sandbox"],
          ["questions", "Domande"],
        ]}
      >
        <Chapter id="start" title="Perché le sandbox perdono il lavoro" />
        <p>
          Le sandbox sono macchine economiche e di breve durata, che puoi buttare via. Ottimo per la
          sicurezza, pessimo per i job lunghi. Tutto ciò che un agente scrive vive sul disco della
          sandbox, e quando la macchina viene ripresa, il disco se ne va con lei. Il job ricomincia
          dall’inizio.{" "}
          <b>Il lavoro era stato fatto. Solo che stava su un disco che non esiste più.</b>
        </p>
        <p>
          Le soluzioni classiche lasciano tutte un buco. Copi i file in un bucket alla fine del job,
          e un crash prima della fine fa perdere comunque tutto. Li carichi ogni pochi minuti, e
          perdi gli ultimi minuti. Peggio ancora, la nota che dice fin dove è arrivato il job può
          andare più avanti dei file davvero salvati, e così la macchina successiva salta del lavoro
          o lo fa due volte.
        </p>
        <TwoSetups />
        <p>
          In questa guida daremo alla sandbox una cartella di lavoro salvata nel tuo bucket, con un
          piccolo salvataggio dopo ogni passo. Ogni salvataggio contiene il file modificato <b>e</b>{" "}
          una nota su fin dove è arrivato il job, insieme. Quando una macchina muore, una nuova apre
          la stessa cartella e prosegue dall’ultimo salvataggio.
        </p>

        <Chapter id="plan" title="Cosa costruiamo" />
        <p>Alla fine avrai:</p>
        <div>
          <Checklist
            items={[
              "Un workspace di base, salvato una volta, da cui parte ogni sandbox.",
              "Un branch per ogni sandbox, così ogni job lavora sulla sua copia.",
              "Un salvataggio dopo ogni passo, con il file e la nota di avanzamento insieme.",
              "Un modo per vedere quale sandbox è viva e quale si è fermata.",
              "Un job andato in crash che riparte dal suo ultimo salvataggio su una nuova macchina.",
            ]}
          />
        </div>
        <p>
          Ti servono una API key di Skywake e Node. Imposta <code>SKYWAKE_URL</code> e{" "}
          <code>SKYWAKE_KEY</code>, poi installa l’SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="base" step={1} title="Salva una volta il workspace di base" />
        <p>
          Nel nostro esempio ogni sandbox parte dallo stesso progetto: l’app del negozio, con i suoi
          40 file di test ancora scritti per il vecchio runner.
        </p>
        <Tree
          root="workspace"
          items={[
            ["package.json"],
            ["src/cart.js"],
            ["tests/t01.test.js", "il primo di 40"],
            ["tests/…"],
            ["tests/t40.test.js"],
          ]}
        />
        <p>
          Lo salviamo una volta, come branch chiamato <code>base</code>. Un branch è una sequenza di
          versioni salvate di una cartella, come un branch di Git per i file. Ogni salvataggio è un
          commit.
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
          Il namespace <code>sandboxes/shop-app</code> contiene i branch di questo progetto. Questo
          passo lo fai una volta sola, non una volta per sandbox.
        </p>

        <Chapter id="fork" step={2} title="Dai alla sandbox il suo branch" />
        <p>
          Quando una sandbox parte, riceve il suo branch, con il suo nome. Lo creiamo con un{" "}
          <b>fork</b>: un nuovo branch che parte esattamente da dove si trova <code>base</code>. Un
          fork non copia nulla, quindi è pronto subito, per quanto grande sia il workspace.
        </p>
        <Code
          file="new-sandbox.ts"
          code={`
const sandbox = await base.fork("sb-1842");
await sandbox.checkout("./sandbox");
`}
        />
        <p>
          <code>checkout</code> scrive i file del branch in una normale cartella sul disco della
          sandbox. L’agente ci lavora con i suoi soliti strumenti. Le altre sandbox ricevono i loro
          fork, quindi non toccano mai i file l’una dell’altra.
        </p>

        <Chapter id="session" step={3} title="Indica chi ci sta lavorando" />
        <p>
          Più avanti, una nuova macchina dovrà sapere una cosa: la vecchia sandbox è davvero morta,
          o è solo lenta? Due piccole idee rispondono a questa domanda.
        </p>
        <p>
          Una <b>sessione</b> è un battito cardiaco. Finché la sandbox è viva, dice a Skywake “sono
          ancora qui” ogni 20 secondi. Se passa un minuto senza segnali, la sessione finisce. Un{" "}
          <b>claim</b> è una nota sul branch che dice quale sessione ci sta lavorando. Finisce
          insieme alla sessione.
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
          Il path vuoto rivendica l’intero branch. Anche ogni salvataggio che facciamo da qui in poi
          porta l’id della sessione, così la cronologia mostra quale macchina ha fatto cosa.
        </p>

        <Chapter id="work" step={4} title="Salva dopo ogni passo" />
        <p>
          Ora il job vero e proprio. L’agente passa i file di test in ordine. Dopo ognuno, salviamo
          due file in un solo commit: il test appena modificato e <code>progress.json</code>, una
          piccola nota che dice quanti file sono fatti.
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
          Qui <code>migrate</code> rappresenta il tuo agente: riscrive un file sul posto. Il ciclo
          parte da <code>progress.done</code>, quindi su una sandbox nuova parte dal primo file, e
          dopo un crash parte da quello dopo l’ultimo salvato.
        </p>
        <p>
          La parte importante è che il test e la nota finiscono nello <b>stesso commit</b>. Un
          commit viene salvato per intero o per niente. Quindi la nota non può mai dire 31 mentre
          sono salvati solo 29 file.
        </p>
        <Note title="Consiglio: rendi ogni passo sicuro da eseguire due volte">
          <p>
            Se la macchina muore mentre l’agente è a metà di un file, quel file non era ancora
            salvato. La nuova macchina lo rifarà. Scrivi passi che danno lo stesso risultato se
            eseguiti due volte, e questo ti costa un passo, non un file rotto.
          </p>
        </Note>

        <Chapter id="resume" step={5} title="Riprendi il job su una nuova macchina" />
        <p>
          Ora immagina che la macchina venga ripresa dopo il file 31. I suoi battiti si fermano, e
          circa un minuto dopo la sua sessione finisce e il claim se ne va con lei.
        </p>
        <p>
          Una nuova sandbox parte su un’altra macchina. Crea il client come nel passo 1, poi apri lo
          stesso branch:
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
          Aspettiamo che nessuno rivendichi il branch, così due macchine non ci lavorano mai
          insieme. Poi il checkout riporta ogni file salvato, e <code>progress.json</code> dice 31.
        </p>
        <p>
          Ora riesegui il codice dei passi 3 e 4, senza modifiche. La nuova macchina avvia la sua
          sessione, rivendica il branch, e il ciclo prosegue dal file 32.
        </p>
        <Timeline />

        <Chapter id="finish" step={6} title="Tieni il risultato, butta la sandbox" />
        <p>
          Quando l’ultimo file è fatto, il job è finito. La nota di avanzamento ha fatto il suo
          lavoro, quindi la cancelliamo. Poi guardiamo cosa è cambiato e facciamo il <b>merge</b>{" "}
          della sandbox in <code>base</code>, che porta le sue modifiche in quel branch.
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
          Il diff elenca i 40 test e nient’altro. Dopo il merge, la prossima sandbox che fa un fork
          di <code>base</code> parte con i nuovi test. Il branch della sandbox viene cancellato, e
          la macchina può essere buttata senza nulla da perdere.
        </p>
        <p>
          Se il risultato del job non è destinato a <code>base</code>, salta il merge. Leggi dal
          branch ciò che ti serve, poi cancellalo.
        </p>

        <Chapter id="scale" title="Gestire molte sandbox" />
        <p>
          Gli stessi passi funzionano per una sandbox o per mille. Qualche cosa da sapere man mano
          che cresci:
        </p>
        <ul>
          <li>
            <b>Una base, tanti fork.</b> Ogni sandbox fa un fork della stessa base. Un fork non
            copia nulla: circa 95 ms per un workspace di qualsiasi dimensione.
          </li>
          <li>
            <b>Salvato vuol dire salvato.</b> Uccidere una macchina con <code>kill -9</code> non fa
            perdere nessuna scrittura salvata. Si riesegue solo il passo in corso.
          </li>
          <li>
            <b>Vedi chi è vivo.</b> <code>app.sessions()</code> elenca le sandbox che inviano ancora
            battiti. Un branch senza claim è libero e una nuova macchina può prenderlo.
          </li>
          <li>
            <b>Fai pulizia strada facendo.</b> Cancella il branch di ogni sandbox quando il suo job
            è finito. La base resta.
          </li>
          <li>
            <b>Tutto resta tuo.</b> Ogni salvataggio finisce nel tuo bucket, non su una macchina che
            affitti per un’ora.
          </li>
        </ul>

        <Chapter id="questions" title="Domande" />
        <Questions
          items={[
            [
              "E se la macchina muore nel mezzo di un salvataggio?",
              <p key="a">
                Un commit viene salvato per intero o per niente. Poiché il file e la sua nota di
                avanzamento vanno nello stesso commit, la nuova macchina li trova sempre allineati.
              </p>,
            ],
            [
              "E il lavoro che l’agente aveva fatto ma non ancora salvato?",
              <p key="a">
                Quello si perde con la macchina, e quel passo viene rieseguito. Salva dopo ogni
                passo che ha richiesto tempo vero, come una chiamata al modello o una build lunga.
              </p>,
            ],
            [
              "La nuova macchina può partire prima di un minuto?",
              <p key="a">
                Sì. Passa un tempo più breve quando avvii la sessione, come{" "}
                <code>app.startSession(label, 15)</code>, e invia i battiti più spesso di
                conseguenza, come <code>session.keepAlive(5_000)</code>. La sessione finisce allora
                15 secondi dopo l’ultimo battito.
              </p>,
            ],
            [
              "Posso annullare un passo andato storto?",
              <p key="a">
                Sì. Ogni salvataggio è un commit, e <code>sandbox.log()</code> li elenca. Chiama{" "}
                <code>sandbox.reset(commit)</code> per riportare i file a come erano a quel commit,
                con un nuovo commit in cima.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** La copertina: la cronologia del branch della sandbox, a cavallo del crash. */
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

/** La sandbox classica accanto alla nostra: lavoro bloccato su un disco che muore, poi lavoro salvato strada facendo. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Il setup classico</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Disco della sandbox</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> La macchina muore
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Si riparte dal file 1</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Cosa costruiamo</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Branch della sandbox</span>
            <span className="t-eyebrow px-1 text-signal">Salvato a ogni passo</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Qualsiasi macchina, dal file 32</span>
        </div>
      </div>
    </figure>
  );
}

/** I 40 file del job: 31 salvati dalla macchina che è morta, gli altri dalla successiva. */
function Timeline() {
  const files = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <figure className="grid gap-4 rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">Un job, due macchine</p>
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
          File da 1 a 31 · salvati dalla macchina A prima di morire
        </p>
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-signal" />
          <span className="text-foreground">
            File da 32 a 40 · macchina B, dall’ultimo salvataggio
          </span>
        </p>
      </div>
    </figure>
  );
}
