// The library of use case guides: the page's title, then every guide in one grid.
import type { HomeMessages } from "@/content/messages";
import { useCases } from "@/content/use-cases";
import type { Locale } from "@/lib/i18n";
import { Band, Title } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";
import { UseCaseList } from "@/components/sections/use-case-page";

export function UseCaseIndex({ locale, t }: { locale: Locale; t: HomeMessages }) {
  const g = t.guides;
  return (
    <>
      <Head eyebrow={g.eyebrow} title={<Title stack before={g.title} accent={g.accent} />} center />
      {/* Two columns, so ten guides fill five rows. */}
      <Band>
        <UseCaseList items={useCases} locale={locale} t={t} columns="sm:grid-cols-2" />
      </Band>
    </>
  );
}
