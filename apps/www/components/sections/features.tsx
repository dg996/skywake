// A product's features as slides in the shared carousel, each with its small animation.
import { MiniArt } from "@/components/art/mini-art";
import type { HomeMessages } from "@/content/messages";
import { Carousel } from "@/components/ui/carousel";

export function Features({
  features,
}: {
  features: HomeMessages["productPages"]["filesystem"]["features"];
}) {
  return (
    <Carousel
      picture="open"
      slides={features.map((feature) => ({
        key: feature.name,
        title: feature.name,
        line: feature.line,
        picture: <MiniArt name={feature.art} />,
      }))}
    />
  );
}
