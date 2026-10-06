// The ITOps control plane — the story's climax and its recurring anchor.
// A believable operations console (not a decorative mock-up): every panel maps
// to a real module, and in "context" mode each panel names the module that
// feeds it. All figures are sample data and are labelled as such by callers.
import { memo, useEffect, useRef, useState } from "react";
import { Signal } from "./World";

const KPIS = [
  ["System health", "99.98%", "monitors", "var(--s-green)"],
  ["Monitors", "128", "monitors"],
  ["Open incidents", "03", "incidents", "var(--s-amber)"],
  ["Assets", "247", "assets"],
  ["Security", "92", "security", "var(--s-violet)"],
  ["Network", "Online", "network", "var(--s-green)"],
  ["Servers", "24", "servers"],
  ["API latency", "184ms", "monitors"]
];
const NAV = ["Overview", "Monitors", "Incidents", "Assets", "Security", "Network", "Servers", "Alerts"];
const MONITORS = [["api.example.com", "API", "184 ms", "ok"], ["app.example.com", "Website", "212 ms", "ok"], ["checkout-service", "Keyword", "503", "warn"], ["example.com", "DNS", "Resolved", "ok"], ["status.example.com", "Website", "96 ms", "ok"]];
const INCIDENTS = [["10:31", "Monitor failed · checkout-service", "warn"], ["10:32", "Incident created · #2481", "warn"], ["10:33", "Alert sent · Slack, email", "info"], ["10:37", "Service recovered", "ok"], ["10:37", "Incident resolved", "ok"]];
const ALERTS = [["Slack", "#ops-alerts", "info"], ["Email", "on-call", "info"], ["Webhook", "delivered", "ok"]];
const SERVERS = [["prod-web-01", 42, 61, 72], ["prod-db-01", 28, 74, 55]];
const ASSETS = [["Websites", 86], ["Servers", 24], ["Network devices", 41], ["Applications", 96]];
const SOURCES = {
  monitors: "Website & API monitoring",
  network: "Network & device monitoring",
  incidents: "Incident management",
  alerts: "Multi-channel alerting",
  servers: "Kada Nigrani",
  security: "Security monitoring",
  assets: "Asset inventory"
};

function Card({ k, lit, title, className = "", children }) {
  const isLit = lit === "all" || (Array.isArray(lit) && lit.includes(k));
  return <div className={`cp-card ${className}`} data-lit={isLit ? "1" : "0"}>
    {SOURCES[k] && <span className="cp-src">{SOURCES[k]}</span>}
    {title && <h4>{title}</h4>}
    {children}
  </div>;
}

function Chart() {
  const line = "M0 62C24 54 40 66 62 52S100 40 124 48 168 30 190 36 232 58 254 44 296 22 320 30 360 46 384 34 420 18 440 24";
  return <svg viewBox="0 0 440 84" className="mt-2 h-[92px] w-full" preserveAspectRatio="none" aria-hidden>
    <defs>
      <linearGradient id="cp-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="var(--s-cyan)" stopOpacity="0.28" />
        <stop offset="1" stopColor="var(--s-cyan)" stopOpacity="0" />
      </linearGradient>
    </defs>
    {[21, 42, 63].map(y => <line key={y} x1="0" x2="440" y1={y} y2={y} stroke="var(--s-line)" />)}
    <path d={`${line}L440 84L0 84Z`} fill="url(#cp-area)" />
    <path d={line} fill="none" stroke="var(--s-cyan)" strokeWidth="1.6" />
    <circle cx="254" cy="44" r="3" fill="var(--s-amber)" />
  </svg>;
}

