// Guía: cómo guardar una vez un conjunto grande de archivos de referencia,
// protegerlo de cambios y darles a todos los agentes de una máquina la misma
// copia con una sola descarga.
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
        name="Datos de referencia compartidos"
        title={title}
        dek="Una guía paso a paso para guardar una sola vez un conjunto de referencia grande, protegerlo de cambios y darles a todos los agentes de una máquina la misma copia."
        meta={["12 min de lectura", "TypeScript", "Apta para principiantes"]}
        cover={<ReferenceCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Veinte agentes, veinte descargas"],
          ["plan", "Qué vamos a construir"],
          ["save", "1. Guarda el conjunto de referencia una vez"],
          ["lock", "2. Hazlo de solo lectura para los agentes"],
          ["read", "3. Lee solo la parte que necesitas"],
          ["machine", "4. Una copia por máquina"],
          ["release", "5. Publica una nueva versión"],
          ["real", "En producción"],
          ["questions", "Preguntas"],
        ]}
      >
        <Chapter id="start" title="Veinte agentes, veinte descargas" />
        <p>
          Los agentes que trabajan con los mismos archivos grandes, como un genoma de referencia y
          su lista de genes, descargan cada uno su propia copia. Cada agente es un proceso aparte,
          sin saber que otro agente de la misma máquina ya descargó el archivo. Y un bucket no es
          una carpeta: para leer un archivo, el agente primero tiene que descargarlo. Cuando llega
          una versión nueva a mitad de una ejecución, los primeros agentes se quedan con los
          archivos antiguos y los siguientes reciben los nuevos, y sus respuestas dejan de
          coincidir.{" "}
          <b>Veinte agentes piden los mismos archivos, y el bucket los envía veinte veces.</b>
        </p>
        <p>
          Cada solución habitual trae un problema nuevo. Si metes los archivos en la imagen de la
          máquina, tienes que reconstruir la imagen con cada versión nueva. Si los pones en una
          unidad de red compartida, mantienes un sistema más, donde cualquier job puede cambiar un
          archivo por error. Si escribes un pequeño script de caché, tienes que decidir quién lo
          actualiza, cuándo y a qué versión.
        </p>
        <TwoSetups />
        <p>
          En esta guía guardaremos el conjunto de referencia una vez, como una versión que no puede
          cambiar bajo los pies de nadie. Cada máquina lo descarga <b>una sola vez</b> en una
          carpeta local, y todos los agentes de esa máquina leen de ahí. Cuando sale una versión
          nueva, las máquinas descargan solo los archivos que cambiaron.
        </p>

        <Chapter id="plan" title="Qué vamos a construir" />
        <p>Al final, tendrás:</p>
        <div>
          <Checklist
            items={[
              "El conjunto de referencia guardado una vez en tu propio bucket, con todas sus versiones.",
              "Una rama protegida y una key de solo lectura, para que ningún agente pueda cambiar los archivos.",
              "Lecturas de solo un trozo de un archivo grande, para los agentes que necesitan poco.",
              "Una copia local por máquina, compartida por todos sus agentes.",
              "Una forma de publicar una versión nueva que envía a las máquinas solo lo que cambió.",
            ]}
          />
        </div>
        <p>
          Necesitarás una API key de Skywake y Node. Define <code>SKYWAKE_URL</code> y{" "}
          <code>SKYWAKE_KEY</code>, y luego instala el SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Guarda el conjunto de referencia una vez" />
        <p>
          Empieza por la carpeta que ya descargas hoy. La nuestra contiene algunos cromosomas y una
          lista de genes:
        </p>
        <Tree
          root="grch38"
          items={[
            ["chr1.fa", "grande, lo leen todos los agentes"],
            ["chr2.fa", "el que cambiará un parche"],
            ["genes.gtf", "dónde está cada gen"],
          ]}
        />
        <p>
          Lo guardaremos en un <b>namespace</b>, que es un repositorio de archivos, en una rama
          llamada <code>main</code>. Una rama funciona como una rama de Git para archivos: cada
          guardado es un <b>commit</b>, una versión fija a la que siempre puedes volver.
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
          <code>commitFolder</code> sube todos los archivos y devuelve el commit nuevo. Los archivos
          grandes se suben por partes automáticamente, así que no tienes que dividirlos. Guarda{" "}
          <code>release</code>: identifica esta versión exacta del conjunto, y la volveremos a usar.
        </p>

        <Chapter id="lock" step={2} title="Hazlo de solo lectura para los agentes" />
        <p>
          Los datos de referencia nunca deberían cambiar por accidente. Los bloquearemos de dos
          formas. Primero, <b>protegemos</b> <code>main</code>. Una rama protegida solo cambia con
          un merge, así que ni siquiera un administrador puede hacer commit directamente en ella.
        </p>
        <p>
          Segundo, les damos a los agentes su propia key. Tiene el rol <code>read</code> y solo
          llega a este namespace.
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
          <code>agents.key</code> se muestra solo esta vez, así que guárdala como secreto enseguida.
          A partir de ahora, una escritura con esta key falla con “this needs the <code>write</code>{" "}
          role”. Un commit directo en <code>main</code> también falla, incluso con una key de
          administrador.
        </p>
        <Note title="Consejo: una key para cada uso">
          <p>
            Dales a los agentes la key de lectura y nada más. Deja la key que publica versiones en
            tu script de publicación. Si la key de un agente se filtra, lo peor que puede hacer es
            leer.
          </p>
        </Note>

        <Chapter id="read" step={3} title="Lee solo la parte que necesitas" />
        <p>
          Todos los agentes se conectan con la key de lectura. Lo pondremos en un pequeño archivo,
          para que el código del agente sea corto:
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
          Algunos agentes solo necesitan un trozo pequeño de un archivo grande: un gen, una región.
          No necesitan el cromosoma entero. Una <b>lectura por rango</b> pide solo esos bytes, así
          que el agente puede empezar a trabajar enseguida.
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
          La línea <code>at</code> fija la lectura a la primera versión. Aunque llegue una versión
          nueva mientras el agente se ejecuta, sigue leyendo la misma. Todos los agentes que
          arranques con el mismo <code>REFS_RELEASE</code> ven exactamente los mismos bytes.
        </p>

        <Chapter id="machine" step={4} title="Una copia por máquina" />
        <p>
          La mayoría de los agentes leen gran parte del conjunto, una y otra vez. Para ellos, el
          mejor sitio para los archivos es el propio disco de la máquina. Descargaremos el conjunto
          una vez por máquina, en una carpeta, y haremos que todos los agentes lean de ella.
        </p>
        <p>
          <code>syncRefs</code> hace el trabajo. En una máquina nueva, hace checkout del conjunto
          completo. Escribe el commit que obtuvo en un pequeño archivo <code>.release</code>. La
          próxima vez, si ese commit sigue siendo el más reciente, no hace nada.
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
          Ejecútalo una vez cuando arranca la máquina, antes que cualquier agente. Después, cada
          agente lee archivos normales de la carpeta, sin tocar la red:
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
          Adiós a las veinte descargas. Arrancan veinte agentes, y la máquina ya ha descargado el
          conjunto una vez. Arranca la máquina otra vez mañana y <code>syncRefs</code> ve la misma
          versión y no descarga nada.
        </p>

        <Chapter id="release" step={5} title="Publica una nueva versión" />
        <p>
          Sale un parche para el cromosoma 2, con un archivo nuevo para el cromosoma Y. Recuerda:{" "}
          <code>main</code> solo cambia con un merge. Así que primero hacemos <b>fork</b>: un fork
          es una rama nueva que empieza como una copia exacta, y no copia datos.
        </p>
        <p>
          Guardamos la carpeta nueva en el fork y luego la <b>fusionamos</b> en <code>main</code>.
          Un merge lleva los cambios del fork a <code>main</code> como un único commit nuevo.
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
          Enviamos la carpeta nueva entera, pero Skywake solo registra los archivos que difieren:{" "}
          <code>chr2.fa</code> cambió y <code>chrY.fa</code> es nuevo. La próxima vez que una
          máquina ejecute <code>syncRefs</code>, pedirá los cambios desde su <code>.release</code> y
          descargará solo esos dos archivos:
        </p>
        <ReleaseUpdate />
        <p>
          Los agentes fijados a la primera versión con <code>at</code> siguen leyendo el antiguo{" "}
          <code>chr2.fa</code>. Todas las versiones se quedan en el historial, así que no desaparece
          nada de lo que dependen.
        </p>

        <Chapter id="real" title="En producción" />
        <p>
          Los pasos anteriores son todo lo que necesitas. Algunas cosas ayudan cuando muchas
          máquinas los usan:
        </p>
        <ul>
          <li>
            <b>Cada máquina descarga una vez.</b> Una máquina nueva descarga el conjunto completo al
            arrancar por primera vez. Después, solo descarga lo que cambió una versión, ejecute los
            agentes que ejecute.
          </li>
          <li>
            <b>Actualiza entre jobs.</b> <code>syncRefs</code> sustituye los archivos cambiados en
            el sitio. Si tus agentes nunca se detienen, sincroniza en una carpeta nueva con el
            nombre de la versión y luego mueve los agentes a ella.
          </li>
          <li>
            <b>Los agentes de fuera leen trozos.</b> Un agente en un sandbox de vida corta no tiene
            una copia local que compartir. Dale la key de lectura y deja que use lecturas por rango,
            como en el paso 3.
          </li>
          <li>
            <b>Cada respuesta tiene una versión.</b> Registra el commit de <code>.release</code>{" "}
            junto a cada resultado. Semanas después, puedes leer los archivos exactos de los que
            salió esa respuesta.
          </li>
          <li>
            <b>Todo sigue siendo tuyo.</b> Los archivos viven en tu propio bucket. No hay unidad de
            red ni servidor extra que mantener.
          </li>
        </ul>

        <Chapter id="questions" title="Preguntas" />
        <Questions
          items={[
            [
              "¿Puede un agente cambiar los archivos de referencia por error?",
              <p key="a">
                No a través de Skywake. Su key tiene el rol de lectura, así que toda escritura
                falla. Y <code>main</code> está protegida, así que incluso una key que puede
                escribir tiene que pasar por un merge.
              </p>,
            ],
            [
              "¿Una versión nueva vuelve a subirlo todo?",
              <p key="a">
                <code>commitFolder</code> envía la carpeta entera, pero solo cuentan como cambios
                los archivos que difieren. Las máquinas descargan solo esos.
              </p>,
            ],
            [
              "¿Cómo vuelvo a una versión anterior?",
              <p key="a">
                Cada versión es un commit, y los commits se conservan. Lee cualquier archivo con{" "}
                <code>at</code> apuntando a la versión que quieras, o haz checkout de ese commit en
                su propia carpeta.
              </p>,
            ],
            [
              "¿Y si un archivo es más grande que la memoria de la máquina?",
              <p key="a">
                Checkout y <code>readStream</code> escriben los archivos a disco por streaming, así
                que un archivo nunca tiene que caber entero en memoria.
              </p>,
            ],
            [
              "¿Y si una versión añade o quita carpetas enteras?",
              <p key="a">
                <code>syncRefs</code> gestiona cambios en archivos sueltos, que es como cambian la
                mayoría de las versiones de referencia. Para una reorganización mayor, haz checkout
                de la versión nueva en una carpeta limpia.
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

/** The cover: the shared folder on one machine, read-only, read by every agent. */
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

/** Today's setup next to the one we build: twenty downloads, then one. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo habitual</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> 20 descargas
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agentes</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo que vamos a construir</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Bucket</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>1 descarga</span>
            <span className={box}>/srv/refs</span>
            <span className="t-eyebrow px-1 text-signal">Una máquina</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>20 agentes</span>
        </div>
      </div>
    </figure>
  );
}

/** What one machine does when patch 2 lands: two files fetched, the rest kept. */
function ReleaseUpdate() {
  const rows: [name: string, what: string, fetched: boolean][] = [
    ["chr1.fa", "Conservado", false],
    ["chr2.fa", "Descargado · cambiado", true],
    ["chrY.fa", "Descargado · nuevo", true],
    ["genes.gtf", "Conservado", false],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">syncRefs tras el parche 2</p>
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
