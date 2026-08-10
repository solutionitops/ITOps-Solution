import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { generateConfig, knownMissing, HEADER_FIXES, PLATFORMS } from "../lib/securityFixConfig";

const SEV_STYLE = {
  high: "bg-red-400/10 light:bg-red-100 text-red-300 light:text-red-700",
  medium: "bg-amber-400/10 light:bg-amber-100 text-amber-300 light:text-amber-700",
  low: "bg-white/10 light:bg-slate-900/10 text-white/60 light:text-slate-500",
};

// Shows the exact, copy-paste remediation for a site's missing security
// headers. Deterministic (from lib/securityFixConfig) — no remote execution.
export function SecurityFixConfig({ missingHeaders }) {
  const [platform, setPlatform] = useState("nginx");
  const [copied, setCopied] = useState(false);
  const headers = knownMissing(missingHeaders);

  if (headers.length === 0) {
    return <p className="text-xs text-emerald-300 light:text-emerald-600">✓ All recommended security headers are present.</p>;
  }

  const config = generateConfig(missingHeaders, platform);
  function copy() {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {headers.map(h => {
          const fix = HEADER_FIXES[h];
          return (
            <li key={h} className="flex items-start gap-2 text-xs">
              <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${SEV_STYLE[fix.severity]}`}>{fix.severity}</span>
              <span className="text-white/70 light:text-slate-600"><span className="font-medium text-white light:text-slate-900">{fix.name}</span> — {fix.why}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-1.5">
        {PLATFORMS.map(p => (
          <button key={p.key} type="button" onClick={() => setPlatform(p.key)} className={`rounded-full px-3 py-1 text-xs transition-colors ${platform === p.key ? "bg-white text-black light:bg-slate-900 light:text-white" : "border border-white/15 light:border-slate-900/15 text-white/60 light:text-slate-500 hover:text-white light:hover:text-slate-900"}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 light:border-slate-900/10 bg-black/40 light:bg-slate-900/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-900/10 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">{PLATFORMS.find(p => p.key === platform)?.label} config</span>
          <button onClick={copy} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${copied ? "bg-emerald-400/15 text-emerald-300" : "text-white/60 light:text-slate-500 hover:bg-white/5 hover:text-white light:hover:text-slate-900"}`}>
            <AnimatePresence mode="wait" initial={false}>
              {copied
                ? <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Copied!</motion.span>
                : <motion.span key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Copy</motion.span>}
            </AnimatePresence>
          </button>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-cyan-100/80 light:text-slate-600">{config}</pre>
      </div>
    </div>
  );
}
