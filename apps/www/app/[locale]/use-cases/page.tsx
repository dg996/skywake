import { SitePage } from "@/components/layout/site-page";
import { GetStarted } from "@/components/sections/get-started";
import { UseCaseIndex } from "@/components/sections/use-case-index";
import { Band } from "@/components/ui/frame";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

export const instant = false;

export const generateMetadata = pageMetadata("/use-cases");

export default async function UseCases({ params }: PageProps<"/[locale]/use-cases">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <UseCaseIndex locale={locale} t={t} />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
