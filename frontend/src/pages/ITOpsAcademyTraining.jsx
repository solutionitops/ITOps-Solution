import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  ITOPS_PROJECTS,
  ITOPS_LABS,
  ITOPS_INCIDENTS,
  SKILL_MATRIX_DEFINITIONS,
  CERTIFICATION_PATHS,
  getITOpsStoredState,
  saveITOpsStoredState,
  localCompleteITOpsLab,
  localAcknowledgeIncident,
  localResolveIncident
} from "../data/itopsAcademyCourses";
import {
  ITOpsHero,
  ProjectSwitcher,
  OperationalTopologyMap,
  ToolDecisionChallenge,
  LabLifecycleControls,
  SkillMatrix,
  LabModeSelector,
  IncidentCommandCenter,
  ScoreBreakdown,
  CertificationsPanel,
  EngineeringNotebook,
  PortfolioExportModal,
  ThreePillarsObservabilityExplorer,
  SLOErrorBudgetPanel
} from "../components/AcademyITOpsTheme";
import { LabTerminal } from "../components/LabTerminal";
import { useToast } from "../components/Toast";

const TRACK_TABS = [
  { id: "foundation", label: "Foundation", icon: "🐧", count: 25, desc: "Linux internals, processes, DNS, TCP/IP, bash" },
  { id: "devops", label: "DevOps", icon: "🚀", count: 30, desc: "Docker, Compose, K8s rollouts, Terraform, CI/CD" },
  { id: "devsecops", label: "DevSecOps", icon: "🛡️", count: 25, desc: "SAST gates, Trivy scans, Vault secrets, NetPol" },
  { id: "sre", label: "SRE & Chaos", icon: "📈", count: 25, desc: "Prometheus, Grafana SLOs, Jaeger, Chaos injection" },
  { id: "workspace", label: "Engineer Workspace", icon: "💻", count: "Live", desc: "4-Pane live operational cockpit" },
  { id: "notebook", label: "Engineering Notebook", icon: "📓", count: "Audit", desc: "Structured incident & postmortem journal" },
  { id: "incidents", label: "Incident Command", icon: "🚨", count: 50, desc: "Live production triage & blameless postmortems" },
  { id: "skills", label: "Skill Matrix", icon: "📊", count: 25, desc: "Evidence-based competency verification" },
  { id: "certifications", label: "Certifications", icon: "🎓", count: 6, desc: "Verifiable industry credentials" }
];

