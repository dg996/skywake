import { SitePage } from "@/components/layout/site-page";
import { Benchmarks } from "@/components/sections/benchmarks";
import { Features } from "@/components/sections/features";
import { GetStarted } from "@/components/sections/get-started";
import { ProductHero } from "@/components/sections/product-hero";
import { Band } from "@/components/ui/frame";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

export const instant = false;

export const generateMetadata = pageMetadata("/search");

export default async function Search({ params }: PageProps<"/[locale]/search">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <ProductHero page={t.productPages.search} t={t.productPages} docs="/indexes" />
      <Features features={t.productPages.search.features} />
      <Benchmarks t={t} show="search" />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
