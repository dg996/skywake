"use client";

// A scroll carousel: the texts scroll on the left, and the picture on the right
// stays in place and changes to the one being read. On phones each picture
// sits under its own text instead.
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Band } from "@/components/ui/frame";
import { Eyebrow } from "@/components/ui/eyebrow";

export type Slide = {
  key: string;
  eyebrow?: ReactNode;
  title: string;
  line: string;
  picture: ReactNode;
  /** With a link, the whole text is one link ending in `cta`. */
  href?: string;
  cta?: string;
};

// "corner": in a corner of the app, cut by the frame. "open": loose on the page.
const PICTURE = {
  corner:
    "stage-screen h-60 overflow-hidden rounded-tl-xl border-t border-l border-foreground/15 bg-background p-5 text-[13px] text-foreground",
  open: "grid h-60 place-items-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]",
} as const;

export function Carousel({
  slides,
  picture = "corner",
}: {
  slides: Slide[];
  picture?: keyof typeof PICTURE;
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  // The text crossing the middle of the screen is the active one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current) if (el) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Band className="grid lg:grid-cols-2">
      <ol className="border-border lg:border-r">
        {slides.map((slide, i) => {
          const body = (
            <>
              {slide.eyebrow && <Eyebrow className="mb-5">{slide.eyebrow}</Eyebrow>}
              <h3 className="t-h2 t-regular max-w-[18ch] pr-6 text-foreground">{slide.title}</h3>
              <p className="t-lead mt-4 max-w-[40ch] pr-6 text-muted-foreground">{slide.line}</p>
              {slide.cta && (
                <span className="t-small mt-6 inline-flex items-center gap-1.5 text-foreground">
                  {slide.cta}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
              <div aria-hidden className={cn(PICTURE[picture], "mt-10 lg:hidden")}>
                {slide.picture}
              </div>
            </>
          );
          const className = cn(
            "group block w-full pt-12 pl-6 transition-opacity duration-500 sm:pl-10 lg:py-16 lg:pr-12 lg:pl-12",
            picture === "open" && "pr-6 pb-6 sm:pr-10",
            i === active ? "lg:opacity-100" : "lg:opacity-40",
          );
          return (
            <li
              key={slide.key}
              data-index={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="border-b border-border last:border-b-0 lg:flex lg:min-h-[28rem] lg:items-center"
            >
              {slide.href ? (
                <Link href={slide.href} className={className}>
                  {body}
                </Link>
              ) : (
                <div className={className}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>

      {/* The picture for the active slide, held in place while the texts scroll. */}
      <div aria-hidden className="hidden lg:block">
        <div
          className={cn(
            "sticky top-[calc(50vh-9rem)] py-12",
            picture === "corner" ? "pl-12" : "px-12",
          )}
        >
          <div className="relative h-60">
            {slides.map((slide, i) => (
              <div
                key={slide.key}
                className={cn(
                  PICTURE[picture],
                  "absolute inset-0 transition-opacity duration-500",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              >
                {slide.picture}
              </div>
            ))}
          </div>
          <div className={cn("mt-8 flex gap-1.5", picture === "open" && "justify-center")}>
            {slides.map((slide, i) => (
              <span
                key={slide.key}
                className={cn(
                  "h-px w-6 transition-colors duration-500",
                  i === active ? "bg-foreground" : "bg-foreground/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Band>
  );
}
