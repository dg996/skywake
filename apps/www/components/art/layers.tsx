import type { HomeMessages } from "@/content/messages";

const ink = "var(--foreground)";
const muted = "var(--muted-foreground)";
const signal = "var(--signal)";
const mono = "var(--font-mono)";

function Box({
  x,
  y,
  w,
  title,
  note,
}: {
  x: number;
  y: number;
  w: number;
  title: string;
  note: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={64}
        rx={10}
        fill="var(--background)"
        stroke={ink}
        strokeOpacity={0.12}
      />
      <text x={x + w / 2} y={y + 29} textAnchor="middle" fill={ink} fontSize={16} fontWeight={500}>
        {title}
      </text>
      <text
        x={x + w / 2}
        y={y + 48}
        textAnchor="middle"
        fill={muted}
        fontFamily={mono}
        fontSize={12}
      >
        {note}
      </text>
    </g>
  );
}

const products = [
  { y: 40, key: "filesystem" },
  { y: 176, key: "index" },
] as const;

export function Layers({ t }: { t: HomeMessages["layers"] }) {
  return (
    <figure className="reveal hidden rounded-3xl border border-border bg-card sm:block">
      <svg
        viewBox="0 0 960 330"
        role="img"
        aria-label={t.alt}
        className="mx-auto block w-full max-w-5xl px-6 py-14"
      >
        <defs>
          <marker
            id="head"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0 1 9 5 0 9" fill="none" stroke={signal} strokeWidth={1.2} />
          </marker>
        </defs>

        <g fill="none" stroke={signal} strokeWidth={1} markerEnd="url(#head)">
          {products.map(({ y }) => (
            <g key={y}>
              <path d={`M560 140H520V${y + 32}H476`} />
              <path d={`M276 ${y + 32}H236V140H196`} />
            </g>
          ))}
          <path d="M800 140H736" />
          <path d="M116 172V290H872V178" strokeDasharray="4 4" className="dash-flow" />
        </g>

        <Box x={56} y={108} w={140} title={t.agents[0]} note={t.agents[1]} />
        {products.map((p) => (
          <Box key={p.key} x={276} y={p.y} w={200} title={t[p.key][0]} note={t[p.key][1]} />
        ))}
        <Box x={560} y={108} w={176} title={t.cache[0]} note={t.cache[1]} />
        <Box x={800} y={108} w={144} title={t.storage[0]} note={t.storage[1]} />

        <text x={494} y={316} textAnchor="middle" fill={muted} fontFamily={mono} fontSize={12.5}>
          only changes go up, every 2 s
        </text>
      </svg>
    </figure>
  );
}
