// The use case cards: the related guides under each guide, and the full list.
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { GuideArt } from "@/components/art/guide-art";
import type { HomeMessages } from "@/content/messages";
import { findUseCase, type UseCase } from "@/content/use-cases";
import { localizePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";
import { Eyebrow } from "@/components/ui/eyebrow";

const CELL = "bg-background px-6 py-10 sm:px-10 lg:px-12";

export function UseCaseRelated({
  useCase,
  locale,
  t,
}: {
  useCase: UseCase;
  locale: Locale;
  t: HomeMessages;
}) {
  const related = useCase.related.map(findUseCase).filter((item) => item !== undefined);
  const r = t.guides.related;
  return (
    <>
      <Head
        id="related"
        eyebrow={r.eyebrow}
        title={r.title}
        action={
          <Link href={localizePath(locale, "/use-cases")} className="btn btn-sm btn-secondary">
            {r.all} <ArrowRight className="size-3.5" />
          </Link>
        }
      />
      <Band>
        <UseCaseList items={related} locale={locale} t={t} columns="md:grid-cols-3" />
      </Band>
    </>
  );
}

/** Use cases as open link cells. Each cell is one link to its page. */
export function UseCaseList({
  items,
  locale,
  t,
  columns,
}: {
  items: UseCase[];
  locale: Locale;
  t: HomeMessages;
  columns: string;
}) {
  return (
    <ul className={cn("grid gap-px bg-border", columns)}>
      {items.map((item) => {
        const copy = t.guides.items[item.id]!;
        return (
          <li key={item.id} className="flex">
            <Link
              href={localizePath(locale, `/use-cases/${item.id}`)}
              className={cn(CELL, "group flex w-full flex-col transition-colors hover:bg-card")}
            >
              <GuideArt id={item.id} className="mb-12 h-44 w-auto self-center" />
              <Eyebrow as="span">{copy.name}</Eyebrow>
              <span className="mt-8 text-[1.5rem] leading-[1.25] font-medium tracking-[-0.02em] text-pretty text-foreground">
                {copy.title}
              </span>
              <span className="t-body mt-3 text-muted-foreground">{copy.lead}</span>
              <span className="t-small mt-auto flex items-center gap-1.5 pt-10 text-signal">
                {t.guides.read}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
