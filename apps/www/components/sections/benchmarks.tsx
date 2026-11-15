// The product's benchmark results, one row each, laid into the frame.
import type { HomeMessages } from "@/content/messages";
import { CompareBars } from "@/components/art/compare-bars";
import { filesBars, searchBars } from "@/content/numbers";
import { cn } from "@/lib/utils";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";

export function Benchmarks({ t, show }: { t: HomeMessages; show: "files" | "search" }) {
  return (
    <>
      <Head id="benchmarks" eyebrow={t.benchmarks.label} title={t.benchmarks.title} center />
      <BenchmarkGroups t={t} show={show} />
    </>
  );
}

/** One product's results, each a takeaway backed by bars, then where they were measured. */
export function BenchmarkGroups({ t, show }: { t: HomeMessages; show: "files" | "search" }) {
  const b = t.benchmarkPage;
  const [charts, bars, note] =
    show === "files" ? [b.files, filesBars, b.filesNote] : [b.search, searchBars, b.searchNote];
  return (
    <>
      <Band>
        {charts.map((chart, i) => (
          <div
            key={chart.title}
            className={cn("px-6 py-10 sm:px-10 lg:px-12", i > 0 && "border-t border-border")}
          >
            <CompareBars
              title={chart.title}
              verdict={chart.verdict}
              rows={bars[i]!.map((bar, j) => ({ ...bar, label: chart.labels[j]! }))}
            />
          </div>
        ))}
      </Band>
      <Band className="t-mono px-6 py-4 text-muted-foreground sm:px-10 lg:px-12">{note}.</Band>
    </>
  );
}
