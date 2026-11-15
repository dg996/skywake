// Guide : comment lancer de longs jobs d’agent sur des sandboxes qui peuvent
// mourir, en enregistrant chaque étape et en reprenant le job sur une nouvelle
// machine. À lire du début à la fin.
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
        name="Stockage d’agents et sandboxes"
        title={title}
        dek="Un guide pas à pas pour enregistrer le travail d’un agent au fil de l’eau, afin qu’une nouvelle sandbox reprenne le job exactement là où l’ancienne a planté."
        meta={["12 min de lecture", "TypeScript", "Accessible aux débutants"]}
        cover={<SandboxCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Pourquoi les sandboxes perdent du travail"],
          ["plan", "Ce que nous allons construire"],
          ["base", "1. Enregistrer le workspace de base une fois"],
          ["fork", "2. Donner sa propre branche à la sandbox"],
          ["session", "3. Dire qui travaille dessus"],
          ["work", "4. Enregistrer après chaque étape"],
          ["resume", "5. Reprendre le job sur une nouvelle machine"],
          ["finish", "6. Garder le résultat, jeter la sandbox"],
          ["scale", "Faire tourner beaucoup de sandboxes"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Pourquoi les sandboxes perdent du travail" />
        <p>
          Les sandboxes sont des machines bon marché, éphémères, qu’on peut jeter. C’est idéal pour
          la sécurité, et mauvais pour les longs jobs. Tout ce qu’un agent écrit vit sur le disque
          de la sandbox, et quand la machine est reprise, le disque part avec. Le job recommence
          depuis le début.{" "}
          <b>Le travail était fait. Il était juste gardé sur un disque qui n’existe plus.</b>
        </p>
        <p>
          Les solutions habituelles laissent chacune un trou. Copiez les fichiers dans un bucket à
          la fin du job, et un plantage avant la fin fait tout perdre. Envoyez-les toutes les
          quelques minutes, et vous perdez les dernières minutes. Pire, la note qui indique où en
          est le job peut prendre de l’avance sur les fichiers vraiment enregistrés : la machine
          suivante saute alors du travail, ou le refait.
        </p>
        <TwoSetups />
        <p>
          Dans ce guide, nous donnerons à la sandbox un dossier de travail enregistré dans votre
          propre bucket, par petites sauvegardes après chaque étape. Chaque sauvegarde contient le
          fichier modifié <b>et</b> une note sur l’avancement du job, ensemble. Quand une machine
          meurt, une nouvelle ouvre le même dossier et continue depuis la dernière sauvegarde.
        </p>

        <Chapter id="plan" title="Ce que nous allons construire" />
        <p>À la fin, vous aurez :</p>
        <div>
          <Checklist
            items={[
              "Un workspace de base, enregistré une fois, dont part chaque sandbox.",
              "Une branche par sandbox, pour que chaque job travaille sur sa propre copie.",
              "Une sauvegarde après chaque étape, avec le fichier et la note d’avancement ensemble.",
              "Un moyen de voir quelle sandbox est vivante, et laquelle s’est arrêtée.",
              "Un job planté qui continue depuis sa dernière sauvegarde sur une nouvelle machine.",
            ]}
          />
        </div>
        <p>
          Il vous faut une clé d’API Skywake et Node. Définissez <code>SKYWAKE_URL</code> et{" "}
          <code>SKYWAKE_KEY</code>, puis installez le SDK avec <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="base" step={1} title="Enregistrer le workspace de base une fois" />
        <p>
          Dans notre exemple, chaque sandbox part du même projet : l’app de la boutique, avec ses 40
          fichiers de test encore écrits pour l’ancien runner.
        </p>
        <Tree
          root="workspace"
          items={[
            ["package.json"],
            ["src/cart.js"],
            ["tests/t01.test.js", "le premier des 40"],
            ["tests/…"],
            ["tests/t40.test.js"],
          ]}
        />
        <p>
          Nous l’enregistrons une fois, sur une branche appelée <code>base</code>. Une branche est
          une suite de versions enregistrées d’un dossier, comme une branche Git pour fichiers.
          Chaque enregistrement est un commit.
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
          Le namespace <code>sandboxes/shop-app</code> contient les branches de ce projet. Cette
          étape se fait une seule fois, pas une fois par sandbox.
        </p>

        <Chapter id="fork" step={2} title="Donner sa propre branche à la sandbox" />
        <p>
          Quand une sandbox démarre, elle reçoit sa propre branche, qui porte son nom. Nous la
          créons avec un <b>fork</b> : une nouvelle branche qui part exactement de là où se trouve{" "}
          <code>base</code>. Un fork ne copie rien, il est donc prêt aussitôt, quelle que soit la
          taille du workspace.
        </p>
        <Code
          file="new-sandbox.ts"
          code={`
const sandbox = await base.fork("sb-1842");
await sandbox.checkout("./sandbox");
`}
        />
        <p>
          <code>checkout</code> écrit les fichiers de la branche dans un dossier normal sur le
          disque de la sandbox. L’agent y travaille avec ses outils habituels. Les autres sandboxes
          ont leurs propres forks, elles ne touchent donc jamais aux fichiers des autres.
        </p>

        <Chapter id="session" step={3} title="Dire qui travaille dessus" />
        <p>
          Plus tard, une nouvelle machine devra savoir une chose : l’ancienne sandbox a-t-elle
          vraiment disparu, ou est-elle juste lente ? Deux petites idées répondent à cette question.
        </p>
        <p>
          Une <b>session</b> est un battement de cœur. Tant que la sandbox est vivante, elle dit à
          Skywake « toujours là » toutes les 20 secondes. Si une minute passe sans signal, la
          session prend fin. Un <b>claim</b> est une note sur la branche qui indique quelle session
          y travaille. Il prend fin avec la session.
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
          Le chemin vide réserve toute la branche. Chaque sauvegarde que nous ferons ensuite porte
          aussi l’id de la session, si bien que l’historique montre quelle machine a fait quoi.
        </p>

        <Chapter id="work" step={4} title="Enregistrer après chaque étape" />
        <p>
          Passons au job lui-même. L’agent traite les fichiers de test dans l’ordre. Après chacun,
          nous enregistrons deux fichiers en un seul commit : le test qu’il vient de modifier, et{" "}
          <code>progress.json</code>, une toute petite note qui indique combien de fichiers sont
          faits.
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
          Ici, <code>migrate</code> représente votre agent : il réécrit un fichier sur place. La
          boucle part de <code>progress.done</code> : sur une sandbox neuve, elle commence au
          premier fichier, et après un plantage, juste après le dernier enregistré.
        </p>
        <p>
          L’important, c’est que le test et la note partent dans le <b>même commit</b>. Un commit
          est enregistré en entier ou pas du tout. La note ne peut donc jamais dire 31 alors que
          seuls 29 fichiers sont enregistrés.
        </p>
        <Note title="Astuce : rendez chaque étape rejouable sans risque">
          <p>
            Si la machine meurt pendant que l’agent est au milieu d’un fichier, ce fichier n’était
            pas encore enregistré. La nouvelle machine le refera. Écrivez des étapes qui donnent le
            même résultat si elles tournent deux fois, et cela ne vous coûtera qu’une étape, pas un
            fichier cassé.
          </p>
        </Note>

        <Chapter id="resume" step={5} title="Reprendre le job sur une nouvelle machine" />
        <p>
          Imaginons maintenant que la machine soit reprise après le fichier 31. Ses battements de
          cœur s’arrêtent, et environ une minute plus tard, sa session prend fin et le claim avec.
        </p>
        <p>
          Une nouvelle sandbox démarre sur une autre machine. Créez le client comme à l’étape 1,
          puis ouvrez la même branche :
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
          Nous attendons que plus personne ne réserve la branche, pour que deux machines n’y
          travaillent jamais en même temps. Ensuite, le checkout ramène chaque fichier enregistré,
          et <code>progress.json</code> indique 31.
        </p>
        <p>
          Relancez maintenant le code des étapes 3 et 4, sans rien changer. La nouvelle machine
          démarre sa propre session, réserve la branche, et la boucle reprend au fichier 32.
        </p>
        <Timeline />

        <Chapter id="finish" step={6} title="Garder le résultat, jeter la sandbox" />
        <p>
          Quand le dernier fichier est fait, le job est terminé. La note d’avancement a rempli son
          rôle, nous la supprimons donc. Puis nous regardons ce qui a changé, et nous faisons un{" "}
          <b>merge</b> de la sandbox dans <code>base</code>, ce qui apporte ses changements dans
          cette branche.
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
          Le diff liste les 40 tests, et rien d’autre. Après le merge, la prochaine sandbox qui
          forke <code>base</code> démarre avec les nouveaux tests. La branche de la sandbox est
          supprimée, et la machine peut être jetée sans rien à perdre dessus.
        </p>
        <p>
          Si le résultat du job n’est pas destiné à <code>base</code>, sautez le merge. Lisez ce
          dont vous avez besoin sur la branche, puis supprimez-la.
        </p>

        <Chapter id="scale" title="Faire tourner beaucoup de sandboxes" />
        <p>
          Les mêmes étapes valent pour une sandbox ou pour mille. Quelques points à connaître à
          mesure que vous grandissez :
        </p>
        <ul>
          <li>
            <b>Une base, beaucoup de forks.</b> Chaque sandbox forke la même base. Un fork ne copie
            rien : environ 95 ms pour un workspace de n’importe quelle taille.
          </li>
          <li>
            <b>Enregistré veut dire enregistré.</b> Tuer une machine avec <code>kill -9</code> ne
            perd aucune écriture enregistrée. Seule l’étape en cours est rejouée.
          </li>
          <li>
            <b>Voyez qui est vivant.</b> <code>app.sessions()</code> liste les sandboxes qui
            envoient encore des battements de cœur. Une branche sans claim est libre pour qu’une
            nouvelle machine la reprenne.
          </li>
          <li>
            <b>Nettoyez au fur et à mesure.</b> Supprimez la branche de chaque sandbox quand son job
            est terminé. La base reste.
          </li>
          <li>
            <b>Tout reste chez vous.</b> Chaque sauvegarde arrive dans votre propre bucket, pas sur
            une machine louée pour une heure.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Et si la machine meurt au milieu d’une sauvegarde ?",
              <p key="a">
                Un commit est enregistré en entier ou pas du tout. Comme le fichier et sa note
                d’avancement partent dans le même commit, la nouvelle machine les trouve toujours
                d’accord.
              </p>,
            ],
            [
              "Et le travail que l’agent avait fait sans l’avoir encore enregistré ?",
              <p key="a">
                Il est perdu avec la machine, et cette étape est rejouée. Enregistrez après chaque
                étape qui a pris du temps, comme un appel au modèle ou un long build.
              </p>,
            ],
            [
              "La nouvelle machine peut-elle démarrer en moins d’une minute ?",
              <p key="a">
                Oui. Passez un délai plus court au démarrage de la session, par exemple{" "}
                <code>app.startSession(label, 15)</code>, et envoyez les battements de cœur plus
                souvent en conséquence, par exemple <code>session.keepAlive(5_000)</code>. La
                session prend alors fin 15 secondes après le dernier battement.
              </p>,
            ],
            [
              "Puis-je annuler une étape qui a mal tourné ?",
              <p key="a">
                Oui. Chaque sauvegarde est un commit, et <code>sandbox.log()</code> les liste.
                Appelez <code>sandbox.reset(commit)</code> pour remettre les fichiers dans l’état de
                ce commit, sous forme d’un nouveau commit par-dessus.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the sandbox branch's history, across the crash. */
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

/** The usual sandbox next to ours: work stuck on a disk that dies, then work saved as it goes. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">L’installation habituelle</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Disque de la sandbox</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> La machine meurt
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Retour au fichier 1</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Ce que nous allons construire</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Agent</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Branche de la sandbox</span>
            <span className="t-eyebrow px-1 text-signal">Enregistrée à chaque étape</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>N’importe quelle machine, dès le fichier 32</span>
        </div>
      </div>
    </figure>
  );
}

/** The 40 files of the job: 31 saved by the machine that died, the rest by the next one. */
function Timeline() {
  const files = Array.from({ length: 40 }, (_, i) => i + 1);
  return (
    <figure className="grid gap-4 rounded-xl border border-border p-5">
      <p className="t-eyebrow text-muted-foreground">Un job, deux machines</p>
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
          Fichiers 1 à 31 · enregistrés par la machine A avant sa mort
        </p>
        <p className="flex items-center gap-2">
          <span className="size-2.5 rounded-[2px] bg-signal" />
          <span className="text-foreground">
            Fichiers 32 à 40 · machine B, depuis la dernière sauvegarde
          </span>
        </p>
      </div>
    </figure>
  );
}
