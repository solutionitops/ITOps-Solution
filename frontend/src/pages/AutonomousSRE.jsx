import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitors, fetchMonitorHistory } from "../api/endpoints";
import { PerformanceIntelligence } from "../components/PerformanceIntelligence";
import { ApplicationDigitalTwin } from "../components/ApplicationDigitalTwin";
import { ChangeIntelligence } from "../components/ChangeIntelligence";
import { AIRunbookAutomation } from "../components/AIRunbookAutomation";
import { PredictiveFailure } from "../components/PredictiveFailure";
import { SelfHealing } from "../components/SelfHealing";
import { WebsiteIntelligence } from "../components/WebsiteIntelligence";
import { Skeleton } from "../components/Skeleton";
import { StatusBadge } from "../components/StatusBadge";

export default function AutonomousSRE() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  const monitorsQuery = useQuery({ queryKey: ["monitors"], queryFn: fetchMonitors });
  const monitors = monitorsQuery.data || [];

  const paramMonitorId = searchParams.get("monitorId");
  const selectedMonitorId = paramMonitorId || (monitors[0]?.id ?? "");

  const selectedMonitor = useMemo(() => {
    return monitors.find(m => m.id === selectedMonitorId) || monitors[0] || {
      id: "demo-1",
      name: "Production Gateway API",
      url: "https://api.company.com",
      lastStatus: "UP"
    };
  }, [monitors, selectedMonitorId]);

  const historyQuery = useQuery({
    queryKey: ["monitor-history", selectedMonitor.id],
    queryFn: () => fetchMonitorHistory(selectedMonitor.id),
    enabled: !!selectedMonitor.id
  });
  const history = historyQuery.data || [];

  const handleSelectMonitor = (id) => {
    setSearchParams({ monitorId: id });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl border border-white/10 light:border-slate-900/10 bg-gradient-to-r from-purple-900/40 via-neutral-900/60 to-cyan-900/40 light:bg-white p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
              <span>🧠</span> AI-Powered Autonomous Reliability Platform
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white light:text-slate-900 md:text-3xl">
              AI SRE Autonomous Performance & Healing Engine
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60 light:text-slate-600">
              Autonomous loop watching infrastructure 24/7: <span className="font-semibold text-cyan-300">Monitor → Detect → Understand → Find Root Cause → Decide Fix → Apply Fix Automatically → Verify → Rollback → Learn</span>.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-emerald-400/20 px-4 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
              ● Autonomous Engine Active
            </span>
            <span className="text-xs text-white/40">Mode: Autonomous SRE</span>
          </div>
        </div>

        {/* Target Website Selector Bar */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Target Website:</span>
            {monitors.length > 0 ? (
              <select
                value={selectedMonitor.id}
                onChange={(e) => handleSelectMonitor(e.target.value)}
                className="rounded-xl border border-white/20 bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                {monitors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.url})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-white">{selectedMonitor.name} ({selectedMonitor.url})</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <StatusBadge status={selectedMonitor.lastStatus || "UP"} />
            <span className="text-white/50 truncate max-w-xs">{selectedMonitor.url}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {[
            { id: "overview", label: "AI Performance Engine", icon: "⚡" },
            { id: "digital-twin", label: "Digital Twin Topology", icon: "🗺️" },
            { id: "change-intel", label: "Change Intelligence", icon: "📦" },
            { id: "runbooks", label: "AI Runbook Automation", icon: "📜" },
            { id: "predictive", label: "Predictive Failure System", icon: "🔮" },
            { id: "self-healing", label: "Host Self-Healing", icon: "♥" },
            { id: "fleet", label: "Website Intelligence Fleet", icon: "🌐" },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black light:bg-slate-900 light:text-white shadow-lg"
                  : "border border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {monitorsQuery.isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="space-y-6">
          {activeTab === "overview" && <PerformanceIntelligence monitor={selectedMonitor} history={history} />}
          {activeTab === "digital-twin" && <ApplicationDigitalTwin monitor={selectedMonitor} isDegraded={true} />}
          {activeTab === "change-intel" && <ChangeIntelligence monitor={selectedMonitor} />}
          {activeTab === "runbooks" && <AIRunbookAutomation />}
          {activeTab === "predictive" && <PredictiveFailure />}
          {activeTab === "self-healing" && <SelfHealing canManage={true} />}
          {activeTab === "fleet" && <WebsiteIntelligence monitors={monitors} />}
        </div>
      )}
    </div>
  );
}
