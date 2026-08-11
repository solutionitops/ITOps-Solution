import { useState } from "react";
import { useToast } from "./Toast";

const RUNBOOK_STEPS = [
  { step: 1, action: "Check process status (nginx / worker pool)", status: "done" },
  { step: 2, action: "Execute grace restart of service worker", status: "running" },
  { step: 3, action: "Validate TCP port 80 / 443 listeners", status: "pending" },
  { step: 4, action: "Verify website HTTP status 200 OK", status: "pending" },
  { step: 5, action: "Auto-close incident INC-10234", status: "pending" },
];

export function AIRunbookAutomation() {
  const [steps, setSteps] = useState(RUNBOOK_STEPS);
  const [executing, setExecuting] = useState(false);
  const toast = useToast();

  const runRunbook = () => {
    setExecuting(true);
    toast.success("AI Runbook execution started for INC-10234");

    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => i <= 1 ? { ...s, status: "done" } : i === 2 ? { ...s, status: "running" } : s));
    }, 1200);

    setTimeout(() => {
      setSteps(prev => prev.map((s, i) => i <= 3 ? { ...s, status: "done" } : i === 4 ? { ...s, status: "running" } : s));
    }, 2500);

    setTimeout(() => {
      setSteps(prev => prev.map(s => ({ ...s, status: "done" })));
      setExecuting(false);
      toast.success("AI Runbook executed successfully in 45 seconds. Incident resolved.");
    }, 3800);
  };

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-400/20 text-emerald-300">📜</span>
            <h3 className="text-sm font-semibold text-white light:text-slate-900">AI Runbook Automation</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Executable runbook sequence for Nginx / Server downtime</p>
        </div>

        <button
          type="button"
          onClick={runRunbook}
          disabled={executing}
          className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 transition-colors disabled:opacity-40"
        >
          {executing ? "Executing Runbook..." : "▶ Execute Runbook"}
        </button>
      </div>

      <div className="space-y-2">
        {steps.map(s => (
          <div key={s.step} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3 text-xs">
            <div className="flex items-center gap-3">
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${
                s.status === "done" ? "bg-emerald-400 text-black" : s.status === "running" ? "bg-amber-400 text-black animate-pulse" : "bg-white/10 text-white/40"
              }`}>
                {s.status === "done" ? "✓" : s.step}
              </span>
              <span className={s.status === "done" ? "text-emerald-300 font-medium" : "text-white"}>{s.action}</span>
            </div>

            <span className="text-[10px] uppercase font-bold text-white/40">{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
