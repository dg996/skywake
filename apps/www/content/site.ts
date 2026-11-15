export const site = {
  name: "Skywake",
  title: "Skywake: Fast filesystem and search on S3 for AI agents",
  description:
    "A versioned filesystem and search index on your own object storage. Give every AI agent its own copy in 10 ms, mount it like a local disk, and search by meaning or keyword.",
  url: process.env.SITE_URL as string,
  docsUrl: process.env.DOCS_LINK as string,
  consoleUrl: process.env.CONSOLE_LINK as string,
  repoUrl: "https://github.com/skywakehq/skywake",
  email: "hello@skywake.dev",
  cloudOpen: process.env.CLOUD_OPEN === "1",
};
