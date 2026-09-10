import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSound } from "../context/SoundContext";

const EASE = [0.16, 1, 0.3, 1];

export function Flashcards({ cards, onClose }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { play } = useSound();

  const card = cards?.[index];

  function toggleFlip() {
    setFlipped(f => !f);
    play?.("tick");
  }

  function go(delta) {
    setFlipped(false);
    setIndex(i => (i + delta + cards.length) % cards.length);
    play?.("tick");
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFlip();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cards?.length, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cards || cards.length === 0) return null;

  const pct = Math.round(((index + 1) / cards.length) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl text-slate-900 dark:text-white space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              🗂️
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Flashcards</h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Card {index + 1} of {cards.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close flashcards"
            className="rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 3D Flip Card */}
        <button
          type="button"
          onClick={toggleFlip}
          className="relative h-64 md:h-72 w-full [perspective:1000px] cursor-pointer focus:outline-none group text-left"
          aria-label="Flip flashcard"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index + (flipped ? "-back" : "-front")}
              initial={{ opacity: 0, rotateY: flipped ? -40 : 40, scale: 0.95 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: flipped ? 40 : -40, scale: 0.95 }}
              transition={{ duration: 0.28, ease: EASE }}
              className={`absolute inset-0 flex flex-col justify-between rounded-2xl border p-6 md:p-8 text-center shadow-lg transition-all group-hover:border-indigo-500/50 ${flipped
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/40 dark:bg-emerald-950/40"
                  : "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-900/40 dark:bg-slate-900"
                }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${flipped
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      : "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                    }`}
                >
                  {flipped ? "💡 Key Takeaway / Answer" : "❓ Concept / Question"}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Click or Space to flip ↺</span>
              </div>

              <div className="my-auto py-2">
                <p className="text-base md:text-xl font-bold leading-snug text-slate-900 dark:text-white">
                  {flipped ? card.back : card.front}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span>{flipped ? "Showing solution" : "Showing prompt"}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            ← Previous
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            <kbd className="rounded border px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10">←</kbd>
            <kbd className="rounded border px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10">→</kbd>
            <span>Navigate</span>
            <span className="mx-1">·</span>
            <kbd className="rounded border px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10">Space</kbd>
            <span>Flip</span>
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

