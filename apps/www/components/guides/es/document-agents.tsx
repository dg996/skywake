// Guía: cómo dejar que un agente edite documentos reales en su propia copia, leer cada
// cambio que hizo y dejar que solo lo que apruebes llegue a la carpeta real.
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
        name="Agentes de documentos"
        title={title}
        dek="Una guía paso a paso para dar a un agente su propia copia de los archivos de un cliente, leer todo lo que cambió y dejar que solo lo que apruebes llegue a la carpeta real."
        meta={["12 min de lectura", "TypeScript", "Para principiantes"]}
        cover={<ReviewCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Una línea equivocada en el libro contable"],
          ["plan", "Qué vamos a construir"],
          ["save", "1. Guarda la carpeta y bloquéala"],
          ["copy", "2. Dale al agente su propia copia"],
          ["tools", "3. Dale herramientas que escriban en la copia"],
          ["review", "4. Lee lo que cambió"],
          ["approve", "5. Corrige una línea y aprueba el resto"],
          ["record", "6. Conserva el registro y deshaz si hace falta"],
          ["scale", "Hacerlo para cada cliente"],
          ["questions", "Preguntas"],
        ]}
      >
        <Chapter id="start" title="Una línea equivocada en el libro contable" />
        <p>
          Los agentes suelen tener el mismo acceso que las personas: la carpeta real, con permiso de
          escritura. No hay borrador ni un «¿estás seguro?». Lo que el agente guarda se convierte en
          la nueva verdad, y después cuesta saber qué líneas tocó. Un error pequeño, como una
          reparación registrada como equipo nuevo, sale en el siguiente informe antes de que nadie
          lo vea.{" "}
          <b>El error es pequeño. El sistema no le da a nadie la oportunidad de detectarlo.</b>
        </p>
        <p>
          Cada una de las soluciones habituales tiene un coste. Puedes copiar la carpeta antes de
          cada ejecución, pero las carpetas de los clientes son grandes, las copias se acumulan y
          alguien tiene que devolver los cambios buenos a mano. O puedes dejar que el agente solo
          sugiera cambios y escribirlos tú. Es seguro, pero vuelves a hacer el trabajo.{" "}
          <b>Al final es todo o nada:</b> confías del todo en el agente o no lo usas.
        </p>
        <TwoSetups />
        <p>
          En esta guía lo haremos de otra manera. La carpeta real del cliente está bloqueada. El
          agente trabaja en su propia copia, que no cuesta nada crear, y cada guardado que hace
          queda registrado con un motivo. Tú lees los cambios, corriges lo que esté mal y apruebas.
          Nada llega a los archivos reales por ningún otro camino.
        </p>

        <Chapter id="plan" title="Qué vamos a construir" />
        <p>Al terminar, tendrás:</p>
        <div>
          <Checklist
            items={[
              "La carpeta de un cliente guardada y bloqueada, para que ni siquiera tu propio código pueda editarla directamente.",
              "Una clave de agente que solo llega a ese cliente.",
              "Una copia privada para cada ejecución del agente, lista en 10 ms.",
              "Una lista clara de lo que cambió el agente, commit a commit y línea a línea.",
              "Un paso de aprobación que solo tú puedes dar, y una forma de deshacerlo después.",
            ]}
          />
        </div>
        <p>
          Necesitarás una API key de Skywake con el rol de administrador y Node. Define{" "}
          <code>SKYWAKE_URL</code> y <code>SKYWAKE_KEY</code>, y después instala el SDK con{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Guarda la carpeta y bloquéala" />
        <p>
          Usaremos como ejemplo la contabilidad de Acme Bakery, un cliente pequeño. Es una carpeta
          pequeña: un libro contable, las facturas del trimestre y una nota del contable.
        </p>
        <Tree
          root="acme-books"
          items={[
            ["ledger.csv", "el archivo que editará el agente"],
            ["invoices/millers-flour-0711.txt"],
            ["invoices/coldchain-0802.txt"],
            ["invoices/oven-repair-0915.txt", "la que registra mal"],
            ["notes.md", "«las reparaciones pequeñas van a Repairs»"],
          ]}
        />
        <p>
          Cada cliente tiene su propio namespace, un repositorio de archivos. Dentro guardamos la
          carpeta como una rama llamada <code>main</code>. Una rama es una serie de versiones
          guardadas, como una rama de Git. Cada guardado es un commit, y se conservan todos los
          commits.
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
          <code>start</code> es el commit que acabamos de hacer. Guárdalo: marca dónde empezó el
          agente. La última línea es la importante. Una rama protegida cambia{" "}
          <b>solo mediante merge</b>, así que incluso una escritura directa con tu clave de
          administrador se rechaza:
        </p>
        <Code
          file="output"
          code={`
branch \`main\` is protected; change it with a merge
`}
        />

        <Chapter id="copy" step={2} title="Dale al agente su propia copia" />
        <p>
          El agente no debería usar tu clave. Le creamos una propia, con el rol <b>write</b>, solo
          para este cliente y que caduca en una semana.
        </p>
        <p>
          Después el agente hace fork de <code>main</code>. Un fork es una rama nueva que empieza
          exactamente donde está la anterior. No copia nada, así que está lista al instante, sea
          cual sea el tamaño de la carpeta.
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
          Ahora el agente tiene <code>agent/q3-books</code>, una copia completa de la contabilidad
          de Acme. Con su clave puede leer y escribir en esa copia. No puede escribir en{" "}
          <code>main</code>, y si intenta abrir la carpeta de otro cliente, la respuesta es{" "}
          <code>no access</code>.
        </p>

        <Chapter id="tools" step={3} title="Dale herramientas que escriban en la copia" />
        <p>
          Tu agente trabaja mediante herramientas: pequeñas funciones que el modelo puede llamar. Le
          damos tres. Puede listar los archivos, leer uno y escribir uno. Todas las herramientas
          apuntan a <code>work</code>, así que no tiene forma de llegar a la carpeta real.
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
          Fíjate en <code>write</code>. Le pide al agente un <b>motivo</b>, y ese motivo se
          convierte en el mensaje del commit. Así, cada cambio llega con las propias palabras del
          agente sobre por qué lo hizo.
        </p>
        <Note title="Consejo: pide un cambio por escritura">
          <p>
            En tu prompt, pide al agente que haga un cambio por escritura y que lo explique en una
            frase corta. Los commits pequeños con motivos claros son mucho más fáciles de revisar
            que un gran guardado al final.
          </p>
        </Note>
        <p>
          Ahora pasa las herramientas a tu modelo y déjalo trabajar. En nuestra ejecución, el agente
          añadió tres líneas a <code>ledger.csv</code>, una por factura, y escribió un archivo
          nuevo, <code>q3-summary.md</code>. Eso supuso dos commits en su copia. <code>main</code>{" "}
          no cambió en absoluto.
        </p>

        <Chapter id="review" step={4} title="Lee lo que cambió" />
        <p>
          La ejecución ha terminado. Ahora te toca a ti, con tu propia clave. Primero, la historia
          de la ejecución: qué cambió cada commit desde <code>start</code>, en orden.
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
          <code>changes</code> lista los commits uno por uno. <code>diff</code> da la suma de todos:
          cada archivo que el agente añadió, eliminó o modificó, comparado con el punto en que
          empezó su copia.
        </p>
        <RunLog />
        <p>
          El resumen es nuevo, así que basta con leerlo. El libro contable se modificó, así que
          quieres ver las líneas exactas. Lee el archivo en las dos ramas y quédate con las líneas
          nuevas:
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
          <code>added</code> contiene las tres líneas nuevas. Dos están bien. La tercera registra la
          reparación del horno como <code>Equipment</code>, aunque las propias notas de Acme dicen
          que las reparaciones pequeñas van a <code>Repairs</code>.
        </p>

        <Chapter id="approve" step={5} title="Corrige una línea y aprueba el resto" />
        <p>
          No tienes que tirar la ejecución por una línea mala. Corrígela en la copia del agente,
          como un commit más con tu propio motivo. Después haz merge: lleva los cambios de la copia
          a <code>main</code>.
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
          El dry run no guarda nada. Solo te dice si el merge chocaría con algo que haya cambiado en{" "}
          <code>main</code> mientras tanto. Aquí no hay problema, así que el merge real se aplica:
          el libro contable de <code>main</code> ya tiene las tres líneas, con tu corrección, y el
          resumen también está ahí.
        </p>
        <ReviewedLines />
        <p>
          Hay una cosa más que lo hace seguro. Hacer merge en una rama protegida requiere el rol{" "}
          <b>admin</b>. Si el agente intenta fusionar su propia copia, recibe{" "}
          <code>this needs the `admin` role</code>. El agente puede hacer el trabajo. Solo tú puedes
          aprobarlo.
        </p>

        <Chapter id="record" step={6} title="Conserva el registro y deshaz si hace falta" />
        <p>
          Semanas después, un cliente pregunta por qué la reparación del horno está en Repairs. Se
          conserva cada versión del libro contable, con el mensaje que la creó:
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
          La versión más reciente es <code>Approve Q3 books</code>, y antes,{" "}
          <code>Acme books before the Q3 close</code>. La aprobación es un commit de merge, y
          registra qué commit incorporó.
        </p>
        <p>
          ¿Cambiaste de opinión después de aprobar? <code>main</code> sigue cambiando solo mediante
          merge, así que deshazlo de la misma forma: haz un fork, revierte la aprobación en el fork
          y fusiónalo de vuelta. Un revert es un commit nuevo que devuelve lo que cambió uno
          anterior.
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
          El libro contable vuelve a estar como antes de la ejecución, y la reversión también queda
          en el historial. Y si una ejecución no te convence en absoluto, no necesitas nada de esto.
          Borra su rama, y <code>main</code> nunca la habrá visto:
        </p>
        <Code
          file="reject.ts"
          code={`
await acme.branch("agent/q4-draft").delete();
`}
        />

        <Chapter id="scale" title="Hacerlo para cada cliente" />
        <p>
          Un cliente es el caso fácil. Algunas cosas que conviene saber cuando pasas a cientos de
          clientes y muchas ejecuciones al día:
        </p>
        <ul>
          <li>
            <b>Un namespace por cliente.</b> Llámalos <code>clients/acme</code>,{" "}
            <code>clients/globex</code>, y dale a cada agente una clave solo para el cliente con el
            que trabaja.
          </li>
          <li>
            <b>Las copias siguen siendo instantáneas.</b> Un fork no copia nada, así que una copia
            de 20,000 archivos está lista en unos 10 ms.
          </li>
          <li>
            <b>Claves de corta duración.</b> Haz que la clave del agente caduque poco después de la
            tarea, para que una clave antigua no se pueda usar en la siguiente.
          </li>
          <li>
            <b>Ordena las ramas.</b> Borra la rama de una ejecución en cuanto la fusiones o la
            rechaces. <code>main</code> conserva su propio historial, aprobación incluida.
          </li>
          <li>
            <b>Todo sigue siendo tuyo.</b> Cada versión de cada archivo vive en tu propio bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Preguntas" />
        <Questions
          items={[
            [
              "¿Puede el agente aprobar su propio trabajo?",
              <p key="a">
                No. Su clave tiene el rol write, y hacer merge en una rama protegida requiere el rol
                admin. El agente solo puede cambiar su propia copia.
              </p>,
            ],
            [
              "¿Y si dos ejecuciones cambian el mismo archivo?",
              <p key="a">
                El primer merge se aplica. El dry run del segundo indica el archivo que choca, y no
                se guarda nada. Lee las dos versiones y vuelve a hacer merge con{" "}
                <code>resolve</code>, quedándote con una de las dos o escribiendo el texto tú mismo.
              </p>,
            ],
            [
              "¿Puede un agente ver los archivos de otro cliente?",
              <p key="a">
                No, si limitas el alcance de su clave. Una clave creada para{" "}
                <code>clients/acme</code> recibe «sin acceso» en cualquier otro namespace.
              </p>,
            ],
            [
              "¿Por qué una carpeta nueva aparece como un solo cambio?",
              <p key="a">
                Un diff lista una carpeta nueva o eliminada una sola vez, no una vez por cada
                archivo que contiene. Usa <code>walk</code> en la rama del agente para ver cada
                archivo de esa carpeta.
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

/** La portada: la ejecución de un agente esperando revisión, archivo por archivo. */
function ReviewCover() {
  return (
    <div className="grid">
      <div className={ROW}>
        <GitBranch className="size-3.5 text-muted-foreground" /> agent/q3-books
        <ArrowRight className="size-3 text-muted-foreground" /> main
        <span className="ml-auto flex items-center gap-1 rounded-full bg-signal/12 px-2 text-[12px] leading-5 text-signal">
          Esperándote
        </span>
      </div>
      {[
        ["modified", "ledger.csv", "+3 líneas"],
        ["added", "q3-summary.md", "archivo nuevo"],
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

/** El sistema actual junto a este: el agente escribe en los archivos reales, o escribe en una copia que tú apruebas. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">El sistema habitual</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Escribe directamente
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Archivos reales del cliente</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo que vamos a construir</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agente</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Su propia copia</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 text-signal">
            <Check className="size-3.5" /> Tú apruebas
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={`${box} flex items-center gap-1.5`}>
            <Lock className="size-3.5 text-muted-foreground" /> Archivos reales del cliente
          </span>
        </div>
      </div>
    </figure>
  );
}

/** La ejecución del agente tal como la ve primero quien revisa: cada commit, su motivo y su archivo. */
function RunLog() {
  const commits = [
    ["Book 3 supplier invoices for Q3", "ledger.csv", "modified"],
    ["Write the Q3 summary", "q3-summary.md", "added"],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">agent/q3-books, desde start</p>
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

/** Las líneas del libro contable que añadió el agente, con la que corregiste antes de aprobar. */
function ReviewedLines() {
  const line = "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-[12px]";
  return (
    <figure className="grid gap-2 rounded-xl border border-border p-5">
      <p className="t-eyebrow mb-1 text-muted-foreground">
        ledger.csv en main, después de la aprobación
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
        Corregida por ti · aprobada en un solo merge
      </span>
    </figure>
  );
}
