import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  CATEGORY_META, categoryScores, overallHealth, healthBand,
  avgResponseMs, isHttps,
} from "../lib/websiteHealth";
import { knownMissing } from "../lib/securityFixConfig";
import { SecurityFixConfig } from "./SecurityFixConfig";

const EASE = [0.16, 1, 0.3, 1];
const BAND_COLOR = { good: "#34d399", warn: "#fbbf24", bad: "#f87171", unknown: "#64748b" };
const BAND_TEXT = {
  good: "text-emerald-300 light:text-emerald-600",
  warn: "text-amber-300 light:text-amber-600",
  bad: "text-red-300 light:text-red-600",
  unknown: "text-white/40 light:text-slate-400",
};

function Ring({ score, size = 112, stroke = 9, sub }) {
  const band = healthBand(score);
  const color = BAND_COLOR[band];
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = score == null ? 0 : score / 100;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/10 light:stroke-slate-900/10" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-semibold tabular-nums ${BAND_TEXT[band]}`}>{score == null ? "—" : score}</span>
        {sub && <span className="text-[10px] text-white/40 light:text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const band = healthBand(score);
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/55 light:text-slate-500">{label}</span>
        <span className={`font-medium tabular-nums ${BAND_TEXT[band]}`}>{score == null ? "n/a" : score}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: BAND_COLOR[band] }} initial={{ width: 0 }} animate={{ width: `${score ?? 0}%` }} transition={{ duration: 0.7, ease: EASE }} />
      </div>
    </div>
  );
}

// The single most-actionable problem for a site, in plain language.
function weakestIssue(m, cats) {
  const missing = knownMissing(m.securitySnapshot?.missingHeaders);
  const sslDays = isHttps(m) ? m.sslInfo?.daysRemaining : null;
  if (m.lastStatus === "DOWN" || m.lastStatus === "ERROR") return { text: "Currently down", tone: "bad" };
  if (isHttps(m) && m.sslInfo?.isValid === false) return { text: "SSL certificate invalid", tone: "bad" };
  if (sslDays != null && sslDays <= 14) return { text: `SSL expires in ${sslDays}d`, tone: sslDays <= 7 ? "bad" : "warn" };
  // otherwise surface the lowest measured category
  const entries = Object.entries(cats).filter(([, v]) => v != null).sort((a, b) => a[1] - b[1]);
  if (entries.length === 0) return { text: "Awaiting first checks", tone: "unknown" };
  const [key, val] = entries[0];
  if (key === "security" && missing.length) return { text: `${missing.length} security header${missing.length === 1 ? "" : "s"} missing`, tone: val < 70 ? "bad" : "warn" };
  if (key === "availability") return { text: `${val}% recent uptime`, tone: healthBand(val) };
  if (key === "performance") return { text: `${avgResponseMs(m.recentChecks)}ms avg response`, tone: healthBand(val) };
  if (key === "seo") return { text: `SEO score ${val}`, tone: healthBand(val) };
  return { text: `${CATEGORY_META[key].label} ${val}`, tone: healthBand(val) };
}

