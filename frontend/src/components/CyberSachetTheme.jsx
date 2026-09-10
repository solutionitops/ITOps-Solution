import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { useSound } from "../context/SoundContext";

const COURSE_ICONS = {
  "phishing-awareness": "M4 6h16v12H4zM4 6l8 7 8-7",
  "password-security-mfa": "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm-2 9h4m-2-2v4",
  "social-engineering": "M8 12a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM3 20c0-3 2.5-5 5-5s5 2 5 5m3-5c2.5 0 5 2 5 5",
  "malware-ransomware": "M12 2v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M8 12a4 4 0 108 0 4 4 0 00-8 0z",
  "data-handling-privacy": "M4 5.5h16v5H4zM4 13.5h16v5H4zM7 8h.01M7 16h.01",
  "mobile-device-security": "M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zM8 5h8M11 19h2",
  "physical-security-workplace-awareness": "M4 21v-9l8-6 8 6v9h-5v-6H9v6z"
};

export function CourseIcon({ slug, size = 36 }) {
  const path = COURSE_ICONS[slug] ?? COURSE_ICONS["data-handling-privacy"];
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-indigo-600 shadow-md shadow-rose-500/25 border border-white/20"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" style={{ width: size * 0.55, height: size * 0.55 }} fill="none">
        <path d={path} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

const XP_LEVELS = [
  { label: "Beginner", min: 0, max: 500, color: "from-blue-500 to-cyan-500" },
  { label: "Intermediate", min: 500, max: 1500, color: "from-emerald-500 to-teal-500" },
  { label: "Advanced", min: 1500, max: 3500, color: "from-amber-500 to-orange-500" },
  { label: "Expert", min: 3500, max: Infinity, color: "from-violet-500 to-purple-600" }
];

export function xpLevel(xp) {
  const level = XP_LEVELS.find(l => xp < l.max) ?? XP_LEVELS[XP_LEVELS.length - 1];
  const span = level.max - level.min;
  const pct = span === Infinity || !isFinite(span) ? 100 : Math.min(100, Math.round(((xp - level.min) / span) * 100));
  return { label: level.label, min: level.min, max: level.max, pct, color: level.color };
}

export function TrainingHero({ title, subtitle, stats, academy = false, progressPct = null, resumeCourse = null, onResume = null }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className={`relative isolate overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
        isLight
          ? "border-slate-200/90 bg-white shadow-sm text-slate-900"
          : "border-slate-800 bg-slate-900 text-white shadow-sm"
      }`}
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <div
            className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl shadow-sm text-white ${
              academy
                ? "bg-amber-600 dark:bg-amber-500"
                : "bg-indigo-600 dark:bg-indigo-500"
            }`}
          >
            {academy ? (
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3l9 4.5-9 4.5-9-4.5L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M7 10.5v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M21 7.5v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.8" />
                <path d="M9 12l2 2 4-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                academy
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20"
                  : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
              }`}>
                {academy ? "ITOps Academy Track" : "Enterprise Security Hub"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Self-Paced · Verifiable Certifications
              </span>
            </div>
            <h1 className={`text-xl md:text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-white"}`}>
              {title}
            </h1>
            <p className={`mt-1 max-w-xl text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action / Progress cluster */}
        <div className="flex flex-wrap items-center gap-4">
          {resumeCourse && (
            <button
              onClick={() => onResume?.(resumeCourse)}
              type="button"
              className="flex items-center gap-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 transition-all text-left shadow-sm"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/20 text-white font-bold text-xs">
                ▶
              </div>
              <div className="min-w-0 max-w-[160px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Resume learning</p>
                <p className="truncate text-xs font-bold text-white">{resumeCourse.title}</p>
              </div>
            </button>
          )}

          {progressPct != null && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2">
              <ProgressRing pct={progressPct} size={42} tone={academy ? "amber" : "rose"} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Overall Progress
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {progressPct}% Completed
                </p>
              </div>
            </div>
          )}

          {stats && (
            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
              {stats.map(s => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg md:text-xl font-bold tabular-nums ${isLight ? "text-slate-900" : "text-white"}`}>{s.value}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProgressRing({ pct, size = 48, tone = "rose" }) {
  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true });
  const strokeWidth = 4.5;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const hex = tone === "emerald" ? "#10b981" : tone === "amber" ? "#f59e0b" : "#f43f5e";

  return (
    <div ref={rootRef} className="relative shrink-0 grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-white/10"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hex}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: inView ? circumference - (pct / 100) * circumference : circumference }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-bold tabular-nums text-slate-900 dark:text-white">
        {pct}%
      </span>
    </div>
  );
}

