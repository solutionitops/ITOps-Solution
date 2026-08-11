export function DiscoverySRERecommendations({ sreAnalysis }) {
  const sre = sreAnalysis || {
    signalsAnalyzed: 32,
    dependenciesCount: 14,
    requestsAnalyzed: 200,
    findings: [
      "Database latency contributes 43% of total delay",
      "Static assets are not optimized",
      "No automated backup routine detected",
      "Single point of failure detected"
    ],
    priorities: [
      { priority: 1, action: "Enable database replication & multi-AZ failover", gain: "High Availability" },
      { priority: 2, action: "Configure Cloudflare CDN cache-control headers", gain: "35% Faster Load" },
      { priority: 3, action: "Enable automated daily PostgreSQL snapshot backups", gain: "Disaster Recovery" }
    ]
  };

  return (
    <div className="rounded-2xl border border-purple-400/30 bg-purple-400/[0.05] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-400/20 text-purple-300">🤖</span>
            <h3 className="text-sm font-semibold text-white">AI SRE Analysis & Action Priorities</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">
            Analyzed {sre.signalsAnalyzed} signals, {sre.dependenciesCount} dependencies, & {sre.requestsAnalyzed} HTTP requests
          </p>
        </div>

        <span className="rounded-full bg-purple-400/20 px-3 py-1 text-xs font-bold text-purple-300">
          3 Priority Actions
        </span>
      </div>

      {/* Main Findings */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3.5 space-y-2 text-xs">
        <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">MAIN FINDINGS</span>
        <ul className="space-y-1 text-white/80 list-disc list-inside">
          {sre.findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>

      {/* Action Priorities */}
      <div className="space-y-2">
        {sre.priorities.map(p => (
          <div key={p.priority} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-purple-500 font-bold text-white text-xs">
                P{p.priority}
              </span>
              <span className="font-medium text-white">{p.action}</span>
            </div>
            <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
              {p.gain}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
