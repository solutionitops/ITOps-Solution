import { motion } from "motion/react";
import { computeVerificationDelta } from "../lib/performanceAIEngine";

export function VerificationReport({ beforeMs = 4800, afterMs = 1900 }) {
  const report = computeVerificationDelta(beforeMs, afterMs);

  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/[0.05] p-5 light:bg-cyan-100/40 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 light:text-cyan-700">VERIFICATION ENGINE</span>
          <h3 className="text-sm font-semibold text-white light:text-slate-900">Post-Remediation Performance Verification</h3>
        </div>
        <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 light:bg-emerald-100 light:text-emerald-700">
          ✓ {report.statusText}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-black/30 light:bg-white p-3">
          <span className="text-[10px] text-white/40 light:text-slate-400">Response Time (Before)</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-red-300 light:text-red-600">{(report.beforeMs / 1000).toFixed(1)} sec</p>
        </div>
        <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-black/30 light:bg-white p-3">
          <span className="text-[10px] text-white/40 light:text-slate-400">Response Time (After)</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300 light:text-emerald-600">{(report.afterMs / 1000).toFixed(1)} sec</p>
        </div>
        <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-black/30 light:bg-white p-3">
          <span className="text-[10px] text-white/40 light:text-slate-400">Total Improvement</span>
          <p className="mt-1 text-xl font-bold tabular-nums text-cyan-300 light:text-cyan-600">+{report.improvementPct}% Faster</p>
        </div>
      </div>

      {/* Learning memory box */}
      <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-3 text-xs flex items-start gap-2.5">
        <span className="text-purple-400 text-sm">🧠</span>
        <div className="text-white/60 light:text-slate-600">
          <span className="font-semibold text-white light:text-slate-900">Learning System Updated:</span> Saved successful pattern (DB pool adjustment & query indexing) to memory database. Autonomous engine will automatically apply this strategy for future occurrences.
        </div>
      </div>
    </div>
  );
}
