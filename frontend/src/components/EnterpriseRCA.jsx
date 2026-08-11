import { motion } from "motion/react";

const DIAGNOSTIC_STEPS = [
  { step: 1, title: "User Latency Spike Detected", detail: "Global client latency jumped from 300ms to 1.8s (+230%)" },
  { step: 2, title: "API Handler Response Delay", detail: "Upstream /api/v1/orders handler execution time delayed" },
  { step: 3, title: "Database Query Latency Increase", detail: "PostgreSQL query execution time reached 4.2 seconds" },
  { step: 4, title: "Connection Pool Exhaustion", detail: "Active connection count reached 98% (98 / 100 max connections)" },
  { step: 5, title: "Deployment Correlation", detail: "Deployment v2.1.5 introduced unindexed SELECT orders WHERE user_id query" },
];

export function EnterpriseRCA({ monitor }) {
  const siteName = monitor?.name || "Target App";

  return (
    <div className="rounded-2xl border border-purple-400/30 bg-purple-400/[0.05] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-400/20 text-purple-300">🔍</span>
            <h3 className="text-sm font-semibold text-white">5-Step Enterprise AI Diagnostic Chain RCA</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Causal relationship tracing from client latency down to exact database query line</p>
        </div>

        <span className="rounded-full bg-purple-400/20 px-3 py-1 text-xs font-bold text-purple-300">
          Confidence: 97%
        </span>
      </div>

      {/* Step-by-Step RCA Chain */}
      <div className="space-y-2">
        {DIAGNOSTIC_STEPS.map((s, idx) => (
          <div key={s.step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-purple-400/20 font-mono font-bold text-purple-300">
              {s.step}
            </span>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white">{s.title}</span>
              <p className="text-white/60">{s.detail}</p>
            </div>
            {idx < DIAGNOSTIC_STEPS.length - 1 && <span className="text-white/30 font-mono">↓</span>}
          </div>
        ))}
      </div>

      {/* Primary Root Cause Conclusion Card */}
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">PRIMARY ROOT CAUSE & EVIDENCE</span>
        <h4 className="text-sm font-bold text-white">Missing Database Index on table `orders(user_id)` for {siteName}</h4>

        <div className="rounded-lg bg-black/40 p-3 font-mono text-xs text-cyan-200">
          <p><span className="text-white/40">Query:</span> SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC;</p>
          <p><span className="text-white/40">Execution Time:</span> 4.2 seconds (Sequential scan over 1.8M rows)</p>
        </div>
      </div>
    </div>
  );
}
