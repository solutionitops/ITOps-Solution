import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { assignCybersachetCourseToMember, checkLessonAnswer, enrollInCourse, fetchAcademyLicense, fetchCourseLessons, fetchCourseModules, fetchCourseQuiz, fetchCybersachetCourses, fetchCybersachetLeaderboard, fetchCybersachetLicense, fetchLearningPaths, fetchMyCertificate, fetchMyCourseCertificate, fetchMyCybersachetAssignments, fetchMyCybersachetStats, fetchMyEnrollments, fetchMyLessonProgress, fetchMyPermissions, fetchOrganizationMembers, fetchPlanUsage, issueCourseCertificate, issueCybersachetCertificate, PLAN_ORDER, submitCourseQuiz } from "../api/endpoints";
import { LearningPathCard } from "../components/LearningPathCard";
import { CATEGORY_LABELS, getLocalCourses, getLocalEnrollments, getLocalLearningPaths, getLocalLessons, getLocalModules, getLocalQuiz, getLocalStats, localCheckLessonAnswer, localEnroll, localGetLessonProgress, localSubmitQuiz } from "../data/cybersachetCourses";
import { Reveal, SpotlightCard } from "../components/Animated";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { TrainingHero, ProgressRing, CompletionCelebration, LocalPreviewBanner, CourseIcon, CategoryIcon, BadgeChip, BADGE_META, StreakFlame, ModuleProgressBar, Leaderboard, xpLevel } from "../components/CyberSachetTheme";
import { CyberSachetCertificate, CertificationPath, CertificateDownloadCard } from "../components/CyberSachetCertificate";
import { AcademyMark } from "../components/AcademyBrand";
import { TerminalPlayground } from "../components/TerminalPlayground";
import { TERMINAL_DEMOS } from "../data/terminalDemos";
import { InteractiveDiagram } from "../components/InteractiveDiagram";
import { DIAGRAM_DEMOS } from "../data/interactiveDiagrams";
import { LabCard } from "../components/LabCard";
import { InterviewQuestions } from "../components/InterviewQuestions";
import { Flashcards } from "../components/Flashcards";
import { buildCheatSheetText, downloadTextFile } from "../lib/cheatSheet";
import { isPlanAllowed } from "../lib/planTiers";
import { useAuth } from "../context/AuthContext";

const LEVEL_TONE = {
  beginner: "bg-emerald-400/10 light:bg-emerald-100 text-emerald-300 light:text-emerald-700",
  intermediate: "bg-amber-400/10 light:bg-amber-100 text-amber-300 light:text-amber-700",
  advanced: "bg-red-400/10 light:bg-red-100 text-red-300 light:text-red-700"
};
// Progressive-reveal variant for a lesson's content — body, terminal demo,
// key takeaway, checkpoint, and notes fade/slide in one after another
// (via the parent's staggerChildren) instead of all appearing at once.
const FADE_UP = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } };

// ── Per-device notes & bookmarks ────────────────────────────────────────────
// Deliberately local-only (not a database table) — a personal scratchpad
// for a lesson, not shared training-record data. If cross-device notes turn
// out to matter, that's a real follow-up migration, not a guess baked in now.
const NOTES_KEY = "cybersachet-lesson-notes";
const BOOKMARKS_KEY = "cybersachet-lesson-bookmarks";
function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function StatTile({ label, value, suffix = "", icon = null }) {
  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-200/80 bg-white/[0.03] light:bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 light:text-slate-500">{label}</p>
        {icon && <span className="text-sm">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white light:text-slate-900">
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}{suffix}
      </p>
    </div>
  );
}

