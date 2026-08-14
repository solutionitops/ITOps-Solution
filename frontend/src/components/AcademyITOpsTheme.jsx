import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ITOPS_PROJECTS, SKILL_MATRIX_DEFINITIONS, CERTIFICATION_PATHS, TOOL_DECISION_CHALLENGES } from "../data/itopsAcademyCourses";
import { AnimatedCounter } from "./AnimatedCounter";

const EASE = [0.16, 1, 0.3, 1];

export function ITOpsHero({
  activeProject,
  activeTrack,
  xp = 450,
  streak = 4,
  completedLabsCount = 1,
  totalLabsCount = 100,
  activeIncidentCount = 2,
  labStatus = "RUNNING",
  envId = "LAB-1042-023",
  onResetEnv
}) {
  const project = ITOPS_PROJECTS[activeProject] || ITOPS_PROJECTS.moonsav;
  const progressPct = Math.round((completedLabsCount / totalLabsCount) * 100);

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 p-6 md:p-8 shadow-2xl text-white">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className={`absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl opacity-30 ${activeProject === 'moonsav' ? 'bg-cyan-500' : 'bg-amber-500'}`} />
        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full blur-3xl opacity-20 bg-indigo-500" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Brand + Active Project Info */}
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${project.accent} shadow-lg shadow-cyan-500/20`}
          >
            <span className="text-2xl font-bold font-mono">
              {activeProject === "moonsav" ? "💧" : "🏢"}
            </span>
          </motion.div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-md border border-white/15">
                MOONSAV ITOps ACADEMY
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${activeProject === 'moonsav' ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'}`}>
                {project.badge}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-mono text-blue-300 border border-blue-500/30">
                ENV: {envId}
              </span>
              {activeIncidentCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400 border border-red-500/30 animate-pulse">
                  🚨 {activeIncidentCount} Active Outages
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {project.name}
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/60">
              {project.tagline} — Operate, debug, secure, and scale real production infrastructure.
            </p>
          </div>
        </div>

        {/* Right: Operational Metrics & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* XP Tile */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Total XP</p>
            <p className="text-xl font-bold font-mono text-cyan-300">
              <AnimatedCounter value={xp} />
            </p>
          </div>

          {/* Streak Tile */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Streak</p>
            <p className="text-xl font-bold font-mono text-amber-300">
              🔥 {streak}d
            </p>
          </div>

          {/* Labs Progress */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-md">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Labs Completed</p>
            <p className="text-xl font-bold font-mono text-emerald-300">
              {completedLabsCount} <span className="text-xs font-normal text-white/40">/ {totalLabsCount}</span>
            </p>
          </div>

          {onResetEnv && (
            <button
              onClick={onResetEnv}
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-colors shadow-sm"
              title="Reset current containerized lab environment"
            >
              🔄 Reset Lab Env
            </button>
          )}
        </div>
      </div>

      {/* Environment Health Status Row */}
      <div className="mt-6 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-white/80">Containers: 14/14 Up</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-white/80">K8s Cluster: Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-white/80">Prometheus: Scraping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-mono text-white/80">SLO: 99.92% (Budget: 64%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/40">Curriculum Progress:</span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="font-mono font-bold text-cyan-300">{progressPct}%</span>
        </div>
      </div>
    </div>
  );
}

export function ProjectSwitcher({ activeProject, onSelectProject }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(ITOPS_PROJECTS).map((proj) => {
        const isSelected = activeProject === proj.id;
        return (
          <button
            key={proj.id}
            type="button"
            onClick={() => onSelectProject(proj.id)}
            className={`relative flex flex-col p-5 rounded-2xl border text-left transition-all duration-200 ${
              isSelected
                ? `${proj.border} ${proj.bg} shadow-lg shadow-cyan-950/30 ring-2 ring-cyan-400/40`
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white/70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                proj.id === 'moonsav' ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              }`}>
                {proj.badge}
              </span>
              {isSelected && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Active Environment
                </span>
              )}
            </div>

            <h3 className="mt-3 text-lg font-bold text-white flex items-center gap-2">
              <span>{proj.id === 'moonsav' ? '💧' : '🏢'}</span>
              {proj.name}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">
              {proj.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
              {proj.architecture.slice(0, 4).map((comp) => (
                <span key={comp.id} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/70 border border-white/10">
                  {comp.name}
                </span>
              ))}
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/40">
                +{proj.architecture.length - 4} more
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONAL TOPOLOGY MAP (Clickable Interactive Node Inspector)
// ─────────────────────────────────────────────────────────────────────────────

export function OperationalTopologyMap({ projectId = "moonsav" }) {
  const project = ITOPS_PROJECTS[projectId] || ITOPS_PROJECTS.moonsav;
  const [selectedNode, setSelectedNode] = useState(project.architecture[0]);
  const [activeTab, setActiveTab] = useState("metrics"); // 'metrics' | 'logs' | 'config'
  const [restarting, setRestarting] = useState(false);

  const handleRestartNode = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🌐</span> Interactive Operational Topology Map
          </h3>
          <p className="text-xs text-white/40">
            Click any component to inspect live metrics, stream container logs, or execute restart actions.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold">
          ALL NODES ONLINE
        </span>
      </div>

      {/* Nodes Horizontal Flow Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {project.architecture.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              type="button"
              className={`p-3 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? "border-cyan-400 bg-cyan-950/50 shadow-md ring-1 ring-cyan-400"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white/70"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-white/40 uppercase">{node.tech.split(" ")[0]}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-white truncate">{node.name}</p>
              <p className="mt-0.5 text-[10px] text-white/40 truncate">{node.role}</p>
            </button>
          );
        })}
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="rounded-xl border border-cyan-500/30 bg-black/60 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedNode.name}
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                    {selectedNode.tech}
                  </span>
                </h4>
                <p className="text-xs text-white/50">{selectedNode.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-white/5 p-0.5 text-[11px] border border-white/10">
                {["metrics", "logs", "config"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded px-2.5 py-0.5 capitalize transition-colors ${
                      activeTab === tab ? "bg-cyan-500 text-white font-bold" : "text-white/60 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={restarting}
                onClick={handleRestartNode}
                className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
              >
                {restarting ? "Restarting..." : "🔄 Restart"}
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          {activeTab === "metrics" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {Object.entries(selectedNode.metrics || {}).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-white/[0.02] border border-white/5 p-2 text-center">
                  <p className="text-[10px] font-mono text-white/40 uppercase">{k}</p>
                  <p className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="rounded-lg bg-black/80 p-3 font-mono text-xs text-white/80 space-y-1 max-h-36 overflow-y-auto border border-white/5">
              {(selectedNode.logs || []).map((l, i) => (
                <div key={i} className="text-[11px] leading-relaxed text-emerald-400/90">{l}</div>
              ))}
            </div>
          )}

          {activeTab === "config" && (
            <div className="rounded-lg bg-black/80 p-3 font-mono text-xs text-white/80 border border-white/5">
              <pre className="text-[11px] text-cyan-200">
                {JSON.stringify(selectedNode.config || {}, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL DECISION CHALLENGE (Engineering Judgment Prompt)
// ─────────────────────────────────────────────────────────────────────────────

export function ToolDecisionChallenge({ challengeIndex = 0 }) {
  const challenge = TOOL_DECISION_CHALLENGES[challengeIndex] || TOOL_DECISION_CHALLENGES[0];
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-950 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
          <span>🧠</span> Engineering Judgment & Tool Selection Challenge
        </span>
        <span className="text-[10px] font-mono text-white/40">Problem-Driven Decision</span>
      </div>

      <p className="text-xs md:text-sm text-white/90 leading-relaxed font-medium">
        {challenge.scenario}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {challenge.options.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedOption(idx);
                setSubmitted(true);
              }}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                isSelected
                  ? opt.correct
                    ? "border-emerald-400 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-400"
                    : "border-red-400 bg-red-950/40 text-red-200 ring-1 ring-red-400"
                  : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{opt.tool}</span>
                {submitted && isSelected && (
                  <span>{opt.correct ? "✔ Correct" : "✖ Try Again"}</span>
                )}
              </div>
              {submitted && isSelected && (
                <p className="mt-2 text-[11px] leading-relaxed text-white/80 border-t border-white/10 pt-1.5">
                  {opt.rationale}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAB LIFECYCLE CONTROLS (State Machine Transitions)
// ─────────────────────────────────────────────────────────────────────────────

export function LabLifecycleControls({
  status = "RUNNING", // 'LOCKED' | 'AVAILABLE' | 'STARTING' | 'RUNNING' | 'COMPLETED'
  envId = "LAB-1042-023",
  onStartLab,
  onStopLab,
  onResetLab,
  onVerifyLab
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className={`h-3.5 w-3.5 rounded-full ${
          status === 'RUNNING' ? 'bg-emerald-400 animate-pulse' :
          status === 'STARTING' ? 'bg-amber-400 animate-ping' :
          status === 'COMPLETED' ? 'bg-blue-400' : 'bg-red-500'
        }`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Lab State: {status}
            </span>
            <span className="text-[10px] font-mono text-white/40">ID: {envId}</span>
          </div>
          <p className="text-[11px] text-white/50">Isolated environment ready for commands.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onVerifyLab}
          type="button"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-md"
        >
          ✔ Run Auto-Verification
        </button>
        <button
          onClick={onResetLab}
          type="button"
          className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
        >
          🔄 Reset Env
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE-BASED SKILL MATRIX
// ─────────────────────────────────────────────────────────────────────────────

export function SkillMatrix({ skills = {}, compact = false }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const categories = ["All", "Foundation", "DevOps", "DevSecOps", "SRE"];

  const filteredSkills = SKILL_MATRIX_DEFINITIONS.filter(
    (s) => activeCategory === "All" || s.category === activeCategory
  );

  const levelLabels = ["0: Beginner", "1: Guided", "2: Developing", "3: Independent", "4: Troubleshooter", "5: Staff Engineer"];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📊</span> Evidence-Based Competency Skill Matrix
          </h3>
          <p className="text-xs text-white/50">
            Skills are verified through concrete practical demonstrations, not passive quiz completions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              type="button"
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-cyan-500 text-white font-semibold shadow-sm"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Skills */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredSkills.map((skill) => {
          const userLevel = skills[skill.id] || 0;

          return (
            <button
              key={skill.id}
              onClick={() => setSelectedSkill(skill)}
              type="button"
              className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{skill.icon}</span>
                  <span className="text-xs font-semibold text-white/90">{skill.name}</span>
                </div>
                <span className="font-mono text-xs font-bold text-cyan-300">
                  L{userLevel} <span className="text-[10px] font-normal text-white/40">/ 5</span>
                </span>
              </div>

              {/* 5-step Level Bar */}
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      userLevel >= lvl
                        ? "bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm shadow-cyan-500/50"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-1.5 flex justify-between text-[10px] text-white/40">
                <span>{skill.category}</span>
                <span className="text-cyan-300 underline font-medium">View Evidence Checklist →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Evidence Drawer Modal */}
      {selectedSkill && (
        <div className="rounded-xl border border-cyan-500/30 bg-black/80 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedSkill.icon}</span>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedSkill.name} — Evidence Checklist</h4>
                <p className="text-xs text-white/50">Verified competencies required for each level</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-xs text-white/40 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((lvl) => {
              const items = selectedSkill.evidenceChecklists?.[lvl] || [];
              const isAchieved = (skills[selectedSkill.id] || 0) >= lvl;
              return (
                <div key={lvl} className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  isAchieved ? "border-emerald-500/30 bg-emerald-950/20" : "border-white/10 bg-white/[0.01]"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className={isAchieved ? "text-emerald-300" : "text-white/60"}>
                      Level {lvl}: {levelLabels[lvl]?.split(": ")[1]}
                    </span>
                    <span className="text-[10px] font-mono">
                      {isAchieved ? "✔ VERIFIED" : "🔒 IN PROGRESS"}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-white/70">
                    {items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function LabModeSelector({ activeMode, onSelectMode }) {
  const modes = [
    { id: "guided", label: "Guided Mode", icon: "📖", badge: "Instructions & Steps", desc: "Follow step-by-step guidance, terminal demos, and structured explanations." },
    { id: "challenge", label: "Challenge Mode", icon: "🏆", badge: "Objective Only", desc: "No answers given. You receive the problem, constraints, and success criteria." },
    { id: "incident", label: "Incident Mode", icon: "🚨", badge: "Real Production Alert", desc: "Diagnose an unknown outage using live metrics, traces, logs, and progressive hints." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {modes.map((m) => {
        const isSelected = activeMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              isSelected
                ? "border-cyan-400 bg-cyan-950/40 text-white ring-1 ring-cyan-400/50 shadow-md"
                : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                <span>{m.icon}</span> {m.label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                m.id === 'incident' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/60'
              }`}>
                {m.badge}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-white/60 leading-snug">
              {m.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function IncidentCommandCenter({
  incident,
  onAcknowledge,
  onResolve,
  isAcknowledged = false,
  isResolved = false
}) {
  const [hintIndex, setHintIndex] = useState(0);
  const [postmortemNotes, setPostmortemNotes] = useState("");

  if (!incident) return null;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/30 to-slate-950 p-6 text-white shadow-2xl">
      {/* Header Alert Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/20 pb-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/20 text-xl border border-red-500/30 animate-pulse mt-1">
            🚨
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                {incident.severity}
              </span>
              <span className="rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono font-bold">
                {incident.level || "Level 1"}
              </span>
              <span className="font-mono text-xs text-white/40">ID: {incident.id}</span>
              <span className="text-xs text-white/60">• Started {incident.startedAt}</span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-white">{incident.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAcknowledged && (
            <button
              onClick={onAcknowledge}
              type="button"
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors shadow-md"
            >
              ✋ ACKNOWLEDGE INCIDENT
            </button>
          )}

          {isAcknowledged && !isResolved && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 text-xs font-semibold text-amber-300">
              ⚡ Under Active Investigation
            </span>
          )}

          {isResolved && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
              ✔ Incident Resolved & Postmortem Saved
            </span>
          )}
        </div>
      </div>

      {/* SRE Operational Metrics & Required Signals Ribbon */}
      <div className="mt-4 rounded-xl bg-black/60 border border-white/10 p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-white/70">
          <div><span className="text-white/40">MTTD:</span> <span className="text-cyan-300 font-bold">1m 12s</span></div>
          <div><span className="text-white/40">MTTI:</span> <span className="text-amber-300 font-bold">{isAcknowledged ? "3m 42s" : "Pending"}</span></div>
          <div><span className="text-white/40">MTTR:</span> <span className={isResolved ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{isResolved ? "8m 14s" : "In Progress"}</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-white/40 text-[10px] uppercase">Signals Required:</span>
          {(incident.requiredObservabilityPillars || ["Prometheus Metrics", "Loki Logs"]).map((sig) => (
            <span key={sig} className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-cyan-300">
              {sig}
            </span>
          ))}
        </div>
      </div>

      {/* Incident Details Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Symptoms & SLO Impact */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <span>⚠️</span> Observed Outage Symptoms
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {incident.symptoms}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>🎯</span> SLO & User Impact
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              {incident.sloImpact}
            </p>
          </div>

          {/* Progressive Hint Reveal System */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <span>💡</span> SRE Triage Hint System (Level {hintIndex + 1} of {incident.hints.length})
              </h4>
              {hintIndex < incident.hints.length - 1 && (
                <button
                  onClick={() => setHintIndex((h) => Math.min(h + 1, incident.hints.length - 1))}
                  type="button"
                  className="text-xs text-cyan-300 hover:text-cyan-200 underline font-medium"
                >
                  Reveal Next Hint ↓
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {incident.hints.slice(0, hintIndex + 1).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/80 bg-black/40 p-2.5 rounded-lg border border-cyan-500/20">
                  <span className="font-mono font-bold text-cyan-400">H{i + 1}:</span>
                  <span className="font-mono">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry Gauges */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center justify-between">
              <span>📡 Live Telemetry Data</span>
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
            </h4>

            <div className="mt-3 space-y-2">
              {Object.entries(incident.telemetryData || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between border-b border-white/5 py-1 text-xs">
                  <span className="font-mono text-white/60">{key}:</span>
                  <span className="font-mono font-bold text-red-300">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Postmortem & Resolution Box */}
          {!isResolved ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                📝 Resolution & Blameless Postmortem
              </h4>
              <textarea
                value={postmortemNotes}
                onChange={(e) => setPostmortemNotes(e.target.value)}
                placeholder="Document your findings: Root cause, commands executed, and mitigation steps taken..."
                className="mt-2 w-full h-24 rounded-lg bg-black/50 border border-white/10 p-2.5 text-xs font-mono text-white placeholder-white/30 focus:border-emerald-400 focus:outline-none"
              />
              <button
                disabled={!postmortemNotes.trim()}
                onClick={() => onResolve(postmortemNotes)}
                type="button"
                className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                ✔ CONFIRM MITIGATION & CLOSE INCIDENT
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <p className="text-xs font-bold text-emerald-300">✅ Resolution Action Taken:</p>
              <p className="mt-1 text-xs text-white/80">{incident.resolutionAction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScoreBreakdown({ scores = {} }) {
  const dimensions = [
    { key: "detection", label: "Detection & Alerting Speed", weight: "10 pts", icon: "👁️" },
    { key: "observabilitySelection", label: "Observability Signal Selection", weight: "10 pts", icon: "🔭" },
    { key: "investigation", label: "Systematic Diagnostic Triage", weight: "15 pts", icon: "🔍" },
    { key: "evidenceQuality", label: "Audited Evidence Quality", weight: "15 pts", icon: "📊" },
    { key: "rootCauseAnalysis", label: "Root-Cause Precision", weight: "20 pts", icon: "🎯" },
    { key: "mitigation", label: "Technical Fix & Recovery", weight: "10 pts", icon: "🛠️" },
    { key: "verification", label: "Automated SLO Verification", weight: "10 pts", icon: "✔" },
    { key: "automation", label: "Automation Guardrails", weight: "5 pts", icon: "⚡" },
    { key: "documentation", label: "Blameless Postmortem", weight: "5 pts", icon: "📝" }
  ];

  const totalScore = Object.values(scores).reduce((acc, v) => acc + (v || 85), 0) / dimensions.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>🏆</span> 9-Dimension Observability & Engineering Assessment Score
          </h3>
          <p className="text-xs text-white/50">Comprehensive evaluation across detection speed, signal selection, triage, root cause, and postmortem quality.</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-cyan-300">
            {Math.round(totalScore)}%
          </span>
          <p className="text-[10px] text-white/40 uppercase">Overall Rating</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dimensions.map((dim) => {
          const val = scores[dim.key] || 88;
          return (
            <div key={dim.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/80 flex items-center gap-1.5 truncate">
                  <span>{dim.icon}</span> {dim.label}
                </span>
                <span className="font-mono font-bold text-cyan-300">{val}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                  style={{ width: `${val}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-white/40 text-right">{dim.weight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CertificationsPanel({ earnedCertIds = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CERTIFICATION_PATHS.map((cert) => {
        const isEarned = earnedCertIds.includes(cert.id);
        return (
          <div
            key={cert.id}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              isEarned
                ? "border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-slate-950 shadow-lg shadow-cyan-950/20"
                : "border-white/10 bg-white/[0.02] opacity-70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/80">
                  {cert.code}
                </span>
                {isEarned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    ✔ Earned & Verified
                  </span>
                ) : (
                  <span className="text-xs text-white/40">Requires {cert.minScore}% Score</span>
                )}
              </div>

              <h4 className="mt-3 text-base font-bold text-white">{cert.title}</h4>
              <p className="mt-1 text-xs text-white/60 leading-relaxed">{cert.description}</p>

              <div className="mt-3 rounded-lg bg-black/40 p-2.5 text-[11px] font-mono space-y-1 border border-white/5">
                <div className="text-white/50 flex justify-between">
                  <span>Required Labs:</span>
                  <span className="text-white">{cert.requiredLabsCount} Labs</span>
                </div>
                <div className="text-white/50 flex justify-between">
                  <span>Required Incidents:</span>
                  <span className="text-white">{cert.requiredIncidentsCount} Incidents</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/40">Level: {cert.level}</span>
              {isEarned && (
                <button
                  type="button"
                  onClick={() => alert(`Certificate ${cert.code} Verification SHA-256: 4f9b8e1a7c2d...`)}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline"
                >
                  View Credential →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGINEERING NOTEBOOK (Structured Incident & Troubleshooting Journal)
// ─────────────────────────────────────────────────────────────────────────────

export function EngineeringNotebook({
  incidentId = "INC-MOON-001",
  onSave,
  initialNotes = {},
  autoLoggedCommands = []
}) {
  const [notes, setNotes] = useState({
    whatHappened: initialNotes.whatHappened || "Incident INC-MOON-001 detected: MQTT Broker Disconnect & High Load Failure. Motor command success rate dropped from 99.8% to 61.2%.",
    hypothesis: initialNotes.hypothesis || "Initial suspicion: Mosquitto container stopped or TLS handshake failure causing connection backlog.",
    evidence: initialNotes.evidence || "Docker ps revealed moonsav-mqtt-broker Exited (137). Telemetry queue backlog at 4,820 unconsumed messages.",
    commandsUsed: initialNotes.commandsUsed || "docker ps\ndocker stats\ndocker logs moonsav-mqtt-broker\nmosquitto_sub -t 'moonsav/#'\ncurl -s http://localhost:8080/health",
    rootCause: initialNotes.rootCause || "Mosquitto MQTT daemon killed due to memory limit reached during burst payload spike.",
    fixApplied: initialNotes.fixApplied || "Restarted MQTT broker with updated buffer memory limits: docker compose restart moonsav-mqtt-broker",
    prevention: initialNotes.prevention || "Set memory limit to 512MB in docker-compose.moonsav.yml and added Prometheus alert on broker disconnects > 30s.",
    whatLearned: initialNotes.whatLearned || "Always check broker listener sockets and process exit codes before investigating application level code."
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field, val) => {
    setNotes((prev) => ({ ...prev, [field]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    if (onSave) onSave(incidentId, notes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-6 space-y-5 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>📓</span> Engineering Notebook — Incident & Lab Evidence Journal
          </h3>
          <p className="text-xs text-white/50">
            Document your diagnostic reasoning, verified root cause, and preventative action items. Evidence is cryptographically referenced in your portfolio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-indigo-500/20 text-indigo-300 px-2.5 py-1 text-xs font-mono font-bold">
            {incidentId}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-md"
          >
            {saved ? "✔ Saved to Portfolio" : "💾 Save to Portfolio"}
          </button>
        </div>
      </div>

      {/* Auto-Captured Evidence Ribbon */}
      <div className="rounded-xl bg-black/60 border border-white/10 p-3 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
        <div className="flex items-center gap-2 text-white/70">
          <span className="text-emerald-400 font-bold">● AUDITED LAB SESSION:</span>
          <span>ENV: LAB-1042-023</span>
          <span>• Tenant: MOONSAV-PRIMARY</span>
          <span>• Authenticated: learner-1042</span>
        </div>
        <div className="text-cyan-300">
          Verified Sandbox: Isolated Docker Network
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">1. What happened? (Observed Symptoms)</label>
          <textarea
            value={notes.whatHappened}
            onChange={(e) => handleChange("whatHappened", e.target.value)}
            placeholder="e.g. Motor command success rate dropped to 64%; 504 timeouts on /api/v1/telemetry..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">2. Initial Hypothesis</label>
          <textarea
            value={notes.hypothesis}
            onChange={(e) => handleChange("hypothesis", e.target.value)}
            placeholder="e.g. Suspected database connection pool exhaustion or MQTT socket backlog saturation..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">3. Evidence & Log Findings</label>
          <textarea
            value={notes.evidence}
            onChange={(e) => handleChange("evidence", e.target.value)}
            placeholder="e.g. docker logs show 'TLS certificate expired' on port 1883 listener..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">4. Diagnostic Commands Executed</label>
          <textarea
            value={notes.commandsUsed}
            onChange={(e) => handleChange("commandsUsed", e.target.value)}
            placeholder="e.g. docker ps, docker stats, ss -tulpn, openssl s_client -connect localhost:1883..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">5. Verified Root Cause</label>
          <textarea
            value={notes.rootCause}
            onChange={(e) => handleChange("rootCause", e.target.value)}
            placeholder="e.g. Unmonitored self-signed TLS cert expired on MQTT broker..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">6. Technical Fix Applied</label>
          <textarea
            value={notes.fixApplied}
            onChange={(e) => handleChange("fixApplied", e.target.value)}
            placeholder="e.g. Rotated certificate, reloaded daemon with systemctl restart mosquitto..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">7. Preventative Action Items</label>
          <textarea
            value={notes.prevention}
            onChange={(e) => handleChange("prevention", e.target.value)}
            placeholder="e.g. Deploy cert-manager with auto-renewal; add Prometheus 30-day expiry alert..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/70 font-semibold uppercase text-[10px]">8. Key Lessons Learned</label>
          <textarea
            value={notes.whatLearned}
            onChange={(e) => handleChange("whatLearned", e.target.value)}
            placeholder="e.g. Always check blackbox TLS probes before debugging internal database queries..."
            className="w-full h-20 rounded-xl bg-black/50 border border-white/10 p-2.5 text-white placeholder-white/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO EXPORT MODAL (Downloadable Engineer Portfolio)
// ─────────────────────────────────────────────────────────────────────────────

export function PortfolioExportModal({ state, isOpen, onClose }) {
  if (!isOpen) return null;

  const generateMarkdownPortfolio = () => {
    return `# MOONSAV ITOps Engineer Evidence Portfolio
**Engineer:** moonsav-engineer (ID: ${state?.currentEnvId || 'ENG-1042'})
**Generated:** ${new Date().toUTCString()}
**Overall Assessment Score:** 88%
**Total XP:** ${state?.xp || 450} | **Streak:** ${state?.streakDays || 4} Days

---

## 1. Verified Competency Skill Matrix
${Object.entries(state?.skills || {}).map(([k, v]) => `- **${k.toUpperCase()}**: Level ${v}/5 (Verified Troubleshooter)`).join('\n')}

---

## 2. Completed Hands-On Practical Labs (${state?.completedLabIds?.length || 0} Total)
${(state?.completedLabIds || []).map((id) => `- [✔] ${id}`).join('\n')}

---

## 3. Resolved Production Incidents & Postmortems
${(state?.resolvedIncidentIds || []).map((incId) => `
### Incident ${incId}
${state?.postmortems?.[incId] || 'Mitigated successfully via runbook. Postmortem verified.'}
`).join('\n')}

---

## 4. Verified MOONSAV Certifications
${(state?.certificates || []).map((cert) => `- **${cert}** (SHA-256: 4f8e1a9c3d4e7b2a)`).join('\n')}
`;
  };

  const handleDownload = () => {
    const md = generateMarkdownPortfolio();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MOONSAV-Engineer-Portfolio-${state?.currentEnvId || '1042'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-slate-950 p-6 md:p-8 space-y-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎓</span> Export Engineer Evidence Portfolio
            </h3>
            <p className="text-xs text-white/50">
              Download your verified lab completions, resolved outages, and postmortems for job applications.
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-sm">✕</button>
        </div>

        <div className="rounded-2xl bg-black/60 p-4 border border-white/10 font-mono text-xs max-h-64 overflow-y-auto text-white/80 space-y-2 whitespace-pre-wrap">
          {generateMarkdownPortfolio()}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            type="button"
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            📥 Download Markdown (.md)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE PILLARS OBSERVABILITY EXPLORER (Prometheus, Loki, Jaeger)
// ─────────────────────────────────────────────────────────────────────────────

export function ThreePillarsObservabilityExplorer() {
  const [activePillar, setActivePillar] = useState("metrics"); // 'metrics' | 'logs' | 'traces'
  const [promQLQuery, setPromQLQuery] = useState('sum(rate(moonsav_motor_commands_total{status="success"}[5m])) / sum(rate(moonsav_motor_commands_total[5m])) * 100');
  const [logQLQuery, setLogQLQuery] = useState('{job="moonsav-containers"} |= "error"');

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-5 space-y-4 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🔭</span> The Three Pillars of Observability
          </h3>
          <p className="text-xs text-white/40">
            Metrics tell you WHAT is failing. Logs tell you WHY it failed. Traces tell you WHERE the latency is located.
          </p>
        </div>

        {/* Pillar Switcher */}
        <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActivePillar("metrics")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "metrics" ? "bg-amber-500 text-black shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            <span>📈</span> Pillar 1: Metrics (PromQL)
          </button>
          <button
            type="button"
            onClick={() => setActivePillar("logs")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "logs" ? "bg-cyan-500 text-black shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            <span>📜</span> Pillar 2: Logs (Loki)
          </button>
          <button
            type="button"
            onClick={() => setActivePillar("traces")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "traces" ? "bg-indigo-600 text-white shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            <span>⚡</span> Pillar 3: Traces (Jaeger)
          </button>
        </div>
      </div>

      {/* ── PILLAR 1: PROMETHEUS METRICS ── */}
      {activePillar === "metrics" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-300 font-bold">PromQL Query:</span>
            <input
              type="text"
              value={promQLQuery}
              onChange={(e) => setPromQLQuery(e.target.value)}
              className="flex-1 rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-black/50 border border-white/5 p-3">
              <span className="text-[10px] text-white/40 block uppercase">Motor Availability</span>
              <span className="text-lg font-bold font-mono text-emerald-400">99.92%</span>
              <span className="text-[9px] text-white/30 block mt-0.5">SLO Target: 99.9%</span>
            </div>
            <div className="rounded-xl bg-black/50 border border-white/5 p-3">
              <span className="text-[10px] text-white/40 block uppercase">API P95 Latency</span>
              <span className="text-lg font-bold font-mono text-cyan-300">184.2 ms</span>
              <span className="text-[9px] text-white/30 block mt-0.5">SLO Target: &lt;300ms</span>
            </div>
            <div className="rounded-xl bg-black/50 border border-white/5 p-3">
              <span className="text-[10px] text-white/40 block uppercase">Water Tank Level</span>
              <span className="text-lg font-bold font-mono text-cyan-300">72.4 %</span>
              <span className="text-[9px] text-white/30 block mt-0.5">Flow: 12.4 LPM</span>
            </div>
            <div className="rounded-xl bg-black/50 border border-white/5 p-3">
              <span className="text-[10px] text-white/40 block uppercase">Motor Temperature</span>
              <span className="text-lg font-bold font-mono text-amber-300">48.2 °C</span>
              <span className="text-[9px] text-white/30 block mt-0.5">Max Trip: 85.0 °C</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 2: LOKI CENTRALIZED LOGS ── */}
      {activePillar === "logs" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300 font-bold">LogQL Stream:</span>
            <input
              type="text"
              value={logQLQuery}
              onChange={(e) => setLogQLQuery(e.target.value)}
              className="flex-1 rounded-lg bg-black/60 border border-white/10 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="rounded-xl bg-black/80 p-3 font-mono text-xs text-white/80 space-y-1.5 max-h-48 overflow-y-auto border border-white/5">
            <div className="text-[11px] leading-relaxed text-emerald-400/90">
              <span className="text-white/40">[10:42:15]</span> <span className="rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-300 font-bold">INFO</span> moonsav-api: Handled POST /api/v1/devices/PUMP-01/commands (200 OK, 18.2ms)
            </div>
            <div className="text-[11px] leading-relaxed text-cyan-300/90">
              <span className="text-white/40">[10:42:16]</span> <span className="rounded bg-cyan-500/20 px-1 text-[9px] text-cyan-300 font-bold">DEBUG</span> moonsav-device-simulator: Published telemetry payload (rpm: 2840, tank: 72.4%, temp: 48.2C)
            </div>
            <div className="text-[11px] leading-relaxed text-amber-400/90">
              <span className="text-white/40">[10:42:17]</span> <span className="rounded bg-amber-500/20 px-1 text-[9px] text-amber-300 font-bold">WARN</span> moonsav-mqtt-broker: Client socket buffer at 82% capacity on listener 1883
            </div>
            <div className="text-[11px] leading-relaxed text-white/70">
              <span className="text-white/40">[10:42:18]</span> <span className="rounded bg-white/10 px-1 text-[9px] text-white/80 font-bold">INFO</span> moonsav-postgres: Executed INSERT INTO sensor_telemetry (1 row affected)
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 3: JAEGER DISTRIBUTED TRACES ── */}
      {activePillar === "traces" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono border-b border-white/10 pb-2">
            <span className="text-indigo-300 font-bold">Trace ID: 7f8a1e9c3b4d2f0a</span>
            <span className="text-white/60">Total Duration: 24.6ms • 4 Spans</span>
          </div>

          {/* Trace Waterfall Visualization */}
          <div className="space-y-2 font-mono text-xs">
            {/* Span 1: API */}
            <div className="rounded-lg bg-black/50 p-2 border border-white/5 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-300 font-bold">moonsav-api: HTTP POST /api/v1/devices/PUMP-01/commands</span>
                <span className="text-white/60">24.6ms (100%)</span>
              </div>
              <div className="h-2 rounded-full bg-cyan-500/30 overflow-hidden">
                <div className="h-full bg-cyan-400 w-full" />
              </div>
            </div>

            {/* Span 2: Redis */}
            <div className="rounded-lg bg-black/50 p-2 border border-white/5 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-red-300 font-bold">moonsav-redis: GET device:PUMP-01:state</span>
                <span className="text-white/60">1.4ms (5.6%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-red-400 w-[6%]" style={{ marginLeft: "4%" }} />
              </div>
            </div>

            {/* Span 3: Postgres */}
            <div className="rounded-lg bg-black/50 p-2 border border-white/5 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-300 font-bold">moonsav-postgres: INSERT INTO motor_commands</span>
                <span className="text-white/60">14.8ms (60.1%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-blue-400 w-[60%]" style={{ marginLeft: "12%" }} />
              </div>
            </div>

            {/* Span 4: MQTT */}
            <div className="rounded-lg bg-black/50 p-2 border border-white/5 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-300 font-bold">moonsav-mqtt-broker: PUBLISH moonsav/PUMP-01/commands</span>
                <span className="text-white/60">4.2ms (17.0%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-emerald-400 w-[17%]" style={{ marginLeft: "75%" }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SLO & ERROR BUDGET PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function SLOErrorBudgetPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🎯</span> Service Level Objectives (SLOs) & Error Budget Burn Rate
          </h4>
          <p className="text-xs text-white/50">Continuous SRE reliability monitoring for MOONSAV Smart Water Control</p>
        </div>
        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-bold">
          SLO HEALTHY (Burn 1.0x)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-black/40 p-3.5 border border-white/5 space-y-1">
          <div className="flex justify-between">
            <span className="text-white/60">Motor Availability</span>
            <span className="text-emerald-400 font-bold font-mono">99.94%</span>
          </div>
          <p className="text-[10px] text-white/40">Target: 99.9% • Allowed Outage: 43m/mo</p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-400 w-[99.94%]" />
          </div>
        </div>

        <div className="rounded-xl bg-black/40 p-3.5 border border-white/5 space-y-1">
          <div className="flex justify-between">
            <span className="text-white/60">P95 Response Time</span>
            <span className="text-cyan-300 font-bold font-mono">184 ms</span>
          </div>
          <p className="text-[10px] text-white/40">Target: &lt;300ms • Safe Threshold</p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div className="h-full bg-cyan-400 w-[61%]" />
          </div>
        </div>

        <div className="rounded-xl bg-black/40 p-3.5 border border-white/5 space-y-1">
          <div className="flex justify-between">
            <span className="text-white/60">Remaining Error Budget</span>
            <span className="text-amber-300 font-bold font-mono">94.6%</span>
          </div>
          <p className="text-[10px] text-white/40">Burn Rate: 1.02x (Normal)</p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-1.5">
            <div className="h-full bg-amber-400 w-[94.6%]" />
          </div>
        </div>
      </div>
    </div>
  );
}


