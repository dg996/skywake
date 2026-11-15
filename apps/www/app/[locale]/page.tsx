import { SitePage } from "@/components/layout/site-page";
import { Architecture } from "@/components/sections/architecture";
import { Cost } from "@/components/sections/cost";
import { GetStarted } from "@/components/sections/get-started";
import { WorksWithGit } from "@/components/sections/git";
import { Hero } from "@/components/sections/hero";
import { OpenSource } from "@/components/sections/open-source";
import { Products } from "@/components/sections/products";
import { UseCases } from "@/components/sections/use-cases";
import { Band } from "@/components/ui/frame";
import { TextureBand } from "@/components/ui/texture";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { structuredData } from "@/lib/structured-data";
import { pageLocale } from "@/lib/page";

export const instant = false;

export const generateMetadata = pageMetadata("/");

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <script
        type="application/ld+json"
        // Escaped so the JSON can't close the script tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Hero t={t} />
      <Products t={t} locale={locale} />
      <UseCases t={t} locale={locale} />
      <TextureBand />
      <Cost t={t} />
      <TextureBand />
      <WorksWithGit t={t} />
      <Architecture t={t} />
      <OpenSource t={t} />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
