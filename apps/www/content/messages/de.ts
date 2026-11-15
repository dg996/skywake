import type { HomeMessages } from "./types";

export const de: HomeMessages = {
  pages: {
    "/": {
      title: "Skywake: Schnelles Dateisystem und Suche auf S3 für KI-Agenten",
      description:
        "Open-Source-Dateisystem und Suche auf Ihrem eigenen S3-Bucket. Wie eine lokale Festplatte mounten, jedem KI-Agenten seine eigene Kopie in 10 ms geben und suchen.",
    },
    "/filesystem": {
      title: "S3-Dateisystem für KI-Agenten: mounten, kopieren, mergen",
      description:
        "S3 oder jeden Object Storage als schnelle lokale Festplatte mounten. 20.000 Dateien in 10 ms pro Agent kopieren, dann Änderungen wie mit Git mergen.",
    },
    "/search": {
      title: "Vektor- und Volltextsuche auf S3",
      description:
        "Vektor-, Volltext- und hybride Suche direkt aus Ihrem Object Storage. 10 ms warme Abfragen über 10M Vektoren, ohne separate Datenbank.",
    },
    "/use-cases": {
      title: "Anwendungsfälle: Wissensdatenbanken, Agenten-Gedächtnis, Coding-Agenten",
      description:
        "Wie Teams Skywake nutzen: Wissensdatenbanken, Agenten-Gedächtnis, Sandboxes, Coding- und Dokumenten-Agenten, Evals, CI und Datasets. Schritt für Schritt.",
    },
    "/pricing": {
      title: "Preise",
      description:
        "Self-Hosting ist kostenlos, mit allen Funktionen und ohne Limits. Skywake Cloud ist in der privaten Beta.",
    },
    "/privacy": {
      title: "Datenschutz",
      description: "Was diese Website erfasst, warum, und wie Sie es löschen lassen.",
    },
    "/terms": {
      title: "Nutzungsbedingungen",
      description: "Die Bedingungen für die Nutzung dieser Website und der Skywake-Software.",
    },
    "/benchmarks": {
      title: "Benchmarks",
      description:
        "Gemessen auf AWS, Bucket in derselben Region: Agenten-Kopien, Uploads, Builds und Suche über 10M Vektoren.",
    },
  },
  nav: {
    filesystem: "Filesystem",
    search: "Suche",
    benchmarks: "Benchmarks",
    pricing: "Preise",
    docs: "Docs",
    github: "GitHub",
    joinWaitlist: "Warteliste",
    getStarted: "Loslegen",
    language: "Sprache",
    menu: "Menü",
    sections: "Bereiche",
    theme: "Zwischen hell und dunkel wechseln",
  },
  footer: {
    blurb:
      "Ihr Bucket als schnelle Festplatte und Suchmaschine. Open Source, auf Ihrem eigenen Object Storage.",
    product: "Produkt",
    project: "Projekt",
    legal: "Rechtliches",
    useCases: "Anwendungsfälle",
    openSource: "Open Source",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    star: "Auf GitHub mit Stern markieren",
  },
  hero: {
    badge: "Skywake Cloud kommt. Zur Warteliste",
    titleBefore: "Das skalierbare Dateisystem und die Suchmaschine",
    titleAccent: "für KI-Agenten.",
    screenshotAlt:
      "Die Skywake-Konsole mit den Disks eines Teams und den Agenten, die daran arbeiten",
    getStartedCta: "Loslegen",
  },
  useCases: {
    label: "Anwendungsfälle",
    heading: ["Sie bauen die Agenten.", "Skywake kümmert sich um Dateien und Suche."],
    more: "Alle Anwendungsfälle ansehen",
    cta: "Mehr erfahren",
    items: [
      {
        name: "Wissensdatenbank",
        title: "Eine Wissensdatenbank für Ihre Agenten.",
        line: "Dokumente und Dateien an einem Ort, mit eingebauter Suche. Agenten finden immer die neueste Version, nie eine alte Kopie.",
      },
      {
        name: "Kontext-Ebene",
        title: "Ein zentrales Gedächtnis und eine Kontext-Ebene für Agenten.",
        line: "Agenten speichern, was sie lernen, als einfache Dateien. Beim nächsten Mal machen sie dort weiter, und andere Agenten können es auch lesen.",
      },
      {
        name: "Agenten-Speicher",
        title: "Ein gemeinsames Dateisystem für Agenten.",
        line: "Agenten lesen und schreiben dieselben Dateien, wie auf einem geteilten Laufwerk. Gespeicherte Arbeit bleibt erhalten, auch wenn eine Maschine ausfällt.",
      },
      {
        name: "Cloud-Coding-Agenten",
        title: "Eine Kopie Ihres Repos für jeden Agenten.",
        line: "Jeder Agent bekommt in 10 ms seine eigene Kopie Ihres Projekts. Lassen Sie viele gleichzeitig laufen, behalten Sie das beste Ergebnis und verwerfen Sie den Rest.",
      },
      {
        name: "Evals und RL",
        title: "Eine frische Umgebung für jeden Lauf.",
        line: "Jeder Lauf startet vom selben Setup, auf seiner eigenen Kopie. Tausende Läufe nebeneinander, ohne dass einer den anderen verändert.",
      },
    ],
  },
  git: {
    label: "Git",
    titleBefore: "Funktioniert mit",
    titleAccent: "Git.",
    line: "Git speichert Ihren Code. Skywake speichert den ganzen Ordner: Pakete, Daten und Caches.",
    works: "Git läuft wie gewohnt in jeder Kopie.",
    note: "Pushen Sie Ihren Code weiter zu Git. Skywake speichert alles andere.",
  },
  products: {
    items: [
      {
        name: "Filesystem",
        href: "/filesystem",
        icon: "files",
        before: "Geben Sie jedem Agenten ",
        highlight: "eine eigene Kopie Ihrer Dateien",
        after:
          ". In Millisekunden bereit, geöffnet wie ein normaler Ordner, zurückgeführt, wenn die Arbeit erledigt ist.",
        points: [
          "20.000 Dateien in 10 ms kopieren",
          "Öffnen, ohne alles herunterzuladen",
          "Änderungen prüfen und mergen wie mit Git",
        ],
      },
      {
        name: "Suche",
        href: "/search",
        icon: "search",
        before: "Suchen Sie ",
        highlight: "nach Bedeutung, nach exakten Wörtern oder beidem",
        after: ". Ein Index, für jeden Agenten kopiert wie Ihre Dateien.",
        points: [
          "10 ms warme Suche über 10M Vektoren",
          "Funktioniert mit jedem Embedding-Modell",
          "Einen Index kopieren, ohne main zu berühren",
        ],
      },
    ],
  },
  architecture: {
    label: "So funktioniert es",
    titleBefore: "So schnell wie",
    titleAccent: "Ihre eigene Festplatte.",
    line: "Dateien kommen aus einem gemeinsamen NVMe-Cache, direkt neben Ihren Agenten.",
    stats: [
      "um eine kleine Datei zu schreiben",
      "um eine kleine Datei zu lesen",
      "langsamer als eine lokale Festplatte bei einem vollständigen Build",
    ],
  },
  benchmarks: {
    label: "Benchmarks",
    title: "Tempo einer lokalen Festplatte, gemessen aus Ihrem Bucket.",
  },
  cost: {
    label: "Kosten",
    chartTitle: "Speicher für {agents} Agenten",
    chart: {
      without: "Ohne Skywake",
      with: "Mit Skywake",
      withoutDetail: "{agents} volle Kopien à {workspaceGb} GB",
      withDetail: "{workspaceGb} GB geteilt + {agents} × {addedMb} MB Änderungen",
      perMonth: "{value} pro Monat",
      gap: "{x}× weniger",
    },
    headline: {
      storage: "weniger Speicher",
      cost: "geringere Kosten",
      starts: "schnellere Agenten-Starts",
      and: "und",
    },
  },
  openSource: {
    label: "Open Source",
    title: "Apache 2.0. Heute selbst betreiben.",
    line: "Selbst hosten mit Docker oder Kubernetes, auf Ihrem eigenen Object Storage.",
    star: "Auf GitHub mit Stern markieren",
  },
  waitlist: {
    eyebrow: "Skywake Cloud",
    title: "Managed Skywake kommt. Lassen Sie sich benachrichtigen.",
    line: "Auf die Warteliste für gehostete Dateien und Suche.",
    selfHost: "Selbst hosten mit der Dokumentation",
    star: "Auf GitHub mit Stern markieren",
    openTitle: "Jetzt mit Skywake bauen.",
    openLine:
      "Geben Sie jedem Agenten einen eigenen Branch-Workspace und einen durchsuchbaren Index auf Ihrem eigenen Object Storage.",
    openCta: "Loslegen",
    form: {
      email: "E-Mail",
      join: "Zur Warteliste",
      joining: "Wird eingetragen…",
      joined: "Sie stehen auf der Liste. Wir schreiben Ihnen, sobald die Cloud startet.",
      invalid: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      off: "Die Warteliste ist noch nicht geöffnet. Versuchen Sie es bald wieder.",
      error: "Bei uns ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.",
    },
  },
  layers: {
    alt: "Agenten und Apps nutzen ein Dateisystem und einen Suchindex. Beide lesen über einen gemeinsamen Cache aus Ihrem Object Storage. Nur Änderungen werden zurückgeschrieben, alle 2 Sekunden.",
    agents: ["Agenten", "und Ihre Apps"],
    filesystem: ["Filesystem", "mounten · forken · mergen"],
    index: ["Index", "Vektor · Volltext"],
    cache: ["Cache", "NVMe + geteilt"],
    storage: ["Object Storage", "Ihr Bucket"],
  },
  productPages: {
    getStarted: "Loslegen",
    star: "Auf GitHub mit Stern markieren",
    filesystem: {
      label: "Filesystem",
      title: "Ihr Bucket als",
      accent: "schnelle lokale Festplatte.",
      line: "Mounten Sie Ihren Object Storage als normalen Ordner. Jeder Agent bekommt in 10 ms seine eigene Kopie, die Änderungen mergen Sie zurück.",
      features: [
        {
          name: "Jeder Agent bekommt seine eigene Kopie",
          line: "Eine vollständige Kopie Ihrer Dateien in 10 ms, egal wie groß. Nichts wird dupliziert.",
          art: "fork",
        },
        {
          name: "Funktioniert wie ein normaler Ordner",
          line: "Auf jeder Maschine mounten. Ihre Tools, Skripte und Git funktionieren einfach.",
          art: "mount",
        },
        {
          name: "Speichert von selbst",
          line: "Änderungen landen alle 2 Sekunden in Ihrem Bucket, ganz ohne Commit.",
          art: "autosave",
        },
        {
          name: "Übersteht Abstürze",
          line: "Die Maschine stirbt mitten im Schreiben? Jede gespeicherte Änderung ist noch da.",
          art: "recover",
        },
        {
          name: "Sehen, was jeder Agent geändert hat",
          line: "Jede Datei, die er erstellt, bearbeitet oder gelöscht hat, im Vergleich zu main.",
          art: "diff",
        },
        {
          name: "Nur gute Arbeit behalten",
          line: "Die Änderungen eines Agenten Datei für Datei zurück in main mergen.",
          art: "merge",
        },
        {
          name: "Main bleibt sicher",
          line: "Agenten können nicht auf main schreiben. Main ändert sich nur, wenn Sie mergen.",
          art: "protect",
        },
      ],
    },
    search: {
      label: "Suche",
      title: "Durchsuchen Sie alles in",
      accent: "Ihrem Bucket.",
      line: "Vektor-, Volltext- und hybride Suche über Ihren Object Storage, ausgeliefert aus einem schnellen NVMe-Cache.",
      features: [
        {
          name: "Nach Bedeutung finden",
          line: "Suchen Sie „Passwort vergessen“ und finden Sie die Seite „Konto wiederherstellen“.",
          art: "vector",
        },
        {
          name: "Exakte Wörter finden",
          line: "Namen, Fehlercodes und Phrasen, auch mit Tippfehler.",
          art: "fullText",
        },
        {
          name: "Beides in einer Suche",
          line: "Bedeutung und exakte Wörter gemeinsam gerankt, damit der beste Treffer oben steht.",
          art: "hybrid",
        },
        {
          name: "Ergebnisse zählen und gruppieren",
          line: "Anzahl, Summen und Gruppen über Ihre Daten, in derselben Abfrage.",
          art: "analytics",
        },
        {
          name: "Auf einer Kopie testen",
          line: "Einen Index forken, neue Daten ausprobieren, Production bleibt unberührt.",
          art: "branches",
        },
        {
          name: "Jede Änderung rückgängig machen",
          line: "Zurück zu jeder früheren Version des Index.",
          art: "timeTravel",
        },
      ],
    },
  },
  benchmarkPage: {
    line: "Gemessen auf AWS, mit dem Bucket in derselben Region.",
    filesTitle: "So schnell wie eine lokale Festplatte.",
    searchTitle: "10M Vektoren, durchsucht in 10 ms.",
    filesNote: "AWS m7i-flex.large, Object Storage in derselben Region",
    searchNote: "10M Vektoren × 768 auf Object Storage, AWS i4i.4xlarge in derselben Region",
    files: [
      {
        title: "Einem Agenten eine eigene Kopie von 1 GB geben",
        verdict: "300× schneller",
        labels: ["Skywake", "Dateien kopieren"],
      },
      {
        title: "1 GB in Ihren Bucket speichern",
        verdict: "4,5× schneller",
        labels: ["Skywake", "Normaler Upload"],
      },
      {
        title: "Ein Rust-Projekt bauen und testen",
        verdict: "Wie eine lokale Festplatte",
        labels: ["Skywake", "Lokale Festplatte"],
      },
    ],
    search: [
      {
        title: "10M Vektoren durchsuchen",
        verdict: "10 ms im Cache",
        labels: ["Wiederholte Suche", "Erste Suche, aus Ihrem Bucket"],
      },
      {
        title: "Suche mit Filter",
        verdict: "Weiter unter 25 ms",
        labels: ["Gefiltert auf 1 % der Zeilen", "Ohne Filter"],
      },
      {
        title: "Die richtigen Antworten finden",
        verdict: "95 % Recall",
        labels: ["Ohne Filter", "Gefiltert auf 1 % der Zeilen"],
      },
    ],
  },
  plans: {
    eyebrow: "Preise",
    title: "Heute kostenlos selbst hosten.",
    line: "Die Cloud ist in der privaten Beta.",
    options: [
      {
        name: "Self-Hosting",
        price: "Kostenlos",
        per: "für immer",
        line: "Heute schon auf Ihren eigenen Maschinen betreiben.",
        includes: [
          "Alle Funktionen, ohne Limits",
          "Open Source unter Apache-2.0",
          "Docker oder Kubernetes",
          "Ihr eigener Object Storage",
        ],
        action: "Zur Anleitung",
      },
      {
        name: "Cloud",
        price: "Private Beta",
        per: "",
        line: "Wir betreiben es für Sie. Preise gibt es zum Start.",
        includes: [
          "Nichts einzurichten oder zu betreiben",
          "Ein gemeinsamer Cache neben Ihren Agenten",
          "Zahlen Sie nur, was Sie nutzen",
          "Läuft auf Ihrem eigenen Bucket",
        ],
        action: "Zur Warteliste",
      },
    ],
  },
  legal: {
    updated: "Zuletzt aktualisiert am 15. November 2026",
    privacy: {
      title: "Datenschutz",
      intro:
        "Diese Datenschutzerklärung erläutert, welche Daten die Skywake-Website erhebt, zu welchem Zweck, wer sie verarbeitet und welche Wahlmöglichkeiten Sie haben. Kurz gesagt: Wir erheben sehr wenig, wir verfolgen Sie nicht, und wir verkaufen Ihre Daten niemals.",
      sections: [
        {
          title: "Wer wir sind",
          body: [
            "Skywake („wir“, „uns“) betreibt diese Website unter skywake.dev und ist für die hier beschriebenen personenbezogenen Daten verantwortlich. Bei allen Fragen zu dieser Datenschutzerklärung erreichen Sie uns über {contact}.",
          ],
        },
        {
          title: "Geltungsbereich dieser Datenschutzerklärung",
          body: [
            "Diese Datenschutzerklärung gilt für die Website einschließlich ihrer Seiten, Leitfäden und der Cloud-Warteliste. Sie gilt nicht für die Skywake-Software, die Sie selbst betreiben (dazu weiter unten), und nicht für Skywake Cloud, für das bei der Eröffnung eigene Datenschutzbestimmungen gelten werden.",
          ],
        },
        {
          title: "Welche Daten wir erheben",
          body: [
            "Wir erheben nur, was Sie uns mitteilen und was jede Website für ihren Betrieb benötigt:",
            [
              "Angaben zur Warteliste. Wenn Sie sich auf die Cloud-Warteliste setzen: Ihre E-Mail-Adresse, eine Nachricht, falls Sie eine hinterlassen, sowie Datum und Uhrzeit Ihrer Anmeldung.",
              "Nachrichten, die Sie uns senden. Wenn Sie uns schreiben, speichern wir Ihre Nachricht und Ihre E-Mail-Adresse, um Ihnen antworten zu können.",
              "Technische Daten. Bei jeder Anfrage erhält unser Hosting-Anbieter Ihre IP-Adresse, Ihren Browsertyp und die aufgerufene Seite. Er speichert diese Angaben in kurzlebigen Server-Logs, um die Website bereitzustellen und sie vor Missbrauch zu schützen.",
            ],
            "Wir fragen nicht nach Ihrem Namen und erheben weder Zahlungsdaten noch Ihren genauen Standort noch besondere Kategorien personenbezogener Daten.",
          ],
        },
        {
          title: "Cookies und lokaler Speicher",
          body: [
            "Die Website setzt ein einziges Cookie, NEXT_LOCALE. Es speichert die von Ihnen gewählte Sprache, damit sich die nächste Seite in derselben Sprache öffnet. Es ist erforderlich, damit die Website so funktioniert, wie Sie es erwarten, und wird nicht zum Tracking verwendet.",
            "Ihr helles oder dunkles Design wird im lokalen Speicher Ihres Browsers gespeichert. Diese Information bleibt auf Ihrem Gerät und erreicht uns nie.",
            "Wir setzen keine Analyse-Tools, keine Werbung und keine Tracking-Skripte Dritter ein. Schriftarten werden von unserer eigenen Website ausgeliefert, sodass beim Laden einer Seite keine Verbindung zu Google oder einem anderen Schriftartendienst hergestellt wird.",
          ],
        },
        {
          title: "Wie wir die Daten verwenden",
          body: [
            "Wir verwenden Ihre Daten ausschließlich, um:",
            [
              "Ihnen nach der Anmeldung zur Warteliste eine Bestätigung und bei der Eröffnung von Skywake Cloud eine E-Mail zu senden;",
              "Ihnen zu antworten, wenn Sie uns kontaktieren;",
              "die Website zu betreiben, sie zu schützen und Fehler zu beheben.",
            ],
            "Wir verwenden Ihre Daten nicht für Werbung, erstellen keine Profile und treffen keine automatisierten Entscheidungen über Sie. Wir verkaufen oder vermieten Ihre Daten niemals.",
          ],
        },
        {
          title: "Rechtsgrundlagen",
          body: [
            "Soweit die DSGVO oder ein vergleichbares Gesetz anwendbar ist, stützen wir uns auf:",
            [
              "Ihre Einwilligung für die Warteliste, die Sie jederzeit widerrufen können;",
              "unser berechtigtes Interesse am Betrieb einer sicheren Website, für Server-Logs und das Sprach-Cookie;",
              "unser berechtigtes Interesse daran, Ihnen zu antworten, wenn Sie uns schreiben.",
            ],
          ],
        },
        {
          title: "Wer Ihre Daten verarbeitet",
          body: [
            "Wir setzen eine kleine Zahl von Dienstleistern ein. Sie verarbeiten Daten nur nach unseren Weisungen und nur zur Erbringung ihrer Leistung:",
            [
              "Vercel hostet die Website und speichert ihre Server-Logs.",
              "Eine verwaltete PostgreSQL-Datenbank speichert die Warteliste.",
              "Resend versendet unsere E-Mails.",
            ],
            "Wir können Informationen außerdem weitergeben, wenn das Gesetz es verlangt oder um unsere Rechte oder die Sicherheit anderer zu schützen. Falls Skywake jemals mit einem anderen Unternehmen verschmolzen oder von einem anderen Unternehmen übernommen wird, kann die Warteliste unter dieser Datenschutzerklärung auf dieses Unternehmen übergehen.",
          ],
        },
        {
          title: "Internationale Datenübermittlungen",
          body: [
            "Unsere Dienstleister können Daten in den Vereinigten Staaten und in anderen Ländern außerhalb Ihres eigenen Landes speichern und verarbeiten. Soweit gesetzlich erforderlich, sind diese Übermittlungen durch geeignete Garantien wie die Standardvertragsklauseln der Europäischen Kommission abgesichert.",
          ],
        },
        {
          title: "Speicherdauer",
          body: [
            [
              "Angaben zur Warteliste: bis Skywake Cloud eröffnet und wir Ihnen eine E-Mail gesendet haben oder bis Sie uns bitten, Sie zu entfernen, je nachdem, was zuerst eintritt.",
              "Nachrichten, die Sie uns senden: so lange, wie wir sie zur Bearbeitung Ihres Anliegens benötigen.",
              "Server-Logs: für kurze Zeit, die unser Hosting-Anbieter festlegt; danach werden sie gelöscht.",
            ],
          ],
        },
        {
          title: "Ihre Rechte",
          body: [
            "Je nachdem, wo Sie leben, können Sie uns bitten:",
            [
              "Ihnen die personenbezogenen Daten mitzuteilen, die wir über Sie gespeichert haben;",
              "sie zu berichtigen, wenn sie unrichtig sind;",
              "sie zu löschen;",
              "ihre Verwendung einzuschränken oder zu beenden;",
              "Ihnen eine Kopie in einem übertragbaren Format bereitzustellen;",
              "Ihre Einwilligung zu widerrufen, zum Beispiel indem Sie die Warteliste verlassen.",
            ],
            "Um eines dieser Rechte auszuüben, kontaktieren Sie uns über {contact}. Wir antworten innerhalb von 30 Tagen und berechnen dafür nichts. Sie können sich außerdem bei Ihrer zuständigen Datenschutzaufsichtsbehörde beschweren.",
          ],
        },
        {
          title: "Sicherheit",
          body: [
            "Jede Verbindung zur Website ist verschlüsselt (HTTPS), der Zugriff auf Ihre Daten ist auf die Personen beschränkt, die ihn benötigen, und unsere Dienstleister halten branchenübliche Sicherheitsstandards ein. Kein System ist vollkommen sicher; sollte jedoch eine Verletzung der Sicherheit Ihre Daten betreffen, informieren wir Sie, wie es das Gesetz verlangt.",
          ],
        },
        {
          title: "Selbst betriebenes Skywake",
          body: [
            "Die Open-Source-Software Skywake, die Sie auf Ihren eigenen Rechnern installieren, sendet uns nichts. Ihre Dateien, Indizes, Schlüssel und Nutzungsdaten bleiben in Ihrem eigenen Bucket und Ihrer eigenen Datenbank, unter Ihrer Kontrolle.",
          ],
        },
        {
          title: "Links zu anderen Websites",
          body: [
            "Die Website verlinkt auf Dienste, die wir nicht betreiben, zum Beispiel GitHub. Wenn Sie diese besuchen, gelten deren eigene Datenschutzerklärungen.",
          ],
        },
        {
          title: "Kinder",
          body: [
            "Diese Website richtet sich an Entwickler und Unternehmen. Sie ist nicht für Kinder unter 16 Jahren bestimmt, und wir erheben nicht wissentlich deren Daten. Wenn Sie glauben, dass ein Kind uns personenbezogene Daten übermittelt hat, kontaktieren Sie uns, und wir löschen sie.",
          ],
        },
        {
          title: "Änderungen dieser Datenschutzerklärung",
          body: [
            "Wenn wir diese Datenschutzerklärung ändern, aktualisieren wir das Datum oben auf dieser Seite. Betrifft eine Änderung die Verwendung von Daten, die Sie uns bereits überlassen haben, informieren wir Sie per E-Mail, bevor sie wirksam wird.",
          ],
        },
      ],
    },
    terms: {
      title: "Nutzungsbedingungen",
      intro:
        "Diese Bedingungen gelten für Ihre Nutzung der Skywake-Website. Indem Sie die Website nutzen, erklären Sie sich mit ihnen einverstanden. Wenn Sie nicht einverstanden sind, nutzen Sie die Website bitte nicht.",
      sections: [
        {
          title: "Wer wir sind",
          body: [
            "Skywake („wir“, „uns“) betreibt diese Website unter skywake.dev. Sie erreichen uns über {contact}.",
          ],
        },
        {
          title: "Die Open-Source-Software",
          body: [
            "Skywake ist Open Source unter der Apache License 2.0. Diese Lizenz, nicht diese Bedingungen, legt fest, was Sie mit dem Code tun dürfen, einschließlich ihn zu nutzen, zu verändern und weiterzugeben. Wie in der Lizenz festgelegt, wird die Software ohne Mängelgewähr und ohne Gewährleistungen oder Bedingungen jeglicher Art bereitgestellt.",
          ],
        },
        {
          title: "Skywake Cloud",
          body: [
            "Skywake Cloud, unser gehosteter Dienst, ist noch nicht verfügbar. Er wird eigene Nutzungsbedingungen haben, die Sie vor der Registrierung einsehen und akzeptieren. Die Anmeldung zur Warteliste begründet keinen Vertrag und garantiert weder einen Zugang noch einen Starttermin noch einen Preis.",
          ],
        },
        {
          title: "Nutzung dieser Website",
          body: [
            "Sie dürfen diese Website lesen, auf sie verlinken und sie teilen. Bitte unterlassen Sie bei der Nutzung Folgendes:",
            [
              "zu versuchen, sie zu beschädigen, sie zu überlasten oder ihre Sicherheitsmaßnahmen zu umgehen;",
              "sie so intensiv zu crawlen, dass die Website für andere langsamer wird;",
              "andere Personen auf die Warteliste zu setzen oder eine E-Mail-Adresse zu verwenden, die nicht Ihnen gehört;",
              "sie zu nutzen, um gegen Gesetze oder die Rechte anderer zu verstoßen.",
            ],
            "Suchmaschinen und KI-Agenten dürfen die Website, ihre llms.txt und unsere Dokumentation gerne lesen. Wir können den Zugang für alle einschränken oder sperren, die die Website missbrauchen.",
          ],
        },
        {
          title: "Unser Name und Logo",
          body: [
            "Der Quellcode der Website ist Teil unseres Open-Source-Repositorys und steht unter der Apache License 2.0. Der Name Skywake und das Skywake-Logo sind unsere Marken, und die Apache License gewährt keine Rechte daran. Sie dürfen sie verwenden, um auf Skywake hinzuweisen, jedoch nicht in einer Weise, die nahelegt, dass wir Sie oder Ihr Produkt empfehlen oder unterstützen.",
          ],
        },
        {
          title: "Informationen auf dieser Website",
          body: [
            "Wir erstellen die Website, die Leitfäden und die Dokumentation mit dem Ziel, dass sie korrekt und nützlich sind; sie stellen jedoch allgemeine Informationen und keine fachliche Beratung dar. Die Benchmarks wurden auf der Hardware und mit dem Setup gemessen, die wir jeweils dazu beschreiben, und Ihre Ergebnisse hängen von Ihrer eigenen Umgebung ab. Pläne, Funktionen und Preise von Skywake Cloud können sich vor dem Start ändern.",
          ],
        },
        {
          title: "Links zu anderen Websites",
          body: [
            "Wir verlinken auf Websites, die wir nicht kontrollieren, zum Beispiel GitHub. Für deren Inhalte und Praktiken sind wir nicht verantwortlich.",
          ],
        },
        {
          title: "Keine Gewährleistung",
          body: [
            "Die Website wird „wie besehen“ und „wie verfügbar“ bereitgestellt. Soweit gesetzlich zulässig, sichern wir nicht zu, dass sie jederzeit verfügbar, fehlerfrei oder für einen bestimmten Zweck geeignet ist.",
          ],
        },
        {
          title: "Haftungsbeschränkung",
          body: [
            "Soweit gesetzlich zulässig, haftet Skywake nicht für indirekte Schäden, Neben- oder Folgeschäden oder für Datenverluste, entgangenen Gewinn oder Geschäftsausfälle, die aus der Nutzung der Website entstehen. Nichts in diesen Bedingungen beschränkt eine Haftung, deren Beschränkung gesetzlich nicht zulässig ist.",
          ],
        },
        {
          title: "Änderungen dieser Bedingungen",
          body: [
            "Wir können diese Bedingungen aktualisieren. Das Datum oben zeigt die neueste Fassung. Wenn Sie die Website nach einer Änderung weiter nutzen, akzeptieren Sie die neuen Bedingungen.",
          ],
        },
        {
          title: "Fragen",
          body: ["Fragen zu diesen Bedingungen richten Sie bitte über {contact} an uns."],
        },
      ],
    },
  },
  notFound: {
    label: "404",
    title: "Hier ist nichts.",
    line: "Diese Seite gibt es nicht.",
    back: "Zurück zur Startseite",
  },
  guides: {
    eyebrow: "Anwendungsfälle",
    title: "Beginnen Sie mit Ihrem Problem.",
    accent: "So passt Skywake dazu.",
    onThisPage: "Auf dieser Seite",
    read: "Zur Anleitung",
    related: {
      eyebrow: "Verwandt",
      title: "Weitere Anwendungsfälle entdecken.",
      all: "Alle Anwendungsfälle",
    },
    items: {
      "knowledge-base": {
        name: "Wissensdatenbanken",
        title: "So bauen Sie eine große Wissensdatenbank für Ihre Agenten",
        lead: "Halten Sie Ihre Dokumente und ihren Suchindex im selben Bucket. Ändert sich ein Dokument, sieht die Suche es in unter einer Sekunde, ganz ohne Sync-Job.",
      },
      "context-layer": {
        name: "Kontext-Ebenen",
        title: "So geben Sie Ihren Agenten ein echtes Gedächtnis",
        lead: "Jeder Agent bekommt einen eigenen Ordner in Ihrem Bucket. Er schreibt Notizen als einfache Dateien, und der nächste Lauf macht dort weiter, wo der letzte aufgehört hat.",
      },
      sandboxes: {
        name: "Agenten-Speicher und Sandboxes",
        title: "So bleibt die Arbeit eines Agenten erhalten, wenn seine Sandbox abstürzt",
        lead: "Speichern Sie die Arbeit des Agenten nach jedem Schritt in Ihrem eigenen Bucket. Fällt die Maschine aus, übernimmt eine neue genau dort, wo es aufgehört hat.",
      },
      "coding-agents": {
        name: "Cloud-Coding-Agenten",
        title: "So bekommt jeder Coding-Agent seine eigene Kopie Ihres Repos",
        lead: "Speichern Sie Ihr Repo einmal, mit Paketen und Build-Cache. Jeder Agent bekommt in 10 ms seine eigene Kopie, und Sie mergen den Fix, der Ihnen gefällt.",
      },
      "document-agents": {
        name: "Dokumenten-Agenten",
        title: "So prüfen Sie jede Änderung, die ein Agent an Ihren Dateien macht",
        lead: "Agenten arbeiten auf einer Kopie des Ordners. Sie sehen jede Änderung, behalten die guten und verwerfen den Rest.",
      },
      rl: {
        name: "RL-Umgebungen und Evals",
        title: "So bekommt jeder RL-Lauf eine frische Kopie seiner Umgebung",
        lead: "Speichern Sie die Umgebung einmal. Jeder Lauf bekommt in 10 ms seine eigene saubere Kopie, so bleiben Ergebnisse fair und auffällige Läufe lassen sich später öffnen.",
      },
      ci: {
        name: "CI und Builds",
        title: "So starten CI-Jobs mit einem warmen Build",
        lead: "Speichern Sie Quellcode und Build-Cache einmal pro Nacht zusammen. Jeder Job baut auf seiner eigenen Kopie und kompiliert nur, was sich geändert hat.",
      },
      previews: {
        name: "Preview-Umgebungen",
        title: "So testen Sie jeden Pull Request mit echten Daten",
        lead: "Jeder Pull Request bekommt seinen eigenen Workspace, mit echten Daten und allen Abhängigkeiten. Nach dem Merge verschwindet er.",
      },
      datasets: {
        name: "Dataset-Versionierung",
        title: "So wissen Sie, mit welchen Daten jedes Modell trainiert wurde",
        lead: "Verzweigen Sie Daten wie Code. Testen Sie ein bereinigtes Dataset auf einer eigenen Kopie, vergleichen Sie die Modelle und verweisen Sie immer auf die exakten Daten dahinter.",
      },
      "reference-data": {
        name: "Gemeinsame Referenzdaten",
        title: "So teilen Sie große Dateien mit vielen Agenten",
        lead: "Speichern Sie große gemeinsame Dateien einmal in Ihrem Bucket. Jede Maschine lädt sie nur einmal herunter, und jeder Agent darauf liest die lokale Kopie.",
      },
    },
  },
};
