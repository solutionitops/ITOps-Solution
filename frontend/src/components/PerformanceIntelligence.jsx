import { useState } from "react";
import { PerformanceScore } from "./PerformanceScore";
import { WaterfallAnalysis } from "./WaterfallAnalysis";
import { RootCauseAI } from "./RootCauseAI";
import { AutoFixController } from "./AutoFixController";
import { VerificationReport } from "./VerificationReport";
import { OptimizationEngine } from "./OptimizationEngine";
import { analyzePerformanceAnomalies } from "../lib/performanceAIEngine";

export function PerformanceIntelligence({ monitor, history = [] }) {
  const [fixedApplied, setFixedApplied] = useState(false);
  const perf = analyzePerformanceAnomalies(monitor, history);

  const siteName = monitor?.name || "Target Website";
  const siteUrl = monitor?.url || "https://example.com";

  return (
    <div className="space-y-6">
      {/* Detection Banner */}
      <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.08] p-5 light:bg-red-100/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-400/20 px-2.5 py-0.5 text-xs font-bold text-red-300">SEVERITY: {perf.severity}</span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                Target: {siteName} ({siteUrl})
              </span>
              <span className="text-xs text-white/50 light:text-slate-400">Started: 12:15 PM today</span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-white light:text-slate-900">
              {siteName} latency increased by {perf.latencyJumpPct > 0 ? perf.latencyJumpPct : 230}%
            </h2>
            <p className="mt-1 text-xs text-white/60 light:text-slate-600">
              Affected Endpoints: {perf.affectedEndpoints.map((ep, idx) => (
                <span key={idx} className="font-mono text-white/80 mr-2 bg-black/30 px-1.5 py-0.5 rounded">
                  {ep.path}
                </span>
              ))}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold tabular-nums text-red-300">{perf.avgRecentMs}ms</span>
            <p className="text-[11px] text-white/40">Current Response Time ({siteName})</p>
          </div>
        </div>
      </div>

      {/* Speed Score & Waterfall Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceScore score={fixedApplied ? 96 : 48} />
        <WaterfallAnalysis totalMs={fixedApplied ? 190 : perf.avgRecentMs} />
      </div>

      {/* Root Cause AI */}
      <RootCauseAI monitor={monitor} history={history} />

      {/* Auto Fix Controller */}
      <AutoFixController fixTitle={`Fix & Optimize ${siteName}`} monitor={monitor} onFixApplied={() => setFixedApplied(true)} />

      {/* Verification Report when applied */}
      {fixedApplied && <VerificationReport beforeMs={perf.avgRecentMs} afterMs={1900} monitor={monitor} />}

      {/* Optimization Marketplace */}
      <OptimizationEngine monitor={monitor} />
    </div>
  );
}
