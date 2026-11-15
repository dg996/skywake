// Guide : comment bâtir une grande base de connaissances que vos agents peuvent
// interroger, et qui reste à jour dès qu’un document change. À lire du début à la fin.
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
        name="Base de connaissances"
        title={title}
        dek="Un guide pas à pas pour donner à vos agents des millions de documents qu’ils peuvent chercher, consulter et citer."
        meta={["15 min de lecture", "TypeScript", "Accessible aux débutants"]}
        cover={<KnowledgeCover />}
      />

      <Article
        locale={locale}
        toc={[
          ["start", "Pourquoi c’est plus dur qu’il n’y paraît"],
          ["plan", "Ce que nous allons construire"],
          ["save", "1. Rassembler vos documents"],
          ["index", "2. Créer un index de recherche à côté"],
          ["fill", "3. Remplir l’index"],
          ["tool", "4. Donner un outil de recherche à l’agent"],
          ["update", "5. Rester à jour"],
          ["drafts", "6. Tester les gros changements sur un brouillon"],
          ["scale", "Passer à des millions de documents"],
          ["questions", "Questions"],
        ]}
      >
        <Chapter id="start" title="Pourquoi c’est plus dur qu’il n’y paraît" />
        <p>
          Donner à un agent les connaissances de votre entreprise semble simple, et la première
          version fonctionne souvent en un après-midi. Les ennuis commencent quelques semaines plus
          tard, quand un document change et que l’agent continue de citer l’ancien. La plupart des
          installations gardent deux copies de vos connaissances : les documents eux-mêmes, et une
          base de recherche construite à partir d’eux. Quand les deux divergent, l’agent répond
          toujours, mais à partir d’un vieux texte.{" "}
          <b>Le document était juste. L’agent en a lu une vieille copie.</b>
        </p>
        <p>
          Les solutions paraissent simples. Ajouter un job qui garde les deux synchronisés, ou se
          passer de la base et laisser les agents lire les fichiers directement depuis un bucket de
          stockage objet. Les deux se compliquent à mesure que vos connaissances grandissent. Le job
          de synchro a plus à copier et plus de façons d’échouer. Et un bucket n’est pas un
          dossier : avant qu’un agent puisse ouvrir un fichier, il doit le télécharger.{" "}
          <b>Une base de connaissances d’entreprise pèse souvent des centaines de gigaoctets.</b>
        </p>
        <TwoSetups />
        <p>
          Dans ce guide, nous allons la construire autrement. Les documents et leur index de
          recherche vivent <b>dans le même bucket</b>, liés à la même version de vos documents. Il
          n’y a pas de seconde copie qui prend du retard, et les agents ne lisent que les parties
          d’un fichier dont ils ont besoin.
        </p>

        <Chapter id="plan" title="Ce que nous allons construire" />
        <p>À la fin, vous aurez :</p>
        <div>
          <Checklist
            items={[
              "Vos documents enregistrés sur une branche, chaque changement gardé comme un commit.",
              "Un index de recherche à côté, qui trouve les réponses par le sens et par les mots exacts.",
              "Un seul outil de recherche que votre agent peut appeler, et qui vous dit quel fichier il a utilisé.",
              "Un moyen de modifier un document et que l’agent le voie aussitôt.",
              "Des brouillons, pour tester les grosses réécritures avant que vos clients ne les voient.",
            ]}
          />
        </div>
        <p>
          Il vous faut une clé d’API Skywake et Node. Définissez <code>SKYWAKE_URL</code> et{" "}
          <code>SKYWAKE_KEY</code>, puis installez le SDK avec <code>npm i @skywake/sdk</code>.
        </p>

        <Chapter id="save" step={1} title="Rassembler vos documents" />
        <p>
          Partez du dossier que vous avez déjà. Le Markdown ou le texte brut fonctionnent le mieux :
          ce que votre centre d’aide exporte. Le nôtre ressemble à ceci :
        </p>
        <Tree
          root="help-center"
          items={[
            ["billing/refunds.md", "celui qui va changer"],
            ["billing/invoices.md"],
            ["plans/annual.md"],
            ["account/reset-password.md"],
            ["account/sso.md"],
          ]}
        />
        <p>
          Nous allons l’enregistrer sur une branche appelée <code>main</code>. Voyez une branche
          comme une branche Git pour fichiers : chaque enregistrement est un commit, et vous pouvez
          toujours revenir en arrière pour voir ce qui a changé.
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
          C’est tout. <code>main</code> est désormais la seule copie de référence de vos documents,
          stockée dans votre propre bucket.
        </p>

        <Chapter id="index" step={2} title="Créer un index de recherche à côté" />
        <p>
          Passons à l’index. Pour chaque document, il garde deux choses : le <b>texte</b>, pour
          trouver les mots exacts, et un <b>vecteur</b>, une liste de nombres qui capture le sens du
          texte.
        </p>
        <p>
          Pourquoi les deux ? Vos clients demandent « puis-je récupérer mon argent ? » alors que
          votre document parle de « remboursement ». La recherche par le sens trouve ça. Ils tapent
          aussi « SSO » ou un code d’erreur, et la recherche par mots le trouve mieux. Une bonne
          base de connaissances a besoin des deux.
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
          Remarquez la ligne <code>embed</code>. Vous nommez un modèle une fois, et ensuite vous
          envoyez du texte brut. Le serveur crée les vecteurs pour vous.
        </p>

        <Chapter id="fill" step={3} title="Remplir l’index" />
        <p>
          Copions maintenant chaque document dans l’index. <code>syncIndex</code> lit la branche et
          écrit un document par fichier. Nous lui disons comment transformer un fichier en
          document : son chemin sert d’id, et son texte va dans les deux colonnes.
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
          Le premier passage envoie tous les fichiers. Il renvoie <code>synced.head</code>, le
          commit jusqu’auquel il a synchronisé. Gardez cette valeur. La fois suivante, vous la
          repassez, et seuls les fichiers modifiés depuis sont envoyés. Les fichiers supprimés
          disparaissent aussi de l’index.
        </p>

        <Chapter id="tool" step={4} title="Donner un outil de recherche à l’agent" />
        <p>
          Votre agent n’a besoin que d’un outil : chercher dans les documents. Nous lancerons les
          deux types de recherche en un seul appel, ce qu’on appelle une recherche <b>hybride</b>.
          Les documents trouvés par les deux sont classés en tête, si bien qu’une question posée
          avec les mots du client tombe quand même sur la bonne page.
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
          L’id de chaque résultat est le chemin du fichier. Donnez <code>searchDocs</code> à votre
          agent comme outil, laissez-le lire les fichiers qu’il reçoit, et demandez-lui de nommer le
          fichier qu’il a utilisé.
        </p>
        <Note title="Astuce : citez toujours le fichier">
          <p>
            Quand une réponse semble fausse, le nom du fichier vous dit exactement quel document
            corriger. Cela renforce aussi la confiance des personnes qui lisent les réponses.
          </p>
        </Note>

        <Chapter id="update" step={5} title="Rester à jour" />
        <p>
          Voici la partie qui cassait dans l’ancienne installation. La politique de remboursement
          change. Modifiez le document, faites un commit, et synchronisez depuis le dernier head :
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
          Seul <code>billing/refunds.md</code> est renvoyé. Posez la même question à l’agent, et la
          réponse a changé :
        </p>
        <Answers />
        <p>
          Lancez la synchro juste après chaque commit, depuis le code qui fait le commit. Il n’y a
          pas de job séparé à surveiller, ni de nuit où il s’arrête sans bruit.
        </p>

        <Chapter id="drafts" step={6} title="Tester les gros changements sur un brouillon" />
        <p>
          Les petites modifications peuvent aller directement sur <code>main</code>. Mais imaginons
          qu’une nouvelle grille tarifaire sorte le mois prochain et que la moitié de vos documents
          de facturation changent. Vous voulez voir comment l’agent répond avant qu’un client ne le
          fasse.
        </p>
        <p>
          Forkez les documents et l’index dans un brouillon. Un fork ne copie rien, il est donc
          instantané même avec des milliers de documents. Pendant tout ce temps, vos clients
          continuent d’obtenir leurs réponses depuis <code>main</code>.
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
          Pointez un agent de test sur le brouillon et posez-lui les questions que vos clients
          posent le plus. Quand les réponses vous conviennent, fusionnez : les nouveaux documents et
          leur index passent en ligne au même instant.
        </p>

        <Chapter id="scale" title="Passer à des millions de documents" />
        <p>
          Tout ce qui précède fonctionne de la même façon avec cinq documents ou cinq millions.
          Quelques points à connaître quand la base grandit :
        </p>
        <ul>
          <li>
            <b>Les synchros restent petites.</b> Chaque synchro n’envoie que ce qui a changé : une
            grosse base de connaissances ne coûte pas plus cher à mettre à jour qu’une petite.
          </li>
          <li>
            <b>La recherche reste rapide.</b> Une requête à chaud sur 10 millions de vecteurs prend
            environ 10 ms.
          </li>
          <li>
            <b>Les brouillons restent instantanés.</b> Un fork ne copie rien, quelle que soit la
            taille.
          </li>
          <li>
            <b>Tout reste chez vous.</b> Documents et index vivent dans votre propre bucket. Pas de
            seconde base de données à faire tourner ni à payer.
          </li>
        </ul>

        <Chapter id="questions" title="Questions" />
        <Questions
          items={[
            [
              "Dois-je créer les embeddings moi-même ?",
              <p key="a">
                Non. Vous nommez un modèle sur l’index, vous envoyez du texte, et le serveur crée
                les embeddings. Vous pouvez toujours envoyer vos propres vecteurs si vous préférez.
              </p>,
            ],
            [
              "En combien de temps un changement apparaît-il dans la recherche ?",
              <p key="a">
                Dès que la synchro l’écrit. La recherche par mots voit chaque document écrit, y
                compris les plus récents.
              </p>,
            ],
            [
              "Puis-je voir ce que l’agent a lu la semaine dernière ?",
              <p key="a">
                Oui. Chaque commit des documents est conservé, vous pouvez donc ouvrir la version
                exacte dont vient une réponse.
              </p>,
            ],
            [
              "Et les documents très longs ?",
              <p key="a">
                Découpez-les en sections avant de les indexer, un document par section, pour que
                chaque résultat mène l’agent à la bonne partie de la page.
              </p>,
            ],
          ]}
        />
      </Article>
    </>
  );
}

