import { SitePage } from "@/components/layout/site-page";
import { Benchmarks } from "@/components/sections/benchmarks";
import { Cost } from "@/components/sections/cost";
import { Features } from "@/components/sections/features";
import { GetStarted } from "@/components/sections/get-started";
import { ProductHero } from "@/components/sections/product-hero";
import { Band } from "@/components/ui/frame";
import { TextureBand } from "@/components/ui/texture";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

export const instant = false;

export const generateMetadata = pageMetadata("/filesystem");

export default async function Filesystem({ params }: PageProps<"/[locale]/filesystem">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <ProductHero
        page={t.productPages.filesystem}
        t={t.productPages}
        docs="/filesystem/branches"
      />
      <Features features={t.productPages.filesystem.features} />
      <Benchmarks t={t} show="files" />
      <TextureBand />
      <Cost t={t} />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
