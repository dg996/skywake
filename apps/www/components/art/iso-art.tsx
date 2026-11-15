// Isometric line drawings for the home page. Each is made of boxes drawn back
// to front, so nearer boxes hide the ones behind them. Each scene has one tone:
// its accent colour for marks, lit boxes and lit lines.

/** A few quiet accents. One per scene, never a rainbow. */
export const TONES = {
  blue: "var(--signal)",
  green: "#5cc495",
  amber: "#e3a857",
  violet: "#c08cff",
} as const;
export type Tone = keyof typeof TONES;

type Box = {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** A small square in the tone on the top face. */
  mark?: boolean;
  /** Draw the whole box in the tone. */
  lit?: boolean;
};

// Faces are solid greys, lit from above, so boxes read as objects on any dark surface.
const TOP = "fill-[color-mix(in_oklab,var(--foreground)_9%,var(--background))]";
const SIDE = "fill-[color-mix(in_oklab,var(--foreground)_4%,var(--background))]";
const SHADE = "fill-[color-mix(in_oklab,var(--foreground)_6%,var(--background))]";
const LIT_TOP = "fill-[color-mix(in_oklab,var(--tone)_30%,var(--background))]";
const LIT_SIDE = "fill-[color-mix(in_oklab,var(--tone)_12%,var(--background))]";
const LIT_SHADE = "fill-[color-mix(in_oklab,var(--tone)_18%,var(--background))]";

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

// A point in space, seen from above at the usual isometric angle.
const flat = (x: number, y: number, z: number) => [(x - y) * COS, (x + y) * SIN - z] as const;
const at = (x: number, y: number, z: number) => flat(x, y, z).join(",");

// The smallest frame around every box, with a little room, so each scene fills its space.
function frame(boxes: Box[], extra: [number, number, number][] = []) {
  const pts = boxes.flatMap(({ x, y, z, w, d, h }) =>
    [x, x + w].flatMap((px) =>
      [y, y + d].flatMap((py) => [z, z + h].map((pz) => flat(px, py, pz))),
    ),
  );
  pts.push(...extra.map((p) => flat(...p)));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const pad = 8;
  const [x0, y0] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  return `${x0} ${y0} ${Math.max(...xs) + pad - x0} ${Math.max(...ys) + pad - y0}`;
}

function IsoBox({ x, y, z, w, d, h, mark, lit }: Box) {
  const top = [at(x, y, z + h), at(x + w, y, z + h), at(x + w, y + d, z + h), at(x, y + d, z + h)];
  const left = [at(x, y + d, z + h), at(x + w, y + d, z + h), at(x + w, y + d, z), at(x, y + d, z)];
  const right = [
    at(x + w, y, z + h),
    at(x + w, y + d, z + h),
    at(x + w, y + d, z),
    at(x + w, y, z),
  ];
  return (
    <g className={lit ? "stroke-(--tone)" : undefined}>
      <polygon points={left.join(" ")} className={lit ? LIT_SHADE : SHADE} />
      <polygon points={right.join(" ")} className={lit ? LIT_SIDE : SIDE} />
      <polygon points={top.join(" ")} className={lit ? LIT_TOP : TOP} />
      <polyline points={[...left, left[0]].join(" ")} />
      <polyline points={[...right, right[0]].join(" ")} />
      <polyline points={[...top, top[0]].join(" ")} />
      {mark && (
        <polygon
          points={[
            at(x + w * 0.3, y + d * 0.3, z + h),
            at(x + w * 0.7, y + d * 0.3, z + h),
            at(x + w * 0.7, y + d * 0.7, z + h),
            at(x + w * 0.3, y + d * 0.7, z + h),
          ].join(" ")}
          className="fill-[color-mix(in_oklab,var(--tone)_18%,transparent)] stroke-(--tone)"
        />
      )}
    </g>
  );
}

type Point = [number, number, number];
type Line = { points: Point[]; dashed?: boolean; signal?: boolean };

function Scene({
  boxes,
  lines = [],
  tone = "blue",
}: {
  boxes: Box[];
  lines?: Line[];
  tone?: Tone;
}) {
  // Painter's order: farthest first. Lines lie under the boxes, so they go first.
  const sorted = [...boxes].sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));
  return (
    <svg
      viewBox={frame(
        boxes,
        lines.flatMap((line) => line.points),
      )}
      aria-hidden
      style={{ "--tone": TONES[tone] } as React.CSSProperties}
      className="h-full w-full fill-none stroke-foreground/45 [stroke-linejoin:round] [stroke-width:1]"
    >
      {lines.map((line, i) => (
        <polyline
          key={i}
          points={line.points.map((p) => at(...p)).join(" ")}
          strokeDasharray={line.dashed ? "3 3" : undefined}
          className={line.signal ? "stroke-(--tone)" : undefined}
        />
      ))}
      {sorted.map((box, i) => (
        <IsoBox key={i} {...box} />
      ))}
    </svg>
  );
}

/** One shared copy at the bottom. Above it float three thin layers: what each agent changed. */
export function ShareArt() {
  const changes: [number, number, number][] = [
    [-55, 5, -22],
    [-17, -33, -2],
    [21, -71, 18],
  ];
  return (
    <Scene
      boxes={[
        { x: -75, y: -75, z: -70, w: 150, d: 150, h: 14 },
        ...changes.map(([x, y, z]) => ({ x, y, z, w: 34, d: 34, h: 5, mark: true })),
      ]}
      lines={changes.map(([x, y, z]) => ({
        points: [
          [x + 17, y + 17, -56],
          [x + 17, y + 17, z],
        ],
        dashed: true,
      }))}
    />
  );
}

