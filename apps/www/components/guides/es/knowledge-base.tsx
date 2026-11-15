// Guía: cómo crear una gran base de conocimiento en la que tus agentes puedan buscar,
// y que se mantiene al día en cuanto cambia un documento. Pensada para leerse de principio a fin.
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
        name="Base de conocimiento"
        title={title}
        dek="Una guía paso a paso para dar a tus agentes millones de documentos que puedan buscar, consultar y citar."
        meta={["15 min de lectura", "TypeScript", "Para principiantes"]}
        cover={<KnowledgeCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Por qué es más difícil de lo que parece"],
          ["plan", "Qué vamos a construir"],
          ["save", "1. Reúne tus documentos en un solo lugar"],
          ["index", "2. Crea un índice de búsqueda junto a ellos"],
          ["fill", "3. Llena el índice"],
          ["tool", "4. Dale a tu agente una herramienta de búsqueda"],
          ["update", "5. Mantenlo al día"],
          ["drafts", "6. Prueba los cambios grandes en un borrador"],
          ["scale", "Crecer hasta millones de documentos"],
          ["questions", "Preguntas"],
        ]}
      >
        <Chapter id="start" title="Por qué es más difícil de lo que parece" />
        <p>
          Darle a un agente el conocimiento de tu empresa parece sencillo, y la primera versión
          suele funcionar en una tarde. El problema llega semanas después, cuando un documento
          cambia y el agente sigue citando el antiguo. La mayoría de los sistemas guardan dos copias
          de tu conocimiento: los documentos y una base de datos de búsqueda construida a partir de
          ellos. Cuando las dos se desincronizan, el agente sigue respondiendo, solo que con texto
          viejo. <b>El documento estaba bien. El agente leyó una copia antigua.</b>
        </p>
        <p>
          Las soluciones parecen fáciles. Añadir un proceso que mantenga las dos copias
          sincronizadas, o prescindir de la base de datos y dejar que los agentes lean los archivos
          directamente de un bucket de almacenamiento de objetos. Las dos se complican a medida que
          crece tu conocimiento. El proceso de sincronización tiene más que copiar y más formas de
          fallar. Y un bucket no es una carpeta: antes de que un agente pueda abrir un archivo,
          tiene que descargarlo.{" "}
          <b>Las bases de conocimiento de una empresa suelen ocupar cientos de gigabytes.</b>
        </p>
        <TwoSetups />
        <p>
          En esta guía te mostramos cómo hacerlo de otra manera. Los documentos y su índice de
          búsqueda viven <b>en el mismo bucket</b>, ligados a la misma versión de tus documentos. No
          hay una segunda copia que se quede atrás, y los agentes leen solo las partes de un archivo
          que necesitan.
        </p>

        <Chapter id="plan" title="Qué vamos a construir" />
        <p>Al terminar, tendrás:</p>
        <div>
          <Checklist
            items={[
              "Tus documentos guardados como una rama, con cada cambio guardado como un commit.",
              "Un índice de búsqueda junto a ellos que encuentra respuestas por significado y por palabras exactas.",
              "Una herramienta de búsqueda que tu agente puede llamar y que te dice qué archivo usó.",
              "Una forma de actualizar un documento y que el agente lo vea al instante.",
              "Borradores, para probar reescrituras grandes antes de que las vean tus clientes.",
            ]}
          />
        </div>
        <p>
          Necesitarás una API key de Skywake y Node. Define <code>SKYWAKE_URL</code> y{" "}
          <code>SKYWAKE_KEY</code>, y después instala el SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Reúne tus documentos en un solo lugar" />
        <p>
          Empieza con la carpeta que ya tienes. Lo mejor es Markdown o texto plano: lo que exporte
          tu centro de ayuda. La nuestra es así:
        </p>
        <Tree
          root="help-center"
          items={[
            ["billing/refunds.md", "el que va a cambiar"],
            ["billing/invoices.md"],
            ["plans/annual.md"],
            ["account/reset-password.md"],
            ["account/sso.md"],
          ]}
        />
        <p>
          La guardaremos como una rama llamada <code>main</code>. Piensa en una rama como en una
          rama de Git, pero para archivos: cada guardado es un commit, y siempre puedes volver atrás
          y ver qué cambió.
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
          Eso es todo. Ahora <code>main</code> es la única copia oficial de tus documentos, guardada
          en tu propio bucket.
        </p>

        <Chapter id="index" step={2} title="Crea un índice de búsqueda junto a ellos" />
        <p>
          Ahora, el índice. De cada documento guarda dos cosas: el <b>texto</b>, para encontrar
          palabras exactas, y un <b>vector</b>, una lista de números que capta lo que significa el
          texto.
        </p>
        <p>
          ¿Por qué los dos? Los clientes preguntan «¿me pueden devolver el dinero?» mientras tu
          documento dice «reembolso». La búsqueda por significado encuentra eso. También escriben
          «SSO» o un código de error, y ahí la búsqueda por palabras funciona mejor. Una buena base
          de conocimiento necesita las dos.
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
          Fíjate en la línea <code>embed</code>. Indicas un modelo una vez y, a partir de ahí,
          envías texto normal. El servidor crea los vectores por ti.
        </p>

        <Chapter id="fill" step={3} title="Llena el índice" />
        <p>
          Ahora copiamos cada documento al índice. <code>syncIndex</code> lee la rama y escribe un
          documento por archivo. Le decimos cómo convertir un archivo en un documento: su ruta es el
          id, y su texto va en las dos columnas.
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
          La primera ejecución envía todos los archivos. Devuelve <code>synced.head</code>, el
          commit hasta el que sincronizó. Guarda ese valor. La próxima vez lo pasas de nuevo, y solo
          se envían los archivos que cambiaron desde entonces. Los archivos que borraste también se
          eliminan del índice.
        </p>

        <Chapter id="tool" step={4} title="Dale a tu agente una herramienta de búsqueda" />
        <p>
          Tu agente necesita una sola herramienta: buscar en los documentos. Haremos los dos tipos
          de búsqueda en una sola llamada, lo que se llama una búsqueda <b>híbrida</b>. Los
          documentos que encuentran ambas quedan arriba, así que una pregunta con las palabras del
          propio cliente sigue llegando a la página correcta.
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
          El id de cada resultado es la ruta del archivo. Dale <code>searchDocs</code> a tu agente
          como herramienta, deja que lea los archivos que recibe y pídele que nombre el archivo que
          usó.
        </p>
        <Note title="Consejo: cita siempre el archivo">
          <p>
            Cuando una respuesta parece incorrecta, el nombre del archivo te dice exactamente qué
            documento corregir. Además genera confianza en quienes leen las respuestas.
          </p>
        </Note>

        <Chapter id="update" step={5} title="Mantenlo al día" />
        <p>
          Esta es la parte que fallaba en el sistema anterior. La política de reembolsos cambia.
          Edita el documento, haz commit y sincroniza desde el último head:
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
          Solo se vuelve a enviar <code>billing/refunds.md</code>. Hazle al agente la misma
          pregunta, y la respuesta ha cambiado:
        </p>
        <Answers />
        <p>
          Ejecuta la sincronización justo después de cada commit, desde el mismo código que hace el
          commit. No hay un proceso aparte que vigilar, ni una noche en la que deje de funcionar sin
          avisar.
        </p>

        <Chapter id="drafts" step={6} title="Prueba los cambios grandes en un borrador" />
        <p>
          Las ediciones pequeñas pueden ir directamente a <code>main</code>. Pero imagina que el mes
          que viene lanzas nuevos precios y la mitad de tus documentos de facturación van a cambiar.
          Quieres ver cómo responde el agente antes que cualquier cliente.
        </p>
        <p>
          Haz un fork de los documentos y del índice en un borrador. Un fork no copia nada, así que
          es instantáneo incluso con miles de documentos. Mientras tanto, los clientes siguen
          recibiendo respuestas de <code>main</code>.
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
          Apunta un agente de prueba al borrador y hazle las preguntas que más hacen tus clientes.
          Cuando las respuestas te convenzan, haz merge, y los nuevos documentos y su índice se
          publican en el mismo instante.
        </p>

        <Chapter id="scale" title="Crecer hasta millones de documentos" />
        <p>
          Todo lo anterior funciona igual con cinco documentos que con cinco millones. Algunas cosas
          que conviene saber a medida que crece:
        </p>
        <ul>
          <li>
            <b>Las sincronizaciones siguen siendo pequeñas.</b> Cada una envía solo lo que cambió,
            así que actualizar una base de conocimiento grande no cuesta más que una pequeña.
          </li>
          <li>
            <b>La búsqueda sigue siendo rápida.</b> Una consulta en caliente sobre 10 millones de
            vectores tarda unos 10 ms.
          </li>
          <li>
            <b>Los borradores siguen siendo instantáneos.</b> Un fork no copia nada, sea cual sea el
            tamaño.
          </li>
          <li>
            <b>Todo sigue siendo tuyo.</b> Los documentos y el índice viven en tu propio bucket. No
            hay una segunda base de datos que operar ni que pagar.
          </li>
        </ul>

        <Chapter id="questions" title="Preguntas" />
        <Questions
          items={[
            [
              "¿Tengo que crear los embeddings yo mismo?",
              <p key="a">
                No. Indicas un modelo en el índice, envías texto y el servidor crea los embeddings.
                Si lo prefieres, puedes seguir enviando tus propios vectores.
              </p>,
            ],
            [
              "¿Cuánto tarda un cambio en aparecer en la búsqueda?",
              <p key="a">
                Aparece en cuanto la sincronización lo escribe. La búsqueda por palabras ve todos
                los documentos escritos, incluidos los más recientes.
              </p>,
            ],
            [
              "¿Puedo ver lo que leyó el agente la semana pasada?",
              <p key="a">
                Sí. Se guarda cada commit de los documentos, así que puedes abrir la versión exacta
                de la que salió una respuesta.
              </p>,
            ],
            [
              "¿Y los documentos muy largos?",
              <p key="a">
                Divídelos en secciones antes de indexarlos, un documento por sección, para que cada
                resultado lleve al agente a la parte correcta de la página.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** La portada: la búsqueda que el lector está a punto de construir. */
function KnowledgeCover() {
  const Search = SNIPPETS[0]!;
  return <Search tone="blue" />;
}

/** El sistema habitual junto al de Skywake: un proceso de sincronización que puede fallar, y luego ninguno. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">El sistema habitual</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Documentos</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Proceso de sincronización
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Base de datos de búsqueda</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agente</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo que vamos a construir</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Documentos</span>
            <span className={box}>Su índice</span>
            <span className="t-eyebrow px-1 text-signal">Un solo bucket</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agente</span>
        </div>
      </div>
    </figure>
  );
}

/** La misma pregunta antes y después del cambio. */
function Answers() {
  const bubble = "t-small max-w-[34ch] rounded-2xl px-4 py-2.5";
  return (
    <figure className="grid gap-3 rounded-xl border border-border p-5">
      <p className={`${bubble} ml-auto bg-foreground text-background`}>
        ¿Me pueden reembolsar mi plan anual?
      </p>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-muted-foreground line-through decoration-1`}>
          Sí, dentro de los 60 días posteriores a la compra.
        </p>
        <span className="t-eyebrow pl-1 text-muted-foreground">Antes del cambio</span>
      </div>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-foreground`}>
          Sí, por completo, dentro de los 30 días posteriores a la compra.
        </p>
        <span className="t-eyebrow pl-1 text-signal">Después · de billing/refunds.md</span>
      </div>
    </figure>
  );
}
