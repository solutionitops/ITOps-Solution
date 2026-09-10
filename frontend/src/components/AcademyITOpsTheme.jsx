import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ITOPS_PROJECTS,
  SKILL_MATRIX_DEFINITIONS,
  CERTIFICATION_PATHS,
  TOOL_DECISION_CHALLENGES,
  getTrackAssessment,
  submitTrackAssessment
} from "../data/itopsAcademyCourses";
import { AnimatedCounter } from "./AnimatedCounter";
import { ProgressRing } from "./CyberSachetTheme";

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE SVG ICONS (Replaces all casual emojis with crisp vector icons)
// ─────────────────────────────────────────────────────────────────────────────

export const Icons = {
  Terminal: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Server: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  Cpu: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="15" x2="23" y2="15" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="15" x2="4" y2="15" />
    </svg>
  ),
  Activity: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Layers: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  AlertTriangle: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  CheckCircle: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Play: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Video: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  BookOpen: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Award: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  Copy: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  ExternalLink: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Lock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Target: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Lightbulb: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.64.78 1.08 1.54 1.26 2.5" />
    </svg>
  ),
  HelpCircle: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  Download: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  ChevronLeft: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Globe: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Rocket: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
      <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
    </svg>
  ),
  BarChart: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  GraduationCap: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Code: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Settings: ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
};

// ─────────────────────────────────────────────────────────────────────────────
// HERO BANNER (Professional Enterprise Design)
// ─────────────────────────────────────────────────────────────────────────────

