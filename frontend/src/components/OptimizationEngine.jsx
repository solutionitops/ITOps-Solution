import { useState } from "react";
import { motion } from "motion/react";
import { useToast } from "./Toast";

const OPTIMIZATION_ITEMS = [
  { id: 1, title: "Enable Cloudflare Brotli & CDN Edge Cache", category: "CDN", gainPct: 40, desc: "Compress dynamic payloads & cache static assets at 300+ edge locations." },
  { id: 2, title: "Convert JPG/PNG Images to WebP & Enable Lazy Loading", category: "Images", gainPct: 30, desc: "Reduce total image payload from 4.8MB to 1.2MB." },
  { id: 3, title: "Database Query Index Tuning", category: "Database", gainPct: 20, desc: "Add composite index on user_id, status columns for slow joins." },
  { id: 4, title: "Inject Security Headers & Enable HSTS", category: "Security", gainPct: 15, desc: "Add CSP, Strict-Transport-Security, X-Frame-Options." },
];

export function OptimizationEngine({ autonomyMode = "assisted", onAutonomyChange }) {
  const [mode, setMode] = useState(autonomyMode);
  const [appliedItems, setAppliedItems] = useState([]);
  const toast = useToast();

  const handleModeSelect = (m) => {
    setMode(m);
    if (onAutonomyChange) onAutonomyChange(m);
    toast.success(`Optimization mode updated to: ${m.toUpperCase()}`);
  };

  const handleApplyAll = () => {
    setAppliedItems([1, 2, 3, 4]);
    toast.success("Applied all 4 performance optimizations! Total expected gain: 65%");
  };

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white light:text-slate-900">Performance Optimization Marketplace</h3>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">AI-curated optimization recommendations with expected % gains</p>
        </div>

        <button
          type="button"
          onClick={handleApplyAll}
          className="rounded-xl bg-white text-black light:bg-slate-900 light:text-white px-4 py-2 text-xs font-bold transition-colors hover:bg-neutral-200"
        >
          🚀 Apply All Optimizations
        </button>
      </div>

      {/* Autonomy Level Control */}
      <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-3 space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">Optimization Autonomy Level</span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: "manual", label: "Manual", desc: "Only recommendations provided." },
            { key: "assisted", label: "Assisted", desc: "AI proposes, human approves with 1-click." },
            { key: "autonomous", label: "Autonomous", desc: "AI fixes automatically during maintenance." }
          ].map(m => {
            const active = mode === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => handleModeSelect(m.key)}
                className={`rounded-lg border p-2.5 text-left transition-colors ${
                  active ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{m.label}</span>
                  {active && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                </div>
                <p className="mt-1 text-[10px] text-white/40">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog items */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIMIZATION_ITEMS.map(item => {
          const isApplied = appliedItems.includes(item.id);

          return (
            <div key={item.id} className="rounded-xl border border-white/10 light:border-slate-900/10 bg-black/30 light:bg-white p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">{item.category}</span>
                  <span className="text-xs font-bold text-emerald-300">+{item.gainPct}% faster</span>
                </div>
                <h4 className="mt-2 text-xs font-semibold text-white light:text-slate-900">{item.title}</h4>
                <p className="mt-1 text-[11px] text-white/45 light:text-slate-500">{item.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 light:border-slate-900/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAppliedItems(prev => [...prev, item.id]);
                    toast.success(`Applied: ${item.title}`);
                  }}
                  disabled={isApplied}
                  className="rounded-lg bg-white/10 light:bg-slate-900/10 px-3 py-1 text-xs font-medium text-white light:text-slate-900 hover:bg-white/20 disabled:opacity-40"
                >
                  {isApplied ? "Applied ✓" : "Apply Fix"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
