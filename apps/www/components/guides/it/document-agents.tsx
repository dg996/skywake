// Guida: come far modificare a un agente documenti reali sulla sua copia, leggere
// ogni modifica che ha fatto, e far arrivare alla cartella vera solo ciò che approvi.
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
        name="Agenti per documenti"
        title={title}
        dek="Una guida passo passo per dare a un agente la sua copia dei file di un cliente, leggere tutto ciò che ha cambiato e far arrivare alla cartella vera solo ciò che approvi."
        meta={["12 min di lettura", "TypeScript", "Adatta ai principianti"]}
        cover={<ReviewCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Una riga sbagliata nel libro contabile"],
          ["plan", "Cosa costruiamo"],
          ["save", "1. Salva la cartella e bloccala"],
          ["copy", "2. Dai all’agente la sua copia"],
          ["tools", "3. Dagli strumenti che scrivono sulla copia"],
          ["review", "4. Leggi cosa ha cambiato"],
          ["approve", "5. Correggi una riga, approva il resto"],
          ["record", "6. Conserva la traccia, annulla se serve"],
          ["scale", "Farlo per ogni cliente"],
          ["questions", "Domande"],
        ]}
      >
        <Chapter id="start" title="Una riga sbagliata nel libro contabile" />
        <p>
          Di solito gli agenti ricevono lo stesso accesso delle persone: la cartella vera, con il
          permesso di scrivere. Non c’è una bozza e nessun “sei sicuro?”. Qualunque cosa l’agente
          salvi diventa la nuova verità, e dopo è difficile capire quali righe ha toccato. Un
          piccolo errore, come una riparazione registrata come attrezzatura nuova, finisce nel
          report successivo prima che qualcuno se ne accorga.{" "}
          <b>L’errore è piccolo. Il setup non dà a nessuno la possibilità di accorgersene.</b>
        </p>
        <p>
          Le soluzioni classiche hanno tutte un costo. Puoi copiare la cartella prima di ogni run,
          ma le cartelle dei clienti sono grandi, le copie si accumulano e qualcuno deve comunque
          riportare a mano le modifiche buone. Oppure puoi lasciare che l’agente si limiti a
          proporre modifiche e inserirle tu. È sicuro, ma ora il lavoro lo stai rifacendo tu.{" "}
          <b>Finisce per essere tutto o niente:</b> ti fidi completamente dell’agente, oppure non lo
          usi.
        </p>
        <TwoSetups />
        <p>
          In questa guida faremo il contrario. La cartella vera del cliente è bloccata. L’agente
          lavora sulla sua copia, che non costa nulla da creare, e ogni salvataggio che fa viene
          registrato con un motivo. Tu leggi le modifiche, correggi ciò che è sbagliato e approvi.
          Nient’altro può arrivare ai file veri.
        </p>

        <Chapter id="plan" title="Cosa costruiamo" />
        <p>Alla fine avrai:</p>
        <div>
          <Checklist
            items={[
              "La cartella di un cliente salvata e bloccata, così nemmeno il tuo codice può modificarla direttamente.",
              "Una chiave per l’agente che raggiunge solo quel cliente.",
              "Una copia privata per ogni run dell’agente, pronta in 10 ms.",
              "Un elenco chiaro di cosa ha cambiato l’agente, commit per commit e riga per riga.",
              "Un unico passo di approvazione che solo tu puoi fare, e un modo per annullarlo in seguito.",
            ]}
          />
        </div>
        <p>
          Ti servono una API key di Skywake con ruolo admin e Node. Imposta <code>SKYWAKE_URL</code>{" "}
          e <code>SKYWAKE_KEY</code>, poi installa l’SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Salva la cartella e bloccala" />
        <p>
          Come esempio usiamo la contabilità di Acme Bakery, un piccolo cliente. È una cartella
          piccola: un libro contabile, le fatture del trimestre e una nota del commercialista.
        </p>
        <Tree
          root="acme-books"
          items={[
            ["ledger.csv", "il file che l’agente modificherà"],
            ["invoices/millers-flour-0711.txt"],
            ["invoices/coldchain-0802.txt"],
            ["invoices/oven-repair-0915.txt", "quella che sbaglierà"],
            ["notes.md", "“le piccole riparazioni vanno in Repairs”"],
          ]}
        />
        <p>
          Ogni cliente ha il suo namespace, un repository di file. Al suo interno salviamo la
          cartella come branch chiamato <code>main</code>. Un branch è una sequenza di versioni
          salvate, come un branch di Git. Ogni salvataggio è un commit, e ogni commit viene
          conservato.
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
          <code>start</code> è il commit che abbiamo appena fatto. Conservalo: segna il punto da cui
          è partito l’agente. L’ultima riga è quella importante. Un branch protetto cambia{" "}
          <b>solo tramite merge</b>, quindi anche una scrittura diretta con la tua chiave admin
          viene rifiutata:
        </p>
        <Code
          file="output"
          code={`
branch \`main\` is protected; change it with a merge
`}
        />

        <Chapter id="copy" step={2} title="Dai all’agente la sua copia" />
        <p>
          L’agente non dovrebbe usare la tua chiave. Gliene creiamo una tutta sua, con il ruolo{" "}
          <b>write</b>, solo per questo cliente, che scade tra una settimana.
        </p>
        <p>
          Poi l’agente fa un fork di <code>main</code>. Un fork è un nuovo branch che parte
          esattamente da dove si trova quello vecchio. Non copia nulla, quindi è pronto subito,
          qualunque sia la dimensione della cartella.
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
          Ora l’agente ha <code>agent/q3-books</code>, una copia completa della contabilità di Acme.
          Con la sua chiave può leggere e scrivere quella copia. Non può scrivere su{" "}
          <code>main</code>, e se prova ad aprire la cartella di un altro cliente, la risposta è{" "}
          <code>no access</code>.
        </p>

        <Chapter id="tools" step={3} title="Dagli strumenti che scrivono sulla copia" />
        <p>
          Il tuo agente lavora tramite strumenti: piccole funzioni che il modello può chiamare.
          Gliene diamo tre. Può elencare i file, leggerne uno e scriverne uno. Ogni strumento punta
          a <code>work</code>, quindi non ha modo di raggiungere la cartella vera.
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
          Guarda <code>write</code>. Chiede all’agente un <b>motivo</b>, e quel motivo diventa il
          messaggio del commit. Così ogni modifica arriva con le parole dell’agente stesso sul
          perché l’ha fatta.
        </p>
        <Note title="Consiglio: chiedi una modifica per ogni scrittura">
          <p>
            Nel prompt, chiedi all’agente di fare una modifica per ogni scrittura e di spiegarla in
            una frase breve. Commit piccoli con motivi chiari sono molto più facili da rivedere di
            un unico grande salvataggio alla fine.
          </p>
        </Note>
        <p>
          Ora passa gli strumenti al tuo modello e lascialo lavorare. Nel nostro run, l’agente ha
          aggiunto tre righe a <code>ledger.csv</code>, una per fattura, e ha scritto un nuovo file,{" "}
          <code>q3-summary.md</code>. Sono due commit sulla sua copia. <code>main</code> non è
          cambiato per niente.
        </p>

        <Chapter id="review" step={4} title="Leggi cosa ha cambiato" />
        <p>
          Il run è finito. Ora tocca a te, con la tua chiave. Prima di tutto, la storia del run:
          cosa ha cambiato ogni commit da <code>start</code> in poi, in ordine.
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
          <code>changes</code> elenca i commit uno per uno. <code>diff</code> ne dà la somma: ogni
          file che l’agente ha aggiunto, rimosso o modificato, rispetto al punto in cui è iniziata
          la sua copia.
        </p>
        <RunLog />
        <p>
          Il riassunto è nuovo, quindi puoi semplicemente leggerlo. Il libro contabile è stato
          modificato, quindi vuoi vedere le righe esatte. Leggi il file su entrambi i branch e tieni
          le righe nuove:
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
          <code>added</code> contiene le tre nuove righe. Due sono giuste. La terza registra la
          riparazione del forno come <code>Equipment</code>, anche se le note di Acme dicono che le
          piccole riparazioni vanno in <code>Repairs</code>.
        </p>

        <Chapter id="approve" step={5} title="Correggi una riga, approva il resto" />
        <p>
          Non devi buttare via il run per una riga sbagliata. Correggila sulla copia dell’agente,
          con un altro commit e un tuo motivo. Poi fai merge: porta le modifiche della copia in{" "}
          <code>main</code>.
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
          Il dry run non salva nulla. Ti dice solo se il merge andrebbe in conflitto con qualcosa
          che nel frattempo è cambiato su <code>main</code>. Qui è tutto pulito, quindi il merge
          vero entra: il libro contabile su <code>main</code> ora ha tutte e tre le righe, con la
          tua correzione, e c’è anche il riassunto.
        </p>
        <ReviewedLines />
        <p>
          C’è un’altra cosa che rende tutto sicuro. Fare merge in un branch protetto richiede il
          ruolo <b>admin</b>. Se l’agente prova a fare merge della sua copia, riceve{" "}
          <code>this needs the `admin` role</code>. L’agente può fare il lavoro. Solo tu puoi
          approvarlo.
        </p>

        <Chapter id="record" step={6} title="Conserva la traccia, annulla se serve" />
        <p>
          Settimane dopo, un cliente chiede perché la riparazione del forno sta sotto Repairs. Ogni
          versione del libro contabile viene conservata, con il messaggio che l’ha creata:
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
          La versione più recente è <code>Approve Q3 books</code>, e prima di quella{" "}
          <code>Acme books before the Q3 close</code>. L’approvazione è un merge commit, e registra
          quale commit ha portato dentro.
        </p>
        <p>
          Hai cambiato idea dopo aver approvato? <code>main</code> cambia ancora solo tramite merge,
          quindi annulla allo stesso modo: fai un fork, fai il revert dell’approvazione sul fork e
          fai merge del risultato. Un revert è un nuovo commit che rimette com’era ciò che un commit
          vecchio aveva cambiato.
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
          Il libro contabile torna com’era prima del run, e anche l’annullamento resta nella
          cronologia. E se un run non ti piace per niente, non ti serve nulla di tutto questo.
          Cancella il suo branch, e <code>main</code> non l’ha mai visto:
        </p>
        <Code
          file="reject.ts"
          code={`
await acme.branch("agent/q4-draft").delete();
`}
        />

        <Chapter id="scale" title="Farlo per ogni cliente" />
        <p>
          Un cliente è il caso facile. Qualche cosa da sapere quando arrivi a centinaia di clienti e
          a molti run al giorno:
        </p>
        <ul>
          <li>
            <b>Un namespace per cliente.</b> Chiamali <code>clients/acme</code>,{" "}
            <code>clients/globex</code>, e dai a ogni agente una chiave solo per il cliente su cui
            lavora.
          </li>
          <li>
            <b>Le copie restano istantanee.</b> Un fork non copia nulla, quindi una copia di 20.000
            file è pronta in circa 10 ms.
          </li>
          <li>
            <b>Chiavi di breve durata.</b> Fai scadere la chiave dell’agente poco dopo il job, così
            una chiave vecchia non può essere usata per il job successivo.
          </li>
          <li>
            <b>Fai ordine nei branch.</b> Cancella il branch di un run quando ne hai fatto merge o
            l’hai scartato. <code>main</code> conserva la sua cronologia, approvazione compresa.
          </li>
          <li>
            <b>Tutto resta tuo.</b> Ogni versione di ogni file sta nel tuo bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Domande" />
        <Questions
          items={[
            [
              "L’agente può approvare il proprio lavoro?",
              <p key="a">
                No. La sua chiave ha il ruolo write, e fare merge in un branch protetto richiede il
                ruolo admin. L’agente può modificare solo la sua copia.
              </p>,
            ],
            [
              "E se due run cambiano lo stesso file?",
              <p key="a">
                Il primo merge entra. Il dry run del secondo indica il file in conflitto, e non
                viene salvato nulla. Leggi entrambe le versioni, poi rifai il merge con{" "}
                <code>resolve</code>, scegliendo una delle due o scrivendo tu il testo.
              </p>,
            ],
            [
              "Un agente può vedere i file di un altro cliente?",
              <p key="a">
                No, se limiti la sua chiave. Una chiave creata per <code>clients/acme</code> riceve
                “accesso negato” su ogni altro namespace.
              </p>,
            ],
            [
              "Perché una nuova cartella compare come una sola modifica?",
              <p key="a">
                Un diff elenca una cartella nuova o rimossa una volta sola, non una volta per ogni
                file al suo interno. Usa <code>walk</code> sul branch dell’agente per vedere ogni
                file che contiene.
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

/** La copertina: il run di un agente in attesa di revisione, file per file. */
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

/** Il setup di oggi accanto a questo: l’agente scrive i file veri, oppure scrive una copia che approvi tu. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Il setup classico</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Scrive direttamente
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>I file veri del cliente</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Cosa costruiamo</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>La sua copia</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 text-signal">
            <Check className="size-3.5" /> Approvi tu
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={`${box} flex items-center gap-1.5`}>
            <Lock className="size-3.5 text-muted-foreground" /> I file veri del cliente
          </span>
        </div>
      </div>
    </figure>
  );
}

/** Il run dell’agente come lo vede per primo chi revisiona: ogni commit, il suo motivo e il suo file. */
function RunLog() {
  const commits = [
    ["Book 3 supplier invoices for Q3", "ledger.csv", "modified"],
    ["Write the Q3 summary", "q3-summary.md", "added"],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">agent/q3-books, da start</p>
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

/** Le righe del libro contabile aggiunte dall’agente, con quella che hai corretto prima di approvare. */
function ReviewedLines() {
  const line = "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-[12px]";
  return (
    <figure className="grid gap-2 rounded-xl border border-border p-5">
      <p className="t-eyebrow mb-1 text-muted-foreground">
        ledger.csv su main, dopo l’approvazione
      </p>
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
        Corretta da te · approvata con un solo merge
      </span>
    </figure>
  );
}
