import { ImageResponse } from "next/og";

import { LogoMark, PAPER } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const image = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PAPER,
      }}
    >
      <LogoMark size={120} />
    </div>
  );
  return new ImageResponse(image, size);
}
