// The use cases as slides in the shared carousel, each with a small moment from the product.
import { TONES, type Tone } from "@/components/art/iso-art";
import { SNIPPETS } from "@/components/art/use-case-snippets";
import type { HomeMessages } from "@/content/messages";
import { Carousel } from "@/components/ui/carousel";

// Same order as messages.useCases.items. `id` is the page under /use-cases.
const ITEMS: { id: string; tone: Tone }[] = [
  { id: "knowledge-base", tone: "blue" },
  { id: "context-layer", tone: "violet" },
  { id: "sandboxes", tone: "green" },
  { id: "coding-agents", tone: "amber" },
  { id: "rl", tone: "violet" },
];

export function UseCaseCarousel({
  items,
  href,
  cta,
}: {
  items: HomeMessages["useCases"]["items"];
  href: string;
  cta: string;
}) {
  return (
    <Carousel
      slides={items.map((item, i) => {
        const { id, tone } = ITEMS[i]!;
        const Snippet = SNIPPETS[i]!;
        return {
          key: id,
          eyebrow: (
            <>
              <span style={{ color: TONES[tone] }}>{String(i + 1).padStart(2, "0")}</span>
              {item.name}
            </>
          ),
          title: item.title,
          line: item.line,
          picture: <Snippet tone={tone} />,
          href: `${href}/${id}`,
          cta,
        };
      })}
    />
  );
}
