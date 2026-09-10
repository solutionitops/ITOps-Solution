import { SpotlightCard } from "./Animated";
import { isPlanAllowed } from "../lib/planTiers";

function StepIcon({ status }) {
  if (status === "done") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20" aria-hidden>
        ✓
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-500/20 animate-pulse" aria-hidden>
        ▶
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-400 dark:text-slate-500" aria-hidden>
      ○
    </span>
  );
}

export function LearningPathCard({ path, orgPlan, onOpenCourse }) {
  if (!path.courses?.length) return null;
  const firstIncompleteIndex = path.courses.findIndex(c => !c.completed);
  const completedCount = path.courses.filter(c => c.completed).length;
  const pct = Math.round((completedCount / path.courses.length) * 100);

  return (
    <SpotlightCard className="p-6 md:p-7 rounded-3xl" tint="violet">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Structured Roadmap
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {completedCount} of {path.courses.length} Completed
            </span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{path.title}</h3>
          <p className="mt-1 text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">{path.description}</p>
        </div>

        <div className="w-full sm:w-48 space-y-1.5 self-center">
          <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <span>Path Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {path.courses.map((c, i) => {
          const status = c.completed ? "done" : i === firstIncompleteIndex ? "current" : i < firstIncompleteIndex ? "done" : "upcoming";
          const allowed = isPlanAllowed(c.minPlan, orgPlan);
          const isCurrent = status === "current";

          return (
            <div key={c.courseId} className="flex items-center gap-3.5">
              <div className="flex flex-col items-center self-stretch">
                <StepIcon status={status} />
                {i < path.courses.length - 1 && (
                  <span className={`mt-1.5 w-0.5 flex-1 ${status === "done" ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"}`} />
                )}
              </div>
              <button
                type="button"
                onClick={() => allowed && onOpenCourse(c)}
                disabled={!allowed}
                className={`flex-1 rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isCurrent
                    ? "border-indigo-500/50 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-md hover:border-indigo-500 hover:bg-indigo-500/10"
                    : allowed
                      ? "border-slate-200/90 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.05]"
                      : "border-dashed border-slate-200 dark:border-white/10 opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-white/[0.01]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Step {i + 1}: {c.levelLabel}
                    </span>
                    {status === "done" && (
                      <span className="text-[11px] font-bold text-emerald-500">
                        Completed
                      </span>
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-indigo-600 text-white px-2 py-0.2 text-[9px] font-bold uppercase">
                        Current Step
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {c.lessonCount} lessons · {Math.round((c.estimatedMinutes / 60) * 10) / 10}h
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">{c.title}</p>
                {!allowed && (
                  <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span>🔒</span> {c.minPlan} plan required to unlock
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
}

