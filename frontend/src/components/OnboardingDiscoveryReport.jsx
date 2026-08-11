import { useState } from "react";
import { runWebsiteDiscovery } from "../lib/onboardingDiscovery";
import { DiscoveryTopologyMap } from "./DiscoveryTopologyMap";
import { DiscoverySecurityScan } from "./DiscoverySecurityScan";
import { DiscoveryReliabilityIssues } from "./DiscoveryReliabilityIssues";
import { DiscoveryPerformanceBaseline } from "./DiscoveryPerformanceBaseline";
import { DiscoverySRERecommendations } from "./DiscoverySRERecommendations";
import { DiscoveryHistoryTimeline } from "./DiscoveryHistoryTimeline";

export function OnboardingDiscoveryReport({ monitor, liveData }) {
  const discovery = runWebsiteDiscovery(monitor?.url || "https://cloudaxisnp.com", liveData);
  const siteName = monitor?.name || "Target Application";
  const [expandedLayer, setExpandedLayer] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-neutral-900 via-black to-cyan-950 p-6 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                ✓ Discovery Completed
              </span>
              <span className="text-xs text-white/50">Last Discovery: {discovery.lastDiscoveredAt}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-white md:text-2xl">
              Application Architecture Intelligence: {siteName}
            </h1>
            <p className="mt-0.5 text-xs text-white/60">
              Target: <span className="font-mono text-cyan-300 font-semibold">{discovery.targetUrl}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-2xl font-bold tabular-nums text-emerald-300">{discovery.confidenceScore}%</span>
              <p className="text-[10px] uppercase font-bold text-white/40">Confidence Score</p>
            </div>
            <div>
              <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                Risk: {discovery.riskLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Step 2: Discovered Architecture Cards with Evidence & Confidence */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 block mb-3">
            Section 1: Detected Architecture & Detection Evidence
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {discovery.detectedLayers.map((layer, idx) => {
              const isExpanded = expandedLayer === idx;

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 space-y-3 transition-all ${
                    layer.isExposed ? "border-white/10 bg-black/40" : "border-amber-400/30 bg-amber-400/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/40">{layer.layer}</span>
                      <h4 className="text-sm font-bold text-white">{layer.name} {layer.version}</h4>
                    </div>

                    <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                      {layer.confidencePct}% Conf
                    </span>
                  </div>

                  {!layer.isExposed && (
                    <p className="text-[11px] text-amber-300 font-medium">⚠️ {layer.note}</p>
                  )}

                  {/* Detection Evidence Checklist */}
                  <div className="space-y-1.5 text-xs border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold uppercase text-white/40 block">Detection Evidence:</span>
                    {layer.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-emerald-300">
                        <span>✓</span>
                        <span className="text-white/80">{ev}</span>
                      </div>
                    ))}
                  </div>

                  {layer.possibleServices && (
                    <div className="pt-2 border-t border-white/10 text-[10px] text-white/50 flex flex-wrap gap-1">
                      <span>Possible AWS Services:</span>
                      {layer.possibleServices.map((svc, i) => (
                        <span key={i} className="rounded bg-white/10 px-1.5 py-0.2 text-white font-mono">{svc}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 3: Architecture Topology Map */}
      <DiscoveryTopologyMap nodes={discovery.topologyNodes} />

      {/* Step 4: Security & Vulnerability Scan */}
      <DiscoverySecurityScan securityScan={discovery.securityScan} />

      {/* Step 5: Current Reliability Issues Panel */}
      <DiscoveryReliabilityIssues issues={discovery.reliabilityIssues} />

      {/* Step 6: Performance Baseline */}
      <DiscoveryPerformanceBaseline performanceBaseline={discovery.performanceBaseline} />

      {/* Step 7: AI SRE Recommendations */}
      <DiscoverySRERecommendations sreAnalysis={discovery.sreAnalysis} />

      {/* Step 9: Architecture Discovery History */}
      <DiscoveryHistoryTimeline history={discovery.changeHistory} />
    </div>
  );
}
