import { motion } from "motion/react";
import { buildDigitalTwinGraph } from "../lib/appDependencyMap";

export function ApplicationDigitalTwin({ monitor, isDegraded = true }) {
  const graph = buildDigitalTwinGraph(monitor, isDegraded);

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-400/20 text-cyan-300">🗺️</span>
            <h3 className="text-sm font-semibold text-white light:text-slate-900">Application Digital Twin & Topology Map</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Live dependency map tracing telemetry flows & failure propagation</p>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/70">
          7 Connected Nodes
        </span>
      </div>

      {/* Nodes Map Visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {graph.nodes.map(n => {
          const isCritical = n.status === "critical";
          const isDegradedNode = n.status === "degraded";

          return (
            <motion.div
              key={n.id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border p-3.5 relative transition-all ${
                isCritical
                  ? "border-red-400/50 bg-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                  : isDegradedNode
                  ? "border-amber-400/50 bg-amber-400/10"
                  : "border-white/10 bg-white/[0.02] light:bg-slate-900/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{n.icon}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isCritical ? "bg-red-400/20 text-red-300" : isDegradedNode ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300"
                }`}>
                  {n.status}
                </span>
              </div>

              <h4 className="mt-2 text-xs font-bold text-white light:text-slate-900">{n.name}</h4>
              <p className="mt-0.5 text-[11px] text-white/50 light:text-slate-500">{n.details}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Incident Flow Propagation */}
      {graph.propagationPath.length > 0 && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">FAILURE PROPAGATION CASCADE</span>

          <div className="space-y-1.5 text-xs">
            {graph.propagationPath.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/80">
                <span className="font-mono text-red-300 font-bold">{step.from.toUpperCase()} ↓ {step.to.toUpperCase()}:</span>
                <span className="text-white/60">{step.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
