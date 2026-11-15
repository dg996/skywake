import { SitePage } from "@/components/layout/site-page";
import { BenchmarkGroups } from "@/components/sections/benchmarks";
import { GetStarted } from "@/components/sections/get-started";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";
import { TextureBand } from "@/components/ui/texture";
import { getMessages } from "@/content/messages";
import { pageMetadata } from "@/lib/metadata";
import { pageLocale } from "@/lib/page";

// Every measured number in one place: the filesystem's, then search's.
export const instant = false;

export const generateMetadata = pageMetadata("/benchmarks");

export default async function Benchmarks({ params }: PageProps<"/[locale]/benchmarks">) {
  const locale = await pageLocale(params);
  const t = getMessages(locale);
  const b = t.benchmarkPage;
  return (
    <SitePage locale={locale} messages={t}>
      <Head eyebrow={t.benchmarks.label} title={t.benchmarks.title} line={b.line} center />
      <TextureBand />
      <Head id="files" eyebrow={t.nav.filesystem} title={b.filesTitle} center />
      <BenchmarkGroups t={t} show="files" />
      <TextureBand />
      <Head id="search" eyebrow={t.nav.search} title={b.searchTitle} center />
      <BenchmarkGroups t={t} show="search" />
      {/* Blank space before the waitlist, which has its own pattern. */}
      <Band className="h-28 sm:h-36" />
      <GetStarted t={t} />
    </SitePage>
  );
}
