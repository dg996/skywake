// Small flat drawings for the use case guides: files, branches and machines in
// hairlines, with one accent in the signal colour. Each shows the guide's idea at a glance.
import type { ReactNode } from "react";

const LINE = "fill-none stroke-foreground/25";
const BOX = "fill-background stroke-foreground/25";
const SOFT = "fill-foreground/[0.06]";
const LIT = "fill-[color-mix(in_oklab,var(--signal)_14%,var(--background))] stroke-signal";

type At = { x: number; y: number };

/** A page with a few lines of text. */
function Doc({ x, y, w = 30, h = 38, lit }: At & { w?: number; h?: number; lit?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} className={lit ? LIT : BOX} />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={x + 6}
          y={y + 8 + i * 7}
          width={(w - 12) * (i === 2 ? 0.6 : 1)}
          height={2}
          rx={1}
          className={lit ? "fill-signal/50" : SOFT}
        />
      ))}
    </g>
  );
}

/** A commit on a branch. */
function Dot({ x, y, lit }: At & { lit?: boolean }) {
  return <circle cx={x} cy={y} r={3.5} className={lit ? "fill-signal stroke-signal" : BOX} />;
}

/** The lattice tile, used as the one bright mark in a scene. */
function Tile({ x, y, s = 5 }: At & { s?: number }) {
  return (
    <rect
      x={x - s / 2}
      y={y - s / 2}
      width={s}
      height={s}
      rx={1}
      transform={`rotate(45 ${x} ${y})`}
      className="fill-signal"
    />
  );
}

/** A row of commits along a line. */
function Branch({
  y,
  from,
  to,
  dots,
  lit = [],
}: {
  y: number;
  from: number;
  to: number;
  dots: number[];
  lit?: number[];
}) {
  return (
    <g>
      <path d={`M${from} ${y}H${to}`} className={LINE} />
      {dots.map((x) => (
        <Dot key={x} x={x} y={y} lit={lit.includes(x)} />
      ))}
    </g>
  );
}

