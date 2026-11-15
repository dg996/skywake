import { SitePage } from "@/components/layout/site-page";
import { Legal } from "@/components/sections/legal";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

export const instant = false;

export const generateMetadata = pageMetadata("/privacy");

export default async function Privacy({ params }: PageProps<"/[locale]/privacy">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <Legal t={t} page="privacy" />
    </SitePage>
  );
}
