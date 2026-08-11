import { motion } from "motion/react";

const FORECASTS = [
  {
    metric: "Disk Storage Usage",
    resource: "Root Volume (/dev/sda1)",
    currentPct: 78,
    growthRate: "5.2 GB / day",
    daysRemaining: 18,
    severity: "warning",
    recommendation: "Expand EBS volume by 50GB or clear docker system prune."
  },
  {
    metric: "SSL Certificate Expiry",
    resource: "api.company.com",
    currentPct: 90,
    growthRate: "1 day / day",
    daysRemaining: 7,
    severity: "critical",
    recommendation: "Auto-renew Let's Encrypt certificate via ACME agent."
  },
  {
    metric: "Database Connection Pool",
    resource: "Primary PG DB",
    currentPct: 82,
    growthRate: "+4 conns / hr",
    daysRemaining: 3,
    severity: "warning",
    recommendation: "Increase max_connections in postgresql.conf from 100 to 250."
  }
];

export function PredictiveFailure() {
  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-purple-400/20 text-purple-300">🔮</span>
            <h3 className="text-sm font-semibold text-white light:text-slate-900">Predictive Failure System</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">AI forecasting of resource exhaustion before outages occur</p>
        </div>

        <span className="rounded-full bg-purple-400/10 px-3 py-1 text-xs font-bold text-purple-300">
          3 Active Predictions
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FORECASTS.map((f, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-3.5 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-white/40">{f.metric}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  f.severity === "critical" ? "bg-red-400/20 text-red-300" : "bg-amber-400/20 text-amber-300"
                }`}>
                  Full in {f.daysRemaining} days
                </span>
              </div>

              <h4 className="mt-2 text-xs font-bold text-white">{f.resource}</h4>
              <p className="mt-1 text-[11px] text-white/50">Current: {f.currentPct}% | Growth: {f.growthRate}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-emerald-300">
              <span className="font-semibold text-white">Recommended Action:</span> {f.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
