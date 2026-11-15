// Guide : comment lancer la preview de chaque pull request sur sa propre copie
// complète des données de l’app, puis livrer le changement ou jeter la copie.
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
        name="Environnements de preview"
        title={title}
        dek="Un guide pas à pas pour donner à chaque pull request une copie complète des données de votre app, pour que les relecteurs voient le changement fonctionner avant sa mise en production, sans staging partagé."
        meta={["12 min de lecture", "TypeScript", "Accessible aux débutants"]}
        cover={<PreviewsCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Pourquoi les previews ratent les vrais bugs"],
          ["plan", "Ce que nous allons construire"],
          ["save", "1. Garder les données de l’app sur main"],
          ["fork", "2. Donner sa copie à la pull request"],
          ["run", "3. Lancer la preview sur la copie"],
          ["undo", "4. Annuler et réessayer"],
          ["review", "5. Laisser les relecteurs regarder, sans toucher"],
          ["ship", "6. Livrer, ou jeter"],
          ["every", "Pour chaque pull request"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Pourquoi les previews ratent les vrais bugs" />
        <p>
          La plupart des previews tournent sur des données de seed : quelques produits, utilisateurs
          et commandes inventés. Les vraies données sont volumineuses. Les copier pour chaque pull
          request prend du temps et de l’espace, et quelqu’un doit nettoyer les copies ensuite. Le
          code est donc relu, mais pas les données qu’il rencontrera en production. Un changement
          qui lit chaque prix comme « 12.00 » passe la relecture, puis échoue sur le premier prix en
          euros écrit « 24,00 ». <b>Le code a été relu. Pas les données qu’il a rencontrées.</b>
        </p>
        <p>
          Les solutions habituelles ont toutes deux un coût. Vous pouvez copier les vraies données
          pour chaque pull request, attendre, et payer chaque copie. Ou vous pouvez garder un seul
          staging partagé avec les vraies données, et laisser chaque pull request l’utiliser. Alors
          la migration d’une pull request réécrit les données sur lesquelles trois autres testent,
          et personne ne sait quel changement a cassé quoi.
        </p>
        <SharedOrOwn />
        <p>
          Dans ce guide, nous faisons autrement. Les données de votre app vivent à un seul endroit,
          sur une branche appelée <code>main</code>. Chaque pull request reçoit sa propre copie de
          cette branche, créée en 10 ms, car{" "}
          <b>une copie partage ici les fichiers au lieu de les dupliquer</b>. La preview peut
          modifier sa copie, voire la casser, sans que <code>main</code> s’en aperçoive. Et nous
          attraperons ce bug d’euros en chemin.
        </p>

        <Chapter id="plan" title="Ce que nous allons construire" />
        <p>À la fin, vous aurez :</p>
        <div>
          <Checklist
            items={[
              "Les données de votre app enregistrées une fois, sur une branche main que rien ne peut modifier par accident.",
              "Une copie complète de ces données pour chaque pull request, créée en 10 ms.",
              "Une preview qui tourne sur sa copie, et peut la casser sans risque.",
              "Une clé en lecture seule, pour que les relecteurs regardent sans toucher.",
              "Un appel pour livrer le changement, et un autre pour jeter la copie.",
            ]}
          />
        </div>
        <p>
          Il vous faut une clé d’API Skywake et Node. Utilisez une clé admin : les étapes 1 et 5 en
          ont besoin. Définissez <code>SKYWAKE_URL</code> et <code>SKYWAKE_KEY</code>, puis
          installez le SDK avec <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Garder les données de l’app sur main" />
        <p>
          Commencez par les données que lit votre app : le catalogue, les réglages, les fichiers
          uploadés. Notre exemple est une petite boutique :
        </p>
        <Tree
          root="shop-data"
          items={[
            ["catalog/products.json", "des prix comme « 12.00 » et « 24,00 »"],
            ["catalog/stock.json"],
            ["config/shipping.json"],
            ["uploads/banner.txt"],
          ]}
        />
        <p>
          Nous l’enregistrons dans un namespace, c’est-à-dire un dépôt de fichiers, sur une branche
          appelée <code>main</code>. Une branche est une version nommée de vos fichiers, comme une
          branche Git. Chaque enregistrement est un commit : vous pouvez toujours voir ce qui a
          changé et revenir en arrière.
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
          La dernière ligne protège <code>main</code>. Une branche protégée ne change que par un
          merge. Si du code essaie d’y écrire directement, l’écriture est refusée : aucune preview
          ne peut toucher aux vraies données par erreur.
        </p>

        <Chapter id="fork" step={2} title="Donner sa copie à la pull request" />
        <p>
          La pull request 512 est ouverte. Nous forkons <code>main</code> dans une nouvelle branche
          qui porte son nom. Un fork est une nouvelle branche qui part exactement du même point
          qu’une autre. Il ne copie rien : il partage les fichiers de main jusqu’à ce que la pull
          request en modifie un.
        </p>
        <Code
          file="fork.ts"
          code={`
const pr = await main.fork("pr-512");
const start = (await pr.info()).head;
`}
        />
        <p>
          <code>pr-512</code> a maintenant tous les fichiers de <code>main</code>, avec le même
          contenu. Nous gardons aussi <code>start</code>, le commit d’où part la copie. Nous en
          aurons besoin à l’étape 4.
        </p>

        <Chapter id="run" step={3} title="Lancer la preview sur la copie" />
        <p>
          Le changement en relecture passe les prix en centimes entiers. Sa migration lit le
          catalogue, remplace chaque <code>price</code> par <code>cents</code>, et enregistre le
          résultat. Nous la lançons sur la copie, exactement telle qu’elle est écrite dans la pull
          request :
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
          <code>checkout</code> écrit les fichiers de la branche dans un dossier local. Lancez la
          preview avec ce dossier comme données, et ouvrez la boutique.
        </p>
        <p>
          Le mug coûte 1200 centimes, comme prévu. <b>Le tote bag n’a pas de prix.</b> Son prix est
          « 24,00 », et <code>Number(&quot;24,00&quot;)</code> n’est pas un nombre : il a donc été
          enregistré comme <code>null</code>. C’est le bug que cachent les données de seed, trouvé
          avant toute approbation, parce que la preview tournait sur le vrai catalogue.
        </p>
        <p>
          Pire, la migration a supprimé l’ancien champ <code>price</code> : sur cette copie, le prix
          du tote bag a disparu. Sur un staging partagé, tout le monde testerait maintenant sur des
          données cassées. Ici, seule <code>pr-512</code> a changé. <code>main</code> n’a aucun
          nouveau commit.
        </p>

        <Chapter id="undo" step={4} title="Annuler et réessayer" />
        <p>
          L’auteur corrige la migration pour lire une virgule comme séparateur décimal. Avant de la
          relancer, nous remettons la copie dans son état de départ. <code>reset</code> redonne aux
          fichiers de la branche leur état à un commit donné, sous la forme d’un nouveau commit
          par-dessus : même l’essai raté reste dans l’historique.
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
        <p>Rafraîchissez la preview. Chaque produit a maintenant un prix :</p>
        <TwoTries />
        <p>
          Vous pouvez recommencer autant de fois que le changement l’exige. Chaque essai part des
          mêmes vraies données, et rien de ce que vous faites sur la copie n’atteint qui que ce soit
          d’autre.
        </p>

        <Chapter id="review" step={5} title="Laisser les relecteurs regarder, sans toucher" />
        <p>
          Les relecteurs doivent voir les données sur lesquelles la preview a tourné, sans pouvoir
          les modifier. Nous leur créons une clé qui ne peut que lire, n’atteint que ce namespace,
          et cesse de fonctionner au bout d’une semaine :
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
          Partagez <code>review.key</code> avec le relecteur. Avec elle, il peut demander ce que la
          pull request a changé dans les données :
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
          Le résultat affiche un seul changement : <code>catalog/products.json</code>, modifié.
          L’option <code>against: &quot;base&quot;</code> compare la copie à son point de départ, si
          bien que seuls les changements de la pull request apparaissent, pas ce qui est arrivé sur{" "}
          <code>main</code> depuis. Le relecteur peut lire n’importe quel fichier de la copie. S’il
          essaie d’en écrire un, la requête est refusée.
        </p>
        <Note title="Astuce : une clé de lecture voit tout le namespace">
          <p>
            Une clé est limitée par namespace, pas par branche. Celle-ci peut aussi lire{" "}
            <code>main</code>, ce qui est pratique pour comparer. Elle ne peut modifier ni l’une ni
            l’autre. Si certaines données doivent rester privées, gardez-les dans leur propre
            namespace.
          </p>
        </Note>

        <Chapter id="ship" step={6} title="Livrer, ou jeter" />
        <p>
          La pull request est approuvée. Fusionner la branche apporte ses changements dans{" "}
          <code>main</code>. Le merge est la seule façon dont une branche protégée change : c’est
          donc le seul chemin par lequel les nouveaux prix atteignent les vraies données.
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
          <code>main</code> stocke maintenant les prix en centimes, la copie a disparu, et la clé du
          relecteur ne fonctionne plus. Si <code>main</code> avait modifié le même fichier
          entre-temps, le merge n’aurait rien enregistré et aurait listé ce fichier dans{" "}
          <code>conflicts</code>.
        </p>
        <p>
          Tout changement fait sur une copie n’a pas vocation à être livré. Les commandes de test
          passées en cliquant dans une preview, par exemple. Dans ce cas, sautez le merge et
          supprimez simplement la branche. La copie disparaît, et <code>main</code> ne l’a jamais
          vue.
        </p>

        <Chapter id="every" title="Pour chaque pull request" />
        <p>
          Les étapes ci-dessus tiennent dans une petite fonction. Appelez-la depuis votre CI quand
          une pull request est ouverte, fusionnée ou fermée :
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
        <p>Quelques points à connaître quand plus de pull requests tournent en même temps :</p>
        <ul>
          <li>
            <b>Les copies sont rapides.</b> Créer une branche prend environ 13 ms, et un fork ne
            copie rien, quelle que soit la taille de vos données.
          </li>
          <li>
            <b>Les copies restent séparées.</b> Deux pull requests ouvertes en même temps ne voient
            chacune que leurs propres changements, jamais ceux de l’autre.
          </li>
          <li>
            <b>Les vraies données restent protégées.</b> <code>main</code> est protégée : elle ne
            change que quand une pull request est fusionnée.
          </li>
          <li>
            <b>Le nettoyage tient en un appel.</b> Supprimer la branche supprime la copie. Aucune
            base de données ni aucun bucket ne traîne, à retrouver plus tard.
          </li>
          <li>
            <b>Tout reste chez vous.</b> Chaque copie vit dans votre propre bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Chaque preview coûte-t-elle une copie complète des données ?",
              <p key="a">
                Non. Un fork ne copie rien. Il partage les fichiers de la branche dont il vient, et
                seuls les fichiers qu’écrit une pull request sont enregistrés à nouveau.
              </p>,
            ],
            [
              "Et si main a changé pendant que la pull request était ouverte ?",
              <p key="a">
                Si les fichiers modifiés sont différents, le merge les combine simplement. Si les
                deux ont modifié le même fichier, le merge n’enregistre rien, liste le fichier dans{" "}
                <code>conflicts</code>, et laisse la branche telle quelle. Forkez une copie neuve
                depuis le nouveau <code>main</code> et relancez le changement.
              </p>,
            ],
            [
              "Que deviennent les données de test créées dans une preview ?",
              <p key="a">
                Elles ne vivent que sur la branche de cette pull request. Supprimez la branche et
                elles disparaissent. Elles n’atteignent <code>main</code> que si vous fusionnez.
              </p>,
            ],
            [
              "Puis-je voir la copie telle qu’elle était avant un changement ?",
              <p key="a">
                Oui, tant que la branche existe. Chaque écriture est un commit : vous pouvez lire
                n’importe quel fichier tel qu’il était à un commit plus ancien. Après un merge, le
                changement reste dans l’historique de <code>main</code>.
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
        <p className="t-eyebrow text-muted-foreground">La méthode habituelle</p>
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
            <X className="size-3.5" /> Un seul staging partagé
          </span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Ce que nous allons construire</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>main</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            {prs.map((pr) => (
              <span key={pr} className={`${box} font-mono`}>
                {pr.replace("PR ", "pr-")}
              </span>
            ))}
            <span className="t-eyebrow px-1 text-signal">Une copie chacune</span>
          </span>
        </div>
      </div>
    </figure>
  );
}

/** The catalog on the pull request's copy, after the first try and after the fix. */
function TwoTries() {
  const products: [name: string, first: string, second: string][] = [
    ["Mug", "1200", "1200"],
    ["Tote bag", "null", "2400"],
    ["Cap", "1850", "1850"],
  ];
  return (
    <figure className="overflow-hidden rounded-xl border border-border">
      <div className="t-eyebrow grid grid-cols-[1fr_6rem_6rem] gap-3 border-b border-border bg-card px-5 py-3 text-muted-foreground">
        <span>pr-512 · centimes</span>
        <span className="text-right">1er essai</span>
        <span className="text-right text-signal">2e essai</span>
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
        main, tout du long : inchangée
      </p>
    </figure>
  );
}
