// The small label above a heading: a round badge with a dot in the accent colour,
// so every section is marked the same way.
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  n,
  icon: Icon,
  as: Tag = "p",
  className,
}: {
  children?: ReactNode;
  /** A step number, shown as 01, 02… */
  n?: number;
  icon?: LucideIcon;
  as?: "p" | "h2" | "h3" | "span";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "t-eyebrow inline-flex h-7 w-fit items-center gap-2 rounded-full border border-border px-3 text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-signal" />
      {n !== undefined && (
        <span className="text-foreground tabular-nums">{String(n).padStart(2, "0")}</span>
      )}
      {Icon && <Icon aria-hidden className="size-3.5" />}
      {children}
    </Tag>
  );
}
