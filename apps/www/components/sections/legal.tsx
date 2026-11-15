// A legal page: its title, date and summary, then each section as a heading
// followed by paragraphs and lists.
import type { ReactNode } from "react";

import type { HomeMessages } from "@/content/messages";
import { site } from "@/content/site";
import { Band } from "@/components/ui/frame";
import { Head } from "@/components/ui/statement";

export function Legal({ t, page }: { t: HomeMessages; page: "privacy" | "terms" }) {
  const legal = t.legal;
  const { title, intro, sections } = legal[page];
  const contact = <a href={`mailto:${site.email}`}>{site.email}</a>;
  // Puts the contact link where a sentence says {contact}.
  const fill = (text: string): ReactNode => {
    const [before, after] = text.split("{contact}");
    return after === undefined ? (
      text
    ) : (
      <>
        {before}
        {contact}
        {after}
      </>
    );
  };

  return (
    <>
      <Head eyebrow={legal.updated} title={title} line={intro} />
      <Band className="px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="t-body max-w-[68ch] text-muted-foreground [&_a]:text-foreground [&_a]:underline">
          {sections.map((section, i) => (
            <section key={section.title} className={i > 0 ? "mt-12" : undefined}>
              <h2 className="text-[17px] font-medium text-foreground">{section.title}</h2>
              {section.body.map((part, j) =>
                typeof part === "string" ? (
                  <p key={j} className="mt-4">
                    {fill(part)}
                  </p>
                ) : (
                  <ul key={j} className="mt-4 grid list-disc gap-2 pl-5 marker:text-signal">
                    {part.map((item) => (
                      <li key={item}>{fill(item)}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>
      </Band>
    </>
  );
}
