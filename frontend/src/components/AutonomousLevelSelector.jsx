import { useState } from "react";
import { useToast } from "./Toast";

const ACTION_LEVELS = [
  { level: 0, label: "Level 0: Observe Only", desc: "Telemetry collection only. No recommendations or fixes." },
  { level: 1, label: "Level 1: Recommend", desc: "AI generates root cause insights & optimization proposals." },
  { level: 2, label: "Level 2: Human Approval", desc: "AI proposes fixes; requires explicit human click to apply." },
  { level: 3, label: "Level 3: Automatic Fix", desc: "AI applies low-risk fixes automatically with snapshot backups." },
  { level: 4, label: "Level 4: Full Autonomous", desc: "Full SRE self-healing engine watching & resolving 24/7." },
];

export function AutonomousLevelSelector() {
  const [selectedLevel, setSelectedLevel] = useState(2);
  const toast = useToast();

  const handleSelectLevel = (lvl) => {
    setSelectedLevel(lvl);
    toast.success(`Autonomous Action Level updated to: Level ${lvl}`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Autonomous Action Levels (Framework Level 0–4)</h3>
        <p className="mt-0.5 text-xs text-white/45">Configure safety boundary and AI decision autonomy for remediations</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {ACTION_LEVELS.map(l => {
          const active = selectedLevel === l.level;

          return (
            <button
              key={l.level}
              type="button"
              onClick={() => handleSelectLevel(l.level)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300" : "border-white/10 text-white/60 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>L{l.level}</span>
                {active && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
              </div>
              <p className="mt-1 text-[10px] text-white/50">{l.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
