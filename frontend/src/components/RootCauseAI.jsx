import { motion } from "motion/react";
import { run11PointAIInvestigation } from "../lib/performanceAIEngine";

const EASE = [0.16, 1, 0.3, 1];

export function RootCauseAI({ monitor, history }) {
  const inv = run11PointAIInvestigation(monitor, history);

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 light:border-slate-900/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-400/20 text-purple-300">🔍</span>
            <h3 className="text-sm font-semibold text-white light:text-slate-900">AI Root Cause Engine</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Autonomous multi-layer telemetry investigation across network, server, database, & app logs</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1 text-xs font-semibold text-purple-300 light:bg-purple-100 light:text-purple-700">
          Confidence: {inv.confidence}%
        </div>
      </div>

      {/* Root Cause Found Card */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-4 light:bg-amber-100/50"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 light:text-amber-700">ROOT CAUSE FOUND</span>
        <h4 className="mt-1 text-base font-semibold text-white light:text-slate-900">{inv.cause}</h4>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-black/30 p-2.5 light:bg-white/80">
            <span className="text-[10px] text-white/40 light:text-slate-400">Server CPU</span>
            <p className="text-sm font-bold text-white light:text-slate-900">{inv.evidence.cpu}</p>
          </div>
          <div className="rounded-lg bg-black/30 p-2.5 light:bg-white/80">
            <span className="text-[10px] text-white/40 light:text-slate-400">RAM Allocated</span>
            <p className="text-sm font-bold text-white light:text-slate-900">{inv.evidence.ram}</p>
          </div>
          <div className="rounded-lg bg-black/30 p-2.5 light:bg-white/80">
            <span className="text-[10px] text-white/40 light:text-slate-400">DB Connection Usage</span>
            <p className="text-sm font-bold text-amber-300 light:text-amber-700">{inv.evidence.dbConnectionUsage}</p>
          </div>
          <div className="rounded-lg bg-black/30 p-2.5 light:bg-white/80">
            <span className="text-[10px] text-white/40 light:text-slate-400">Slow Queries Count</span>
            <p className="text-sm font-bold text-red-300 light:text-red-700">{inv.evidence.slowQueriesCount}</p>
          </div>
        </div>
      </motion.div>

      {/* 11-Point Investigation Grid */}
      <div className="mt-5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">
          Automated Investigation Checklist ({inv.passedCount} / {inv.totalCount} passed)
        </span>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {inv.checks.map(c => (
            <div key={c.key} className="flex items-start gap-2.5 rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-2.5 text-xs">
              <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
                c.status === "ok" ? "bg-emerald-400/20 text-emerald-300" :
                c.status === "warning" ? "bg-amber-400/20 text-amber-300" :
                "bg-red-400/20 text-red-300"
              }`}>
                {c.status === "ok" ? "✓" : "!"}
              </span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-white light:text-slate-900">{c.name}</span>
                <p className="truncate text-[11px] text-white/45 light:text-slate-500">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
