import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SCREENS, Screen } from "@/components/ui/screen";
import type { HomeMessages } from "@/content/messages";
import { site } from "@/content/site";
import { Title } from "@/components/ui/frame";

const NEXT =
  "t-body flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground";

export function Hero({ t }: { t: HomeMessages }) {
  return (
    <>
      <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center sm:px-10 lg:px-12 lg:pt-28 lg:pb-20">
        {!site.cloudOpen && (
          <a
            href="#waitlist"
            className="t-small mb-8 inline-flex items-center gap-2 rounded-full bg-(--soft) py-1.5 pr-3 pl-2.5 ring-1 ring-(--hairline)"
          >
            <span aria-hidden>🚀</span>
            <span className="shimmer-text">{t.hero.badge}</span>
            <ArrowRight className="size-3.5 text-muted-foreground" />
          </a>
        )}
        <h1 className="t-display t-regular max-w-[20ch] text-foreground">
          <Title before={t.hero.titleBefore} accent={t.hero.titleAccent} />
        </h1>
        {site.cloudOpen && (
          <a href={site.consoleUrl} className={`${NEXT} mt-8`}>
            {t.hero.getStartedCta} <ArrowUpRight className="size-4" />
          </a>
        )}
      </section>

      {/* The console's Disks page, lit from above. */}
      <div className="relative px-3 pb-3 sm:px-6 sm:pb-6 lg:px-10 lg:pb-10">
        <div className="stage">
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
            <Screen
              shot={SCREENS.disks}
              alt={t.hero.screenshotAlt}
              priority
              sizes="(min-width: 72rem) 72rem, 100vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </>
  );
}
