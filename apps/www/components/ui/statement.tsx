// Two ways to open a section: a centred statement, or a head set to the left.
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Band, Pill } from "@/components/ui/frame";
import { Pattern, PATTERNS } from "@/components/ui/pattern";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Statement({
  id,
  pill,
  title,
  line,
  action,
  children,
}: {
  id?: string;
  pill: ReactNode;
  title: ReactNode;
  line?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Band id={id} className="flex flex-col items-center px-6 py-20 text-center lg:py-28">
      <Pill>{pill}</Pill>
      <h2 className="t-h2 t-regular mt-6 max-w-[26ch] text-foreground">{title}</h2>
      {line && <p className="t-lead mt-5 max-w-[48ch] text-muted-foreground">{line}</p>}
      {action && <div className="mt-8">{action}</div>}
      {children}
    </Band>
  );
}

export function Head({
  id,
  eyebrow,
  title,
  line,
  action,
  pattern,
  center,
}: {
  id?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  line?: ReactNode;
  action?: ReactNode;
  /** A taller banner with accent tiles drifting in from the right. */
  pattern?: boolean;
  /** Centre the words, to match the hero. */
  center?: boolean;
}) {
  return (
    <Band
      id={id}
      className={cn(
        "px-6 sm:px-10 lg:px-12",
        pattern || center ? "py-20 lg:py-28" : "pt-14 pb-12 lg:pt-16",
      )}
    >
      {pattern && (
        // The banner pattern, over a soft glow of the accent colour.
        <div className="absolute inset-0 overflow-hidden text-signal">
          <div className="absolute inset-0 bg-[radial-gradient(55%_90%_at_100%_50%,color-mix(in_oklab,var(--signal)_16%,transparent),transparent_70%)]" />
          <Pattern {...PATTERNS.banner} />
        </div>
      )}
      <div
        className={cn(
          "relative max-w-[44rem]",
          center && "mx-auto flex flex-col items-center text-center",
        )}
      >
        {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
        <h2 className="t-h2 t-regular max-w-[26ch] text-foreground">{title}</h2>
        {line && <p className="t-lead mt-5 max-w-[48ch] text-muted-foreground">{line}</p>}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </Band>
  );
}
