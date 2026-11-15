// Guía: cómo ejecutar la preview de cada pull request sobre su propia copia
// completa de los datos de la app, y luego publicar el cambio o tirar la copia.
import { ArrowRight, GitBranch, Lock, X } from "lucide-react";

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

export function PreviewsGuide({
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
        name="Entornos de preview"
        title={title}
        dek="Una guía paso a paso para darle a cada pull request una copia completa de los datos de tu app, para que quien revisa vea el cambio funcionando antes de publicarlo, y nadie comparta un staging."
        meta={["12 min de lectura", "TypeScript", "Apta para principiantes"]}
        cover={<PreviewsCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Por qué las previews no detectan bugs reales"],
          ["plan", "Qué vamos a construir"],
          ["save", "1. Guarda los datos de tu app en main"],
          ["fork", "2. Dale al pull request su propia copia"],
          ["run", "3. Ejecuta la preview sobre la copia"],
          ["undo", "4. Deshaz y vuelve a intentarlo"],
          ["review", "5. Que quien revisa mire, sin tocar"],
          ["ship", "6. Publícalo o tíralo"],
          ["every", "Hacerlo para cada pull request"],
          ["questions", "Preguntas"],
        ]}
      >
        <Chapter id="start" title="Por qué las previews no detectan bugs reales" />
        <p>
          La mayoría de las previews usan datos de prueba: unos pocos productos, usuarios y pedidos
          inventados. Los datos reales son grandes. Copiarlos para cada pull request lleva tiempo y
          espacio, y alguien tiene que limpiar las copias después. Así que se revisa el código, pero
          no los datos con los que se encontrará en producción. Un cambio que lee todos los precios
          como “12.00” pasa la revisión y luego falla con el primer precio en euros escrito “24,00”.{" "}
          <b>El código se revisó. Los datos con los que se encontró, no.</b>
        </p>
        <p>
          Las dos soluciones habituales tienen un coste. Puedes copiar los datos reales para cada
          pull request, y esperar, y pagar cada copia. O puedes tener un único staging compartido
          con datos reales y dejar que todos los pull requests lo usen. Entonces la migración de un
          pull request reescribe los datos con los que prueban otros tres, y nadie sabe qué cambio
          rompió qué.
        </p>
        <SharedOrOwn />
        <p>
          En esta guía lo haremos de otra forma. Los datos de tu app viven en un solo sitio, en una
          rama llamada <code>main</code>. Cada pull request recibe su propia copia de esa rama,
          creada en milisegundos, porque{" "}
          <b>aquí una copia comparte los archivos en lugar de duplicarlos</b>. La preview puede
          cambiar su copia, incluso romperla, y <code>main</code> ni se entera. Y de paso
          atraparemos ese bug de los euros.
        </p>

        <Chapter id="plan" title="Qué vamos a construir" />
        <p>Al final, tendrás:</p>
        <div>
          <Checklist
            items={[
              "Los datos de tu app guardados una vez, en una rama main que nada puede cambiar por accidente.",
              "Una copia completa de esos datos para cada pull request, creada en milisegundos.",
              "Una preview que se ejecuta sobre su copia y puede romperla sin riesgo.",
              "Una key de solo lectura, para que quien revisa pueda mirar sin tocar.",
              "Una llamada para publicar el cambio y otra para tirar la copia.",
            ]}
          />
        </div>
        <p>
          Necesitarás una API key de Skywake y Node. Usa una key de administrador: los pasos 1 y 5
          la necesitan. Define <code>SKYWAKE_URL</code> y <code>SKYWAKE_KEY</code>, y luego instala
          el SDK con <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Guarda los datos de tu app en main" />
        <p>
          Empieza por los datos que lee tu app: el catálogo, los ajustes, los archivos subidos. La
          nuestra es una pequeña tienda:
        </p>
        <Tree
          root="shop-data"
          items={[
            ["catalog/products.json", "precios como “12.00” y “24,00”"],
            ["catalog/stock.json"],
            ["config/shipping.json"],
            ["uploads/banner.txt"],
          ]}
        />
        <p>
          La guardaremos en un namespace, un repositorio de archivos, como una rama llamada{" "}
          <code>main</code>. Una rama es una versión con nombre de tus archivos, como una rama de
          Git. Cada guardado es un commit, así que siempre puedes ver qué cambió y volver atrás.
        </p>
        <Code
          file="save-data.ts"
          code={`
import { Skywake } from "@skywake/sdk";

const sky = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: process.env.SKYWAKE_KEY!,
});

const shop = await sky.createNamespace("shop/data");
const main = await shop.createBranch("main");
await main.commitFolder("./shop-data", { message: "Shop data today" });
await main.protect();
`}
        />
        <p>
          La última línea protege <code>main</code>. Una rama protegida solo cambia con un merge. Si
          algún código intenta escribir en ella directamente, la escritura se rechaza, así que
          ninguna preview puede tocar los datos reales por error.
        </p>

        <Chapter id="fork" step={2} title="Dale al pull request su propia copia" />
        <p>
          Se abre el pull request 512. Hacemos fork de <code>main</code> en una rama nueva con su
          nombre. Un fork es una rama nueva que empieza exactamente donde está otra. No copia nada:
          comparte los archivos de main hasta que el pull request cambia alguno.
        </p>
        <Code
          file="fork.ts"
          code={`
const pr = await main.fork("pr-512");
const start = (await pr.info()).head;
`}
        />
        <p>
          <code>pr-512</code> tiene ahora todos los archivos de <code>main</code>, con el mismo
          contenido. También guardamos <code>start</code>, el commit desde el que empezó la copia.
          Lo necesitaremos en el paso 4.
        </p>

        <Chapter id="run" step={3} title="Ejecuta la preview sobre la copia" />
        <p>
          El cambio en revisión pasa los precios a céntimos enteros. Su migración lee el catálogo,
          sustituye cada <code>price</code> por <code>cents</code> y guarda el resultado. La
          ejecutamos sobre la copia, tal como está escrita en el pull request:
        </p>
        <Code
          file="preview.ts"
          code={`
type Product = { id: string; price: string; currency: string };
const file = "catalog/products.json";

async function migrate(toCents: (price: string) => number) {
  const products: Product[] = JSON.parse(await pr.readText(file));
  const moved = products.map(({ price, ...product }) => ({
    ...product,
    cents: toCents(price),
  }));
  await pr.write(
    { [file]: JSON.stringify(moved, null, 2) },
    "PR 512: store prices in cents",
  );
}

await migrate((price) => Math.round(Number(price) * 100));
await pr.checkout("./previews/pr-512");
`}
        />
        <p>
          <code>checkout</code> escribe los archivos de la rama en una carpeta local. Arranca la
          preview con esa carpeta como datos y abre la tienda.
        </p>
        <p>
          La taza cuesta 1200 céntimos, como debe ser. <b>La bolsa de tela no tiene precio.</b> Su
          precio es “24,00”, y <code>Number(&quot;24,00&quot;)</code> no es un número, así que se
          guardó como <code>null</code>. Este es el bug que esconden los datos de prueba, encontrado
          antes de que nadie lo aprobara, porque la preview se ejecutó sobre el catálogo real.
        </p>
        <p>
          Peor aún, la migración eliminó el antiguo campo <code>price</code>, así que en esta copia
          el precio de la bolsa ha desaparecido. En un staging compartido, todo el mundo estaría
          probando ahora sobre datos rotos. Aquí solo cambió <code>pr-512</code>. <code>main</code>{" "}
          no tiene ningún commit nuevo.
        </p>

        <Chapter id="undo" step={4} title="Deshaz y vuelve a intentarlo" />
        <p>
          La autora corrige la migración para que lea la coma como separador decimal. Antes de
          ejecutarla otra vez, dejamos la copia como estaba al principio. <code>reset</code>{" "}
          devuelve los archivos de la rama a como estaban en un commit, con un commit nuevo encima,
          así que incluso el intento fallido queda en el historial.
        </p>
        <Code
          file="try-again.ts"
          code={`
await pr.reset(start, { message: "PR 512: undo the first try" });
const toCents = (price: string) =>
  Math.round(Number(price.replace(",", ".")) * 100);
await migrate(toCents);
await pr.checkout("./previews/pr-512");
`}
        />
        <p>Recarga la preview. Ahora todos los productos tienen precio:</p>
        <TwoTries />
        <p>
          Puedes hacerlo tantas veces como necesite el cambio. Cada intento parte de los mismos
          datos reales, y nada de lo que hagas en la copia llega a nadie más.
        </p>

        <Chapter id="review" step={5} title="Que quien revisa mire, sin tocar" />
        <p>
          Quien revisa debería ver los datos sobre los que se ejecutó la preview, pero no
          cambiarlos. Le creamos una key que solo puede leer, solo llega a este namespace y deja de
          funcionar a la semana:
        </p>
        <Code
          file="review.ts"
          code={`
const review = await sky.keys.create("Review PR 512", "read", {
  namespaces: "shop/data",
  expiresInDays: 7,
});
`}
        />
        <p>
          Comparte <code>review.key</code> con quien revisa. Con ella, puede preguntar qué cambió el
          pull request en los datos:
        </p>
        <Code
          file="reviewer.ts"
          code={`
const reviewer = new Skywake({
  url: process.env.SKYWAKE_URL!,
  key: review.key,
});
const copy = reviewer.namespace("shop/data").branch("pr-512");

const changed = await copy.diff("main", { against: "base" });
console.log(changed);
`}
        />
        <p>
          Imprime un solo cambio: <code>catalog/products.json</code>, modificado. La opción{" "}
          <code>against: &quot;base&quot;</code> compara la copia con su punto de partida, así que
          solo aparecen los cambios del propio pull request, no lo que llegó a <code>main</code>{" "}
          después. Quien revisa puede leer cualquier archivo de la copia. Si intenta escribir uno,
          la petición se rechaza.
        </p>
        <Note title="Consejo: una key de lectura ve todo el namespace">
          <p>
            Una key se limita por namespace, no por rama. Esta también puede leer <code>main</code>,
            lo que viene bien para comparar. No puede cambiar ninguna de las dos. Si algunos datos
            tienen que ser privados, guárdalos en su propio namespace.
          </p>
        </Note>

        <Chapter id="ship" step={6} title="Publícalo o tíralo" />
        <p>
          El pull request está aprobado. Hacer merge de la rama lleva sus cambios a{" "}
          <code>main</code>. El merge es la única forma en que cambia una rama protegida, así que es
          el único camino por el que los nuevos precios llegan a los datos reales.
        </p>
        <Code
          file="ship.ts"
          code={`
const merged = await pr.mergeInto("main", { message: "Ship PR 512" });
if (merged.conflicts.length === 0) {
  await pr.delete();
  await sky.keys.revoke(review.id);
}
`}
        />
        <p>
          <code>main</code> guarda ahora los precios en céntimos, la copia ha desaparecido y la key
          de quien revisaba ya no funciona. Si <code>main</code> hubiera cambiado el mismo archivo
          mientras tanto, el merge no guardaría nada y listaría ese archivo en{" "}
          <code>conflicts</code>.
        </p>
        <p>
          No todo cambio en una copia debe publicarse. Por ejemplo, los pedidos de prueba que se
          hacen al navegar por una preview no deberían. En ese caso, sáltate el merge y borra solo
          la rama. La copia desaparece, y <code>main</code> nunca la vio.
        </p>

        <Chapter id="every" title="Hacerlo para cada pull request" />
        <p>
          Los pasos anteriores caben en una pequeña función. Llámala desde tu CI cuando se abre, se
          fusiona o se cierra un pull request:
        </p>
        <Code
          file="on-pull-request.ts"
          code={`
export async function onPullRequest(n: number, event: string) {
  const branch = shop.branch(\`pr-\${n}\`);
  if (event === "opened") {
    await main.fork(branch.name);
    await branch.checkout(\`./previews/pr-\${n}\`);
  }
  if (event === "merged") {
    const { conflicts } = await branch.mergeInto("main");
    if (conflicts.length > 0) throw new Error(\`Conflicts: \${conflicts}\`);
  }
  if (event === "merged" || event === "closed") {
    await branch.delete();
  }
}
`}
        />
        <p>Algunas cosas que conviene saber cuando haya más pull requests abiertos a la vez:</p>
        <ul>
          <li>
            <b>Las copias son rápidas.</b> Crear una rama tarda unos 13 ms, y un fork no copia nada,
            sea cual sea el tamaño de tus datos.
          </li>
          <li>
            <b>Las copias están separadas.</b> Dos pull requests abiertos a la vez ven solo sus
            propios cambios, nunca los del otro.
          </li>
          <li>
            <b>Los datos reales están a salvo.</b> <code>main</code> está protegida, así que solo
            cambia cuando se fusiona un pull request.
          </li>
          <li>
            <b>Limpiar es una llamada.</b> Borrar la rama elimina la copia. No queda ninguna base de
            datos ni ningún bucket que buscar después.
          </li>
          <li>
            <b>Todo sigue siendo tuyo.</b> Cada copia vive en tu propio bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Preguntas" />
        <Questions
          items={[
            [
              "¿Cada preview cuesta una copia completa de los datos?",
              <p key="a">
                No. Un fork no copia nada. Comparte los archivos de la rama de la que salió, y solo
                se vuelven a guardar los archivos que escribe el pull request.
              </p>,
            ],
            [
              "¿Y si main cambió mientras el pull request estaba abierto?",
              <p key="a">
                Si cambiaron archivos distintos, el merge simplemente los combina. Si los dos
                cambiaron el mismo archivo, el merge no guarda nada, lista el archivo en{" "}
                <code>conflicts</code> y deja la rama como está. Haz fork de una copia nueva desde
                el nuevo <code>main</code> y vuelve a ejecutar el cambio.
              </p>,
            ],
            [
              "¿Qué pasa con los datos de prueba creados en una preview?",
              <p key="a">
                Viven solo en la rama de ese pull request. Borra la rama y desaparecen. Solo llegan
                a <code>main</code> si haces merge.
              </p>,
            ],
            [
              "¿Puedo ver la copia como estaba antes de un cambio?",
              <p key="a">
                Sí, mientras exista la rama. Cada escritura es un commit, así que puedes leer
                cualquier archivo tal como estaba en un commit anterior. Después de un merge, el
                cambio se queda en el historial de <code>main</code>.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the shop's data with one branch per open pull request. */
function PreviewsCover() {
  const row = "flex h-9 items-center gap-2.5 border-b border-border px-1 whitespace-nowrap";
  const prs = [
    ["pr-511", "Preview ready"],
    ["pr-512", "In review"],
    ["pr-513", "Preview ready"],
  ];
  return (
    <div className="grid">
      <div className={`${row} text-muted-foreground`}>
        <span className="font-mono text-[12px]">shop/data</span>
      </div>
      <div className={row}>
        <GitBranch className="size-3.5 text-muted-foreground" /> main
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Lock className="size-3" /> Protected
        </span>
      </div>
      {prs.map(([name, state]) => (
        <div
          key={name}
          className={
            name === "pr-512"
              ? `${row} rounded-md border-transparent bg-foreground/[0.06] pr-2 pl-6`
              : `${row} pl-6`
          }
        >
          <GitBranch className="size-3.5 text-muted-foreground" />
          <span className={name === "pr-512" ? "" : "text-muted-foreground"}>{name}</span>
          <span
            className={`ml-auto text-[12px] ${name === "pr-512" ? "text-signal" : "text-muted-foreground"}`}
          >
            {state}
          </span>
        </div>
      ))}
    </div>
  );
}

/** One shared staging for every pull request, next to one copy per pull request. */
function SharedOrOwn() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  const prs = ["PR 511", "PR 512", "PR 513"];
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo habitual</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap gap-2">
            {prs.map((pr) => (
              <span key={pr} className={box}>
                {pr}
              </span>
            ))}
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Un solo staging compartido
          </span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Lo que vamos a construir</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>main</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            {prs.map((pr) => (
              <span key={pr} className={`${box} font-mono`}>
                {pr.replace("PR ", "pr-")}
              </span>
            ))}
            <span className="t-eyebrow px-1 text-signal">Una copia cada uno</span>
          </span>
        </div>
      </div>
    </figure>
  );
}

/** The catalog on the pull request's copy, after the first try and after the fix. */
function TwoTries() {
  const products: [name: string, first: string, second: string][] = [
    ["Taza", "1200", "1200"],
    ["Bolsa de tela", "null", "2400"],
    ["Gorra", "1850", "1850"],
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="t-eyebrow grid grid-cols-[1fr_6rem_6rem] gap-3 border-b border-border bg-card px-5 py-3 text-muted-foreground">
        <span>pr-512 · cents</span>
        <span className="text-right">Primer intento</span>
        <span className="text-right text-signal">Segundo intento</span>
      </div>
      {products.map(([name, first, second]) => (
        <div
          key={name}
          className="t-small grid grid-cols-[1fr_6rem_6rem] gap-3 border-b border-border px-5 py-3 last:border-b-0"
        >
          <span className="text-foreground">{name}</span>
          <span
            className={`text-right font-mono ${
              first === "null" ? "text-[color:var(--love)]" : "text-muted-foreground"
            }`}
          >
            {first}
          </span>
          <span className="text-right font-mono text-foreground">{second}</span>
        </div>
      ))}
      <p className="t-small border-t border-border bg-card px-5 py-3 text-muted-foreground">
        main, todo el tiempo: sin cambios
      </p>
    </figure>
  );
}