export function CompletionCelebration({ score }) {
  const passed = score >= 70;
  const confetti = passed ? Array.from({ length: 24 }, (_, i) => i) : [];
  const { play } = useSound();

  useEffect(() => {
    play(passed ? "success" : "error");
  }, [score]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden py-4"
    >
      {passed && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)" }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 0.9, 0], scale: 1.5 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          aria-hidden
        />
      )}
      {confetti.map(i => (
        <motion.span
          key={i}
          className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full shadow-sm"
          style={{ background: ["#fb7185", "#a78bfa", "#10b981", "#fbbf24", "#06b6d4"][i % 5] }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos((i / 24) * Math.PI * 2) * 120,
            y: Math.sin((i / 24) * Math.PI * 2) * 120 - 30,
            opacity: 0,
            scale: [1, 1.4, 0]
          }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.05 }}
        />
      ))}
      <div className="relative z-10 text-center space-y-3">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
          className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl shadow-xl ${passed
              ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/30"
              : "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-amber-500/30"
            }`}
        >
          {passed ? (
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v5m0 3h.01M10.3 3.3l-8 14A1 1 0 003 19h18a1 1 0 00.9-1.5l-8-14a1 1 0 00-1.6 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </motion.div>
        <div>
          <p className={`text-4xl font-black tracking-tight ${passed ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}>
            {score}%
          </p>
          <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
            {passed ? "Assessment Passed Successfully! 🎉" : "Passing Threshold Not Reached (70%)"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {passed
              ? "Congratulations! You have demonstrated mastery in this subject and unlocked your official certificate."
              : "Review the module lessons, check key takeaways, and retake the assessment when you're ready."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

const CATEGORY_ICONS = {
  "email-security": "M3 6h18v12H3zM3 6l9 7 9-7",
  "identity": "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  "cybersecurity": "M12 2l8 3.5v5.4c0 5.2-3.4 9.8-8 11.1-4.6-1.3-8-5.9-8-11.1V5.5L12 2z",
  "endpoint-security": "M4 4h16v10H4zM9 20h6M12 14v6",
  "data-protection": "M12 3c4 0 7 1.3 7 3v10c0 1.7-3 3-7 3s-7-1.3-7-3V6c0-1.7 3-3 7-3z",
  "physical-security": "M4 21v-9l8-6 8 6v9h-5v-6H9v6z",
  "soc": "M4 5h16v11H4zM9 20h6M12 16v4M8 9l2.5 2.5L8 14M13 14h3",
  "infrastructure": "M4 4h16v5H4zM4 10.5h16v5H4zM4 17h16v3H4M7.5 6.5h.01M7.5 13h.01M7.5 18.5h.01",
  "cloud": "M7.5 18a4.2 4.2 0 01-1-8.27A5.3 5.3 0 0117 8.2 4 4 0 0116.5 18h-9z",
  "devops": "M5 12a7 7 0 0112.5-4.3M19 4v4.5h-4.5M19 12a7 7 0 01-12.5 4.3M5 20v-4.5h4.5"
};

export function CategoryIcon({ category, size = 16 }) {
  const path = CATEGORY_ICONS[category] ?? CATEGORY_ICONS["cybersecurity"];
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} fill="none" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const BADGE_META = {
  first_course: { label: "First Course", icon: "🌱", hint: "Completed your first course" },
  perfect_score: { label: "Perfect Score", icon: "⭐", hint: "Scored 100% on a quiz" },
  completionist: { label: "Completionist", icon: "🏆", hint: "Completed every published course" },
  certified: { label: "Certified", icon: "🎓", hint: "Holds a current CSSA certificate" },
  streak_3: { label: "3-Day Streak", icon: "🔥", hint: "Trained 3 days in a row" },
  streak_7: { label: "7-Day Streak", icon: "⚡", hint: "Trained 7 days in a row" }
};

export function BadgeChip({ code }) {
  const meta = BADGE_META[code];
  if (!meta) return null;
  return (
    <span
      title={meta.hint}
      className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/15 px-2.5 py-1 text-[11px] font-bold text-indigo-800 dark:text-indigo-300 shadow-sm"
    >
      <span>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

export function StreakFlame({ days }) {
  const active = days > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold tabular-nums ${active ? "text-amber-500 dark:text-amber-400" : "text-slate-400 dark:text-slate-600"
      }`}>
      <span aria-hidden>{active ? "🔥" : "○"}</span>
      {days}
    </span>
  );
}

export function ModuleProgressBar({ pct, tone = "rose" }) {
  const bar = tone === "emerald"
    ? "bg-emerald-500"
    : tone === "amber"
      ? "bg-amber-500"
      : "bg-gradient-to-r from-rose-500 to-indigo-600";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
      <motion.div
        className={`h-full rounded-full ${bar}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

const MEDALS = ["🥇", "🥈", "🥉"];
export function Leaderboard({ rows, currentUserId }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
        No completed courses yet — the leaderboard fills in as your team finishes training.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const isCurrent = r.userId === currentUserId;
        const isTop3 = i < 3;
        return (
          <div
            key={r.userId}
            className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-xs transition-all ${isCurrent
                ? "border-rose-400/40 bg-rose-500/10 dark:border-rose-500/40 dark:bg-rose-500/15 font-bold shadow-sm"
                : isTop3
                  ? "border-slate-200/90 bg-slate-50/70 dark:border-white/10 dark:bg-white/[0.03]"
                  : "border-transparent hover:bg-slate-100/60 dark:hover:bg-white/[0.02]"
              }`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white dark:bg-white/10 text-sm font-bold shadow-sm border border-slate-200/80 dark:border-white/10">
              {MEDALS[i] ?? r.rank}
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-slate-900 dark:text-white">
                {r.userEmail}
                {isCurrent && (
                  <span className="ml-1.5 rounded-full bg-rose-500 text-white px-2 py-0.2 text-[9px] font-bold uppercase">
                    You
                  </span>
                )}
              </p>
            </div>
            <span className="rounded-full bg-slate-200/80 dark:bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {r.completedCount} finished
            </span>
            <span className="min-w-[48px] text-right font-bold text-slate-900 dark:text-white tabular-nums">
              {r.avgScore != null ? `${r.avgScore}%` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LocalPreviewBanner() {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(sessionStorage.getItem("cs-local-banner-dismissed") === "1");
  }, []);
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-2xl border border-amber-300/60 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-4 shadow-sm"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm">
        💡
      </span>
      <div className="flex-1 text-xs">
        <p className="font-bold text-amber-900 dark:text-amber-300">
          Local Preview Curriculum & Interactive Sandbox
        </p>
        <p className="mt-0.5 text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
          You are exploring full, real course materials in local sandbox mode. Your progress, notes, and quiz results are saved safely to your local browser. Once your organization enables a CyberSachet license, team synchronization and verifiable certificates become fully activated.
        </p>
      </div>
      <button
        onClick={() => {
          sessionStorage.setItem("cs-local-banner-dismissed", "1");
          setDismissed(true);
        }}
        className="rounded-lg p-1 text-amber-700 dark:text-amber-400 hover:bg-amber-200/50 dark:hover:bg-amber-500/20 transition-colors"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </motion.div>
  );
}

