// Guide : comment laisser un agent modifier de vrais documents sur sa propre
// copie, relire chaque changement qu’il a fait, et ne laisser atteindre le vrai
// dossier que ce que vous approuvez.
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
        name="Agents de documents"
        title={title}
        dek="Un guide pas à pas pour donner à un agent sa propre copie des fichiers d’un client, relire tout ce qu’il a changé, et ne laisser atteindre le vrai dossier que ce que vous approuvez."
        meta={["12 min de lecture", "TypeScript", "Accessible aux débutants"]}
        cover={<ReviewCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Une seule ligne fausse dans le grand livre"],
          ["plan", "Ce que nous allons construire"],
          ["save", "1. Enregistrer le dossier et le verrouiller"],
          ["copy", "2. Donner à l’agent sa propre copie"],
          ["tools", "3. Lui donner des outils qui écrivent sur la copie"],
          ["review", "4. Lire ce qu’il a changé"],
          ["approve", "5. Corriger une ligne, approuver le reste"],
          ["record", "6. Garder la trace, annuler s’il le faut"],
          ["scale", "Pour chacun de vos clients"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Une seule ligne fausse dans le grand livre" />
        <p>
          Les agents reçoivent en général les mêmes accès que les personnes : le vrai dossier, avec
          le droit d’écrire. Pas de brouillon, pas de « êtes-vous sûr ? ». Ce que l’agent enregistre
          devient la nouvelle vérité, et après coup, difficile de savoir quelles lignes il a
          touchées. Une petite erreur, comme une réparation comptabilisée en équipement neuf, part
          avec le prochain rapport avant que quiconque ne la voie.{" "}
          <b>L’erreur est petite. L’installation ne laisse à personne la chance de la repérer.</b>
        </p>
        <p>
          Les solutions habituelles ont chacune un coût. Vous pouvez copier le dossier avant chaque
          run, mais les dossiers clients sont gros, les copies s’accumulent, et quelqu’un doit
          encore reporter les bons changements à la main. Ou vous pouvez laisser l’agent se
          contenter de suggérer des changements et les saisir vous-même. C’est sûr, mais vous
          refaites le travail. <b>On finit au tout ou rien :</b> faire entièrement confiance à
          l’agent, ou ne pas l’utiliser.
        </p>
        <TwoSetups />
        <p>
          Dans ce guide, nous ferons autrement. Le vrai dossier du client est verrouillé. L’agent
          travaille sur sa propre copie, qui ne coûte rien à créer, et chacun de ses enregistrements
          est consigné avec une raison. Vous lisez les changements, corrigez ce qui est faux, et
          approuvez. Rien n’atteint les vrais fichiers par un autre chemin.
        </p>

        <Chapter id="plan" title="Ce que nous allons construire" />
        <p>À la fin, vous aurez :</p>
        <div>
          <Checklist
            items={[
              "Le dossier d’un client enregistré et verrouillé, que même votre propre code ne peut pas modifier directement.",
              "Une clé d’agent qui n’accède qu’à ce seul client.",
              "Une copie privée pour chaque run d’agent, prête en 10 ms.",
              "Une liste claire de ce que l’agent a changé, commit par commit et ligne par ligne.",
              "Une étape d’approbation que vous seul pouvez franchir, et un moyen de l’annuler plus tard.",
            ]}
          />
        </div>
        <p>
          Il vous faut une clé d’API Skywake avec le rôle admin, et Node. Définissez{" "}
          <code>SKYWAKE_URL</code> et <code>SKYWAKE_KEY</code>, puis installez le SDK avec{" "}
          <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Enregistrer le dossier et le verrouiller" />
        <p>
          Notre exemple suivi sera la comptabilité d’Acme Bakery, un petit client. C’est un petit
          dossier : un grand livre, les factures du trimestre et une note du comptable.
        </p>
        <Tree
          root="acme-books"
          items={[
            ["ledger.csv", "le fichier que l’agent va modifier"],
            ["invoices/millers-flour-0711.txt"],
            ["invoices/coldchain-0802.txt"],
            ["invoices/oven-repair-0915.txt", "celle sur laquelle il se trompe"],
            ["notes.md", "« les petites réparations vont dans Repairs »"],
          ]}
        />
        <p>
          Chaque client a son propre namespace, un dépôt de fichiers. Dedans, nous enregistrons le
          dossier sur une branche appelée <code>main</code>. Une branche est une suite de versions
          enregistrées, comme une branche Git. Chaque enregistrement est un commit, et chaque commit
          est conservé.
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
          <code>start</code> est le commit que nous venons de créer. Gardez-le : il marque le point
          de départ de l’agent. La dernière ligne est la plus importante. Une branche protégée ne
          change <b>que par un merge</b>, donc même une écriture directe avec votre clé admin est
          refusée :
        </p>
        <Code
          file="output"
          code={`
branch \`main\` is protected; change it with a merge
`}
        />

        <Chapter id="copy" step={2} title="Donner à l’agent sa propre copie" />
        <p>
          L’agent ne doit pas utiliser votre clé. Nous lui en créons une, avec le rôle <b>write</b>,
          pour ce seul client, qui expire dans une semaine.
        </p>
        <p>
          Ensuite, l’agent forke <code>main</code>. Un fork est une nouvelle branche qui part
          exactement de là où se trouve l’ancienne. Il ne copie rien, il est donc prêt aussitôt,
          quelle que soit la taille du dossier.
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
          L’agent a maintenant <code>agent/q3-books</code>, une copie complète de la comptabilité
          d’Acme. Avec sa clé, il peut lire et écrire cette copie. Il ne peut pas écrire sur{" "}
          <code>main</code>, et s’il essaie d’ouvrir le dossier d’un autre client, la réponse est{" "}
          <code>no access</code>.
        </p>

        <Chapter id="tools" step={3} title="Lui donner des outils qui écrivent sur la copie" />
        <p>
          Votre agent travaille à travers des outils : de petites fonctions que le modèle a le droit
          d’appeler. Nous lui en donnons trois. Il peut lister les fichiers, en lire un, et en
          écrire un. Chaque outil pointe vers <code>work</code>, il n’a donc aucun moyen d’atteindre
          le vrai dossier.
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
          Regardez <code>write</code>. Il demande une <b>raison</b> à l’agent, et cette raison
          devient le message de commit. Chaque changement arrive donc avec les propres mots de
          l’agent pour expliquer pourquoi il l’a fait.
        </p>
        <Note title="Astuce : un changement par écriture">
          <p>
            Dans votre prompt, demandez à l’agent de faire un seul changement par écriture et de
            l’expliquer en une phrase courte. De petits commits aux raisons claires sont bien plus
            faciles à relire qu’un gros enregistrement à la fin.
          </p>
        </Note>
        <p>
          Donnez maintenant les outils à votre modèle et laissez-le travailler. Dans notre run,
          l’agent a ajouté trois lignes à <code>ledger.csv</code>, une par facture, et écrit un
          nouveau fichier, <code>q3-summary.md</code>. Cela fait deux commits sur sa copie.{" "}
          <code>main</code> n’a pas changé du tout.
        </p>

        <Chapter id="review" step={4} title="Lire ce qu’il a changé" />
        <p>
          Le run est terminé. C’est votre tour, avec votre propre clé. D’abord, le récit du run : ce
          que chaque commit a changé depuis <code>start</code>, dans l’ordre.
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
          <code>changes</code> liste les commits un par un. <code>diff</code> en donne la somme :
          chaque fichier que l’agent a ajouté, supprimé ou modifié, comparé au point de départ de sa
          copie.
        </p>
        <RunLog />
        <p>
          La synthèse est nouvelle, il suffit donc de la lire. Le grand livre a été modifié, alors
          vous voulez voir les lignes exactes. Lisez le fichier sur les deux branches et gardez les
          lignes nouvelles :
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
          <code>added</code> contient les trois nouvelles lignes. Deux sont justes. La troisième
          comptabilise la réparation du four en <code>Equipment</code>, alors que les notes d’Acme
          disent que les petites réparations vont dans <code>Repairs</code>.
        </p>

        <Chapter id="approve" step={5} title="Corriger une ligne, approuver le reste" />
        <p>
          Inutile de jeter le run pour une seule mauvaise ligne. Corrigez-la sur la copie de
          l’agent, en un commit de plus avec votre propre raison. Puis faites le merge : apportez
          les changements de la copie dans <code>main</code>.
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
          Le dry run n’enregistre rien. Il vous dit seulement si le merge entrerait en conflit avec
          quelque chose qui a changé sur <code>main</code> entre-temps. Ici, la voie est libre, et
          le vrai merge passe : le grand livre sur <code>main</code> contient maintenant les trois
          lignes, avec votre correction, et la synthèse est là aussi.
        </p>
        <ReviewedLines />
        <p>
          Un dernier point rend tout cela sûr. Fusionner dans une branche protégée exige le rôle{" "}
          <b>admin</b>. Si l’agent essaie de fusionner sa propre copie, il reçoit{" "}
          <code>this needs the `admin` role</code>. L’agent peut faire le travail. Vous seul pouvez
          l’approuver.
        </p>

        <Chapter id="record" step={6} title="Garder la trace, annuler s’il le faut" />
        <p>
          Des semaines plus tard, un client demande pourquoi la réparation du four figure dans
          Repairs. Chaque version du grand livre est conservée, avec le message qui l’a créée :
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
          La version la plus récente est <code>Approve Q3 books</code>, et avant elle,{" "}
          <code>Acme books before the Q3 close</code>. L’approbation est un commit de merge, qui
          garde la trace du commit qu’il a apporté.
        </p>
        <p>
          Vous changez d’avis après avoir approuvé ? <code>main</code> ne change toujours que par un
          merge, alors annulez de la même façon : forkez-le, faites un revert de l’approbation sur
          le fork, puis fusionnez le résultat. Un revert est un nouveau commit qui rétablit ce qu’un
          ancien avait changé.
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
          Le grand livre revient à son état d’avant le run, et l’annulation figure elle aussi dans
          l’historique. Et si un run ne vous plaît pas du tout, vous n’avez besoin de rien de tout
          ça. Supprimez sa branche, et <code>main</code> ne l’aura jamais vu :
        </p>
        <Code
          file="reject.ts"
          code={`
await acme.branch("agent/q4-draft").delete();
`}
        />

        <Chapter id="scale" title="Pour chacun de vos clients" />
        <p>
          Un seul client, c’est le cas facile. Quelques points à connaître quand vous passez à des
          centaines de clients et à de nombreux runs par jour :
        </p>
        <ul>
          <li>
            <b>Un namespace par client.</b> Nommez-les <code>clients/acme</code>,{" "}
            <code>clients/globex</code>, et donnez à chaque agent une clé pour le seul client sur
            lequel il travaille.
          </li>
          <li>
            <b>Les copies restent instantanées.</b> Un fork ne copie rien, une copie de 20 000
            fichiers est donc prête en environ 10 ms.
          </li>
          <li>
            <b>Des clés à courte durée de vie.</b> Faites expirer la clé de l’agent peu après le
            job, pour qu’une vieille clé ne puisse pas servir au suivant.
          </li>
          <li>
            <b>Faites le ménage dans les branches.</b> Supprimez la branche d’un run une fois
            fusionnée ou rejetée. <code>main</code> garde son propre historique, approbation
            comprise.
          </li>
          <li>
            <b>Tout reste chez vous.</b> Chaque version de chaque fichier vit dans votre propre
            bucket.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "L’agent peut-il approuver son propre travail ?",
              <p key="a">
                Non. Sa clé a le rôle write, et fusionner dans une branche protégée exige le rôle
                admin. L’agent ne peut modifier que sa propre copie.
              </p>,
            ],
            [
              "Et si deux runs modifient le même fichier ?",
              <p key="a">
                Le premier merge passe. Le dry run du second nomme le fichier en conflit, et rien
                n’est enregistré. Lisez les deux versions, puis refaites le merge avec{" "}
                <code>resolve</code>, en prenant l’un des deux côtés ou en écrivant le texte
                vous-même.
              </p>,
            ],
            [
              "Un agent peut-il voir les fichiers d’un autre client ?",
              <p key="a">
                Pas si vous limitez sa clé. Une clé créée pour <code>clients/acme</code> reçoit
                « accès refusé » sur tous les autres namespaces.
              </p>,
            ],
            [
              "Pourquoi un nouveau dossier apparaît-il comme un seul changement ?",
              <p key="a">
                Un diff liste un dossier ajouté ou supprimé une seule fois, et non une fois par
                fichier qu’il contient. Utilisez <code>walk</code> sur la branche de l’agent pour
                voir chacun de ses fichiers.
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

/** The cover: an agent's run waiting for review, file by file. */
function ReviewCover() {
  return (
    <div className="grid">
      <div className={ROW}>
        <GitBranch className="size-3.5 text-muted-foreground" /> agent/q3-books
        <ArrowRight className="size-3 text-muted-foreground" /> main
        <span className="ml-auto flex items-center gap-1 rounded-full bg-signal/12 px-2 text-[12px] leading-5 text-signal">
          En attente de vous
        </span>
      </div>
      {[
        ["modifié", "ledger.csv", "+3 lignes"],
        ["ajouté", "q3-summary.md", "nouveau fichier"],
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

/** Today's setup next to this one: the agent writes the real files, or it writes a copy you approve. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">L’installation habituelle</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Écrit directement
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Vrais fichiers du client</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Ce que nous allons construire</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Sa propre copie</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-signal/40 bg-signal/5 px-3 py-2 text-signal">
            <Check className="size-3.5" /> Vous approuvez
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={`${box} flex items-center gap-1.5`}>
            <Lock className="size-3.5 text-muted-foreground" /> Vrais fichiers du client
          </span>
        </div>
      </div>
    </figure>
  );
}

/** The agent's run as the reviewer first sees it: each commit, its reason and its file. */
function RunLog() {
  const commits = [
    ["Saisir 3 factures fournisseurs du T3", "ledger.csv", "modified"],
    ["Rédiger la synthèse du T3", "q3-summary.md", "added"],
  ];
  return (
    <figure className="rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">agent/q3-books, depuis start</p>
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

/** The ledger lines the agent added, with the one you fixed before approving. */
function ReviewedLines() {
  const line = "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-[12px]";
  return (
    <figure className="grid gap-2 rounded-xl border border-border p-5">
      <p className="t-eyebrow mb-1 text-muted-foreground">ledger.csv sur main, après approbation</p>
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
      <span className="t-eyebrow pl-1 text-signal">Corrigé par vous · approuvé en un merge</span>
    </figure>
  );
}
