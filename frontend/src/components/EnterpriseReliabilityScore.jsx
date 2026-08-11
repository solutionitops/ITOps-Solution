import { motion } from "motion/react";
import { calculateEnterpriseReliability } from "../lib/enterpriseReliabilityScore";

export function EnterpriseReliabilityScore({ monitor, history }) {
  const rel = calculateEnterpriseReliability(monitor, history);

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-400/20 text-emerald-300">📊</span>
            <h3 className="text-sm font-semibold text-white">Enterprise Reliability Score</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Multi-dimensional assessment across 6 enterprise reliability categories</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-bold tabular-nums text-emerald-300">{rel.overall}</span>
            <span className="text-sm text-white/40"> / 100</span>
          </div>
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
            Grade A-
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(rel.breakdown).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-white/40">{v.label}</span>
              <span className="text-[10px] text-white/30">{v.weight}</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-white">{v.score}%</p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${v.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
