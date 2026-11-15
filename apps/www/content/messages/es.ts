import type { HomeMessages } from "./types";

export const es: HomeMessages = {
  pages: {
    "/": {
      title: "Skywake: sistema de archivos y búsqueda rápidos en S3 para agentes de IA",
      description:
        "Sistema de archivos y búsqueda open source en tu propio bucket S3. Monta como un disco local, da a cada agente de IA su copia en 10 ms y busca.",
    },
    "/filesystem": {
      title: "Sistema de archivos sobre S3 para agentes de IA: monta, copia y fusiona",
      description:
        "Monta S3 o cualquier almacenamiento de objetos como un disco local rápido. Copia 20,000 archivos para cada agente en 10 ms y fusiona los cambios como en Git.",
    },
    "/search": {
      title: "Búsqueda vectorial y de texto completo sobre S3",
      description:
        "Búsqueda vectorial, de texto completo e híbrida directo desde tu almacenamiento de objetos. 10 ms en caliente sobre 10M de vectores, sin otra base de datos.",
    },
    "/use-cases": {
      title: "Casos de uso: bases de conocimiento, memoria de agentes, agentes de código y más",
      description:
        "Cómo usar Skywake paso a paso para bases de conocimiento, memoria de agentes, sandboxes, agentes de código y documentos, evals, CI y datasets.",
    },
    "/pricing": {
      title: "Precios",
      description:
        "Alojarlo tú mismo es gratis, con todas las funciones y sin límites. Skywake Cloud está en beta privada.",
    },
    "/privacy": {
      title: "Privacidad",
      description: "Qué datos recoge este sitio, para qué y cómo pedir que se borren.",
    },
    "/terms": {
      title: "Términos",
      description: "Las condiciones de uso de este sitio y del software de Skywake.",
    },
    "/benchmarks": {
      title: "Benchmarks",
      description:
        "Medido en AWS con el bucket en la misma región: copias para agentes, subidas, builds y búsqueda sobre 10M de vectores.",
    },
  },
  nav: {
    filesystem: "Filesystem",
    search: "Búsqueda",
    benchmarks: "Benchmarks",
    pricing: "Precios",
    docs: "Docs",
    github: "GitHub",
    joinWaitlist: "Lista de espera",
    getStarted: "Empezar",
    language: "Idioma",
    menu: "Menú",
    sections: "Secciones",
    theme: "Cambiar entre modo claro y oscuro",
  },
  footer: {
    blurb:
      "Tu bucket como disco rápido y motor de búsqueda. Open source, en tu propio almacenamiento de objetos.",
    product: "Producto",
    project: "Proyecto",
    legal: "Legal",
    useCases: "Casos de uso",
    openSource: "Open source",
    privacy: "Privacidad",
    terms: "Términos",
    star: "Dar estrella en GitHub",
  },
  hero: {
    badge: "Skywake Cloud está en camino. Únete a la lista de espera",
    titleBefore: "Sistema de archivos y búsqueda rápidos",
    titleAccent: "para agentes de IA.",
    screenshotAlt:
      "La consola de Skywake, con los discos de un equipo y los agentes que trabajan en ellos",
    getStartedCta: "Empezar",
  },
  useCases: {
    label: "Casos de uso",
    heading: ["Tú construyes los agentes.", "Skywake se encarga de archivos y búsqueda."],
    more: "Ver todos los casos de uso",
    cta: "Saber más",
    items: [
      {
        name: "Base de conocimiento",
        title: "Una base de conocimiento para tus agentes.",
        line: "Tus documentos y archivos en un solo lugar, con búsqueda integrada. Los agentes siempre encuentran la última versión, nunca una copia vieja.",
      },
      {
        name: "Capa de contexto",
        title: "Una memoria y capa de contexto central para tus agentes.",
        line: "Los agentes guardan lo que aprenden como archivos simples. La próxima vez siguen donde lo dejaron, y otros agentes también pueden leerlo.",
      },
      {
        name: "Almacenamiento para agentes",
        title: "Un sistema de archivos compartido para agentes.",
        line: "Los agentes leen y escriben los mismos archivos, como en una unidad compartida. El trabajo guardado sobrevive aunque se caiga una máquina.",
      },
      {
        name: "Agentes de código en la nube",
        title: "Una copia de tu repo para cada agente.",
        line: "Cada agente tiene su propia copia de tu proyecto en 10 ms. Ejecuta muchos a la vez, quédate con el mejor resultado y descarta el resto.",
      },
      {
        name: "Evals y RL",
        title: "Un entorno limpio para cada ejecución.",
        line: "Cada ejecución parte del mismo entorno, en su propia copia. Ejecuta miles en paralelo sin que una afecte a otra.",
      },
    ],
  },
  git: {
    label: "Git",
    titleBefore: "Funciona con",
    titleAccent: "Git.",
    line: "Git guarda tu código. Skywake guarda toda la carpeta: paquetes, datos y cachés.",
    works: "Git funciona como siempre en cada copia.",
    note: "Sigue subiendo tu código a Git. Skywake guarda todo lo demás.",
  },
  products: {
    items: [
      {
        name: "Filesystem",
        href: "/filesystem",
        icon: "files",
        before: "Dale a cada agente ",
        highlight: "su propia copia de tus archivos",
        after:
          ". Lista en 10 ms, se abre como una carpeta normal y se fusiona cuando termina el trabajo.",
        points: [
          "Copia 20,000 archivos en 10 ms",
          "Ábrela sin descargarlo todo",
          "Revisa y fusiona cambios como en Git",
        ],
      },
      {
        name: "Búsqueda",
        href: "/search",
        icon: "search",
        before: "Busca ",
        highlight: "por significado, por palabras exactas o ambas",
        after: ". Un solo índice, copiado para cada agente como tus archivos.",
        points: [
          "10 ms en caliente sobre 10M de vectores",
          "Compatible con cualquier modelo de embeddings",
          "Copia un índice sin tocar main",
        ],
      },
    ],
  },
  architecture: {
    label: "Cómo funciona",
    titleBefore: "Tan rápido como",
    titleAccent: "tu propio disco.",
    line: "Los archivos se sirven desde una caché NVMe compartida, justo al lado de tus agentes.",
    stats: [
      "para escribir un archivo pequeño",
      "para leer un archivo pequeño",
      "más lento que un disco local en una build completa",
    ],
  },
  benchmarks: {
    label: "Benchmarks",
    title: "Velocidad de disco local, medida desde tu bucket.",
  },
  cost: {
    label: "Costo",
    chartTitle: "Almacenamiento para {agents} agentes",
    chart: {
      without: "Sin Skywake",
      with: "Con Skywake",
      withoutDetail: "{agents} copias completas de {workspaceGb} GB",
      withDetail: "{workspaceGb} GB compartidos + {agents} × {addedMb} MB de cambios",
      perMonth: "{value} al mes",
      gap: "{x}× menos",
    },
    headline: {
      storage: "menos almacenamiento",
      cost: "menor costo",
      starts: "agentes que arrancan más rápido",
      and: "y",
    },
  },
  openSource: {
    label: "Open source",
    title: "Apache 2.0. Ejecútalo tú mismo hoy.",
    line: "Instálalo en tu infraestructura con Docker o Kubernetes, sobre tu propio almacenamiento de objetos.",
    star: "Dar estrella en GitHub",
  },
  waitlist: {
    eyebrow: "Skywake Cloud",
    title: "Skywake gestionado está en camino. Entérate primero.",
    line: "Únete a la lista de espera para archivos y búsqueda alojados.",
    selfHost: "Instálalo tú mismo con la documentación",
    star: "Dar estrella en GitHub",
    openTitle: "Empieza a construir con Skywake.",
    openLine:
      "Dale a cada agente un workspace con ramas y un índice de búsqueda en tu propio almacenamiento de objetos.",
    openCta: "Empezar",
    form: {
      email: "Correo electrónico",
      join: "Unirme a la lista",
      joining: "Uniéndote…",
      joined: "Ya estás en la lista. Te escribiremos cuando abra Cloud.",
      invalid: "Escribe un correo electrónico válido.",
      off: "La lista de espera aún no está abierta. Vuelve a intentarlo pronto.",
      error: "Algo falló de nuestro lado. Vuelve a intentarlo.",
    },
  },
  layers: {
    alt: "Los agentes y las apps usan un sistema de archivos y un índice de búsqueda. Ambos leen tu almacenamiento de objetos a través de una caché compartida. Solo los cambios se escriben de vuelta, cada 2 segundos.",
    agents: ["Agentes", "y tus apps"],
    filesystem: ["Sistema de archivos", "montar · fork · merge"],
    index: ["Índice", "vectorial · texto completo"],
    cache: ["Caché", "NVMe + compartida"],
    storage: ["Almacenamiento de objetos", "tu bucket"],
  },
  productPages: {
    getStarted: "Empezar",
    star: "Dar estrella en GitHub",
    filesystem: {
      label: "Filesystem",
      title: "Tu bucket, como un",
      accent: "disco local rápido.",
      line: "Monta tu almacenamiento de objetos como una carpeta normal. Dale a cada agente su propia copia en 10 ms y luego fusiona los cambios.",
      features: [
        {
          name: "Cada agente tiene su propia copia",
          line: "Una copia completa de tus archivos en 10 ms, sin importar su tamaño. No se duplica nada.",
          art: "fork",
        },
        {
          name: "Funciona como una carpeta normal",
          line: "Móntalo en cualquier máquina. Tus herramientas, scripts y Git funcionan sin cambios.",
          art: "mount",
        },
        {
          name: "Se guarda solo",
          line: "Los cambios llegan a tu bucket cada 2 segundos, sin hacer commit.",
          art: "autosave",
        },
        {
          name: "Resiste caídas",
          line: "Apaga la máquina a mitad de una escritura. Cada cambio guardado sigue ahí.",
          art: "recover",
        },
        {
          name: "Mira qué cambió cada agente",
          line: "Cada archivo que creó, editó o borró, comparado con main.",
          art: "diff",
        },
        {
          name: "Quédate solo con lo bueno",
          line: "Fusiona los cambios de un agente en main, archivo por archivo.",
          art: "merge",
        },
        {
          name: "Main siempre a salvo",
          line: "Los agentes no pueden escribir en main. Solo cambia cuando tú fusionas.",
          art: "protect",
        },
      ],
    },
    search: {
      label: "Búsqueda",
      title: "Busca en todo",
      accent: "tu bucket.",
      line: "Búsqueda vectorial, de texto completo e híbrida sobre tu almacenamiento de objetos, servida desde una caché NVMe rápida.",
      features: [
        {
          name: "Encuentra por significado",
          line: "Busca “restablecer una contraseña perdida” y encuentra la página “Recuperar la cuenta”.",
          art: "vector",
        },
        {
          name: "Encuentra palabras exactas",
          line: "Nombres, códigos de error y frases, incluso con una errata.",
          art: "fullText",
        },
        {
          name: "Ambas en una búsqueda",
          line: "Significado y palabras exactas se ordenan juntos, así el mejor resultado sale primero.",
          art: "hybrid",
        },
        {
          name: "Cuenta y agrupa resultados",
          line: "Totales, sumas y grupos sobre tus datos, en la misma consulta.",
          art: "analytics",
        },
        {
          name: "Prueba sobre una copia",
          line: "Haz fork de un índice, prueba datos nuevos y deja producción intacta.",
          art: "branches",
        },
        {
          name: "Deshaz cualquier cambio",
          line: "Vuelve a cualquier versión anterior del índice.",
          art: "timeTravel",
        },
      ],
    },
  },
  benchmarkPage: {
    line: "Medido en AWS, con el bucket en la misma región.",
    filesTitle: "Tan rápido como un disco local.",
    searchTitle: "10M de vectores, buscados en 10 ms.",
    filesNote: "AWS m7i-flex.large, almacenamiento de objetos en la misma región",
    searchNote:
      "10M de vectores × 768 en almacenamiento de objetos, AWS i4i.4xlarge en la misma región",
    files: [
      {
        title: "Dar a un agente su propia copia de 1 GB",
        verdict: "300× más rápido",
        labels: ["Skywake", "Copiar los archivos"],
      },
      {
        title: "Guardar 1 GB en tu bucket",
        verdict: "4.5× más rápido",
        labels: ["Skywake", "Una subida normal"],
      },
      {
        title: "Compilar y probar un proyecto en Rust",
        verdict: "Igual que un disco local",
        labels: ["Skywake", "Disco local"],
      },
    ],
    search: [
      {
        title: "Buscar en 10M de vectores",
        verdict: "10 ms ya en caché",
        labels: ["Búsqueda repetida", "Primera búsqueda, desde tu bucket"],
      },
      {
        title: "Buscar con un filtro",
        verdict: "Aún por debajo de 25 ms",
        labels: ["Filtrado al 1% de las filas", "Sin filtro"],
      },
      {
        title: "Encontrar las respuestas correctas",
        verdict: "95% de recall",
        labels: ["Sin filtro", "Filtrado al 1% de las filas"],
      },
    ],
  },
  plans: {
    eyebrow: "Precios",
    title: "Gratis en tu infraestructura, desde hoy.",
    line: "La nube está en beta privada.",
    options: [
      {
        name: "Self-host",
        price: "Gratis",
        per: "para siempre",
        line: "Ejecútalo hoy en tus propias máquinas.",
        includes: [
          "Todas las funciones, sin límites",
          "Open source con licencia Apache-2.0",
          "Docker o Kubernetes",
          "Tu propio almacenamiento de objetos",
        ],
        action: "Leer la guía",
      },
      {
        name: "Cloud",
        price: "Beta privada",
        per: "",
        line: "Nosotros lo operamos por ti. Los precios llegan con el lanzamiento.",
        includes: [
          "Nada que instalar ni operar",
          "Una caché compartida junto a tus agentes",
          "Paga solo por lo que usas",
          "Funciona sobre tu propio bucket",
        ],
        action: "Unirme a la lista de espera",
      },
    ],
  },
  legal: {
    updated: "Última actualización: 15 de noviembre de 2026",
    privacy: {
      title: "Privacidad",
      intro:
        "Esta política explica qué datos recoge el sitio web de Skywake, por qué, quién los trata y qué opciones tienes. En resumen: recogemos muy poco, no te rastreamos y nunca vendemos tus datos.",
      sections: [
        {
          title: "Quiénes somos",
          body: [
            "Skywake (“nosotros”) gestiona este sitio web en skywake.dev y es el responsable de los datos personales descritos aquí. Puedes contactarnos sobre cualquier aspecto de esta política a través de {contact}.",
          ],
        },
        {
          title: "Qué cubre esta política",
          body: [
            "Esta política cubre el sitio web, incluidas sus páginas, sus guías y la lista de espera de Cloud. No cubre el software de Skywake que ejecutas tú mismo, que se explica más abajo, ni Skywake Cloud, que tendrá sus propias condiciones de privacidad cuando abra.",
          ],
        },
        {
          title: "Qué datos recogemos",
          body: [
            "Solo recogemos lo que tú nos das y lo que cualquier sitio web necesita para funcionar:",
            [
              "Datos de la lista de espera. Si te unes a la lista de espera de Cloud: tu dirección de correo electrónico, la nota que dejes (si dejas alguna) y la fecha y hora en que te uniste.",
              "Mensajes que nos envías. Si nos escribes, conservamos tu mensaje y tu dirección de correo electrónico para poder responderte.",
              "Datos técnicos. Con cada solicitud, nuestro proveedor de alojamiento recibe tu dirección IP, el tipo de navegador y la página solicitada. Los conserva en registros del servidor de corta duración para servir el sitio y protegerlo frente a abusos.",
            ],
            "No te pedimos tu nombre ni recogemos datos de pago, tu ubicación precisa ni ningún dato sensible.",
          ],
        },
        {
          title: "Cookies y almacenamiento local",
          body: [
            "El sitio instala una sola cookie, NEXT_LOCALE, que recuerda el idioma que elegiste para que la siguiente página se abra en ese mismo idioma. Es necesaria para que el sitio funcione como esperas y no se usa para rastrearte.",
            "Tu tema claro u oscuro se guarda en el almacenamiento local de tu navegador. Se queda en tu dispositivo y nunca nos llega.",
            "No usamos analítica, publicidad ni scripts de seguimiento de terceros. Las fuentes se sirven desde nuestro propio sitio, así que cargar una página no establece contacto con Google ni con ningún otro servicio de fuentes.",
          ],
        },
        {
          title: "Cómo usamos tus datos",
          body: [
            "Usamos tu información únicamente para:",
            [
              "enviarte una confirmación cuando te unes a la lista de espera, y un correo cuando abra Skywake Cloud;",
              "responderte cuando te pones en contacto con nosotros;",
              "hacer funcionar el sitio, mantenerlo seguro y corregir problemas.",
            ],
            "No la usamos con fines publicitarios, no elaboramos perfiles ni tomamos decisiones automatizadas sobre ti. Nunca vendemos ni alquilamos tus datos.",
          ],
        },
        {
          title: "Base jurídica",
          body: [
            "Cuando se aplica el RGPD o una ley similar, nos basamos en:",
            [
              "tu consentimiento, para la lista de espera, que puedes retirar en cualquier momento;",
              "nuestro interés legítimo en mantener un sitio web seguro, para los registros del servidor y la cookie de idioma;",
              "nuestro interés legítimo en responderte, cuando nos escribes.",
            ],
          ],
        },
        {
          title: "Quién trata tus datos",
          body: [
            "Trabajamos con un número reducido de proveedores de servicios. Solo tratan los datos siguiendo nuestras instrucciones y únicamente para prestar su servicio:",
            [
              "Vercel aloja el sitio web y conserva sus registros del servidor.",
              "Una base de datos PostgreSQL gestionada almacena la lista de espera.",
              "Resend envía nuestros correos.",
            ],
            "También podemos comunicar información si la ley lo exige, o para proteger nuestros derechos o la seguridad de alguien. Si Skywake se fusiona con otra empresa o es adquirida por ella, la lista de espera podrá pasar a esa empresa bajo esta misma política.",
          ],
        },
        {
          title: "Transferencias internacionales",
          body: [
            "Nuestros proveedores pueden almacenar y tratar datos en Estados Unidos y en otros países distintos del tuyo. Cuando la ley lo exige, estas transferencias están amparadas por garantías como las cláusulas contractuales tipo de la Comisión Europea.",
          ],
        },
        {
          title: "Cuánto tiempo los conservamos",
          body: [
            [
              "Datos de la lista de espera: hasta que abra Skywake Cloud y te hayamos enviado el correo, o hasta que nos pidas que te eliminemos, lo que ocurra primero.",
              "Mensajes que nos envías: el tiempo necesario para atender tu solicitud.",
              "Registros del servidor: un periodo breve, fijado por nuestro proveedor de alojamiento, tras el cual se eliminan.",
            ],
          ],
        },
        {
          title: "Tus derechos",
          body: [
            "Según dónde vivas, puedes pedirnos que:",
            [
              "te mostremos los datos personales que tenemos sobre ti;",
              "los rectifiquemos si son incorrectos;",
              "los suprimamos;",
              "limitemos su uso o dejemos de usarlos;",
              "te entreguemos una copia en un formato portable;",
              "demos por retirado tu consentimiento, por ejemplo cuando sales de la lista de espera.",
            ],
            "Para ejercer cualquiera de estos derechos, contáctanos a través de {contact}. Respondemos en un plazo de 30 días y sin coste alguno. También puedes presentar una reclamación ante la autoridad de protección de datos de tu país.",
          ],
        },
        {
          title: "Seguridad",
          body: [
            "Todas las conexiones con el sitio están cifradas (HTTPS), el acceso a tus datos se limita a las personas que lo necesitan y nuestros proveedores siguen los estándares de seguridad del sector. Ningún sistema es perfectamente seguro, pero si una brecha afecta a tus datos, te lo comunicaremos según exija la ley.",
          ],
        },
        {
          title: "El Skywake que ejecutas tú mismo",
          body: [
            "El software open source de Skywake que instalas en tus propias máquinas no nos envía nada. Tus archivos, índices, claves y uso se quedan en tu propio bucket y tu propia base de datos, bajo tu control.",
          ],
        },
        {
          title: "Enlaces a otros sitios",
          body: [
            "El sitio enlaza a servicios que no gestionamos nosotros, como GitHub. Cuando los visitas, se aplican sus propias políticas de privacidad.",
          ],
        },
        {
          title: "Menores",
          body: [
            "Este sitio está pensado para desarrolladores y empresas. No está dirigido a menores de 16 años y no recogemos sus datos a sabiendas. Si crees que un menor nos ha facilitado datos personales, contáctanos y los eliminaremos.",
          ],
        },
        {
          title: "Cambios en esta política",
          body: [
            "Si modificamos esta política, actualizaremos la fecha que aparece al principio de esta página. Si un cambio afecta a cómo usamos datos que ya nos has dado, te enviaremos un correo antes de que entre en vigor.",
          ],
        },
      ],
    },
    terms: {
      title: "Términos",
      intro:
        "Estos términos se aplican cuando usas el sitio web de Skywake. Al usar el sitio, los aceptas. Si no estás de acuerdo con ellos, no lo uses.",
      sections: [
        {
          title: "Quiénes somos",
          body: [
            "Skywake (“nosotros”) gestiona este sitio web en skywake.dev. Puedes contactarnos a través de {contact}.",
          ],
        },
        {
          title: "El software open source",
          body: [
            "Skywake es open source bajo la Apache License 2.0. Esa licencia, y no estos términos, define lo que puedes hacer con el código, incluido usarlo, modificarlo y compartirlo. Tal como indica la licencia, el software se ofrece tal cual, sin garantías ni condiciones de ningún tipo.",
          ],
        },
        {
          title: "Skywake Cloud",
          body: [
            "Skywake Cloud, nuestro servicio alojado, aún no está abierto. Tendrá sus propios términos de servicio, que verás y aceptarás antes de registrarte. Unirte a la lista de espera no crea ningún contrato ni garantiza el acceso, una fecha de lanzamiento o un precio.",
          ],
        },
        {
          title: "Uso de este sitio",
          body: [
            "Puedes leer, enlazar y compartir este sitio. Cuando lo uses, te pedimos que no:",
            [
              "intentes romperlo, sobrecargarlo o eludir su seguridad;",
              "lo rastrees de forma tan intensiva que el sitio se vuelva más lento para los demás;",
              "apuntes a otras personas a la lista de espera ni uses una dirección de correo electrónico que no sea tuya;",
              "lo uses para infringir la ley o los derechos de terceros.",
            ],
            "Los motores de búsqueda y los agentes de IA pueden leer el sitio, su llms.txt y nuestra documentación. Podemos limitar o bloquear el acceso a quien haga un mal uso del sitio.",
          ],
        },
        {
          title: "Nuestro nombre y logotipo",
          body: [
            "El código fuente del sitio web forma parte de nuestro repositorio open source, bajo la Apache License 2.0. El nombre y el logotipo de Skywake son marcas nuestras, y la Apache License no otorga derechos sobre ellos. Puedes usarlos para referirte a Skywake, pero no de una forma que sugiera que te respaldamos a ti o a tu producto.",
          ],
        },
        {
          title: "Información de este sitio",
          body: [
            "Redactamos el sitio, las guías y la documentación para que sean precisos y útiles, pero son información general, no asesoramiento profesional. Los benchmarks se midieron con el hardware y la configuración que describimos junto a ellos, y tus resultados dependerán de los tuyos. Los planes, las funciones y los precios de Skywake Cloud pueden cambiar antes del lanzamiento.",
          ],
        },
        {
          title: "Enlaces a otros sitios",
          body: [
            "Enlazamos a sitios que no controlamos, como GitHub. No somos responsables de su contenido ni de sus prácticas.",
          ],
        },
        {
          title: "Exclusión de garantías",
          body: [
            "El sitio se ofrece “tal cual” y “según disponibilidad”. En la medida en que la ley lo permita, no garantizamos que esté siempre disponible, libre de errores o sea adecuado para un fin concreto.",
          ],
        },
        {
          title: "Limitación de responsabilidad",
          body: [
            "En la medida en que la ley lo permita, Skywake no será responsable de ninguna pérdida indirecta, incidental o consecuente, ni de la pérdida de datos, beneficios o negocio, derivada del uso del sitio. Nada de lo dispuesto en estos términos limita la responsabilidad que la ley no nos permite limitar.",
          ],
        },
        {
          title: "Cambios en estos términos",
          body: [
            "Podemos actualizar estos términos. La fecha que aparece al principio indica la versión más reciente. Si sigues usando el sitio después de un cambio, aceptas los nuevos términos.",
          ],
        },
        {
          title: "Preguntas",
          body: ["Si tienes preguntas sobre estos términos, hazlas a través de {contact}."],
        },
      ],
    },
  },
  notFound: {
    label: "404",
    title: "Aquí no hay nada.",
    line: "Esta página no existe.",
    back: "Volver a la página de inicio",
  },
  guides: {
    eyebrow: "Casos de uso",
    title: "Empieza por el problema que tienes.",
    accent: "Así encaja Skywake.",
    onThisPage: "En esta página",
    read: "Leer la guía",
    related: {
      eyebrow: "Relacionado",
      title: "Explora más casos de uso.",
      all: "Todos los casos de uso",
    },
    items: {
      "knowledge-base": {
        name: "Bases de conocimiento",
        title: "Cómo crear una gran base de conocimiento para tus agentes",
        lead: "Guarda tus documentos y su índice de búsqueda en el mismo bucket. Cuando un documento cambia, la búsqueda lo ve en menos de un segundo, sin procesos de sincronización que vigilar.",
      },
      "context-layer": {
        name: "Capas de contexto",
        title: "Cómo darles a tus agentes una buena capa de memoria",
        lead: "Dale a cada agente su propia carpeta en tu bucket. Escribe notas como archivos simples, y la siguiente ejecución sigue donde terminó la anterior.",
      },
      sandboxes: {
        name: "Almacenamiento y sandboxes para agentes",
        title: "Cómo no perder el trabajo de un agente cuando falla su sandbox",
        lead: "Guarda el trabajo del agente después de cada paso, en tu propio bucket. Si la máquina se cae, otra retoma la tarea donde se quedó.",
      },
      "coding-agents": {
        name: "Agentes de código en la nube",
        title: "Cómo darle a cada agente de código su propia copia de tu repo",
        lead: "Guarda tu repo una vez, con sus paquetes y su caché de build. Cada agente tiene su propia copia en 10 ms, y tú fusionas la solución que prefieras.",
      },
      "document-agents": {
        name: "Agentes de documentos",
        title: "Cómo revisar cada cambio que un agente hace en tus archivos",
        lead: "Los agentes trabajan sobre una copia de la carpeta. Ves cada cambio que hicieron, te quedas con los buenos y descartas el resto.",
      },
      rl: {
        name: "Entornos de RL y evals",
        title: "Cómo darle a cada ejecución de RL una copia limpia de su entorno",
        lead: "Guarda el entorno una vez. Cada ejecución tiene su propia copia limpia en 10 ms, así los resultados son justos y puedes abrir cualquier ejecución rara después.",
      },
      ci: {
        name: "CI y builds",
        title: "Cómo hacer que los jobs de CI arranquen con la build en caliente",
        lead: "Guarda tu código y su caché de build juntos una vez por noche. Cada job compila sobre su propia copia, así solo compila lo que cambió.",
      },
      previews: {
        name: "Entornos de preview",
        title: "Cómo probar cada pull request con datos reales",
        lead: "Dale a cada pull request su propio workspace, con datos reales y sus dependencias. Desaparece cuando haces merge.",
      },
      datasets: {
        name: "Versiones de datasets",
        title: "Cómo saber con qué datos se entrenó cada modelo",
        lead: "Crea ramas de tus datos como del código. Prueba un dataset más limpio en su propia copia, compara los modelos y apunta siempre a los datos exactos de cada uno.",
      },
      "reference-data": {
        name: "Datos de referencia compartidos",
        title: "Cómo compartir archivos grandes con muchos agentes",
        lead: "Guarda una vez los archivos grandes compartidos en tu bucket. Cada máquina los descarga una sola vez, y todos sus agentes leen la copia local.",
      },
    },
  },
};
