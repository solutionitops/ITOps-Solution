import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { fetchMonitor, fetchMonitorHistory, listHostAgents, fetchMyPermissions, applyWebsiteFix, fetchMonitorFixes } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { StatusBadge } from "../components/StatusBadge";
import { ResponseTimeChart } from "../components/ResponseTimeChart";
import { RootCauseAnalysis } from "../components/RootCauseAnalysis";
import { DnsRecordsPanel } from "../components/DnsRecordsPanel";
import { SecurityFixConfig } from "../components/SecurityFixConfig";
import { Reveal, SpotlightCard } from "../components/Animated";
import { Skeleton, SkeletonRows, SkeletonStatGrid } from "../components/Skeleton";
import { ErrorState } from "../components/EmptyState";
import { useRealtimeInvalidate } from "../hooks/useRealtimeInvalidate";
import { overallHealth, categoryScores, healthBand, performanceScore, CATEGORY_META } from "../lib/websiteHealth";
import { performanceFindings, generatePerfConfig, PERF_PLATFORMS } from "../lib/performanceFindings";
import { knownMissing } from "../lib/securityFixConfig";
const EASE = [0.16, 1, 0.3, 1];
const BAND_COLOR = { good: "#34d399", warn: "#fbbf24", bad: "#f87171", unknown: "#64748b" };
const BAND_TEXT = { good: "text-emerald-300 light:text-emerald-600", warn: "text-amber-300 light:text-amber-600", bad: "text-red-300 light:text-red-600", unknown: "text-white/40 light:text-slate-400" };
const SEV_STYLE = { high: "bg-red-400/10 light:bg-red-100 text-red-300 light:text-red-700", medium: "bg-amber-400/10 light:bg-amber-100 text-amber-300 light:text-amber-700", low: "bg-white/10 light:bg-slate-900/10 text-white/60 light:text-slate-500" };
const CHECK_TYPE_LABELS = {
  HTTP: "Uptime",
  KEYWORD: "Keyword",
  STATUS_CODE: "Status code",
  DNS: "DNS",
  TCP: "TCP port"
};
const REALTIME_TABLES = ["monitors", "check_results", "incidents"];

