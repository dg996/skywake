import { de } from "../content/messages/de";
import { en } from "../content/messages/en";
import { es } from "../content/messages/es";
import { fr } from "../content/messages/fr";
import { it } from "../content/messages/it";
import type { HomeMessages } from "../content/messages/types";

function flatten(obj: object, prefix = ""): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...flatten(value as object, path));
    } else {
      out.push(path);
    }
  }
  return out;
}

function stripPagePriorities(messages: HomeMessages): HomeMessages {
  const pages = Object.fromEntries(
    Object.entries(messages.pages).map(([path, meta]) => [
      path,
      { title: meta.title, description: meta.description },
    ]),
  ) as HomeMessages["pages"];
  return { ...messages, pages };
}

const catalogs: Record<string, HomeMessages> = {
  en: stripPagePriorities(en),
  de: stripPagePriorities(de),
  es: stripPagePriorities(es),
  fr: stripPagePriorities(fr),
  it: stripPagePriorities(it),
};
const base = new Set(flatten(catalogs.en));
let failed = false;

for (const [locale, catalog] of Object.entries(catalogs)) {
  const keys = new Set(flatten(catalog));
  for (const key of base) {
    if (!keys.has(key)) {
      console.error(`[${locale}] missing ${key}`);
      failed = true;
    }
  }
  for (const key of keys) {
    if (!base.has(key)) {
      console.error(`[${locale}] extra ${key}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("All locale message keys match en.");