function OffenderRow({ item }) {
  const [open, setOpen] = useState(false);
  const { m, overall, issue } = item;
  const band = healthBand(overall);
  const missing = knownMissing(m.securitySnapshot?.missingHeaders);
  const toneText = BAND_TEXT[issue.tone] ?? BAND_TEXT.warn;
  return (
    <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums ${BAND_TEXT[band]}`} style={{ backgroundColor: `${BAND_COLOR[band]}1f` }}>
          {overall ?? "—"}
        </span>
        <div className="min-w-0 flex-1">
          <Link to={`/monitors/${m.id}`} className="block truncate text-sm font-medium text-white light:text-slate-900 hover:underline">{m.name}</Link>
          <p className={`truncate text-xs ${toneText}`}>{issue.text}</p>
        </div>
        {missing.length > 0 && (
          <button onClick={() => setOpen(v => !v)} className="shrink-0 rounded-full border border-white/15 light:border-slate-900/15 px-3 py-1 text-xs text-white/70 light:text-slate-600 transition-colors hover:bg-white/5 light:hover:bg-slate-900/5">
            {open ? "Hide fix" : "Fix headers"}
          </button>
        )}
      </div>
      {open && missing.length > 0 && (
        <div className="mt-3 border-t border-white/8 light:border-slate-900/8 pt-3">
          <SecurityFixConfig missingHeaders={m.securitySnapshot.missingHeaders} />
        </div>
      )}
    </div>
  );
}

export function WebsiteIntelligence({ monitors }) {
  const [showFleetFix, setShowFleetFix] = useState(false);

  const model = useMemo(() => {
    const sites = monitors.map(m => {
      const cats = categoryScores(m);
      const overall = overallHealth(m);
      return { m, cats, overall, issue: weakestIssue(m, cats) };
    });

    // Portfolio averages per category (only over sites that measured it).
    const catAvg = {};
    for (const key of Object.keys(CATEGORY_META)) {
      const vals = sites.map(s => s.cats[key]).filter(v => v != null);
      catAvg[key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    }
    const overalls = sites.map(s => s.overall).filter(v => v != null);
    const overallAvg = overalls.length ? Math.round(overalls.reduce((a, b) => a + b, 0) / overalls.length) : null;

    const down = monitors.filter(m => m.lastStatus === "DOWN" || m.lastStatus === "ERROR").length;
    const sslExpiring = monitors.filter(m => isHttps(m) && m.sslInfo?.daysRemaining != null && m.sslInfo.daysRemaining <= 30).length;
    const withSecIssues = sites.filter(s => knownMissing(s.m.securitySnapshot?.missingHeaders).length > 0);

    // Fleet-wide missing-header tally + the union to generate one combined fix.
    const headerTally = {};
    for (const s of withSecIssues) {
      for (const h of knownMissing(s.m.securitySnapshot?.missingHeaders)) headerTally[h] = (headerTally[h] ?? 0) + 1;
    }
    const unionHeaders = Object.keys(headerTally);

    // Worst offenders: anything not clearly healthy, worst first.
    const offenders = sites
      .filter(s => s.overall == null || s.overall < 90 || s.m.lastStatus === "DOWN" || s.m.lastStatus === "ERROR")
      .sort((a, b) => (a.overall ?? -1) - (b.overall ?? -1))
      .slice(0, 6);

    return { sites, catAvg, overallAvg, down, sslExpiring, withSecIssues, headerTally, unionHeaders, offenders, measured: overalls.length };
  }, [monitors]);

  return (
    <div className="space-y-4">
      {/* Portfolio health */}
      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white p-5 lg:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-4">
          <Ring score={model.overallAvg} sub="/ 100" />
          <div>
            <p className="text-sm font-medium text-white light:text-slate-900">Portfolio health</p>
            <p className="mt-0.5 text-xs text-white/45 light:text-slate-400">Averaged across {model.measured} measured site{model.measured === 1 ? "" : "s"}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              {model.down > 0 && <span className="text-red-300 light:text-red-600">{model.down} down</span>}
              {model.sslExpiring > 0 && <span className="text-amber-300 light:text-amber-600">{model.sslExpiring} SSL expiring ≤30d</span>}
              {model.withSecIssues.length > 0 && <span className="text-white/55 light:text-slate-500">{model.withSecIssues.length} with security gaps</span>}
              {model.down === 0 && model.sslExpiring === 0 && model.withSecIssues.length === 0 && <span className="text-emerald-300 light:text-emerald-600">All clear</span>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 self-center sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(CATEGORY_META).map(([key, meta]) => <CategoryBar key={key} label={meta.label} score={model.catAvg[key]} />)}
        </div>
      </div>

      {/* Needs attention + fleet security posture */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white light:text-slate-900">Needs attention</h3>
          <p className="mb-3 text-xs text-white/45 light:text-slate-400">Lowest-scoring sites first — click a name for the full breakdown.</p>
          {model.offenders.length === 0 ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-xs text-emerald-300 light:text-emerald-600">✓ Every site is scoring 90+ health. Nothing needs attention.</p>
          ) : (
            <div className="space-y-2">{model.offenders.map(item => <OffenderRow key={item.m.id} item={item} />)}</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white p-5">
          <h3 className="text-sm font-semibold tracking-tight text-white light:text-slate-900">Fleet security posture</h3>
          <p className="mb-3 text-xs text-white/45 light:text-slate-400">Security headers missing across your sites — generate one config to fix them all.</p>
          {model.unionHeaders.length === 0 ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2.5 text-xs text-emerald-300 light:text-emerald-600">✓ No recommended security headers are missing across the fleet.</p>
          ) : (
            <>
              <div className="space-y-2">
                {model.unionHeaders.map(h => (
                  <div key={h} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 truncate font-mono text-[11px] text-white/60 light:text-slate-600">{h}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10">
                      <span className="block h-full rounded-full bg-amber-400" style={{ width: `${(model.headerTally[h] / model.sites.length) * 100}%` }} />
                    </span>
                    <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-white/45 light:text-slate-400">{model.headerTally[h]}/{model.sites.length}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowFleetFix(v => !v)} className="mt-4 rounded-full bg-white text-black light:bg-slate-900 light:text-white px-4 py-2 text-xs font-medium transition-colors hover:bg-neutral-200 light:hover:bg-slate-800">
                {showFleetFix ? "Hide combined fix" : "Generate combined fix config"}
              </button>
              {showFleetFix && <div className="mt-3 border-t border-white/8 light:border-slate-900/8 pt-3"><SecurityFixConfig missingHeaders={model.unionHeaders} /></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