export function ITOpsHero({
  activeProject = "moonsav",
  activeTrack = "all",
  xp = 450,
  streak = 4,
  completedLabsCount = 1,
  totalLabsCount = 100,
  activeIncidentCount = 2,
  labStatus = "RUNNING",
  envId = "LAB-1042-023",
  onResumeLab,
  onResetEnv
}) {
  const project = ITOPS_PROJECTS[activeProject] || ITOPS_PROJECTS.moonsav;
  const progressPct = Math.round((completedLabsCount / (totalLabsCount || 1)) * 100);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-300">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Brand Identity & Active Environment */}
        <div className="flex items-start md:items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm">
            <Icons.Server className="w-7 h-7 text-white" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                ITOps Academy
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Production SRE & Infrastructure Simulation
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                ENV: {envId}
              </span>
              {activeIncidentCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 px-2 py-0.5 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {activeIncidentCount} Outage Scenarios
                </span>
              )}
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {project.name}
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {project.tagline} — Master real-time telemetry, Linux kernel diagnostics, and Kubernetes resilience.
            </p>
          </div>
        </div>

        {/* Right: Progress & Action Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {onResumeLab && (
            <button
              onClick={onResumeLab}
              type="button"
              className="flex items-center gap-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 transition-all text-left shadow-sm"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/20 text-white font-bold text-xs">
                <Icons.Play className="w-3.5 h-3.5 ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Interactive Studio</p>
                <p className="truncate text-xs font-bold text-white">Resume Active Lab</p>
              </div>
            </button>
          )}

          {/* Progress Ring */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2">
            <ProgressRing pct={progressPct} size={42} tone="amber" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Curriculum</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {completedLabsCount} of {totalLabsCount} Labs
              </p>
            </div>
          </div>

          {/* Metrics Cluster */}
          <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
            <div className="text-center">
              <p className="text-lg md:text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                <AnimatedCounter value={xp} />
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Total XP</p>
            </div>
            <div className="text-center">
              <p className="text-lg md:text-xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
                {streak}d
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Streak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT SWITCHER (Flagship Environments)
// ─────────────────────────────────────────────────────────────────────────────

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
                ? "border-l-4 border-l-indigo-600 dark:border-l-indigo-400 border-slate-300 dark:border-slate-700 bg-indigo-50/30 dark:bg-slate-900 shadow-sm"
                : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
                proj.id === 'moonsav'
                  ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/20'
                  : 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20'
              }`}>
                {proj.badge}
              </span>
              {isSelected && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  Active Environment
                </span>
              )}
            </div>

            <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.Server className="w-4 h-4 text-indigo-500" />
              {proj.name}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {proj.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              {proj.architecture.slice(0, 4).map((comp) => (
                <span key={comp.id} className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {comp.name}
                </span>
              ))}
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                +{proj.architecture.length - 4} services
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMY LESSON VIDEO & LIVE TELEMETRY SIMULATOR
// ─────────────────────────────────────────────────────────────────────────────

export function AcademyLessonVideo({
  lab,
  youtubeVideoId = "sWbUDq4S6Y8",
  chapterTitle = "Core Infrastructure Architecture & Walkthrough",
  onCompleteVideo
}) {
  const [activeTab, setActiveTab] = useState("video");
  const [hasError, setHasError] = useState(false);
  const [isPlayingSimulator, setIsPlayingSimulator] = useState(true);
  const [simMetrics, setSimMetrics] = useState({
    cpu: 24,
    ram: 48,
    reqRate: 4820,
    errRate: 0.02,
    p99: 14.2
  });

  useEffect(() => {
    if (!isPlayingSimulator) return;
    const interval = setInterval(() => {
      setSimMetrics(prev => ({
        cpu: Math.min(95, Math.max(12, Math.round(prev.cpu + (Math.random() * 8 - 4)))),
        ram: Math.min(90, Math.max(35, Math.round(prev.ram + (Math.random() * 4 - 2)))),
        reqRate: Math.round(4800 + Math.random() * 200),
        errRate: parseFloat((Math.max(0, prev.errRate + (Math.random() * 0.04 - 0.02))).toFixed(2)),
        p99: parseFloat((14.2 + (Math.random() * 2 - 1)).toFixed(1))
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [isPlayingSimulator]);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-black/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            {activeTab === "video" ? <Icons.Video className="w-4 h-4" /> : <Icons.Activity className="w-4 h-4" />}
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>{lab?.title || "Technical Masterclass"}</span>
              <span className="text-[10px] rounded bg-slate-200 dark:bg-white/10 px-1.5 py-0.2 font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                {lab?.track?.toUpperCase() || "SRE"}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{chapterTitle}</p>
          </div>
        </div>

        {/* View Switcher Tabs & Direct YouTube Link */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-200/80 dark:bg-black/60 p-1 border border-slate-300/80 dark:border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
                activeTab === "video"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icons.Video className="w-3.5 h-3.5" /> Video Lecture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("simulator")}
              className={`rounded-lg px-3 py-1 transition-all flex items-center gap-1.5 ${
                activeTab === "simulator"
                  ? "bg-amber-500 text-black shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icons.Activity className="w-3.5 h-3.5" /> SRE Telemetry
            </button>
          </div>

          {youtubeVideoId && (
            <a
              href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1 rounded-xl shadow-xs transition-colors"
              title="Open video tutorial on YouTube"
            >
              <Icons.ExternalLink className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">YouTube</span>
            </a>
          )}
        </div>
      </div>

      {/* Media Window */}
      {activeTab === "video" ? (
        <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
          {!hasError ? (
            <iframe
              src={embedUrl}
              title={`Lecture: ${lab?.title || 'ITOps Academy'}`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-900 text-white">
              <Icons.Video className="w-8 h-8 text-slate-400" />
              <h4 className="text-sm font-bold text-white">Video Stream Standby</h4>
              <p className="text-xs text-slate-400 max-w-md">
                Lecture player ready. You can also view directly on YouTube or switch to the live telemetry engine.
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-sm inline-flex items-center gap-1.5"
              >
                Watch on YouTube <Icons.ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      ) : (
        /* Live SRE Telemetry Simulator */
        <div className="p-5 space-y-4 bg-slate-900 dark:bg-black text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white">LIVE CONTAINER METRIC TELEMETRY & PROMETHEUS SCRAPE</span>
            </div>
            <button
              onClick={() => setIsPlayingSimulator(!isPlayingSimulator)}
              className="text-xs text-cyan-300 hover:underline font-mono"
            >
              {isPlayingSimulator ? "Pause Stream" : "Resume Stream"}
            </button>
          </div>

          {/* Real-time Telemetry Dials */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="rounded-xl bg-black/60 border border-white/10 p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase">CPU Usage</span>
              <p className={`text-lg font-bold font-mono mt-1 ${simMetrics.cpu > 80 ? 'text-red-400' : 'text-cyan-300'}`}>
                {simMetrics.cpu}%
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${simMetrics.cpu}%` }} />
              </div>
            </div>

            <div className="rounded-xl bg-black/60 border border-white/10 p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase">RAM Pressure</span>
              <p className="text-lg font-bold font-mono text-indigo-300 mt-1">
                {simMetrics.ram}%
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-indigo-400 transition-all duration-300" style={{ width: `${simMetrics.ram}%` }} />
              </div>
            </div>

            <div className="rounded-xl bg-black/60 border border-white/10 p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ingest Rate</span>
              <p className="text-lg font-bold font-mono text-emerald-400 mt-1">
                {simMetrics.reqRate} <span className="text-[10px] text-slate-400">req/s</span>
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-400 w-full" />
              </div>
            </div>

            <div className="rounded-xl bg-black/60 border border-white/10 p-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Error Rate</span>
              <p className="text-lg font-bold font-mono text-amber-300 mt-1">
                {simMetrics.errRate}%
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${Math.min(100, simMetrics.errRate * 50)}%` }} />
              </div>
            </div>

            <div className="rounded-xl bg-black/60 border border-white/10 p-3 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">P99 Latency</span>
              <p className="text-lg font-bold font-mono text-cyan-300 mt-1">
                {simMetrics.p99} <span className="text-[10px] text-slate-400">ms</span>
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/10 mt-1.5 overflow-hidden">
                <div className="h-full bg-cyan-400 w-2/3" />
              </div>
            </div>
          </div>

          {/* Animated Waveform Visualizer */}
          <div className="rounded-xl bg-black/80 border border-white/10 p-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span>PROMETHEUS LIVE STREAM (500ms TICK)</span>
              <span className="text-emerald-400">STATUS: HEALTHY</span>
            </div>
            <div className="flex items-end gap-1 h-16 w-full overflow-hidden">
              {Array.from({ length: 48 }).map((_, i) => {
                const height = Math.max(15, Math.sin(i * 0.4 + Date.now() * 0.002) * 40 + 50 + (i % 5) * 4);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-indigo-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SRE Takeaways Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-black/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px]">Architecture Note:</span>
          <span className="font-mono text-[11px]">{lab?.sreLesson || "Verify baseline telemetry before and after modifying production configuration."}</span>
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          Open in YouTube <Icons.ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERATIONAL TOPOLOGY MAP (Clean Microservices Inspector)
// ─────────────────────────────────────────────────────────────────────────────

export function OperationalTopologyMap({ projectId = "moonsav" }) {
  const project = ITOPS_PROJECTS[projectId] || ITOPS_PROJECTS.moonsav;
  const [selectedNode, setSelectedNode] = useState(project.architecture[0]);
  const [activeTab, setActiveTab] = useState("metrics");
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    if (project.architecture?.length > 0) {
      setSelectedNode(project.architecture[0]);
    }
  }, [projectId, project]);

  const handleRestartNode = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900/50 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.Layers className="w-4 h-4 text-indigo-500" /> Operational Topology Map
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any microservice node to inspect live Prometheus metrics, stream container logs, or trigger restarts.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold">
          ALL NODES ONLINE
        </span>
      </div>

      {/* Nodes Flow Grid */}
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
                  ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-1 ring-indigo-400"
                  : "border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-slate-400 uppercase">{node.tech.split(" ")[0]}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white truncate">{node.name}</p>
              <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 truncate">{node.role}</p>
            </button>
          );
        })}
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white p-4 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Icons.Cpu className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {selectedNode.name}
                  <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-cyan-300">
                    {selectedNode.tech}
                  </span>
                </h4>
                <p className="text-xs text-slate-400">{selectedNode.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg bg-white/5 p-0.5 text-[11px] border border-white/10">
                {["metrics", "logs", "config"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded px-2.5 py-0.5 capitalize transition-colors ${
                      activeTab === tab ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
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
                className="rounded-lg bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Icons.Refresh className={`w-3 h-3 ${restarting ? 'animate-spin' : ''}`} />
                {restarting ? "Restarting..." : "Restart Node"}
              </button>
            </div>
          </div>

          {/* Active Tab Panel */}
          {activeTab === "metrics" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {Object.entries(selectedNode.metrics || {}).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-black/40 border border-white/10 p-2.5 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">{k}</p>
                  <p className="text-sm font-bold font-mono text-cyan-300 mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "logs" && (
            <div className="rounded-lg bg-black/90 p-3 font-mono text-xs text-slate-200 space-y-1 max-h-36 overflow-y-auto border border-white/10">
              {(selectedNode.logs || []).map((l, i) => (
                <div key={i} className="text-[11px] leading-relaxed text-emerald-400">{l}</div>
              ))}
            </div>
          )}

          {activeTab === "config" && (
            <div className="rounded-lg bg-black/90 p-3 font-mono text-xs text-slate-200 border border-white/10">
              <pre className="text-[11px] text-cyan-200 overflow-x-auto">
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
// TOOL DECISION CHALLENGE
// ─────────────────────────────────────────────────────────────────────────────

export function ToolDecisionChallenge({ challengeIndex = 0 }) {
  const challenge = TOOL_DECISION_CHALLENGES[challengeIndex] || TOOL_DECISION_CHALLENGES[0];
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-neutral-900/40 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
          <Icons.Cpu className="w-4 h-4 text-indigo-500" /> Engineering Judgment Challenge
        </span>
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Architecture Decision</span>
      </div>

      <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
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
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400"
                    : "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 ring-1 ring-red-400"
                  : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{opt.tool}</span>
                {submitted && isSelected && (
                  <span>{opt.correct ? "✔ Correct" : "✖ Review Rationale"}</span>
                )}
              </div>
              {submitted && isSelected && (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-1.5 font-normal">
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
// LAB LIFECYCLE CONTROLS
// ─────────────────────────────────────────────────────────────────────────────

export function LabLifecycleControls({
  status = "RUNNING",
  envId = "LAB-1042-023",
  onStartLab,
  onStopLab,
  onResetLab,
  onVerifyLab
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`h-3 w-3 rounded-full ${
          status === 'RUNNING' ? 'bg-emerald-500 animate-pulse' :
          status === 'STARTING' ? 'bg-amber-500 animate-ping' :
          status === 'COMPLETED' ? 'bg-blue-500' : 'bg-red-500'
        }`} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Environment State: {status}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">ID: {envId}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Isolated containerized sandbox active.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onVerifyLab}
          type="button"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <Icons.CheckCircle className="w-3.5 h-3.5" /> Auto-Verify
        </button>
        <button
          onClick={onResetLab}
          type="button"
          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
        >
          <Icons.Refresh className="w-3.5 h-3.5" /> Reset Sandbox
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL MATRIX
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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.Award className="w-5 h-5 text-indigo-500" /> Evidence-Based Competency Skill Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
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
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-neutral-900/80 p-3.5 text-left hover:bg-slate-100 dark:hover:bg-neutral-800 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{skill.name}</span>
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Level {userLevel}/5
                </span>
              </div>

              {/* 5-step Level Bar */}
              <div className="mt-2.5 flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      userLevel >= lvl
                        ? "bg-indigo-600 dark:bg-indigo-400"
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{skill.category}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">View Evidence →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Evidence Drawer Modal */}
      {selectedSkill && (
        <div className="rounded-xl border border-indigo-500/30 bg-white dark:bg-neutral-900 p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedSkill.name} — Evidence Checklist</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verified competencies required for each level</p>
            </div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
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
                  isAchieved
                    ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-neutral-800/40 text-slate-700 dark:text-slate-300"
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      Level {lvl}: {levelLabels[lvl]?.split(": ")[1]}
                    </span>
                    <span className="text-[10px] font-mono">
                      {isAchieved ? "✔ VERIFIED" : "IN PROGRESS"}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
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

// ─────────────────────────────────────────────────────────────────────────────
// LAB MODE SELECTOR
// ─────────────────────────────────────────────────────────────────────────────

export function LabModeSelector({ activeMode, onSelectMode }) {
  const modes = [
    { id: "guided", label: "Guided Mode", icon: Icons.BookOpen, badge: "Step-by-Step", desc: "Follow guided execution steps, terminal commands, and structural explanations." },
    { id: "challenge", label: "Challenge Mode", icon: Icons.Award, badge: "Objective Only", desc: "No answers given. You receive the problem, constraints, and success criteria." },
    { id: "incident", label: "Incident Mode", icon: Icons.AlertTriangle, badge: "Chaos Outage", desc: "Diagnose an active production incident using live metrics, traces, and progressive hints." }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {modes.map((m) => {
        const isSelected = activeMode === m.id;
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelectMode(m.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              isSelected
                ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-400/50 shadow-sm"
                : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Icon className="w-3.5 h-3.5 text-indigo-500" /> {m.label}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                m.id === 'incident' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'
              }`}>
                {m.badge}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              {m.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT COMMAND CENTER
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50/40 dark:bg-neutral-900 p-6 text-slate-900 dark:text-white shadow-sm">
      {/* Header Alert Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 dark:border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 mt-1">
            <Icons.AlertTriangle className="w-5 h-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                {incident.severity}
              </span>
              <span className="rounded bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {incident.level || "Level 1"}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">ID: {incident.id}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• Started {incident.startedAt}</span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">{incident.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAcknowledged && (
            <button
              onClick={onAcknowledge}
              type="button"
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors shadow-sm"
            >
              Acknowledge Outage
            </button>
          )}

          {isAcknowledged && !isResolved && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
              Active Triage in Progress
            </span>
          )}

          {isResolved && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
              Incident Resolved & Postmortem Saved
            </span>
          )}
        </div>
      </div>

      {/* SRE Timers Ribbon */}
      <div className="mt-4 rounded-xl bg-slate-900 text-white p-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <div><span className="text-slate-500">MTTD:</span> <span className="text-cyan-300 font-bold">1m 12s</span></div>
          <div><span className="text-slate-500">MTTI:</span> <span className="text-amber-300 font-bold">{isAcknowledged ? "3m 42s" : "Pending"}</span></div>
          <div><span className="text-slate-500">MTTR:</span> <span className={isResolved ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{isResolved ? "8m 14s" : "In Progress"}</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[10px] uppercase">Signals Required:</span>
          {(incident.requiredObservabilityPillars || ["Prometheus Metrics", "Loki Logs"]).map((sig) => (
            <span key={sig} className="rounded bg-white/10 border border-white/10 px-2 py-0.5 text-[10px] text-cyan-300">
              {sig}
            </span>
          ))}
        </div>
      </div>

      {/* Incident Details Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Symptoms & SLO Impact */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <Icons.AlertTriangle className="w-3.5 h-3.5" /> Observed Outage Symptoms
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {incident.symptoms}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Icons.Activity className="w-3.5 h-3.5" /> SLO & User Impact
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {incident.sloImpact}
            </p>
          </div>

          {/* Progressive Hint Reveal System */}
          <div className="rounded-xl border border-cyan-300 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/20 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <Icons.Cpu className="w-3.5 h-3.5" /> SRE Diagnostic Hints (Level {hintIndex + 1} of {incident.hints?.length || 1})
              </h4>
              {hintIndex < (incident.hints?.length || 1) - 1 && (
                <button
                  onClick={() => setHintIndex((h) => Math.min(h + 1, incident.hints.length - 1))}
                  type="button"
                  className="text-xs text-cyan-700 dark:text-cyan-300 hover:underline font-semibold"
                >
                  Reveal Next Hint ↓
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {(incident.hints || []).slice(0, hintIndex + 1).map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-black/40 p-2.5 rounded-lg border border-cyan-200 dark:border-cyan-500/20 shadow-sm">
                  <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">H{i + 1}:</span>
                  <span className="font-mono">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Telemetry Gauges */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Live Telemetry Data</span>
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
            </h4>

            <div className="mt-3 space-y-2">
              {Object.entries(incident.telemetryData || {}).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 py-1 text-xs">
                  <span className="font-mono text-slate-500 dark:text-slate-400">{key}:</span>
                  <span className="font-mono font-bold text-red-600 dark:text-red-300">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Postmortem Box */}
          {!isResolved ? (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Resolution & Blameless Postmortem
              </h4>
              <textarea
                value={postmortemNotes}
                onChange={(e) => setPostmortemNotes(e.target.value)}
                placeholder="Document findings: Root cause, commands executed, and preventative actions..."
                className="mt-2 w-full h-24 rounded-lg bg-white dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
              <button
                disabled={!postmortemNotes.trim()}
                onClick={() => onResolve(postmortemNotes)}
                type="button"
                className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                Confirm Mitigation & Close Outage
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-4">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Resolution Action Applied:</p>
              <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{incident.resolutionAction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────────

export function ScoreBreakdown({ scores = {} }) {
  const dimensions = [
    { key: "detection", label: "Detection Speed", weight: "10 pts" },
    { key: "observabilitySelection", label: "Signal Selection", weight: "10 pts" },
    { key: "investigation", label: "Diagnostic Triage", weight: "15 pts" },
    { key: "evidenceQuality", label: "Evidence Quality", weight: "15 pts" },
    { key: "rootCauseAnalysis", label: "Root Cause Precision", weight: "20 pts" },
    { key: "mitigation", label: "Technical Fix", weight: "10 pts" },
    { key: "verification", label: "SLO Verification", weight: "10 pts" },
    { key: "automation", label: "Guardrails", weight: "5 pts" },
    { key: "documentation", label: "Postmortem Quality", weight: "5 pts" }
  ];

  const totalScore = Object.values(scores).reduce((acc, v) => acc + (v || 88), 0) / dimensions.length;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.Award className="w-5 h-5 text-indigo-500" /> Observability & SRE Competency Score
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Comprehensive evaluation across detection, triage, root cause, and remediation.</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {Math.round(totalScore)}%
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Rating: Grade A</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dimensions.map((dim) => {
          const val = scores[dim.key] || 88;
          return (
            <div key={dim.key} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-neutral-800/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{dim.label}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{val}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-400"
                  style={{ width: `${val}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400 text-right">{dim.weight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────

export function CertificationsPanel({ earnedCertIds = [], onTakeExam, trackScores = {} }) {
  const CERT_TO_TRACK = {
    "cert-itops-foundation": "foundation",
    "cert-devops-engineer": "devops",
    "cert-devsecops-engineer": "devsecops",
    "cert-k8s-engineer": "kubernetes",
    "cert-sre-engineer": "sre",
    "cert-platform-master": "incidents"
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {CERTIFICATION_PATHS.map((cert) => {
        const isEarned = earnedCertIds.includes(cert.id);
        const trackId = CERT_TO_TRACK[cert.id] || "foundation";
        const trackScoreInfo = trackScores[trackId];

        return (
          <div
            key={cert.id}
            className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
              isEarned
                ? "border-indigo-500/50 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-neutral-900 shadow-sm ring-1 ring-indigo-400/40"
                : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900/50 opacity-95"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {cert.code}
                </span>
                {isEarned ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ✔ Verified Credential
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Pass Mark: {cert.minScore}%</span>
                )}
              </div>

              <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{cert.title}</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{cert.description}</p>

              <div className="mt-3 rounded-lg bg-slate-50 dark:bg-black/40 p-2.5 text-[11px] font-mono space-y-1 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Required Labs:</span>
                  <span className="text-slate-900 dark:text-white">{cert.requiredLabsCount} Labs</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Required Incidents:</span>
                  <span className="text-slate-900 dark:text-white">{cert.requiredIncidentsCount} Incidents</span>
                </div>
                {trackScoreInfo && (
                  <div className="text-slate-500 dark:text-slate-400 flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span>15-Q Final Exam:</span>
                    <span className={trackScoreInfo.passed ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                      {trackScoreInfo.score}% {trackScoreInfo.passed ? "(Passed)" : "(Try Again)"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Level: {cert.level}</span>
                {isEarned && (
                  <button
                    type="button"
                    onClick={() => alert(`Certificate ${cert.code} Verification Hash: 4f9b8e1a7c2d9b43...`)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    View Credential <Icons.ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {onTakeExam && (
                <button
                  type="button"
                  onClick={() => onTakeExam(trackId, cert.title)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                    isEarned
                      ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                  }`}
                >
                  <span>🎓</span>
                  <span>{trackScoreInfo ? "Retake 15-Q Final Exam" : "Take 15-Q Final Exam"}</span>
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
// ENGINEERING NOTEBOOK
// ─────────────────────────────────────────────────────────────────────────────

export function EngineeringNotebook({
  incidentId = "INC-MOON-001",
  onSave,
  initialNotes = {}
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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-6 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.BookOpen className="w-5 h-5 text-indigo-500" /> Engineering Incident & Postmortem Journal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Document diagnostic reasoning, verified root causes, and preventative guardrails.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {incidentId}
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
          >
            {saved ? "✔ Saved to Portfolio" : "Save to Portfolio"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">1. What happened? (Observed Symptoms)</label>
          <textarea
            value={notes.whatHappened}
            onChange={(e) => handleChange("whatHappened", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">2. Initial Hypothesis</label>
          <textarea
            value={notes.hypothesis}
            onChange={(e) => handleChange("hypothesis", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">3. Evidence & Log Findings</label>
          <textarea
            value={notes.evidence}
            onChange={(e) => handleChange("evidence", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">4. Diagnostic Commands Executed</label>
          <textarea
            value={notes.commandsUsed}
            onChange={(e) => handleChange("commandsUsed", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">5. Verified Root Cause</label>
          <textarea
            value={notes.rootCause}
            onChange={(e) => handleChange("rootCause", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">6. Technical Fix Applied</label>
          <textarea
            value={notes.fixApplied}
            onChange={(e) => handleChange("fixApplied", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">7. Preventative Guardrails</label>
          <textarea
            value={notes.prevention}
            onChange={(e) => handleChange("prevention", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-700 dark:text-slate-300 font-semibold uppercase text-[10px]">8. Key Learnings</label>
          <textarea
            value={notes.whatLearned}
            onChange={(e) => handleChange("whatLearned", e.target.value)}
            className="w-full h-20 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-slate-800 p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO EXPORT MODAL
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900 p-6 md:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-white">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Icons.Award className="w-5 h-5 text-indigo-500" /> Export Engineer Evidence Portfolio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Download verified lab completions, resolved outages, and postmortems for technical evaluations.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-sm font-bold">✕</button>
        </div>

        <div className="rounded-2xl bg-slate-900 text-white p-4 border border-slate-800 font-mono text-xs max-h-64 overflow-y-auto space-y-2 whitespace-pre-wrap">
          {generateMarkdownPortfolio()}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            type="button"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-110 transition-all"
          >
            Download Markdown (.md)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THREE PILLARS OBSERVABILITY EXPLORER
// ─────────────────────────────────────────────────────────────────────────────

export function ThreePillarsObservabilityExplorer() {
  const [activePillar, setActivePillar] = useState("metrics");
  const [promQLQuery, setPromQLQuery] = useState('sum(rate(moonsav_motor_commands_total{status="success"}[5m])) / sum(rate(moonsav_motor_commands_total[5m])) * 100');
  const [logQLQuery, setLogQLQuery] = useState('{job="moonsav-containers"} |= "error"');

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.Activity className="w-4 h-4 text-indigo-500" /> The Three Pillars of Observability
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Metrics detect what fails. Logs explain why it failed. Traces locate where latency occurred.
          </p>
        </div>

        {/* Pillar Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-black/60 p-1 border border-slate-200 dark:border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActivePillar("metrics")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "metrics" ? "bg-amber-500 text-black shadow-sm font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Pillar 1: Metrics (PromQL)
          </button>
          <button
            type="button"
            onClick={() => setActivePillar("logs")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "logs" ? "bg-cyan-500 text-black shadow-sm font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Pillar 2: Logs (Loki)
          </button>
          <button
            type="button"
            onClick={() => setActivePillar("traces")}
            className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activePillar === "traces" ? "bg-indigo-600 text-white shadow-sm font-bold" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Pillar 3: Traces (Jaeger)
          </button>
        </div>
      </div>

      {/* ── PILLAR 1: PROMETHEUS METRICS ── */}
      {activePillar === "metrics" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">PromQL Query:</span>
            <input
              type="text"
              value={promQLQuery}
              onChange={(e) => setPromQLQuery(e.target.value)}
              className="flex-1 rounded-lg bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-cyan-300 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Motor Availability</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">99.92%</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">SLO Target: 99.9%</span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">API P95 Latency</span>
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">184.2 ms</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">SLO Target: &lt;300ms</span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Water Tank Level</span>
              <span className="text-lg font-bold font-mono text-cyan-600 dark:text-cyan-400">72.4 %</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Flow: 12.4 LPM</span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-3">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase">Motor Temperature</span>
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">48.2 °C</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Max Trip: 85.0 °C</span>
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 2: LOKI CENTRALIZED LOGS ── */}
      {activePillar === "logs" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-bold">LogQL Stream:</span>
            <input
              type="text"
              value={logQLQuery}
              onChange={(e) => setLogQLQuery(e.target.value)}
              className="flex-1 rounded-lg bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-slate-800 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="rounded-xl bg-slate-900 text-white p-3 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto border border-slate-800">
            <div className="text-[11px] leading-relaxed text-emerald-400">
              <span className="text-slate-500">[10:42:15]</span> <span className="rounded bg-emerald-500/20 px-1 text-[9px] text-emerald-300 font-bold">INFO</span> moonsav-api: Handled POST /api/v1/devices/PUMP-01/commands (200 OK, 18.2ms)
            </div>
            <div className="text-[11px] leading-relaxed text-cyan-300">
              <span className="text-slate-500">[10:42:16]</span> <span className="rounded bg-cyan-500/20 px-1 text-[9px] text-cyan-300 font-bold">DEBUG</span> moonsav-device-simulator: Published telemetry payload (rpm: 2840, tank: 72.4%, temp: 48.2C)
            </div>
            <div className="text-[11px] leading-relaxed text-amber-400">
              <span className="text-slate-500">[10:42:17]</span> <span className="rounded bg-amber-500/20 px-1 text-[9px] text-amber-300 font-bold">WARN</span> moonsav-mqtt-broker: Client socket buffer at 82% capacity on listener 1883
            </div>
            <div className="text-[11px] leading-relaxed text-slate-300">
              <span className="text-slate-500">[10:42:18]</span> <span className="rounded bg-white/10 px-1 text-[9px] text-white font-bold">INFO</span> moonsav-postgres: Executed INSERT INTO sensor_telemetry (1 row affected)
            </div>
          </div>
        </div>
      )}

      {/* ── PILLAR 3: JAEGER DISTRIBUTED TRACES ── */}
      {activePillar === "traces" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Trace ID: 7f8a1e9c3b4d2f0a</span>
            <span className="text-slate-500 dark:text-slate-400">Total Duration: 24.6ms • 4 Spans</span>
          </div>

          {/* Trace Waterfall Visualization */}
          <div className="space-y-2 font-mono text-xs">
            {/* Span 1: API */}
            <div className="rounded-lg bg-slate-50 dark:bg-black/50 p-2 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-indigo-700 dark:text-indigo-300 font-bold">moonsav-api: HTTP POST /api/v1/devices/PUMP-01/commands</span>
                <span className="text-slate-500 dark:text-slate-400">24.6ms (100%)</span>
              </div>
              <div className="h-2 rounded-full bg-indigo-500/20 overflow-hidden">
                <div className="h-full bg-indigo-500 w-full" />
              </div>
            </div>

            {/* Span 2: Redis */}
            <div className="rounded-lg bg-slate-50 dark:bg-black/50 p-2 border border-slate-200 dark:border-slate-800 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-red-700 dark:text-red-400 font-bold">moonsav-redis: GET device:PUMP-01:state</span>
                <span className="text-slate-500 dark:text-slate-400">1.4ms (5.6%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-red-500 w-[6%]" style={{ marginLeft: "4%" }} />
              </div>
            </div>

            {/* Span 3: Postgres */}
            <div className="rounded-lg bg-slate-50 dark:bg-black/50 p-2 border border-slate-200 dark:border-slate-800 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-700 dark:text-blue-400 font-bold">moonsav-postgres: INSERT INTO motor_commands</span>
                <span className="text-slate-500 dark:text-slate-400">14.8ms (60.1%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-blue-500 w-[60%]" style={{ marginLeft: "12%" }} />
              </div>
            </div>

            {/* Span 4: MQTT */}
            <div className="rounded-lg bg-slate-50 dark:bg-black/50 p-2 border border-slate-200 dark:border-slate-800 space-y-1 pl-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">moonsav-mqtt-broker: PUBLISH moonsav/PUMP-01/commands</span>
                <span className="text-slate-500 dark:text-slate-400">4.2ms (17.0%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-500 w-[17%]" style={{ marginLeft: "75%" }} />
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
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-neutral-900 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icons.Activity className="w-4 h-4 text-emerald-500" /> Service Level Objectives & Error Budget
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">Continuous reliability monitoring for MOONSAV Smart Infrastructure</p>
        </div>
        <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold">
          SLO HEALTHY
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-black/40 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Motor Availability</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">99.94%</span>
          </div>
          <p className="text-[10px] text-slate-400">Target: 99.9% • Allowed Outage: 43m/mo</p>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1.5">
            <div className="h-full bg-emerald-500 w-[99.94%]" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-black/40 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">P95 Response Time</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">184 ms</span>
          </div>
          <p className="text-[10px] text-slate-400">Target: &lt;300ms • Safe Threshold</p>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1.5">
            <div className="h-full bg-indigo-500 w-[61%]" />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-black/40 p-3.5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Remaining Error Budget</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">94.6%</span>
          </div>
          <p className="text-[10px] text-slate-400">Burn Rate: 1.02x (Normal)</p>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1.5">
            <div className="h-full bg-amber-500 w-[94.6%]" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAB KNOWLEDGE CHECKPOINTS (Hands-on Lab Verification)
// ─────────────────────────────────────────────────────────────────────────────

export function AcademyKnowledgeCheckpoints({ lab, onComplete }) {
  const checkpoints = lab?.checkpoints || [];
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [evaluated, setEvaluated] = useState({});
  const [completedAll, setCompletedAll] = useState(false);

  if (!checkpoints.length) return null;

  const passedCount = Object.keys(evaluated).filter(k => evaluated[k] === true).length;
  const isAllPassed = passedCount === checkpoints.length;

  const handleSelect = (qId, optionIdx) => {
    if (evaluated[qId] === true) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    if (evaluated[qId] === false) {
      setEvaluated(prev => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  const handleVerify = (checkpoint) => {
    const userChoice = selectedAnswers[checkpoint.id];
    if (userChoice === undefined) return;
    const isCorrect = userChoice === checkpoint.correctIndex;
    setEvaluated(prev => {
      const next = { ...prev, [checkpoint.id]: isCorrect };
      const totalPassed = Object.values(next).filter(Boolean).length;
      if (totalPassed === checkpoints.length && !completedAll) {
        setCompletedAll(true);
        onComplete?.();
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-500/25 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-sm space-y-5 my-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
              ?
            </span>
            <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Lab Knowledge Checkpoints
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test your understanding of the operational mechanisms behind this lab scenario ({lab.title}).
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
          isAllPassed
            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
        }`}>
          {passedCount} / {checkpoints.length} Cleared
        </span>
      </div>

      <div className="space-y-4">
        {checkpoints.map((cp, idx) => {
          const isPassed = evaluated[cp.id] === true;
          const isFailed = evaluated[cp.id] === false;
          const selected = selectedAnswers[cp.id];

          return (
            <div
              key={cp.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                isPassed
                  ? "border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                  : isFailed
                  ? "border-rose-500/40 bg-rose-50/40 dark:bg-rose-950/20"
                  : "border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-neutral-800/40"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                  isPassed
                    ? "bg-emerald-600 text-white"
                    : isFailed
                    ? "bg-rose-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}>
                  {isPassed ? "✓" : idx + 1}
                </span>
                <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {cp.question}
                </p>
              </div>

              {/* Options */}
              <div className="mt-3 space-y-2 pl-8">
                {(cp.choices || cp.options || []).map((opt, optIdx) => {
                  const isOptSelected = selected === optIdx;
                  return (
                    <button
                      type="button"
                      key={optIdx}
                      disabled={isPassed}
                      onClick={() => handleSelect(cp.id, optIdx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border flex items-start gap-2.5 ${
                        isOptSelected
                          ? isPassed
                            ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-950 dark:text-emerald-100 font-medium"
                            : isFailed
                            ? "bg-rose-100 dark:bg-rose-900/40 border-rose-500 text-rose-950 dark:text-rose-100"
                            : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-950 dark:text-indigo-200 font-medium"
                          : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center text-[10px] mt-0.5 ${
                        isOptSelected ? "border-indigo-600 bg-indigo-600 text-white font-bold" : "border-slate-300 dark:border-slate-600"
                      }`}>
                        {isOptSelected ? "●" : ""}
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action / Feedback */}
              <div className="mt-3 pl-8 flex items-center justify-between flex-wrap gap-2">
                {!isPassed && (
                  <button
                    type="button"
                    disabled={selected === undefined}
                    onClick={() => handleVerify(cp)}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all disabled:opacity-40 shadow-sm"
                  >
                    Verify Answer
                  </button>
                )}
                {isFailed && (
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Incorrect. Review the scenario and telemetry logs above and retry.
                  </span>
                )}
              </div>

              {/* Technical Analysis Explanation */}
              {isPassed && cp.explanation && (
                <div className="mt-3 ml-8 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">Technical Analysis: </span>
                  {cp.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAllPassed && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h5 className="text-xs md:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                All Lab Checkpoints Verified!
              </h5>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                You have mastered the foundational engineering concepts and runtime triage for this lab scenario.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACK 15-QUESTION FINAL CERTIFICATION EXAMINATION MODAL
// ─────────────────────────────────────────────────────────────────────────────

export function AcademyTrackFinalExam({ trackId, trackTitle, onClose, onPass }) {
  const questions = useMemo(() => getTrackAssessment(trackId), [trackId]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount >= questions.length;
  const progressPct = Math.round((answeredCount / questions.length) * 100);

  const handleSingleSelect = (qId, choiceIdx) => {
    setAnswers(prev => ({ ...prev, [qId]: choiceIdx }));
  };

  const handleMultiSelect = (qId, choiceIdx) => {
    setAnswers(prev => {
      const current = prev[qId] || [];
      const exists = current.includes(choiceIdx);
      const updated = exists ? current.filter(x => x !== choiceIdx) : [...current, choiceIdx];
      return { ...prev, [qId]: updated };
    });
  };

  const handleSubmit = () => {
    const res = submitTrackAssessment(trackId, answers);
    setResult(res);
    if (res.passed) {
      onPass?.(res);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setShowExplanations(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-black/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-mono">
                Official Certification Examination
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">15 Questions · Pass Mark 80%</span>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mt-1">
              {trackTitle || "Track Certification Assessment"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {result ? (
            /* Results Screen */
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto space-y-4">
                <div className={`w-24 h-24 mx-auto rounded-3xl grid place-items-center text-3xl font-extrabold shadow-lg ${
                  result.passed
                    ? "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/20"
                    : "bg-gradient-to-tr from-rose-600 to-amber-500 text-white shadow-rose-500/20"
                }`}>
                  {result.scorePct}%
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {result.passed ? "Certification Examination Passed! 🎓" : "Assessment Complete — Review & Retake"}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {result.passed
                      ? `Outstanding work! You answered ${result.correctCount} of ${result.totalQuestions} questions correctly. +500 XP and verified credential unlocked.`
                      : `You scored ${result.scorePct}% (${result.correctCount} of ${result.totalQuestions} correct). An 80% score (12/15) is required to pass.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Retake Examination
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExplanations(prev => !prev)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                  >
                    {showExplanations ? "Hide Explanations" : "Review All 15 Explanations 💡"}
                  </button>
                  {result.passed && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                    >
                      Done & Return to Studio
                    </button>
                  )}
                </div>
              </div>

              {/* Comprehensive Explanations List */}
              {showExplanations && (
                <div className="mt-8 text-left space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h5 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                    Detailed Question-by-Question Technical Explanations
                  </h5>
                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const userAns = answers[q.id];
                      let isCorrect = false;
                      if (q.questionType === "single") {
                        isCorrect = userAns === q.correctIndex;
                      } else if (q.questionType === "multiple") {
                        const a = [...(userAns || [])].sort((x, y) => x - y);
                        const b = [...(q.correctIndexes || [])].sort((x, y) => x - y);
                        isCorrect = a.length === b.length && a.every((v, i) => v === b[i]);
                      }

                      return (
                        <div
                          key={q.id}
                          className="p-4 md:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-neutral-800/40 space-y-2.5"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}>
                              {isCorrect ? "✓" : idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                                {q.question}
                              </p>
                            </div>
                          </div>

                          {q.explanation && (
                            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed ml-8">
                              <span className="font-bold text-indigo-900 dark:text-indigo-300">Technical Explanation: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Exam Questions */
            <>
              {/* Jump pills bar */}
              <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center flex-wrap gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">
                  Jump to Question:
                </span>
                <div className="flex items-center flex-wrap gap-1.5">
                  {questions.map((q, idx) => {
                    const isAns = answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => {
                          const el = document.getElementById(`track-exam-q-${q.id}`);
                          el?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                          isAns
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                        }`}
                        title={`Question ${idx + 1}: ${isAns ? "Answered" : "Not answered"}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Questions list */}
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const isAns = answers[q.id] !== undefined && (Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : true);
                  const selectedVal = answers[q.id];

                  return (
                    <div
                      key={q.id}
                      id={`track-exam-q-${q.id}`}
                      className={`p-5 rounded-2xl border transition-all ${
                        isAns
                          ? "border-indigo-500/30 bg-indigo-50/[0.03] dark:bg-indigo-500/5 shadow-sm"
                          : "border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-neutral-800/30"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                          isAns ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                            {q.question}
                          </p>
                          {q.questionType === "multiple" && (
                            <span className="inline-block mt-1 text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                              (Select all that apply)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="mt-4 space-y-2 pl-10">
                        {q.choices.map((choice, cIdx) => {
                          const isSelected = q.questionType === "multiple"
                            ? (selectedVal || []).includes(cIdx)
                            : selectedVal === cIdx;

                          return (
                            <button
                              type="button"
                              key={cIdx}
                              onClick={() => {
                                if (q.questionType === "multiple") {
                                  handleMultiSelect(q.id, cIdx);
                                } else {
                                  handleSingleSelect(q.id, cIdx);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-xl text-xs transition-all border flex items-start gap-3 ${
                                isSelected
                                  ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium ring-1 ring-indigo-400"
                                  : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span className={`h-4 w-4 rounded-${q.questionType === "multiple" ? "md" : "full"} border shrink-0 flex items-center justify-center text-[10px] mt-0.5 ${
                                isSelected ? "border-indigo-600 bg-indigo-600 text-white font-bold" : "border-slate-300 dark:border-slate-600"
                              }`}>
                                {isSelected ? "✓" : ""}
                              </span>
                              <span className="flex-1 leading-relaxed">{choice}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-black/20">
            <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Answered: <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> / {questions.length} ({progressPct}%)
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isAllAnswered}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isAllAnswered ? "Submit & Grade 15-Question Exam →" : `Complete All Questions (${answeredCount}/${questions.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
