// The two products side by side, each with its points and a corner of the console.
import { ArrowRight, Check, HardDrive, Search, type LucideIcon } from "lucide-react";

import { SCREENS, Screen, type Shot } from "@/components/ui/screen";
import { SiteLink } from "@/components/ui/site-link";
import type { HomeMessages } from "@/content/messages";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Band } from "@/components/ui/frame";
import { Eyebrow } from "@/components/ui/eyebrow";

const PRODUCTS: Record<"files" | "search", { icon: LucideIcon; shot: Shot }> = {
  files: { icon: HardDrive, shot: SCREENS.files },
  search: { icon: Search, shot: SCREENS.search },
};

export function Products({ t, locale }: { t: HomeMessages; locale: Locale }) {
  const p = t.products;
  return (
    <>
      {/* The two products side by side, split by a hairline.
          A subgrid keeps the text and screenshot level across both. */}
      <Band id="products" className="grid lg:grid-cols-2">
        {p.items.map((product, n) => {
          const { icon: Icon, shot } = PRODUCTS[product.icon];
          return (
            <div
              key={product.name}
              className={cn(
                "flex flex-col border-border lg:row-span-2 lg:grid lg:grid-rows-subgrid",
                n > 0 && "border-t lg:border-t-0 lg:border-l",
              )}
            >
              <div className="px-6 pt-14 sm:px-10 lg:px-12 lg:pt-16">
                <Eyebrow n={n + 1} icon={Icon} />
                <h3 className="t-h2 t-regular mt-6 text-foreground">{product.name}</h3>
                <p className="t-lead mt-5 max-w-[40ch] text-muted-foreground">
                  {product.before}
                  <span className="text-foreground">{product.highlight}</span>
                  {product.after}
                </p>
                <ul className="mt-8 grid gap-2.5">
                  {product.points.map((point) => (
                    <li key={point} className="t-body flex items-start gap-2.5 text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                      {point}
                    </li>
                  ))}
                </ul>
                <SiteLink
                  href={product.href}
                  locale={locale}
                  className="btn btn-sm btn-secondary mt-8"
                >
                  {t.useCases.cta} <ArrowRight className="size-3.5" />
                </SiteLink>
              </div>
              {/* A corner of the real console, running into the column's right edge. */}
              <div className="stage-screen pt-12 pl-6 sm:pl-10 lg:pl-12">
                <div className="screen-frame screen-lift h-72 overflow-hidden rounded-tl-xl border-t border-l border-foreground/15 bg-background">
                  <Screen shot={shot} alt="" sizes="(min-width: 64rem) 36rem, 100vw" />
                </div>
              </div>
            </div>
          );
        })}
      </Band>
    </>
  );
}