function HealthRing({ score, size = 104, stroke = 9 }) {
  const band = healthBand(score);
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = score == null ? 0 : score / 100;
  return <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/10 light:stroke-slate-900/10" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BAND_COLOR[band]} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 0.9, ease: EASE }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-semibold tabular-nums ${BAND_TEXT[band]}`}>{score == null ? "—" : score}</span>
        <span className="text-[10px] text-white/40 light:text-slate-400">/ 100</span>
      </div>
    </div>;
}
function CatBar({ label, score }) {
  const band = healthBand(score);
  return <div>
      <div className="flex items-center justify-between text-[11px]"><span className="text-white/55 light:text-slate-500">{label}</span><span className={`font-medium tabular-nums ${BAND_TEXT[band]}`}>{score == null ? "n/a" : score}</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10"><motion.div className="h-full rounded-full" style={{ backgroundColor: BAND_COLOR[band] }} initial={{ width: 0 }} animate={{ width: `${score ?? 0}%` }} transition={{ duration: 0.7, ease: EASE }} /></div>
    </div>;
}
function HealthHero({ monitor, history }) {
  const shaped = { ...monitor, recentChecks: history };
  const overall = overallHealth(shaped);
  const cats = categoryScores(shaped);
  return <SpotlightCard className="p-5" delay={0.04} scan>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center gap-4">
          <HealthRing score={overall} />
          <div>
            <p className="text-sm font-medium text-white light:text-slate-900">Website health</p>
            <p className="mt-0.5 max-w-[16rem] text-xs text-white/45 light:text-slate-400">Composite of the categories we can actually measure for this monitor.</p>
            {monitor.consecutiveFails > 0 && <p className="mt-2 text-xs text-red-300 light:text-red-600">{monitor.consecutiveFails} consecutive failure{monitor.consecutiveFails === 1 ? "" : "s"}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(CATEGORY_META).map(([k, m]) => <CatBar key={k} label={m.label} score={cats[k]} />)}
        </div>
      </div>
    </SpotlightCard>;
}
function CopyConfig({ platforms, generate }) {
  const [p, setP] = useState(platforms[0].key);
  const [copied, setCopied] = useState(false);
  const cfg = generate(p);
  return <div className="space-y-2">
      <div className="flex gap-1.5">{platforms.map(x => <button key={x.key} type="button" onClick={() => setP(x.key)} className={`rounded-full px-3 py-1 text-xs transition-colors ${p === x.key ? "bg-white text-black light:bg-slate-900 light:text-white" : "border border-white/15 light:border-slate-900/15 text-white/60 light:text-slate-500 hover:text-white light:hover:text-slate-900"}`}>{x.label}</button>)}</div>
      <div className="overflow-hidden rounded-xl border border-white/10 light:border-slate-900/10 bg-black/40 light:bg-slate-900/[0.03]">
        <div className="flex items-center justify-between border-b border-white/10 light:border-slate-900/10 px-3 py-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">{platforms.find(x => x.key === p)?.label} config</span>
          <button onClick={() => { navigator.clipboard.writeText(cfg); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${copied ? "bg-emerald-400/15 text-emerald-300" : "text-white/60 light:text-slate-500 hover:text-white light:hover:text-slate-900"}`}>{copied ? "Copied!" : "Copy"}</button>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-[11px] leading-relaxed text-cyan-100/80 light:text-slate-600">{cfg}</pre>
      </div>
    </div>;
}
function PerfSection({ monitor, history }) {
  const [showOpt, setShowOpt] = useState(false);
  const { avg, findings } = performanceFindings(monitor, history);
  const score = performanceScore(history);
  const band = healthBand(score);
  return <SpotlightCard className="p-4" delay={0.13} scan tint="blue">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-white light:text-slate-900">Performance</h2>
        <span className={`text-sm font-semibold tabular-nums ${BAND_TEXT[band]}`}>{score == null ? "—" : `${score}/100`}</span>
      </div>
      {avg != null && <p className="mb-3 text-xs text-white/50 light:text-slate-500">Average server response: <span className="text-white light:text-slate-900">{avg.toLocaleString()}ms</span></p>}
      {findings.length === 0 ? <p className="text-xs text-emerald-300 light:text-emerald-600">✓ No performance problems detected in the measured signals.</p> :
        <ul className="space-y-2">{findings.map(f => <li key={f.key} className="flex items-start gap-2 text-xs"><span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${SEV_STYLE[f.severity]}`}>{f.severity}</span><span className="text-white/70 light:text-slate-600"><span className="font-medium text-white light:text-slate-900">{f.title}</span> — {f.detail}</span></li>)}</ul>}
      <button onClick={() => setShowOpt(v => !v)} className="mt-3 text-xs text-cyan-300 light:text-cyan-600 hover:underline">{showOpt ? "Hide recommended optimizations" : "Recommended server optimizations →"}</button>
      {showOpt && <div className="mt-3 border-t border-white/8 light:border-slate-900/8 pt-3"><p className="mb-2 text-[11px] text-white/45 light:text-slate-400">Standard best-practice config — compression, long-lived static caching, and HTTP/2. Safe to apply on most servers.</p><CopyConfig platforms={PERF_PLATFORMS} generate={generatePerfConfig} /></div>}
    </SpotlightCard>;
}
function fixStatus(fix) {
  if (!fix) return null;
  if (fix.status === "proposed" || fix.status === "approved") return { t: "Queued for the agent…", tone: "blue" };
  if (fix.status === "running") return { t: "Applying on the server…", tone: "blue" };
  if (fix.status === "failed") return { t: "Apply failed — rolled back, no change made", tone: "red" };
  if (fix.status === "cancelled") return { t: "Cancelled", tone: "muted" };
  if (fix.status === "success") {
    if (fix.verifyResult === "recovered") return { t: "Applied & verified ✓", tone: "emerald" };
    if (fix.verifyResult === "not_improved") return { t: "Applied — not detected on re-scan yet", tone: "amber" };
    return { t: "Applied — verifying on next scan…", tone: "blue" };
  }
  return { t: fix.status, tone: "muted" };
}
// The prominent "solve it" entry point. For an externally-monitored site the
// platform can't reach the server, so the honest actions are: (1) copy the
// exact config, and (2) if the site's server runs the agent, apply it for real
// — the agent backs up, tests, reloads, and rolls back on failure.
function FixItCard({ monitor, canManage, hostAgents }) {
  const [open, setOpen] = useState(false);
  const [agentId, setAgentId] = useState("");
  const toast = useToast();
  const qc = useQueryClient();
  const missing = knownMissing(monitor.securitySnapshot?.missingHeaders);
  const fixesQuery = useQuery({
    queryKey: ["monitor-fixes", monitor.id],
    queryFn: () => fetchMonitorFixes(monitor.id),
    enabled: open,
    refetchInterval: open ? 10_000 : false,
  });
  const apply = useMutation({
    mutationFn: () => applyWebsiteFix(monitor.id, agentId),
    onSuccess: () => { toast.success("Fix queued — the agent will apply it, then we re-scan to verify."); qc.invalidateQueries({ queryKey: ["monitor-fixes", monitor.id] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't apply the fix."),
  });
  if (missing.length === 0) return null;
  const agents = hostAgents ?? [];
  const latest = fixesQuery.data?.[0];
  const st = fixStatus(latest);
  const stTone = { blue: "text-blue-300 light:text-blue-600", emerald: "text-emerald-300 light:text-emerald-600", amber: "text-amber-300 light:text-amber-600", red: "text-red-300 light:text-red-600", muted: "text-white/50 light:text-slate-500" }[st?.tone] ?? "";
  return <SpotlightCard className="p-4" delay={0.06} scan tint="emerald">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-lg text-emerald-300 light:bg-emerald-100 light:text-emerald-700">🛡</span>
          <div>
            <p className="text-sm font-medium text-white light:text-slate-900">{missing.length} security {missing.length === 1 ? "issue" : "issues"} can be fixed</p>
            <p className="text-xs text-white/45 light:text-slate-400">Copy the exact config, or apply it automatically via the agent.</p>
          </div>
        </div>
        <button onClick={() => setOpen(v => !v)} className="rounded-full bg-white text-black light:bg-slate-900 light:text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-200 light:hover:bg-slate-800">
          {open ? "Hide fix" : "Fix security headers"}
        </button>
      </div>
      {open && <div className="mt-4 space-y-4 border-t border-white/8 light:border-slate-900/8 pt-4">
          <SecurityFixConfig missingHeaders={monitor.securitySnapshot.missingHeaders} />

          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
            <p className="text-xs font-medium text-white/80 light:text-slate-700">Apply it automatically</p>
            {!canManage ? (
              <p className="mt-1.5 text-[11px] text-white/45 light:text-slate-400">Only an organization admin can apply changes to a server.</p>
            ) : agents.length === 0 ? (
              <p className="mt-1.5 text-[11px] text-white/45 light:text-slate-400">
                No agents yet — <Link to="/hosts" className="text-cyan-300 light:text-cyan-600 hover:underline">install the Kada Nigrani agent</Link> on this site's server (with <code className="text-white/70 light:text-slate-600">AGENT_ALLOW_ACTIONS=1</code>) to enable one-click apply.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select value={agentId} onChange={e => setAgentId(e.target.value)} className="rounded-lg border border-white/15 light:border-slate-900/15 bg-black/40 light:bg-white px-3 py-1.5 text-xs text-white light:text-slate-900 focus:border-white/40 focus:outline-none">
                  <option value="">Select this site's server agent…</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name}{a.isOnline ? "" : " (offline)"}</option>)}
                </select>
                <button disabled={!agentId || apply.isPending} onClick={() => apply.mutate()} className="rounded-full bg-white text-black light:bg-slate-900 light:text-white px-4 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-200 light:hover:bg-slate-800 disabled:opacity-50">
                  {apply.isPending ? "Applying…" : "Apply via agent"}
                </button>
                {st && <span className={`text-[11px] font-medium ${stTone}`}>{st.t}</span>}
              </div>
            )}
            <p className="mt-2 text-[10px] leading-relaxed text-white/40 light:text-slate-400">
              Applies the safe headers only (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS). CSP is left for manual review — a strict policy can break a site. The agent backs up the config, tests it, reloads, and rolls back on failure.
            </p>
          </div>
        </div>}
    </SpotlightCard>;
}
function describeCheck(monitor) {
  switch (monitor.checkType) {
    case "KEYWORD":
      return `Page must ${monitor.keywordMatchMode === "NOT_CONTAINS" ? "not contain" : "contain"} "${monitor.expectedKeyword ?? ""}"`;
    case "STATUS_CODE":
      return `Endpoint must return HTTP ${monitor.expectedStatusCode ?? "—"}`;
    case "DNS":
      return `${monitor.dnsRecordType} record must resolve${monitor.dnsExpectedValue ? ` and match "${monitor.dnsExpectedValue}"` : ""}`;
    case "TCP":
      return `Port ${monitor.tcpPort ?? "?"} must accept TCP connections`;
    case "HTTP":
    default:
      return "Endpoint must respond without an HTTP error";
  }
}
function RecentChecksTable({
  history,
  isLoading
}) {
  if (isLoading) {
    return <SkeletonRows count={5} className="h-9" />;
  }
  if (!history || history.length === 0) {
    return <div className="p-6 text-center">
        <p className="text-sm text-white/50 light:text-slate-500">No checks recorded yet.</p>
        <p className="mt-1 text-xs text-white/30 light:text-slate-400">Results appear here once the scheduler runs.</p>
      </div>;
  }
  return <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-white/10 light:border-slate-900/10 text-xs uppercase text-white/40 light:text-slate-400">
          <tr>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Time</th>
            <th className="px-4 py-2.5">Response</th>
            <th className="px-4 py-2.5">HTTP Code</th>
            <th className="px-4 py-2.5">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {history.map((check, i) => <motion.tr key={check.id} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.25,
          delay: Math.min(i, 20) * 0.015,
          ease: EASE
        }} className="transition-colors hover:bg-white/[0.02] light:hover:bg-slate-900/[0.02]">
              <td className="px-4 py-2.5">
                <StatusBadge status={check.status} />
              </td>
              <td className="px-4 py-2.5 text-white/60 light:text-slate-500">
                {new Date(check.checkedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
            })}
              </td>
              <td className="px-4 py-2.5">
                {check.responseTimeMs != null ? <span className={check.responseTimeMs > 2000 ? "text-amber-300" : "text-white/80 light:text-slate-700"}>
                    {check.responseTimeMs.toLocaleString()} ms
                  </span> : <span className="text-white/30 light:text-slate-400">—</span>}
              </td>
              <td className="px-4 py-2.5 text-white/60 light:text-slate-500">
                {check.statusCode ?? <span className="text-white/30 light:text-slate-400">—</span>}
              </td>
              <td className="px-4 py-2.5 max-w-xs truncate text-white/40 light:text-slate-400 text-xs">
                {check.errorMessage ?? (check.redirectChain.length > 0 ? `${check.redirectChain.length} redirect(s)` : "—")}
              </td>
            </motion.tr>)}
        </tbody>
      </table>
    </div>;
}
export default function MonitorDetail() {
  const {
    id
  } = useParams();
  const realtimeKeys = [["monitor", id], ["monitor-history", id], ["monitors"]];
  useRealtimeInvalidate(REALTIME_TABLES, realtimeKeys);
  const {
    data: monitor,
    isLoading: monitorLoading,
    isError: monitorError,
    error: monitorErrorObj,
    refetch: refetchMonitor
  } = useQuery({
    queryKey: ["monitor", id],
    queryFn: () => fetchMonitor(id),
    enabled: !!id,
    refetchInterval: 15_000
  });
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ["monitor-history", id],
    queryFn: () => fetchMonitorHistory(id, 100),
    enabled: !!id,
    refetchInterval: 15_000
  });
  const { organization } = useAuth();
  const { data: can } = useQuery({
    queryKey: ["my-permissions", organization?.id],
    queryFn: () => fetchMyPermissions(organization?.id),
    enabled: !!organization?.id,
    retry: false,
    staleTime: 60_000
  });
  const canManageHosts = !!can && can("organization", "hosts", "manage");
  // Loaded for both the relay label and the one-click "apply via agent" picker,
  // so it's enabled whenever the monitor is HTTP-family (fixable) or relayed.
  const { data: hostAgents } = useQuery({
    queryKey: ["host-agents"],
    queryFn: listHostAgents,
    enabled: !!monitor,
    staleTime: 30_000
  });
  if (monitorLoading) {
    return <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonStatGrid count={4} />
      </div>;
  }

  // Distinguish a genuine fetch failure (network/server error — retryable)
  // from "this monitor doesn't exist / isn't yours" (RLS returns no row).
  if (monitorError) {
    return <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/60 light:bg-white">
        <ErrorState message={`Couldn't load this monitor: ${monitorErrorObj instanceof Error ? monitorErrorObj.message : "unknown error"}`} onRetry={() => refetchMonitor()} />
      </div>;
  }
  if (!monitor) {
    return <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/60 light:bg-white p-8 text-center">
        <p className="text-sm text-white/50 light:text-slate-500">Monitor not found.</p>
        <Link to="/monitors" className="mt-3 inline-block text-sm text-white light:text-slate-900 hover:underline">
          ← Back to Monitors
        </Link>
      </div>;
  }
  return <div className="space-y-6">
      {/* Header */}
      <Reveal y={12}>
        <Link to="/monitors" className="text-sm text-white/50 light:text-slate-500 hover:text-white light:hover:text-slate-900">
          ← Back to Monitors
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-white light:text-slate-900">{monitor.name}</h1>
          <StatusBadge status={monitor.lastStatus} />
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white/70 light:text-slate-600">
            {CHECK_TYPE_LABELS[monitor.checkType]} check
          </span>
          {monitor.viaHostAgentId && <span className="rounded-full bg-violet-400/10 px-2.5 py-0.5 text-[11px] font-medium text-violet-300 light:bg-violet-100 light:text-violet-700">
              Relayed via {(hostAgents ?? []).find(a => a.id === monitor.viaHostAgentId)?.name ?? "agent"}
            </span>}
          {!monitor.isActive && <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
              Paused
            </span>}
        </div>
        {monitor.checkType === "DNS" || monitor.checkType === "TCP" ? <p className="text-sm text-white/50 light:text-slate-500">{monitor.url}</p> : <a href={monitor.url} target="_blank" rel="noreferrer" className="text-sm text-white/50 light:text-slate-500 hover:underline">
            {monitor.url}
          </a>}
        <p className="mt-1 text-sm text-white/40 light:text-slate-400">{describeCheck(monitor)}</p>
        <p className="mt-0.5 text-xs text-white/30 light:text-slate-400">
          Last checked:{" "}
          {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleString() : "Pending first check"}
          {" · "}
          Next check:{" "}
          {monitor.nextCheckAt ? new Date(monitor.nextCheckAt).toLocaleString() : "—"}
        </p>
      </Reveal>

      {/* Composite health hero — overall score + the categories behind it */}
      <HealthHero monitor={monitor} history={history ?? []} />

      {/* Prominent "solve it" action — appears whenever there are fixable
          security issues on an HTTP-family monitor. */}
      {monitor.checkType !== "DNS" && monitor.checkType !== "TCP" && <FixItCard monitor={monitor} canManage={canManageHosts} hostAgents={hostAgents} />}

      {/* Resolved DNS records — the actual values a public resolver returned
          on the most recent check, not just resolves-or-doesn't. */}
      {monitor.checkType === "DNS" && <SpotlightCard className="p-4" delay={0.08} scan tint="cyan">
          <h2 className="mb-3 text-sm font-medium text-white light:text-slate-900">Resolved Records</h2>
          <DnsRecordsPanel monitor={monitor} latestCheck={history && history.length > 0 ? history[0] : null} history={history ?? []} />
        </SpotlightCard>}

      {/* Root cause analysis — evidence-based diagnosis over real telemetry.
          Skipped on a history fetch error so a failed load never reads as
          "all checks are healthy" from an empty-by-accident history array. */}
      {!historyLoading && !historyError && <Reveal delay={0.1}>
          <RootCauseAnalysis monitor={monitor} history={history ?? []} />
        </Reveal>}

      {/* Response time chart */}
      <SpotlightCard className="p-4" delay={0.12} scan>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-white light:text-slate-900">Response Time</h2>
          {history && history.length > 0 && <span className="text-xs text-white/40 light:text-slate-400">{history.length} data points</span>}
        </div>
        {historyError ? <ErrorState message="Couldn't load response-time history." onRetry={() => refetchHistory()} /> : historyLoading ? <Skeleton className="h-[220px]" /> : <ResponseTimeChart history={history ?? []} />}
      </SpotlightCard>

      {/* Performance — why it's slow, from real measured signals, plus the
          best-practice server config to fix it. HTTP-family only. */}
      {monitor.checkType !== "DNS" && monitor.checkType !== "TCP" && !historyError && <Reveal delay={0.13}>
          <PerfSection monitor={monitor} history={history ?? []} />
        </Reveal>}

      {/* Recent checks table */}
      <SpotlightCard className="overflow-hidden" delay={0.14} scan>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-medium text-white light:text-slate-900">Recent Checks</h2>
          {history && history.length > 0 && <span className="text-xs text-white/40 light:text-slate-400">Last {history.length} results</span>}
        </div>
        {historyError ? <ErrorState message="Couldn't load recent checks." onRetry={() => refetchHistory()} /> : <RecentChecksTable history={history} isLoading={historyLoading} />}
      </SpotlightCard>

      {/* SSL + Security headers */}
      {monitor.checkType !== "DNS" && monitor.checkType !== "TCP" && <div className="grid gap-4 lg:grid-cols-2">
          <SpotlightCard className="p-4" delay={0.16} scan tint="cyan">
            <h2 className="mb-3 text-sm font-medium text-white light:text-slate-900">SSL Certificate</h2>
            {!monitor.sslInfo ? <p className="text-sm text-white/50 light:text-slate-500">Not yet checked or not applicable (HTTP).</p> : !monitor.sslInfo.validTo && monitor.sslInfo.errorMessage ? <p className="text-sm text-white/50 light:text-slate-500">{monitor.sslInfo.errorMessage}</p> : <dl className="space-y-2 text-sm">
                <Row label="Valid" value={monitor.sslInfo.isValid ? "✓ Yes" : "✗ No"} />
                <Row label="Issuer" value={monitor.sslInfo.issuer ?? "—"} />
                <Row label="Protocol" value={monitor.sslInfo.protocol ?? "—"} />
                <Row label="Expires" value={monitor.sslInfo.validTo ? `${new Date(monitor.sslInfo.validTo).toLocaleDateString()}${monitor.sslInfo.daysRemaining != null ? ` (${monitor.sslInfo.daysRemaining}d remaining)` : ""}` : "—"} />
                {monitor.sslInfo.errorMessage && <Row label="Note" value={monitor.sslInfo.errorMessage} />}
              </dl>}
          </SpotlightCard>

          <SpotlightCard className="p-4" delay={0.18} scan tint="emerald">
            <h2 className="mb-3 text-sm font-medium text-white light:text-slate-900">Security Headers</h2>
            {!monitor.securitySnapshot ? <p className="text-sm text-white/50 light:text-slate-500">Not yet checked.</p> : <div className="space-y-3 text-sm">
                {/* Score bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-white/50 light:text-slate-500">
                    <span>Score</span>
                    <span className="font-medium text-white light:text-slate-900">{monitor.securitySnapshot.score}/100</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div className={`h-full rounded-full ${monitor.securitySnapshot.score >= 70 ? "bg-emerald-400" : monitor.securitySnapshot.score >= 40 ? "bg-amber-400" : "bg-red-400"}`} initial={{
                width: 0
              }} animate={{
                width: `${monitor.securitySnapshot.score}%`
              }} transition={{
                duration: 0.8,
                delay: 0.3,
                ease: EASE
              }} />
                  </div>
                </div>

                {monitor.securitySnapshot.missingHeaders.length > 0 && <div className="border-t border-white/8 light:border-slate-900/8 pt-3">
                    <p className="mb-2 text-xs font-medium text-white/70 light:text-slate-600">Missing headers — copy the fix:</p>
                    <SecurityFixConfig missingHeaders={monitor.securitySnapshot.missingHeaders} />
                  </div>}
                {monitor.securitySnapshot.cookieIssues.length > 0 && <div>
                    <p className="text-xs font-medium text-white/70 light:text-slate-600">Cookie issues:</p>
                    <ul className="mt-1 space-y-0.5">
                      {monitor.securitySnapshot.cookieIssues.map(c => <li key={c} className="flex items-center gap-1.5 text-xs text-white/50 light:text-slate-500">
                          <span className="text-amber-400">⚠</span> {c}
                        </li>)}
                    </ul>
                  </div>}
                {monitor.securitySnapshot.serverHeaderLeak && <p className="rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
                    ⚠ Server header leaks version info: {monitor.securitySnapshot.serverHeaderLeak}
                  </p>}
                {monitor.securitySnapshot.missingHeaders.length === 0 && monitor.securitySnapshot.cookieIssues.length === 0 && !monitor.securitySnapshot.serverHeaderLeak && <p className="text-xs text-emerald-300">✓ No issues detected</p>}
              </div>}
          </SpotlightCard>
        </div>}

      {/* Content & SEO — parsed from the page's own markup, not a rendered
          Lighthouse pass (this runtime has no browser/layout engine), so it's
          scoped honestly to what's actually checkable: title/meta/headings/
          alt text/canonical/OG tags/robots.txt/sitemap.xml. */}
      {monitor.checkType !== "DNS" && monitor.checkType !== "TCP" && <SpotlightCard className="p-4" delay={0.19} scan tint="amber">
          <h2 className="mb-3 text-sm font-medium text-white light:text-slate-900">Content &amp; SEO</h2>
          {!monitor.contentAnalysis ? <p className="text-sm text-white/50 light:text-slate-500">Not yet checked.</p> : <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center justify-between text-xs text-white/50 light:text-slate-500">
                  <span>Title</span>
                  {monitor.contentAnalysis.titleLength != null && <span className={monitor.contentAnalysis.titleLength >= 10 && monitor.contentAnalysis.titleLength <= 60 ? "text-emerald-300" : "text-amber-300"}>
                      {monitor.contentAnalysis.titleLength} chars
                    </span>}
                </div>
                <p className="mt-0.5 truncate text-white light:text-slate-900">{monitor.contentAnalysis.title || "— missing —"}</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-white/50 light:text-slate-500">
                  <span>Meta description</span>
                  {monitor.contentAnalysis.metaDescriptionLength != null && <span className={monitor.contentAnalysis.metaDescriptionLength >= 50 && monitor.contentAnalysis.metaDescriptionLength <= 160 ? "text-emerald-300" : "text-amber-300"}>
                      {monitor.contentAnalysis.metaDescriptionLength} chars
                    </span>}
                </div>
                <p className="mt-0.5 truncate text-white light:text-slate-900">{monitor.contentAnalysis.metaDescription || "— missing —"}</p>
              </div>
              <Row label="H1 headings" value={monitor.contentAnalysis.h1Count === 1 ? "1 ✓" : `${monitor.contentAnalysis.h1Count} ${monitor.contentAnalysis.h1Count === 0 ? "(none found)" : "(should be exactly 1)"}`} />
              <Row label="Canonical URL" value={monitor.contentAnalysis.canonicalUrl ?? "Not set"} />
              <Row label="Images missing alt text" value={monitor.contentAnalysis.imageCount === 0 ? "No images" : `${monitor.contentAnalysis.imagesMissingAlt} of ${monitor.contentAnalysis.imageCount}`} />
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
                {[["Mobile viewport tag", monitor.contentAnalysis.hasViewportMeta], ["Open Graph title", monitor.contentAnalysis.hasOgTitle], ["Open Graph description", monitor.contentAnalysis.hasOgDescription], ["Open Graph image", monitor.contentAnalysis.hasOgImage], ["robots.txt", monitor.contentAnalysis.hasRobotsTxt], ["sitemap.xml", monitor.contentAnalysis.hasSitemapXml]].map(([label, present]) => <span key={label} className={present ? "text-emerald-300" : "text-white/30 light:text-slate-400"}>
                    {present ? "✓" : "✗"} {label}
                  </span>)}
              </div>
            </div>}
        </SpotlightCard>}

      {/* Incident history */}
      <SpotlightCard className="overflow-hidden" delay={0.2} scan>
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-medium text-white light:text-slate-900">Incident History</h2>
        </div>
        {!monitor.incidents || monitor.incidents.length === 0 ? <p className="p-4 text-sm text-white/50 light:text-slate-500">No incidents recorded. ✓</p> : <ul className="divide-y divide-white/10 light:divide-slate-900/8">
            {monitor.incidents.map((incident, i) => <motion.li key={incident.id} initial={{
          opacity: 0,
          x: -8
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.3,
          delay: i * 0.04,
          ease: EASE
        }} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-white light:text-slate-900">{incident.cause ?? "Unknown cause"}</p>
                  <p className="text-white/50 light:text-slate-500">
                    {new Date(incident.startedAt).toLocaleString()}
                    {incident.resolvedAt ? ` → ${new Date(incident.resolvedAt).toLocaleString()}` : " (ongoing)"}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${incident.status === "OPEN" ? "bg-red-400/10 light:bg-red-100 text-red-300 light:text-red-700" : "bg-emerald-400/10 light:bg-emerald-100 text-emerald-300 light:text-emerald-700"}`}>
                  {incident.status}
                </span>
              </motion.li>)}
          </ul>}
      </SpotlightCard>
    </div>;
}
function Row({
  label,
  value
}) {
  return <div className="flex justify-between gap-4">
      <dt className="text-white/50 light:text-slate-500">{label}</dt>
      <dd className="text-right text-white light:text-slate-900">{value}</dd>
    </div>;
}