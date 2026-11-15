// A feature in two columns: the story on the left stays in place while the
// steps on the right scroll past. On phones the columns stack.
import type { ReactNode } from "react";

import { Band } from "@/components/ui/frame";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Feature({
  id,
  eyebrow,
  title,
  line,
  action,
  children,
}: {
  id?: string;
  eyebrow: ReactNode;
  title: ReactNode;
  line?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Band id={id} className="grid lg:grid-cols-2">
      <div className="border-border lg:border-r">
        <div className="px-6 pt-14 pb-12 sm:px-10 lg:sticky lg:top-24 lg:px-12 lg:py-16">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="t-h2 t-regular mt-6 max-w-[16ch] text-foreground">{title}</h2>
          {line && <p className="t-lead mt-5 max-w-[40ch] text-muted-foreground">{line}</p>}
          {action && <div className="mt-8">{action}</div>}
        </div>
      </div>
      <div className="border-t border-border lg:border-t-0">{children}</div>
    </Band>
  );
}
