import { motion } from "motion/react";
import { healthBand } from "../lib/websiteHealth";

const EASE = [0.16, 1, 0.3, 1];
const BAND_COLOR = { good: "#34d399", warn: "#fbbf24", bad: "#f87171", unknown: "#64748b" };

export function PerformanceScore({ score = 88, cwv = null }) {
  const band = healthBand(score);
  const color = BAND_COLOR[band];
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;

  const vitals = cwv || {
    lcp: { val: "1.8s", status: "good", label: "LCP (Largest Contentful Paint)" },
    inp: { val: "48ms", status: "good", label: "INP (Interaction to Next Paint)" },
    cls: { val: "0.04", status: "good", label: "CLS (Cumulative Layout Shift)" },
    ttfb: { val: "180ms", status: "good", label: "TTFB (Time to First Byte)" }
  };

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/10 light:stroke-slate-900/10" />
              <motion.circle
                cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }}
                transition={{ duration: 0.9, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums text-white light:text-slate-900">{score}</span>
              <span className="text-[10px] text-white/45 light:text-slate-400">Perf Score</span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white light:text-slate-900">Core Web Vitals & Speed Score</h3>
            <p className="mt-0.5 text-xs text-white/50 light:text-slate-500">Real User Monitoring (RUM) + Synthetic Core Web Vitals telemetry</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(vitals).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-3">
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">{v.label}</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold tabular-nums text-white light:text-slate-900">{v.val}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
