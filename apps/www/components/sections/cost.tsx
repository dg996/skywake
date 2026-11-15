// The cost section: the savings as bare numbers, then the worked example.
import { StorageBars } from "@/components/art/storage-bars";
import type { HomeMessages } from "@/content/messages";
import { costExample } from "@/content/pricing";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";

const { agents, workspaceGb, changed, copyMbPerSecond, forkSeconds, pricePerGbMonth } = costExample;

const copiesGb = agents * workspaceGb;
const forksGb = workspaceGb + agents * workspaceGb * changed;

// Fills {agents}, {saved} and the other example numbers into a message.
const numbers: Record<string, string> = {
  agents: String(agents),
  workspaceGb: String(workspaceGb),
  changed: String(changed * 100),
  saved: String(Math.round((1 - forksGb / copiesGb) * 100)),
  addedMb: String(Math.round((workspaceGb * changed * 1024) / 10) * 10),
};
const fill = (s: string) => s.replace(/\{(\w+)\}/g, (m, key: string) => numbers[key] ?? m);

const gb = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)} TB` : `${Math.round(n)} GB`);
const usd = (n: number) => (n < 10 ? `$${n.toFixed(2)}` : `$${Math.round(n)}`);

export function Cost({ t }: { t: HomeMessages }) {
  const c = t.cost.chart;
  const perMonth = (gb: number) => c.perMonth.replace("{value}", usd(gb * pricePerGbMonth));
  // The headline: each saving as a bare number, rounded down so it never overstates.
  const startTimes = Math.floor((workspaceGb * 1024) / copyMbPerSecond / forkSeconds / 1000) * 1000;
  const words = t.cost.headline;
  const headline = [
    { figure: `${numbers.saved}%`, words: words.storage },
    { figure: `${Math.floor(copiesGb / forksGb)}×`, words: words.cost },
    { figure: `${startTimes.toLocaleString("en")}×`, words: words.starts },
  ];

  return (
    <>
      <Head
        id="cost"
        eyebrow={t.cost.label}
        center
        title={headline.map((h, i) => (
          <span key={h.words}>
            {i === 0 ? "" : i === headline.length - 1 ? ` ${words.and} ` : ", "}
            <span className="text-signal tabular-nums">{h.figure}</span> {h.words}
            {i === headline.length - 1 && "."}
          </span>
        ))}
      />

      <Band className="p-4 sm:p-6 lg:p-8">
        <div>
          <p className="t-body px-5 font-medium text-foreground">{fill(t.cost.chartTitle)}</p>
          <div className="mt-2">
            <StorageBars
              count={agents}
              copies={{
                label: c.without,
                detail: fill(c.withoutDetail),
                total: gb(copiesGb),
                price: perMonth(copiesGb),
              }}
              ours={{
                label: c.with,
                detail: fill(c.withDetail),
                total: gb(forksGb),
                price: perMonth(forksGb),
              }}
              sharedShare={workspaceGb / copiesGb}
              changesShare={(forksGb - workspaceGb) / copiesGb}
              gap={c.gap.replace("{x}", String(Math.round(copiesGb / forksGb)))}
            />
          </div>
        </div>
      </Band>
    </>
  );
}
