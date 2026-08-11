import { useState } from "react";
import { useToast } from "../components/Toast";

const PIPELINE_EVENTS = [
  { release: "v2.5.0", commit: "a8f912c", author: "CI/CD Deployment Pipeline", provider: "GitHub Actions", scanStatus: "PASSED", vulnerabilities: 0, latencyImpact: "+300% (Degradation)", canRollback: true },
  { release: "v2.4.9", commit: "b7e4301", author: "Release Bot", provider: "GitHub Actions", scanStatus: "PASSED", vulnerabilities: 0, latencyImpact: "Normal baseline", canRollback: false },
  { release: "v2.4.8", commit: "c1d9042", author: "DevSecOps Security Scanner", provider: "GitLab CI", scanStatus: "PASSED", vulnerabilities: 2, latencyImpact: "-10% Faster", canRollback: false },
];

export function DevSecOpsPipeline() {
  const [events, setEvents] = useState(PIPELINE_EVENTS);
  const toast = useToast();

  const handleRollback = (rel) => {
    setEvents(prev => prev.map(e => e.release === rel ? { ...e, latencyImpact: "Restored after Rollback ✓", canRollback: false } : e));
    toast.success(`Successfully triggered 1-click Rollback for release ${rel}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white">DevSecOps CI/CD Pipeline Intelligence</h1>
        <p className="mt-1 text-xs text-white/50">Trace commits → builds → security scans → deployments → production latency impact</p>
      </div>

      <div className="space-y-3">
        {events.map((ev, idx) => (
          <div key={idx} className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-400/20 text-sm font-bold text-purple-300">
                  🐙
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Release {ev.release} ({ev.commit})</h3>
                  <p className="text-xs text-white/50">{ev.provider} · Authored by {ev.author}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                  Security Scan: {ev.scanStatus}
                </span>
                <span className={`text-xs font-bold ${ev.latencyImpact.includes("+") ? "text-red-300" : "text-emerald-300"}`}>
                  {ev.latencyImpact}
                </span>

                {ev.canRollback && (
                  <button
                    onClick={() => handleRollback(ev.release)}
                    className="rounded-xl bg-red-400 px-4 py-1.5 text-xs font-bold text-black hover:bg-red-300"
                  >
                    ⏪ Rollback Release
                  </button>
                )}
              </div>
            </div>

            {/* Pipeline Flow Visualization */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs border-t border-white/10 pt-3">
              <div className="rounded-lg bg-black/40 p-2">
                <span className="text-[10px] text-white/40 block">1. COMMIT</span>
                <span className="font-mono text-white font-semibold">{ev.commit}</span>
              </div>
              <div className="rounded-lg bg-black/40 p-2">
                <span className="text-[10px] text-white/40 block">2. BUILD</span>
                <span className="text-emerald-300 font-semibold">SUCCESS</span>
              </div>
              <div className="rounded-lg bg-black/40 p-2">
                <span className="text-[10px] text-white/40 block">3. SEC SCAN</span>
                <span className="text-emerald-300 font-semibold">{ev.vulnerabilities} CVEs</span>
              </div>
              <div className="rounded-lg bg-black/40 p-2">
                <span className="text-[10px] text-white/40 block">4. DEPLOY</span>
                <span className="text-purple-300 font-semibold">PROD</span>
              </div>
              <div className="rounded-lg bg-black/40 p-2">
                <span className="text-[10px] text-white/40 block">5. IMPACT</span>
                <span className={ev.latencyImpact.includes("+") ? "text-red-300 font-bold" : "text-emerald-300 font-bold"}>
                  {ev.latencyImpact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DevSecOpsPipeline;
