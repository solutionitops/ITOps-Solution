import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, LayoutGroup } from "motion/react";
import { Icons } from "./AcademyITOpsTheme";

export function TrainingTrackToggle({ active = "security" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDevPreview = location.pathname.startsWith("/_dev-");

  const tracks = [
    {
      value: "security",
      label: "CyberSachet Security",
      to: isDevPreview ? "/_dev-cybersachet-preview" : "/training",
      icon: Icons.Shield
    },
    {
      value: "academy",
      label: "Moonsav ITOps Academy",
      to: isDevPreview ? "/_dev-academy-preview" : "/training/academy",
      icon: Icons.Server
    }
  ];

  return (
    <LayoutGroup id="training-track-nav">
      <div
        className="inline-flex gap-1.5 rounded-2xl border border-slate-200/90 bg-slate-100/90 dark:border-white/10 dark:bg-slate-900/80 p-1.5 shadow-inner self-start"
        role="group"
        aria-label="Switch training product"
      >
        {tracks.map(t => {
          const isSelected = active === t.value;
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                if (!isSelected) navigate(t.to);
              }}
              aria-current={isSelected ? "page" : undefined}
              className={`relative inline-flex items-center gap-2 rounded-xl px-4 md:px-5 py-2 text-xs md:text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? "text-slate-900 dark:text-white font-extrabold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold hover:bg-white/40 dark:hover:bg-white/5"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="active-training-track-pill"
                  className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 shadow-md shadow-black/5 dark:shadow-black/20"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>{t.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export default TrainingTrackToggle;
