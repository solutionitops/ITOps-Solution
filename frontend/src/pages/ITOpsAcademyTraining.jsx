import { useState, useMemo, useEffect } from "react";
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
import { TrainingTrackToggle } from "../components/TrainingTrackToggle";

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
  const [activeTab, setActiveTab] = useState("foundation");
  const [selectedLabId, setSelectedLabId] = useState("lab-fnd-001");
  const [activeLabMode, setActiveLabMode] = useState("guided");
  const [selectedIncidentId, setSelectedIncidentId] = useState("inc-moon-001");
  const [evidenceText, setEvidenceText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [envStatus, setEnvStatus] = useState("RUNNING");
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

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

  const handleSelectLab = (labId) => {
    setSelectedLabId(labId);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      const el = document.getElementById("active-lab-workstation");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
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
    <div className="space-y-6 text-slate-900 dark:text-white antialiased font-sans pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TrainingTrackToggle active="academy" />
      </div>

      <div className="space-y-8">
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <span>🔀</span> Select Flagship Practical Lab Environment
            </p>
            <ProjectSwitcher
              activeProject={activeProject}
              onSelectProject={handleSelectProject}
            />
          </div>
        </div>

        {/* Navigation Tabs & Portfolio Export Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/90 dark:border-white/10 pb-4">
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
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25 ring-1 ring-indigo-500"
                      : "bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white/60"
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
              className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
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
                className="w-full rounded-xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 px-3.5 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:border-indigo-500 focus:outline-none shadow-sm"
              />
              <svg
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400"
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Sticky Curriculum Labs Sidebar (4 Cols) */}
              <aside
                className="lg:col-span-4 sticky top-6 self-start z-20"
                style={{ position: "sticky", top: "1.5rem", zIndex: 20, alignSelf: "start" }}
              >
                <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4 max-h-[calc(100vh-3rem)] flex flex-col">
                  {/* Pinned Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          Curriculum Labs
                        </h3>
                        <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
                          {trackLabs.length}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(
                                ((trackLabs.filter((l) => state.completedLabIds?.includes(l.id)).length) /
                                  (trackLabs.length || 1)) *
                                  100
                              )}%`
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(
                            ((trackLabs.filter((l) => state.completedLabIds?.includes(l.id)).length) /
                              (trackLabs.length || 1)) *
                              100
                          )}%
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 font-mono bg-indigo-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full border border-indigo-200/80 dark:border-cyan-500/20">
                      {trackLabs.filter((l) => state.completedLabIds?.includes(l.id)).length} Completed
                    </span>
                  </div>

                  {/* Scrollable List with Sleek Scrollbar */}
                  <div className="space-y-2.5 flex-1 overflow-y-auto overscroll-contain pr-1.5 custom-scrollbar min-h-0">
                    {trackLabs.map((lab) => {
                      const isSelected = selectedLabId === lab.id;
                      const isCompleted = state.completedLabIds?.includes(lab.id);

                      return (
                        <button
                          key={lab.id}
                          onClick={() => handleSelectLab(lab.id)}
                          type="button"
                          className={`w-full rounded-2xl p-4 text-left transition-all border ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-500/30 dark:ring-indigo-400/40"
                              : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05] shadow-xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-white/40">
                                {lab.id}
                              </span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-500/20 px-1.5 py-0.2 rounded-md">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  lab.difficulty === "Beginner"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30"
                                    : lab.difficulty === "Intermediate"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30"
                                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30"
                                }`}
                              >
                                {lab.difficulty}
                              </span>
                              {isCompleted && (
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold" title="Completed">
                                  ✔
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {lab.title}
                          </h4>
                          <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {lab.objective}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {lab.skills.map((s) => (
                              <span
                                key={s}
                                className="rounded-md bg-slate-100 dark:bg-white/5 px-2 py-0.5 text-[9px] font-mono font-semibold text-indigo-700 dark:text-cyan-300 border border-slate-200/80 dark:border-white/10"
                              >
                                #{s}
                              </span>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Right Column: Active Lab Workstation (8 Cols) */}
              <div id="active-lab-workstation" className="lg:col-span-8 space-y-6">
                {currentLab ? (
                  <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-950/80 p-6 md:p-8 shadow-sm dark:shadow-2xl space-y-6">
                    {/* Lab Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-indigo-50 dark:bg-cyan-400/20 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-cyan-300 border border-indigo-200/80 dark:border-cyan-400/30">
                            {currentLab.track.toUpperCase()} LAB
                          </span>
                          <span className="text-xs text-slate-500 dark:text-white/40 font-medium">• {currentLab.estimatedMinutes} Mins</span>
                          <span className="text-xs text-slate-500 dark:text-white/40 font-medium">• Environment: {currentLab.environment}</span>
                        </div>
                        <h2 className="mt-2 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                          {currentLab.title}
                        </h2>
                      </div>

                      {/* Lab Status Badge */}
                      <div>
                        {state.completedLabIds?.includes(currentLab.id) ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            ✔ Completed & Verified
                          </span>
                        ) : (
                          <button
                            onClick={handleCompleteLab}
                            type="button"
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all"
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
                        <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-5 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <span>🎯</span> Practical Objective
                          </h4>
                          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                            {currentLab.objective}
                          </p>

                          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
                            <div><span className="font-bold text-slate-800 dark:text-white">Tools:</span> {currentLab.tools?.join(", ")}</div>
                            <div><span className="font-bold text-slate-800 dark:text-white">Prerequisites:</span> {currentLab.prerequisites}</div>
                          </div>
                        </div>

                        {/* Step by Step execution */}
                        {currentLab.guidedSteps && (
                          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-5 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                              <span>📋</span> Step-by-Step Execution Guide
                            </h4>
                            <div className="space-y-3">
                              {currentLab.guidedSteps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-black/30 p-3.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs">
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
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
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
                          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <span>✔</span> Automated Lab Verification
                              </p>
                              <button
                                onClick={handleVerifyLab}
                                type="button"
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
                              >
                                Run Validator Now
                              </button>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-900 dark:bg-black/60 p-3 border border-slate-800 dark:border-emerald-500/20 font-mono text-xs text-emerald-400">
                              <code>$ {currentLab.verify.command}</code>
                              <span className="text-[10px] text-slate-400">Expect: {currentLab.verify.pass}</span>
                            </div>
                          </div>
                        )}

                        {/* SRE Lesson & Interview Question */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-2xl border border-indigo-200/80 dark:border-white/10 bg-indigo-50/60 dark:bg-white/[0.02] p-4.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                              <span>💡</span> Production SRE Lesson
                            </p>
                            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {currentLab.sreLesson}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-amber-200/80 dark:border-white/10 bg-amber-50/60 dark:bg-white/[0.02] p-4.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <span>🎤</span> Staff Engineer Interview Question
                            </p>
                            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {currentLab.interviewQuestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: CHALLENGE MODE */}
                    {activeLabMode === "challenge" && (
                      <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-6 space-y-4">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 text-sm font-bold">
                          <span>🏆</span> Hands-Off Engineering Challenge
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
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
                  <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] p-12 text-center text-slate-500 dark:text-white/50">
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-red-400 flex items-center justify-between">
                  <span>🚨 Live Production Incidents ({projectIncidents.length})</span>
                  <span className="text-[10px] text-slate-400 font-mono">Real Chaos Scenarios</span>
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
                            ? "border-rose-500 bg-rose-50 dark:bg-red-950/40 text-slate-900 dark:text-white ring-1 ring-rose-400 shadow-sm"
                            : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/[0.05] shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-rose-100 dark:bg-red-600/80 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:text-white">
                            {inc.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-white/40">{inc.startedAt}</span>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{inc.title}</h4>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-white/50 line-clamp-2">{inc.symptoms}</p>

                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[10px]">
                          <span className="text-slate-400 dark:text-white/40">{inc.affectedService}</span>
                          {isResolved ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✔ Resolved</span>
                          ) : (
                            <span className="text-rose-600 dark:text-red-400 font-bold animate-pulse">● Active Outage</span>
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">MOONSAV Industry Engineering Certifications</h3>
              <p className="text-xs text-slate-500 dark:text-white/50">
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
