"use client";

// The guide's contents, kept in view. The section you are reading is marked.
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function GuideToc({ items }: { items: [id: string, label: string][] }) {
  const [active, setActive] = useState(items[0]?.[0]);

  useEffect(() => {
    // The last heading that has passed the top third of the screen is the one being read.
    const onScroll = () => {
      let current = items[0]?.[0];
      for (const [id] of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 3) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <ol className="mt-5 grid border-l border-border">
      {items.map(([id, label]) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className={cn(
              "t-small -ml-px block border-l py-1.5 pl-4 transition-colors",
              id === active
                ? "border-signal text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </a>
        </li>
      ))}
    </ol>
  );
}
