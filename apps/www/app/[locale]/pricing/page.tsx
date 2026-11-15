import { SitePage } from "@/components/layout/site-page";
import { Cost } from "@/components/sections/cost";
import { GetStarted } from "@/components/sections/get-started";
import { Plans } from "@/components/sections/plans";
import { Band } from "@/components/ui/frame";
import { TextureBand } from "@/components/ui/texture";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

// The plans, then what sharing one copy saves, then the waitlist.
export const instant = false;

export const generateMetadata = pageMetadata("/pricing");

export default async function Pricing({ params }: PageProps<"/[locale]/pricing">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <Plans t={t} />
      <TextureBand />
      <Cost t={t} />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
