import type { MiniArtName } from "@/components/art/mini-art";

type Feature = { name: string; line: string; art: MiniArtName };
/** A legal page. In a body, a string is a paragraph and a list of strings is a bulleted list. */
type LegalPage = {
  title: string;
  intro: string;
  sections: { title: string; body: (string | string[])[] }[];
};
type Chart = { title: string; verdict: string; labels: string[] };
type ProductPage = {
  label: string;
  title: string;
  accent: string;
  line: string;
  features: Feature[];
};

export type HomeMessages = {
  /** Title and description of each page, for search engines and link previews. */
  pages: Record<
    | "/"
    | "/filesystem"
    | "/search"
    | "/use-cases"
    | "/pricing"
    | "/privacy"
    | "/terms"
    | "/benchmarks",
    { title: string; description: string }
  >;
  nav: {
    filesystem: string;
    search: string;
    benchmarks: string;
    pricing: string;
    docs: string;
    github: string;
    joinWaitlist: string;
    getStarted: string;
    language: string;
    menu: string;
    sections: string;
    theme: string;
  };
  footer: {
    blurb: string;
    product: string;
    project: string;
    legal: string;
    useCases: string;
    openSource: string;
    privacy: string;
    terms: string;
    star: string;
  };
  hero: {
    badge: string;
    titleBefore: string;
    titleAccent: string;
    screenshotAlt: string;
    getStartedCta: string;
  };
  useCases: {
    label: string;
    /** The heading: a short claim, then a quieter second line. */
    heading: [string, string];
    more: string;
    cta: string;
    items: { name: string; title: string; line: string }[];
  };
  git: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    line: string;
    works: string;
    note: string;
  };
  products: {
    items: {
      name: string;
      href: "/filesystem" | "/search";
      icon: "files" | "search";
      before: string;
      highlight: string;
      after: string;
      points: string[];
    }[];
  };
  architecture: {
    label: string;
    titleBefore: string;
    titleAccent: string;
    line: string;
    stats: string[];
  };
  benchmarks: {
    label: string;
    title: string;
  };
  cost: {
    label: string;
    chartTitle: string;
    chart: {
      without: string;
      with: string;
      withoutDetail: string;
      withDetail: string;
      perMonth: string;
      gap: string;
    };
    /** The headline: "{n}% less storage, {n}× lower cost and {n}× faster agent starts." */
    headline: { storage: string; cost: string; starts: string; and: string };
  };
  openSource: {
    label: string;
    title: string;
    line: string;
    star: string;
  };
  waitlist: {
    eyebrow: string;
    title: string;
    line: string;
    selfHost: string;
    star: string;
    openTitle: string;
    openLine: string;
    openCta: string;
    form: {
      email: string;
      join: string;
      joining: string;
      joined: string;
      invalid: string;
      off: string;
      error: string;
    };
  };
  /** The picture of how Skywake is put together. */
  layers: {
    alt: string;
    agents: [string, string];
    filesystem: [string, string];
    index: [string, string];
    cache: [string, string];
    storage: [string, string];
  };
  productPages: {
    getStarted: string;
    star: string;
    filesystem: ProductPage;
    search: ProductPage;
  };
  benchmarkPage: {
    line: string;
    filesTitle: string;
    searchTitle: string;
    filesNote: string;
    searchNote: string;
    files: Chart[];
    search: Chart[];
  };
  plans: {
    eyebrow: string;
    title: string;
    line: string;
    options: {
      name: string;
      price: string;
      per: string;
      line: string;
      includes: string[];
      action: string;
    }[];
  };
  /** Section bodies may hold {contact}, filled with the contact email. */
  legal: {
    updated: string;
    privacy: LegalPage;
    terms: LegalPage;
  };
  notFound: { label: string; title: string; line: string; back: string };
  guides: {
    eyebrow: string;
    title: string;
    accent: string;
    onThisPage: string;
    read: string;
    related: { eyebrow: string; title: string; all: string };
    /** One per use case, by its id in content/use-cases. */
    items: Record<string, { name: string; title: string; lead: string }>;
  };
};
