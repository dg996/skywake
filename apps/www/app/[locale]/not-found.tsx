import { locale as rootLocale } from "next/root-params";
import Link from "next/link";

import { SitePage } from "@/components/layout/site-page";
import { Band, Title } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";
import { getMessages } from "@/content/messages";
import { defaultLocale, isLocale, localizePath } from "@/lib/i18n";

export default async function NotFound() {
  const raw = await rootLocale();
  const locale = isLocale(raw) ? raw : defaultLocale;
  const t = getMessages(locale);
  return (
    <SitePage locale={locale} messages={t}>
      <Head
        eyebrow={t.notFound.label}
        title={<Title before={t.notFound.title} accent={t.notFound.line} />}
        action={
          <Link href={localizePath(locale)} className="btn btn-primary">
            {t.notFound.back}
          </Link>
        }
      />
      <Band className="h-28 sm:h-36" />
    </SitePage>
  );
}
