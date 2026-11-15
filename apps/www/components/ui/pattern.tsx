// One pattern for the whole page: a grid of small marks whose amount follows a
// smooth field, turned into marks by an ordered dither. Every look on the page
// is this component with different settings, so new ones need no new code.
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type PatternShape = "square" | "dot" | "diamond" | "plus" | "iso";
export type PatternField = "waves" | "noise" | "radial" | "linear" | "flat";
export type PatternFade = "none" | "edges" | "x" | "y" | "left" | "right" | "center" | "ring";

export type PatternProps = {
  /** The mark drawn in each cell. "iso" is a flat tile on staggered rows. */
  shape?: PatternShape;
  /** Where the marks gather. */
  field?: PatternField;
  /** 0 to 2. Scales the field: lower is sparser, higher is fuller. */
  density?: number;
  /** Grid step in viewBox units. */
  cell?: number;
  /** Mark size as a share of the cell, 0 to 1. */
  size?: number;
  /** Mark colour. Any CSS colour; the default follows the text colour. */
  color?: string;
  /** Opacity for each strength, weakest first. */
  levels?: number[];
  /** Colour of the few "lit" marks. */
  accent?: string;
  /** Share of dense cells that are lit, 0 to 1. */
  lit?: number;
  /** Lit marks pulse, unless the reader prefers less motion. */
  animate?: boolean;
  /** For "radial": the centre, 0 to 1 on each side. */
  origin?: [number, number];
  /** For "linear": the angle in degrees, 0 runs left to right. */
  angle?: number;
  /** 0 to 1. Breaks any field into soft drifts. */
  grain?: number;
  /** Changes the "waves" and "noise" fields and the grain. */
  seed?: number;
  /** Fades the pattern out towards these edges. */
  fade?: PatternFade;
  /** The drawing size. The pattern covers its box and is cut to fit. */
  width?: number;
  height?: number;
  className?: string;
};

// A 4×4 ordered-dither matrix, scaled to 0..1.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const FADES: Record<PatternFade, string | undefined> = {
  none: undefined,
  edges: "radial-gradient(closest-side, #000 55%, transparent)",
  x: "linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)",
  y: "linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent)",
  left: "linear-gradient(to left, transparent, #000 60%)",
  right: "radial-gradient(75% 130% at 100% 50%, #000 20%, transparent 85%)",
  center: "radial-gradient(60% 70% at 50% 50%, #000 30%, transparent 90%)",
  ring: "radial-gradient(60% 70% at 50% 50%, transparent 35%, #000 95%)",
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

// A smooth, repeatable 0..1 value for any point and seed.
function noise(x: number, y: number, seed: number) {
  const s = seed * 1.7;
  return (
    0.5 +
    0.25 * Math.sin(x * 5.1 + s + Math.sin(y * 4.3 - s)) +
    0.15 * Math.sin(y * 7.7 + x * 2.3 + s * 2) +
    0.1 * Math.cos(x * 13.1 - y * 9.4 + s)
  );
}

function fieldAt(field: PatternField, x: number, y: number, p: Required<PatternProps>) {
  switch (field) {
    case "flat":
      return 1;
    case "noise":
      return noise(x * 3, y * 3, p.seed);
    case "radial": {
      const dx = (x - p.origin[0]) * (p.width / p.height);
      const dy = y - p.origin[1];
      return 1 - Math.hypot(dx, dy) / Math.max(1, p.width / p.height);
    }
    case "linear": {
      const a = (p.angle * Math.PI) / 180;
      return (x - 0.5) * Math.cos(a) + (y - 0.5) * Math.sin(a) + 0.5;
    }
    case "waves": {
      const wave =
        0.5 +
        0.28 * Math.sin(x * 9.4 + p.seed + Math.sin(y * 3) * 1.2) +
        0.2 * Math.cos(x * 23 - y * 4 + p.seed);
      return wave * (1 - Math.abs(y - 0.5) * 1.6);
    }
  }
}

