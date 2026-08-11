import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { DISCOVERY_STAGES } from "../lib/onboardingDiscovery";

export function DiscoveryProcessScreen({ targetUrl, onComplete }) {
  const [completedIndex, setCompletedIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedIndex(prev => {
        if (prev < DISCOVERY_STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  const domain = targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const progressPct = Math.round(((completedIndex + 1) / DISCOVERY_STAGES.length) * 100);

  return (
    <div className="rounded-3xl border border-cyan-400/30 bg-black/80 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-xl font-bold text-white">Discovering {domain}...</h2>
          </div>
          <p className="mt-1 text-xs text-white/50">Running multi-layer DNS, TLS, ASN, HTTP fingerprinting, security scan & topology generation</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums text-cyan-300">{progressPct}%</span>
          <p className="text-[10px] uppercase font-bold text-white/40">Scanning Progress</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 10-Step Stage Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {DISCOVERY_STAGES.map((stg, idx) => {
          const isDone = idx <= completedIndex;
          const isCurrent = idx === completedIndex;

          return (
            <motion.div
              key={stg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 rounded-xl border p-3 text-xs transition-all ${
                isDone
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 font-medium"
                  : isCurrent
                  ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200 animate-pulse font-semibold"
                  : "border-white/5 bg-white/[0.02] text-white/30"
              }`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${
                isDone ? "bg-emerald-400 text-black" : "bg-white/10 text-white/40"
              }`}>
                {isDone ? "✓" : idx + 1}
              </span>
              <span className="flex-1">{stg.label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
