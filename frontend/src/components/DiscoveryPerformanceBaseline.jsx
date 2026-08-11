export function DiscoveryPerformanceBaseline({ performanceBaseline }) {
  const base = performanceBaseline || { pageLoadSec: 2.8, ttfbMs: 650, lcpSec: 2.4, apiLatencyMs: 450, performanceScore: 78 };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-400/20 text-cyan-300">⚡</span>
            <h3 className="text-sm font-semibold text-white">Performance Baseline Metrics</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Measured page load, TTFB, LCP, & API response baseline</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tabular-nums text-cyan-300">{base.performanceScore}</span>
          <span className="text-xs text-white/40">/ 100 Baseline</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] uppercase font-bold text-white/40">Page Load Time</span>
          <p className="mt-1 text-lg font-bold text-white tabular-nums">{base.pageLoadSec} sec</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] uppercase font-bold text-white/40">TTFB (Wait Time)</span>
          <p className="mt-1 text-lg font-bold text-amber-300 tabular-nums">{base.ttfbMs} ms</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] uppercase font-bold text-white/40">LCP (Largest Render)</span>
          <p className="mt-1 text-lg font-bold text-white tabular-nums">{base.lcpSec} sec</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] uppercase font-bold text-white/40">API Handler Latency</span>
          <p className="mt-1 text-lg font-bold text-cyan-300 tabular-nums">{base.apiLatencyMs} ms</p>
        </div>
      </div>
    </div>
  );
}
