// Pricing while the cloud is in private beta: self-hosting is free today,
// and the cloud's prices come at launch. Two open cells split by a hairline.
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import type { HomeMessages } from "@/content/messages";
import { site } from "@/content/site";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";

// Words come from messages.plans.options, in this order.
const LINKS = [
  { href: site.docsUrl, featured: false },
  { href: "#waitlist", featured: true },
];

export function Plans({ t }: { t: HomeMessages }) {
  const p = t.plans;
  const options = p.options.map((option, i) => ({ ...option, ...LINKS[i]! }));
  return (
    <>
      <Head id="pricing" eyebrow={p.eyebrow} title={p.title} line={p.line} center />
      <Band>
        <ol className="grid gap-px bg-border md:grid-cols-2">
          {options.map((option) => (
            <li
              key={option.name}
              className="flex flex-col bg-background px-6 py-10 sm:px-10 lg:px-12"
            >
              <p className="t-body flex items-center gap-2 font-medium text-foreground">
                {option.name}
                {option.featured && (
                  <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                )}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="t-num text-foreground">{option.price}</span>
                <span className="t-small text-muted-foreground">{option.per}</span>
              </p>
              <p className="t-body mt-4 text-muted-foreground">{option.line}</p>
              <ul className="mt-8 flex flex-col gap-3">
                {option.includes.map((item) => (
                  <li key={item} className="t-body flex items-start gap-2.5 text-foreground">
                    <Check aria-hidden className="mt-1 size-4 shrink-0 text-signal" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-12">
                <a
                  href={option.href}
                  className={`btn ${option.featured ? "btn-primary" : "btn-secondary"}`}
                >
                  {option.action}
                  {option.featured ? (
                    <ArrowRight className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </Band>
    </>
  );
}
