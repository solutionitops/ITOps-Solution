import { motion } from "motion/react";

export function DiscoveryTopologyMap({ nodes = [] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan-400/20 text-cyan-300">🗺️</span>
            <h3 className="text-sm font-semibold text-white">Discovered Architecture Topology</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">Visual flow from client entry point down to database & object storage</p>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono text-white/70">
          {nodes.length} Discovered Nodes
        </span>
      </div>

      {/* Topology Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {nodes.map(n => {
          const isCritical = n.status === "critical";
          const isDegraded = n.status === "degraded";

          return (
            <motion.div
              key={n.id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl border p-3.5 space-y-2 relative transition-all ${
                isCritical
                  ? "border-red-400/50 bg-red-400/10 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                  : isDegraded
                  ? "border-amber-400/50 bg-amber-400/10"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{n.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  isCritical ? "bg-red-400/20 text-red-300" : isDegraded ? "bg-amber-400/20 text-amber-300" : "bg-emerald-400/20 text-emerald-300"
                }`}>
                  {n.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
                <div>Health: <span className="font-bold text-white">{n.healthPct}%</span></div>
                <div>Latency: <span className="font-mono text-cyan-300 font-bold">{n.latencyMs}ms</span></div>
                <div>Risk: <span className={`font-bold ${isCritical ? "text-red-300" : "text-emerald-300"}`}>{n.risk}</span></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