/** The cover: the search the reader is about to build. */
function KnowledgeCover() {
  const Search = SNIPPETS[0]!;
  return <Search tone="blue" />;
}

/** Today's setup next to the Skywake one: a sync job that can break, then no sync job at all. */
function TwoSetups() {
  const box = "t-small rounded-lg border border-border bg-card px-3 py-2 text-foreground";
  return (
    <figure className="grid gap-6 rounded-xl border border-border p-5">
      <div>
        <p className="t-eyebrow text-muted-foreground">L’installation habituelle</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className={box}>Documents</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className="t-small flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--love)] px-3 py-2 text-[color:var(--love)]">
            <X className="size-3.5" /> Job de synchro
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Base de recherche</span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
      <div>
        <p className="t-eyebrow text-muted-foreground">Ce que nous allons construire</p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <span className="flex flex-wrap items-center gap-2 rounded-xl border border-signal/40 bg-signal/5 p-2">
            <span className={box}>Documents</span>
            <span className={box}>Leur index</span>
            <span className="t-eyebrow px-1 text-signal">Un seul bucket</span>
          </span>
          <ArrowRight className="size-4 text-muted-foreground" />
          <span className={box}>Agent</span>
        </div>
      </div>
    </figure>
  );
}

/** The same question asked before and after the change. */
function Answers() {
  const bubble = "t-small max-w-[34ch] rounded-2xl px-4 py-2.5";
  return (
    <figure className="grid gap-3 rounded-xl border border-border p-5">
      <p className={`${bubble} ml-auto bg-foreground text-background`}>
        Puis-je être remboursé de mon abonnement annuel ?
      </p>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-muted-foreground line-through decoration-1`}>
          Oui, dans les 60 jours suivant l’achat.
        </p>
        <span className="t-eyebrow pl-1 text-muted-foreground">Avant le changement</span>
      </div>
      <div className="grid gap-1">
        <p className={`${bubble} bg-card text-foreground`}>
          Oui, intégralement, dans les 30 jours suivant l’achat.
        </p>
        <span className="t-eyebrow pl-1 text-signal">Après · d’après billing/refunds.md</span>
      </div>
    </figure>
  );
}
