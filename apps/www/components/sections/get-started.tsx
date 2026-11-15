import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";

import { WaitlistForm } from "@/components/sections/waitlist-form";
import type { HomeMessages } from "@/content/messages";
import { site } from "@/content/site";
import { Band, Pill } from "@/components/ui/frame";
import { Pattern, PATTERNS } from "@/components/ui/pattern";

// The shared waitlist form draws its field and button in the background colour,
// for a dark panel. Swapping the page's two colours makes it stand out in both
// themes. The swap goes through --ink and --paper on a parent, because a custom
// property cannot refer to itself on the same element.
const SWAP = { "--ink": "var(--foreground)", "--paper": "var(--background)" } as CSSProperties;
const INVERT = { "--background": "var(--ink)", "--foreground": "var(--paper)" } as CSSProperties;

const QUIET_LINK =
  "t-small inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground";

export function GetStarted({ t }: { t: HomeMessages }) {
  const w = t.waitlist;
  const waitlist = !site.cloudOpen;
  return (
    <Band
      id={waitlist ? "waitlist" : "get-started"}
      className="isolate flex flex-col items-center px-6 py-24 text-center lg:py-32"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden text-foreground">
        <Pattern {...PATTERNS.panel} />
      </div>
      {waitlist ? (
        <>
          <Pill>{w.eyebrow}</Pill>
          <h2 className="t-h2 t-regular mt-7 max-w-[24ch] text-foreground">{w.title}</h2>
          <p className="t-lead mt-5 max-w-[46ch] text-muted-foreground">{w.line}</p>
          <div style={SWAP} className="mt-10 w-full">
            <div style={INVERT} className="flex w-full justify-center text-left">
              <WaitlistForm t={t.waitlist.form} />
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href={site.docsUrl} className={QUIET_LINK}>
              {w.selfHost} <ArrowUpRight className="size-3.5" />
            </a>
            {site.repoUrl && (
              <a href={site.repoUrl} className={QUIET_LINK}>
                {w.star} <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="t-h2 t-regular max-w-[24ch] text-foreground">{w.openTitle}</h2>
          <p className="t-lead mt-5 max-w-[46ch] text-muted-foreground">{w.openLine}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={site.consoleUrl} className="btn btn-primary">
              {w.openCta} <ArrowUpRight className="size-3.5" />
            </a>
            {site.repoUrl && (
              <a href={site.repoUrl} className="btn btn-secondary">
                {w.star}
              </a>
            )}
          </div>
        </>
      )}
    </Band>
  );
}
