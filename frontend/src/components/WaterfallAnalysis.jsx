import { motion } from "motion/react";
import { generateSyntheticWaterfall } from "../lib/performanceAIEngine";

const EASE = [0.16, 1, 0.3, 1];

export function WaterfallAnalysis({ totalMs = 450 }) {
  const phases = generateSyntheticWaterfall(totalMs);
  const maxMs = phases.reduce((sum, p) => sum + p.durationMs, 0);

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white light:text-slate-900">Synthetic HTTP Waterfall Analysis</h3>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Detailed breakdown of latency phases for recent check</p>
        </div>
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 light:bg-cyan-100 light:text-cyan-700">
          Total: {totalMs}ms
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {phases.map(p => {
          const widthPct = Math.max(4, Math.round((p.durationMs / maxMs) * 100));
          const leftPct = Math.round((p.offsetMs / maxMs) * 100);

          return (
            <div key={p.phase} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white/80 light:text-slate-700">
                  {p.phase} {p.isBottleneck && <span className="ml-1 rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-300">Bottleneck</span>}
                </span>
                <span className="font-mono text-white/50 light:text-slate-400">{p.durationMs}ms</span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10">
                <motion.div
                  className="absolute h-full rounded-full"
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, backgroundColor: p.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
