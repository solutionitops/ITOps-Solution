import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { getHealingAutonomy, setHealingAutonomy, listHealingIncidents, approveHostCommand, dismissHostCommand } from "../api/endpoints";
import { useRealtimeInvalidate } from "../hooks/useRealtimeInvalidate";
import { useToast } from "./Toast";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./EmptyState";

const EASE = [0.16, 1, 0.3, 1];

const AUTONOMY = [
  { key: "off", label: "Off", desc: "No automatic detection." },
  { key: "suggest", label: "Suggest", desc: "Detect problems and propose a fix — you approve each one." },
  { key: "auto", label: "Auto-heal", desc: "Detect, apply the safe fix, and verify recovery — no approval needed." },
];

const ACTION_LABEL = {
  clear_temp: "Clear temp files",
  reload_nginx: "Reload Nginx",
  reload_apache: "Reload Apache",
  restart_service: "Restart service",
  restart_docker_container: "Restart container",
  ping: "Agent ping",
};

// Maps a command's lifecycle + verification into one human status.
function statusOf(inc) {
  if (inc.status === "proposed") return { label: "Awaiting approval", tone: "amber" };
  if (inc.status === "cancelled") return { label: "Dismissed", tone: "muted" };
  if (inc.status === "approved") return { label: "Queued for agent", tone: "blue" };
  if (inc.status === "running") return { label: "Applying fix…", tone: "blue" };
  if (inc.status === "failed") return { label: "Fix failed", tone: "red" };
  if (inc.status === "success") {
    if (inc.verifyResult === "recovered") return { label: "Auto-healed ✓", tone: "emerald" };
    if (inc.verifyResult === "not_improved") return { label: "Applied — still degraded", tone: "amber" };
    return { label: "Applied — verifying…", tone: "blue" };
  }
  return { label: inc.status, tone: "muted" };
}
const TONE = {
  emerald: "bg-emerald-400/10 light:bg-emerald-100 text-emerald-300 light:text-emerald-700",
  amber: "bg-amber-400/10 light:bg-amber-100 text-amber-300 light:text-amber-700",
  blue: "bg-blue-400/10 light:bg-blue-100 text-blue-300 light:text-blue-700",
  red: "bg-red-400/10 light:bg-red-100 text-red-300 light:text-red-700",
  muted: "bg-white/10 text-white/50 light:bg-slate-900/10 light:text-slate-500",
};

