import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { HomeMessages } from "@/content/messages";
import { localizePath, type Locale } from "@/lib/i18n";
import { Title } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";
import { UseCaseCarousel } from "@/components/sections/use-case-carousel";

export function UseCases({ t, locale }: { t: HomeMessages; locale: Locale }) {
  const u = t.useCases;
  const href = localizePath(locale, "/use-cases");
  return (
    <>
      <Head
        id="use-cases"
        eyebrow={u.label}
        title={<Title stack before={u.heading[0]} accent={u.heading[1]} />}
        center
        action={
          <Link href={href} className="btn btn-primary relative">
            {u.more} <ArrowRight className="size-4" />
          </Link>
        }
      />
      <UseCaseCarousel items={u.items} href={href} cta={u.cta} />
    </>
  );
}
