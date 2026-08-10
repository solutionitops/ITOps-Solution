import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { listHostAgents, fetchMonitors } from "../api/endpoints";
import { useRealtimeInvalidate } from "../hooks/useRealtimeInvalidate";
import { Reveal } from "../components/Animated";
import { Skeleton } from "../components/Skeleton";
import { EmptyState, ErrorState } from "../components/EmptyState";
import { worstMetric, healthTone, needsAttention } from "../lib/hostHealth";

const EASE = [0.16, 1, 0.3, 1];
const REALTIME_TABLES = ["host_agents", "host_metrics", "monitors", "incidents", "check_results"];
const REALTIME_KEYS = [["host-agents"], ["monitors"]];

// Real provider zones — mirrors the provider labels a host actually stores
// (see Hosts.jsx). A zone only renders if it has at least one host, so an
// org running only on-prem never sees empty AWS/Azure/GCP columns.
const ZONES = [
  { key: "aws", label: "AWS", icon: "🟧", accent: "text-orange-300 light:text-orange-600", ring: "border-orange-400/25" },
  { key: "azure", label: "Azure", icon: "🔷", accent: "text-blue-300 light:text-blue-600", ring: "border-blue-400/25" },
  { key: "gcp", label: "Google Cloud", icon: "🟢", accent: "text-emerald-300 light:text-emerald-600", ring: "border-emerald-400/25" },
  { key: "on_prem", label: "On-Prem", icon: "🏠", accent: "text-white/70 light:text-slate-600", ring: "border-white/15 light:border-slate-900/15" },
  { key: "other", label: "Other", icon: "☁️", accent: "text-violet-300 light:text-violet-600", ring: "border-violet-400/25" },
];
const WEB_TYPES = ["HTTP", "KEYWORD", "STATUS_CODE"];
const NETWORK_TYPES = ["TCP", "PING"];

const TONE = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-300 light:text-emerald-600", bar: "bg-emerald-400", glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.25)]" },
  warn: { dot: "bg-amber-400", text: "text-amber-300 light:text-amber-600", bar: "bg-amber-400", glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.3)]" },
  crit: { dot: "bg-red-400", text: "text-red-300 light:text-red-600", bar: "bg-red-400", glow: "shadow-[0_0_0_1px_rgba(248,113,113,0.35)]" },
  down: { dot: "bg-red-400", text: "text-red-300 light:text-red-600", bar: "bg-red-400", glow: "shadow-[0_0_0_1px_rgba(248,113,113,0.3)]" },
  pending: { dot: "bg-amber-400", text: "text-amber-300 light:text-amber-600", bar: "bg-white/20", glow: "" },
};

function MiniBar({ label, value }) {
  const pct = value == null ? 0 : Math.max(0, Math.min(100, value));
  const tone = value == null ? "bg-white/15" : pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 shrink-0 text-[9px] font-medium uppercase tracking-wide text-white/35 light:text-slate-400">{label}</span>
      <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10 light:bg-slate-900/10">
        <motion.span className={`block h-full rounded-full ${tone}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: EASE }} />
      </span>
      <span className="w-6 shrink-0 text-right text-[9px] tabular-nums text-white/45 light:text-slate-500">{value == null ? "—" : `${value.toFixed(0)}`}</span>
    </div>
  );
}

// A device (TCP/PING monitor) relayed through this host's agent — drawn as a
// child because that agent physically performs the check (real data link:
// monitor.viaHostAgentId === host.id).
function DeviceChip({ device }) {
  const down = device.lastStatus === "DOWN" || device.lastStatus === "ERROR";
  return (
    <Link
      to={`/monitors/${device.id}`}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition-colors ${down ? "border-red-400/30 bg-red-400/10 text-red-200 light:text-red-700 hover:bg-red-400/15" : "border-white/10 light:border-slate-900/10 bg-white/[0.03] light:bg-slate-900/[0.03] text-white/60 light:text-slate-600 hover:bg-white/[0.06]"}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${down ? "bg-red-400" : device.lastStatus === "UP" ? "bg-emerald-400" : "bg-white/30"}`} />
      <span className="truncate">{device.name}</span>
    </Link>
  );
}

