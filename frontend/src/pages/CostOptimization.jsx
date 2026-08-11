import { useState } from "react";
import { useToast } from "../components/Toast";

const SAVINGS = [
  { id: 1, category: "Unused Compute", title: "Unused EC2 Instance (t3.xlarge in ap-southeast-1)", currentCost: 120, potentialSavings: 120, action: "Terminate idle instance" },
  { id: 2, category: "Oversized Database", title: "Oversized RDS PostgreSQL Primary (db.m5.2xlarge -> db.m5.large)", currentCost: 350, potentialSavings: 150, action: "Downsize DB instance class" },
  { id: 3, category: "Unattached Storage", title: "Unattached EBS Volumes (350GB unused snapshots)", currentCost: 50, potentialSavings: 50, action: "Purge unattached EBS volumes" },
];

export default function CostOptimization() {
  const [applied, setApplied] = useState([]);
  const toast = useToast();

  const handleApply = (id, title) => {
    setApplied(prev => [...prev, id]);
    toast.success(`Applied Cost Optimization: ${title}`);
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Cloud Cost Optimization Intelligence</h1>
        <p className="mt-1 text-xs text-white/50">Identify unused cloud resources, oversized databases, & unattached storage savings</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <span className="text-[10px] font-bold uppercase text-white/40">CURRENT MONTHLY SPEND</span>
          <p className="mt-1 text-3xl font-bold text-white">$850 / mo</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5">
          <span className="text-[10px] font-bold uppercase text-emerald-300">POTENTIAL MONTHLY SAVINGS</span>
          <p className="mt-1 text-3xl font-bold text-emerald-300">$320 / mo</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <span className="text-[10px] font-bold uppercase text-white/40">EFFICIENCY SCORE</span>
          <p className="mt-1 text-3xl font-bold text-cyan-300">62%</p>
        </div>
      </div>

      <div className="space-y-3">
        {SAVINGS.map(s => {
          const isDone = applied.includes(s.id);

          return (
            <div key={s.id} className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/70">{s.category}</span>
                <h3 className="mt-1 text-sm font-bold text-white">{s.title}</h3>
                <p className="mt-0.5 text-xs text-white/50">Current Spend: ${s.currentCost}/mo → <span className="text-emerald-300 font-bold">Save ${s.potentialSavings}/mo</span></p>
              </div>

              <button
                onClick={() => handleApply(s.id, s.title)}
                disabled={isDone}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 disabled:opacity-40"
              >
                {isDone ? "Applied ✓" : `Apply: ${s.action}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
