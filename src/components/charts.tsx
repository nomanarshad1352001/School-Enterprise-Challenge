"use client";

/* Hand-rolled SVG charts — no chart library, so the bundle stays tiny.
   All charts are pure functions of their props (deterministic, SSR-safe). */

import { cx } from "./ui";

/* ---- progress donut ---- */
export function Donut({
  value, max = 100, size = 96, stroke = 9, label, sub, invert,
}: {
  value: number; max?: number; size?: number; stroke?: number;
  label: string; sub?: string; invert?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className={invert ? "stroke-cream/15" : "stroke-ink/8"} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          stroke="url(#donutGold)"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)" }}
        />
        <defs>
          <linearGradient id="donutGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a9832f" />
            <stop offset="55%" stopColor="#c9a44e" />
            <stop offset="100%" stopColor="#ead191" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cx("font-display font-semibold tracking-tight", invert ? "text-cream" : "text-ink")}
          style={{ fontSize: size * 0.24 }}>
          {label}
        </span>
        {sub && <span className={cx("text-[10px] font-semibold uppercase tracking-widest", invert ? "text-cream/60" : "text-ink-2/70")}>{sub}</span>}
      </div>
    </div>
  );
}

/* ---- smooth area trend ---- */
export function Trend({
  points, height = 120, className, invert,
}: { points: number[]; height?: number; className?: string; invert?: boolean }) {
  const w = 100, h = 38;
  const max = Math.max(...points), min = Math.min(...points);
  const span = Math.max(1, max - min);
  const stepX = w / (points.length - 1);
  const coords = points.map((p, i) => [i * stepX, h - 4 - ((p - min) / span) * (h - 10)] as const);
  // smooth path through points
  let d = `M ${coords[0][0]},${coords[0][1]}`;
  for (let i = 1; i < coords.length; i++) {
    const [x0, y0] = coords[i - 1];
    const [x1, y1] = coords[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx},${y0} ${mx},${y1} ${x1},${y1}`;
  }
  const area = `${d} L ${w},${h} L 0,${h} Z`;
  return (
    <div className={cx("w-full", className)} style={{ height }} role="img" aria-label="trend chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a44e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c9a44e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={d} fill="none" stroke={invert ? "#ead191" : "#a9832f"} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-ink-2/60">
        <span>12w ago</span>
        <span className="gold-text">{points[points.length - 1].toLocaleString()} / wk</span>
      </div>
    </div>
  );
}

/* ---- horizontal comparison bars ---- */
export function Bars({
  data, formatValue, className,
}: { data: { label: string; value: number }[]; formatValue?: (v: number) => string; className?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cx("space-y-3", className)}>
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="font-medium text-ink-2">{d.label}</span>
            <span className="font-bold text-ink">{formatValue ? formatValue(d.value) : d.value.toLocaleString()}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-pine-700 to-gold-500 transition-all duration-1000"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