function HostNode({ host, devices, index }) {
  const tone = healthTone(host);
  const t = TONE[tone];
  // The card is a plain container (not an anchor) so the relayed-device links
  // below can be real links without nesting <a> inside <a> — only the header/
  // metrics region links through to the host list.
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04, ease: EASE }}
      className={`rounded-xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-3 ${t.glow}`}
    >
      <Link to="/hosts" className="block rounded-lg transition-opacity hover:opacity-80">
        <div className="flex items-center gap-2">
          <span className="relative grid h-2.5 w-2.5 shrink-0 place-items-center">
            {host.isOnline && <span className={`absolute h-2.5 w-2.5 rounded-full animate-sonar ${t.dot} opacity-70`} />}
            <span className={`relative h-2.5 w-2.5 rounded-full ${host.isOnline ? t.dot : "bg-white/25"}`} />
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-white light:text-slate-900">{host.name}</span>
          <span className={`shrink-0 text-[10px] font-medium ${host.isOnline ? t.text : "text-white/35 light:text-slate-400"}`}>
            {host.isOnline ? (worstMetric(host) != null ? `${worstMetric(host).toFixed(0)}%` : "OK") : host.lastSeenAt ? "OFF" : "…"}
          </span>
        </div>
        {host.hostname && <p className="mt-0.5 truncate text-[10px] text-white/35 light:text-slate-400">{host.hostname}{host.os ? ` · ${host.os}` : ""}</p>}
        {host.lastSeenAt ? (
          <div className="mt-2 space-y-1">
            <MiniBar label="CPU" value={host.cpuPercent} />
            <MiniBar label="MEM" value={host.memPercent} />
            <MiniBar label="DSK" value={host.diskPercent} />
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-amber-300/80 light:text-amber-600">Awaiting first report</p>
        )}
      </Link>
      {devices.length > 0 && (
        <div className="mt-2 border-t border-white/8 light:border-slate-900/8 pt-2">
          <p className="mb-1 text-[9px] font-medium uppercase tracking-wide text-white/30 light:text-slate-400">Relayed devices</p>
          <div className="flex flex-wrap gap-1">
            {devices.map(d => <DeviceChip key={d.id} device={d} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ZoneHeader({ icon, label, accent, online, total, attention }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-base" aria-hidden>{icon}</span>
      <h2 className={`text-sm font-semibold tracking-tight ${accent}`}>{label}</h2>
      <span className="text-[11px] text-white/40 light:text-slate-400">{online}/{total} online</span>
      {attention > 0 && (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-300 light:text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
          {attention} need{attention === 1 ? "s" : ""} attention
        </span>
      )}
    </div>
  );
}

function SummaryTile({ value, label, tone = "default", sub }) {
  const toneClass = {
    default: "text-white light:text-slate-900",
    good: "text-emerald-300 light:text-emerald-600",
    bad: "text-red-300 light:text-red-600",
    warn: "text-amber-300 light:text-amber-600",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white px-4 py-3">
      <p className={`text-2xl font-semibold tabular-nums tracking-tight ${toneClass}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-white/50 light:text-slate-500">{label}</p>
      {sub && <p className="text-[10px] text-white/35 light:text-slate-400">{sub}</p>}
    </div>
  );
}

// The animated cloud root — represents the checks that originate from the
// cloud (websites + cloud-direct devices), the top of the topology.
function CloudHub({ sitesUp, sitesTotal }) {
  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative grid place-items-center"
      >
        <span className="absolute h-16 w-16 rounded-full bg-cyan-400/10 blur-xl" />
        {[0, 1].map(i => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-cyan-400/30"
            initial={{ width: 40, height: 40, opacity: 0.5 }}
            animate={{ width: 88, height: 88, opacity: 0 }}
            transition={{ duration: 2.6, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
          />
        ))}
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-cyan-400/30 bg-neutral-900/80 light:bg-white text-2xl shadow-[0_0_30px_-8px_rgba(34,211,238,0.5)]">
          ☁️
        </div>
      </motion.div>
      <p className="mt-2 text-xs font-medium text-white light:text-slate-900">Cloud checks</p>
      <p className="text-[11px] text-white/45 light:text-slate-500">{sitesUp}/{sitesTotal} sites up</p>
      <div className="mt-3 h-6 w-px bg-gradient-to-b from-cyan-400/40 to-transparent" aria-hidden />
    </div>
  );
}

export default function Infrastructure() {
  useRealtimeInvalidate(REALTIME_TABLES, REALTIME_KEYS);

  const hostsQuery = useQuery({ queryKey: ["host-agents"], queryFn: listHostAgents, refetchInterval: 30_000 });
  const monitorsQuery = useQuery({ queryKey: ["monitors"], queryFn: fetchMonitors, refetchInterval: 60_000 });

  const hosts = hostsQuery.data;
  const monitors = monitorsQuery.data;
  const isLoading = hostsQuery.isLoading || monitorsQuery.isLoading;
  const isError = hostsQuery.isError || monitorsQuery.isError;

  const model = useMemo(() => {
    const h = hosts ?? [];
    const m = monitors ?? [];
    const webMonitors = m.filter(x => WEB_TYPES.includes(x.checkType));
    const networkDevices = m.filter(x => NETWORK_TYPES.includes(x.checkType));

    // Map each host to the devices it relays (real link via viaHostAgentId).
    const devicesByHost = new Map();
    const cloudDevices = [];
    for (const d of networkDevices) {
      if (d.viaHostAgentId) {
        if (!devicesByHost.has(d.viaHostAgentId)) devicesByHost.set(d.viaHostAgentId, []);
        devicesByHost.get(d.viaHostAgentId).push(d);
      } else {
        cloudDevices.push(d);
      }
    }

    // Group hosts into provider zones, keeping only zones that have hosts.
    const zones = ZONES.map(z => {
      const zoneHosts = h.filter(x => (x.provider ?? "other") === z.key);
      return { ...z, hosts: zoneHosts };
    }).filter(z => z.hosts.length > 0);

    const onlineHosts = h.filter(x => x.isOnline).length;
    const attentionHosts = h.filter(needsAttention).length;
    const sitesUp = webMonitors.filter(x => x.lastStatus === "UP").length;
    const sitesDown = webMonitors.filter(x => x.lastStatus === "DOWN" || x.lastStatus === "ERROR").length;
    const devicesDown = networkDevices.filter(x => x.lastStatus === "DOWN" || x.lastStatus === "ERROR").length;

    return {
      zones, devicesByHost, cloudDevices, webMonitors, networkDevices,
      totalHosts: h.length, onlineHosts, attentionHosts,
      sitesUp, sitesDown, sitesTotal: webMonitors.length,
      devicesDown, isEmpty: h.length === 0 && m.length === 0,
    };
  }, [hosts, monitors]);

  return (
    <div className="space-y-6">
      <Reveal y={12} className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-lg text-cyan-300 light:bg-cyan-100 light:text-cyan-700">◎</span>
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white light:text-slate-900">Infrastructure Map</h1>
            <p className="mt-1 text-sm text-white/45 light:text-slate-400">
              Your whole fleet in one view — hosts grouped by where they run, live health, and the network devices each agent watches.
            </p>
          </div>
        </div>
        <Link to="/hosts" className="rounded-full border border-white/15 light:border-slate-900/15 px-4 py-2 text-sm text-white/70 light:text-slate-600 transition-colors hover:bg-white/5 light:hover:bg-slate-900/5">
          Manage hosts →
        </Link>
      </Reveal>

      {isError ? (
        <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/60 light:bg-white">
          <ErrorState message="Couldn't load your infrastructure." onRetry={() => { hostsQuery.refetch(); monitorsQuery.refetch(); }} />
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : model.isEmpty ? (
        <div className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-900/60 light:bg-white">
          <EmptyState title="Nothing to map yet." description="Add a server agent or a website monitor, and it'll appear here grouped by where it runs." />
          <div className="flex flex-wrap justify-center gap-3 pb-6">
            <Link to="/hosts" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-200">Add a host</Link>
            <Link to="/monitors" className="rounded-full border border-white/15 light:border-slate-900/15 px-4 py-2 text-sm text-white/70 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-900/5">Add a website monitor</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Fleet summary */}
          <Reveal delay={0.05} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryTile value={`${model.onlineHosts}/${model.totalHosts}`} label="Hosts online" tone={model.onlineHosts === model.totalHosts ? "good" : "warn"} />
            <SummaryTile value={`${model.sitesUp}/${model.sitesTotal}`} label="Websites up" tone={model.sitesDown > 0 ? "bad" : "good"} />
            <SummaryTile value={model.networkDevices.length} label="Network devices" tone={model.devicesDown > 0 ? "bad" : "default"} sub={model.devicesDown > 0 ? `${model.devicesDown} down` : undefined} />
            <SummaryTile value={model.attentionHosts} label="Need attention" tone={model.attentionHosts > 0 ? "bad" : "good"} sub={model.attentionHosts === 0 ? "all healthy" : "offline or ≥90%"} />
          </Reveal>

          {/* Legend */}
          <Reveal delay={0.1} className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/45 light:text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Healthy (&lt;70%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Busy (70–90%)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" /> Critical / offline</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-white/30" /> Awaiting first report</span>
          </Reveal>

          {/* Topology: cloud hub → provider zones → hosts → relayed devices */}
          <Reveal delay={0.12} className="rounded-2xl border border-white/10 light:border-slate-900/10 bg-neutral-950/40 light:bg-white p-5 md:p-8">
            <CloudHub sitesUp={model.sitesUp} sitesTotal={model.sitesTotal} />

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {model.zones.map(zone => {
                const online = zone.hosts.filter(x => x.isOnline).length;
                const attention = zone.hosts.filter(needsAttention).length;
                return (
                  <div key={zone.key} className={`rounded-xl border ${zone.ring} bg-white/[0.015] light:bg-slate-900/[0.015] p-4`}>
                    <ZoneHeader icon={zone.icon} label={zone.label} accent={zone.accent} online={online} total={zone.hosts.length} attention={attention} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {zone.hosts.map((host, i) => (
                        <HostNode key={host.id} host={host} devices={model.devicesByHost.get(host.id) ?? []} index={i} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Public edge: websites + cloud-direct devices (no agent) */}
              {(model.webMonitors.length > 0 || model.cloudDevices.length > 0) && (
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.03] p-4">
                  <ZoneHeader icon="🌐" label="Public Edge" accent="text-cyan-300 light:text-cyan-600" online={model.sitesUp} total={model.sitesTotal} attention={model.sitesDown} />
                  <p className="mb-3 -mt-1.5 text-[11px] text-white/40 light:text-slate-400">Checked from the cloud — no agent required.</p>
                  <div className="flex flex-wrap gap-2">
                    {model.webMonitors.map(site => {
                      const down = site.lastStatus === "DOWN" || site.lastStatus === "ERROR";
                      return (
                        <Link key={site.id} to={`/monitors/${site.id}`} className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${down ? "border-red-400/30 bg-red-400/10 text-red-200 light:text-red-700 hover:bg-red-400/15" : "border-white/10 light:border-slate-900/10 bg-white/[0.03] light:bg-slate-900/[0.03] text-white/70 light:text-slate-600 hover:bg-white/[0.06]"}`}>
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${down ? "bg-red-400" : site.lastStatus === "UP" ? "bg-emerald-400" : "bg-white/30"}`} />
                          <span className="truncate">{site.name}</span>
                        </Link>
                      );
                    })}
                    {model.cloudDevices.map(d => <DeviceChip key={d.id} device={d} />)}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}
