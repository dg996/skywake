// A strip of the site's diamond tiles, used to divide the page.
// A few tiles are lit in the accent.
import { Band } from "@/components/ui/frame";
import { Pattern, PATTERNS, type PatternProps } from "@/components/ui/pattern";

/** Takes any Pattern setting to change the look of one strip. */
export function TextureBand(props: PatternProps) {
  return (
    <Band className="h-28 sm:h-36">
      <div className="absolute inset-0 overflow-hidden text-foreground">
        <Pattern {...PATTERNS.band} {...props} />
      </div>
    </Band>
  );
}
