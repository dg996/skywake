import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

/** The page's language from its URL, or a 404 for anything that isn't one. */
export async function pageLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