function CategoryFilterChips({ categories, active, onChange, searchQuery, onSearchChange }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${active === null
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
            : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
            }`}
        >
          All Courses
        </button>
        {categories.map(c => (
          <button
            type="button"
            key={c}
            onClick={() => onChange(c)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${active === c
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md"
              : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 light:border-slate-300 light:bg-slate-100 light:text-slate-700"
              }`}
          >
            <CategoryIcon category={c} size={13} />
            {CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-72">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 light:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={searchQuery ?? ""}
          onChange={e => onSearchChange?.(e.target.value)}
          placeholder="Search courses..."
          className="w-full rounded-full border border-white/15 bg-white/5 pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none light:border-slate-300 light:bg-white light:text-slate-900 light:placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

// Two real, differently-branded products sharing one LMS engine — shown only
// once Academy-track courses actually exist for this org (pre-deploy or for
// an org with only security courses, there's nothing to toggle between).
// Two separate, distinctly-branded products with their own sidebar entry
// and route (/training, /training/academy) — this toggle is a same-page
// shortcut between them, always in sync with the URL via navigate(), never
// a third "combined" view that would blur the two apart.
const TRACKS = [
  { value: "security", label: "CyberSachet", to: "/training" },
  { value: "academy", label: "Moonsav ITOps Academy", to: "/training/academy" }
];
function TrackToggle({ active }) {
  const navigate = useNavigate();
  return (
    <div className="inline-flex gap-1 rounded-full border border-slate-200/90 bg-slate-100/80 dark:border-white/10 dark:bg-slate-900/60 p-1 shadow-inner" role="group" aria-label="Switch training product">
      {TRACKS.map(t => (
        <button
          key={t.value}
          onClick={() => navigate(t.to)}
          aria-current={active === t.value ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${active === t.value
            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold"
            }`}
        >
          {t.value === "academy" && <AcademyMark size={13} />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Org admins (training:manage) can assign a course straight from its
// catalog card instead of only from Users → CyberSachet Training — a
// popover, not a page navigation, since it's a one-field decision (who).
function AssignCourseButton({ course, members }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const assign = useMutation({
    mutationFn: () => assignCybersachetCourseToMember(userId, course.id, dueDate ? new Date(dueDate).toISOString() : null),
    onSuccess: () => { toast.success("Course assigned."); setOpen(false); setUserId(""); setDueDate(""); },
    onError: err => toast.error(err instanceof Error ? err.message : "Failed to assign course")
  });
  return <div className="relative" onClick={e => e.stopPropagation()}>
    <button type="button" onClick={() => setOpen(v => !v)} className="rounded-full border border-white/15 light:border-sky-200 px-2.5 py-1 text-[11px] font-medium text-white/60 light:text-slate-500 transition-colors hover:text-white light:hover:text-slate-900">
      + Assign
    </button>
    <AnimatePresence>
      {open && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-full z-20 mt-1.5 w-56 space-y-2 rounded-xl border border-white/10 light:border-slate-900/10 bg-neutral-950 light:bg-white p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
        <p className="text-xs font-medium text-white light:text-slate-900">Assign "{course.title}"</p>
        <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full rounded-lg border border-white/15 light:border-slate-900/15 bg-black/40 light:bg-slate-900/[0.03] px-2 py-1.5 text-xs text-white light:text-slate-900">
          <option value="">Choose member…</option>
          {members.map(m => <option key={m.userId} value={m.userId}>{m.email}</option>)}
        </select>
        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} title="Due date (optional)" className="w-full rounded-lg border border-white/15 light:border-slate-900/15 bg-black/40 light:bg-slate-900/[0.03] px-2 py-1.5 text-xs text-white light:text-slate-900" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => assign.mutate()} disabled={!userId || assign.isPending} className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black hover:bg-neutral-200 disabled:opacity-50">
            {assign.isPending ? "Assigning…" : "Assign"}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="text-[11px] text-white/40 light:text-slate-400 hover:text-white/70 light:hover:text-slate-600">Cancel</button>
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>;
}

export const COURSE_IMAGES = {
  "phishing-awareness": "/courses/phishing.png",
  "password-security-mfa": "/courses/password_mfa.png",
  "social-engineering": "/courses/social_engineering.png",
  "malware-ransomware": "/courses/malware.png",
  "data-handling-privacy": "/courses/data_privacy.png",
  "mobile-device-security": "/courses/mobile_security.png",
  "physical-security-workplace-awareness": "/courses/physical_security.png",

  // Moonsav ITOps Academy Slugs
  "linux-fundamentals": "/courses/physical_security.png",
  "linux-fundamentals-for-it-operations": "/courses/physical_security.png",
  "networking-fundamentals": "/courses/mobile_security.png",
  "networking-fundamentals-for-it-operations": "/courses/mobile_security.png",
  "cloud-computing-essentials": "/courses/cloud.png",
  "introduction-to-devops-and-cicd": "/courses/social_engineering.png",
  "devops-cicd": "/courses/social_engineering.png",
  "docker-and-container-fundamentals": "/courses/password_mfa.png",
  "docker-containers": "/courses/password_mfa.png",
  "kubernetes-fundamentals": "/courses/phishing.png",
  "kubernetes-fundamentals-pods-and-cluster-triage": "/courses/phishing.png",
  "soc-fundamentals": "/courses/malware.png"
};

export const CATEGORY_IMAGES = {
  "email-security": "/courses/phishing.png",
  "identity": "/courses/password_mfa.png",
  "cybersecurity": "/courses/social_engineering.png",
  "endpoint-security": "/courses/mobile_security.png",
  "data-protection": "/courses/data_privacy.png",
  "physical-security": "/courses/physical_security.png",
  "os-fundamentals": "/courses/physical_security.png",
  "linux": "/courses/physical_security.png",
  "networking": "/courses/mobile_security.png",
  "cloud-computing": "/courses/cloud.png",
  "cloud": "/courses/cloud.png",
  "devops": "/courses/social_engineering.png",
  "containers": "/courses/password_mfa.png",
  "docker": "/courses/password_mfa.png",
  "kubernetes": "/courses/phishing.png",
  "infrastructure": "/courses/mobile_security.png",
  "soc": "/courses/malware.png"
};

const UNIFIED_CTA_BG = "bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white hover:from-rose-400 hover:to-purple-500 shadow-md shadow-rose-500/25";

const COURSE_THEMES = {
  "phishing-awareness": {
    badgeBg: "bg-rose-500 text-white",
    cardBorder: "hover:border-rose-400/60 light:hover:border-rose-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(244,63,94,0.35)]",
    titleHover: "group-hover:text-rose-500 light:group-hover:text-rose-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "password-security-mfa": {
    badgeBg: "bg-cyan-500 text-white",
    cardBorder: "hover:border-cyan-400/60 light:hover:border-cyan-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(6,182,212,0.35)]",
    titleHover: "group-hover:text-cyan-400 light:group-hover:text-blue-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "social-engineering": {
    badgeBg: "bg-amber-500 text-white",
    cardBorder: "hover:border-amber-400/60 light:hover:border-amber-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(245,158,11,0.35)]",
    titleHover: "group-hover:text-amber-400 light:group-hover:text-amber-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "malware-ransomware": {
    badgeBg: "bg-red-600 text-white",
    cardBorder: "hover:border-red-500/60 light:hover:border-red-500",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(220,38,38,0.35)]",
    titleHover: "group-hover:text-red-400 light:group-hover:text-red-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "data-handling-privacy": {
    badgeBg: "bg-emerald-500 text-white",
    cardBorder: "hover:border-emerald-400/60 light:hover:border-emerald-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(16,185,129,0.35)]",
    titleHover: "group-hover:text-emerald-400 light:group-hover:text-emerald-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "mobile-device-security": {
    badgeBg: "bg-purple-600 text-white",
    cardBorder: "hover:border-purple-400/60 light:hover:border-purple-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(147,51,234,0.35)]",
    titleHover: "group-hover:text-purple-400 light:group-hover:text-purple-600",
    ctaBg: UNIFIED_CTA_BG
  },
  "physical-security-workplace-awareness": {
    badgeBg: "bg-indigo-600 text-white",
    cardBorder: "hover:border-indigo-400/60 light:hover:border-indigo-400",
    glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(79,70,229,0.35)]",
    titleHover: "group-hover:text-indigo-400 light:group-hover:text-indigo-600",
    ctaBg: UNIFIED_CTA_BG
  }
};

const DEFAULT_THEME = {
  badgeBg: "bg-blue-600 text-white",
  cardBorder: "hover:border-blue-400/60 light:hover:border-blue-400",
  glowColor: "group-hover:shadow-[0_12px_30px_-6px_rgba(37,99,235,0.35)]",
  titleHover: "group-hover:text-blue-400 light:group-hover:text-blue-600",
  ctaBg: UNIFIED_CTA_BG
};

export function AnimatedCourseHeaderBackground({ courseSlug, category }) {
  const slugStr = (courseSlug ?? "").toLowerCase();
  const catStr = (category ?? "").toLowerCase();

  const isLinux = slugStr.includes("linux") || catStr.includes("linux") || catStr.includes("os");
  const isNetwork = slugStr.includes("networking") || slugStr.includes("network") || (catStr.includes("infrastructure") && !slugStr.includes("devops") && !slugStr.includes("cloud") && !slugStr.includes("docker"));
  const isCloud = slugStr.includes("cloud") || catStr.includes("cloud");
  const isDocker = slugStr.includes("docker") || slugStr.includes("container");
  const isK8s = slugStr.includes("kubernetes") || slugStr.includes("k8s") || slugStr.includes("pod");
  const isDevOps = (slugStr.includes("devops") || catStr.includes("devops") || slugStr.includes("cicd")) && !isDocker && !isK8s;
  const isMalware = slugStr.includes("malware") || slugStr.includes("ransomware") || catStr.includes("malware") || catStr.includes("endpoint");
  const isPhishing = slugStr.includes("phishing") || catStr.includes("phishing") || catStr.includes("email");
  const isPassword = slugStr.includes("password") || catStr.includes("password") || catStr.includes("identity");
  const isSocial = slugStr.includes("social") || catStr.includes("social") || catStr.includes("cybersecurity");
  const isPrivacy = slugStr.includes("privacy") || catStr.includes("privacy") || catStr.includes("data");
  const isSoc = slugStr.includes("soc") || catStr.includes("soc") || catStr.includes("monitoring") || catStr.includes("incident");

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* Ambient Gradient Glow Blobs */}
      <div
        className={`absolute -left-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-35 transition-all ${isLinux ? "bg-amber-600" : isNetwork ? "bg-blue-600" : isCloud ? "bg-sky-500" : isDevOps ? "bg-teal-500" : isDocker ? "bg-cyan-600" : isK8s ? "bg-violet-600" : isMalware ? "bg-rose-600" : isPhishing ? "bg-cyan-500" : isPassword ? "bg-amber-500" : isSocial ? "bg-purple-500" : "bg-indigo-500"
          }`}
      />
      <div
        className={`absolute -right-10 bottom-0 h-56 w-56 rounded-full blur-3xl opacity-30 transition-all ${isLinux ? "bg-orange-500" : isNetwork ? "bg-indigo-600" : isCloud ? "bg-blue-600" : isDevOps ? "bg-emerald-500" : isDocker ? "bg-blue-500" : isK8s ? "bg-purple-600" : isMalware ? "bg-red-600" : isPhishing ? "bg-blue-600" : isPassword ? "bg-emerald-500" : isSocial ? "bg-violet-600" : "bg-sky-500"
          }`}
      />

      {/* Linux Fundamentals 3D Terminal & Command Prompt */}
      {isLinux && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -12, 0],
            rotate: [0, 4, 0]
          }}
          transition={{
            x: { duration: 16, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(245,158,11,0.7)]"
        >
          <svg className="w-40 h-24" viewBox="0 0 100 65" fill="none">
            <rect x="5" y="5" width="90" height="55" rx="6" fill="#090d16" stroke="#f59e0b" strokeWidth="2" />
            <rect x="5" y="5" width="90" height="14" rx="6" fill="#1e293b" />
            <circle cx="14" cy="12" r="2.5" fill="#ef4444" />
            <circle cx="22" cy="12" r="2.5" fill="#f59e0b" />
            <circle cx="30" cy="12" r="2.5" fill="#10b981" />
            <text x="10" y="30" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">user@itops:~$</text>
            <text x="10" y="42" fill="#f59e0b" fontSize="8" fontFamily="monospace">systemctl status nginx</text>
            <text x="10" y="52" fill="#38bdf8" fontSize="7" fontFamily="monospace">[● ACTIVE] Running</text>
          </svg>
        </motion.div>
      )}

      {/* Networking Fundamentals 3D Router & Fiber Optic Packets */}
      {isNetwork && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -10, 0]
          }}
          transition={{
            x: { duration: 15, repeat: Infinity, ease: "linear" },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(37,99,235,0.75)]"
        >
          <svg className="w-44 h-24" viewBox="0 0 110 60" fill="none">
            <rect x="10" y="18" width="90" height="32" rx="6" fill="#1e1b4b" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="24" cy="34" r="4" fill="#22c55e" />
            <circle cx="38" cy="34" r="4" fill="#22c55e" />
            <circle cx="52" cy="34" r="4" fill="#3b82f6" />
            <circle cx="66" cy="34" r="4" fill="#3b82f6" />
            <circle cx="80" cy="34" r="4" fill="#60a5fa" />
            <path d="M15 18 V8 M35 18 V8 M55 18 V8" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
            <circle cx="15" cy="6" r="2" fill="#93c5fd" />
            <circle cx="35" cy="6" r="2" fill="#93c5fd" />
            <circle cx="55" cy="6" r="2" fill="#93c5fd" />
            <text x="12" y="44" fill="#a5b4fc" fontSize="6" fontFamily="monospace">192.168.1.1/24</text>
          </svg>
        </motion.div>
      )}

      {/* Cloud Computing Essentials 3D Volumetric Cloud & EC2 Nodes */}
      {isCloud && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -12, 0]
          }}
          transition={{
            x: { duration: 17, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(14,165,233,0.75)]"
        >
          <svg className="w-40 h-24" viewBox="0 0 90 60" fill="none">
            <defs>
              <linearGradient id="cloudGrad3D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path d="M65 48 H25 A15 15 0 0 1 18 22 A20 20 0 0 1 55 14 A20 20 0 0 1 80 30 A14 14 0 0 1 65 48 Z" fill="url(#cloudGrad3D)" stroke="#bae6fd" strokeWidth="2" />
            <rect x="35" y="32" width="20" height="12" rx="2" fill="#0f172a" stroke="#7dd3fc" strokeWidth="1" />
            <circle cx="40" cy="38" r="1.5" fill="#22c55e" />
            <circle cx="46" cy="38" r="1.5" fill="#38bdf8" />
          </svg>
        </motion.div>
      )}

      {/* DevOps & CI/CD 3D Infinity Pipeline Loop */}
      {isDevOps && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -14, 0],
            rotate: [0, 10, 0]
          }}
          transition={{
            x: { duration: 17, repeat: Infinity, ease: "linear" },
            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(20,184,166,0.75)]"
        >
          <svg className="w-40 h-24" viewBox="0 0 90 60" fill="none">
            <path d="M25 30 C 10 15, 10 45, 25 30 C 40 15, 45 15, 65 30 C 80 45, 80 15, 65 30 C 45 45, 40 45, 25 30 Z" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" />
            <circle cx="25" cy="30" r="4" fill="#ffffff" />
            <circle cx="65" cy="30" r="4" fill="#ffffff" />
            <text x="45" y="52" textAnchor="middle" fill="#99f6e4" fontSize="8" fontWeight="bold" fontFamily="monospace">BUILD ▶ DEPLOY</text>
          </svg>
        </motion.div>
      )}

      {/* Docker & Container Fundamentals 3D Isometric Vessel */}
      {isDocker && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -12, 0]
          }}
          transition={{
            x: { duration: 16, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(6,182,212,0.75)]"
        >
          <svg className="w-40 h-24" viewBox="0 0 90 60" fill="none">
            <rect x="15" y="20" width="18" height="14" rx="2" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
            <rect x="36" y="20" width="18" height="14" rx="2" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
            <rect x="57" y="20" width="18" height="14" rx="2" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.5" />
            <rect x="36" y="4" width="18" height="14" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M10 42 C 30 50, 60 50, 80 42 L 75 52 H 15 Z" fill="#155e75" stroke="#22d3ee" strokeWidth="1.5" />
          </svg>
        </motion.div>
      )}

      {/* Kubernetes Fundamentals 3D Control Plane Wheel & Pods */}
      {isK8s && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            scale: [1, 1.08, 1],
            rotate: [0, 360]
          }}
          transition={{
            x: { duration: 18, repeat: Infinity, ease: "linear" },
            rotate: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_20px_rgba(147,51,234,0.75)]"
        >
          <svg className="w-24 h-24" viewBox="0 0 70 70" fill="none">
            <polygon points="35,5 61,20 61,50 35,65 9,50 9,20" fill="#6b21a8" fillOpacity="0.4" stroke="#c084fc" strokeWidth="2.5" />
            <circle cx="35" cy="35" r="10" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
            <path d="M35 5 V25 M61 20 L44 30 M61 50 L44 40 M35 65 V45 M9 50 L26 40 M9 20 L26 30" stroke="#e9d5ff" strokeWidth="2" />
          </svg>
        </motion.div>
      )}

      {/* Malware & Ransomware Futuristic Holographic 3D Art Concept */}
      {isMalware && (
        <>
          {/* Continuous Threat Radar Laser Sweep */}
          <motion.div
            animate={{ y: ["-100%", "300%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-rose-500/25 to-transparent border-b border-rose-500/50 z-0"
          />

          {/* RESPONSIVE HOLOGRAPHIC WORKSTATION & HELPLESS USER SILHOUETTE */}
          <motion.div
            animate={{
              y: [0, -6, 0]
            }}
            transition={{
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-2 right-4 md:right-16 z-0 opacity-40 md:opacity-100 scale-75 md:scale-100 filter drop-shadow-[0_10px_30px_rgba(244,63,94,0.75)]"
          >
            <svg className="w-40 h-32 md:w-48 md:h-36" viewBox="0 0 160 120" fill="none">
              <defs>
                <linearGradient id="holoScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#4c0519" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <radialGradient id="corruptedCrimsonGlow" cx="50%" cy="50%" r="55%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="70%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#4c0519" />
                </radialGradient>
              </defs>

              {/* Reflective Dark Grid Floor */}
              <ellipse cx="80" cy="105" rx="70" ry="12" fill="#030712" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              {/* Corroding Blue-to-Crimson Network Circuit Lines */}
              <path d="M10 105 H60 M100 105 H150 M40 105 V90 M120 105 V90" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
              <path d="M50 105 C65 95, 75 95, 90 105" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 4" />

              {/* Helpless User Silhouette (Holding Head over Keyboard) */}
              <path d="M25 102 C25 86, 38 78, 45 74 C41 68, 40 60, 43 54 C46 48, 54 46, 60 48 C63 51, 63 56, 60 62 C56 68, 52 70, 52 76 C60 78, 70 86, 70 102 Z" fill="#1e293b" opacity="0.85" />
              <circle cx="52" cy="48" r="8" fill="#334155" />
              {/* Hands Over Head / Keyboard Gesture */}
              <path d="M42 60 C36 54, 34 48, 42 42 M62 60 C68 54, 70 48, 62 42" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

              {/* Holographic Workstation Bezel */}
              <rect x="70" y="10" width="82" height="58" rx="6" fill="url(#holoScreenGrad)" stroke="#f43f5e" strokeWidth="2.5" />
              <rect x="74" y="14" width="74" height="50" rx="4" fill="url(#corruptedCrimsonGlow)" />

              {/* Dissolving Trojan Horse Binary Swarm Flooding Screen */}
              <text x="78" y="28" fill="#ffe4e6" fontSize="8" fontFamily="monospace" opacity="0.95">101011001</text>
              <text x="78" y="40" fill="#f43f5e" fontSize="8" fontFamily="monospace" opacity="0.95">010010110</text>
              <text x="78" y="52" fill="#ffe4e6" fontSize="8" fontFamily="monospace" opacity="0.95">SYSTEM LOCK</text>
            </svg>
          </motion.div>

          {/* MASSIVE NEON-RED HOLOGRAPHIC RANSOM LOCK & TICKING COUNTDOWN */}
          <motion.div
            animate={{
              left: ["70%", "78%", "70%"],
              y: [0, -10, 0],
              scale: [1, 1.06, 1]
            }}
            transition={{
              left: { duration: 18, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-2 z-0 opacity-40 md:opacity-100 scale-75 md:scale-100 filter drop-shadow-[0_10px_32px_rgba(244,63,94,0.9)]"
          >
            <svg className="w-24 h-24 md:w-28 md:h-28" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="neonPadlockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff0055" />
                  <stop offset="50%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#4c0519" />
                </linearGradient>
              </defs>
              {/* Heavy Shackle */}
              <path d="M30 40 V24 C30 12, 70 12, 70 24 V40" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />
              <path d="M30 40 V24 C30 12, 70 12, 70 24 V40" stroke="#f43f5e" strokeWidth="3.5" strokeLinecap="round" />
              {/* Lock Body */}
              <rect x="20" y="38" width="60" height="48" rx="8" fill="url(#neonPadlockGrad)" stroke="#ffe4e6" strokeWidth="2" />
              {/* Ticking Countdown HUD & Currency Symbol */}
              <text x="50" y="58" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">47:59:59</text>
              <circle cx="50" cy="72" r="8" fill="#881337" stroke="#ffffff" strokeWidth="1" />
              <text x="50" y="76" textAnchor="middle" fill="#fef08a" fontSize="12" fontWeight="bold">₿</text>
            </svg>
          </motion.div>

          {/* DISINTEGRATING BINARY TROJAN HORSE */}
          <motion.div
            animate={{
              left: ["-10%", "35%", "-10%"],
              y: [0, -10, 0],
              rotate: [0, 4, -4, 0]
            }}
            transition={{
              left: { duration: 30, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-2 z-0 opacity-50 md:opacity-100 filter drop-shadow-[0_6px_18px_rgba(244,63,94,0.75)] text-rose-500"
          >
            <svg className="w-20 h-20" viewBox="0 0 70 70" fill="none">
              <defs>
                <linearGradient id="trojanBinaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
              </defs>
              <path d="M15 55 L22 35 L18 20 L28 10 L40 10 L48 20 L38 28 L42 38 L55 38 L60 55 H15 Z" fill="url(#trojanBinaryGrad)" stroke="#ffe4e6" strokeWidth="1.5" />
              <path d="M28 10 L20 4 L14 12 L18 20" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
              <circle cx="24" cy="12" r="2" fill="#ffffff" />
              <circle cx="22" cy="58" r="4.5" fill="#4c0519" stroke="#fda4af" strokeWidth="1.5" />
              <circle cx="52" cy="58" r="4.5" fill="#4c0519" stroke="#fda4af" strokeWidth="1.5" />
              {/* Disintegrating Binary Particle Swarm */}
              <text x="44" y="24" fill="#ffffff" fontSize="5" fontFamily="monospace" opacity="0.8">101</text>
              <text x="50" y="32" fill="#fda4af" fontSize="5" fontFamily="monospace" opacity="0.8">010</text>
              <text x="54" y="44" fill="#ffffff" fontSize="5" fontFamily="monospace" opacity="0.8">110</text>
            </svg>
          </motion.div>

          {/* REAL 3D WRIGGLING WORM (Top Track) */}
          <motion.div
            animate={{
              x: ["-25%", "118%"],
              y: [0, -14, 12, -8, 0],
              rotate: [0, 10, -10, 5, 0]
            }}
            transition={{
              x: { duration: 18, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-1 left-0 z-0 opacity-40 md:opacity-100 filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.6)]"
          >
            <svg className="w-36 h-16" viewBox="0 0 160 60" fill="none">
              <defs>
                <linearGradient id="wormGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="35%" stopColor="#f43f5e" />
                  <stop offset="70%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ff0040" />
                </linearGradient>
                <radialGradient id="wormHead3D" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffe4e6" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#9f1239" />
                </radialGradient>
                <radialGradient id="wormSegment3D" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="60%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#881337" />
                </radialGradient>
              </defs>
              <path d="M15 30 Q 40 5, 65 30 T 115 30 T 145 30" stroke="url(#wormGradient)" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M15 30 Q 40 5, 65 30 T 115 30 T 145 30" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 8" strokeLinecap="round" fill="none" opacity="0.8" />
              <circle cx="20" cy="27" r="7" fill="url(#wormSegment3D)" />
              <circle cx="42" cy="15" r="7.5" fill="url(#wormSegment3D)" />
              <circle cx="65" cy="30" r="7" fill="url(#wormSegment3D)" />
              <circle cx="90" cy="22" r="7" fill="url(#wormSegment3D)" />
              <circle cx="115" cy="30" r="7.5" fill="url(#wormSegment3D)" />
              <circle cx="138" cy="29" r="8" fill="url(#wormSegment3D)" />
              <circle cx="148" cy="30" r="9.5" fill="url(#wormHead3D)" />
              <circle cx="151" cy="26" r="2.2" fill="#ffffff" />
              <circle cx="151" cy="26" r="1.1" fill="#000000" />
              <circle cx="151" cy="34" r="2.2" fill="#ffffff" />
              <circle cx="151" cy="34" r="1.1" fill="#000000" />
              <path d="M152 23 C156 16, 160 12, 162 10" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="162" cy="10" r="2.5" fill="#ffe4e6" />
              <path d="M152 37 C156 44, 160 48, 162 50" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
              <circle cx="162" cy="50" r="2.5" fill="#ffe4e6" />
            </svg>
          </motion.div>
        </>
      )}

      {/* Phishing Awareness Realistic 3D Animated Background */}
      {isPhishing && (
        <>
          <motion.div
            animate={{
              x: ["-20%", "115%"],
              y: [0, -16, 0],
              rotate: [0, 12, -8, 0]
            }}
            transition={{
              x: { duration: 15, repeat: Infinity, ease: "linear" },
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-4 left-0 z-0 filter drop-shadow-[0_6px_16px_rgba(6,182,212,0.6)]"
          >
            <svg className="w-16 h-16" viewBox="0 0 60 60" fill="none">
              <defs>
                <linearGradient id="mailGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#164e63" />
                </linearGradient>
              </defs>
              <rect x="5" y="15" width="50" height="35" rx="6" fill="url(#mailGrad3D)" stroke="#a5f3fc" strokeWidth="1.5" />
              <path d="M5 18 L30 36 L55 18" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 48 L22 32 M55 48 L38 32" stroke="#a5f3fc" strokeWidth="1.5" opacity="0.8" />
            </svg>
          </motion.div>
        </>
      )}

      {/* Password & MFA Security Realistic 3D Animated Background */}
      {isPassword && (
        <>
          <motion.div
            animate={{
              x: ["-20%", "115%"],
              y: [0, -16, 0],
              rotate: [0, -10, 0]
            }}
            transition={{
              x: { duration: 16, repeat: Infinity, ease: "linear" },
              y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-4 left-0 z-0 filter drop-shadow-[0_6px_16px_rgba(245,158,11,0.65)]"
          >
            <svg className="w-16 h-16" viewBox="0 0 60 60" fill="none">
              <defs>
                <linearGradient id="lockBody3D" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
                <linearGradient id="shackle3D" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>
              <path d="M18 25 V14 C18 7, 42 7, 42 14 V25" stroke="url(#shackle3D)" strokeWidth="6" strokeLinecap="round" />
              <rect x="10" y="24" width="40" height="32" rx="6" fill="url(#lockBody3D)" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="30" cy="37" r="4" fill="#451a03" />
              <path d="M30 40 V47" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.div>
        </>
      )}

      {/* Social Engineering Realistic 3D Radar Target */}
      {isSocial && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            scale: [1, 1.15, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            x: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_16px_rgba(168,85,247,0.65)]"
        >
          <svg className="w-16 h-16" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="26" stroke="#c084fc" strokeWidth="2" strokeDasharray="6 4" />
            <circle cx="30" cy="30" r="16" stroke="#a855f7" strokeWidth="2.5" />
            <circle cx="30" cy="30" r="6" fill="#9333ea" />
            <path d="M30 0 V60 M0 30 H60" stroke="#e9d5ff" strokeWidth="1.5" />
          </svg>
        </motion.div>
      )}

      {/* Cloud Security Realistic 3D Volumetric Cloud */}
      {isCloud && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -12, 0]
          }}
          transition={{
            x: { duration: 17, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_18px_rgba(14,165,233,0.65)]"
        >
          <svg className="w-18 h-16" viewBox="0 0 70 50" fill="none">
            <defs>
              <linearGradient id="cloudGrad3D" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path d="M50 42 H18 A12 12 0 0 1 12 19 A16 16 0 0 1 42 12 A16 16 0 0 1 62 26 A10 10 0 0 1 50 42 Z" fill="url(#cloudGrad3D)" stroke="#bae6fd" strokeWidth="1.5" />
          </svg>
        </motion.div>
      )}

      {/* Data Privacy Realistic 3D Gold Seal Shield Document */}
      {isPrivacy && (
        <motion.div
          animate={{
            x: ["-20%", "115%"],
            y: [0, -14, 0],
            rotate: [0, 6, 0]
          }}
          transition={{
            x: { duration: 16, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-3 left-0 z-0 filter drop-shadow-[0_6px_16px_rgba(16,185,129,0.65)]"
        >
          <svg className="w-16 h-18" viewBox="0 0 50 60" fill="none">
            <defs>
              <linearGradient id="docGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
            </defs>
            <path d="M10 5 H32 L44 17 V52 A4 4 0 0 1 40 56 H10 A4 4 0 0 1 6 52 V9 A4 4 0 0 1 10 5 Z" fill="url(#docGrad3D)" stroke="#d1fae5" strokeWidth="1.5" />
            <path d="M32 5 V17 H44" stroke="#d1fae5" strokeWidth="1.5" />
            <path d="M14 26 H36 M14 34 H36 M14 42 H26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

function CourseCard({ course, enrollment, index, assignment, onOpen, canManageTraining, members }) {
  const pct = enrollment && course.lessonCount > 0 ? Math.round((enrollment.completedLessonCount / course.lessonCount) * 100) : 0;
  const displayPct = enrollment?.completedAt ? 100 : pct;
  const isCompleted = !!enrollment?.completedAt;
  const isInProgress = !!enrollment && !isCompleted;
  const bgImage = COURSE_IMAGES[course.slug] ?? CATEGORY_IMAGES[course.category] ?? "/courses/phishing.png";
  const theme = COURSE_THEMES[course.slug] ?? DEFAULT_THEME;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(course)}
      onKeyDown={e => { if (e.key === "Enter") onOpen(course); }}
      className="group block h-full w-full cursor-pointer text-left focus:outline-none"
    >
      <SpotlightCard tint={isCompleted ? "emerald" : "rose"} delay={index * 0.05} className={`h-full overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/80 bg-neutral-900/90 light:bg-white shadow-sm light:shadow-md transition-all duration-300 group-hover:-translate-y-1 ${theme.glowColor}`}>
        <div className="flex h-full flex-col">
          {/* Coursera/Udemy Style Course Header Banner with Image Background */}
          <div className="relative h-40 w-full overflow-hidden border-b border-white/10 light:border-slate-200">
            <img
              src={bgImage}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/30" />

            {/* Content inside top banner */}
            <div className="relative z-10 flex flex-col justify-between h-full p-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${LEVEL_TONE[course.level] ?? LEVEL_TONE.beginner}`}>
                    {course.level}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${theme.badgeBg}`}>
                    <CategoryIcon category={course.category} size={11} />
                    {CATEGORY_LABELS[course.category] ?? course.category}
                  </span>
                  {assignment && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Assigned
                    </span>
                  )}
                  {course.freeTier && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Free
                    </span>
                  )}
                </div>
                {canManageTraining && <AssignCourseButton course={course} members={members} />}
              </div>

              <div className="flex items-center justify-between gap-3">
                <CourseIcon slug={course.slug} size={38} />
                <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-semibold text-white border border-white/20 shadow-sm">
                  {course.estimatedMinutes} min
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col p-5 pt-4 bg-neutral-900/90 light:bg-white">
            <h3 className={`text-base font-bold tracking-tight text-white light:text-slate-900 transition-colors ${theme.titleHover}`}>
              {course.title}
            </h3>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-white/60 light:text-slate-600 line-clamp-3">
              {course.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 light:border-slate-100 pt-3 text-xs text-white/50 light:text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5">
                {course.lessonCount} Lessons
              </span>
              <span>{course.quizQuestionCount} Quiz Qs</span>
            </div>

            {/* Progress & CTA */}
            <div className="mt-4 space-y-2.5">
              {enrollment ? (
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                    <span className={isCompleted ? "text-emerald-400 font-bold" : "text-cyan-400 light:text-blue-600 font-bold"}>
                      {isCompleted ? "✓ Completed" : `${displayPct}% Complete`}
                    </span>
                    <span className="text-white/40 light:text-slate-400">
                      {enrollment.completedLessonCount}/{course.lessonCount} Lessons
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 light:bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-cyan-400 to-blue-500"}`}
                      style={{ width: `${displayPct}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] ${isCompleted
                  ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 hover:bg-emerald-500/20"
                  : isInProgress
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500"
                    : theme.ctaBg
                  }`}
              >
                {isCompleted ? "Review Course →" : isInProgress ? "Continue Learning →" : "Start Course →"}
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

const COURSE_YOUTUBE_VIDEOS = {
  // Cybersecurity & Email Security
  "phishing-awareness": { videoId: "inWWhr5tnEA", title: "Phishing & Cybersecurity Full Course" },
  "local-phishing-awareness": { videoId: "inWWhr5tnEA", title: "Phishing & Cybersecurity Full Course" },
  "phishing": { videoId: "inWWhr5tnEA", title: "Phishing & Cybersecurity Full Course" },
  
  "password-security-mfa": { videoId: "L50O_8c4oK8", title: "Password Security & Multi-Factor Authentication" },
  "local-password-mfa": { videoId: "L50O_8c4oK8", title: "Password Security & Multi-Factor Authentication" },
  "password": { videoId: "L50O_8c4oK8", title: "Password Security & Multi-Factor Authentication" },

  "social-engineering": { videoId: "inWWhr5tnEA", title: "Social Engineering Attacks & Human Hacking" },
  "local-social-engineering": { videoId: "inWWhr5tnEA", title: "Social Engineering Attacks & Human Hacking" },

  "malware-ransomware": { videoId: "inWWhr5tnEA", title: "Malware & Ransomware Technical Overview" },
  "local-malware-ransomware": { videoId: "inWWhr5tnEA", title: "Malware & Ransomware Technical Overview" },
  "malware": { videoId: "inWWhr5tnEA", title: "Malware & Ransomware Technical Overview" },

  "data-handling-privacy": { videoId: "inWWhr5tnEA", title: "Data Handling & Privacy Security Course" },
  "local-data-handling": { videoId: "inWWhr5tnEA", title: "Data Handling & Privacy Security Course" },

  "mobile-device-security": { videoId: "L50O_8c4oK8", title: "Mobile & Endpoint Device Security Best Practices" },
  "local-mobile-device-security": { videoId: "L50O_8c4oK8", title: "Mobile & Endpoint Device Security Best Practices" },

  "physical-security-workplace-awareness": { videoId: "inWWhr5tnEA", title: "Physical Security & Workplace Awareness" },
  "local-physical-security": { videoId: "inWWhr5tnEA", title: "Physical Security & Workplace Awareness" },

  "soc-fundamentals": { videoId: "inWWhr5tnEA", title: "SOC Analyst Fundamentals & Incident Response" },
  "local-soc-fundamentals": { videoId: "inWWhr5tnEA", title: "SOC Analyst Fundamentals & Incident Response" },

  // Moonsav ITOps Academy Courses
  "linux-fundamentals": { videoId: "sWb4zeF1yLY", title: "Linux Operating System - freeCodeCamp Full Course" },
  "linux-fundamentals-for-it-operations": { videoId: "sWb4zeF1yLY", title: "Linux Operating System - freeCodeCamp Full Course" },
  "local-linux-fundamentals": { videoId: "sWb4zeF1yLY", title: "Linux Operating System - freeCodeCamp Full Course" },
  "linux": { videoId: "sWb4zeF1yLY", title: "Linux Operating System - freeCodeCamp Full Course" },

  "networking-fundamentals": { videoId: "IPvYjXCsTg8", title: "Computer Networking Fundamentals & Protocols" },
  "networking-fundamentals-for-it-operations": { videoId: "IPvYjXCsTg8", title: "Computer Networking Fundamentals & Protocols" },
  "networking": { videoId: "IPvYjXCsTg8", title: "Computer Networking Fundamentals & Protocols" },

  "cloud-computing-essentials": { videoId: "M988_fsOSWo", title: "Cloud Computing Essentials (AWS, Azure & IaaS)" },
  "cloud": { videoId: "M988_fsOSWo", title: "Cloud Computing Essentials (AWS, Azure & IaaS)" },

  "introduction-to-devops-and-cicd": { videoId: "j5Zsa_1qOzU", title: "DevOps & CI/CD Pipeline Engineering" },
  "devops-cicd": { videoId: "j5Zsa_1qOzU", title: "DevOps & CI/CD Pipeline Engineering" },
  "devops": { videoId: "j5Zsa_1qOzU", title: "DevOps & CI/CD Pipeline Engineering" },

  "docker-and-container-fundamentals": { videoId: "fqMOX6JJhGo", title: "Docker & Container Architecture Full Course" },
  "docker-containers": { videoId: "fqMOX6JJhGo", title: "Docker & Container Architecture Full Course" },
  "docker": { videoId: "fqMOX6JJhGo", title: "Docker & Container Architecture Full Course" },

  "kubernetes-fundamentals": { videoId: "d6WC5n9G_sM", title: "Kubernetes Cluster Architecture & Pod Triage" },
  "kubernetes-fundamentals-pods-and-cluster-triage": { videoId: "d6WC5n9G_sM", title: "Kubernetes Cluster Architecture & Pod Triage" },
  "kubernetes": { videoId: "d6WC5n9G_sM", title: "Kubernetes Cluster Architecture & Pod Triage" }
};

function InteractiveLessonVideo({ title, category, courseSlug }) {
  const [viewMode, setViewMode] = useState("youtube"); // "youtube" | "simulator"
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(18);
  const [speed, setSpeed] = useState(1);
  const [showCC, setShowCC] = useState(true);

  const slugStr = (courseSlug ?? "").toLowerCase();
  const ytInfo = COURSE_YOUTUBE_VIDEOS[slugStr] || 
                 Object.entries(COURSE_YOUTUBE_VIDEOS).find(([k]) => slugStr.includes(k))?.[1] || 
                 COURSE_YOUTUBE_VIDEOS["phishing-awareness"];

  useEffect(() => {
    let timer;
    if (isPlaying && viewMode === "simulator") {
      timer = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5 * speed));
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, viewMode]);

  const durationSec = 270;
  const currentSec = Math.floor((progress / 100) * durationSec);
  const formatTime = s => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLinux = slugStr.includes("linux");
  const isCloud = slugStr.includes("cloud") || slugStr.includes("devops") || slugStr.includes("docker") || slugStr.includes("kubernetes");

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl text-white my-2">
      {/* Video Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-white/10 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-white/90 font-bold truncate max-w-xs md:max-w-md">{title} — Course Video Lesson</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("youtube")}
            className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
              viewMode === "youtube" ? "bg-red-600 text-white shadow-sm" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            🎬 YouTube Video
          </button>
          <button
            onClick={() => setViewMode("simulator")}
            className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all ${
              viewMode === "simulator" ? "bg-indigo-600 text-white shadow-sm" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            ⚙ Cyber Simulator
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${ytInfo.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open reference video on YouTube in a safe new tab"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2.5 py-1 text-[10px] font-bold shadow-sm transition-all hover:scale-105"
          >
            <span>↗ Watch on YouTube</span>
          </a>
        </div>
      </div>

      {/* Video / Simulator Canvas */}
      {viewMode === "youtube" ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytInfo.videoId}?rel=0&modestbranding=1`}
            title={ytInfo.title}
            className="w-full h-full min-h-[340px] md:min-h-[440px] rounded-b-2xl border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* 100% Secure In-House Interactive Animated Video Screen Canvas */
        <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center overflow-hidden group select-none">
          {/* Animated Cyber Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
          
          {/* Category-Specific Animated Live Telemetry Graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center p-4 md:p-6 text-center space-y-4 max-w-xl w-full">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-2xl border border-white/20 bg-slate-900/90 p-5 backdrop-blur-xl shadow-2xl space-y-3.5 w-full text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider">
                  {isLinux ? "MOONSAV LINUX ENGINE v4.2" : isCloud ? "DEVOPS TELEMETRY v3.8" : "ACADEMY THREAT ENGINE v5.0"}
                </span>
              </div>

              {isLinux ? (
                <div className="space-y-2 text-xs font-mono">
                  <p className="text-emerald-400 font-bold">$ sudo systemctl status nginx.service</p>
                  <p className="text-slate-300">● nginx.service - High performance web server</p>
                  <p className="text-sky-300">Loaded: loaded (/lib/systemd/system/nginx.service; enabled)</p>
                  <p className="text-emerald-400 font-bold">Active: active (running) since Mon 2026-08-10 16:30:00 UTC</p>
                  <p className="text-slate-400 text-[11px]">Tasks: 4 (limit: 4915), Memory: 12.4M, CPU: 42ms</p>
                </div>
              ) : isCloud ? (
                <div className="space-y-2 text-xs font-mono">
                  <p className="text-cyan-400 font-bold">[K8s CLUSTER] Deploying container pod replica set...</p>
                  <p className="text-slate-300">Pod: itops-auth-service-7f99b4d8c-2x9lq (Running)</p>
                  <p className="text-emerald-400 font-bold">✔ HEALTH CHECK: HTTP 200 OK (Latency: 1.4ms)</p>
                  <p className="text-indigo-300 font-bold">🚀 CI/CD PIPELINE: Auto-scaling cluster to 5 nodes</p>
                </div>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  <p className="text-emerald-400 font-bold">[VIDEO DEMO] Inspecting live email headers &amp; attack vectors...</p>
                  <p className="text-slate-300">From: Security Alert &lt;alert@paypa1-update.com&gt;</p>
                  <p className="text-rose-400 font-bold">⚠ WARNING: SPF/DKIM Alignment Failed (Typosquatting Detected)</p>
                  <p className="text-sky-300 font-bold">✔ ACTION: 1-Click SOC Report Dispatched to Threat Engine</p>
                </div>
              )}
            </motion.div>

            {/* Big Center Play/Pause Overlay Button */}
            {!isPlaying && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.7)] transition-all hover:scale-110 z-20"
              >
                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}

            {/* Closed Captions Subtitle Box */}
            {showCC && (
              <div className="absolute bottom-4 inset-x-6 z-20 pointer-events-none">
                <span className="inline-block bg-black/85 backdrop-blur-md px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-white border border-white/10 shadow-md">
                  {progress < 25 && "Welcome to this interactive walkthrough. Learn the core principles and indicators step by step."}
                  {progress >= 25 && progress < 50 && "Inspect the parameters carefully to ensure protocol compliance and security alignment."}
                  {progress >= 50 && progress < 75 && "Execute recommended emergency response protocols or terminal commands immediately upon detection."}
                  {progress >= 75 && "Complete the knowledge check below to verify your mastery and unlock the next lesson."}
                </span>
              </div>
            )}
          </div>

          {/* Video Scrubber & Control Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 space-y-2 z-30">
            {/* Scrubber Progress Bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = (clickX / rect.width) * 100;
                setProgress(Math.max(0, Math.min(100, newPct)));
              }}
              className="h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden relative group/bar"
            >
              <div
                className="h-full bg-emerald-400 rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-emerald-400 transition-colors p-1"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>

                <span className="font-mono text-[11px] text-white/80">
                  {formatTime(currentSec)} / {formatTime(durationSec)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
                  className="rounded bg-white/10 hover:bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white font-mono"
                >
                  {speed}x
                </button>

                <button
                  onClick={() => setShowCC(!showCC)}
                  className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${showCC ? "bg-emerald-600 text-white" : "bg-white/10 text-white/60"}`}
                >
                  CC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PLAN_LABEL = { STARTER: "Starter", PROFESSIONAL: "Professional", BUSINESS: "Business", ENTERPRISE: "Enterprise" };

function LockedCourseCard({ course, index }) {
  const requiredPlan = PLAN_LABEL[course.minPlan] ?? "Professional";
  return (
    <SpotlightCard tint="white" delay={index * 0.05} className="h-full border-dashed opacity-70">
      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-xl bg-white/[0.06] light:bg-slate-900/[0.05] text-white/40 light:text-slate-400" aria-hidden>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.7" /><path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.7" /></svg>
          </span>
          <span className="text-xs text-white/40 light:text-slate-400">{course.estimatedMinutes} min</span>
        </div>
        <h3 className="mt-3 text-base font-semibold text-white/70 light:text-slate-600">{course.title}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-white/40 light:text-slate-400">{course.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 light:border-slate-900/10 pt-3">
          <span className="text-xs text-white/45 light:text-slate-400">🔒 {requiredPlan} plan required</span>
          <Link to="/team" className="shrink-0 rounded-full bg-gradient-to-r from-rose-500 to-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:opacity-90">
            Upgrade
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

// A full custom clickable card, not a native radio/checkbox behind a
// <label> — the whole card is the hit target (no more clicking half an
// inch of text and nothing happening), the indicator's fill/checkmark is
// its own animated element (not relying on a browser's native accent-color
// rendering, which varies enough between browsers/themes to look "broken"
// even when the underlying state is correct), and shape (circle vs square)
// carries the single-vs-multiple-answer meaning at a glance.
function ChoiceOption({ selected, onClick, shape = "circle", children }) {
  return <button type="button" onClick={onClick} aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-150 ${selected ? "border-rose-400/60 light:border-sky-500/60 bg-rose-400/[0.09] light:bg-sky-100 text-white light:text-slate-900" : "border-white/10 light:border-slate-900/10 text-white/70 light:text-slate-600 hover:border-white/20 light:hover:border-slate-900/20 hover:bg-white/[0.03] light:hover:bg-slate-900/[0.02]"}`}>
    <span className={`grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors ${shape === "circle" ? "rounded-full" : "rounded-[5px]"} ${selected ? "border-rose-400 light:border-sky-500 bg-rose-400 light:bg-sky-500" : "border-white/25 light:border-slate-900/25"}`}>
      <AnimatePresence>
        {selected && (shape === "circle"
          ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} className="h-2 w-2 rounded-full bg-white" />
          : <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 25 }} className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>)}
      </AnimatePresence>
    </span>
    <span className="flex-1">{children}</span>
  </button>;
}

function LessonCheck({ check, onCheck }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [checking, setChecking] = useState(false);
  async function submit() {
    if (selected == null || checking) return;
    setChecking(true);
    try {
      const correct = await onCheck(selected);
      setFeedback(correct ? "correct" : "wrong");
      if (!correct) setTimeout(() => setFeedback(null), 1800);
    } catch {
      // Toasted by the mutation's onError already.
    } finally {
      setChecking(false);
    }
  }
  if (feedback === "correct") {
    return <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-400/10 light:bg-emerald-100 px-3 py-2.5 text-sm text-emerald-300 light:text-emerald-700">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>✓</motion.span>
      Correct — lesson complete.
    </motion.div>;
  }
  return <div className="mt-4 rounded-xl border border-rose-400/20 light:border-sky-300/40 bg-rose-400/[0.04] light:bg-sky-50 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-rose-300 light:text-sky-700">Knowledge checkpoint</p>
    <p className="mt-1.5 text-sm text-white/85 light:text-slate-800">{check.question}</p>
    <div className="mt-3 space-y-2">
      {check.choices.map((c, ci) => <ChoiceOption key={ci} selected={selected === ci} onClick={() => setSelected(ci)}>{c}</ChoiceOption>)}
    </div>
    {feedback === "wrong" && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-amber-300 light:text-amber-600">Not quite — review the lesson above and try again.</motion.p>}
    <button onClick={submit} disabled={selected == null || checking} className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-neutral-200 disabled:opacity-50">
      {checking ? "Checking…" : "Check answer"}
    </button>
  </div>;
}

function LessonNote({ lessonId }) {
  const { user } = useAuth();
  const notesKey = `${NOTES_KEY}:${user?.id ?? "anon"}`;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => readJSON(notesKey, {})[lessonId] ?? "");
  function save(v) {
    setText(v);
    const notes = readJSON(notesKey, {});
    if (v.trim()) notes[lessonId] = v; else delete notes[lessonId];
    localStorage.setItem(notesKey, JSON.stringify(notes));
  }
  return <div className="mt-3">
    <button onClick={() => setOpen(o => !o)} className="text-xs text-white/40 light:text-slate-400 hover:text-white/70 light:hover:text-slate-600">
      {open ? "Hide my notes" : text ? "📝 My notes (saved)" : "+ Add a note"}
    </button>
    {open && <textarea value={text} onChange={e => save(e.target.value)} rows={3} placeholder="Jot down anything worth remembering — saved on this device only." className="mt-2 w-full rounded-lg border border-white/10 light:border-slate-900/10 bg-black/20 light:bg-slate-900/[0.02] px-3 py-2 text-xs text-white light:text-slate-900 placeholder:text-white/30 light:placeholder:text-slate-400 focus:outline-none" />}
  </div>;
}

function LessonPane({ lesson, index, total, done, locked, bookmarked, onToggleBookmark, onCheck }) {
  const [expanded, setExpanded] = useState(!locked && !done);
  const wasLocked = useRef(locked);
  useEffect(() => {
    // A lesson that just became unlocked (finishing the one before it)
    // should open on its own — the `useState` initializer above only runs
    // once at mount, while this lesson was still a locked, collapsed row.
    if (wasLocked.current && !locked) setExpanded(true);
    wasLocked.current = locked;
  }, [locked]);
  if (locked) {
    return <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 light:border-slate-900/10 px-4 py-2.5 text-sm text-white/35 light:text-slate-400">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.04] light:bg-slate-900/[0.04] text-[11px]" aria-hidden>🔒</span>
      <span className="flex-1 truncate">{lesson.title}</span>
      <span className="shrink-0 text-[11px]">Complete the previous lesson to unlock</span>
    </div>;
  }
  return <div className="relative flex gap-4">
    <div className="flex flex-col items-center">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${done ? "bg-emerald-400 text-black" : "bg-rose-400/15 light:bg-sky-100 text-rose-300 light:text-sky-700"}`}>
        {done ? "✓" : index + 1}
      </span>
      {index < total - 1 && <span className="mt-1 w-px flex-1 bg-white/10 light:bg-slate-900/10" />}
    </div>
    <SpotlightCard className="mb-3 flex-1 p-5" tint="rose">
      <div className="flex items-start justify-between gap-4">
        <button onClick={() => setExpanded(e => !e)} className="flex-1 text-left text-sm font-medium text-white light:text-slate-900">
          {lesson.title}
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {done && <span className="rounded-full bg-emerald-400/10 light:bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-300 light:text-emerald-700">✓ Done</span>}
          <button onClick={() => onToggleBookmark(lesson.id)} aria-label="Bookmark this lesson" className={bookmarked ? "text-amber-300" : "text-white/25 light:text-slate-300 hover:text-white/50 light:hover:text-slate-400"}>
            {bookmarked ? "★" : "☆"}
          </button>
          <button onClick={() => setExpanded(e => !e)} aria-label="Expand lesson" className="text-white/40 light:text-slate-400">
            <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      {expanded && <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } } }}>
        <motion.p variants={FADE_UP} className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/60 light:text-slate-600">{lesson.body}</motion.p>
        {DIAGRAM_DEMOS[lesson.title] && <motion.div variants={FADE_UP}><InteractiveDiagram diagram={DIAGRAM_DEMOS[lesson.title]} /></motion.div>}
        {lesson.lab && <motion.div variants={FADE_UP}><LabCard lab={lesson.lab} /></motion.div>}
        {TERMINAL_DEMOS[lesson.title] && <motion.div variants={FADE_UP}><TerminalPlayground demos={TERMINAL_DEMOS[lesson.title]} /></motion.div>}
        {lesson.keyTakeaway && <motion.div variants={FADE_UP} className="relative mt-4 overflow-hidden rounded-xl border border-emerald-400/25 light:border-emerald-500/25 bg-emerald-400/[0.06] light:bg-emerald-50 px-4 py-3 shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_28px_-10px_rgba(16,185,129,0.55)]">
          <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-emerald-400/20 blur-2xl" aria-hidden />
          <p className="relative flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300 light:text-emerald-700">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" fill="currentColor" /></svg>
            Key takeaway
          </p>
          <p className="relative mt-1 text-sm text-white/85 light:text-slate-700">{lesson.keyTakeaway}</p>
        </motion.div>}
        {!done && lesson.check && <motion.div variants={FADE_UP}><LessonCheck check={lesson.check} onCheck={onCheck} /></motion.div>}
        <motion.div variants={FADE_UP}><LessonNote lessonId={lesson.id} /></motion.div>
      </motion.div>}
    </SpotlightCard>
  </div>;
}

// `lockedIds` is computed once, course-wide, by the caller — a module only
// ever renders a slice of the course's lessons, so it must never re-derive
// "is the previous lesson done" from its own local slice (that would treat
// every module's first lesson as automatically unlocked, letting someone
// skip straight to module 2 without finishing module 1).
function ModuleSection({ mod, lessons, progress, lockedIds, bookmarks, onToggleBookmark, onCheck }) {
  const completed = lessons.filter(l => progress?.has(l.id)).length;
  const pct = lessons.length > 0 ? Math.round(completed / lessons.length * 100) : 0;
  return <div id={`module-${mod.id}`} className="scroll-mt-24">
    <div className="mb-3 flex items-center justify-between gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50 light:text-slate-500">{mod.title}</h3>
      <span className="shrink-0 text-xs text-white/40 light:text-slate-400">{completed}/{lessons.length} complete</span>
    </div>
    <div className="mb-4"><ModuleProgressBar pct={pct} tone={pct === 100 ? "emerald" : "rose"} /></div>
    {lessons.map((lesson, i) => {
      const done = progress?.has(lesson.id) ?? false;
      return <LessonPane key={lesson.id} lesson={lesson} index={i} total={lessons.length} done={done} locked={lockedIds.has(lesson.id)} bookmarked={bookmarks.has(lesson.id)} onToggleBookmark={onToggleBookmark} onCheck={choiceIndex => onCheck(lesson.id, choiceIndex)} />;
    })}
    <InterviewQuestions questions={mod.interviewQuestions} />
  </div>;
}

function SingleChoiceQuestion({ q, value, onChange }) {
  return <div className="mt-3 space-y-2">
    {q.choices.map((c, ci) => <ChoiceOption key={ci} selected={value === ci} onClick={() => onChange(ci)}>{c}</ChoiceOption>)}
  </div>;
}

function MultipleChoiceQuestion({ q, value, onChange }) {
  const selected = value ?? [];
  function toggle(ci) {
    onChange(selected.includes(ci) ? selected.filter(x => x !== ci) : [...selected, ci]);
  }
  return <div className="mt-3 space-y-2">
    <p className="text-[11px] text-white/40 light:text-slate-400">Select all that apply.</p>
    {q.choices.map((c, ci) => <ChoiceOption key={ci} shape="square" selected={selected.includes(ci)} onClick={() => toggle(ci)}>{c}</ChoiceOption>)}
  </div>;
}

function OrderingQuestion({ q, value, onChange }) {
  const order = value ?? q.choices.map((_, i) => i);
  function move(pos, dir) {
    const next = [...order];
    const swap = pos + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[pos], next[swap]] = [next[swap], next[pos]];
    onChange(next);
  }
  return <div className="mt-3 space-y-2">
    <p className="text-[11px] text-white/40 light:text-slate-400">Arrange in the correct order — use the arrows to reorder.</p>
    <AnimatePresence initial={false}>
      {order.map((choiceIdx, pos) => <motion.div layout key={choiceIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="flex items-center gap-3 rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] px-4 py-3 text-sm text-white/80 light:text-slate-700">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-400/15 light:bg-sky-100 text-xs font-semibold text-rose-300 light:text-sky-700">{pos + 1}</span>
        <span className="flex-1">{q.choices[choiceIdx]}</span>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => move(pos, -1)} disabled={pos === 0} aria-label="Move up" className="grid h-7 w-7 place-items-center rounded-lg text-white/50 light:text-slate-500 transition-colors hover:bg-white/5 light:hover:bg-slate-900/5 hover:text-white light:hover:text-slate-900 disabled:opacity-20 disabled:hover:bg-transparent">▲</button>
          <button type="button" onClick={() => move(pos, 1)} disabled={pos === order.length - 1} aria-label="Move down" className="grid h-7 w-7 place-items-center rounded-lg text-white/50 light:text-slate-500 transition-colors hover:bg-white/5 light:hover:bg-slate-900/5 hover:text-white light:hover:text-slate-900 disabled:opacity-20 disabled:hover:bg-transparent">▼</button>
        </div>
      </motion.div>)}
    </AnimatePresence>
  </div>;
}

function questionAnswered(q, v) {
  if (q.questionType === "multiple") return Array.isArray(v) && v.length > 0;
  if (q.questionType === "ordering") return Array.isArray(v);
  return v !== undefined;
}

function QuizPane({ courseId, questions, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const toast = useToast();
  const submit = useMutation({
    mutationFn: () => onSubmit(courseId, answers),
    onError: err => toast.error(err instanceof Error ? err.message : "Failed to submit quiz")
  });
  const answeredCount = questions.filter(q => questionAnswered(q, answers[q.id])).length;
  const allAnswered = answeredCount === questions.length;
  return <SpotlightCard className="p-6" tint="rose">
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-medium text-white light:text-slate-900">Final assessment</h4>
        <span className="text-xs font-medium text-white/45 light:text-slate-400">{answeredCount}/{questions.length} answered</span>
      </div>
      <p className="mt-0.5 text-xs text-white/40 light:text-slate-400">{questions.length} question{questions.length === 1 ? "" : "s"} · pass with 70% or higher</p>
      <div className="mt-3"><ModuleProgressBar pct={Math.round(answeredCount / questions.length * 100)} /></div>
    </div>
    <div className="space-y-8">
      {questions.map((q, i) => {
        const answered = questionAnswered(q, answers[q.id]);
        return <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.35, delay: Math.min(i, 4) * 0.05 }} className={`rounded-2xl border p-5 transition-colors ${answered ? "border-emerald-400/25 light:border-emerald-500/25 bg-emerald-400/[0.02] light:bg-emerald-50/40" : "border-white/10 light:border-slate-900/10"}`}>
          <div className="flex items-start gap-3">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors ${answered ? "bg-emerald-400 text-black" : "bg-white/10 light:bg-slate-900/8 text-white/60 light:text-slate-500"}`}>
              {answered ? "✓" : i + 1}
            </span>
            <p className="text-sm font-medium text-white/85 light:text-slate-800">{q.question}</p>
          </div>
          {q.questionType === "multiple" ? <MultipleChoiceQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />
            : q.questionType === "ordering" ? <OrderingQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />
              : <SingleChoiceQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />}
        </motion.div>;
      })}
    </div>
    <button onClick={() => submit.mutate()} disabled={!allAnswered || submit.isPending} className="mt-6 w-full rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-3 text-xs font-bold shadow-md transition-all hover:bg-slate-800 disabled:opacity-50">
      {submit.isPending ? "Submitting…" : allAnswered ? "Submit Quiz" : `Answer all questions to submit (${answeredCount}/${questions.length})`}
    </button>
  </SpotlightCard>;
}

function SpotTheRedFlagsExercise() {
  const [foundFlags, setFoundFlags] = useState(new Set());
  const redFlags = [
    { id: "domain", title: "Free/Personal Email Domain", text: "From: amazon-support@gmail.com — Major companies never use free gmail.com domains." },
    { id: "reward", title: "Unexpected Reward", text: "Subject: $500 Amazon credit — Unsolicited prizes are classic lure tactics." },
    { id: "attachment", title: "Dangerous Executable (.exe)", text: "Attachment: Payment_Form.exe — .exe files can install malware immediately." },
    { id: "urgency", title: "Manufactured Urgency", text: "Excited, urgent tone pushing immediate action before verifying." }
  ];

  function toggleFlag(id) {
    setFoundFlags(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-amber-300/40 bg-amber-950/20 p-5 space-y-4 text-white my-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <span>🔍</span> Interactive Exercise — Spot the Red Flags
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">Click the elements in the email below to identify all 4 red flags!</p>
        </div>
        <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 text-xs font-mono font-bold">
          {foundFlags.size} / 4 Found
        </span>
      </div>

      {/* Email Inspection Box */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-3 font-sans text-xs">
        <div
          onClick={() => toggleFlag("domain")}
          className={`p-2.5 rounded-lg cursor-pointer transition-all border ${foundFlags.has("domain") ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold" : "border-slate-800 hover:border-amber-400/50 bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">From:</span> <span className="underline">amazon-support@gmail.com</span> {foundFlags.has("domain") && "✓ [Red Flag: Free domain]"}
        </div>
        <div
          onClick={() => toggleFlag("reward")}
          className={`p-2.5 rounded-lg cursor-pointer transition-all border ${foundFlags.has("reward") ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold" : "border-slate-800 hover:border-amber-400/50 bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Subject:</span> <span className="underline">Congratulations! You have won $500 in Amazon credit</span> {foundFlags.has("reward") && "✓ [Red Flag: Unexpected reward]"}
        </div>
        <div
          onClick={() => toggleFlag("attachment")}
          className={`p-2.5 rounded-lg cursor-pointer transition-all border ${foundFlags.has("attachment") ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold" : "border-slate-800 hover:border-amber-400/50 bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Attachment:</span> <span className="underline font-mono text-rose-400">Payment_Form.exe</span> {foundFlags.has("attachment") && "✓ [Red Flag: Dangerous .exe file]"}
        </div>
        <div
          onClick={() => toggleFlag("urgency")}
          className={`p-2.5 rounded-lg cursor-pointer transition-all border ${foundFlags.has("urgency") ? "border-emerald-400 bg-emerald-950/40 text-emerald-300 font-bold" : "border-slate-800 hover:border-amber-400/50 bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Body:</span> Claim your $500 gift card right now by running the attached payment form! {foundFlags.has("urgency") && "✓ [Red Flag: Manufactured urgency]"}
        </div>
      </div>

      {/* Unlocked Explanations List */}
      {foundFlags.size > 0 && (
        <div className="space-y-2 pt-1">
          {redFlags.filter(f => foundFlags.has(f.id)).map(f => (
            <div key={f.id} className="text-xs bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-200">
              <span className="font-bold">✓ {f.title}:</span> {f.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CourseDetail({ course, enrollment, local, onBack, onProgress }) {
  const { user } = useAuth();
  const bookmarksKey = `${BOOKMARKS_KEY}:${user?.id ?? "anon"}`;
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [activeTab, setActiveTab] = useState("lesson"); // "lesson" | "quiz" | "capstone"
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => new Set(readJSON(bookmarksKey, [])));
  function toggleBookmark(lessonId) {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId); else next.add(lessonId);
      localStorage.setItem(bookmarksKey, JSON.stringify([...next]));
      return next;
    });
  }

  const fns = useMemo(() => local ? {
    modules: () => Promise.resolve(getLocalModules(course.id)),
    lessons: () => Promise.resolve(getLocalLessons(course.id)),
    quiz: () => Promise.resolve(getLocalQuiz(course.id)),
    enroll: () => localEnroll(course.id, user?.id),
    progress: () => localGetLessonProgress(course.id, user?.id),
    checkAnswer: (lessonId, choiceIndex) => localCheckLessonAnswer(course.id, lessonId, choiceIndex, user?.id),
    submitQuiz: (courseId, answers) => localSubmitQuiz(courseId, answers, user?.id)
  } : {
    modules: () => fetchCourseModules(course.id),
    lessons: () => fetchCourseLessons(course.id),
    quiz: () => fetchCourseQuiz(course.id),
    enroll: () => enrollInCourse(course.id),
    progress: () => fetchMyLessonProgress(course.id),
    checkAnswer: (lessonId, choiceIndex) => checkLessonAnswer(lessonId, choiceIndex),
    submitQuiz: (courseId, answers) => submitCourseQuiz(courseId, answers)
  }, [local, course.id, user?.id]);

  const { data: modules } = useQuery({ queryKey: ["cybersachet-modules", local, course.id], queryFn: fns.modules });
  const { data: lessons } = useQuery({ queryKey: ["cybersachet-lessons", local, course.id], queryFn: fns.lessons });
  const { data: quiz, isLoading: quizLoading } = useQuery({ queryKey: ["cybersachet-quiz", local, course.id], queryFn: fns.quiz, enabled: course.quizQuestionCount > 0 });
  const enroll = useMutation({ mutationFn: fns.enroll, onSuccess: onProgress, onError: err => toast.error(err instanceof Error ? err.message : "Failed to enroll") });
  const { data: progress, refetch: refetchProgress } = useQuery({ queryKey: ["cybersachet-lesson-progress", local, course.id], queryFn: fns.progress, enabled: !!enrollment });
  const check = useMutation({
    mutationFn: ({ lessonId, choiceIndex }) => fns.checkAnswer(lessonId, choiceIndex),
    onSuccess: correct => { if (correct) { onProgress(); refetchProgress(); } },
    onError: err => toast.error(err instanceof Error ? err.message : "Failed to check answer")
  });
  const [lastScore, setLastScore] = useState(enrollment?.quizScore ?? null);

  useEffect(() => {
    if (lessons && lessons.length > 0 && !activeLessonId) {
      const firstUndone = lessons.find(l => !progress?.has(l.id));
      setActiveLessonId(firstUndone ? firstUndone.id : lessons[0].id);
    }
  }, [lessons, progress, activeLessonId]);

  const filteredLessons = useMemo(() => {
    if (!lessons) return [];
    if (!search.trim()) return lessons;
    const q = search.trim().toLowerCase();
    return lessons.filter(l => l.title.toLowerCase().includes(q) || l.body.toLowerCase().includes(q));
  }, [lessons, search]);

  const groups = useMemo(() => {
    const mods = modules ?? [];
    if (mods.length === 0) return [{ id: "_all", title: "Lessons", lessons: filteredLessons }];
    return [
      ...mods.map(m => ({ id: m.id, title: m.title, interviewQuestions: m.interviewQuestions ?? [], lessons: filteredLessons.filter(l => l.moduleId === m.id) })),
      { id: "_ungrouped", title: "More lessons", lessons: filteredLessons.filter(l => !l.moduleId) }
    ].filter(g => g.lessons.length > 0);
  }, [modules, filteredLessons]);

  const lockedIds = useMemo(() => {
    const locked = new Set();
    const all = lessons ?? [];
    let prevDone = true;
    for (const lesson of all) {
      const done = progress?.has(lesson.id) ?? false;
      if (!done && !prevDone) locked.add(lesson.id);
      prevDone = done;
    }
    return locked;
  }, [lessons, progress]);

  const activeLesson = (lessons ?? []).find(l => l.id === activeLessonId) ?? (lessons ?? [])[0];
  const activeLessonIndex = (lessons ?? []).findIndex(l => l.id === activeLessonId);
  const completedCount = (lessons ?? []).filter(l => progress?.has(l.id)).length;
  const coursePct = (lessons ?? []).length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <span>←</span> Back to All Courses
        </button>
        <div className="flex items-center gap-2">
          {(lessons?.length ?? 0) > 0 && (
            <button onClick={() => setShowFlashcards(true)} className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
              Flashcards
            </button>
          )}
          {(lessons?.length ?? 0) > 0 && (
            <button onClick={() => downloadTextFile(`${course.slug}-cheat-sheet.txt`, buildCheatSheetText(course, modules, lessons, TERMINAL_DEMOS))} className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
              Download Cheat Sheet
            </button>
          )}
        </div>
      </div>

      {/* Executive Animated Course Banner Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative isolate overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 md:p-8 text-slate-900 dark:text-white shadow-sm transition-all"
      >
        {/* Animated Category-Specific Background Graphics */}
        <AnimatedCourseHeaderBackground courseSlug={course.slug} category={course.category} />

        <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${LEVEL_TONE[course.level] ?? LEVEL_TONE.beginner}`}>
                {course.level}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:text-white/90 border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
                <CategoryIcon category={course.category} size={11} />
                {CATEGORY_LABELS[course.category] ?? course.category}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                {course.estimatedMinutes} min duration
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {course.title}
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              {course.description}
            </p>
          </div>

          <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-3 shrink-0">
            {!enrollment ? (
              <button
                onClick={() => enroll.mutate()}
                disabled={enroll.isPending}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-sm font-bold shadow-md transition-all disabled:opacity-50"
              >
                {enroll.isPending ? "Enrolling…" : "Enroll & Start Course"}
              </button>
            ) : (
              <div className="w-full sm:w-64 rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/10 p-4 backdrop-blur-md space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                  <span>Course Progress</span>
                  <span>{coursePct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${coursePct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                  />
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-white/70">
                  {completedCount} of {(lessons ?? []).length} lessons completed
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Coursera 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sticky Syllabus Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-neutral-900 p-4.5 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Syllabus & Modules
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {completedCount}/{(lessons ?? []).length} Done
              </span>
            </div>

            {/* Lesson Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter syllabus…"
              className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />

            {/* Syllabus Modules */}
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
              {groups.map(g => (
                <div key={g.id} className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
                    {g.title}
                  </p>
                  <div className="space-y-1 relative">
                    {g.lessons.map((lesson, idx) => {
                      const isDone = progress?.has(lesson.id);
                      const isLocked = lockedIds.has(lesson.id);
                      const isActive = activeTab === "lesson" && activeLessonId === lesson.id;

                      return (
                        <motion.button
                          key={lesson.id}
                          disabled={isLocked}
                          whileHover={{ scale: isLocked ? 1 : 1.01, x: isLocked ? 0 : 2 }}
                          whileTap={{ scale: isLocked ? 1 : 0.98 }}
                          onClick={() => {
                            setActiveTab("lesson");
                            setActiveLessonId(lesson.id);
                          }}
                          className={`relative w-full flex items-center justify-between text-left p-3 rounded-xl text-xs font-medium transition-all ${isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold"
                            : isDone
                              ? "bg-emerald-50/70 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100/70"
                              : isLocked
                                ? "opacity-50 cursor-not-allowed text-slate-400"
                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 truncate z-10">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${isDone
                              ? "bg-emerald-500 text-white"
                              : isActive
                                ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                                : isLocked
                                  ? "bg-slate-200 dark:bg-white/10 text-slate-500"
                                  : "bg-slate-200 dark:bg-white/15 text-slate-700 dark:text-slate-300"
                              }`}>
                              {isDone ? "✓" : isLocked ? "🔒" : idx + 1}
                            </span>
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {bookmarks.has(lesson.id) && <span className="text-amber-500 text-xs shrink-0 z-10">★</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Assessment & Capstone links */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
                {course.capstone && (
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("capstone")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${activeTab === "capstone"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-purple-50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-300 hover:bg-purple-100"
                      }`}
                  >
                    <span>Capstone Project</span>
                  </motion.button>
                )}

                {course.quizQuestionCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("quiz")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${activeTab === "quiz"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100"
                      }`}
                  >
                    <span>Final Assessment Quiz</span>
                    {lastScore !== null && <span className="text-[10px] bg-indigo-200 dark:bg-indigo-500/30 px-2 py-0.5 rounded-full">{lastScore}%</span>}
                  </motion.button>
                )}

                {((lastScore !== null && lastScore >= 70) || !!enrollment?.completedAt) && (
                  <motion.button
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("certificate")}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${activeTab === "certificate"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300 hover:bg-emerald-100"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🎓</span>
                      <span>Course Certificate</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      EARNED
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Main Animated Content Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "lesson" && activeLesson ? (
              <motion.div
                key={`lesson-${activeLesson.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Lesson Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Lesson {activeLessonIndex + 1} of {(lessons ?? []).length}
                    </p>
                    <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {progress?.has(activeLesson.id) && (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        ✓ Completed
                      </span>
                    )}
                    <button
                      onClick={() => toggleBookmark(activeLesson.id)}
                      title="Bookmark lesson"
                      className="rounded-full p-2 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {bookmarks.has(activeLesson.id) ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                {/* Embedded Video & Interactive Simulator */}
                <InteractiveLessonVideo
                  title={activeLesson.title}
                  category={course?.category}
                  courseSlug={course?.slug}
                />

                {/* Lesson Body Prose */}
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                  {activeLesson.body}
                </div>

                {/* Key Takeaway */}
                {activeLesson.keyTakeaway && (
                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-500/10 p-5 shadow-sm space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      Key Takeaway
                    </p>
                    <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed">
                      {activeLesson.keyTakeaway}
                    </p>
                  </div>
                )}

                {/* Interactive Visual Demos */}
                {DIAGRAM_DEMOS[activeLesson.title] && (
                  <div className="mt-4">
                    <InteractiveDiagram diagram={DIAGRAM_DEMOS[activeLesson.title]} />
                  </div>
                )}
                {activeLesson.lab && (
                  <div className="mt-4">
                    <LabCard lab={activeLesson.lab} />
                  </div>
                )}
                {TERMINAL_DEMOS[activeLesson.title] && (
                  <div className="mt-4">
                    <TerminalPlayground demos={TERMINAL_DEMOS[activeLesson.title]} />
                  </div>
                )}

                {/* Interactive Red Flags Exercise for Phishing */}
                {(activeLesson.title?.toLowerCase().includes("red flag") || activeLesson.title?.toLowerCase().includes("phishing")) && (
                  <SpotTheRedFlagsExercise />
                )}

                {/* Knowledge Check */}
                {!progress?.has(activeLesson.id) && activeLesson.check && (
                  <div className="mt-6">
                    <LessonCheck
                      check={activeLesson.check}
                      onCheck={choiceIndex => check.mutateAsync({ lessonId: activeLesson.id, choiceIndex })}
                    />
                  </div>
                )}

                {/* Personal Notes */}
                <LessonNote lessonId={activeLesson.id} />

                {/* Footer Navigation Buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-6 mt-6">
                  <button
                    onClick={() => {
                      if (activeLessonIndex > 0) setActiveLessonId(lessons[activeLessonIndex - 1].id);
                    }}
                    disabled={activeLessonIndex <= 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    ← Previous Lesson
                  </button>

                  <button
                    onClick={() => {
                      if (activeLessonIndex < (lessons ?? []).length - 1) {
                        setActiveLessonId(lessons[activeLessonIndex + 1].id);
                      } else if (course.quizQuestionCount > 0) {
                        setActiveTab("quiz");
                      }
                    }}
                    className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold shadow-sm transition-all"
                  >
                    <span>{activeLessonIndex < (lessons ?? []).length - 1 ? "Next Lesson" : "Proceed to Final Quiz"}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </motion.div>
            ) : activeTab === "capstone" && course.capstone ? (
              <motion.div
                key="capstone"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <SpotlightCard className="p-6 md:p-8" tint="violet">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Capstone Project</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{course.capstone.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{course.capstone.description}</p>
                  {course.capstone.requirements?.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {course.capstone.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="mt-0.5 shrink-0 text-violet-500 font-bold">✓</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {course.capstone.deliverable && (
                    <p className="mt-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-slate-900 dark:text-white">Deliverable: </span>
                      {course.capstone.deliverable}
                    </p>
                  )}
                </SpotlightCard>
              </motion.div>
            ) : activeTab === "quiz" && course.quizQuestionCount > 0 ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                id="module-_assessment"
                className="space-y-6"
              >
                {lastScore !== null ? (
                  <SpotlightCard className="p-6 md:p-8 text-center" tint="rose">
                    <CompletionCelebration score={lastScore} />
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button onClick={() => setLastScore(null)} className="rounded-xl border border-slate-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                        Retake Quiz
                      </button>
                      {lastScore >= 70 && (
                        <button onClick={() => setActiveTab("certificate")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all">
                          View Official Certificate 🎓
                        </button>
                      )}
                    </div>
                  </SpotlightCard>
                ) : quizLoading ? (
                  <Skeleton className="h-40 rounded-2xl" />
                ) : quiz && quiz.length > 0 ? (
                  <QuizPane
                    courseId={course.id}
                    questions={quiz}
                    onSubmit={async (courseId, answers) => {
                      const score = await fns.submitQuiz(courseId, answers);
                      setLastScore(score);
                      onProgress();
                      return score;
                    }}
                  />
                ) : null}
              </motion.div>
            ) : activeTab === "certificate" || (lastScore !== null && lastScore >= 70) ? (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CourseCertificateSection
                  course={course}
                  enrollment={enrollment}
                  score={lastScore ?? enrollment?.quizScore}
                  local={local}
                  passed={(lastScore !== null && lastScore >= 70) || !!enrollment?.completedAt}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {showFlashcards && (
        <Flashcards
          cards={(lessons ?? []).filter(l => l.keyTakeaway).map(l => ({ front: l.title, back: l.keyTakeaway }))}
          onClose={() => setShowFlashcards(false)}
        />
      )}
    </div>
  );
}

function CourseCertificateSection({ course, enrollment, score, local, passed }) {
  const { user, organization } = useAuth();
  const toast = useToast();
  const { data: certificate, refetch } = useQuery({
    queryKey: ["cybersachet-course-certificate", course.id],
    queryFn: () => fetchMyCourseCertificate(course.id),
    enabled: !local && passed
  });
  const issue = useMutation({
    mutationFn: () => issueCourseCertificate(course.id),
    onSuccess: () => refetch(),
    onError: err => toast.error(err instanceof Error ? err.message : "Couldn't issue certificate")
  });

  if (!passed) return null;

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Official Credential
            </span>
            {score != null && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Passed with {score}% Score
              </span>
            )}
          </div>
          <h2 className="mt-1 text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Certificate of Completion
          </h2>
        </div>
      </div>

      {local ? (
        <div className="space-y-4">
          <CyberSachetCertificate
            preview
            brand={course.track === "academy" ? "academy" : "cybersachet"}
            userName={user?.name}
            orgName={organization?.name ?? "Your organization"}
            courseTitle={course.title}
            score={score ?? 0}
            averageScore={score ?? 0}
            hoursTrained={Math.round((course.estimatedMinutes / 60) * 10) / 10}
            issuedAt={enrollment?.completedAt ?? new Date().toISOString()}
            expiresAt={new Date(new Date(enrollment?.completedAt ?? Date.now()).setFullYear(new Date(enrollment?.completedAt ?? Date.now()).getFullYear() + 1)).toISOString()}
          />
          <p className="mx-auto max-w-md text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
            This is a preview of your official verifiable certificate of completion.
          </p>
        </div>
      ) : certificate ? (
        <div id={`course-certificate-${course.id}`}>
          <CertificateDownloadCard verifyPath={`/verify/${certificate.certificateNo}`}>
            <CyberSachetCertificate
              brand={course.track === "academy" ? "academy" : "cybersachet"}
              userName={user?.name}
              orgName={organization?.name}
              certId={certificate.certificateNo}
              score={certificate.averageScore}
              averageScore={certificate.averageScore}
              courseTitle={certificate.courseTitle}
              hoursTrained={certificate.hoursTrained}
              issuedAt={certificate.issuedAt}
              expiresAt={certificate.expiresAt}
              certificateHash={certificate.certificateHash}
              verifyPath={`${window.location.origin}/verify/${certificate.certificateNo}`}
            />
          </CertificateDownloadCard>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10 p-6 text-center space-y-3">
          <p className="text-3xl">🎓</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            You've passed this course! Your official certificate is ready.
          </p>
          <button
            onClick={() => issue.mutate()}
            disabled={issue.isPending}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {issue.isPending ? "Generating Certificate…" : "Claim Your Certificate"}
          </button>
        </div>
      )}
    </div>
  );
}

function CertificateSection({ eligible, userName, orgName }) {
  const toast = useToast();
  const { data: certificate, refetch } = useQuery({ queryKey: ["cybersachet-my-certificate"], queryFn: fetchMyCertificate });
  const issue = useMutation({
    mutationFn: issueCybersachetCertificate,
    onSuccess: () => refetch(),
    onError: err => toast.error(err instanceof Error ? err.message : "Couldn't issue certificate")
  });

  return <div className="space-y-6">
    {certificate ? <div id="certificate-print-area">
      <CertificateDownloadCard verifyPath={`/verify/${certificate.certificateNo}`}>
        <CyberSachetCertificate userName={userName} orgName={orgName} certId={certificate.certificateNo} score={certificate.averageScore} averageScore={certificate.averageScore} courseCount={certificate.courseCount} hoursTrained={certificate.hoursTrained} issuedAt={certificate.issuedAt} expiresAt={certificate.expiresAt} certificateHash={certificate.certificateHash} verifyPath={`${window.location.origin}/verify/${certificate.certificateNo}`} />
      </CertificateDownloadCard>
    </div> : eligible ? <Reveal>
      <div className="rounded-2xl border border-amber-400/25 light:border-amber-500/30 bg-amber-400/[0.06] light:bg-amber-50 p-6 text-center">
        <p className="text-2xl" aria-hidden>🏅</p>
        <p className="mt-2 text-sm font-medium text-white light:text-slate-900">You've completed every assigned course — your CSSA certificate is ready.</p>
        <button onClick={() => issue.mutate()} disabled={issue.isPending} className="mt-4 rounded-full bg-gradient-to-r from-blue-700 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(30,58,138,0.5)] disabled:opacity-50">
          {issue.isPending ? "Generating…" : "Claim your certificate"}
        </button>
      </div>
    </Reveal> : null}
    <CertificationPath earnedCode={certificate ? "CSSA" : null} />
  </div>;
}

// Local preview never earns a real, verifiable certificate (there's no
// database record behind it) — but hiding the whole concept from a
// prospect trying the free preview is worse than an honest teaser. Once
// every visible local course is done, this shows the real overall-CSSA
// certificate design (real name, org, real average score/hours computed
// from local progress) watermarked "Preview", not just a text blurb.
function LocalCertificatePreview({ eligible, stats, courseCount }) {
  const { user, organization } = useAuth();
  if (!eligible) return <CertificationPath earnedCode={null} />;
  return <div className="space-y-6">
    <div>
      <CyberSachetCertificate preview userName={user?.name} orgName={organization?.name ?? "Your organization"} score={stats?.avgScore ?? 0} averageScore={stats?.avgScore ?? 0} courseCount={courseCount} hoursTrained={stats?.hoursTrained ?? 0} issuedAt={new Date().toISOString()} expiresAt={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()} />
      <p className="mx-auto mt-3 max-w-md text-center text-xs text-white/45 light:text-slate-500">
        This is a preview of the real CSSA certificate design — a verifiable version with a QR code and a public verification
        page is issued the moment your organization licenses CyberSachet.
      </p>
    </div>
    <CertificationPath earnedCode={null} />
  </div>;
}

export default function CyberSachetTraining({ defaultTrack = "security" }) {
  const { user, organization } = useAuth();
  // Academy and CyberSachet are independently licensable products — each
  // route mount checks only its own track's real license, never the other
  // track's flag.
  const { data: licensed, isLoading: licenseLoading, isError: licenseError, refetch: refetchLicense } = useQuery({ queryKey: ["cybersachet-license", defaultTrack], queryFn: defaultTrack === "academy" ? fetchAcademyLicense : fetchCybersachetLicense, retry: false });
  const { data: usage, isLoading: usageLoading } = useQuery({ queryKey: ["plan-usage"], queryFn: fetchPlanUsage, staleTime: 60_000 });
  const orgPlan = usage?.plan ?? "STARTER";
  const orgPlanRank = PLAN_ORDER.indexOf(orgPlan);
  const isStarter = orgPlan === "STARTER";
  // Local preview courses (data/cybersachetCourses.js) predate min_plan and
  // only carry the old freeTier boolean — fall back to it the same way the
  // live-fetch mappers do, so a free local course doesn't regress to locked.
  const courseAllowedByPlan = c => isPlanAllowed(c.minPlan ?? (c.freeTier ? "STARTER" : "PROFESSIONAL"), orgPlan);
  // A failed license check is not the same as "not licensed" — falling back
  // to `local` here would silently demote a real, paying, licensed org to
  // local-preview mode (fake device-local progress) on a transient network
  // blip. Show a real, retryable error instead of guessing.
  const local = !licenseLoading && !licensed && !licenseError;

  const { data: liveCourses, isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useQuery({ queryKey: ["cybersachet-courses"], queryFn: fetchCybersachetCourses, enabled: !!licensed });
  const { data: liveEnrollments, refetch: refetchEnrollments } = useQuery({ queryKey: ["cybersachet-enrollments"], queryFn: fetchMyEnrollments, enabled: !!licensed });
  const { data: assignments } = useQuery({ queryKey: ["cybersachet-my-assignments"], queryFn: fetchMyCybersachetAssignments, enabled: !!licensed });
  const { data: stats } = useQuery({ queryKey: ["cybersachet-my-stats"], queryFn: fetchMyCybersachetStats, enabled: !!licensed });
  const { data: leaderboard } = useQuery({ queryKey: ["cybersachet-leaderboard"], queryFn: fetchCybersachetLeaderboard, enabled: !!licensed });
  const { data: learningPaths } = useQuery({ queryKey: ["cybersachet-learning-paths"], queryFn: fetchLearningPaths, enabled: !!licensed });
  const { data: can } = useQuery({ queryKey: ["my-permissions", organization?.id], queryFn: () => fetchMyPermissions(organization?.id), enabled: !!organization?.id, retry: false });
  const canManageTraining = !!can && can("organization", "training", "manage");
  // Only fetched for an admin who can actually assign something — a regular
  // member never needs the org's member list just to see their own courses.
  const { data: members } = useQuery({ queryKey: ["organization-members"], queryFn: fetchOrganizationMembers, enabled: canManageTraining, retry: false });
  const assignmentByCourseId = new Map((assignments ?? []).map(a => [a.courseId, a]));

  const [, setLocalVersion] = useState(0);
  const refreshLocal = () => setLocalVersion(v => v + 1);
  const localCourses = getLocalCourses();
  const localEnrollments = local ? getLocalEnrollments(user?.id) : [];
  const localStats = local ? getLocalStats(user?.id) : null;

  const courses = local ? localCourses : liveCourses;
  const enrollments = local ? localEnrollments : liveEnrollments;
  const [openCourse, setOpenCourse] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const activeTrack = defaultTrack;

  if (licenseLoading || usageLoading) {
    return <div className="space-y-4"><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-32 rounded-2xl" /></div>;
  }

  const enrollmentByCourseId = new Map((enrollments ?? []).map(e => [e.courseId, e]));
  const completedCount = (enrollments ?? []).filter(e => e.completedAt).length;
  const inProgressCount = (enrollments ?? []).filter(e => !e.completedAt && e.enrolledAt).length;

  function refreshEnrollments() {
    if (local) refreshLocal(); else refetchEnrollments();
  }
  if (openCourse) {
    return <CourseDetail course={openCourse} enrollment={enrollmentByCourseId.get(openCourse.id)} local={local} onBack={() => { setOpenCourse(null); refreshEnrollments(); }} onProgress={refreshEnrollments} />;
  }

  const allCourses = local ? localCourses : (courses ?? []);
  const courseTrack = c => c.track ?? "security";
  const trackCourses = allCourses.filter(c => courseTrack(c) === activeTrack);
  const trackLearningPaths = (local ? getLocalLearningPaths(user?.id) : (learningPaths ?? [])).filter(p => p.track === activeTrack);
  const courseById = new Map(allCourses.map(c => [c.id, c]));
  const freeCourses = trackCourses.filter(c => c.freeTier);
  const assignedCourses = local ? [] : trackCourses.filter(c => !c.freeTier && courseAllowedByPlan(c) && assignmentByCourseId.has(c.id));
  const lockedCourses = trackCourses.filter(c => !courseAllowedByPlan(c));
  const visibleCourses = local || canManageTraining ? trackCourses.filter(courseAllowedByPlan) : [...freeCourses, ...assignedCourses];

  const matchesSearch = c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
  };

  const filteredVisible = visibleCourses.filter(c => (activeCategory ? c.category === activeCategory : true) && matchesSearch(c));
  const filteredLocked = lockedCourses.filter(c => (activeCategory ? c.category === activeCategory : true) && matchesSearch(c));
  const categories = [...new Set(trackCourses.map(c => c.category))].filter(Boolean);

  // The CSSA certificate only ever certified the CyberSachet security
  // catalog — scope its eligibility to security-track courses so an Academy
  // (Cloud/DevOps) course completion can never gate or count toward it,
  // matching issue_cybersachet_certificate()'s own server-side scoping.
  const securityCourses = allCourses.filter(c => courseTrack(c) === "security");
  const securityCompletedCount = securityCourses.filter(c => enrollmentByCourseId.get(c.id)?.completedAt).length;

  const dashboardStats = local ? localStats : stats;
  const heroTitle = activeTrack === "academy" ? "Moonsav ITOps Academy" : "CyberSachet Training";
  const heroSubtitle = activeTrack === "academy" ? "Cloud, DevOps, and infrastructure courses — enroll, complete lessons, and pass the quiz." : local ? "Security awareness courses for your team — enroll, complete lessons, and pass the quiz." : canManageTraining ? "The full catalog — assign any course to a team member, or take one yourself." : "Your assigned courses, progress, and certification, in one place.";
  // Track-scoped, from the same real enrollment map every course card
  // already reads — never cross-counts a CyberSachet completion into the
  // Academy ring or vice versa.
  const trackCompletedCount = visibleCourses.filter(c => enrollmentByCourseId.get(c.id)?.completedAt).length;
  const trackProgressPct = visibleCourses.length > 0 ? Math.round((trackCompletedCount / visibleCourses.length) * 100) : 0;

  return <div className="space-y-6">
    <Reveal y={12} className="flex flex-wrap items-center justify-between gap-3">
      <TrackToggle active={activeTrack} />
    </Reveal>

    <Reveal y={12}>
      <TrainingHero academy={activeTrack === "academy"} title={heroTitle} subtitle={heroSubtitle} progressPct={visibleCourses.length > 0 ? trackProgressPct : null} stats={visibleCourses ? [{ label: local || canManageTraining ? "Courses" : "Assigned", value: visibleCourses.length }, { label: "In progress", value: inProgressCount }, { label: "Completed", value: completedCount }] : null} />
    </Reveal>

    {licenseError && <Reveal delay={0.05}><ErrorState message="Couldn't confirm your license status — this is a connection issue, not a licensing change. Your organization's data is safe." onRetry={refetchLicense} /></Reveal>}
    {local && <Reveal delay={0.05}><LocalPreviewBanner /></Reveal>}

    {dashboardStats && (() => {
      const currentXp = dashboardStats.completedCourses * 250 + Math.round(dashboardStats.hoursTrained * 20) + (dashboardStats.avgScore ?? 0) * 2 + dashboardStats.streakDays * 15;
      const xpInfo = xpLevel(currentXp);
      const allBadges = ["first_course", "perfect_score", "streak_3", "certified"];

      return (
        <Reveal delay={0.08}>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {/* XP Stat Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-900/95 light:bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 light:text-amber-600">
                  Total XP
                </span>
                <span className="rounded-full bg-amber-500/20 light:bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 light:text-amber-800 border border-amber-400/30 light:border-amber-200">
                  {xpInfo.label}
                </span>
              </div>
              <p className="mt-2.5 text-2xl font-bold tabular-nums text-white light:text-slate-900">
                <AnimatedCounter value={currentXp} />
              </p>
              <div className="mt-2.5 space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400 light:text-slate-500">
                  <span>Rank progress</span>
                  <span>{xpInfo.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 light:bg-slate-100">
                  <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${xpInfo.pct}%` }} />
                </div>
              </div>
            </div>

            {/* Avg Quiz Score Stat Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-900/95 light:bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 light:text-cyan-600">
                  Quiz Average
                </span>
                <span className="text-[10px] font-semibold text-slate-400 light:text-slate-500">70% Pass</span>
              </div>
              <p className="mt-2.5 text-2xl font-bold tabular-nums text-white light:text-slate-900">
                {dashboardStats.avgScore != null ? `${dashboardStats.avgScore}%` : "—"}
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-400 light:text-slate-500">
                {dashboardStats.avgScore != null && dashboardStats.avgScore >= 70 ? "Passing mark achieved" : "Target score: 70%+"}
              </p>
            </div>

            {/* Learning Hours Stat Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-900/95 light:bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 light:text-indigo-600">
                  Learning Hours
                </span>
              </div>
              <p className="mt-2.5 text-2xl font-bold tabular-nums text-white light:text-slate-900">
                {dashboardStats.hoursTrained.toFixed(1)}h
              </p>
              <p className="mt-2 text-[11px] font-medium text-slate-400 light:text-slate-500">
                Total study time
              </p>
            </div>

            {/* Streak Tracker Stat Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-900/95 light:bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400 light:text-orange-600">
                  Current Streak
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-2xl font-bold text-white light:text-slate-900">{dashboardStats.streakDays}</span>
                <span className="text-xs font-bold text-slate-400 light:text-slate-500">Days</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                  <span
                    key={idx}
                    className={`grid h-5 w-5 place-items-center rounded-md text-[9px] font-bold ${idx < Math.min(dashboardStats.streakDays, 7)
                      ? "bg-white text-slate-900 light:bg-slate-900 light:text-white shadow-sm"
                      : "bg-white/10 text-white/40 light:bg-slate-100 light:text-slate-400"
                      }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            {/* Badges Stat Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 light:border-slate-200/90 bg-slate-900/95 light:bg-white p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 light:text-purple-600">
                  Badges & Certs
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {allBadges.map(code => {
                  const earned = dashboardStats.badges.includes(code);
                  const meta = BADGE_META[code];
                  if (!meta) return null;
                  return (
                    <span
                      key={code}
                      title={earned ? meta.hint : `Locked: ${meta.hint}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${earned
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white/10 text-white/40 light:bg-slate-100 light:text-slate-400 opacity-60"
                        }`}
                    >
                      <span>{meta.label}</span>
                      {!earned && <span className="text-[9px]">🔒</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      );
    })()}

    {!local && leaderboard && leaderboard.length > 0 && <Reveal delay={0.1}>
      <SpotlightCard className="p-5" tint="white">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-white/45 light:text-slate-400">Team leaderboard</p>
        <Leaderboard rows={leaderboard} currentUserId={user?.id} />
      </SpotlightCard>
    </Reveal>}

    {trackLearningPaths.length > 0 && <Reveal delay={0.1} className="space-y-4">
      {trackLearningPaths.map(path => <LearningPathCard key={path.id} path={path} orgPlan={orgPlan} onOpenCourse={c => { const full = courseById.get(c.courseId); if (full) setOpenCourse(full); }} />)}
    </Reveal>}

    <CategoryFilterChips categories={categories} active={activeCategory} onChange={setActiveCategory} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

    {!local && coursesLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
    </div> : !local && coursesError ? <ErrorState message="Couldn't load courses." onRetry={refetchCourses} /> : filteredVisible.length === 0 && filteredLocked.length === 0 ? (
      activeCategory ? <EmptyState title="No courses in this category." description="Try a different category, or clear the filter to see everything available to you." />
        : canManageTraining && !local ? <EmptyState title="No courses in the catalog yet." description="Courses are managed by ITOps Solution — check back soon, or contact support if you expected to see some here." />
          : <EmptyState title="No courses assigned yet." description="Course assignment is admin-only — ask your organization admin to assign training." />
    ) : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredVisible.map((course, i) => <CourseCard key={course.id} course={course} index={i} enrollment={enrollmentByCourseId.get(course.id)} assignment={assignmentByCourseId.get(course.id)} onOpen={setOpenCourse} canManageTraining={canManageTraining && !local} members={members ?? []} />)}
      {filteredLocked.map((course, i) => <LockedCourseCard key={course.id} course={course} index={filteredVisible.length + i} />)}
    </div>}

    {!local && activeTrack !== "academy" && securityCourses.length > 0 && <CertificateSection eligible={!isStarter && securityCompletedCount >= securityCourses.length} userName={user?.name} orgName={organization?.name} />}
    {local && activeTrack !== "academy" && <LocalCertificatePreview eligible={!isStarter && securityCompletedCount >= securityCourses.length && securityCompletedCount > 0} stats={localStats} courseCount={securityCourses.length} />}
  </div>;
}