const SCENES: Record<string, ReactNode> = {
  // A search, and the one doc it lands on.
  "knowledge-base": (
    <>
      <rect x={40} y={12} width={160} height={22} rx={11} className={BOX} />
      <circle cx={54} cy={23} r={4} className={LINE} />
      <path d="M57 26l3 3" className={LINE} />
      <rect x={68} y={21.5} width={60} height={3} rx={1.5} className={SOFT} />
      {[46, 68, 90].map((y, i) => (
        <g key={y}>
          <rect x={40} y={y} width={160} height={16} rx={4} className={i === 0 ? LIT : BOX} />
          <rect
            x={58}
            y={y + 6.5}
            width={i === 0 ? 90 : 70 - i * 12}
            height={3}
            rx={1.5}
            className={i === 0 ? "fill-signal/50" : SOFT}
          />
          {i === 0 && <Tile x={49} y={y + 8} />}
        </g>
      ))}
    </>
  ),
  // Three runs, one memory file they all read and write.
  "context-layer": (
    <>
      <Branch y={22} from={30} to={210} dots={[50, 120, 190]} lit={[190]} />
      <path d="M50 26C50 50 100 46 108 64M120 26V64M190 26C190 50 140 46 132 64" className={LINE} />
      <Doc x={102} y={64} w={36} h={44} lit />
    </>
  ),
  // A machine dies; the next one carries on from the last save.
  sandboxes: (
    <>
      <rect
        x={26}
        y={18}
        width={72}
        height={50}
        rx={6}
        className={`${BOX} [stroke-dasharray:3_3] opacity-60`}
      />
      <path d="M54 37l16 12M70 37L54 49" className="fill-none stroke-foreground/30" />
      <rect x={142} y={18} width={72} height={50} rx={6} className={BOX} />
      <rect x={154} y={30} width={48} height={3} rx={1.5} className={SOFT} />
      <rect x={154} y={38} width={34} height={3} rx={1.5} className={SOFT} />
      <Tile x={202} y={56} />
      <Branch
        y={96}
        from={26}
        to={214}
        dots={[38, 56, 74, 92, 152, 170, 188, 206]}
        lit={[152, 170, 188, 206]}
      />
      <path d="M120 84v24" className="fill-none stroke-foreground/25 [stroke-dasharray:2_3]" />
    </>
  ),
  // Three agents on their own branches; one fix goes back to main.
  "coding-agents": (
    <>
      <Branch y={96} from={20} to={220} dots={[34, 204]} lit={[204]} />
      <path
        d="M34 96C60 96 50 24 80 24H170C190 24 190 96 204 96"
        className="fill-none stroke-signal"
      />
      <path d="M34 96C60 96 52 48 80 48H160M34 96C60 96 54 72 80 72H150" className={LINE} />
      <Dot x={130} y={24} lit />
      <Dot x={170} y={24} lit />
      <Dot x={120} y={48} />
      <Dot x={160} y={48} />
      <Dot x={110} y={72} />
      <Dot x={150} y={72} />
    </>
  ),
  // A page with one changed line, waiting for your approval.
  "document-agents": (
    <>
      <rect x={66} y={10} width={108} height={98} rx={6} className={BOX} />
      {[24, 36, 60, 72, 84].map((y, i) => (
        <rect key={y} x={80} y={y} width={i % 2 ? 60 : 80} height={3} rx={1.5} className={SOFT} />
      ))}
      <rect x={74} y={44} width={92} height={11} rx={2} className={LIT} />
      <rect x={86} y={48} width={56} height={3} rx={1.5} className="fill-signal/60" />
      <path d="M79 49.5h3M80.5 48v3" className="fill-none stroke-signal" />
      <circle cx={174} cy={104} r={11} className={LIT} />
      <path d="M169 104l3.5 3.5L179 100" className="fill-none stroke-signal" />
    </>
  ),
  // One saved world, many identical copies.
  rl: (
    <>
      <Doc x={24} y={38} w={44} h={44} lit />
      {[14, 40, 66, 92].map((y, i) => (
        <g key={y}>
          <path d={`M68 60C110 60 110 ${y + 9} 150 ${y + 9}`} className={LINE} />
          <rect x={150} y={y} width={60} height={18} rx={4} className={BOX} />
          <rect
            x={158}
            y={y + 7.5}
            width={i === 1 ? 30 : 36}
            height={3}
            rx={1.5}
            className={SOFT}
          />
          {i === 1 && <Tile x={200} y={y + 9} />}
        </g>
      ))}
    </>
  ),
  // Each job forks last night's warm build and rebuilds one piece.
  ci: (
    <>
      <Branch y={20} from={20} to={220} dots={[40, 80, 120]} lit={[120]} />
      {[44, 102, 160].map((x, j) => (
        <g key={x}>
          <path d={`M120 24C120 44 ${x + 18} 40 ${x + 18} 56`} className={LINE} />
          <rect x={x} y={56} width={36} height={50} rx={5} className={BOX} />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <rect
              key={k}
              x={x + 7 + (k % 2) * 12}
              y={63 + Math.floor(k / 2) * 13}
              width={10}
              height={9}
              rx={2}
              className={k === (j * 2 + 1) % 6 ? "fill-signal" : SOFT}
            />
          ))}
        </g>
      ))}
    </>
  ),
  // Main's data, and a full copy for each pull request.
  previews: (
    <>
      <rect x={22} y={26} width={84} height={66} rx={5} className={BOX} />
      {[40, 54, 68, 82].map((y) => (
        <path key={y} d={`M22 ${y}H106`} className={LINE} />
      ))}
      <path d="M58 26V92" className={LINE} />
      {[12, 64].map((y, i) => (
        <g key={y}>
          <path d={`M106 59C126 59 124 ${y + 21} 140 ${y + 21}`} className={LINE} />
          <rect x={140} y={y} width={80} height={42} rx={5} className={BOX} />
          <rect
            x={148}
            y={y + 7}
            width={22}
            height={8}
            rx={4}
            className={i === 0 ? "fill-signal/30" : SOFT}
          />
          <path d={`M140 ${y + 21}H220M140 ${y + 32}H220`} className={LINE} />
          {i === 0 && (
            <rect x={182} y={y + 23} width={34} height={7} rx={2} className="fill-signal/40" />
          )}
        </g>
      ))}
    </>
  ),
  // Every version of the data kept, and a card pointing to the one a model learned from.
  datasets: (
    <>
      <Branch y={92} from={20} to={220} dots={[40, 80, 120, 160, 200]} lit={[120]} />
      <rect x={88} y={12} width={88} height={40} rx={5} className={BOX} />
      <rect x={98} y={22} width={40} height={3} rx={1.5} className={SOFT} />
      <rect x={98} y={30} width={58} height={3} rx={1.5} className={SOFT} />
      <Tile x={164} y={23} />
      <path d="M120 52V86" className="fill-none stroke-signal [stroke-dasharray:2_3]" />
    </>
  ),
  // One download per machine; every agent reads the local copy.
  "reference-data": (
    <>
      <Doc x={18} y={36} w={36} h={46} />
      <path d="M54 59H88" className={LINE} />
      <path d="M83 55l5 4-5 4" className={LINE} />
      <rect x={88} y={22} width={70} height={74} rx={6} className={BOX} />
      <Doc x={106} y={38} w={34} h={42} lit />
      {[20, 46, 72, 98].map((y) => (
        <g key={y}>
          <path d={`M158 59C180 59 180 ${y} 200 ${y}`} className={LINE} />
          <circle cx={206} cy={y} r={6} className={BOX} />
        </g>
      ))}
    </>
  ),
};

export function GuideArt({ id, className }: { id: string; className?: string }) {
  const scene = SCENES[id];
  if (!scene) return null;
  return (
    <svg
      viewBox="0 0 240 120"
      aria-hidden
      className={className}
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {scene}
    </svg>
  );
}
