// The page's frame: one column with hairlines down both sides. Each band starts
// with a hairline across.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Frame({ children }: { children: ReactNode }) {
  return (
    // Pulled up behind the floating nav, so the side lines run into it from the top of the page.
    <div className="relative mx-auto -mt-[4.25rem] max-w-6xl border-x border-b border-border pt-[4.25rem]">
      {children}
    </div>
  );
}

export function Band({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 border-t border-border", className)}>
      {children}
    </section>
  );
}

/** A quiet label: mono text in a hairline pill, with one accent dot. */
export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="t-eyebrow inline-flex h-7 items-center gap-2 rounded-full border border-border px-3 text-muted-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-signal" />
      {children}
    </span>
  );
}

/** A title in two parts: the second part is quieter. */
export function Title({
  before,
  accent,
  after,
  stack,
}: {
  before: string;
  accent: string;
  after?: string;
  stack?: boolean;
}) {
  return (
    <>
      {before && `${before.trimEnd()} `}
      <span className={stack ? "block text-muted-foreground" : "text-muted-foreground"}>
        {accent}
      </span>
      {after}
    </>
  );
}