function mark(shape: PatternShape, cx: number, cy: number, s: number) {
  const h = s / 2;
  switch (shape) {
    case "square":
      return `M${cx - h} ${cy - h}h${s}v${s}h${-s}Z`;
    case "dot":
      return `M${cx - h} ${cy}a${h} ${h} 0 1 0 ${s} 0a${h} ${h} 0 1 0 ${-s} 0Z`;
    case "diamond":
      return `M${cx} ${cy - h}l${h} ${h}l${-h} ${h}l${-h} ${-h}Z`;
    case "iso":
      return `M${cx} ${cy - h / 2}l${h} ${h / 2}l${-h} ${h / 2}l${-h} ${-h / 2}Z`;
    case "plus": {
      const t = Math.max(1, s / 5);
      return `M${cx - h} ${cy - t / 2}h${s}v${t}h${-s}ZM${cx - t / 2} ${cy - h}h${t}v${s}h${-t}Z`;
    }
  }
}

const DEFAULTS: Required<PatternProps> = {
  shape: "square",
  field: "waves",
  density: 1,
  cell: 8,
  size: 0.62,
  color: "currentColor",
  levels: [0.14, 0.26, 0.42],
  accent: "var(--signal)",
  lit: 0.03,
  animate: true,
  origin: [0.5, 0.5],
  angle: 0,
  seed: 0,
  grain: 0,
  fade: "none",
  width: 1152,
  height: 144,
  className: "",
};

export function Pattern(props: PatternProps) {
  const p = { ...DEFAULTS, ...props };
  const cols = Math.ceil(p.width / p.cell);
  // Iso tiles sit on half-height rows, each row shifted by half a cell.
  const rowStep = p.shape === "iso" ? p.cell / 2 : p.cell;
  const rows = Math.ceil(p.height / rowStep);
  const side = p.cell * p.size;

  const paths = p.levels.map(() => "");
  const lit: string[] = [];
  for (let j = 0; j <= rows; j++) {
    const shift = p.shape === "iso" && j % 2 ? p.cell / 2 : 0;
    for (let i = 0; i <= cols; i++) {
      const x = i * p.cell + shift + p.cell / 2;
      const y = j * rowStep + rowStep / 2;
      const f = fieldAt(p.field, x / p.width, y / p.height, p);
      const drift =
        1 - p.grain + p.grain * 1.4 * noise((x / p.width) * 6, (y / p.height) * 6, p.seed);
      const v = clamp(f * drift * p.density);
      if (v <= BAYER[j % 4]![i % 4]!) continue;
      const d = mark(p.shape, x, y, side);
      // A fixed scatter of lit marks, only where the field is dense.
      if (v > 0.7 && ((i * 7 + j * 13) % 97) / 97 < p.lit) {
        lit.push(d);
        continue;
      }
      const level = Math.min(p.levels.length - 1, Math.floor(v * p.levels.length));
      paths[level] += d;
    }
  }

  const mask = FADES[p.fade];
  const style: CSSProperties = mask ? { maskImage: mask, WebkitMaskImage: mask } : {};

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${p.width} ${p.height}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", p.className)}
      style={style}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={p.color} fillOpacity={p.levels[i]} />
      ))}
      {lit.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={p.accent}
          className={p.animate ? "motion-safe:animate-pulse" : undefined}
          style={{ animationDelay: `${(i * 0.37) % 2}s`, animationDuration: `${2 + (i % 3)}s` }}
        />
      ))}
    </svg>
  );
}

/** The looks used on the page. Spread one and override what you need. */
export const PATTERNS = {
  /** The strip between sections: the same diamond tiles, in grey, a few lit. */
  band: {
    shape: "iso",
    cell: 16,
    size: 0.9,
    levels: [0.08, 0.16, 0.26],
    lit: 0.02,
  },
  /** Behind section heads: accent tiles drifting in from the right. */
  banner: {
    shape: "iso",
    field: "radial",
    origin: [1, 0.5],
    grain: 0.6,
    cell: 16,
    size: 0.9,
    color: "var(--signal)",
    levels: [0.14, 0.26, 0.4, 0.55],
    lit: 0,
    width: 1152,
    height: 420,
    fade: "right",
  },
  /** Behind the waitlist: quiet tiles framing an empty middle. */
  panel: {
    shape: "iso",
    field: "noise",
    seed: 3,
    cell: 16,
    size: 0.9,
    levels: [0.06, 0.12, 0.2],
    lit: 0.02,
    width: 1152,
    height: 640,
    fade: "ring",
  },
} satisfies Record<string, PatternProps>;
