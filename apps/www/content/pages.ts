export type Page = { title: string; description: string; priority: number };

export const pages = {
  "/": {
    title: "Skywake: A scalable filesystem and search engine for AI agents",
    description:
      "Open-source filesystem and hybrid search on your own S3 bucket. Fork a workspace for every agent in milliseconds, mount it like a local disk, and search by meaning or keyword.",
    priority: 1,
  },
  "/filesystem": {
    title: "S3 filesystem for AI agents: mount, copy and merge",
    description:
      "Mount S3 or any object storage as a fast local disk. Give every agent its own copy of 20,000 files in 10 ms, then diff and merge the changes like git.",
    priority: 0.9,
  },
  "/search": {
    title: "Vector and full-text search on S3",
    description:
      "Vector, full-text and hybrid search straight from your own object storage. 10 ms warm queries over 10M vectors, and no separate database to run.",
    priority: 0.9,
  },
  "/use-cases": {
    title: "Use cases: knowledge bases, agent memory, coding agents and more",
    description:
      "How teams use Skywake for knowledge bases, agent memory, sandboxes, coding and document agents, evals, CI and datasets, step by step.",
    priority: 0.7,
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Free to self-host, with every feature and no limits. Skywake Cloud is in private beta.",
    priority: 0.8,
  },
  "/benchmarks": {
    title: "Benchmarks",
    description:
      "Measured on AWS with the bucket in the same region: agent copies, uploads and builds, and search over 10M vectors.",
    priority: 0.7,
  },
  "/privacy": {
    title: "Privacy",
    description: "What this site collects, why, and how to have it deleted.",
    priority: 0.2,
  },
  "/terms": {
    title: "Terms",
    description: "The terms for using this site and the Skywake software.",
    priority: 0.2,
  },
} satisfies Record<string, Page>;

export type PagePath = keyof typeof pages;

export const pagePaths = Object.keys(pages) as PagePath[];

export const imageSlug = (path: PagePath) => (path === "/" ? "home" : path.slice(1));
