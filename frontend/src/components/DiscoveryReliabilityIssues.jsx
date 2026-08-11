import { useState } from "react";
import { useToast } from "./Toast";

export function DiscoveryReliabilityIssues({ issues = [] }) {
  const [activeTerraformId, setActiveTerraformId] = useState(null);
  const [fixedIssues, setFixedIssues] = useState([]);
  const toast = useToast();

  const handleFixAuto = (iss) => {
    setFixedIssues(prev => [...prev, iss.id]);
    toast.success(`Applied auto-fix for: ${iss.title}`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-red-400/20 text-red-300">🚨</span>
            <h3 className="text-sm font-semibold text-white">Current Reliability & Risk Issues</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Discovered operational bottlenecks, exposure risks, & auto-remediation actions</p>
        </div>

        <span className="rounded-full bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300">
          {issues.length - fixedIssues.length} Open Issues
        </span>
      </div>

      <div className="space-y-4">
        {issues.map(iss => {
          const isFixed = fixedIssues.includes(iss.id);
          const isCritical = iss.severity === "CRITICAL";

          return (
            <div
              key={iss.id}
              className={`rounded-xl border p-4 space-y-3 transition-all ${
                isFixed
                  ? "border-emerald-400/30 bg-emerald-400/10 opacity-70"
                  : isCritical
                  ? "border-red-400/40 bg-red-400/10"
                  : "border-amber-400/40 bg-amber-400/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isCritical ? "bg-red-400/30 text-red-300" : "bg-amber-400/30 text-amber-300"
                  }`}>
                    {iss.severity}
                  </span>
                  <h4 className="text-sm font-bold text-white">{iss.title}</h4>
                </div>

                {isFixed ? (
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    Resolved ✓
                  </span>
                ) : iss.fixType === "terraform" ? (
                  <button
                    onClick={() => setActiveTerraformId(prev => prev === iss.id ? null : iss.id)}
                    className="rounded-xl bg-purple-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-400"
                  >
                    🛠️ {activeTerraformId === iss.id ? "Hide Terraform Script" : iss.fixTitle}
                  </button>
                ) : (
                  <button
                    onClick={() => handleFixAuto(iss)}
                    className="rounded-xl bg-emerald-400 px-4 py-1.5 text-xs font-bold text-black hover:bg-emerald-300"
                  >
                    ✨ {iss.fixTitle}
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-white/80"><span className="font-semibold text-white">Impact:</span> {iss.impact}</p>
                <p className="text-white/60"><span className="font-semibold text-white">Recommendation:</span> {iss.recommendation}</p>
              </div>

              {/* Terraform Code Box */}
              {activeTerraformId === iss.id && iss.terraformScript && (
                <div className="rounded-xl border border-white/10 bg-black/80 p-3 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] text-purple-300 font-bold uppercase">Automated Terraform Change Script</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(iss.terraformScript);
                        toast.success("Terraform script copied to clipboard!");
                      }}
                      className="text-[10px] text-cyan-300 hover:underline"
                    >
                      Copy Terraform Script
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-cyan-100 text-[11px] leading-relaxed">{iss.terraformScript}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
