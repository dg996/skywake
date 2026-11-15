import type { Metadata } from "next";

import { getMessages } from "@/content/messages";
import { imageSlug, type PagePath } from "@/content/pages";
import { site } from "@/content/site";
import { defaultLocale, isLocale, localeOg, locales, localizePath, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

/** The same page in every language, so search engines show each reader their own. */
export function languages(path: string) {
  return {
    ...Object.fromEntries(locales.map((l) => [l, localizePath(l, path)])),
    "x-default": localizePath(defaultLocale, path),
  };
}

// `path` has no locale. `image` is a slug under /og. `absolute` skips the "· Skywake" title suffix.
export function buildMetadata({
  locale,
  path,
  title,
  description,
  image: slug,
  absolute = false,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image: string;
  absolute?: boolean;
}): Metadata {
  const url = localizePath(locale, path);
  const image = { url: `/og/${slug}`, width: 1200, height: 630, alt: title };
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: languages(path),
      types: { "text/plain": "/llms.txt" },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: localeOg[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeOg[l]),
      url,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const localeOf = async (params: Props["params"]) => {
  const { locale } = await params;
  return isLocale(locale) ? locale : defaultLocale;
};

/** generateMetadata for a page, in the reader's language. */
export function pageMetadata(path: PagePath) {
  return async ({ params }: Props): Promise<Metadata> => {
    const locale = await localeOf(params);
    const { title, description } = getMessages(locale).pages[path];
    return buildMetadata({
      locale,
      path,
      title,
      description,
      image: imageSlug(path),
      absolute: path === "/",
    });
  };
}
