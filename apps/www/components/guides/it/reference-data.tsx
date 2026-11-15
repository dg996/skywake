// Guida: come salvare una volta un grande insieme di file di riferimento,
// proteggerlo dalle modifiche e dare a ogni agente su una macchina la stessa copia con un solo download.
import { ArrowRight, File, Lock, X } from "lucide-react";

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

export function ReferenceDataGuide({
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
        name="Dati di riferimento condivisi"
        title={title}
        dek="Una guida passo passo per salvare una volta sola un grande insieme di riferimento, proteggerlo dalle modifiche e dare a ogni agente su una macchina la stessa copia."
        meta={["12 min di lettura", "TypeScript", "Per principianti"]}
        cover={<ReferenceCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Venti agenti, venti download"],
          ["plan", "Cosa costruiamo"],
          ["save", "1. Salva una volta l’insieme di riferimento"],
          ["lock", "2. Rendilo di sola lettura per gli agenti"],
          ["read", "3. Leggi solo la parte che ti serve"],
          ["machine", "4. Una copia per macchina"],
          ["release", "5. Pubblica una nuova release"],
          ["real", "In produzione"],
          ["questions", "Domande"],
        ]}
      >
        <Chapter id="start" title="Venti agenti, venti download" />
        <p>
          Gli agenti che lavorano sugli stessi file grandi, come un genoma di riferimento e il suo
          elenco di geni, scaricano ognuno la propria copia. Ogni agente è un processo a sé, e non
          sa che un altro agente sulla stessa macchina ha già scaricato il file. E un bucket non è
          una cartella: per leggere un file, un agente deve prima scaricarlo. Quando esce una nuova
          release a metà run, i primi agenti tengono i file vecchi e quelli dopo ricevono i nuovi, e
          le loro risposte non concordano più.{" "}
          <b>Venti agenti chiedono gli stessi file, e il bucket li invia venti volte.</b>
        </p>
        <p>
          Le soluzioni classiche portano ognuna un problema nuovo. Metti i file nell’immagine della
          macchina, e devi ricostruire l’immagine a ogni nuova release. Mettili su un disco di rete
          condiviso, e hai un sistema in più da gestire, dove qualsiasi job può modificare un file
          per sbaglio. Scrivi un piccolo script di cache, e devi decidere chi lo aggiorna, quando e
          a quale versione.
        </p>
        <TwoSetups />
        <p>
          In questa guida salviamo l’insieme di riferimento una volta, come una versione che non può
          cambiare sotto i piedi di nessuno. Ogni macchina lo scarica <b>una sola volta</b> in una
          cartella locale, e tutti gli agenti su quella macchina leggono da lì. Quando esce una
          nuova release, le macchine scaricano solo i file cambiati.
        </p>

        <Chapter id="plan" title="Cosa costruiamo" />
        <p>Alla fine avrai:</p>
        <div>
          <Checklist
            items={[
              "L’insieme di riferimento salvato una volta nel tuo bucket, con tutte le release conservate.",
              "Un branch protetto e una chiave di sola lettura, così nessun agente può modificare i file.",
              "Letture di una sola porzione di un file grande, per gli agenti a cui ne serve poco.",
              "Una copia locale per macchina, condivisa da tutti i suoi agenti.",
              "Un modo per pubblicare una nuova release che invia alle macchine solo ciò che è cambiato.",
            ]}
          />
        </div>
        <p>
          Ti servono una API key di Skywake e Node. Imposta <code>SKYWAKE_URL</code> e{" "}
          <code>SKYWAKE_KEY</code>, poi installa l’SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Salva una volta l’insieme di riferimento" />
        <p>
          Parti dalla cartella che già scarichi oggi. La nostra contiene qualche cromosoma e un
          elenco di geni:
        </p>
        <Tree
          root="grch38"
          items={[
            ["chr1.fa", "grande, letto da ogni agente"],
            ["chr2.fa", "quello che cambierà con una patch"],
            ["genes.gtf", "dove si trova ogni gene"],
          ]}
        />
        <p>
          La salviamo in un <b>namespace</b>, cioè un repository di file, su un branch chiamato{" "}
          <code>main</code>. Un branch funziona come un branch di Git, ma per i file: ogni
          salvataggio è un <b>commit</b>, una versione fissa a cui puoi sempre tornare.
        </p>
        <Code
          file="save-refs.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const genome = await sky.createNamespace("refs/genome");
const main = await genome.createBranch("main");
const release = await main.commitFolder("./grch38", {
  message: "GRCh38, first release",
});
`}
        />
        <p>
          <code>commitFolder</code> carica tutti i file e restituisce il nuovo commit. I file grandi
          vengono caricati a pezzi in automatico, quindi non devi dividerli. Tieni{" "}
          <code>release</code>: identifica questa versione esatta dell’insieme, e la useremo di
          nuovo.
        </p>

        <Chapter id="lock" step={2} title="Rendilo di sola lettura per gli agenti" />
        <p>
          I dati di riferimento non devono mai cambiare per sbaglio. Li blocchiamo in due modi.
          Primo, <b>proteggiamo</b> <code>main</code>. Un branch protetto cambia solo con un merge,
          quindi nemmeno un admin può farci commit direttamente.
        </p>
        <p>
          Secondo, diamo agli agenti una chiave tutta loro. Ha il ruolo <code>read</code> e
          raggiunge solo questo namespace.
        </p>
        <Code
          file="lock.ts"
          code={`
await main.protect();

const agents = await sky.keys.create("agents", "read", {
  namespaces: "refs/genome",
});
`}
        />
        <p>
          <code>agents.key</code> viene mostrata solo questa volta, quindi salvala subito come
          secret. Da qui in poi, una scrittura con questa chiave fallisce con “this needs the{" "}
          <code>write</code> role”. Anche un commit diretto su <code>main</code> fallisce, persino
          con una chiave admin.
        </p>
        <Note title="Consiglio: una chiave per ogni uso">
          <p>
            Dai agli agenti la chiave di lettura e nient’altro. Tieni la chiave che pubblica le
            release nel tuo script di release. Se la chiave di un agente finisse in giro, il peggio
            che potrebbe fare è leggere.
          </p>
        </Note>

        <Chapter id="read" step={3} title="Leggi solo la parte che ti serve" />
        <p>
          Ogni agente si connette con la chiave di lettura. La mettiamo in un piccolo file, così il
          codice dell’agente resta breve:
        </p>
        <Code
          file="refs.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.AGENT_KEY!,
});

export const refs = sky.namespace("refs/genome").branch("main");
`}
        />
        <p>
          Ad alcuni agenti serve solo un piccolo pezzo di un file grande: un gene, una regione. Non
          hanno bisogno dell’intero cromosoma. Una <b>lettura per intervallo</b> chiede solo quei
          byte, così l’agente può mettersi subito al lavoro.
        </p>
        <Code
          file="read.ts"
          code={`
import { refs } from "./refs.ts";

const release = process.env.REFS_RELEASE!;

// Only the bytes this agent needs, at the agreed release.
const piece = await refs.read("chr1.fa", {
  offset: 120_000,
  length: 600,
  at: release,
});
`}
        />
        <p>
          La riga <code>at</code> fissa la lettura sulla prima release. Anche se esce una nuova
          release mentre l’agente gira, continua a leggere la stessa versione. Tutti gli agenti
          avviati con lo stesso <code>REFS_RELEASE</code> vedono esattamente gli stessi byte.
        </p>

        <Chapter id="machine" step={4} title="Una copia per macchina" />
        <p>
          La maggior parte degli agenti legge gran parte dell’insieme, ancora e ancora. Per loro, il
          posto migliore per i file è il disco della macchina. Scarichiamo l’insieme una volta per
          macchina, in una sola cartella, e facciamo puntare tutti gli agenti lì.
        </p>
        <p>
          Il lavoro lo fa <code>syncRefs</code>. Su una macchina nuova fa checkout dell’intero
          insieme. Scrive il commit ottenuto in un piccolo file <code>.release</code>. La volta
          dopo, se quel commit è ancora il più recente, non fa niente.
        </p>
        <Code
          file="sync-refs.ts"
          code={`
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { refs } from "./refs.ts";

export const REFS = process.env.REFS_DIR ?? "/srv/refs";

export async function syncRefs(dir = REFS) {
  const mark = join(dir, ".release");
  const have = await readFile(mark, "utf8").catch(() => "");
  const { head } = await refs.info();
  if (have === head) return;

  if (!have) {
    await refs.checkout(dir, { at: head });
  } else {
    // Only the files that changed since this machine's release.
    const changed = new Map<string, string>();
    for (const commit of await refs.changes(have)) {
      for (const change of commit.changes) {
        changed.set(change.path, change.kind);
      }
    }
    for (const [path, kind] of changed) {
      const file = join(dir, path);
      await rm(file, { force: true });
      if (kind === "removed") continue;
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, await refs.readStream(path, { at: head }));
    }
  }
  await writeFile(mark, head);
}
`}
        />
        <p>
          Eseguilo una volta all’avvio della macchina, prima di qualsiasi agente. Poi ogni agente
          legge file normali dalla cartella, senza passare dalla rete:
        </p>
        <Code
          file="start.ts"
          code={`
import { syncRefs } from "./sync-refs.ts";

// Once when the machine starts, before any agent runs.
await syncRefs();
`}
        />
        <Code
          file="agent.ts"
          code={`
import { readFile } from "node:fs/promises";
import { REFS } from "./sync-refs.ts";

const genes = await readFile(\`\${REFS}/genes.gtf\`, "utf8");
`}
        />
        <p>
          Ecco spariti i venti download. Partono venti agenti, e la macchina ha già scaricato
          l’insieme una volta. Riavvia la macchina domani e <code>syncRefs</code> vede la stessa
          release e non scarica niente.
        </p>

        <Chapter id="release" step={5} title="Pubblica una nuova release" />
        <p>
          Esce una patch per il cromosoma 2, con un nuovo file per il cromosoma Y. Ricorda,{" "}
          <code>main</code> cambia solo con un merge. Quindi prima ne facciamo <b>fork</b>: un fork
          è un nuovo branch che nasce come copia esatta, e non copia dati.
        </p>
        <p>
          Salviamo la nuova cartella sul fork, poi facciamo <b>merge</b> su <code>main</code>. Un
          merge porta le modifiche del fork su <code>main</code> come un unico nuovo commit.
        </p>
        <Code
          file="release.ts"
          code={`
const next = await main.fork("next");
await next.commitFolder("./grch38-p2", { message: "GRCh38 patch 2" });

const merged = await next.mergeInto("main");
if (merged.conflicts.length === 0) await next.delete();
`}
        />
        <p>
          Abbiamo inviato l’intera nuova cartella, ma Skywake registra solo i file diversi:{" "}
          <code>chr2.fa</code> è cambiato e <code>chrY.fa</code> è nuovo. La prossima volta che una
          macchina esegue <code>syncRefs</code>, chiede le modifiche dal suo <code>.release</code> e
          scarica solo quei due file:
        </p>
        <ReleaseUpdate />
        <p>
          Gli agenti fissati sulla prima release con <code>at</code> leggono ancora il vecchio{" "}
          <code>chr2.fa</code>. Ogni release resta nella storia, quindi niente di ciò da cui
          dipendono sparisce.
        </p>

        <Chapter id="real" title="In produzione" />
        <p>
          I passi sopra sono tutto quello che serve. Alcune cose aiutano quando li usano tante
          macchine:
        </p>
        <ul>
          <li>
            <b>Ogni macchina scarica una volta.</b> Una macchina nuova scarica l’insieme completo al
            primo avvio. Dopo, scarica solo ciò che una release ha cambiato, per quanti agenti
            faccia girare.
          </li>
          <li>
            <b>Aggiorna tra un job e l’altro.</b> <code>syncRefs</code> sostituisce sul posto i file
            cambiati. Se i tuoi agenti non si fermano mai, sincronizza in una nuova cartella con il
            nome della release, poi sposta lì gli agenti.
          </li>
          <li>
            <b>Gli agenti altrove leggono porzioni.</b> Un agente in una sandbox di breve durata non
            ha una copia locale da condividere. Dagli la chiave di lettura e fagli usare le letture
            per intervallo, come al passo 3.
          </li>
          <li>
            <b>Ogni risposta ha una versione.</b> Registra il commit di <code>.release</code>{" "}
            accanto a ogni risultato. Settimane dopo, puoi leggere i file esatti da cui viene quella
            risposta.
          </li>
          <li>
            <b>Tutto resta tuo.</b> I file vivono nel tuo bucket. Non c’è nessun disco di rete o
            server in più da gestire.
          </li>
        </ul>

        <Chapter id="questions" title="Domande" />
        <Questions
          items={[
            [
              "Un agente può modificare per sbaglio i file di riferimento?",
              <p key="a">
                Non tramite Skywake. La sua chiave ha il ruolo read, quindi ogni scrittura fallisce.
                E <code>main</code> è protetto, quindi anche una chiave che può scrivere deve
                passare da un merge.
              </p>,
            ],
            [
              "Una nuova release ricarica tutto da capo?",
              <p key="a">
                <code>commitFolder</code> invia l’intera cartella, ma contano come modifiche solo i
                file diversi. Le macchine scaricano solo quelli.
              </p>,
            ],
            [
              "Come torno a una release precedente?",
              <p key="a">
                Ogni release è un commit, e i commit restano. Leggi qualsiasi file con{" "}
                <code>at</code> impostato sulla release che vuoi, oppure fai checkout di quel commit
                in una cartella a parte.
              </p>,
            ],
            [
              "E se un file è più grande della memoria della macchina?",
              <p key="a">
                Il checkout e <code>readStream</code> scrivono i file su disco in streaming, quindi
                un file non deve mai stare tutto in memoria.
              </p>,
            ],
            [
              "E se una release aggiunge o rimuove intere cartelle?",
              <p key="a">
                <code>syncRefs</code> gestisce le modifiche ai singoli file, che è il modo in cui
                cambia la maggior parte delle release di riferimento. Per un riordino più grande,
                fai invece checkout della nuova release in una cartella nuova.
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

/** La copertina: la cartella condivisa su una macchina, di sola lettura, letta da ogni agente. */
function ReferenceCover() {
  const files = ["chr1.fa", "chr2.fa", "chrY.fa", "genes.gtf"];
  return (
    <div className="grid">
      <div className={ROW}>
        <Lock className="size-3.5 text-muted-foreground" />
        <span className={MONO}>/srv/refs</span>
        <span className="ml-auto text-[12px] text-muted-foreground">Read-only</span>
      </div>
      {files.map((name) => (
        <div key={name} className={`${ROW} pl-6`}>
          <File className="size-3.5 text-muted-foreground" />
          <span className={MONO}>{name}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 pt-3 text-[12px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-signal" />
        Downloaded once · read by 20 agents
      </div>
    </div>
  );
}

/** La soluzione di oggi accanto a quella che costruiamo: venti download, poi uno. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">La soluzione classica</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> 20 download
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agenti</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Cosa costruiamo</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>1 download</span>
            <span className={box}>/srv/refs</span>
            <span className="t-eyebrow px-1 text-signal">Una macchina</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agenti</span>
        </div>
      </div>
    </figure>
  );
}

/** Cosa fa una macchina quando esce la patch 2: due file scaricati, il resto tenuto. */
function ReleaseUpdate() {
  const rows: [name: string, what: string, fetched: boolean][] = [
    ["chr1.fa", "Tenuto", false],
    ["chr2.fa", "Scaricato · cambiato", true],
    ["chrY.fa", "Scaricato · nuovo", true],
    ["genes.gtf", "Tenuto", false],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">syncRefs dopo la patch 2</p>
      <ul className="mt-3 grid divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {rows.map(([name, what, fetched]) => (
          <li key={name} className="t-small flex items-center gap-3 px-4 py-2.5">
            <span className={`${MONO} text-foreground`}>{name}</span>
            <span className={`ml-auto ${fetched ? "text-signal" : "text-muted-foreground"}`}>
              {what}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
