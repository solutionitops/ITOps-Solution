// One visual metaphor per page, all drawn in the same vocabulary (panels, node
// chips, wires, packets, mono labels). Every figure here is sample data and is
// labelled as an illustration by the page that uses it.
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Flow, Metric, Status } from "./World";

function Panel({ title, right, children, className = "" }) {
  return <div className={`s-panel overflow-hidden ${className}`}>
    {title && <div className="flex items-center justify-between gap-3 border-b border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
      <span className="s-mono !text-[9.5px]">{title}</span>
      {right}
    </div>}
    {children}
  </div>;
}
function Row({ k, v, tone = "var(--s-green)", vTone }) {
  return <div className="cp-row !py-2.5 font-mono text-[11px]">
    <span className="cp-dot" style={{ background: tone }} />
    <span className="uppercase tracking-[0.12em]">{k}</span>
    <span className="cp-num !text-[11px]" style={vTone ? { color: vTone } : undefined}>{v}</span>
  </div>;
}
function spark(seed, n = 24, amp = 9) {
  let d = "";
  for (let i = 0; i <= n; i += 1) {
    const y = 20 + amp * Math.sin(i * 0.55 + seed * 1.9) + amp * 0.45 * Math.sin(i * 1.7 + seed);
    d += `${i === 0 ? "M" : "L"}${(i * 200 / n).toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
export function Sparkline({ seed = 1, tone = "var(--s-cyan)", className = "h-10 w-full" }) {
  const d = spark(seed);
  return <svg viewBox="0 0 200 40" preserveAspectRatio="none" className={className} aria-hidden>
    <path d={`${d}L200 40L0 40Z`} fill={tone} opacity="0.1" />
    <path d={d} fill="none" stroke={tone} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
  </svg>;
}
/** True once the element has been on screen for `ms` — used to stage a change. */
function useAfterSeen(ms) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!seen) return undefined;
    if (reduce) { setDone(true); return undefined; }
    const id = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(id);
  }, [seen, ms, reduce]);
  return [ref, done, seen];
}

/* ── website & API: a request travelling through the web ── */
export function RequestJourney() {
  return <div>
    <Panel>
      <div className="flex items-center gap-2 border-b border-[var(--s-line)] px-3 py-2.5 font-mono text-[11px] text-[var(--s-dim)]">
        <span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" /><span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" /><span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" />
        <span className="ml-2 flex-1 truncate rounded bg-[var(--s-panel2)] px-2.5 py-1.5">https://app.example.com</span>
      </div>
      <div className="p-4">
        <Flow steps={[{ label: "Request" }, { label: "DNS" }, { label: "HTTPS" }, { label: "Response" }]} className="hidden sm:flex" />
        <div className="mt-4 space-y-1.5 font-mono text-[11px] leading-relaxed">
          <p><span className="text-[var(--s-faint)]">dns    </span> app.example.com <span className="text-[var(--s-green)]">resolved</span></p>
          <p><span className="text-[var(--s-faint)]">tls    </span> certificate <span className="text-[var(--s-green)]">valid</span></p>
          <p><span className="text-[var(--s-faint)]">GET /  </span> <span className="text-[var(--s-green)]">200 OK</span> <span className="text-[var(--s-dim)]">· 184 ms</span></p>
          <p><span className="text-[var(--s-faint)]">chain  </span> <span className="text-[var(--s-dim)]">http → https → /home (2 hops)</span></p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
        <span className="s-key">Monitor.status<b style={{ color: "var(--s-green)" }}>Up</b></span>
        <span className="s-chip !py-1.5" data-tone="itops">ITOps</span>
      </div>
    </Panel>
    <div className="mt-6 grid grid-cols-3 gap-4">
      <Metric value="99.98%" label="Uptime" />
      <Metric value="184ms" label="Response" />
      <Metric value="2" label="Redirect hops" />
    </div>
  </div>;
}

/* ── security: an endpoint being inspected ── */
const HEADERS = [["Strict-Transport-Security", true], ["Content-Security-Policy", true], ["X-Frame-Options", true], ["X-Content-Type-Options", true], ["Referrer-Policy", true], ["Permissions-Policy", false]];
export function Inspection() {
  const R = 30, C = 2 * Math.PI * R;
  const [ref, done, seen] = useAfterSeen(1900);
  return <div ref={ref} data-on={seen ? "1" : "0"}>
    <Panel title="Inspecting · https://app.example.com" right={<span className="s-mono !text-[9px]" style={{ color: "var(--s-violet)" }}>{done ? "Scored" : "Checking"}</span>}>
      <div className="grid gap-5 p-4 sm:grid-cols-[1fr_auto]">
        <div>
          {[["HTTPS", "Enforced"], ["SSL certificate", "Valid · 61 days"], ["Cookies", "Secure · HttpOnly · SameSite"], ["Server header", "No version leak"]].map(([k, v], i) => <div key={k} className="s-rise" style={{ "--i": i * 2 }}><Row k={k} v={v} tone="var(--s-violet)" /></div>)}
          <p className="s-mono mt-4 !text-[9px]">Security headers</p>
          <ul className="mt-2 space-y-1.5">
            {HEADERS.map(([h, ok], i) => <li key={h} className="s-rise flex items-center justify-between rounded-md border border-[var(--s-line)] px-3 py-1.5 font-mono text-[10.5px]" style={{ "--i": 6 + i }}>
              <span className="truncate text-[var(--s-dim)]">{h}</span>
              <span style={{ color: ok ? "var(--s-green)" : "var(--s-amber)" }}>{ok ? "✓" : "missing"}</span>
            </li>)}
          </ul>
        </div>
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:justify-center">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="36" cy="36" r={R} fill="none" stroke="var(--s-line)" strokeWidth="6" />
              <circle cx="36" cy="36" r={R} fill="none" stroke="var(--s-violet)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: done ? C * 0.14 : C, transition: "stroke-dashoffset 1.3s var(--s-ease)" }} />
            </svg>
            <span className="absolute inset-0 grid place-items-center text-2xl font-semibold tabular-nums">{done ? "86" : "—"}</span>
          </div>
          <span className="s-key">Security.score</span>
        </div>
      </div>
    </Panel>
  </div>;
}

/* ── incidents: healthy → one monitor fails → the lifecycle ── */
const MONITOR_ROWS = [["api.example.com", "API"], ["app.example.com", "Website"], ["checkout-service", "Keyword"], ["example.com", "DNS"], ["core-gateway:443", "TCP"]];
// The lifecycle the product records, in its own words.
export const LIFECYCLE = [["10:31:04", "Detected", "Consecutive checks failed", "var(--s-amber)"], ["10:31:06", "Root cause identified", "HTTP 503 from origin", "var(--s-amber)"], ["10:31:07", "Alerts dispatched", "Slack · email · webhook", "var(--s-cyan)"], ["10:37:12", "Recovery verified", "Checks passing again", "var(--s-green)"], ["10:37:12", "Closed", "Resolved automatically", "var(--s-green)"]];
export function HealthyThenBroken() {
  const [ref, broken] = useAfterSeen(1700);
  return <div ref={ref}>
    <Panel title="Monitors" right={<span className="s-status" data-kind={broken ? undefined : "live"} style={broken ? { color: "var(--s-amber)" } : undefined}>{broken ? "1 incident open" : "System healthy"}</span>}>
      <div className="px-4 py-2">
        {MONITOR_ROWS.map(([name, type], i) => {
          const bad = broken && i === 2;
          return <div key={name} className="cp-row !py-2.5 text-[12.5px]" style={{ transition: "opacity 0.5s", opacity: broken && !bad ? 0.45 : 1 }}>
            <span className="cp-dot" style={{ background: bad ? "var(--s-amber)" : "var(--s-green)", transition: "background 0.4s" }} />
            <span className="truncate">{name}</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--s-faint)]">{type}</span>
            <span className="cp-num" style={bad ? { color: "var(--s-amber)" } : undefined}>{bad ? "503 · failing" : "OK"}</span>
          </div>;
        })}
      </div>
      <div className="border-t border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5" style={{ opacity: broken ? 1 : 0.35, transition: "opacity 0.5s" }}>
        <span className="s-key" data-tone="warn">Incident.open<b>{broken ? "#2481 · checkout-service" : "none"}</b></span>
      </div>
    </Panel>
  </div>;
}
export function Lifecycle() {
  return <ol>
    {LIFECYCLE.map(([t, title, detail, tone], i) => <li key={title} className="s-rise relative flex gap-5 pb-6 last:pb-0" style={{ "--i": i * 1.5 }}>
      {i < LIFECYCLE.length - 1 && <span aria-hidden className="absolute left-[5px] top-5 h-full w-px bg-[var(--s-line2)]" />}
      <span className="relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-[var(--s-bg)]" style={{ background: tone }} />
      <div>
        <p className="font-mono text-[10.5px] tabular-nums text-[var(--s-faint)]">{t}</p>
        <p className="mt-0.5 text-[15px] font-medium tracking-tight">{title}</p>
        <p className="text-sm text-[var(--s-dim)]">{detail}</p>
      </div>
    </li>)}
  </ol>;
}

/* ── alerting: one signal branching to the right people ── */
export function AlertRouting({ live = true }) {
  const targets = [["Slack", 44], ["Email", 150], ["Webhook", 256]];
  return <svg viewBox="0 0 620 300" className="s-topo w-full" data-connect="1" data-live={live ? "1" : "0"} role="img" aria-label="An incident passes through the organization's alert rule and is delivered to Slack, email and a webhook">
    <path pathLength="1" className="s-conv" style={{ stroke: "var(--s-amber)" }} d="M150 150L250 150" />
    <path pathLength="1" className="s-pkt conv" style={{ "--d": "1.4s", stroke: "var(--s-amber)" }} d="M150 150L250 150" />
    {targets.map(([label, y], i) => {
      const d = `M390 150C440 150 430 ${y} 480 ${y}`;
      return <g key={label}>
        <path pathLength="1" className="s-conv" style={{ "--i": i + 1 }} d={d} />
        <path pathLength="1" className="s-pkt conv" style={{ "--d": `${1.5 + i * 0.25}s`, "--dl": `${-i * 0.5}s` }} d={d} />
        <g className="s-node" data-on="1">
          <rect x="480" y={y - 21} width="132" height="42" rx="9" />
          <circle className="dot" cx="494" cy={y - 5} r="2.6" style={{ fill: "var(--s-green)" }} />
          <text className="lbl" x="504" y={y - 2}>{label}</text>
          <text className="sig" x="504" y={y + 11} style={{ opacity: 1 }}>Delivered</text>
        </g>
      </g>;
    })}
    <g className="s-node" data-on="1" data-state="fail">
      <rect x="10" y="129" width="140" height="42" rx="9" />
      <circle className="dot" cx="24" cy="145" r="2.6" />
      <text className="lbl" x="34" y="148">Incident</text>
      <text className="sig" x="34" y="161" style={{ opacity: 1 }}>#2481 · Open</text>
    </g>
    <g className="s-node" data-on="1">
      <rect x="250" y="129" width="140" height="42" rx="9" style={{ stroke: "var(--s-cyan)" }} />
      <circle className="dot" cx="264" cy="145" r="2.6" style={{ fill: "var(--s-cyan)" }} />
      <text className="lbl" x="274" y="148">Alert rule</text>
      <text className="sig" x="274" y="161" style={{ opacity: 1 }}>Organization</text>
    </g>
  </svg>;
}
/** What an alert says: the monitor, what failed, and when. */
export function AlertEvent() {
  return <Panel title="Alert · #ops-alerts" right={<span className="s-mono !text-[9px]">10:31:07</span>}>
    <div className="space-y-2.5 p-4 text-sm">
      <p className="flex items-center gap-2 font-medium"><span className="cp-dot" data-t="warn" /> checkout-service is down</p>
      <p className="font-mono text-[11.5px] leading-relaxed text-[var(--s-dim)]">Expected text not found<br />https://example.com/checkout · 2 consecutive failures</p>
      <p className="s-key" data-tone="warn">Incident<b>#2481 opened</b></p>
    </div>
    <div className="border-t border-[var(--s-line)] p-4 text-sm">
      <p className="flex items-center gap-2 font-medium"><span className="cp-dot" /> checkout-service recovered</p>
      <p className="mt-1.5 font-mono text-[11.5px] text-[var(--s-dim)]">Checks passing again · incident auto-resolved</p>
    </div>
  </Panel>;
}

/* ── network: a packet travelling through infrastructure ── */
const HOPS = [["Internet", "Reachable"], ["Router", "TCP 22 open · 3 ms"], ["Firewall", "TCP 443 open · 5 ms"], ["Switch", "TCP 22 open · 4 ms"], ["Server", "TCP 443 open · 12 ms"], ["Application", "DNS A record unchanged"]];
export function NetworkPath() {
  const ref = useRef(null);
  const live = useInView(ref, { amount: 0.2 });
  return <div ref={ref} className="grid gap-5 sm:grid-cols-[auto_1fr]">
    <Flow steps={HOPS.map(([label]) => ({ label }))} dir="col" live={live} className="mx-auto w-44" />
    <Panel title="Connectivity checks" right={<span className="s-mono !text-[9px]" style={{ color: "var(--s-cyan)" }}>Agentless</span>}>
      <div className="px-4 py-2">
        {HOPS.slice(1).map(([k, v]) => <Row key={k} k={k} v={v} />)}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-dashed border-[var(--s-gray)] px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--s-gray)]">
        <span>SNMP hardware telemetry</span>
        <Status kind="roadmap" />
      </div>
    </Panel>
  </div>;
}

/* ── Kada Nigrani: server telemetry travelling to the control plane ── */
const GAUGES = [["CPU", "42%", 1, "var(--s-cyan)"], ["Memory", "61%", 2, "var(--s-blue)"], ["Disk", "72%", 3, "var(--s-violet)"], ["Load", "0.42", 4, "var(--s-green)"]];
export function ServerTelemetry() {
  const ref = useRef(null);
  const live = useInView(ref, { amount: 0.2 });
  return <div ref={ref}>
    <Panel title="prod-web-01 · Linux" right={<span className="s-status" data-kind="live">Online</span>}>
      <div className="grid grid-cols-2 gap-px bg-[var(--s-line)]">
        {GAUGES.map(([label, value, seed, tone]) => <div key={label} className="bg-[var(--s-panel)] p-4">
          <div className="flex items-baseline justify-between">
            <span className="s-mono !text-[9.5px]">{label}</span>
            <span className="text-lg font-semibold tabular-nums tracking-tight">{value}</span>
          </div>
          <Sparkline seed={seed} tone={tone} className="mt-2 h-10 w-full" />
        </div>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
        <span className="s-key">Server.uptime<b>18d 14h</b></span>
        <span className="s-key">Processes<b>184</b></span>
      </div>
    </Panel>
    <Flow steps={[{ label: "Linux server" }, { label: "Kada Nigrani agent" }, { label: "ITOps", tone: "itops" }]} live={live} className="mt-6 hidden sm:flex" />
  </div>;
}
export function AgentInstall() {
  return <Panel title="Terminal">
    <div className="p-4 font-mono text-[11.5px] leading-relaxed">
      <p><span style={{ color: "var(--s-green)" }}>$</span> curl -fsSL …/kada-nigrani-agent.sh</p>
      <p className="mt-1 text-[var(--s-green)]">✓ agent installed</p>
      <p className="text-[var(--s-dim)]">✓ reporting every minute over HTTPS</p>
    </div>
  </Panel>;
}

/* ── assets: an environment becoming a map ── */
const ASSETS = [["Website", "app.example.com", "https://app.example.com", "auto"], ["Website", "api.example.com", "https://api.example.com", "auto"], ["Server", "prod-web-01", "10.0.4.12", "manual"], ["Database", "orders-primary", "10.0.6.20", "manual"], ["Other", "core-router", "10.0.0.1", "manual"]];
export function AssetMap() {
  const [ref, , seen] = useAfterSeen(0);
  return <div ref={ref} data-on={seen ? "1" : "0"}>
    <Panel title="Asset inventory" right={<span className="s-key">Assets<b>247</b></span>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-[var(--s-line)]">
              {["Type", "Name", "Identifier", "Source"].map(h => <th key={h} className="s-mono px-4 py-2.5 !text-[9px] font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {ASSETS.map(([type, name, id, src], i) => <tr key={name} className="s-rise border-b border-[var(--s-line)] last:border-0" style={{ "--i": i * 1.6 }}>
              <td className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--s-dim)]">{type}</td>
              <td className="px-4 py-2.5 font-medium">{name}</td>
              <td className="px-4 py-2.5 font-mono text-[11px] text-[var(--s-dim)]">{id}</td>
              <td className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider" style={{ color: src === "auto" ? "var(--s-cyan)" : "var(--s-faint)" }}>{src === "auto" ? "From monitor" : "Added manually"}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </Panel>
  </div>;
}

/* ── Cyber Sachet: a person, a question, an answer ── */
const OPTIONS = ["Click the link and sign in quickly", "Report it and check with IT first", "Forward it to a colleague to ask"];
export function Challenge() {
  const [ref, answered] = useAfterSeen(1800);
  return <div ref={ref} className="rounded-[22px] border border-[var(--s-line)] bg-[var(--s-panel)] p-6 md:p-7">
    <div className="flex items-center justify-between">
      <span className="s-mono" style={{ color: "var(--s-amber)" }}>Quiz · question 3 of 5</span>
      <span className="s-mono !text-[9px]">Sample question</span>
    </div>
    <p className="mt-5 text-lg font-medium leading-snug tracking-tight md:text-xl">An email says your password expires today and asks you to confirm it through a link. What do you do?</p>
    <ul className="mt-5 space-y-2">
      {OPTIONS.map((o, i) => {
        const right = answered && i === 1;
        return <li key={o} className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm" style={{ borderColor: right ? "var(--s-green)" : "var(--s-line2)", color: answered && !right ? "var(--s-faint)" : undefined, transition: "border-color 0.4s, color 0.4s" }}>
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px]" style={{ borderColor: right ? "var(--s-green)" : "var(--s-line2)", color: "var(--s-green)" }}>{right ? "✓" : ""}</span>
          {o}
        </li>;
      })}
    </ul>
    <div className="mt-5 flex items-center justify-between border-t border-[var(--s-line)] pt-4" style={{ opacity: answered ? 1 : 0.3, transition: "opacity 0.5s" }}>
      <span className="s-key" data-tone="ok">Answer<b>{answered ? "Correct" : "—"}</b></span>
      <span className="s-key">Quiz.score<b>{answered ? "3 / 3" : "2 / 2"}</b></span>
    </div>
  </div>;
}
const ROSTER = [["FN", "Finance", 3, 100, "94"], ["EN", "Engineering", 2, 67, "88"], ["SP", "Support", 3, 100, "91"], ["OP", "Operations", 1, 33, "—"]];
export function Roster() {
  return <div className="rounded-[22px] border border-[var(--s-line)] bg-[var(--s-panel)] p-5 md:p-6">
    <div className="flex items-end justify-between gap-4 border-b border-[var(--s-line)] pb-4">
      <div><p className="s-mono">Team completion</p><p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">78<span className="text-lg text-[var(--s-faint)]">%</span></p></div>
      <div className="text-right"><p className="s-mono">Average quiz score</p><p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight" style={{ color: "var(--s-amber)" }}>91</p></div>
    </div>
    <ul>
      {ROSTER.map(([ini, team, done, pct, score]) => <li key={team} className="flex items-center gap-4 border-b border-[var(--s-line)] py-3 last:border-0">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--s-line2)] text-[10px] font-semibold">{ini}</span>
        <span className="w-24 shrink-0 text-sm">{team}</span>
        <span className="min-w-0 flex-1">
          <span className="cp-bar block !h-[5px]"><i style={{ width: `${pct}%`, background: pct === 100 ? "var(--s-green)" : "var(--s-amber)" }} /></span>
          <span className="mt-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--s-faint)]">{done} / 3 courses</span>
        </span>
        <span className="w-8 text-right font-mono text-sm tabular-nums">{score}</span>
      </li>)}
    </ul>
  </div>;
}

/* ── Academy: learn → practice → assess → certify ── */
export function LearningJourney() {
  return <div>
    <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
      <Panel title="Lab · terminal">
        <div className="p-4 font-mono text-[11.5px] leading-relaxed">
          <p><span style={{ color: "var(--s-blue)" }}>$</span> systemctl status nginx</p>
          <p className="text-[var(--s-green)]">● active (running)</p>
          <p className="mt-3"><span style={{ color: "var(--s-blue)" }}>$</span> ss -ltnp | grep 443</p>
          <p className="text-[var(--s-dim)]">LISTEN 0 511 *:443</p>
          <p className="mt-3 border-t border-[var(--s-line)] pt-3 text-[var(--s-dim)]">Graded quiz <span className="float-right text-[var(--s-fg)]">18 / 20</span></p>
        </div>
      </Panel>
      <div className="s-panel relative overflow-hidden p-5">
        <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--s-blue)" }} />
        <p className="s-mono">Certificate of completion</p>
        <p className="mt-3 text-lg font-semibold tracking-tight">ITOps Foundation</p>
        <p className="mt-1 text-sm text-[var(--s-dim)]">Moonsav ITOps Academy</p>
        <p className="mt-6 flex items-center justify-between border-t border-[var(--s-line)] pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-faint)]">
          <span>ID · ITOPS-0000</span>
          <span style={{ color: "var(--s-blue)" }}>Verifiable ✓</span>
        </p>
      </div>
    </div>
  </div>;
}

/* ── generic roadmap product: what is planned, flowing toward ITOps ── */
export function PlannedFlow({ items }) {
  return <div className="rounded-2xl border border-dashed border-[var(--s-gray)] p-6">
    <Flow steps={items.slice(0, 5).map(label => ({ label }))} dir="col" tone="roadmap" live={false} className="mx-auto w-56" />
    <div className="mx-auto flex w-56 flex-col items-stretch">
      <span aria-hidden className="mx-auto h-4 w-px border-l border-dashed border-[var(--s-gray)]" />
      <span className="s-chip justify-center" data-tone="itops">ITOps</span>
    </div>
  </div>;
}
