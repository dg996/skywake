import { Layers } from "@/components/art/layers";
import type { HomeMessages } from "@/content/messages";
import { files } from "@/content/numbers";
import { cn } from "@/lib/utils";
import { Band, Title } from "@/components/ui/frame";
import { Statement } from "@/components/ui/statement";

// Measured disk speed: a small write, a small read, and a full build.
const FIGURES = [0, 1, 3].map((i) => files.groups[1]!.stats[i]!.figure);

export function Architecture({ t }: { t: HomeMessages }) {
  const a = t.architecture;
  return (
    <>
      <Statement
        id="architecture"
        pill={a.label}
        title={<Title before={a.titleBefore} accent={a.titleAccent} />}
        line={a.line}
      />
      <Band className="px-3 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Layers t={t.layers} />
      </Band>
      <Band>
        <dl className="grid sm:grid-cols-3">
          {a.stats.map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex flex-col-reverse border-border px-6 py-8 sm:px-10 lg:px-12",
                i > 0 && "border-t sm:border-t-0 sm:border-l",
              )}
            >
              <dt className="t-body mt-2 text-muted-foreground">{label}</dt>
              <dd className="t-num text-foreground">{FIGURES[i]}</dd>
            </div>
          ))}
        </dl>
      </Band>
    </>
  );
}
