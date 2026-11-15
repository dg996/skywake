// Console screenshots, taken in both themes. The page shows the one that matches its own theme.
import Image, { type StaticImageData } from "next/image";

import cardFilesDark from "@/public/product/card-files.png";
import cardFilesLight from "@/public/product/card-files-light.png";
import cardSearchDark from "@/public/product/card-search.png";
import cardSearchLight from "@/public/product/card-search-light.png";
import disksDark from "@/public/product/disks-dark.png";
import disksLight from "@/public/product/disks-light.png";

export type Shot = { light: StaticImageData; dark: StaticImageData };

export const SCREENS = {
  disks: { light: disksLight, dark: disksDark },
  files: { light: cardFilesLight, dark: cardFilesDark },
  search: { light: cardSearchLight, dark: cardSearchDark },
} satisfies Record<string, Shot>;

export function Screen({
  shot,
  alt,
  sizes,
  priority,
  className = "",
}: {
  shot: Shot;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <>
      <Image
        src={shot.light}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={`dark:hidden ${className}`}
      />
      <Image
        src={shot.dark}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