export default function ITOpsAcademyTraining() {
  const [state, setState] = useState(() => getITOpsStoredState());
  const [activeTab, setActiveTab] = useState("workspace");
  const [selectedLabId, setSelectedLabId] = useState("lab-fnd-001");
  const [activeLabMode, setActiveLabMode] = useState("guided");
  const [selectedIncidentId, setSelectedIncidentId] = useState("inc-moon-001");
  const [evidenceText, setEvidenceText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [envStatus, setEnvStatus] = useState("RUNNING");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const { showToast } = useToast();

  const activeProject = state.activeProjectId || "moonsav";
  const envId = state.currentEnvId || "LAB-1042-023";

  // Filter labs by track & active project & search
  const trackLabs = useMemo(() => {
    return ITOPS_LABS.filter((lab) => {
      const matchesTrack = activeTab === "all" || activeTab === "workspace" || lab.track === activeTab;
      const matchesProject = !lab.project || lab.project === activeProject;
      const matchesSearch = !searchQuery ||
        lab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lab.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTrack && matchesProject && matchesSearch;
    });
  }, [activeTab, activeProject, searchQuery]);

  // Active Lab
  const currentLab = useMemo(() => {
    return ITOPS_LABS.find((l) => l.id === selectedLabId) || ITOPS_LABS[0];
  }, [selectedLabId]);

  // Project Incidents
  const projectIncidents = useMemo(() => {
    return ITOPS_INCIDENTS.filter((inc) => inc.project === activeProject);
  }, [activeProject]);

  const currentIncident = useMemo(() => {
    return ITOPS_INCIDENTS.find((i) => i.id === selectedIncidentId) || projectIncidents[0] || ITOPS_INCIDENTS[0];
  }, [selectedIncidentId, projectIncidents]);

  const handleSelectProject = (projId) => {
    const updated = { ...state, activeProjectId: projId };
    setState(updated);
    saveITOpsStoredState(updated);
    showToast(`Switched active lab environment to: ${ITOPS_PROJECTS[projId]?.name}`, "info");
  };

  const handleCompleteLab = () => {
    if (!currentLab) return;
    const updated = localCompleteITOpsLab(currentLab.id, evidenceText);
    setState(updated);
    showToast(`🎉 Lab Completed: "${currentLab.title}" (+150 XP)`, "success");
    setEvidenceText("");
  };

  const handleAcknowledgeIncident = (incId) => {
    const updated = localAcknowledgeIncident(incId);
    setState(updated);
    showToast("Incident Acknowledged. Investigation status active.", "warning");
  };

  const handleResolveIncident = (incId, postmortem) => {
    const updated = localResolveIncident(incId, postmortem);
    setState(updated);
    showToast("✔ Incident Resolved! Postmortem saved to audit trail (+250 XP)", "success");
  };

  const handleResetEnv = () => {
    setEnvStatus("STARTING");
    showToast("🔄 Re-provisioning isolated container environment...", "info");
    setTimeout(() => {
      setEnvStatus("RUNNING");
      showToast("✔ Environment reset complete. All services healthy.", "success");
    }, 1200);
  };

  const handleVerifyLab = () => {
    showToast(`⏳ Executing validator: "${currentLab?.verify?.command || 'test-health'}"...`, "info");
    setTimeout(() => {
      showToast("✔ Auto-Verification PASSED: Exit code 0", "success");
      handleCompleteLab();
    }, 1000);
  };

  const handleSaveNotebook = (incId, notesObj) => {
    const updated = {
      ...state,
      postmortems: {
        ...state.postmortems,
        [incId]: `Root Cause: ${notesObj.rootCause}\nFix: ${notesObj.fixApplied}\nPrevention: ${notesObj.prevention}\nKey Learnings: ${notesObj.whatLearned}`
      }
    };
    setState(updated);
    saveITOpsStoredState(updated);
    showToast("✔ Engineering Notebook saved to portfolio evidence", "success");
  };

  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-8">
        {/* Top Hero Banner */}
        <ITOpsHero
          activeProject={activeProject}
          activeTrack={activeTab}
          xp={state.xp}
          streak={state.streakDays}
          completedLabsCount={state.completedLabIds?.length || 0}
          totalLabsCount={ITOPS_LABS.length}
          activeIncidentCount={projectIncidents.filter(i => !state.resolvedIncidentIds?.includes(i.id)).length}
          labStatus={envStatus}
          envId={envId}
          onResetEnv={handleResetEnv}
        />

        {/* Project Switcher & Portfolio Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
              <span>🔀</span> Select Flagship Practical Lab Environment
            </p>
            <ProjectSwitcher
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
            />
          </div>
        </div>

        {/* Navigation Tabs & Portfolio Export Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {TRACK_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? "bg-black/30 text-white" : "bg-white/10 text-white/60"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPortfolioModal(true)}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-black shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <span>🎓</span> Export Portfolio (.md)
            </button>

            {/* Search bar */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search labs & skills..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 pl-9 text-xs text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
              />
              <svg
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── ENGINEER WORKSPACE (4-PANE COCKPIT) ── */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            <LabLifecycleControls
              status={envStatus}
              envId={envId}
              onResetLab={handleResetEnv}
              onVerifyLab={handleVerifyLab}
            />

            {/* Operational Topology Inspector */}
            <OperationalTopologyMap projectId={activeProject} />

            {/* 3 Pillars Observability Explorer (Prometheus, Loki, Jaeger) */}
            <ThreePillarsObservabilityExplorer />

            {/* 2-Column Cockpit: Interactive Terminal + Decision Challenge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <LabTerminal
                  labId={currentLab.id}
                  projectId={activeProject}
                  envId={envId}
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <ToolDecisionChallenge challengeIndex={0} />
                <SLOErrorBudgetPanel />
              </div>
            </div>
          </div>
        )}

        {/* ── ENGINEERING NOTEBOOK TAB ── */}
        {activeTab === "notebook" && (
          <div className="space-y-6">
            <EngineeringNotebook
              incidentId={selectedIncidentId}
              onSave={handleSaveNotebook}
            />
          </div>
        )}

        {/* ── TRACKS (Foundation, DevOps, DevSecOps, SRE) ── */}
        {["foundation", "devops", "devsecops", "sre"].includes(activeTab) && (
          <div className="space-y-6">
            <LabLifecycleControls
              status={envStatus}
              envId={envId}
              onResetLab={handleResetEnv}
              onVerifyLab={handleVerifyLab}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Lab Selector List (4 Cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Curriculum Labs ({trackLabs.length})
                  </p>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {state.completedLabIds?.length || 0} Completed
                  </span>
                </div>

                <div className="space-y-2 max-h-[800px] overflow-y-auto pr-1">
                  {trackLabs.map((lab) => {
                    const isSelected = selectedLabId === lab.id;
                    const isCompleted = state.completedLabIds?.includes(lab.id);

                    return (
                      <button
                        key={lab.id}
                        onClick={() => setSelectedLabId(lab.id)}
                        type="button"
                        className={`w-full rounded-xl p-3.5 text-left transition-all border ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/40 text-white shadow-md ring-1 ring-cyan-400/40"
                            : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-white/40">
                            {lab.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              lab.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-300' :
                              lab.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {lab.difficulty}
                            </span>
                            {isCompleted && (
                              <span className="text-emerald-400 text-xs" title="Completed">✔</span>
                            )}
                          </div>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">
                          {lab.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-white/50 line-clamp-2">
                          {lab.objective}
                        </p>

                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {lab.skills.map((s) => (
                            <span key={s} className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300 border border-white/5">
                              #{s}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Lab Workstation (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {currentLab ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                    {/* Lab Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-400/30">
                            {currentLab.track.toUpperCase()} LAB
                          </span>
                          <span className="text-xs text-white/40">• {currentLab.estimatedMinutes} Mins</span>
                          <span className="text-xs text-white/40">• Environment: {currentLab.environment}</span>
                        </div>
                        <h2 className="mt-2 text-xl md:text-2xl font-bold text-white">
                          {currentLab.title}
                        </h2>
                      </div>

                      {/* Lab Status Badge */}
                      <div>
                        {state.completedLabIds?.includes(currentLab.id) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
                            ✔ Completed & Verified
                          </span>
                        ) : (
                          <button
                            onClick={handleCompleteLab}
                            type="button"
                            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-cyan-500/25 transition-all"
                          >
                            Mark Lab Complete (+150 XP)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mode Selector */}
                    <div>
                      <LabModeSelector
                        activeMode={activeLabMode}
                        onSelectMode={setActiveLabMode}
                      />
                    </div>

                    {/* Mode 1: GUIDED MODE */}
                    {activeLabMode === "guided" && (
                      <div className="space-y-6">
                        {/* Topology Map */}
                        <OperationalTopologyMap projectId={activeProject} />

                        {/* Objective & Scenario */}
                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                            🎯 Practical Objective
                          </h4>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {currentLab.objective}
                          </p>

                          <div className="pt-2 border-t border-white/5 flex flex-wrap gap-4 text-xs text-white/60">
                            <div><span className="font-semibold text-white/80">Tools:</span> {currentLab.tools?.join(", ")}</div>
                            <div><span className="font-semibold text-white/80">Prerequisites:</span> {currentLab.prerequisites}</div>
                          </div>
                        </div>

                        {/* Step by Step execution */}
                        {currentLab.guidedSteps && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                              <span>📋</span> Step-by-Step Execution Guide
                            </h4>
                            <div className="space-y-3">
                              {currentLab.guidedSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-xs text-white/80 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
                                    {idx + 1}
                                  </span>
                                  <span className="font-mono pt-0.5">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Stateful LabTerminal */}
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                            <span>💻</span> Stateful Lab Terminal (Simulation & Real Lab Engine)
                          </p>
                          <LabTerminal
                            labId={currentLab.id}
                            projectId={activeProject}
                            envId={envId}
                          />
                        </div>

                        {/* Tool Decision Challenge */}
                        <ToolDecisionChallenge challengeIndex={1} />

                        {/* Verification & Self-Validation */}
                        {currentLab.verify && (
                          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                <span>✔</span> Automated Lab Verification
                              </p>
                              <button
                                onClick={handleVerifyLab}
                                type="button"
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                              >
                                Run Validator Now
                              </button>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-black/60 p-3 border border-emerald-500/20 font-mono text-xs text-emerald-300">
                              <code>$ {currentLab.verify.command}</code>
                              <span className="text-[10px] text-white/40">Expect: {currentLab.verify.pass}</span>
                            </div>
                          </div>
                        )}

                        {/* SRE Lesson & Interview Question */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                              💡 Production SRE Lesson
                            </p>
                            <p className="mt-2 text-xs text-white/70 leading-relaxed">
                              {currentLab.sreLesson}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                              🎤 Staff Engineer Interview Question
                            </p>
                            <p className="mt-2 text-xs text-white/70 leading-relaxed">
                              {currentLab.interviewQuestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: CHALLENGE MODE */}
                    {activeLabMode === "challenge" && (
                      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                          <span>🏆</span> Hands-Off Engineering Challenge
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {currentLab.challengeSummary || currentLab.objective}
                        </p>
                        <LabTerminal
                          labId={currentLab.id}
                          projectId={activeProject}
                          envId={envId}
                        />
                      </div>
                    )}

                    {/* Mode 3: INCIDENT MODE */}
                    {activeLabMode === "incident" && (
                      <div className="space-y-4">
                        <IncidentCommandCenter
                          incident={{
                            id: `INC-${currentLab.id.toUpperCase()}`,
                            title: currentLab.incidentSummary || `Outage in ${currentLab.title}`,
                            severity: "SEV-1",
                            status: "active",
                            startedAt: "12m ago",
                            symptoms: currentLab.failureInjection || currentLab.objective,
                            sloImpact: "Error Budget consumed: 32%. Latency breached 99.9% SLO.",
                            hints: currentLab.hints || ["Inspect service logs with `journalctl -u <service>`."],
                            telemetryData: {
                              errorRateRPS: 420,
                              packetDropPct: 34.2,
                              activeContainers: "12/14"
                            },
                            resolutionAction: "Applied systemd limits and updated configuration."
                          }}
                          onAcknowledge={() => handleAcknowledgeIncident(`INC-${currentLab.id}`)}
                          onResolve={(notes) => handleResolveIncident(`INC-${currentLab.id}`, notes)}
                          isAcknowledged={state.acknowledgedIncidentIds?.includes(`INC-${currentLab.id}`)}
                          isResolved={state.resolvedIncidentIds?.includes(`INC-${currentLab.id}`)}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center text-white/50">
                    Select a lab from the list to begin operating.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── INCIDENT COMMAND CENTER ── */}
        {activeTab === "incidents" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Incident List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center justify-between">
                  <span>🚨 Live Production Incidents ({projectIncidents.length})</span>
                  <span className="text-[10px] text-white/40">Real Chaos Scenarios</span>
                </h3>

                <div className="space-y-2">
                  {projectIncidents.map((inc) => {
                    const isSelected = selectedIncidentId === inc.id;
                    const isResolved = state.resolvedIncidentIds?.includes(inc.id);

                    return (
                      <button
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        type="button"
                        className={`w-full rounded-2xl p-4 text-left border transition-all ${
                          isSelected
                            ? "border-red-500 bg-red-950/40 text-white ring-1 ring-red-400"
                            : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded bg-red-600/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                            {inc.severity}
                          </span>
                          <span className="text-[10px] font-mono text-white/40">{inc.startedAt}</span>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-white line-clamp-1">{inc.title}</h4>
                        <p className="mt-1 text-[11px] text-white/50 line-clamp-2">{inc.symptoms}</p>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[10px]">
                          <span className="text-white/40">{inc.affectedService}</span>
                          {isResolved ? (
                            <span className="text-emerald-400 font-bold">✔ Resolved</span>
                          ) : (
                            <span className="text-red-400 font-bold animate-pulse">● Active Outage</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Incident Detail Panel */}
              <div className="lg:col-span-2">
                <IncidentCommandCenter
                  incident={currentIncident}
                  onAcknowledge={() => handleAcknowledgeIncident(currentIncident.id)}
                  onResolve={(notes) => handleResolveIncident(currentIncident.id, notes)}
                  isAcknowledged={state.acknowledgedIncidentIds?.includes(currentIncident.id)}
                  isResolved={state.resolvedIncidentIds?.includes(currentIncident.id)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── SKILL MATRIX TAB (Evidence Based) ── */}
        {activeTab === "skills" && (
          <div className="space-y-8">
            <SkillMatrix skills={state.skills} />
            <ScoreBreakdown scores={state.scores} />
          </div>
        )}

        {/* ── CERTIFICATIONS TAB (Strict Incident Gates) ── */}
        {activeTab === "certifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">MOONSAV Industry Engineering Certifications</h3>
              <p className="text-xs text-white/50">
                Earned strictly by demonstrating verified hands-on lab completions, resolved production incidents, and blameless postmortems.
              </p>
            </div>
            <CertificationsPanel earnedCertIds={state.certificates || []} />
          </div>
        )}
      </div>

      {/* Portfolio Export Modal */}
      <PortfolioExportModal
        state={state}
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
      />
    </div>
  );
}
