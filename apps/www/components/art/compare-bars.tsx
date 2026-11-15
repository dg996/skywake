// One benchmark result as a row: the takeaway in words on the left, and the
// bars that back it up on the right, drawn to one linear scale.
import type { Comparison } from "@/content/numbers";
import { cn } from "@/lib/utils";

export function CompareBars({ title, verdict, rows }: Comparison) {
  const max = Math.max(...rows.map((row) => row.value));
  return (
    <figure className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center lg:gap-16">
      <figcaption>
        <p className="t-body text-muted-foreground">{title}</p>
        <p className="t-h2 t-regular mt-1 text-signal">{verdict}</p>
      </figcaption>
      <dl className="grid gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2"
          >
            <dt className={cn("t-small", row.lit ? "text-foreground" : "text-muted-foreground")}>
              {row.label}
            </dt>
            <dd
              className={cn(
                "t-mono tabular-nums",
                row.lit ? "font-medium text-signal" : "text-muted-foreground",
              )}
            >
              {row.figure}
            </dd>
            <div aria-hidden className="col-span-2 h-2.5 rounded-full bg-foreground/5">
              <div
                className={cn(
                  "h-full min-w-2.5 rounded-full",
                  row.lit ? "bg-signal" : "bg-muted-foreground/40",
                )}
                style={{ width: `${(row.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </dl>
    </figure>
  );
}