function IncidentRow({ inc, canManage, onApprove, onDismiss, pending }) {
  const st = statusOf(inc);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}
      className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-white light:text-slate-900">{inc.hostName}</span>
        <span className="rounded-full bg-white/10 light:bg-slate-900/10 px-2 py-0.5 text-[10px] font-medium text-white/60 light:text-slate-500">{inc.triggerMetric}</span>
        <span className={`ml-auto inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TONE[st.tone]}`}>{st.label}</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-white/60 light:text-slate-600">{inc.rootCause}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-white/40 light:text-slate-400">
        <span className="rounded-md bg-cyan-400/10 px-2 py-0.5 font-medium text-cyan-300 light:bg-cyan-100 light:text-cyan-700">Fix: {ACTION_LABEL[inc.actionKey] ?? inc.actionKey}</span>
        {inc.confidence != null && <span>{inc.confidence}% confidence</span>}
        <span>· {new Date(inc.createdAt).toLocaleString()}</span>
        {inc.status === "proposed" && canManage && (
          <span className="ml-auto flex items-center gap-2">
            <button onClick={() => onApprove(inc.id)} disabled={pending} className="rounded-full bg-white text-black light:bg-slate-900 light:text-white px-3 py-1 text-[11px] font-medium transition-colors hover:bg-neutral-200 light:hover:bg-slate-800 disabled:opacity-60">
              Approve &amp; run
            </button>
            <button onClick={() => onDismiss(inc.id)} disabled={pending} className="rounded-full border border-white/15 light:border-slate-900/15 px-3 py-1 text-[11px] text-white/60 light:text-slate-500 transition-colors hover:text-white light:hover:text-slate-900 disabled:opacity-60">
              Dismiss
            </button>
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function SelfHealing({ canManage = false }) {
  useRealtimeInvalidate(["host_commands", "org_healing_settings"], [["healing-incidents"], ["healing-autonomy"]]);
  const queryClient = useQueryClient();
  const toast = useToast();

  const autonomyQuery = useQuery({ queryKey: ["healing-autonomy"], queryFn: getHealingAutonomy, staleTime: 30_000 });
  const incidentsQuery = useQuery({ queryKey: ["healing-incidents"], queryFn: () => listHealingIncidents(25), refetchInterval: 30_000 });

  const setAutonomy = useMutation({
    mutationFn: setHealingAutonomy,
    onSuccess: (lvl) => { queryClient.setQueryData(["healing-autonomy"], lvl); toast.success(`Automation set to “${AUTONOMY.find(a => a.key === lvl)?.label ?? lvl}”.`); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't change automation setting."),
  });
  const approve = useMutation({
    mutationFn: approveHostCommand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["healing-incidents"] }); toast.success("Remediation approved — the agent will run it shortly."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't approve."),
  });
  const dismiss = useMutation({
    mutationFn: dismissHostCommand,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["healing-incidents"] }); toast.success("Remediation dismissed."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't dismiss."),
  });

  const autonomy = autonomyQuery.data ?? "suggest";
  const incidents = incidentsQuery.data ?? [];
  const pendingCount = incidents.filter(i => i.status === "proposed").length;

  return (
    <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300 light:bg-emerald-100 light:text-emerald-700">♥</span>
            <h3 className="text-sm font-semibold tracking-tight text-white light:text-slate-900">Self-Healing</h3>
            {pendingCount > 0 && <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300 light:bg-amber-100 light:text-amber-700">{pendingCount} awaiting approval</span>}
          </div>
          <p className="mt-1 text-xs text-white/45 light:text-slate-400">Detects host problems, proposes the safe fix, and (when you allow it) applies and verifies it automatically.</p>
        </div>
      </div>

      {/* Autonomy control */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {AUTONOMY.map(a => {
          const active = autonomy === a.key;
          return (
            <button
              key={a.key}
              type="button"
              disabled={!canManage || setAutonomy.isPending}
              onClick={() => canManage && setAutonomy.mutate(a.key)}
              className={`rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed ${active ? "border-emerald-400/50 bg-emerald-400/[0.07]" : "border-white/10 light:border-slate-900/10 hover:border-white/25 light:hover:border-slate-900/20"} ${!canManage ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${active ? "text-emerald-300 light:text-emerald-700" : "text-white light:text-slate-900"}`}>{a.label}</span>
                {active && <span className="h-2 w-2 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-white/45 light:text-slate-400">{a.desc}</p>
            </button>
          );
        })}
      </div>
      {!canManage && <p className="mt-2 text-[11px] text-white/40 light:text-slate-400">Your role can view automation but not change it — ask an organization admin.</p>}

      {/* Incident timeline */}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-white/40 light:text-slate-400">Recent auto-detected incidents</p>
        {incidentsQuery.isError ? (
          <ErrorState message="Couldn't load self-healing incidents." onRetry={() => incidentsQuery.refetch()} />
        ) : incidentsQuery.isLoading ? (
          <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : incidents.length === 0 ? (
          <p className="rounded-xl border border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-slate-900/[0.02] px-4 py-3 text-xs text-white/50 light:text-slate-500">
            {autonomy === "off" ? "Detection is off. Switch to Suggest or Auto-heal to start catching problems automatically." : "No problems detected. When a host crosses a critical threshold, the proposed fix appears here."}
          </p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {incidents.map(inc => (
                <IncidentRow key={inc.id} inc={inc} canManage={canManage} pending={approve.isPending || dismiss.isPending} onApprove={approve.mutate} onDismiss={dismiss.mutate} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
