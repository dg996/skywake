// The top of a product page, centred like the home page's hero.
import { ArrowUpRight } from "lucide-react";
import { siGithub } from "simple-icons";

import { BrandIcon } from "@/components/ui/brand-icon";
import type { HomeMessages } from "@/content/messages";
import { site } from "@/content/site";
import { Title } from "@/components/ui/frame";
import { Eyebrow } from "@/components/ui/eyebrow";

export function ProductHero({
  page: { label, title, accent, line },
  docs,
  t,
}: {
  page: HomeMessages["productPages"]["filesystem"];
  docs: string;
  t: HomeMessages["productPages"];
}) {
  return (
    <section className="flex flex-col items-center px-6 pt-24 pb-20 text-center sm:px-10 lg:px-12 lg:pt-32 lg:pb-28">
      <Eyebrow>{label}</Eyebrow>
      <h1 className="t-display t-regular mt-6 max-w-[16ch] text-foreground">
        <Title before={title} accent={accent} />
      </h1>
      <p className="t-lead mt-8 max-w-[46ch] text-muted-foreground">{line}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <a href={`${site.docsUrl}${docs}`} className="btn btn-primary">
          {t.getStarted} <ArrowUpRight className="size-4" />
        </a>
        {site.repoUrl && (
          <a href={site.repoUrl} className="btn btn-secondary">
            <BrandIcon icon={siGithub} className="size-4" />
            {t.star}
          </a>
        )}
      </div>
    </section>
  );
}
