import type { HomeMessages } from "./types";

export const fr: HomeMessages = {
  pages: {
    "/": {
      title: "Skywake : filesystem et moteur de recherche évolutifs pour agents IA",
      description:
        "Filesystem open source et recherche hybride sur votre bucket S3. Un workspace par agent en quelques millisecondes, monté comme un disque local.",
    },
    "/filesystem": {
      title: "Filesystem S3 pour agents IA : monter, copier, fusionner",
      description:
        "Montez S3 ou tout stockage objet comme un disque local rapide. 20 000 fichiers copiés pour chaque agent en 10 ms, puis diff et merge comme avec Git.",
    },
    "/search": {
      title: "Recherche vectorielle et full-text sur S3",
      description:
        "Recherche vectorielle, full-text et hybride directement sur votre stockage objet. 10 ms à chaud sur 10M de vecteurs, sans base de données à gérer.",
    },
    "/use-cases": {
      title: "Cas d'usage : bases de connaissances, mémoire d'agents, agents de code",
      description:
        "Bases de connaissances, mémoire d'agents, sandboxes, agents de code et de documents, évals, CI et datasets : Skywake pas à pas.",
    },
    "/pricing": {
      title: "Tarifs",
      description:
        "L’auto-hébergement est gratuit, avec toutes les fonctionnalités et sans limite. Skywake Cloud est en bêta privée.",
    },
    "/privacy": {
      title: "Confidentialité",
      description: "Ce que ce site collecte, pourquoi, et comment le faire supprimer.",
    },
    "/terms": {
      title: "Conditions",
      description: "Les conditions d'utilisation de ce site et du logiciel Skywake.",
    },
    "/benchmarks": {
      title: "Benchmarks",
      description:
        "Mesuré sur AWS, bucket dans la même région : copies d'agents, uploads, builds et recherche sur 10M de vecteurs.",
    },
  },
  nav: {
    filesystem: "Filesystem",
    search: "Recherche",
    benchmarks: "Benchmarks",
    pricing: "Tarifs",
    docs: "Docs",
    github: "GitHub",
    joinWaitlist: "Liste d'attente",
    getStarted: "Commencer",
    language: "Langue",
    menu: "Menu",
    sections: "Sections",
    theme: "Basculer entre thème clair et sombre",
  },
  footer: {
    blurb:
      "Votre bucket comme disque rapide et moteur de recherche. Open source, sur votre propre stockage objet.",
    product: "Produit",
    project: "Projet",
    legal: "Mentions légales",
    useCases: "Cas d'usage",
    openSource: "Open source",
    privacy: "Confidentialité",
    terms: "Conditions",
    star: "Étoiler sur GitHub",
  },
  hero: {
    badge: "Skywake Cloud arrive. Rejoignez la liste d'attente",
    titleBefore: "Le filesystem et moteur de recherche évolutifs",
    titleAccent: "pour agents IA.",
    screenshotAlt:
      "La console Skywake, avec les disques d'une équipe et les agents qui y travaillent",
    getStartedCta: "Commencer",
  },
  useCases: {
    label: "Cas d'usage",
    heading: [
      "Concentrez-vous sur des agents de pointe.",
      "Skywake s'occupe de la couche de données.",
    ],
    more: "Voir tous les cas d'usage",
    cta: "En savoir plus",
    items: [
      {
        name: "Base de connaissances",
        title: "Une base de connaissances pour vos agents.",
        line: "Vos documents et fichiers au même endroit, recherche incluse. Les agents trouvent toujours la dernière version, jamais une vieille copie.",
      },
      {
        name: "Couche de contexte",
        title: "Une mémoire et une couche de contexte centrales pour vos agents.",
        line: "Les agents notent ce qu'ils apprennent dans de simples fichiers. La fois suivante, ils reprennent là où ils s'étaient arrêtés, et les autres agents peuvent les lire aussi.",
      },
      {
        name: "Stockage d'agents",
        title: "Un filesystem partagé pour vos agents.",
        line: "Les agents lisent et écrivent les mêmes fichiers, comme sur un disque partagé. Le travail enregistré survit même si une machine tombe.",
      },
      {
        name: "Agents de code dans le cloud",
        title: "Une copie de votre repo pour chaque agent.",
        line: "Chaque agent reçoit sa propre copie de votre projet en 10 ms. Lancez-en plusieurs à la fois, gardez le meilleur résultat et jetez le reste.",
      },
      {
        name: "Évals et RL",
        title: "Un environnement neuf à chaque run.",
        line: "Chaque run part de la même configuration, sur sa propre copie. Lancez-en des milliers en parallèle sans qu'un run n'en modifie un autre.",
      },
    ],
  },
  git: {
    label: "Git",
    titleBefore: "Fonctionne avec",
    titleAccent: "Git.",
    line: "Git garde votre code. Skywake garde tout le dossier : paquets, données et caches.",
    works: "Git fonctionne comme d'habitude dans chaque copie.",
    note: "Continuez à pousser votre code sur Git. Skywake garde tout le reste.",
  },
  products: {
    items: [
      {
        name: "Filesystem",
        href: "/filesystem",
        icon: "files",
        before: "Donnez à chaque agent ",
        highlight: "sa propre copie de vos fichiers",
        after:
          ". Prête en quelques millisecondes, ouverte comme un dossier normal, fusionnée une fois le travail fini.",
        points: [
          "20 000 fichiers copiés en 10 ms",
          "Ouverte sans tout télécharger",
          "Changements relus et fusionnés comme avec Git",
        ],
      },
      {
        name: "Recherche",
        href: "/search",
        icon: "search",
        before: "Cherchez ",
        highlight: "par le sens, par mots exacts, ou les deux",
        after: ". Un seul index, copié pour chaque agent comme vos fichiers.",
        points: [
          "10 ms à chaud sur 10M de vecteurs",
          "Compatible avec tout modèle d'embedding",
          "Copiez un index sans toucher à main",
        ],
      },
    ],
  },
  architecture: {
    label: "Fonctionnement",
    titleBefore: "Aussi rapide que",
    titleAccent: "votre propre disque.",
    line: "Les fichiers sont servis par un cache NVMe partagé, juste à côté de vos agents.",
    stats: [
      "pour écrire un petit fichier",
      "pour lire un petit fichier",
      "plus lent qu'un disque local sur un build complet",
    ],
  },
  benchmarks: {
    label: "Benchmarks",
    title: "La vitesse d'un disque local, mesurée depuis votre bucket.",
  },
  cost: {
    label: "Coût",
    chartTitle: "Stockage pour {agents} agents",
    chart: {
      without: "Sans Skywake",
      with: "Avec Skywake",
      withoutDetail: "{agents} copies complètes de {workspaceGb} Go",
      withDetail: "{workspaceGb} Go partagés + {agents} × {addedMb} Mo de changements",
      perMonth: "{value} par mois",
      gap: "{x}× moins",
    },
    headline: {
      storage: "de stockage en moins",
      cost: "moins cher",
      starts: "plus rapide pour lancer un agent",
      and: "et",
    },
  },
  openSource: {
    label: "Open source",
    title: "Apache 2.0. Lancez-le vous-même dès aujourd'hui.",
    line: "Self-hostez avec Docker ou Kubernetes, sur votre propre stockage objet.",
    star: "Étoiler sur GitHub",
  },
  waitlist: {
    eyebrow: "Skywake Cloud",
    title: "Skywake managé arrive. Soyez prévenu.",
    line: "Rejoignez la liste d'attente pour des fichiers et une recherche hébergés.",
    selfHost: "Self-hoster avec la documentation",
    star: "Étoiler sur GitHub",
    openTitle: "Commencez à construire avec Skywake.",
    openLine:
      "Offrez à chaque agent un workspace branché et un index interrogeable sur votre propre stockage objet.",
    openCta: "Commencer",
    form: {
      email: "E-mail",
      join: "Rejoindre la liste",
      joining: "Inscription…",
      joined: "Vous êtes sur la liste. On vous écrit dès l'ouverture du Cloud.",
      invalid: "Saisissez une adresse e-mail valide.",
      off: "La liste d'attente n'est pas encore ouverte. Réessayez bientôt.",
      error: "Un problème est survenu de notre côté. Réessayez.",
    },
  },
  layers: {
    alt: "Les agents et les apps utilisent un filesystem et un index de recherche. Les deux lisent votre stockage objet via un cache partagé. Seuls les changements sont réécrits, toutes les 2 secondes.",
    agents: ["Agents", "et vos apps"],
    filesystem: ["Filesystem", "montage · fork · merge"],
    index: ["Index", "vectoriel · full-text"],
    cache: ["Cache", "NVMe + partagé"],
    storage: ["Stockage objet", "votre bucket"],
  },
  productPages: {
    getStarted: "Commencer",
    star: "Étoiler sur GitHub",
    filesystem: {
      label: "Filesystem",
      title: "Votre bucket, comme un",
      accent: "disque local rapide.",
      line: "Montez votre stockage objet comme un dossier normal. Donnez à chaque agent sa copie en quelques millisecondes, puis fusionnez les changements.",
      features: [
        {
          name: "Chaque agent a sa propre copie",
          line: "Une copie complète de vos fichiers en quelques millisecondes, quelle que soit leur taille. Rien n'est dupliqué.",
          art: "fork",
        },
        {
          name: "Comme un dossier normal",
          line: "Montez-le sur n'importe quelle machine. Vos outils, scripts et Git fonctionnent tels quels.",
          art: "mount",
        },
        {
          name: "Sauvegarde automatique",
          line: "Les changements arrivent dans votre bucket toutes les 2 secondes, sans rien à committer.",
          art: "autosave",
        },
        {
          name: "Résiste aux crashs",
          line: "Coupez la machine en pleine écriture. Chaque changement enregistré est toujours là.",
          art: "recover",
        },
        {
          name: "Ce que chaque agent a changé",
          line: "Chaque fichier créé, modifié ou supprimé, comparé à main.",
          art: "diff",
        },
        {
          name: "Ne gardez que le bon travail",
          line: "Fusionnez les changements d'un agent dans main, fichier par fichier.",
          art: "merge",
        },
        {
          name: "Main reste protégé",
          line: "Les agents ne peuvent pas écrire sur main. Il ne change que quand vous fusionnez.",
          art: "protect",
        },
      ],
    },
    search: {
      label: "Recherche",
      title: "Cherchez dans tout",
      accent: "votre bucket.",
      line: "Recherche vectorielle, full-text et hybride sur votre stockage objet, servie par un cache NVMe rapide.",
      features: [
        {
          name: "Trouver par le sens",
          line: "Cherchez « réinitialiser un mot de passe perdu » et trouvez la page « Récupération du compte ».",
          art: "vector",
        },
        {
          name: "Trouver les mots exacts",
          line: "Noms, codes d'erreur et expressions, même avec une faute de frappe.",
          art: "fullText",
        },
        {
          name: "Les deux en une recherche",
          line: "Sens et mots exacts classés ensemble : le meilleur résultat arrive en premier.",
          art: "hybrid",
        },
        {
          name: "Compter et regrouper",
          line: "Totaux, sommes et regroupements sur vos données, dans la même requête.",
          art: "analytics",
        },
        {
          name: "Tester sur une copie",
          line: "Forkez un index, essayez de nouvelles données, sans toucher à la production.",
          art: "branches",
        },
        {
          name: "Annuler n'importe quel changement",
          line: "Revenez à n'importe quelle version antérieure de l'index.",
          art: "timeTravel",
        },
      ],
    },
  },
  benchmarkPage: {
    line: "Mesuré sur AWS, avec le bucket dans la même région.",
    filesTitle: "Aussi rapide qu'un disque local.",
    searchTitle: "10M de vecteurs, cherchés en 10 ms.",
    filesNote: "AWS m7i-flex.large, stockage objet dans la même région",
    searchNote: "10M vecteurs × 768 sur stockage objet, AWS i4i.4xlarge dans la même région",
    files: [
      {
        title: "Donner à un agent sa copie de 1 Go",
        verdict: "300× plus rapide",
        labels: ["Skywake", "Copie des fichiers"],
      },
      {
        title: "Enregistrer 1 Go dans votre bucket",
        verdict: "4,5× plus rapide",
        labels: ["Skywake", "Upload classique"],
      },
      {
        title: "Compiler et tester un projet Rust",
        verdict: "Comme un disque local",
        labels: ["Skywake", "Disque local"],
      },
    ],
    search: [
      {
        title: "Chercher dans 10M de vecteurs",
        verdict: "10 ms une fois en cache",
        labels: ["Recherche répétée", "Première recherche, depuis votre bucket"],
      },
      {
        title: "Chercher avec un filtre",
        verdict: "Toujours sous les 25 ms",
        labels: ["Filtré à 1 % des lignes", "Sans filtre"],
      },
      {
        title: "Trouver les bonnes réponses",
        verdict: "95 % de recall",
        labels: ["Sans filtre", "Filtré à 1 % des lignes"],
      },
    ],
  },
  plans: {
    eyebrow: "Tarifs",
    title: "Gratuit en self-hosting, dès aujourd'hui.",
    line: "Le cloud est en bêta privée.",
    options: [
      {
        name: "Self-host",
        price: "Gratuit",
        per: "pour toujours",
        line: "Faites-le tourner sur vos machines dès aujourd'hui.",
        includes: [
          "Toutes les fonctionnalités, sans limite",
          "Open source sous licence Apache-2.0",
          "Docker ou Kubernetes",
          "Votre propre stockage objet",
        ],
        action: "Lire le guide",
      },
      {
        name: "Cloud",
        price: "Bêta privée",
        per: "",
        line: "On le fait tourner pour vous. Tarifs annoncés au lancement.",
        includes: [
          "Rien à installer ni à gérer",
          "Un cache partagé à côté de vos agents",
          "Payez seulement ce que vous utilisez",
          "Tourne sur votre propre bucket",
        ],
        action: "Rejoindre la liste d'attente",
      },
    ],
  },
  legal: {
    updated: "Dernière mise à jour le 15 novembre 2026",
    privacy: {
      title: "Confidentialité",
      intro:
        "Cette politique explique quelles données le site Skywake collecte, pourquoi, qui les traite et quels choix s'offrent à vous. En bref : nous collectons très peu de données, nous ne vous pistons pas et nous ne vendons jamais vos données.",
      sections: [
        {
          title: "Qui sommes-nous",
          body: [
            "Skywake (« nous ») exploite ce site à l'adresse skywake.dev et est responsable du traitement des données personnelles décrites ici. Pour toute question relative à cette politique, vous pouvez nous joindre via {contact}.",
          ],
        },
        {
          title: "Champ d'application de cette politique",
          body: [
            "Cette politique couvre le site web, y compris ses pages, ses guides et la liste d'attente du Cloud. Elle ne couvre ni le logiciel Skywake que vous exécutez vous-même, présenté ci-dessous, ni Skywake Cloud, qui aura ses propres conditions de confidentialité à son ouverture.",
          ],
        },
        {
          title: "Les données que nous collectons",
          body: [
            "Nous ne collectons que ce que vous nous fournissez et ce dont tout site web a besoin pour fonctionner :",
            [
              "Informations de la liste d'attente. Si vous rejoignez la liste d'attente du Cloud : votre adresse e-mail, un message si vous en laissez un, ainsi que la date et l'heure de votre inscription.",
              "Messages que vous nous envoyez. Si vous nous écrivez, nous conservons votre message et votre adresse e-mail afin de pouvoir vous répondre.",
              "Données techniques. À chaque requête, notre hébergeur reçoit votre adresse IP, le type de votre navigateur et la page demandée. Il les conserve dans des journaux de serveur de courte durée afin de fournir le site et de le protéger contre les abus.",
            ],
            "Nous ne vous demandons pas votre nom, et nous ne collectons ni données de paiement, ni localisation précise, ni aucune donnée sensible.",
          ],
        },
        {
          title: "Cookies et stockage local",
          body: [
            "Le site dépose un seul cookie, NEXT_LOCALE, qui mémorise la langue que vous avez choisie afin que la page suivante s'ouvre dans la même langue. Il est nécessaire au fonctionnement du site tel que vous l'attendez, et il n'est pas utilisé à des fins de suivi.",
            "Votre thème clair ou sombre est enregistré dans le stockage local de votre navigateur. Il reste sur votre appareil et ne nous parvient jamais.",
            "Nous n'utilisons aucun outil d'analyse, aucune publicité ni aucun script de suivi tiers. Les polices sont servies depuis notre propre site : le chargement d'une page ne contacte donc ni Google ni aucun autre service de polices.",
          ],
        },
        {
          title: "Comment nous les utilisons",
          body: [
            "Nous utilisons vos informations uniquement pour :",
            [
              "vous envoyer une confirmation lorsque vous rejoignez la liste d'attente, puis un e-mail à l'ouverture de Skywake Cloud ;",
              "vous répondre lorsque vous nous contactez ;",
              "faire fonctionner le site, en assurer la sécurité et corriger les problèmes.",
            ],
            "Nous ne les utilisons pas à des fins publicitaires, nous ne créons pas de profils et nous ne prenons aucune décision automatisée vous concernant. Nous ne vendons ni ne louons jamais vos données.",
          ],
        },
        {
          title: "Nos bases légales",
          body: [
            "Lorsque le RGPD ou une loi similaire s'applique, nous nous fondons sur :",
            [
              "votre consentement pour la liste d'attente, que vous pouvez retirer à tout moment ;",
              "notre intérêt légitime à exploiter un site web sécurisé, pour les journaux de serveur et le cookie de langue ;",
              "notre intérêt légitime à vous répondre, lorsque vous nous écrivez.",
            ],
          ],
        },
        {
          title: "Qui traite vos données",
          body: [
            "Nous faisons appel à un petit nombre de prestataires. Ils ne traitent les données que sur nos instructions et uniquement pour fournir leur service :",
            [
              "Vercel héberge le site web et conserve ses journaux de serveur.",
              "Une base de données PostgreSQL managée stocke la liste d'attente.",
              "Resend envoie nos e-mails.",
            ],
            "Nous pouvons également communiquer des informations si la loi l'exige, ou pour protéger nos droits ou la sécurité d'une personne. Si Skywake venait à fusionner avec une autre entreprise ou à être rachetée par celle-ci, la liste d'attente pourrait lui être transférée dans le cadre de cette même politique.",
          ],
        },
        {
          title: "Transferts internationaux",
          body: [
            "Nos prestataires peuvent stocker et traiter des données aux États-Unis et dans d'autres pays que le vôtre. Lorsque la loi l'exige, ces transferts sont encadrés par des garanties telles que les clauses contractuelles types de la Commission européenne.",
          ],
        },
        {
          title: "Durée de conservation",
          body: [
            [
              "Informations de la liste d'attente : jusqu'à l'ouverture de Skywake Cloud et l'envoi de notre e-mail, ou jusqu'à ce que vous demandiez votre retrait, selon ce qui intervient en premier.",
              "Messages que vous nous envoyez : aussi longtemps que nécessaire pour traiter votre demande.",
              "Journaux de serveur : pendant une courte durée fixée par notre hébergeur, puis supprimés.",
            ],
          ],
        },
        {
          title: "Vos droits",
          body: [
            "Selon votre lieu de résidence, vous pouvez nous demander de :",
            [
              "vous communiquer les données personnelles que nous détenons à votre sujet ;",
              "les rectifier si elles sont inexactes ;",
              "les effacer ;",
              "limiter ou cesser leur utilisation ;",
              "vous en fournir une copie dans un format portable ;",
              "prendre en compte le retrait de votre consentement, par exemple lorsque vous quittez la liste d'attente.",
            ],
            "Pour exercer l'un de ces droits, contactez-nous via {contact}. Nous répondons sous 30 jours, gratuitement. Vous pouvez également introduire une réclamation auprès de votre autorité locale de protection des données.",
          ],
        },
        {
          title: "Sécurité",
          body: [
            "Toutes les connexions au site sont chiffrées (HTTPS), l'accès à vos données est limité aux personnes qui en ont besoin, et nos prestataires appliquent les normes de sécurité du secteur. Aucun système n'est parfaitement sûr, mais si une violation touche vos données, nous vous en informerons comme la loi l'exige.",
          ],
        },
        {
          title: "Skywake en auto-hébergement",
          body: [
            "Le logiciel open source Skywake que vous installez sur vos propres machines ne nous envoie rien. Vos fichiers, index, clés et données d'utilisation restent dans votre propre bucket et votre propre base de données, sous votre contrôle.",
          ],
        },
        {
          title: "Liens vers d'autres sites",
          body: [
            "Le site contient des liens vers des services que nous n'exploitons pas, comme GitHub. Leurs propres politiques de confidentialité s'appliquent lorsque vous les consultez.",
          ],
        },
        {
          title: "Enfants",
          body: [
            "Ce site s'adresse aux développeurs et aux entreprises. Il ne vise pas les enfants de moins de 16 ans, et nous ne collectons pas sciemment leurs données. Si vous pensez qu'un enfant nous a communiqué des données personnelles, contactez-nous et nous les supprimerons.",
          ],
        },
        {
          title: "Modifications de cette politique",
          body: [
            "Si nous modifions cette politique, nous mettrons à jour la date en haut de cette page. Si une modification affecte la manière dont nous utilisons des données que vous nous avez déjà fournies, nous vous enverrons un e-mail avant son entrée en vigueur.",
          ],
        },
      ],
    },
    terms: {
      title: "Conditions",
      intro:
        "Les présentes conditions s'appliquent à votre utilisation du site Skywake. En utilisant le site, vous les acceptez. Si vous ne les acceptez pas, merci de ne pas l'utiliser.",
      sections: [
        {
          title: "Qui sommes-nous",
          body: [
            "Skywake (« nous ») exploite ce site à l'adresse skywake.dev. Vous pouvez nous joindre via {contact}.",
          ],
        },
        {
          title: "Le logiciel open source",
          body: [
            "Skywake est open source sous Apache License 2.0. C'est cette licence, et non les présentes conditions, qui définit ce que vous pouvez faire du code, notamment l'utiliser, le modifier et le partager. Comme le prévoit la licence, le logiciel est fourni en l'état, sans garantie ni condition d'aucune sorte.",
          ],
        },
        {
          title: "Skywake Cloud",
          body: [
            "Skywake Cloud, notre service hébergé, n'est pas encore ouvert. Il aura ses propres conditions de service, que vous pourrez consulter et devrez accepter avant de vous inscrire. L'inscription sur la liste d'attente ne crée aucun contrat et ne garantit ni l'accès, ni une date de lancement, ni un prix.",
          ],
        },
        {
          title: "Utilisation de ce site",
          body: [
            "Vous pouvez lire ce site, créer des liens vers lui et le partager. Lorsque vous l'utilisez, merci de ne pas :",
            [
              "tenter de le casser, de le surcharger ou de contourner sa sécurité ;",
              "l'explorer de façon si intensive que le site en est ralenti pour les autres ;",
              "inscrire d'autres personnes sur la liste d'attente, ni utiliser une adresse e-mail qui n'est pas la vôtre ;",
              "l'utiliser pour enfreindre la loi ou porter atteinte aux droits d'autrui.",
            ],
            "Les moteurs de recherche et les agents IA sont libres de lire le site, son fichier llms.txt et notre documentation. Nous pouvons restreindre ou bloquer l'accès de toute personne qui fait un usage abusif du site.",
          ],
        },
        {
          title: "Notre nom et notre logo",
          body: [
            "Le code source du site fait partie de notre dépôt open source, sous Apache License 2.0. Le nom et le logo Skywake sont nos marques, et l'Apache License ne confère aucun droit sur celles-ci. Vous pouvez les utiliser pour faire référence à Skywake, mais pas d'une manière qui laisse entendre que nous vous soutenons, vous ou votre produit.",
          ],
        },
        {
          title: "Informations publiées sur ce site",
          body: [
            "Nous rédigeons le site, les guides et la documentation pour qu'ils soient exacts et utiles, mais il s'agit d'informations générales, et non de conseils professionnels. Les benchmarks ont été mesurés sur le matériel et la configuration décrits avec eux, et vos résultats dépendront des vôtres. Les offres, les fonctionnalités et les prix de Skywake Cloud peuvent changer avant le lancement.",
          ],
        },
        {
          title: "Liens vers d'autres sites",
          body: [
            "Nous proposons des liens vers des sites que nous ne contrôlons pas, comme GitHub. Nous ne sommes pas responsables de leur contenu ni de leurs pratiques.",
          ],
        },
        {
          title: "Absence de garantie",
          body: [
            "Le site est fourni « en l'état » et « selon sa disponibilité ». Dans la mesure permise par la loi, nous ne garantissons pas qu'il sera toujours disponible, exempt d'erreurs ou adapté à un usage particulier.",
          ],
        },
        {
          title: "Limitation de responsabilité",
          body: [
            "Dans la mesure permise par la loi, Skywake n'est pas responsable des pertes indirectes, accessoires ou consécutives, ni des pertes de données, de bénéfices ou d'activité, résultant de l'utilisation du site. Rien dans les présentes conditions ne limite une responsabilité que la loi ne nous permet pas de limiter.",
          ],
        },
        {
          title: "Modifications de ces conditions",
          body: [
            "Nous pouvons mettre à jour ces conditions. La date en haut de page indique la dernière version. Si vous continuez à utiliser le site après une modification, vous acceptez les nouvelles conditions.",
          ],
        },
        {
          title: "Questions",
          body: ["Pour toute question sur ces conditions, passez par {contact}."],
        },
      ],
    },
  },
  notFound: {
    label: "404",
    title: "Rien ici.",
    line: "Cette page n'existe pas.",
    back: "Retour à l'accueil",
  },
  guides: {
    eyebrow: "Cas d'usage",
    title: "Partez de votre problème.",
    accent: "On vous montre comment Skywake le règle.",
    onThisPage: "Sur cette page",
    read: "Lire le guide",
    related: {
      eyebrow: "À lire aussi",
      title: "Découvrez d'autres cas d'usage.",
      all: "Tous les cas d'usage",
    },
    items: {
      "knowledge-base": {
        name: "Bases de connaissances",
        title: "Comment bâtir une vaste base de connaissances pour vos agents",
        lead: "Gardez vos documents et leur index de recherche dans le même bucket. Quand un document change, la recherche le voit en moins d'une seconde, sans job de synchro à surveiller.",
      },
      "context-layer": {
        name: "Couches de contexte",
        title: "Comment donner à vos agents une vraie mémoire",
        lead: "Donnez à chaque agent son propre dossier dans votre bucket. Il y écrit ses notes en simples fichiers, et le run suivant reprend là où le précédent s'est arrêté.",
      },
      sandboxes: {
        name: "Stockage d'agents et sandboxes",
        title: "Comment garder le travail d'un agent quand sa sandbox plante",
        lead: "Enregistrez le travail de l'agent après chaque étape, dans votre propre bucket. Si la machine tombe, une nouvelle reprend la tâche là où elle s'était arrêtée.",
      },
      "coding-agents": {
        name: "Agents de code dans le cloud",
        title: "Comment donner à chaque agent de code sa copie de votre repo",
        lead: "Enregistrez votre repo une fois, avec ses paquets et son cache de build. Chaque agent a sa copie en quelques millisecondes, et vous fusionnez le correctif qui vous plaît.",
      },
      "document-agents": {
        name: "Agents de documents",
        title: "Comment relire chaque changement qu'un agent fait sur vos fichiers",
        lead: "Les agents travaillent sur une copie du dossier. Vous voyez chacun de leurs changements, puis gardez les bons et jetez le reste.",
      },
      rl: {
        name: "Environnements RL et évals",
        title: "Comment donner à chaque run RL une copie neuve de son environnement",
        lead: "Enregistrez l'environnement une fois. Chaque run a sa propre copie propre en quelques millisecondes : des résultats équitables, et tout run bizarre peut être rouvert plus tard.",
      },
      ci: {
        name: "CI et builds",
        title: "Comment lancer vos jobs de CI avec un build déjà chaud",
        lead: "Enregistrez vos sources et leur cache de build ensemble, une fois par nuit. Chaque job compile sur sa propre copie, et seulement ce qui a changé.",
      },
      previews: {
        name: "Environnements de preview",
        title: "Comment tester chaque pull request sur de vraies données",
        lead: "Donnez à chaque pull request son propre workspace, avec de vraies données et ses dépendances. Il disparaît au merge.",
      },
      datasets: {
        name: "Versions de datasets",
        title: "Comment savoir quelles données ont entraîné chaque modèle",
        lead: "Branchez vos données comme du code. Testez un dataset plus propre sur sa propre copie, comparez les modèles, et retrouvez toujours les données exactes derrière chacun.",
      },
      "reference-data": {
        name: "Données de référence partagées",
        title: "Comment partager de gros fichiers avec de nombreux agents",
        lead: "Enregistrez une seule fois vos gros fichiers partagés dans votre bucket. Chaque machine les télécharge une fois, et chaque agent y lit la copie locale.",
      },
    },
  },
};
