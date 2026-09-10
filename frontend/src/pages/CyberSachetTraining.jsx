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
import { Icons } from "../components/AcademyITOpsTheme";
import { getLessonVideo } from "../data/cybersachetLessonVideos";
import { TrainingTrackToggle } from "../components/TrainingTrackToggle";

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

function CategoryFilterChips({
  categories,
  active,
  onChange,
  searchQuery,
  onSearchChange,
  activeLevel = null,
  onLevelChange = null,
  courseCounts = {}
}) {
  const levels = [
    { value: null, label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  return (
    <div className="space-y-3.5">
      {/* Search & Level Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery ?? ""}
            onChange={e => onSearchChange?.(e.target.value)}
            placeholder="Search courses by title, topic, or keyword…"
            className="w-full rounded-2xl border border-slate-200/90 dark:border-white/15 bg-white dark:bg-slate-900/90 pl-10 pr-9 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Difficulty Level Tabs */}
        {onLevelChange && (
          <div className="inline-flex items-center gap-1 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900/60 p-1 shadow-inner self-start sm:self-auto">
            {levels.map(lvl => (
              <button
                key={lvl.label}
                type="button"
                onClick={() => onLevelChange(lvl.value)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${activeLevel === lvl.value
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Category Pills Carousel */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${active === null
              ? "bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
              : "border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm"
            }`}
        >
          <span>All Categories</span>
          {courseCounts.all != null && (
            <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${active === null ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"}`}>
              {courseCounts.all}
            </span>
          )}
        </button>

        {categories.map(c => {
          const count = courseCounts[c];
          const isSelected = active === c;
          return (
            <button
              type="button"
              key={c}
              onClick={() => onChange(c)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${isSelected
                  ? "bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "border border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm"
                }`}
            >
              <CategoryIcon category={c} size={14} />
              <span>{CATEGORY_LABELS[c] ?? c}</span>
              {count != null && (
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${isSelected ? "bg-white/25 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// TrackToggle is now unified in ../components/TrainingTrackToggle.jsx

function AssignCourseButton({ course, members }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const assign = useMutation({
    mutationFn: () => assignCybersachetCourseToMember(userId, course.id, dueDate ? new Date(dueDate).toISOString() : null),
    onSuccess: () => {
      toast.success(`Assigned "${course.title}" successfully.`);
      setOpen(false);
      setUserId("");
      setDueDate("");
    },
    onError: err => toast.error(err instanceof Error ? err.message : "Failed to assign course")
  });

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 hover:bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md transition-all shadow-sm"
      >
        <span>+</span> Assign
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className="absolute right-0 top-full z-30 mt-2 w-64 space-y-3 rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 p-4 shadow-2xl text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-2">
              <p className="text-xs font-bold truncate">Assign Training</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs p-0.5"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 line-clamp-1">
              {course.title}
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team Member
              </label>
              <select
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select team member…</option>
                {members.map(m => (
                  <option key={m.userId} value={m.userId}>
                    {m.email} {m.name ? `(${m.name})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => assign.mutate()}
                disabled={!userId || assign.isPending}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
              >
                {assign.isPending ? "Assigning…" : "Assign Course"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/20" />
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
      <SpotlightCard
        tint={isCompleted ? "emerald" : "rose"}
        delay={index * 0.04}
        className="h-full overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5"
      >
        <div className="flex h-full flex-col">
          {/* Cover Banner with Image & Overlays */}
          <div className="relative h-44 w-full overflow-hidden border-b border-slate-100 dark:border-white/10">
            <img
              src={bgImage}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/20" />

            {/* Content inside top banner */}
            <div className="relative z-10 flex flex-col justify-between h-full p-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${LEVEL_TONE[course.level] ?? LEVEL_TONE.beginner}`}>
                    {course.level}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${theme.badgeBg}`}>
                    <CategoryIcon category={course.category} size={11} />
                    {CATEGORY_LABELS[course.category] ?? course.category}
                  </span>
                  {assignment && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      Assigned
                    </span>
                  )}
                  {course.freeTier && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      Free Tier
                    </span>
                  )}
                </div>
                {canManageTraining && <AssignCourseButton course={course} members={members} />}
              </div>

              <div className="flex items-end justify-between gap-3">
                <CourseIcon slug={course.slug} size={40} />
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-rose-400/40 shadow-sm">
                    <Icons.Video className="w-3 h-3 text-white" />
                    <span>HD Video</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20 shadow-sm">
                    <Icons.Clock className="w-3 h-3 text-white/80" />
                    <span>{course.estimatedMinutes} min</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="flex flex-1 flex-col p-5 pt-4 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              <Icons.Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>Verified Certification Curriculum</span>
            </div>

            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white line-clamp-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {course.title}
            </h3>

            <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2 font-normal">
              {course.description}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <Icons.BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.lessonCount} Lessons</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Icons.CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.quizQuestionCount} Quiz Questions</span>
              </span>
            </div>

            {/* Progress & CTA */}
            <div className="mt-4 space-y-2.5">
              {enrollment && (
                <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] p-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className={isCompleted ? "text-emerald-500 dark:text-emerald-400 font-extrabold" : "text-indigo-600 dark:text-indigo-400 font-extrabold"}>
                      {isCompleted ? "Completed" : `${displayPct}% Completed`}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                      {enrollment.completedLessonCount}/{course.lessonCount} Lessons Done
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-cyan-500"}`}
                      style={{ width: `${displayPct}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition-all duration-200 shadow-sm ${isCompleted
                    ? "border border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100"
                    : isInProgress
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  }`}
              >
                <span>
                  {isCompleted
                    ? "Review Course & Credential"
                    : isInProgress
                      ? `Continue Learning (${displayPct}%) →`
                      : "Start Course →"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>
  );
}

const LESSON_YOUTUBE_VIDEOS = {
  // Course 1: Phishing Awareness (phishing-awareness)
  "What phishing actually is": { videoId: "XBkzBrXlle0", title: "What is Phishing? Attacks & Social Engineering Explained" },
  "The red flags that give it away": { videoId: "XBkzBrXlle0", title: "How to Spot Phishing Email Red Flags & Deceptive Links" },
  "If you already clicked": { videoId: "XBkzBrXlle0", title: "Incident Response: What to Do If You Clicked a Malicious Link" },
  "Building a verify-first habit": { videoId: "XBkzBrXlle0", title: "Building a Verify-First Security Habit Across Channels" },

  // Course 2: Password Security & MFA (password-security-mfa)
  "Why passwords fail": { videoId: "8ZtInClXe1Q", title: "Why Passwords Fail & How Insecure Storage Works - Tom Scott & Computerphile" },
  "Passphrases beat passwords": { videoId: "8ZtInClXe1Q", title: "Passphrases vs Passwords - Cracking Speeds & Entropy - Computerphile" },
  "Password managers, in practice": { videoId: "8ZtInClXe1Q", title: "Password Managers in Practice: Ending Credential Reuse" },
  "Multi-factor authentication (MFA)": { videoId: "8ZtInClXe1Q", title: "Multi-Factor Authentication (MFA) & Hardware Security Keys" },

  // Course 3: Social Engineering (social-engineering)
  "Pretexting and impersonation": { videoId: "lc7scxvKQOo", title: "Pretexting & Impersonation Attacks - WIRED / DEFCON" },
  "Vishing and smishing": { videoId: "lc7scxvKQOo", title: "Voice Phishing (Vishing) & SMS Phishing (Smishing) Defense" },
  "Tailgating and physical social engineering": { videoId: "lc7scxvKQOo", title: "Physical Social Engineering, Tailgating & Badge Discipline" },
  "Building a verify-first habit at work": { videoId: "lc7scxvKQOo", title: "Human Hacking Defense & Workplace Verification Habits" },

  // Course 4: Malware & Ransomware (malware-ransomware)
  "Malware, in plain terms": { videoId: "xXkevJcOBTw", title: "Malware Explained: Viruses, Worms, Trojans & Spyware" },
  "How it actually gets in": { videoId: "xXkevJcOBTw", title: "Attack Vectors: Attachments, Unpatched Software & Drive-by Downloads" },
  "Why ransomware is different": { videoId: "-KL9APUjj3E", title: "What is Ransomware & How Encryption Extortion Works - Simplilearn" },
  "If you suspect an infection": { videoId: "-KL9APUjj3E", title: "Malware Isolation & First-Responder Containment Protocol" },

  // Course 5: Data Handling & Privacy (data-handling-privacy)
  "Classifying sensitive data": { videoId: "8ZtInClXe1Q", title: "Data Classification (PII, Confidential & Public Data) Best Practices" },
  "Safe sharing and storage": { videoId: "8ZtInClXe1Q", title: "Secure File Sharing, Permissions & Cloud Access Controls" },
  "Working remotely and securely": { videoId: "8ZtInClXe1Q", title: "Remote Work Security: Public Wi-Fi, VPNs & Endpoint Protection" },
  "Reporting a suspected breach": { videoId: "8ZtInClXe1Q", title: "Data Breach Incident Reporting & Compliance Requirements" },

  // Course 6: Mobile & Device Security (mobile-device-security)
  "Lock screens and lost devices": { videoId: "8ZtInClXe1Q", title: "Mobile Lock Screens, Auto-Lock & Remote Wipe Protocols" },
  "App permissions you should question": { videoId: "8ZtInClXe1Q", title: "Auditing Mobile App Permissions & Sideloading Risks" },
  "Public Wi-Fi, public chargers, and public USB ports": { videoId: "8ZtInClXe1Q", title: "Juice Jacking, Rogue USB Ports & Public Network Defense" },
  "If your device is lost or stolen": { videoId: "8ZtInClXe1Q", title: "Lost Device Incident Protocol: Revoking Tokens & Session Invalidation" },

  // Course 7: Physical Security & Workplace Awareness (physical-security-workplace-awareness)
  "Clean desk, locked screen": { videoId: "lc7scxvKQOo", title: "Clean Desk Policy & Screen Lock Security Discipline" },
  "Visitors, badges, and access": { videoId: "lc7scxvKQOo", title: "Physical Access Control, Badge Policies & Visitor Escort Rules" },
  "Shoulder surfing and public spaces": { videoId: "lc7scxvKQOo", title: "Shoulder Surfing Defense & Privacy Filter Best Practices" },
  "Disposing of sensitive material safely": { videoId: "lc7scxvKQOo", title: "Secure Hardware Wiping & Document Shredding Protocols" },

  // Course 8: SOC Fundamentals: Detecting & Responding to Threats (soc-fundamentals)
  "What a SOC actually does": { videoId: "XBkzBrXlle0", title: "What is a SOC? Telemetry, SIEM & Threat Monitoring" },
  "Analyst tiers and when to escalate": { videoId: "XBkzBrXlle0", title: "SOC Analyst Tiers (Tier 1 Triage vs Tier 2/3 Threat Hunting)" },
  "Reading and prioritizing alerts": { videoId: "XBkzBrXlle0", title: "Alert Prioritization, False Positive Reduction & Context Analysis" },
  "The incident response lifecycle": { videoId: "XBkzBrXlle0", title: "Incident Response Lifecycle: Identify, Contain, Eradicate, Recover, Review" },

  // Course 9: Linux Fundamentals for IT Operations (linux-fundamentals-for-it-operations)
  "The filesystem layout": { videoId: "sWbUDq4S6Y8", title: "Linux Filesystem Hierarchy (/etc, /var/log, /home, /tmp)" },
  "Navigating and reading files from the shell": { videoId: "sWbUDq4S6Y8", title: "Shell Navigation & File Inspection (ls, cd, cat, less, tail -f)" },
  "File permissions and ownership": { videoId: "sWbUDq4S6Y8", title: "Linux File Permissions & Ownership (chmod, chown, umask)" },
  "Processes, services, and package managers": { videoId: "sWbUDq4S6Y8", title: "Process Management (ps, top) & systemd Services (systemctl)" },
  "What monitoring actually does": { videoId: "sWbUDq4S6Y8", title: "Infrastructure Telemetry: External Probes vs Internal Host Agents" },
  "The metrics that matter": { videoId: "sWbUDq4S6Y8", title: "Core Server Metrics: CPU Load, Memory RSS, Disk I/O & Network Throughput" },
  "Server is slow: CPU, memory, or I/O?": { videoId: "sWbUDq4S6Y8", title: "Performance Triage: vmstat 1 (r, wa, si/so Bottleneck Isolation)" },
  "High CPU and runaway processes": { videoId: "sWbUDq4S6Y8", title: "Diagnosing High CPU: top (P), mpstat -P ALL, pidstat" },
  "Memory pressure and the OOM killer": { videoId: "sWbUDq4S6Y8", title: "Linux Memory Allocation, Swap Activity & Kernel OOM Killer (dmesg)" },
  "Disk I/O is the hidden bottleneck": { videoId: "sWbUDq4S6Y8", title: "Disk I/O Saturation: iostat -x 1, await times, iotop & pidstat -d" },
  "Disk is full: bytes, inodes, and ghost files": { videoId: "sWbUDq4S6Y8", title: "Fixing Disk Full: df -h, du -sh, df -i (inodes) & lsof deleted ghost files" },
  "Taming huge and noisy logs": { videoId: "sWbUDq4S6Y8", title: "Log Management: journalctl --vacuum & logrotate configuration" },
  "Website or application not reachable": { videoId: "sWbUDq4S6Y8", title: "Connectivity Triage: ping, curl -I, traceroute, ss -tulpn, systemctl" },
  "Service won't start, port not listening": { videoId: "sWbUDq4S6Y8", title: "Debugging Service Crash-loops (journalctl -u -xe) & Port Bindings" },
  "DNS failures and slow networks": { videoId: "sWbUDq4S6Y8", title: "DNS & Network Performance: dig, nslookup, mtr, ip -s link, ethtool" },
  "Login failures and permission denied": { videoId: "sWbUDq4S6Y8", title: "Authentication Troubleshooting (/var/log/auth.log) & Path Traversal (namei -l)" },
  "Finding files and reading a crash": { videoId: "sWbUDq4S6Y8", title: "File Search (find, locate) & Reading Crash Dumps (journalctl -k -b -1)" },
  "Self-healing with systemd and health checks": { videoId: "sWbUDq4S6Y8", title: "Automated Self-Healing: systemd Restart=always & Cron Health Checks" },
  "How this platform automates remediation": { videoId: "sWbUDq4S6Y8", title: "Production SRE: Allowlisted Runbook Actions, Autonomy Gates & Audit Logs" },

  // Course 10: Red Hat Enterprise Linux Essential Training (rhel-essential-training)
  "Managing services with systemd": { videoId: "sWbUDq4S6Y8", title: "RHEL systemctl: Units, State Masking & Service Boot Configuration" },
  "Boot targets and system state": { videoId: "sWbUDq4S6Y8", title: "RHEL Boot Targets (multi-user.target vs graphical) & systemd-analyze blame" },
  "Editing configuration with vi/vim": { videoId: "sWbUDq4S6Y8", title: "Mastering Vi/Vim: Command, Insert & Ex Modes for Systems Administration" },
  "Filesystems and /etc/fstab": { videoId: "sWbUDq4S6Y8", title: "Filesystems, UUID Mounting & /etc/fstab Boot Configuration" },
  "SELinux essentials": { videoId: "sWbUDq4S6Y8", title: "SELinux: Enforcing Modes, File Contexts (restorecon) & Booleans (setsebool)" },
  "Shell variables": { videoId: "sWbUDq4S6Y8", title: "Bash Scripting: Positional Variables ($1-$9), Special Variables ($?, $$) & Quoting" },
  "Conditionals and tests": { videoId: "tK9Oc6AEnR4", title: "Bash Conditionals and Tests: [[ ... ]], test operators, and exit status ($?)" },
  "Loops and control flow": { videoId: "tK9Oc6AEnR4", title: "Bash Loops and Control Flow: for, while, until, and break/continue" },
  "Reading user input": { videoId: "tK9Oc6AEnR4", title: "Bash Interactive Scripts: read command, prompts, positional parameters, and options" },
  "Managing processes": { videoId: "sWbUDq4S6Y8", title: "Linux Process Control: pgrep, Signals (SIGTERM, SIGHUP, SIGKILL) & nohup" },

  // Course 11: Networking Fundamentals for IT Operations (networking-fundamentals-for-it-operations)
  "IP addresses and subnets": { videoId: "qiQR5rTSshw", title: "IPv4 Addressing, Subnet Masks & CIDR Notation (/24) Explained" },
  "DNS: how names become IP addresses": { videoId: "qiQR5rTSshw", title: "DNS Resolution Architecture: Root, TLD, Authoritative Servers & TTL" },
  "Ports and common protocols": { videoId: "qiQR5rTSshw", title: "TCP vs UDP, Standard Ports (80, 443, 22, 53) & Firewall Rules" },
  "Troubleshooting connectivity from the command line": { videoId: "qiQR5rTSshw", title: "Network Diagnostics: ping, traceroute, ss & curl host:port" },

  // Course 12: Cloud Computing Essentials (cloud-computing-essentials)
  "IaaS, PaaS, and SaaS": { videoId: "7HKot-brXFE", title: "Cloud Service Models: IaaS vs PaaS vs SaaS Architecture" },
  "The shared responsibility model": { videoId: "7HKot-brXFE", title: "Shared Responsibility Model: Cloud Provider vs Customer Security" },
  "Compute and storage basics": { videoId: "7HKot-brXFE", title: "Cloud Infrastructure: EC2 Virtual Machines, S3 Object Storage & EBS" },
  "Networking and regions": { videoId: "7HKot-brXFE", title: "Cloud Networks: VPCs, Subnets, Regions & Multi-AZ High Availability" },

  // Course 13: Introduction to DevOps & CI/CD (intro-to-devops-and-cicd)
  "Breaking down the wall between Dev and Ops": { videoId: "scEDHsr3APg", title: "DevOps Philosophy: Merging Development & Operations Culture" },
  "Version control as the foundation": { videoId: "scEDHsr3APg", title: "Git Workflows: Branching, Commits & Pull Request Quality Gates" },
  "Continuous Integration: build and test automatically": { videoId: "scEDHsr3APg", title: "Continuous Integration (CI): Automated Builds & Unit Test Suites" },
  "Continuous Delivery/Deployment and infrastructure as code": { videoId: "scEDHsr3APg", title: "CD Release Pipelines & Infrastructure as Code (IaC)" },

  // Course 14: Docker & Container Fundamentals (docker-and-container-fundamentals)
  "Why containers replaced traditional deployment": { videoId: "3c-iBn73dDE", title: "Why Containers? Ending 'Works on My Machine' Inconsistencies" },
  "Containers vs. virtual machines": { videoId: "3c-iBn73dDE", title: "Containers vs Virtual Machines: Kernel Sharing vs Full Virtualization" },
  "A brief history: from chroot to the OCI standard": { videoId: "3c-iBn73dDE", title: "Container Evolution: chroot, cgroups, LXC, Docker & the OCI Standard" },
  "Images, containers, and the Dockerfile": { videoId: "3c-iBn73dDE", title: "Dockerfile Instructions: FROM, COPY, RUN, CMD & Layer Caching" },
  "Docker Hub and image registries": { videoId: "3c-iBn73dDE", title: "Docker Hub, Private Registries & Immutable Image Tagging" },
  "Core Docker commands": { videoId: "3c-iBn73dDE", title: "Docker CLI: build, run -d -p, ps -a, logs & exec -it" },
  "Volumes, networking, and docker-compose": { videoId: "3c-iBn73dDE", title: "Docker Volumes (-v), Container DNS & Multi-Service docker-compose.yml" },
  "Installing Docker: Engine, Desktop, and verifying your setup": { videoId: "3c-iBn73dDE", title: "Installing Docker: Engine, Desktop, and Verifying Your Host Setup" },
  "Your first container: the Docker CLI": { videoId: "3c-iBn73dDE", title: "Your First Container: Running, Inspecting, and Executing Commands via CLI" },
  "Container lifecycle, logging, and health checks": { videoId: "3c-iBn73dDE", title: "Container Lifecycle, Logging Drivers, and Docker Healthcheck Probes" },
  "Resource limits and performance": { videoId: "3c-iBn73dDE", title: "Docker Resource Limits: --memory, --cpus, and Performance Triage" },
  "Image security and minimal, multi-stage builds": { videoId: "3c-iBn73dDE", title: "Image Security and Minimal Multi-Stage Builds: Alpine & Distroless" },
  "Container security best practices": { videoId: "scEDHsr3APg", title: "Container Security Best Practices: Non-Root Users, Capabilities & Trivy CVE Scans" },
  "Debugging a failed container, systematically": { videoId: "3c-iBn73dDE", title: "Systematic Container Debugging: Exit Codes, Logs, OOMKilled, and Inspect" },
  "Docker Compose for real multi-container apps": { videoId: "3c-iBn73dDE", title: "Docker Compose for Multi-Container Web App, Database & Redis Stacks" },
  "Docker in CI/CD pipelines": { videoId: "scEDHsr3APg", title: "Docker in CI/CD: Automated Image Build, Testing, and Registry Push" },

  // Course 15: Kubernetes Fundamentals: Pods & Cluster Triage (kubernetes-fundamentals-pods-and-cluster-triage)
  "Pods, Deployments, and the Kubernetes API": { videoId: "X48VuDVv0do", title: "Kubernetes Control Plane, Pods, Deployments & API Architecture" },
  "Services and networking": { videoId: "X48VuDVv0do", title: "Kubernetes Services & Networking: ClusterIP, NodePort, LoadBalancer & CoreDNS" },
  "kubectl essentials": { videoId: "X48VuDVv0do", title: "kubectl Essentials: get, describe, logs, exec, port-forward & apply" },
  "Triage: diagnosing a broken deployment": { videoId: "X48VuDVv0do", title: "Kubernetes Triage: CrashLoopBackOff, ImagePullBackOff, and OOMKilled Pods" },

  // Course 16: Microsoft Azure Fundamentals (microsoft-azure-fundamentals)
  "Subscriptions, resource groups, and Azure Resource Manager": { videoId: "NKEFW2W3pVs", title: "Azure Subscriptions, Resource Groups, and Azure Resource Manager (ARM)" },
  "Microsoft Entra ID and role-based access control": { videoId: "NKEFW2W3pVs", title: "Microsoft Entra ID (Azure AD), Identities, and Role-Based Access Control (RBAC)" },
  "Compute: VMs, scale sets, and App Service": { videoId: "NKEFW2W3pVs", title: "Azure Compute: Virtual Machines, VM Scale Sets, App Service & Serverless" },
  "Storage, virtual networks, and keeping costs in check": { videoId: "NKEFW2W3pVs", title: "Azure Storage, VNets, Network Security Groups (NSGs), and Cost Management" },

  // Course 17: DevOps & CI/CD: Intermediate (devops-cicd-intermediate)
  "Anatomy of a real pipeline": { videoId: "scEDHsr3APg", title: "Anatomy of a Real CI/CD Pipeline: Commit, Build, Test, Stage, and Deploy" },
  "Triggers and pipeline design": { videoId: "scEDHsr3APg", title: "Pipeline Triggers: Push, Pull Request, Cron Schedules & Webhook Events" },
  "The Jenkinsfile and pipeline syntax": { videoId: "scEDHsr3APg", title: "The Jenkinsfile and Declarative Pipeline Syntax: stages, steps, and post actions" },
  "Jenkins agents, executors, and plugins": { videoId: "scEDHsr3APg", title: "Jenkins Distributed Agents, Concurrent Executors, and Plugin Ecosystem" },
  "Workflow YAML: jobs, steps, and runners": { videoId: "R8_veQiYErI", title: "GitHub Actions Workflow YAML: jobs, steps, matrices, and self-hosted runners" },
  "Reusable workflows, composite actions, and secrets": { videoId: "R8_veQiYErI", title: "Reusable Workflows, Composite Actions, and GitHub Encrypted Secrets" },
  "Building and tagging images in CI": { videoId: "3c-iBn73dDE", title: "Building, Tagging, and Pushing Docker Images to Registries in CI" },
  "Terraform basics: providers, resources, and state": { videoId: "7xngnjfIlK4", title: "Terraform Fundamentals: Providers, Resources, Variables, and HCL Syntax" },
  "Terraform state and why it's dangerous to lose": { videoId: "7xngnjfIlK4", title: "Terraform State Management: Remote State in S3, State Locking, and Drift" },
  "Secrets in CI, done right": { videoId: "scEDHsr3APg", title: "Secrets Management in CI/CD: Vault, Environment Masking, and OIDC tokens" },
  "Supply-chain risk in pipelines": { videoId: "scEDHsr3APg", title: "Software Supply-Chain Security: Dependency Auditing, SBOMs & Signed Artifacts" },
  "Debugging a failed pipeline run, systematically": { videoId: "scEDHsr3APg", title: "Systematic Pipeline Debugging: Reading Build Logs, Exit Codes, and Artifacts" },
  "Rollback strategies": { videoId: "scEDHsr3APg", title: "Production Rollback Strategies: Blue/Green, Canary, Feature Flags & Git Revert" }
};

const COURSE_YOUTUBE_VIDEOS = {
  // Cybersecurity & Email Security
  "phishing-awareness": { videoId: "XBkzBrXlle0", title: "Phishing Attacks Explained & How to Protect Yourself" },
  "local-phishing-awareness": { videoId: "XBkzBrXlle0", title: "Phishing Attacks Explained & How to Protect Yourself" },
  "phishing": { videoId: "XBkzBrXlle0", title: "Phishing Attacks Explained & How to Protect Yourself" },

  "password-security-mfa": { videoId: "8ZtInClXe1Q", title: "How NOT to Store Passwords! - Tom Scott & Computerphile" },
  "local-password-mfa": { videoId: "8ZtInClXe1Q", title: "How NOT to Store Passwords! - Tom Scott & Computerphile" },
  "password": { videoId: "8ZtInClXe1Q", title: "How NOT to Store Passwords! - Tom Scott & Computerphile" },

  "social-engineering": { videoId: "lc7scxvKQOo", title: "Social Engineering Attacks & Human Hacking" },
  "local-social-engineering": { videoId: "lc7scxvKQOo", title: "Social Engineering Attacks & Human Hacking" },

  "malware-ransomware": { videoId: "xXkevJcOBTw", title: "Malware & Ransomware Technical Overview" },
  "local-malware-ransomware": { videoId: "xXkevJcOBTw", title: "Malware & Ransomware Technical Overview" },
  "malware": { videoId: "xXkevJcOBTw", title: "Malware & Ransomware Technical Overview" },

  "data-handling-privacy": { videoId: "8ZtInClXe1Q", title: "Data Handling & Privacy Security Course" },
  "local-data-handling": { videoId: "8ZtInClXe1Q", title: "Data Handling & Privacy Security Course" },
  "privacy": { videoId: "8ZtInClXe1Q", title: "Data Handling & Privacy Security Course" },

  "mobile-device-security": { videoId: "8ZtInClXe1Q", title: "Mobile & Endpoint Device Security Best Practices" },
  "local-mobile-device-security": { videoId: "8ZtInClXe1Q", title: "Mobile & Endpoint Device Security Best Practices" },
  "mobile": { videoId: "8ZtInClXe1Q", title: "Mobile & Endpoint Device Security Best Practices" },

  "physical-security-workplace-awareness": { videoId: "lc7scxvKQOo", title: "Physical Security & Workplace Awareness" },
  "local-physical-security": { videoId: "lc7scxvKQOo", title: "Physical Security & Workplace Awareness" },

  "soc-fundamentals": { videoId: "XBkzBrXlle0", title: "SOC Analyst Fundamentals & Incident Response" },
  "local-soc-fundamentals": { videoId: "XBkzBrXlle0", title: "SOC Analyst Fundamentals & Incident Response" },

  // Moonsav ITOps Academy Courses
  "linux-fundamentals": { videoId: "sWbUDq4S6Y8", title: "Linux Operating System - freeCodeCamp Full Course" },
  "linux-fundamentals-for-it-operations": { videoId: "sWbUDq4S6Y8", title: "Linux Operating System - freeCodeCamp Full Course" },
  "local-linux-fundamentals": { videoId: "sWbUDq4S6Y8", title: "Linux Operating System - freeCodeCamp Full Course" },
  "linux": { videoId: "sWbUDq4S6Y8", title: "Linux Operating System - freeCodeCamp Full Course" },

  "rhel-essential-training": { videoId: "sWbUDq4S6Y8", title: "Red Hat Enterprise Linux & Bash Scripting Essentials" },
  "local-rhel-essential-training": { videoId: "sWbUDq4S6Y8", title: "Red Hat Enterprise Linux & Bash Scripting Essentials" },

  "networking-fundamentals": { videoId: "qiQR5rTSshw", title: "Computer Networking Fundamentals & Protocols" },
  "networking-fundamentals-for-it-operations": { videoId: "qiQR5rTSshw", title: "Computer Networking Fundamentals & Protocols" },
  "local-networking-fundamentals": { videoId: "qiQR5rTSshw", title: "Computer Networking Fundamentals & Protocols" },
  "networking": { videoId: "qiQR5rTSshw", title: "Computer Networking Fundamentals & Protocols" },

  "cloud-computing-essentials": { videoId: "7HKot-brXFE", title: "Cloud Computing Essentials (AWS Cloud Practitioner)" },
  "local-cloud-computing": { videoId: "7HKot-brXFE", title: "Cloud Computing Essentials (AWS Cloud Practitioner)" },
  "cloud": { videoId: "7HKot-brXFE", title: "Cloud Computing Essentials (AWS Cloud Practitioner)" },

  "intro-to-devops-and-cicd": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Pipeline Engineering" },
  "introduction-to-devops-and-cicd": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Pipeline Engineering" },
  "local-intro-devops": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Pipeline Engineering" },
  "devops-cicd": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Pipeline Engineering" },
  "devops": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Pipeline Engineering" },

  "docker-and-container-fundamentals": { videoId: "3c-iBn73dDE", title: "Docker & Container Architecture Full Course" },
  "local-docker-fundamentals": { videoId: "3c-iBn73dDE", title: "Docker & Container Architecture Full Course" },
  "docker-containers": { videoId: "3c-iBn73dDE", title: "Docker & Container Architecture Full Course" },
  "docker": { videoId: "3c-iBn73dDE", title: "Docker & Container Architecture Full Course" },

  "kubernetes-fundamentals": { videoId: "X48VuDVv0do", title: "Kubernetes Cluster Architecture & Pod Triage" },
  "kubernetes-fundamentals-pods-and-cluster-triage": { videoId: "X48VuDVv0do", title: "Kubernetes Cluster Architecture & Pod Triage" },
  "local-k8s-fundamentals": { videoId: "X48VuDVv0do", title: "Kubernetes Cluster Architecture & Pod Triage" },
  "kubernetes": { videoId: "X48VuDVv0do", title: "Kubernetes Cluster Architecture & Pod Triage" },

  "microsoft-azure-fundamentals": { videoId: "NKEFW2W3pVs", title: "AZ-900 Microsoft Azure Fundamentals Full Course" },
  "local-azure-fundamentals": { videoId: "NKEFW2W3pVs", title: "AZ-900 Microsoft Azure Fundamentals Full Course" },
  "azure": { videoId: "NKEFW2W3pVs", title: "AZ-900 Microsoft Azure Fundamentals Full Course" },

  "devops-cicd-intermediate": { videoId: "scEDHsr3APg", title: "Intermediate CI/CD, Jenkins, GitHub Actions & Terraform" },
  "local-devops-intermediate": { videoId: "scEDHsr3APg", title: "Intermediate CI/CD, Jenkins, GitHub Actions & Terraform" },

  "devops-cicd-engineer": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Engineer Complete Career Path" },
  "local-devops-path": { videoId: "scEDHsr3APg", title: "DevOps & CI/CD Engineer Complete Career Path" }
};

function InteractiveLessonVideo({ title, category, courseSlug, lessonVideo }) {
  const [viewMode, setViewMode] = useState("youtube"); // "youtube" | "simulator"
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(18);
  const [speed, setSpeed] = useState(1);
  const [showCC, setShowCC] = useState(true);

  const combinedStr = `${courseSlug ?? ""} ${category ?? ""} ${title ?? ""}`.toLowerCase();

  const ytInfo = useMemo(() => {
    if (lessonVideo?.videoId) return lessonVideo;
    if (typeof lessonVideo === "string") return { videoId: lessonVideo, title: title || "Video Lecture" };

    const resolved = getLessonVideo(courseSlug, null, title);
    if (resolved?.videoId) return resolved;

    if (title && LESSON_YOUTUBE_VIDEOS[title]) {
      return LESSON_YOUTUBE_VIDEOS[title];
    }

    const titleLower = (title || "").toLowerCase().trim();
    const exactCaseInsensitive = Object.entries(LESSON_YOUTUBE_VIDEOS).find(([k]) => k.toLowerCase() === titleLower);
    if (exactCaseInsensitive) return exactCaseInsensitive[1];

    const partialLessonMatch = Object.entries(LESSON_YOUTUBE_VIDEOS).find(([k]) => {
      const kLower = k.toLowerCase();
      return titleLower.includes(kLower) || kLower.includes(titleLower);
    });
    if (partialLessonMatch) return partialLessonMatch[1];

    const directCourseMatch = courseSlug ? COURSE_YOUTUBE_VIDEOS[courseSlug.toLowerCase()] : null;
    const partialCourseMatch = Object.entries(COURSE_YOUTUBE_VIDEOS).find(([k]) => combinedStr.includes(k))?.[1];

    return directCourseMatch || partialCourseMatch || COURSE_YOUTUBE_VIDEOS["password-security-mfa"];
  }, [title, courseSlug, category, lessonVideo, combinedStr]);

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

  const isLinux = combinedStr.includes("linux");
  const isCloud = combinedStr.includes("cloud") || combinedStr.includes("devops") || combinedStr.includes("docker") || combinedStr.includes("kubernetes");

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl text-white my-3">
      {/* Video Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 md:px-5 py-3 bg-slate-900/95 border-b border-white/10 text-xs font-semibold">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500" />
          <span className="text-white font-bold truncate max-w-xs md:max-w-md">{title}</span>
          <span className="hidden sm:inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70 font-semibold">
            HD Lecture
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              onClick={() => setViewMode("youtube")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold transition-all ${viewMode === "youtube" ? "bg-red-600 text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
            >
              <Icons.Video className="w-3.5 h-3.5" />
              <span>Video Lecture</span>
            </button>
            <button
              onClick={() => setViewMode("simulator")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[11px] font-bold transition-all ${viewMode === "simulator" ? "bg-indigo-600 text-white shadow-sm" : "text-white/60 hover:text-white"
                }`}
            >
              <Icons.Activity className="w-3.5 h-3.5" />
              <span>Telemetry Engine</span>
            </button>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${ytInfo.videoId}${ytInfo.start ? `&t=${ytInfo.start}s` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open reference video on YouTube in a safe new tab"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 px-3 py-1.5 text-[11px] font-bold shadow-sm transition-all"
          >
            <span>YouTube</span>
            <Icons.ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Video / Simulator Canvas */}
      {viewMode === "youtube" ? (
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytInfo.videoId}?start=${ytInfo.start || 0}&rel=0&modestbranding=1`}
            title={ytInfo.title}
            className="w-full h-full min-h-[340px] md:min-h-[460px] border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        /* In-House Interactive Animated Video Screen Canvas */
        <div className="relative aspect-video w-full min-h-[340px] md:min-h-[460px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center overflow-hidden group select-none">
          {/* Animated Cyber Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

          {/* Live Telemetry Graphic */}
          <div className="relative z-10 flex flex-col items-center justify-center p-4 md:p-6 text-center space-y-4 max-w-xl w-full">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.015, 1] : 1 }}
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
              <div className="absolute bottom-5 inset-x-6 z-20 pointer-events-none">
                <span className="inline-block bg-black/85 backdrop-blur-md px-4 py-2 rounded-xl text-xs md:text-sm font-medium text-white border border-white/15 shadow-xl">
                  {progress < 25 && "Welcome to this interactive walkthrough. Learn the core principles and indicators step by step."}
                  {progress >= 25 && progress < 50 && "Inspect the parameters carefully to ensure protocol compliance and security alignment."}
                  {progress >= 50 && progress < 75 && "Execute recommended emergency response protocols or terminal commands immediately upon detection."}
                  {progress >= 75 && "Complete the knowledge check below to verify your mastery and unlock the next lesson."}
                </span>
              </div>
            )}
          </div>

          {/* Video Scrubber & Control Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 space-y-2.5 z-30">
            {/* Scrubber Progress Bar */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = (clickX / rect.width) * 100;
                setProgress(Math.max(0, Math.min(100, newPct)));
              }}
              className="h-2 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden relative group/bar"
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-md opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-emerald-400 transition-colors p-1"
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>

                <span className="font-mono text-[11px] text-white/80 font-semibold">
                  {formatTime(currentSec)} / {formatTime(durationSec)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : s === 1.5 ? 2 : 1))}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white font-mono transition-colors"
                >
                  {speed}x
                </button>

                <button
                  onClick={() => setShowCC(!showCC)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${showCC ? "bg-emerald-600 text-white" : "bg-white/10 text-white/60"}`}
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
    <SpotlightCard tint="white" delay={index * 0.04} className="h-full rounded-3xl border border-dashed border-slate-300 dark:border-white/15 opacity-75 bg-slate-50/50 dark:bg-white/[0.01]">
      <div className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold" aria-hidden>
            🔒
          </span>
          <span className="rounded-full bg-slate-200/80 dark:bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {course.estimatedMinutes} min
          </span>
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white/80">{course.title}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3 font-normal">{course.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10 pt-3.5">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">🔒 {requiredPlan} tier required</span>
          <Link to="/team" className="shrink-0 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all">
            Upgrade Plan
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

function ChoiceOption({ selected, onClick, shape = "circle", children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left text-xs md:text-sm font-semibold transition-all duration-150 ${selected
          ? "border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-500/30 font-bold"
          : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
        }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center border-2 transition-colors ${shape === "circle" ? "rounded-full" : "rounded-md"
          } ${selected
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-slate-300 dark:border-white/30"
          }`}
      >
        <AnimatePresence>
          {selected && (
            shape === "circle" ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="h-2 w-2 rounded-full bg-white"
              />
            ) : (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="h-3.5 w-3.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            )
          )}
        </AnimatePresence>
      </span>
      <span className="flex-1 leading-relaxed">{children}</span>
    </button>
  );
}

function LessonCheck({ check, checks, onCheck, onNextLesson, hasNext, nextLabel }) {
  const checkpoints = checks && checks.length > 0 ? checks : (check ? [check] : []);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [clearedSteps, setClearedSteps] = useState({});
  const [feedback, setFeedback] = useState({});
  const [checking, setChecking] = useState(false);

  const totalSteps = checkpoints.length;
  const clearedCount = Object.values(clearedSteps).filter(Boolean).length;
  const isAllCleared = totalSteps > 0 && clearedCount === totalSteps;
  const currentCheck = checkpoints[activeStep] || checkpoints[0];
  const selected = selectedAnswers[activeStep];
  const isCurrentCleared = !!clearedSteps[activeStep];
  const currentFeedback = feedback[activeStep];

  async function handleVerify() {
    if (selected == null || checking || isCurrentCleared) return;
    setChecking(true);
    try {
      const willBeAllCleared = clearedCount + 1 >= totalSteps;
      const isCorrect = await onCheck(selected, activeStep, willBeAllCleared);
      if (isCorrect) {
        setClearedSteps(prev => ({ ...prev, [activeStep]: true }));
        setFeedback(prev => ({ ...prev, [activeStep]: "correct" }));
      } else {
        setFeedback(prev => ({ ...prev, [activeStep]: "wrong" }));
        setTimeout(() => {
          setFeedback(prev => ({ ...prev, [activeStep]: null }));
        }, 3000);
      }
    } catch {
      // Handled by onError toast
    } finally {
      setChecking(false);
    }
  }

  function handleNext() {
    if (activeStep < totalSteps - 1) {
      setActiveStep(s => s + 1);
    }
  }

  if (isAllCleared) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-emerald-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white text-base font-extrabold shadow-md shadow-emerald-500/25">
              ✓
            </span>
            <div>
              <h4 className="text-sm md:text-base font-bold text-emerald-950 dark:text-emerald-100">
                All Knowledge Checkpoints Cleared ({totalSteps}/{totalSteps})
              </h4>
              <p className="text-xs text-emerald-800/85 dark:text-emerald-300/85">
                You have verified all core operational concepts for this lesson. Progress recorded automatically.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40">
            100% Mastered
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {checkpoints.map((cp, idx) => (
            <div key={idx} className="rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/20 p-4 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                  ✓
                </span>
                <p className="font-bold text-slate-900 dark:text-white leading-snug">
                  {cp.question}
                </p>
              </div>
              {cp.explanation && (
                <div className="ml-7 pt-2 border-t border-slate-100 dark:border-white/10 text-emerald-900 dark:text-emerald-200/90 leading-relaxed font-normal">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Technical Analysis: </span>
                  {cp.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {onNextLesson && hasNext && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onNextLesson}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01]"
            >
              <span>{nextLabel || "Proceed to Next Lesson"}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/60 to-white/40 dark:from-indigo-950/25 dark:to-slate-900/40 p-6 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 dark:border-indigo-500/20 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25">
            ?
          </span>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Knowledge Checkpoints
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Question {activeStep + 1} of {totalSteps}
            </p>
          </div>
        </div>

        {totalSteps > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/80 dark:border-white/10">
            {checkpoints.map((_, idx) => {
              const cleared = !!clearedSteps[idx];
              const isActive = idx === activeStep;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : cleared
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <span>{cleared ? "✓" : idx + 1}</span>
                  <span className="hidden sm:inline">Checkpoint {idx + 1}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
          Checkpoint {activeStep + 1} of {totalSteps}
        </span>
        <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug">
          {currentCheck.question}
        </p>
      </div>

      <div className="space-y-2.5 pt-1">
        {currentCheck.choices.map((c, ci) => {
          const isSelected = selected === ci;
          return (
            <ChoiceOption
              key={ci}
              selected={isSelected}
              disabled={isCurrentCleared}
              onClick={() => !isCurrentCleared && setSelectedAnswers(prev => ({ ...prev, [activeStep]: ci }))}
            >
              {c}
            </ChoiceOption>
          );
        })}
      </div>

      {currentFeedback === "wrong" && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3.5 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2"
        >
          <span>⚠️</span>
          <span>Not quite — review the lesson concepts above and select the correct operational choice!</span>
        </motion.div>
      )}

      {isCurrentCleared && currentCheck.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-normal text-emerald-950 dark:text-emerald-200/95 leading-relaxed"
        >
          <span className="font-bold text-emerald-900 dark:text-emerald-300">Technical Analysis: </span>
          {currentCheck.explanation}
        </motion.div>
      )}

      <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
        {!isCurrentCleared ? (
          <button
            type="button"
            onClick={handleVerify}
            disabled={selected == null || checking}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {checking ? "Verifying Answer…" : "Verify Answer"}
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>✓ Checkpoint {activeStep + 1} Cleared!</span>
          </div>
        )}

        {isCurrentCleared && activeStep < totalSteps - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <span>Next Checkpoint</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
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

  return (
    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/10">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <span>📝</span>
        {open ? "Hide My Personal Notes" : text ? "My Notes (Saved to Device)" : "+ Add Personal Notes"}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            value={text}
            onChange={e => save(e.target.value)}
            rows={3}
            placeholder="Jot down personal takeaways or commands — saved automatically on this device."
            className="w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-slate-800/80 p-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-inner leading-relaxed"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
            <span>Saved in local storage</span>
            <span>{text.length} characters</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LessonPane({ lesson, index, total, done, locked, bookmarked, onToggleBookmark, onCheck }) {
  const [expanded, setExpanded] = useState(!locked && !done);
  const wasLocked = useRef(locked);

  useEffect(() => {
    if (wasLocked.current && !locked) setExpanded(true);
    wasLocked.current = locked;
  }, [locked]);

  if (locked) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-3.5 text-xs text-slate-400 dark:text-slate-500">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-xl bg-slate-100 dark:bg-white/5 text-[11px]" aria-hidden>
          🔒
        </span>
        <span className="flex-1 truncate font-semibold">{lesson.title}</span>
        <span className="shrink-0 text-[10px] font-medium">Complete previous lesson to unlock</span>
      </div>
    );
  }

  return (
    <div className="relative flex gap-3.5">
      <div className="flex flex-col items-center">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${done ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
          }`}>
          {done ? "✓" : index + 1}
        </span>
        {index < total - 1 && <span className="mt-1.5 w-0.5 flex-1 bg-slate-200 dark:bg-white/10" />}
      </div>

      <SpotlightCard className="mb-3.5 flex-1 p-5 rounded-3xl" tint="rose">
        <div className="flex items-start justify-between gap-4">
          <button onClick={() => setExpanded(e => !e)} className="flex-1 text-left text-sm font-bold text-slate-900 dark:text-white">
            {lesson.title}
          </button>
          <div className="flex shrink-0 items-center gap-2">
            {done && (
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                ✓ Done
              </span>
            )}
            <button
              onClick={() => onToggleBookmark(lesson.id)}
              aria-label="Bookmark this lesson"
              className={`text-sm ${bookmarked ? "text-amber-500" : "text-slate-300 hover:text-slate-500"}`}
            >
              {bookmarked ? "★" : "☆"}
            </button>
            <button onClick={() => setExpanded(e => !e)} aria-label="Expand lesson" className="text-slate-400 hover:text-slate-600">
              <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={FADE_UP}>
              <InteractiveLessonVideo
                title={lesson.title}
                lessonVideo={lesson.video || lesson.videoId}
              />
            </motion.div>
            <motion.p variants={FADE_UP} className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              {lesson.body}
            </motion.p>
            {DIAGRAM_DEMOS[lesson.title] && <motion.div variants={FADE_UP}><InteractiveDiagram diagram={DIAGRAM_DEMOS[lesson.title]} /></motion.div>}
            {lesson.lab && <motion.div variants={FADE_UP}><LabCard lab={lesson.lab} /></motion.div>}
            {TERMINAL_DEMOS[lesson.title] && <motion.div variants={FADE_UP}><TerminalPlayground demos={TERMINAL_DEMOS[lesson.title]} /></motion.div>}
            {lesson.keyTakeaway && (
              <motion.div variants={FADE_UP} className="relative mt-4 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <span>💡</span> Key Takeaway
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed">{lesson.keyTakeaway}</p>
              </motion.div>
            )}
            {!done && (lesson.checks || lesson.check) && <motion.div variants={FADE_UP}><LessonCheck check={lesson.check} checks={lesson.checks} onCheck={(choiceIndex, checkpointIndex, allPassed) => onCheck(choiceIndex, checkpointIndex, allPassed)} /></motion.div>}
            <motion.div variants={FADE_UP}><LessonNote lessonId={lesson.id} /></motion.div>
          </motion.div>
        )}
      </SpotlightCard>
    </div>
  );
}

function ModuleSection({ mod, lessons, progress, lockedIds, bookmarks, onToggleBookmark, onCheck }) {
  const completed = lessons.filter(l => progress?.has(l.id)).length;
  const pct = lessons.length > 0 ? Math.round(completed / lessons.length * 100) : 0;
  return (
    <div id={`module-${mod.id}`} className="scroll-mt-24 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{mod.title}</h3>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{completed}/{lessons.length} complete</span>
      </div>
      <div className="mb-4"><ModuleProgressBar pct={pct} tone={pct === 100 ? "emerald" : "rose"} /></div>
      <div className="space-y-1">
        {lessons.map((lesson, i) => {
          const done = progress?.has(lesson.id) ?? false;
          return <LessonPane key={lesson.id} lesson={lesson} index={i} total={lessons.length} done={done} locked={lockedIds.has(lesson.id)} bookmarked={bookmarks.has(lesson.id)} onToggleBookmark={onToggleBookmark} onCheck={(choiceIndex, checkpointIndex, allPassed) => onCheck(lesson.id, choiceIndex, checkpointIndex, allPassed)} />;
        })}
      </div>
      <InterviewQuestions questions={mod.interviewQuestions} />
    </div>
  );
}

function SingleChoiceQuestion({ q, value, onChange }) {
  return (
    <div className="mt-3.5 space-y-2">
      {q.choices.map((c, ci) => (
        <ChoiceOption key={ci} selected={value === ci} onClick={() => onChange(ci)}>
          {c}
        </ChoiceOption>
      ))}
    </div>
  );
}

function MultipleChoiceQuestion({ q, value, onChange }) {
  const selected = value ?? [];
  function toggle(ci) {
    onChange(selected.includes(ci) ? selected.filter(x => x !== ci) : [...selected, ci]);
  }
  return (
    <div className="mt-3.5 space-y-2">
      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Select all choices that apply.</p>
      {q.choices.map((c, ci) => (
        <ChoiceOption key={ci} shape="square" selected={selected.includes(ci)} onClick={() => toggle(ci)}>
          {c}
        </ChoiceOption>
      ))}
    </div>
  );
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
  return (
    <div className="mt-3.5 space-y-2">
      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Arrange in the correct sequence using the up and down arrows.</p>
      <AnimatePresence initial={false}>
        {order.map((choiceIdx, pos) => (
          <motion.div
            layout
            key={choiceIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-800/60 px-4 py-3 text-xs md:text-sm text-slate-900 dark:text-white shadow-sm"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white text-xs font-bold">
              {pos + 1}
            </span>
            <span className="flex-1 font-semibold leading-relaxed">{q.choices[choiceIdx]}</span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(pos, -1)}
                disabled={pos === 0}
                aria-label="Move up"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-25"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(pos, 1)}
                disabled={pos === order.length - 1}
                aria-label="Move down"
                className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-25"
              >
                ▼
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
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
  const pct = Math.round((answeredCount / questions.length) * 100);

  return (
    <SpotlightCard className="p-6 md:p-8 rounded-3xl" tint="rose">
      <div className="mb-6 border-b border-slate-100 dark:border-white/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Final Examination
            </span>
            <h4 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
              Course Mastery Assessment
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {questions.length} Questions · Pass mark is 70% or higher to earn your official certificate.
            </p>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>Answered</span>
              <span>{answeredCount}/{questions.length} ({pct}%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 15 Question Jump Navigation */}
      <div className="mb-6 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center flex-wrap gap-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 uppercase tracking-wider">
          Jump to:
        </span>
        <div className="flex items-center flex-wrap gap-1.5">
          {questions.map((q, idx) => {
            const isAns = questionAnswered(q, answers[q.id]);
            return (
              <button
                type="button"
                key={q.id}
                onClick={() => {
                  const el = document.getElementById(`quiz-q-${q.id}`);
                  el?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isAns
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-indigo-400"
                }`}
                title={`Question ${idx + 1}: ${isAns ? "Answered" : "Not answered"}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, i) => {
          const answered = questionAnswered(q, answers[q.id]);
          return (
            <motion.div
              key={q.id}
              id={`quiz-q-${q.id}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i, 4) * 0.05 }}
              className={`rounded-3xl border p-5 md:p-6 transition-all ${answered
                  ? "border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/5 shadow-sm"
                  : "border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.01]"
                }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold transition-colors ${answered ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  {answered ? "✓" : i + 1}
                </span>
                <div>
                  <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>
              </div>

              {q.questionType === "multiple" ? (
                <MultipleChoiceQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />
              ) : q.questionType === "ordering" ? (
                <OrderingQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />
              ) : (
                <SingleChoiceQuestion q={q} value={answers[q.id]} onChange={v => setAnswers({ ...answers, [q.id]: v })} />
              )}
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => submit.mutate()}
        disabled={!allAnswered || submit.isPending}
        className="mt-8 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
      >
        {submit.isPending ? "Grading Assessment…" : allAnswered ? "Submit Assessment & Grade Results →" : `Complete all questions to submit (${answeredCount}/${questions.length})`}
      </button>
    </SpotlightCard>
  );
}

function SpotTheRedFlagsExercise() {
  const [foundFlags, setFoundFlags] = useState(new Set());
  const redFlags = [
    { id: "domain", title: "Free/Personal Email Domain", text: "From: amazon-support@gmail.com — Major enterprises never send account security alerts from free public domains." },
    { id: "reward", title: "Unsolicited Financial Lure", text: "Subject: $500 Amazon gift credit — Unexpected prizes are the #1 phishing bait." },
    { id: "attachment", title: "Executable Attachment (.exe)", text: "Attachment: Payment_Form.exe — .exe files execute malicious payloads directly on your computer." },
    { id: "urgency", title: "Manufactured High Urgency", text: "Urgent pressure demanding immediate action before verifying." }
  ];

  function toggleFlag(id) {
    setFoundFlags(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="rounded-3xl border border-amber-300/60 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20 p-5 md:p-6 space-y-4 text-slate-900 dark:text-white my-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-white/10 pb-3">
        <div>
          <h4 className="text-sm md:text-base font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <span>🔍</span> Interactive Exercise — Spot the Phishing Red Flags
          </h4>
          <p className="text-xs text-amber-800/80 dark:text-slate-300 mt-0.5">Click the suspicious elements in the email below to identify all 4 red flags!</p>
        </div>
        <span className="rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 px-3 py-1 text-xs font-mono font-bold">
          {foundFlags.size} / 4 Identified
        </span>
      </div>

      {/* Email Inspection Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 space-y-3 font-sans text-xs shadow-inner">
        <div
          onClick={() => toggleFlag("domain")}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${foundFlags.has("domain") ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : "border-slate-100 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50/70 dark:bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">From:</span> <span className="underline font-bold">amazon-support@gmail.com</span> {foundFlags.has("domain") && "✓ [Red Flag: Free public domain]"}
        </div>
        <div
          onClick={() => toggleFlag("reward")}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${foundFlags.has("reward") ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : "border-slate-100 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50/70 dark:bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Subject:</span> <span className="underline font-bold">Congratulations! You have won $500 in Amazon credit</span> {foundFlags.has("reward") && "✓ [Red Flag: Unsolicited reward]"}
        </div>
        <div
          onClick={() => toggleFlag("attachment")}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${foundFlags.has("attachment") ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : "border-slate-100 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50/70 dark:bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Attachment:</span> <span className="underline font-mono font-bold text-rose-500">Payment_Form.exe</span> {foundFlags.has("attachment") && "✓ [Red Flag: Dangerous executable .exe]"}
        </div>
        <div
          onClick={() => toggleFlag("urgency")}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${foundFlags.has("urgency") ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold" : "border-slate-100 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50/70 dark:bg-slate-800/50"}`}
        >
          <span className="text-slate-400 font-mono">Body:</span> Claim your $500 gift card right now by running the attached payment form! {foundFlags.has("urgency") && "✓ [Red Flag: Manufactured urgency]"}
        </div>
      </div>

      {/* Unlocked Explanations List */}
      {foundFlags.size > 0 && (
        <div className="space-y-2 pt-1">
          {redFlags.filter(f => foundFlags.has(f.id)).map(f => (
            <div key={f.id} className="text-xs bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-900 dark:text-emerald-200">
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
  const [activeTab, setActiveTab] = useState("lesson"); // "lesson" | "quiz" | "capstone" | "certificate"
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
    checkAnswer: (lessonId, choiceIndex, checkpointIndex, allPassed) => localCheckLessonAnswer(course.id, lessonId, choiceIndex, user?.id, checkpointIndex, allPassed),
    submitQuiz: (courseId, answers) => localSubmitQuiz(courseId, answers, user?.id)
  } : {
    modules: () => fetchCourseModules(course.id),
    lessons: () => fetchCourseLessons(course.id),
    quiz: () => fetchCourseQuiz(course.id),
    enroll: () => enrollInCourse(course.id),
    progress: () => fetchMyLessonProgress(course.id),
    checkAnswer: (lessonId, choiceIndex, checkpointIndex, allPassed) => checkLessonAnswer(lessonId, choiceIndex),
    submitQuiz: (courseId, answers) => submitCourseQuiz(courseId, answers)
  }, [local, course.id, user?.id]);

  const { data: modules } = useQuery({ queryKey: ["cybersachet-modules", local, course.id], queryFn: fns.modules });
  const { data: lessons } = useQuery({ queryKey: ["cybersachet-lessons", local, course.id], queryFn: fns.lessons });
  const { data: quiz, isLoading: quizLoading } = useQuery({ queryKey: ["cybersachet-quiz", local, course.id], queryFn: fns.quiz, enabled: course.quizQuestionCount > 0 });
  const enroll = useMutation({ mutationFn: fns.enroll, onSuccess: onProgress, onError: err => toast.error(err instanceof Error ? err.message : "Failed to enroll") });
  const { data: progress, refetch: refetchProgress } = useQuery({ queryKey: ["cybersachet-lesson-progress", local, course.id], queryFn: fns.progress, enabled: !!enrollment });
  const check = useMutation({
    mutationFn: ({ lessonId, choiceIndex, checkpointIndex, allPassed }) => fns.checkAnswer(lessonId, choiceIndex, checkpointIndex, allPassed),
    onSuccess: correct => { if (correct) { onProgress(); refetchProgress(); } },
    onError: err => toast.error(err instanceof Error ? err.message : "Failed to check answer")
  });
  const [lastScore, setLastScore] = useState(enrollment?.quizScore ?? null);
  const [showQuizReview, setShowQuizReview] = useState(false);

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

  const activeLessonCheckpoints = (activeLesson?.checks && activeLesson.checks.length > 0)
    ? activeLesson.checks
    : (activeLesson?.check ? [activeLesson.check] : []);
  const hasCheckpoints = activeLessonCheckpoints.length > 0;
  const isCurrentLessonDone = progress?.has(activeLesson?.id) ?? false;
  const canAdvance = !hasCheckpoints || isCurrentLessonDone;
  const hasNextLesson = activeLessonIndex < (lessons ?? []).length - 1;
  const canGoNextOrQuiz = hasNextLesson || course.quizQuestionCount > 0;
  const nextActionLabel = hasNextLesson ? "Next Lesson" : "Proceed to Final Quiz";

  function handleAdvanceLesson() {
    if (hasNextLesson) {
      setActiveLessonId(lessons[activeLessonIndex + 1].id);
    } else if (course.quizQuestionCount > 0) {
      setActiveTab("quiz");
    }
  }

  // Keyboard navigation shortcuts (Alt + ArrowLeft / ArrowRight)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (!canAdvance) {
          toast.error(`Complete all ${activeLessonCheckpoints.length} knowledge checkpoints to unlock the next lesson.`);
          return;
        }
        handleAdvanceLesson();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeLessonIndex > 0) {
          setActiveLessonId(lessons[activeLessonIndex - 1].id);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLessonIndex, lessons, course.quizQuestionCount, canAdvance, activeLessonCheckpoints.length, hasNextLesson]);

  return (
    <div className="space-y-4 lg:h-[calc(100vh-3.5rem)] lg:flex lg:flex-col lg:overflow-hidden">
      {/* Top Header & Breadcrumbs Bar (Fixed at top) */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-indigo-600 dark:hover:text-white transition-all shadow-sm"
          >
            <span>←</span> Catalog
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${LEVEL_TONE[course.level] ?? LEVEL_TONE.beginner}`}>
              {course.level}
            </span>
            <span className="text-slate-900 dark:text-white font-bold truncate max-w-xs md:max-w-md text-xs md:text-sm">{course.title}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(lessons?.length ?? 0) > 0 && (
            <button
              onClick={() => setShowFlashcards(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <span>⚡</span>
              <span>Flashcards</span>
            </button>
          )}
          {(lessons?.length ?? 0) > 0 && (
            <button
              onClick={() => downloadTextFile(`${course.slug}-cheat-sheet.txt`, buildCheatSheetText(course, modules, lessons, TERMINAL_DEMOS))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <span>📑</span>
              <span>Cheat Sheet</span>
            </button>
          )}
          {course.quizQuestionCount > 0 && (
            <button
              onClick={() => setActiveTab("quiz")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${activeTab === "quiz"
                  ? "bg-indigo-600 text-white shadow-indigo-500/25"
                  : "border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                }`}
            >
              <span>🎯</span>
              <span>Quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Dedicated Fixed Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0 lg:overflow-hidden">
        {/* Left Column: 100% Fixed Pinned Syllabus Sidebar */}
        <div className="lg:col-span-4 h-full flex flex-col min-h-0">
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-neutral-900 p-4.5 shadow-sm flex flex-col h-full overflow-hidden">
            {/* Fixed Sidebar Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Course Syllabus
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {completedCount} of {(lessons ?? []).length} completed
                </p>
              </div>
              <div className="w-10 h-10 shrink-0">
                <ProgressRing pct={coursePct} size={40} stroke={3.5} />
              </div>
            </div>

            {/* Lesson Search Filter (Fixed under header) */}
            <div className="relative py-2.5 shrink-0">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search lessons…"
                className="w-full rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 pl-3.5 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Syllabus Modules (Scrollable button contents in fixed container) */}
            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1.5 my-1">
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
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs transition-all border ${isActive
                              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-400/50 font-bold"
                              : isLocked
                                ? "border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] text-slate-400 dark:text-slate-600 opacity-60 cursor-not-allowed"
                                : "border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                            }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${isDone
                                ? "bg-emerald-500 text-white"
                                : isActive
                                  ? "bg-indigo-600 text-white"
                                  : isLocked
                                    ? "bg-slate-200 dark:bg-white/10 text-slate-500"
                                    : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                              }`}>
                              {isDone ? "✓" : isLocked ? "🔒" : idx + 1}
                            </span>
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          {bookmarks.has(lesson.id) && <span className="text-amber-500 text-xs shrink-0 ml-2">★</span>}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions (Fixed at bottom of sidebar card) */}
            <div className="pt-3 mt-auto border-t border-slate-100 dark:border-white/10 space-y-2 shrink-0">
              {course.capstone && (
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("capstone")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "capstone"
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                      : "bg-purple-50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-300 hover:bg-purple-100"
                    }`}
                >
                  <span>🛠️ Capstone Project</span>
                </motion.button>
              )}

              {course.quizQuestionCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("quiz")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "quiz"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "bg-indigo-50 text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300 hover:bg-indigo-100"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🎯</span>
                    <span>Final Assessment Quiz</span>
                  </div>
                  {lastScore !== null && <span className="text-[10px] bg-indigo-200 dark:bg-indigo-500/30 px-2 py-0.5 rounded-full">{lastScore}%</span>}
                </motion.button>
              )}

              {((lastScore !== null && lastScore >= 70) || !!enrollment?.completedAt) && (
                <motion.button
                  whileHover={{ scale: 1.01, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("certificate")}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${activeTab === "certificate"
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
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

        {/* Right Column: Independently Scrollable Lesson Canvas */}
        <div className="lg:col-span-8 h-full min-h-0 overflow-y-auto pr-2 space-y-6">
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
                  courseSlug={course?.slug || course?.id}
                  lessonVideo={activeLesson.video || activeLesson.videoId}
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
                {(activeLesson.checks || activeLesson.check) && (
                  <div className="mt-6">
                    {progress?.has(activeLesson.id) ? (
                      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-5 text-xs md:text-sm text-emerald-900 dark:text-emerald-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-emerald-500/20 pb-3">
                          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                            <span className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-500 text-white text-xs font-bold">✓</span>
                            <span>Knowledge Checkpoints Mastered ({(activeLesson.checks || [activeLesson.check]).length}/{(activeLesson.checks || [activeLesson.check]).length})</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/40">
                            100% Cleared
                          </span>
                        </div>
                        <div className="space-y-3 pt-1">
                          {(activeLesson.checks && activeLesson.checks.length > 0 ? activeLesson.checks : [activeLesson.check]).map((cp, idx) => (
                            <div key={idx} className="rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-500/20 p-3.5 space-y-2 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                                  ✓
                                </span>
                                <p className="font-bold text-slate-900 dark:text-white leading-snug">
                                  {cp.question}
                                </p>
                              </div>
                              {cp.explanation && (
                                <div className="ml-7 pt-2 border-t border-slate-100 dark:border-white/10 text-emerald-950 dark:text-emerald-200/90 leading-relaxed font-normal">
                                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Technical Analysis: </span>
                                  {cp.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Direct Next Lesson Action inside Cleared Checkpoints card */}
                        {canGoNextOrQuiz && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={handleAdvanceLesson}
                              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.01]"
                            >
                              <span>{nextActionLabel}</span>
                              <span>→</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <LessonCheck
                        check={activeLesson.check}
                        checks={activeLesson.checks}
                        onCheck={(choiceIndex, checkpointIndex, allPassed) => check.mutateAsync({ lessonId: activeLesson.id, choiceIndex, checkpointIndex, allPassed })}
                        onNextLesson={handleAdvanceLesson}
                        hasNext={canGoNextOrQuiz}
                        nextLabel={nextActionLabel}
                      />
                    )}
                  </div>
                )}

                {/* Personal Notes */}
                <LessonNote lessonId={activeLesson.id} />

                {/* Footer Navigation Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/10 pt-6 mt-6">
                  <button
                    onClick={() => {
                      if (activeLessonIndex > 0) setActiveLessonId(lessons[activeLessonIndex - 1].id);
                    }}
                    disabled={activeLessonIndex <= 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/15 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                  >
                    <span>← Previous</span>
                    <span className="hidden sm:inline text-[10px] text-slate-400 font-mono">(Alt+←)</span>
                  </button>

                  {/* Only show Next Lesson button once all checkpoints are completed */}
                  {canAdvance ? (
                    canGoNextOrQuiz && (
                      <button
                        onClick={handleAdvanceLesson}
                        className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01]"
                      >
                        <span>{nextActionLabel}</span>
                        <span className="hidden sm:inline text-[10px] text-white/70 font-mono">(Alt+→)</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </button>
                    )
                  ) : (
                    <div
                      title="Clear all 3 checkpoints to unlock the next lesson"
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500 select-none cursor-not-allowed"
                    >
                      <span className="text-sm">🔒</span>
                      <span>Complete all {activeLessonCheckpoints.length} checkpoints to unlock {hasNextLesson ? "Next Lesson" : "Final Quiz"}</span>
                    </div>
                  )}
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
                      <button onClick={() => { setLastScore(null); setShowQuizReview(false); }} className="rounded-xl border border-slate-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                        Retake Quiz
                      </button>
                      <button
                        onClick={() => setShowQuizReview(prev => !prev)}
                        className="rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/30 px-5 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                      >
                        {showQuizReview ? "Hide Answer Explanations" : "Review All 15 Explanations 💡"}
                      </button>
                      {lastScore >= 70 && (
                        <button onClick={() => setActiveTab("certificate")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all">
                          View Official Certificate 🎓
                        </button>
                      )}
                    </div>
                    {showQuizReview && quiz && (
                      <div className="mt-8 text-left space-y-4 border-t border-slate-200 dark:border-white/10 pt-6">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                            All 15 Exam Questions & Expert Explanations
                          </h5>
                          <span className="text-xs text-slate-500 dark:text-slate-400">15 Questions</span>
                        </div>
                        <div className="space-y-4">
                          {quiz.map((q, idx) => (
                            <div
                              key={q.id}
                              className="p-4 md:p-5 rounded-2xl border border-slate-200/90 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] space-y-2.5"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <p className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                                  {q.question}
                                </p>
                              </div>
                              {q.explanation && (
                                <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                                  <span className="font-bold text-indigo-900 dark:text-indigo-300">Explanation: </span>
                                  {q.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

  return (
    <div className="space-y-6">
      {certificate ? (
        <div id="certificate-print-area">
          <CertificateDownloadCard verifyPath={`/verify/${certificate.certificateNo}`}>
            <CyberSachetCertificate userName={userName} orgName={orgName} certId={certificate.certificateNo} score={certificate.averageScore} averageScore={certificate.averageScore} courseCount={certificate.courseCount} hoursTrained={certificate.hoursTrained} issuedAt={certificate.issuedAt} expiresAt={certificate.expiresAt} certificateHash={certificate.certificateHash} verifyPath={`${window.location.origin}/verify/${certificate.certificateNo}`} />
          </CertificateDownloadCard>
        </div>
      ) : eligible ? (
        <Reveal>
          <div className="rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-6 text-center space-y-3">
            <p className="text-3xl" aria-hidden>🏅</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">You've completed every assigned course — your CSSA certificate is ready.</p>
            <button onClick={() => issue.mutate()} disabled={issue.isPending} className="rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
              {issue.isPending ? "Generating…" : "Claim your CSSA Certificate"}
            </button>
          </div>
        </Reveal>
      ) : null}
      <CertificationPath earnedCode={certificate ? "CSSA" : null} />
    </div>
  );
}

function LocalCertificatePreview({ eligible, stats, courseCount, brand = "cybersachet" }) {
  const { user, organization } = useAuth();
  if (!eligible) return <CertificationPath earnedCode={null} />;
  return (
    <div className="space-y-6">
      <div>
        <CyberSachetCertificate
          preview
          brand={brand}
          userName={user?.name}
          orgName={organization?.name ?? "Your organization"}
          score={stats?.avgScore ?? 0}
          averageScore={stats?.avgScore ?? 0}
          courseCount={courseCount}
          hoursTrained={stats?.hoursTrained ?? 0}
          issuedAt={new Date().toISOString()}
          expiresAt={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()}
        />
        <p className="mx-auto mt-3 max-w-md text-center text-xs text-slate-500 dark:text-slate-400">
          This is a preview of the real {brand === "academy" ? "Moonsav ITOps Academy" : "CSSA"} certificate design — a verifiable version with a QR code and a public verification
          page is issued the moment your organization licenses {brand === "academy" ? "Moonsav ITOps Academy" : "CyberSachet"}.
        </p>
      </div>
      <CertificationPath earnedCode={null} />
    </div>
  );
}

export default function CyberSachetTraining({ defaultTrack = "security" }) {
  const { user, organization } = useAuth();
  const { data: licensed, isLoading: licenseLoading, isError: licenseError, refetch: refetchLicense } = useQuery({
    queryKey: ["cybersachet-license", defaultTrack],
    queryFn: defaultTrack === "academy" ? fetchAcademyLicense : fetchCybersachetLicense,
    retry: false
  });
  const { data: usage, isLoading: usageLoading } = useQuery({ queryKey: ["plan-usage"], queryFn: fetchPlanUsage, staleTime: 60_000 });
  const orgPlan = usage?.plan ?? "STARTER";
  const orgPlanRank = PLAN_ORDER.indexOf(orgPlan);
  const isStarter = orgPlan === "STARTER";
  const courseAllowedByPlan = c => isPlanAllowed(c.minPlan ?? (c.freeTier ? "STARTER" : "PROFESSIONAL"), orgPlan);
  const local = !licenseLoading && !licensed && !licenseError;

  const { data: liveCourses, isLoading: coursesLoading, isError: coursesError, refetch: refetchCourses } = useQuery({ queryKey: ["cybersachet-courses"], queryFn: fetchCybersachetCourses, enabled: !!licensed });
  const { data: liveEnrollments, refetch: refetchEnrollments } = useQuery({ queryKey: ["cybersachet-enrollments"], queryFn: fetchMyEnrollments, enabled: !!licensed });
  const { data: assignments } = useQuery({ queryKey: ["cybersachet-my-assignments"], queryFn: fetchMyCybersachetAssignments, enabled: !!licensed });
  const { data: stats } = useQuery({ queryKey: ["cybersachet-my-stats"], queryFn: fetchMyCybersachetStats, enabled: !!licensed });
  const { data: leaderboard } = useQuery({ queryKey: ["cybersachet-leaderboard"], queryFn: fetchCybersachetLeaderboard, enabled: !!licensed });
  const { data: learningPaths } = useQuery({ queryKey: ["cybersachet-learning-paths"], queryFn: fetchLearningPaths, enabled: !!licensed });
  const { data: can } = useQuery({ queryKey: ["my-permissions", organization?.id], queryFn: () => fetchMyPermissions(organization?.id), enabled: !!organization?.id, retry: false });
  const canManageTraining = !!can && can("organization", "training", "manage");
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
  const [activeLevel, setActiveLevel] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const activeTrack = defaultTrack;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [defaultTrack]);

  if (licenseLoading || usageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TrainingTrackToggle active={activeTrack} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  const enrollmentByCourseId = new Map((enrollments ?? []).map(e => [e.courseId, e]));
  const completedCount = (enrollments ?? []).filter(e => e.completedAt).length;
  const inProgressCount = (enrollments ?? []).filter(e => !e.completedAt && e.enrolledAt).length;

  function refreshEnrollments() {
    if (local) refreshLocal(); else refetchEnrollments();
  }

  if (openCourse) {
    return (
      <CourseDetail
        course={openCourse}
        enrollment={enrollmentByCourseId.get(openCourse.id)}
        local={local}
        onBack={() => { setOpenCourse(null); refreshEnrollments(); }}
        onProgress={refreshEnrollments}
      />
    );
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

  // Compute category counts for category chips
  const countsByCategory = { all: visibleCourses.length + lockedCourses.length };
  for (const c of [...visibleCourses, ...lockedCourses]) {
    if (c.category) {
      countsByCategory[c.category] = (countsByCategory[c.category] ?? 0) + 1;
    }
  }

  // Find the first enrolled course in-progress to support 1-click "Resume Learning"
  const inProgressEnrollment = (enrollments ?? []).find(e => !e.completedAt && e.enrolledAt);
  const resumeCourse = inProgressEnrollment
    ? trackCourses.find(c => c.id === inProgressEnrollment.courseId) ?? null
    : null;

  const matchesSearch = c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q);
  };

  const matchesLevel = c => {
    if (!activeLevel) return true;
    return c.level?.toLowerCase() === activeLevel.toLowerCase();
  };

  const filteredVisible = visibleCourses.filter(c => (activeCategory ? c.category === activeCategory : true) && matchesLevel(c) && matchesSearch(c));
  const filteredLocked = lockedCourses.filter(c => (activeCategory ? c.category === activeCategory : true) && matchesLevel(c) && matchesSearch(c));
  const categories = [...new Set(trackCourses.map(c => c.category))].filter(Boolean);

  const securityCourses = allCourses.filter(c => courseTrack(c) === "security");
  const securityCompletedCount = securityCourses.filter(c => enrollmentByCourseId.get(c.id)?.completedAt).length;

  const dashboardStats = local ? localStats : stats;
  const heroTitle = activeTrack === "academy" ? "Moonsav ITOps Academy" : "CyberSachet Training";
  const heroSubtitle = activeTrack === "academy"
    ? "Cloud, DevOps, and infrastructure courses — enroll, complete lessons, and pass the quiz."
    : local
      ? "Security awareness courses for your team — enroll, complete lessons, and pass the quiz."
      : canManageTraining
        ? "The full catalog — assign any course to a team member, or take one yourself."
        : "Your assigned courses, progress, and certification, in one place.";

  const trackCompletedCount = visibleCourses.filter(c => enrollmentByCourseId.get(c.id)?.completedAt).length;
  const trackProgressPct = visibleCourses.length > 0 ? Math.round((trackCompletedCount / visibleCourses.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TrainingTrackToggle active={activeTrack} />
      </div>

      <motion.div
        key="cybersachet-catalog-body"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="space-y-6"
      >

      <Reveal y={12}>
        <TrainingHero
          academy={activeTrack === "academy"}
          title={heroTitle}
          subtitle={heroSubtitle}
          progressPct={visibleCourses.length > 0 ? trackProgressPct : null}
          resumeCourse={resumeCourse}
          onResume={c => setOpenCourse(c)}
          stats={visibleCourses ? [
            { label: local || canManageTraining ? "Courses" : "Assigned", value: visibleCourses.length },
            { label: "In progress", value: inProgressCount },
            { label: "Completed", value: completedCount }
          ] : null}
        />
      </Reveal>

      {activeTrack === "academy" && (
        <Reveal delay={0.04}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-indigo-200/90 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/40 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30 text-2xl shadow-xs">
                💻
              </span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Hands-on Linux & Cloud Lab Cockpit
                  </p>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/30">
                    Live Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Launch live terminal environments, Prometheus & Loki observability, and topology maps
                </p>
              </div>
            </div>
            <Link
              to="/training/itops"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
            >
              <span>Launch Live Simulator</span>
              <span>→</span>
            </Link>
          </div>
        </Reveal>
      )}

      {licenseError && (
        <Reveal delay={0.05}>
          <ErrorState
            message="Couldn't confirm your license status — this is a connection issue, not a licensing change. Your organization's data is safe."
            onRetry={refetchLicense}
          />
        </Reveal>
      )}
      {local && (
        <Reveal delay={0.05}>
          <LocalPreviewBanner />
        </Reveal>
      )}

      {dashboardStats && (() => {
        const currentXp = dashboardStats.completedCourses * 250 + Math.round(dashboardStats.hoursTrained * 20) + (dashboardStats.avgScore ?? 0) * 2 + dashboardStats.streakDays * 15;
        const xpInfo = xpLevel(currentXp);
        const allBadges = ["first_course", "perfect_score", "streak_3", "certified"];

        return (
          <Reveal delay={0.08}>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
              {/* XP Stat Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Total XP
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 border border-amber-400/30">
                    {xpInfo.label}
                  </span>
                </div>
                <p className="mt-2.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  <AnimatedCounter value={currentXp} />
                </p>
                <div className="mt-2.5 space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span>Rank progress</span>
                    <span>{xpInfo.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${xpInfo.pct}%` }} />
                  </div>
                </div>
              </div>

              {/* Avg Quiz Score Stat Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    Quiz Average
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">70% Pass</span>
                </div>
                <p className="mt-2.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {dashboardStats.avgScore != null ? `${dashboardStats.avgScore}%` : "—"}
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {dashboardStats.avgScore != null && dashboardStats.avgScore >= 70 ? "Passing mark achieved" : "Target score: 70%+"}
                </p>
              </div>

              {/* Learning Hours Stat Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Learning Hours
                  </span>
                </div>
                <p className="mt-2.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                  {dashboardStats.hoursTrained.toFixed(1)}h
                </p>
                <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Total study time
                </p>
              </div>

              {/* Streak Tracker Stat Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Current Streak
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{dashboardStats.streakDays}</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Days</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => (
                    <span
                      key={idx}
                      className={`grid h-5 w-5 place-items-center rounded-md text-[9px] font-bold ${idx < Math.min(dashboardStats.streakDays, 7)
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                          : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-white/40"
                        }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges Stat Card */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/95 p-4.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
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
                            : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-white/40 opacity-60"
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

      {!local && leaderboard && leaderboard.length > 0 && (
        <Reveal delay={0.1}>
          <SpotlightCard className="p-5" tint="white">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Team Leaderboard
            </p>
            <Leaderboard rows={leaderboard} currentUserId={user?.id} />
          </SpotlightCard>
        </Reveal>
      )}

      {trackLearningPaths.length > 0 && (
        <Reveal delay={0.1} className="space-y-4">
          {trackLearningPaths.map(path => (
            <LearningPathCard
              key={path.id}
              path={path}
              orgPlan={orgPlan}
              onOpenCourse={c => {
                const full = courseById.get(c.courseId);
                if (full) setOpenCourse(full);
              }}
            />
          ))}
        </Reveal>
      )}

      <CategoryFilterChips
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeLevel={activeLevel}
        onLevelChange={setActiveLevel}
        countsByCategory={countsByCategory}
      />

      {!local && coursesLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-3xl" />
          ))}
        </div>
      ) : !local && coursesError ? (
        <ErrorState message="Couldn't load courses." onRetry={refetchCourses} />
      ) : filteredVisible.length === 0 && filteredLocked.length === 0 ? (
        activeCategory || activeLevel || searchQuery ? (
          <EmptyState
            title="No matching courses found."
            description="Try clearing your search query, selecting another category, or choosing 'All Levels'."
          />
        ) : canManageTraining && !local ? (
          <EmptyState
            title="No courses in the catalog yet."
            description="Courses are managed by ITOps Solution — check back soon, or contact support if you expected to see some here."
          />
        ) : (
          <EmptyState
            title="No courses assigned yet."
            description="Course assignment is admin-only — ask your organization admin to assign training."
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVisible.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              enrollment={enrollmentByCourseId.get(course.id)}
              assignment={assignmentByCourseId.get(course.id)}
              onOpen={setOpenCourse}
              canManageTraining={canManageTraining && !local}
              members={members ?? []}
            />
          ))}
          {filteredLocked.map((course, i) => (
            <LockedCourseCard key={course.id} course={course} index={filteredVisible.length + i} />
          ))}
        </div>
      )}

      {!local && (
        <CertificateSection
          eligible={!isStarter && trackCompletedCount >= visibleCourses.length && visibleCourses.length > 0}
          userName={user?.name}
          orgName={organization?.name}
          brand={activeTrack === "academy" ? "academy" : "cybersachet"}
        />
      )}
      {local && (
        <LocalCertificatePreview
          eligible={!isStarter && trackCompletedCount >= visibleCourses.length && trackCompletedCount > 0}
          stats={localStats}
          courseCount={visibleCourses.length}
          brand={activeTrack === "academy" ? "academy" : "cybersachet"}
        />
      )}
      </motion.div>
    </div>
  );
}