function MiniTopology() {
  const pts = [[30, 18], [90, 18], [60, 52], [20, 86], [100, 86], [60, 116]];
  const links = [[0, 2], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5]];
  return <svg viewBox="0 0 120 132" className="mx-auto mt-1 h-[118px]" aria-hidden>
    {links.map(([a, b]) => <line key={`${a}${b}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="var(--s-line2)" />)}
    {pts.map(([x, y], i) => <g key={i}>
      <rect x={x - 13} y={y - 8} width="26" height="16" rx="4" fill="var(--s-panel)" stroke={i === 4 ? "var(--s-amber)" : "var(--s-line2)"} />
      <circle cx={x} cy={y} r="2.4" fill={i === 4 ? "var(--s-amber)" : "var(--s-green)"} />
    </g>)}
  </svg>;
}

/** Full console at its design size (1120 × 548); wrap in <Fit> to scale it.
 *  Memoized: it is ~200 nodes of static markup inside scenes that re-render per stage. */
export const ControlPlane = memo(function ControlPlane({ lit = "all", context = false }) {
  return <div className="cp" data-context={context ? "1" : "0"} style={{ width: 1120, height: 548 }} role="img" aria-label="ITOps control plane: system health, monitors, incidents, assets, security, network, servers and alerts in one console">
    <div className="cp-top">
      <Signal />
      <b className="text-[12.5px] font-semibold tracking-tight">ITOps</b>
      <span className="s-mono !text-[9px]">Control plane</span>
      <span className="ml-4 rounded-md border border-[var(--s-line2)] px-2 py-1 text-[10.5px] text-[var(--s-dim)]">example-org ▾</span>
      <span className="rounded-md border border-[var(--s-line2)] px-2 py-1 text-[10.5px] text-[var(--s-dim)]">Production</span>
      <span className="ml-auto text-[10.5px] text-[var(--s-dim)]">Last 24 hours</span>
      <span className="s-status" data-kind="live">Live</span>
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--s-line2)] text-[9px] font-semibold">OP</span>
    </div>
    <div className="grid h-[508px] grid-cols-[148px_1fr]">
      <ul className="cp-side pt-2">
        {NAV.map((n, i) => <li key={n} data-on={i === 0 ? "1" : "0"}>{n}</li>)}
      </ul>
      <div className="flex flex-col gap-[10px] p-[14px]">
        <div className="grid grid-cols-8 gap-[10px]">
          {KPIS.map(([label, value, k, tone]) => <Card key={label} k={`kpi-${k}`} lit={lit === "all" ? "all" : (Array.isArray(lit) && lit.includes(k) ? [`kpi-${k}`] : [])} className="cp-kpi !py-[9px]">
            <h4>{label}</h4>
            <b style={tone ? { color: tone } : undefined}>{value}</b>
          </Card>)}
        </div>
        <div className="grid flex-1 grid-cols-12 gap-[10px]">
          <Card k="monitors" lit={lit} title="Response time · api.example.com" className="col-span-4">
            <Chart />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-[var(--s-faint)]"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>now</span></div>
          </Card>
          <Card k="network" lit={lit} title="Topology" className="col-span-3">
            <MiniTopology />
          </Card>
          <Card k="incidents" lit={lit} title="Incident #2481 · timeline" className="col-span-3">
            <div className="mt-1.5">
              {INCIDENTS.map(([t, msg, tone]) => <div key={msg} className="cp-row">
                <span className="cp-dot" data-t={tone} />
                <span className="font-mono text-[9.5px] text-[var(--s-faint)]">{t}</span>
                <span className="truncate text-[10.5px]">{msg}</span>
              </div>)}
            </div>
          </Card>
          <Card k="alerts" lit={lit} title="Alerts" className="col-span-2">
            <div className="mt-1.5">
              {ALERTS.map(([ch, to, tone]) => <div key={ch} className="cp-row">
                <span className="cp-dot" data-t={tone} />
                <span>{ch}</span>
                <span className="cp-num">{to}</span>
              </div>)}
            </div>
          </Card>
        </div>
        <div className="grid flex-1 grid-cols-12 gap-[10px]">
          <Card k="monitors" lit={lit} title="Monitors" className="col-span-4">
            <div className="mt-1.5">
              {MONITORS.map(([name, type, val, tone]) => <div key={name} className="cp-row">
                <span className="cp-dot" data-t={tone} />
                <span className="truncate">{name}</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--s-faint)]">{type}</span>
                <span className="cp-num">{val}</span>
              </div>)}
            </div>
          </Card>
          <Card k="servers" lit={lit} title="Servers · Kada Nigrani agent" className="col-span-3">
            <div className="mt-2 space-y-3">
              {SERVERS.map(([host, cpu, mem, disk]) => <div key={host}>
                <div className="flex items-center gap-2 text-[11px]"><span className="cp-dot" />{host}</div>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {[["CPU", cpu], ["MEM", mem], ["DISK", disk]].map(([l, v]) => <div key={l}>
                    <div className="flex justify-between font-mono text-[8.5px] text-[var(--s-faint)]"><span>{l}</span><span>{v}%</span></div>
                    <div className="cp-bar mt-1"><i style={{ width: `${v}%` }} /></div>
                  </div>)}
                </div>
              </div>)}
            </div>
          </Card>
          <Card k="security" lit={lit} title="Security" className="col-span-2">
            <div className="mt-1.5">
              {[["SSL", "Valid · 61d"], ["Headers", "8 / 10"], ["Cookies", "Secure"], ["Score", "92"]].map(([l, v]) => <div key={l} className="cp-row">
                <span className="cp-dot" style={{ background: "var(--s-violet)" }} />
                <span>{l}</span>
                <span className="cp-num">{v}</span>
              </div>)}
            </div>
          </Card>
          <Card k="assets" lit={lit} title="Assets · 247" className="col-span-3">
            <div className="mt-1.5">
              {ASSETS.map(([l, v]) => <div key={l} className="cp-row">
                <span className="cp-dot" data-t="info" />
                <span>{l}</span>
                <span className="cp-num">{v}</span>
              </div>)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>;
});

/** The same console recomposed for phones: KPIs, one chart, the incident. */
export const ControlPlaneCompact = memo(function ControlPlaneCompact({ className = "" }) {
  return <div className={`cp ${className}`} role="img" aria-label="ITOps control plane summary">
    <div className="cp-top">
      <Signal />
      <b className="text-[12.5px] font-semibold tracking-tight">ITOps</b>
      <span className="s-mono !text-[9px]">Control plane</span>
      <span className="s-status ml-auto" data-kind="live">Live</span>
    </div>
    <div className="space-y-2 p-2.5">
      <div className="grid grid-cols-4 gap-2">
        {KPIS.map(([label, value, , tone]) => <div key={label} className="cp-card cp-kpi !p-2">
          <h4 className="!text-[7.5px] !tracking-[0.08em]">{label}</h4>
          <b className="!text-[15px]" style={tone ? { color: tone } : undefined}>{value}</b>
        </div>)}
      </div>
      <div className="cp-card">
        <h4>Response time · api.example.com</h4>
        <Chart />
      </div>
      <div className="cp-card">
        <h4>Incident #2481 · timeline</h4>
        <div className="mt-1.5">
          {INCIDENTS.slice(0, 4).map(([t, msg, tone]) => <div key={msg} className="cp-row">
            <span className="cp-dot" data-t={tone} />
            <span className="font-mono text-[9.5px] text-[var(--s-faint)]">{t}</span>
            <span className="truncate text-[10.5px]">{msg}</span>
          </div>)}
        </div>
      </div>
    </div>
  </div>;
});

/**
 * Scales fixed-size children (w × h) down to the space available, never up.
 * `maxH` is a CSS length for the tallest the box may be (e.g. "58svh").
 */
export function Fit({ w, h, maxH = "60svh", className = "", children }) {
  const outer = useRef(null);
  const probe = useRef(null);
  const [k, setK] = useState(1);
  useEffect(() => {
    const measure = () => {
      if (!outer.current || !probe.current) return;
      const availW = outer.current.clientWidth;
      const availH = probe.current.clientHeight;
      setK(Math.min(1, availW / w, availH / h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, [w, h]);
  return <div ref={outer} className={`relative w-full ${className}`}>
    <div ref={probe} aria-hidden className="pointer-events-none absolute left-0 top-0 w-px" style={{ height: maxH }} />
    <div className="mx-auto" style={{ width: w * k, height: h * k }}>
      <div style={{ width: w, height: h, transform: `scale(${k})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  </div>;
}
