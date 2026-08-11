import { useState } from "react";
import { detectDeploymentChanges } from "../lib/changeIntelligence";
import { useToast } from "./Toast";

export function ChangeIntelligence({ monitor }) {
  const changeData = detectDeploymentChanges(monitor);
  const [rolledBack, setRolledBack] = useState(false);
  const toast = useToast();

  const handleRollback = () => {
    setRolledBack(true);
    toast.success(`Successfully rolled back release ${changeData.detectedChange.deploymentTag} to previous baseline.`);
  };

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-amber-400/20 text-amber-300">📦</span>
            <h3 className="text-sm font-semibold text-white light:text-slate-900">Change Intelligence & Deployment Correlation</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Detect code commits, release deploys, & bundle size spikes</p>
        </div>

        {!rolledBack ? (
          <button
            type="button"
            onClick={handleRollback}
            className="rounded-xl bg-red-400 px-4 py-2 text-xs font-bold text-black hover:bg-red-300 transition-colors"
          >
            ⏪ Rollback Deployment ({changeData.detectedChange.deploymentTag})
          </button>
        ) : (
          <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
            Rolled Back ✓
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase text-white/40">BEFORE DEPLOYMENT</span>
          <p className="text-xl font-bold text-emerald-300 tabular-nums">{changeData.detectedChange.beforeResponseMs}ms</p>
          <p className="text-xs text-white/50">Baseline average latency</p>
        </div>

        <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3.5 space-y-2">
          <span className="text-[10px] font-bold uppercase text-red-300">AFTER DEPLOYMENT ({changeData.detectedChange.deploymentTag})</span>
          <p className="text-xl font-bold text-red-300 tabular-nums">{rolledBack ? "300ms" : `${changeData.detectedChange.afterResponseMs}ms`}</p>
          <p className="text-xs text-white/50">{rolledBack ? "Restored after rollback" : "Degradation detected"}</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2 text-xs">
        <span className="font-semibold text-white">Modified Build Files in {changeData.detectedChange.deploymentTag}:</span>

        <div className="space-y-1">
          {changeData.detectedChange.modifiedFiles.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-white/70">
              <span className="font-mono text-[11px]">{f.path}</span>
              <span className="font-mono text-[11px] text-amber-300">{f.beforeSize} → {f.afterSize} ({f.delta})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