/** Main as a row of commits. A branch leaves it, does its work and merges back; another is dropped. */
export function ForkArt() {
  const s = 30;
  const z = 0;
  const main = [0, 55, 110, 165];
  const c = (v: number) => v + s / 2;
  return (
    <Scene
      tone="green"
      boxes={[
        ...main.map((x, i) => ({ x, y: 0, z, w: s, d: s, h: s, mark: i === 3 })),
        { x: 55, y: -70, z, w: s, d: s, h: s * 0.6 },
        { x: 110, y: -70, z, w: s, d: s, h: s * 0.6, mark: true },
        { x: 55, y: 70, z, w: s, d: s, h: s * 0.6 },
      ]}
      lines={[
        {
          points: [
            [c(0), c(0), z],
            [c(165), c(0), z],
          ],
        },
        {
          points: [
            [c(0), c(0), z],
            [c(0), c(-70), z],
            [c(165), c(-70), z],
            [c(165), c(0), z],
          ],
          signal: true,
        },
        {
          points: [
            [c(0), c(0), z],
            [c(0), c(70), z],
            [c(55), c(70), z],
          ],
          dashed: true,
        },
      ]}
    />
  );
}

/** Your bucket holds both: folders of files on one side, the search index on the other. */
export function BucketArt() {
  const files = [-62, -30].flatMap((y) =>
    [0, 1, 2].map((i) => ({ x: -68, y, z: -56 + i * 9, w: 50, d: 24, h: 4 })),
  );
  const index = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => ({
      x: 22 + col * 22,
      y: -64 + row * 22,
      z: -56,
      w: 15,
      d: 15,
      h: 10 + (((row * 3 + col) * 7) % 26),
      mark: row * 3 + col === 4,
    })),
  );
  return (
    <Scene
      tone="amber"
      boxes={[{ x: -85, y: -80, z: -70, w: 190, d: 120, h: 14 }, ...files, ...index]}
    />
  );
}

// One scene per use case, in the order of useCases.items. The page picks each one's tone.

/** Knowledge base: stacks of docs. The page that answers the search lifts out, lit. */
export function KnowledgeIso({ tone }: { tone: Tone }) {
  const stacks = [-62, -12, 38];
  return (
    <Scene
      tone={tone}
      boxes={[
        { x: -80, y: -60, z: -20, w: 160, d: 110, h: 10 },
        ...stacks.flatMap((x) =>
          [0, 1, 2, 3].map((k) => ({ x, y: -42, z: -10 + k * 7, w: 34, d: 70, h: 3 })),
        ),
        { x: -12, y: -42, z: 70, w: 34, d: 70, h: 3, lit: true },
      ]}
      lines={[
        {
          points: [
            [5, -7, 14],
            [5, -7, 70],
          ],
          dashed: true,
          signal: true,
        },
      ]}
    />
  );
}

/** Context layer: one shared store in the middle, every agent wired to it. */
export function ContextIso({ tone }: { tone: Tone }) {
  const agents: [number, number][] = [
    [-120, -12],
    [72, -12],
    [-12, -120],
    [-12, 72],
  ];
  return (
    <Scene
      tone={tone}
      boxes={[
        { x: -35, y: -35, z: 0, w: 70, d: 70, h: 18, mark: true },
        ...agents.map(([x, y]) => ({ x, y, z: 0, w: 24, d: 24, h: 24 })),
      ]}
      lines={agents.map(([x, y]) => ({
        points: [
          [x + 12, y + 12, 0],
          [0, 0, 0],
        ],
        dashed: true,
        signal: true,
      }))}
    />
  );
}

/** Sandboxes: each agent on its own island, nothing shared by accident. */
export function SandboxIso({ tone }: { tone: Tone }) {
  const islands = [-135, -35, 65];
  return (
    <Scene
      tone={tone}
      boxes={islands.flatMap((x, i) => [
        { x, y: -35, z: 0, w: 70, d: 70, h: 8 },
        { x: x + 22, y: -13, z: 8, w: 26, d: 26, h: 26, lit: i === 1 },
      ])}
    />
  );
}

/** Coding agents: four tries at one fix, each a row of passing tests. One passes them all. */
export function CodingIso({ tone }: { tone: Tone }) {
  const passed = [3, 6, 2, 4];
  return (
    <Scene
      tone={tone}
      boxes={passed.flatMap((count, row) =>
        Array.from({ length: count }, (_, k) => ({
          x: -60 + k * 22,
          y: -60 + row * 30,
          z: 0,
          w: 14,
          d: 14,
          h: 14,
          lit: count === 6,
        })),
      )}
      lines={passed.map((_, row) => ({
        points: [
          [-60, -53 + row * 30, 0],
          [76, -53 + row * 30, 0],
        ],
        dashed: true,
      }))}
    />
  );
}

/** Experiments: many runs on the same data. The best one stands tallest, lit. */
export function ExperimentsIso({ tone }: { tone: Tone }) {
  const heights = [26, 42, 34, 70, 38, 50];
  return (
    <Scene
      tone={tone}
      boxes={[
        { x: -82, y: -30, z: -10, w: 168, d: 60, h: 10 },
        ...heights.map((h, i) => ({
          x: -72 + i * 26,
          y: -12,
          z: 0,
          w: 18,
          d: 24,
          h,
          lit: i === 3,
        })),
      ]}
    />
  );
}
