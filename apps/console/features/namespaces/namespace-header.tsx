"use client";

import { useQuery } from "@rocicorp/zero/react";
import { GitFork } from "lucide-react";
import type { ReactNode } from "react";
import { useRoute } from "@/components/shell/router";
import { envOf } from "@/lib/names";
import { nsPath } from "@/lib/paths";
import { Button, Hash, Orb, ResourcePage, plural } from "@/components/kit";
import { city } from "@/features/environments/regions";
import { queries } from "@/zero/queries";

/** A disk's pages: its name, its main branch, four views, then the view. */
export function NamespacePage({
  ns,
  main,
  head,
  commits,
  onFork,
  tools,
  children,
}: {
  ns: string;
  main?: string;
  head?: string | null;
  commits: number;
  onFork?: () => void;
  tools?: ReactNode;
  children: ReactNode;
}) {
  const { view } = useRoute();
  const [namespaces] = useQuery(queries.namespaces());
  const region = namespaces.find((n) => n.name === ns)?.region;
  const facts: ReactNode[] = [envOf(ns)];
  if (region) facts.push(<span title={region}>{city(region)}</span>);
  if (main) {
    facts.push(
      <span className="flex items-baseline gap-1.5">
        <span className="text-xs text-foreground">{main}</span>
        <Hash value={head} />
      </span>,
      <span className="tabular-nums">{plural(commits, "commit")}</span>,
    );
  } else facts.push(<span className="text-faint">no branches yet</span>);

  return (
    <ResourcePage
      name={ns}
      mark={<Orb name={ns} className="size-10" />}
      facts={facts}
      actions={
        main &&
        onFork && (
          <Button variant="primary" size="default" onClick={onFork} leadingIcon={GitFork}>
            Fork {main}
          </Button>
        )
      }
      tabs={[
        { href: nsPath(ns), label: "Files", active: view === "files" },
        { href: nsPath(ns, "branches"), label: "Branches", active: view === "branches" },
        { href: nsPath(ns, "history"), label: "History", active: view === "history" },
        { href: nsPath(ns, "search"), label: "Search", active: view === "search" },
      ]}
      tools={tools}
    >
      {children}
    </ResourcePage>
  );
}
