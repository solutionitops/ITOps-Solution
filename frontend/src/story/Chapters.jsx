// Chapter 06 onward: now that the visitor has seen the problem and the control
// plane, each module is introduced as a capability of that one system —
// OBSERVE, PROTECT, RESPOND, CONTROL, EXPAND, LEARN — and the story returns to
// the environment and the single signal it opened with.
//
// Status is kept exact: DevOps, Cloud, Endpoint and Reporting are ROADMAP, as
// are SNMP hardware telemetry and phishing simulations. Everything else is LIVE.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useTransform } from "motion/react";
import { ControlPlane, ControlPlaneCompact, Fit } from "./ControlPlane";
import { Flow, InView, Kicker, Metric, Scene, Signal, Stage, Status, StoryLink, Topology, useIsMobile } from "./World";
import { setSpine, useSpineSection } from "./spine";

const SAMPLE = <p className="s-mono mt-4 !text-[9px]">Illustration · sample data</p>;

/* ── Chapter 06 — the bridge into the modules ── */

export function Bridge() {
  const ref = useSpineSection(1);
  const groups = ["Observe", "Protect", "Respond", "Control", "Expand", "Learn"];
  return <section ref={ref} id="bridge" className="relative px-6 py-[16svh] md:px-10">
    <InView className="mx-auto max-w-6xl">
      <div className="s-rise"><Kicker>Chapter 06 — The platform</Kicker></div>
      <h2 className="s-display s-rise mt-5" style={{ "--i": 1 }}>The platform grows <span className="s-soft">with your environment.</span></h2>
      <p className="s-body s-rise mt-8 max-w-xl" style={{ "--i": 2 }}>Every module is a capability of the same operational system — not a separate product to learn.</p>
      <ol className="s-rise mt-12 flex flex-wrap items-center gap-x-3 gap-y-3" style={{ "--i": 3 }}>
        {groups.map((g, i) => <li key={g} className="flex items-center gap-3">
          <span className="s-chip" data-tone="plain">{g}</span>
          {i < groups.length - 1 && <span aria-hidden className="h-px w-6 bg-[var(--s-line2)]" />}
        </li>)}
      </ol>
    </InView>
  </section>;
}

/* ── OBSERVE — website & API, network & device, Kada Nigrani ── */

function Bars({ rows }) {
  return <div className="space-y-3">
    {rows.map(([label, pct]) => <div key={label}>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-dim)]"><span>{label}</span><span className="text-[var(--s-fg)]">{pct}%</span></div>
      <div className="cp-bar mt-1.5 !h-[5px]"><i style={{ width: `${pct}%` }} /></div>
    </div>)}
  </div>;
}

const OBSERVE = [{
  n: "01",
  name: "Website & API Monitoring",
  copy: "Uptime, response time, redirect chains, and SLA history for every site and endpoint you run.",
  to: "/solutions/website-api-monitoring",
  metrics: [["99.98%", "Uptime"], ["184ms", "Response"], ["12", "Redirects"], ["99.9%", "SLA"]],
  flow: [{ label: "Request" }, { label: "DNS" }, { label: "HTTPS" }, { label: "Response" }, { label: "ITOps", tone: "itops" }],
  panel: <div className="s-panel overflow-hidden font-mono text-[11px]">
    <div className="flex items-center gap-2 border-b border-[var(--s-line)] px-3 py-2 text-[var(--s-dim)]">
      <span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" /><span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" /><span className="h-2 w-2 rounded-full bg-[var(--s-line2)]" />
      <span className="ml-2 flex-1 truncate rounded bg-[var(--s-panel2)] px-2 py-1">https://app.example.com</span>
    </div>
    <div className="space-y-1.5 p-3 leading-relaxed">
      <p><span className="text-[var(--s-faint)]">GET /</span> <span className="text-[var(--s-green)]">200 OK</span> <span className="text-[var(--s-dim)]">· 184 ms</span></p>
      <p className="text-[var(--s-dim)]">redirect  http → https → /home <span className="text-[var(--s-faint)]">(2 hops)</span></p>
      <p className="text-[var(--s-dim)]">keyword   "Sign in" <span className="text-[var(--s-green)]">found</span></p>
    </div>
  </div>
}, {
  n: "02",
  name: "Network & Device Monitoring",
  copy: "Agentless TCP-connect checks and DNS record monitoring for routers, switches, firewalls, and reachable network devices.",
  to: "/solutions/infrastructure-monitor",
  flow: [{ label: "Router" }, { label: "Firewall" }, { label: "Switch" }, { label: "Server" }],
  panel: <div className="s-panel p-3 font-mono text-[11px]">
    {[["TCP connect", "443 open · 12 ms"], ["DNS", "A record unchanged"], ["Reachability", "4 / 4 devices"]].map(([k, v]) => <div key={k} className="cp-row !py-2">
      <span className="cp-dot" />
      <span className="uppercase tracking-[0.12em]">{k}</span>
      <span className="cp-num">{v}</span>
    </div>)}
    <div className="mt-3 flex items-center justify-between gap-3 border-t border-dashed border-[var(--s-gray)] pt-3 text-[var(--s-gray)]">
      <span className="uppercase tracking-[0.12em]">SNMP hardware telemetry</span>
      <Status kind="roadmap" />
    </div>
  </div>
}, {
  n: "03",
  name: "Kada Nigrani",
  copy: "A lightweight agent streams CPU, memory, disk, and uptime from Linux servers into the same dashboard.",
  to: "/solutions/kada-nigrani",
  flow: [{ label: "Server" }, { label: "Kada Nigrani agent" }, { label: "ITOps", tone: "itops" }],
  panel: <div className="s-panel p-4">
    <div className="mb-4 flex items-center justify-between font-mono text-[10.5px] text-[var(--s-dim)]">
      <span className="flex items-center gap-2"><span className="cp-dot" />prod-web-01 · Linux</span>
      <span>uptime 18d 14h</span>
    </div>
    <Bars rows={[["CPU", 42], ["Memory", 61], ["Disk", 72]]} />
  </div>
}];

export function Observe() {
  const mobile = useIsMobile();
  return <Scene id="observe" stages={3} vh={mobile ? 50 : 52}>
    {(stage, live) => <ObserveStage stage={stage} live={live} mobile={mobile} />}
  </Scene>;
}
function ObserveStage({ stage, live, mobile }) {
  useEffect(() => { if (live) setSpine(1); }, [live]);
  return <div className="relative h-full px-6 md:px-10">
    <div className="s-grid" />
    <div className="pointer-events-none absolute inset-x-6 top-24 md:inset-x-10 md:top-28">
      <div className="mx-auto flex max-w-7xl flex-wrap items-baseline gap-x-6 gap-y-1">
        <h2 className="s-h3">See everything.</h2>
        <p className="text-sm text-[var(--s-dim)]">Know what is happening before your users tell you.</p>
      </div>
    </div>
    {OBSERVE.map((m, i) => <Stage key={m.n} on={stage === i} className="px-6 md:px-10">
      <div className="mx-auto grid h-full max-w-7xl content-center gap-8 pt-36 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:pt-16">
        <div>
          <Kicker>Observe · {m.n} / 03</Kicker>
          <h3 className="s-h2 mt-4 !text-[clamp(1.8rem,3.6vw,3.25rem)]">{m.name}</h3>
          <p className="s-body mt-4 max-w-md">{m.copy}</p>
          <div className="mt-6 flex items-center gap-6">
            <Status kind="live" />
            <StoryLink to={m.to}>View solution</StoryLink>
          </div>
        </div>
        <div className="min-w-0">
          <Flow steps={m.flow} dir={mobile ? "col" : "row"} live={live && stage === i} className={mobile ? "hidden" : ""} />
          {mobile && <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--s-dim)]">{m.flow.map(f => f.label).join("  →  ")}</p>}
          <div className="mt-5 md:mt-8">{m.panel}</div>
          {m.metrics && <div className="mt-5 grid grid-cols-4 gap-3 md:mt-8">{m.metrics.map(([v, l]) => <Metric key={l} value={v} label={l} />)}</div>}
          {SAMPLE}
        </div>
      </div>
    </Stage>)}
  </div>;
}

/* ── PROTECT — security monitoring ── */

export function Protect() {
  const ref = useSpineSection(1);
  const R = 30, C = 2 * Math.PI * R;
  return <section ref={ref} id="protect" className="relative px-6 py-[16svh] md:px-10">
    <InView className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-20">
      {seen => <>
        <div>
          <div className="s-rise"><Kicker tone="var(--s-violet)">Protect</Kicker></div>
          <h2 className="s-display s-rise mt-5 !text-[clamp(2.4rem,6vw,5.5rem)]" style={{ "--i": 1 }}>See what others <span style={{ color: "var(--s-violet)" }}>don't.</span></h2>
          <h3 className="s-h3 s-rise mt-10" style={{ "--i": 2 }}>Security Monitoring</h3>
          <p className="s-body s-rise mt-3 max-w-md" style={{ "--i": 3 }}>SSL certificate expiry, security headers, cookie flags, and a real security score per endpoint.</p>
          <div className="s-rise mt-6 flex items-center gap-6" style={{ "--i": 4 }}>
            <Status kind="live" />
            <StoryLink to="/solutions/security-monitoring">View solution</StoryLink>
          </div>
        </div>
        {/* the same infrastructure, now with a security layer drawn around it */}
        <div className="s-rise relative" style={{ "--i": 2 }}>
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[26px] border border-dashed" style={{ borderColor: "var(--s-violet)", opacity: seen ? 1 : 0, transform: seen ? "none" : "scale(1.06)", transition: "opacity 1s var(--s-ease) 0.4s, transform 1.2s var(--s-ease) 0.4s" }} />
          <div className="grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:p-9">
            <Flow steps={[{ label: "Website" }, { label: "Firewall" }, { label: "Server" }]} dir="col" live={seen} className="mx-auto w-40" />
            <div>
              <div className="flex items-center gap-5">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden>
                    <circle cx="36" cy="36" r={R} fill="none" stroke="var(--s-line)" strokeWidth="6" />
                    <circle cx="36" cy="36" r={R} fill="none" stroke="var(--s-violet)" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: seen ? C * 0.08 : C, transition: "stroke-dashoffset 1.4s var(--s-ease) 0.5s" }} />
                  </svg>
                  <span className="absolute inset-0 grid place-items-center text-xl font-semibold tabular-nums">92</span>
                </div>
                <div>
                  <p className="s-mono">Security score</p>
                  <p className="mt-1 text-sm text-[var(--s-dim)]">app.example.com</p>
                </div>
              </div>
              <div className="mt-5 font-mono text-[11px]">
                {[["SSL", "Valid"], ["Headers", "8 / 10"], ["Cookies", "Secure"], ["Score", "92"]].map(([k, v]) => <div key={k} className="cp-row !py-2.5">
                  <span className="cp-dot" style={{ background: "var(--s-violet)" }} />
                  <span className="uppercase tracking-[0.14em]">{k}</span>
                  <span className="cp-num !text-[11px] uppercase text-[var(--s-fg)]">{v}</span>
                </div>)}
              </div>
            </div>
          </div>
          <p className="s-mono absolute -bottom-7 right-2 !text-[9px]">Illustration · sample data</p>
        </div>
      </>}
    </InView>
  </section>;
}

/* ── HUMAN SECURITY — Cyber Sachet (deliberately not a monitoring visual) ── */

const ROSTER = [["FN", "Finance", 3, 100, "94"], ["EN", "Engineering", 2, 67, "88"], ["SP", "Support", 3, 100, "91"], ["OP", "Operations", 1, 33, "—"]];

export function Human() {
  const ref = useSpineSection(1);
  return <section ref={ref} id="human" className="relative border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-[16svh] md:px-10">
    <InView className="mx-auto max-w-7xl">
      <div className="s-rise"><Kicker tone="var(--s-amber)">Human security</Kicker></div>
      <h2 className="s-display s-rise mt-5" style={{ "--i": 1 }}>IT security <span className="s-soft">is also human.</span></h2>
      <div className="mt-14 grid items-start gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
        <div className="s-rise" style={{ "--i": 2 }}>
          <p className="s-mono">Security awareness</p>
          <h3 className="s-h3 mt-3">Cyber Sachet</h3>
          <p className="s-body mt-3 max-w-md">Structured security courses and quizzes for licensed organizations, tracking completion and scores per employee.</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["Courses", "Quizzes", "Completion", "Scores"].map(t => <li key={t} className="s-chip" style={{ "--chip": "var(--s-amber)" }}>{t}</li>)}
          </ul>
          <div className="mt-7 space-y-2.5">
            <p className="flex items-center gap-4"><Status kind="live">Live today</Status></p>
            <p className="flex items-center gap-4"><Status kind="next">Next</Status><span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--s-gray)]">Phishing simulations</span></p>
          </div>
          <div className="mt-7"><StoryLink to="/cybersachet">View solution</StoryLink></div>
        </div>
        <div className="s-rise" style={{ "--i": 3 }}>
          <div className="rounded-[22px] border border-[var(--s-line)] bg-[var(--s-panel)] p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--s-line)] pb-5">
              <div>
                <p className="s-mono">Team completion</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">78<span className="text-xl text-[var(--s-faint)]">%</span></p>
              </div>
              <div className="text-right">
                <p className="s-mono">Average quiz score</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums" style={{ color: "var(--s-amber)" }}>91</p>
              </div>
            </div>
            <ul>
              {ROSTER.map(([ini, team, done, pct, score]) => <li key={team} className="flex items-center gap-4 border-b border-[var(--s-line)] py-3.5 last:border-0">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--s-line2)] text-[11px] font-semibold">{ini}</span>
                <span className="w-24 shrink-0 text-sm">{team}</span>
                <span className="min-w-0 flex-1">
                  <span className="cp-bar block !h-[5px]"><i style={{ width: `${pct}%`, background: pct === 100 ? "var(--s-green)" : "var(--s-amber)" }} /></span>
                  <span className="mt-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--s-faint)]">{done} / 3 courses</span>
                </span>
                <span className="w-10 text-right font-mono text-sm tabular-nums">{score}</span>
              </li>)}
            </ul>
          </div>
          {SAMPLE}
        </div>
      </div>
    </InView>
  </section>;
}

/* ── RESPOND — something breaks, the incident, the alert ── */

const LIFECYCLE = [["10:31", "Monitor failed", "warn"], ["10:32", "Incident created", "warn"], ["10:33", "Alert sent", "info"], ["10:37", "Service recovered", "ok"], ["10:37", "Incident resolved", "ok"]];

function AlertFan({ live }) {
  const targets = [["Slack", 46], ["Email", 150], ["Webhook", 254]];
  return <svg viewBox="0 0 460 300" className="s-topo w-full" data-connect="1" data-live={live ? "1" : "0"} role="img" aria-label="One incident routed to Slack, email and a webhook">
    {targets.map(([label, y], i) => {
      const d = `M150 150C230 150 230 ${y} 310 ${y}`;
      return <g key={label}>
        <path pathLength="1" className="s-conv" style={{ "--i": i, stroke: "var(--s-amber)" }} d={d} />
        <path pathLength="1" className="s-pkt conv" style={{ "--d": `${1.6 + i * 0.25}s`, "--dl": `${-i * 0.5}s`, stroke: "var(--s-amber)" }} d={d} />
        <g className="s-node" data-on="1">
          <rect x="310" y={y - 21} width="140" height="42" rx="9" />
          <circle className="dot" cx="324" cy={y - 5} r="2.6" style={{ fill: "var(--s-green)" }} />
          <text className="lbl" x="334" y={y - 2}>{label}</text>
          <text className="sig" x="334" y={y + 11} style={{ opacity: 1 }}>Delivered</text>
        </g>
      </g>;
    })}
    <g className="s-node" data-on="1" data-state="fail">
      <rect x="10" y="129" width="140" height="42" rx="9" />
      <circle className="dot" cx="24" cy="145" r="2.6" />
      <text className="lbl" x="34" y="148">Incident</text>
      <text className="sig" x="34" y="161" style={{ opacity: 1 }}>#2481 · Open</text>
    </g>
  </svg>;
}

export function Respond() {
  const mobile = useIsMobile();
  return <Scene id="respond" stages={4} vh={mobile ? 46 : 50}>
    {(stage, live) => <RespondStage stage={stage} live={live} />}
  </Scene>;
}
function RespondStage({ stage, live }) {
  useEffect(() => { if (live) setSpine(stage < 2 ? 2 : 3); }, [stage, live]);
  const world = stage < 2;
  return <div className="relative h-full">
    <div className="s-grid" />
    <div className="mx-auto grid h-full max-w-7xl grid-rows-[auto_minmax(0,1fr)] gap-4 px-6 pb-6 pt-24 md:grid-cols-[0.9fr_1.1fr] md:grid-rows-1 md:gap-12 md:px-10 md:pb-0 md:pt-0">
      <div className="relative h-[30svh] md:h-full">
        <div className="relative h-full md:flex md:items-center">
          <div className="relative h-full w-full md:h-[52%]">
            <Stage on={stage === 0}>
              <Kicker>Respond</Kicker>
              <h2 className="s-h2 mt-4">Everything is healthy.</h2>
              <p className="s-mono mt-6" style={{ color: "var(--s-green)" }}>All signals nominal</p>
            </Stage>
            <Stage on={stage === 1}>
              <Kicker tone="var(--s-amber)">10:31 · monitor.status = failed</Kicker>
              <h2 className="s-h2 mt-4">Then something <span style={{ color: "var(--s-amber)" }}>breaks.</span></h2>
              <p className="s-body mt-5 max-w-sm">One signal changes. The website stops answering.</p>
            </Stage>
            <Stage on={stage === 2}>
              <Kicker>Incident management</Kicker>
              <h2 className="s-h2 mt-4 !text-[clamp(1.9rem,4.4vw,3.75rem)]">Detect. Notify. <span className="s-soft">Respond. Recover.</span></h2>
              <p className="s-body mt-5 max-w-md">The failed signal becomes an incident with its cause attached — and closes itself when the service recovers.</p>
              <div className="mt-6 flex items-center gap-6"><Status kind="live" /><StoryLink to="/solutions/alerting-incident-response">View solution</StoryLink></div>
            </Stage>
            <Stage on={stage === 3}>
              <Kicker>Multi-channel alerting</Kicker>
              <h2 className="s-h2 mt-4 !text-[clamp(1.9rem,4.4vw,3.75rem)]">One incident. <span className="s-soft">Every channel.</span></h2>
              <p className="s-body mt-5 max-w-md">Configure alerting once per organization and route operational events to the channels your teams already use.</p>
              <div className="mt-6 flex items-center gap-6"><Status kind="live" /><StoryLink to="/solutions/alerting-incident-response">View solution</StoryLink></div>
            </Stage>
          </div>
        </div>
      </div>

      <div className="relative min-h-0">
        {/* the environment, healthy — then one signal changes */}
        <div className="s-fade absolute inset-0 md:inset-y-24" data-on={world ? "1" : "0"}>
          <Topology layout="mobile" reveal={8} signals live={live && world} quiet={stage === 1} fail={stage === 1 ? "website" : null} failSig="HTTP 503 · Error" label="The environment: every system healthy, then the website fails" />
        </div>
        {/* the incident lifecycle */}
        <div className="s-fade absolute inset-0 grid content-center" data-on={stage === 2 ? "1" : "0"} aria-hidden={stage === 2 ? undefined : true}>
          <ol className="mx-auto w-full max-w-md" data-on={stage === 2 ? "1" : "0"}>
            {LIFECYCLE.map(([t, label, tone], i) => <li key={label} className="s-rise relative flex items-center gap-5 pb-8 last:pb-0" style={{ "--i": i * 2 }}>
              {i < LIFECYCLE.length - 1 && <span aria-hidden className="absolute left-[73px] top-6 h-full w-px bg-[var(--s-line2)]" />}
              <span className="w-12 font-mono text-sm tabular-nums text-[var(--s-dim)] md:text-base">{t}</span>
              <span className="cp-dot relative !h-3 !w-3 ring-4 ring-[var(--s-bg)]" data-t={tone} />
              <span className="font-mono text-sm uppercase tracking-[0.16em] md:text-lg">{label}</span>
            </li>)}
          </ol>
        </div>
        {/* one incident, every channel */}
        <div className="s-fade absolute inset-0 grid content-center" data-on={stage === 3 ? "1" : "0"} aria-hidden={stage === 3 ? undefined : true}>
          <div className="mx-auto w-full max-w-lg"><AlertFan live={live && stage === 3} /></div>
        </div>
      </div>
    </div>
  </div>;
}

/* ── CONTROL — asset inventory, then the control plane with context ── */

const ASSET_CHIPS = [["Website", -90, -30, -8], ["Server", 60, -70, 6], ["Router", -40, 50, 10], ["Firewall", 110, 30, -5], ["Application", -120, 20, 4], ["Endpoint", 30, 80, -9], ["Website", 90, -40, 7], ["Server", -70, -60, -4], ["Switch", 20, -20, 12], ["Application", -20, 70, -7], ["Website", 130, -10, 3], ["Server", -100, 60, 8]];
const CONTEXT_ORDER = ["monitors", "network", "incidents", "alerts", "servers", "security", "assets"];
const LIT_ONE = CONTEXT_ORDER.map(k => [k]);

export function Control() {
  const mobile = useIsMobile();
  return <Scene id="control" stages={3} vh={mobile ? 48 : 54}>
    {(stage, live) => <ControlStage stage={stage} live={live} mobile={mobile} />}
  </Scene>;
}
function ControlStage({ stage, live, mobile }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => { if (live) setSpine(4); }, [live]);
  // in the "context" stage the panels light up one module at a time, then all together
  useEffect(() => {
    if (stage !== 2 || !live || reduce) return undefined;
    const id = setInterval(() => setStep(s => Math.min(s + 1, CONTEXT_ORDER.length)), 1100);
    return () => clearInterval(id);
  }, [stage, live, reduce]);
  useEffect(() => { if (stage !== 2) setStep(0); }, [stage]);
  const allLit = reduce || step >= CONTEXT_ORDER.length;
  const organized = stage >= 1;

  return <div className="relative h-full">
    <div className="s-grid" />
    {/* assets */}
    <div className="s-fade absolute inset-0" data-on={stage < 2 ? "1" : "0"} aria-hidden={stage < 2 ? undefined : true}>
      <div className="mx-auto grid h-full max-w-7xl content-center gap-10 px-6 pt-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-10 md:pt-0">
        <div className="relative min-h-[240px]">
          <Stage on={stage === 0}>
            <Kicker>Control · asset inventory</Kicker>
            <h2 className="s-h2 mt-4">You can't operate <span className="s-soft">what you can't see.</span></h2>
          </Stage>
          <Stage on={stage === 1}>
            <Kicker>Control · asset inventory</Kicker>
            <h2 className="s-h2 mt-4"><span className="tabular-nums">247</span> assets. <span className="s-soft">One inventory.</span></h2>
            <p className="s-body mt-5 max-w-md">Every monitored website becomes an asset automatically; servers and other infrastructure can be tracked manually today.</p>
            <div className="mt-6 flex items-center gap-6"><Status kind="live" /><StoryLink to="/solutions">View live modules</StoryLink></div>
          </Stage>
        </div>
        <ul className="grid grid-cols-3 gap-2.5 self-center md:gap-3" aria-label="Assets being organized into one inventory">
          {ASSET_CHIPS.map(([label, x, y, r], i) => <li key={i} className="s-chip justify-start !text-[9.5px] md:!text-[10.5px]" data-tone="plain" style={{ transform: organized ? "none" : `translate(${x * (mobile ? 0.3 : 1)}px, ${y * (mobile ? 0.5 : 1)}px) rotate(${r}deg)`, opacity: organized ? 1 : 0.55, transition: `transform 0.9s var(--s-ease) ${i * 40}ms, opacity 0.6s ${i * 40}ms`, "--chip": organized ? "var(--s-green)" : "var(--s-faint)" }}>{label}</li>)}
        </ul>
      </div>
    </div>
    {/* the control plane returns — and now each panel has a source */}
    <div className="s-fade absolute inset-0 flex flex-col items-center px-4 pb-6 pt-24 md:px-10 md:pt-28" data-on={stage === 2 ? "1" : "0"} aria-hidden={stage === 2 ? undefined : true}>
      <div className="text-center">
        <Kicker>The organization sees everything</Kicker>
        <h2 className="s-h2 mt-3">Now the environment <span className="s-accent">has context.</span></h2>
      </div>
      <div className="relative mt-6 w-full max-w-[1120px] md:mt-8">
        {mobile ? <>
          <ControlPlaneCompact />
          <p className="mt-4 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-[var(--s-dim)]">Monitors · Incidents · Assets · Security · Network · Servers · Alerts</p>
        </> : <Fit w={1120} h={548} maxH="calc(100svh - 300px)">
          <ControlPlane context={!allLit} lit={allLit ? "all" : LIT_ONE[step]} />
        </Fit>}
        <p className="s-mono mt-3 text-center !text-[9px]">Illustration · sample data</p>
      </div>
    </div>
  </div>;
}

/* ── EXPAND — the roadmap as a horizon, not four cards ── */

const HORIZON = [{
  name: "DevOps Monitoring",
  copy: "Bring Docker, Kubernetes, CI/CD, Terraform, and application deployments into the same operational context.",
  to: "/solutions/devops-monitor",
  flow: ["GitHub / CI", "Build", "Container", "Kubernetes", "Deployment"]
}, {
  name: "Cloud Monitoring",
  copy: "Extend infrastructure visibility into cloud resource health alongside the rest of your environment.",
  flow: ["AWS", "Azure", "GCP", "Resource health"]
}, {
  name: "Endpoint Monitoring",
  copy: "Extend operational visibility to employee endpoints and workstation security posture.",
  flow: ["Laptop", "Desktop", "Server"],
  tags: ["Patch", "Firewall", "Encryption"]
}, {
  name: "Reporting & Analytics",
  copy: "Scheduled uptime, incident, and compliance reports across your organization.",
  flow: ["Uptime", "Incidents", "Security", "Compliance"]
}];

function HorizonPanel({ item, index, wide }) {
  const flow = <div className="rounded-2xl border border-dashed border-[var(--s-gray)] p-4">
    <Flow steps={item.flow.map(label => ({ label }))} dir="col" tone="roadmap" live={false} className="mx-auto w-44" />
    {item.tags && <div className="mt-3 flex flex-wrap justify-center gap-1.5">{item.tags.map(t => <span key={t} className="s-chip !px-2.5 !py-1.5 !text-[9px]" data-tone="roadmap">{t}</span>)}</div>}
    <div className="mx-auto flex w-44 flex-col items-stretch">
      <span aria-hidden className="mx-auto h-4 w-px border-l border-dashed border-[var(--s-gray)]" />
      <span className="s-chip justify-center" data-tone="itops">ITOps</span>
    </div>
  </div>;
  const compact = <div className="rounded-2xl border border-dashed border-[var(--s-gray)] p-4">
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {[...item.flow, ...(item.tags ?? [])].map(label => <span key={label} className="s-chip !px-2.5 !py-1.5 !text-[9px]" data-tone="roadmap">{label}</span>)}
      <span aria-hidden className="text-[var(--s-gray)]">→</span>
      <span className="s-chip !px-2.5 !py-1.5 !text-[9px]" data-tone="itops">ITOps</span>
    </div>
  </div>;
  return <article className={wide ? "w-[620px] shrink-0" : "w-full"}>
    <div className="flex items-center gap-4">
      <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--s-gray)]">0{index + 1}</span>
      <span aria-hidden className="h-px flex-1 border-t border-dashed border-[var(--s-gray)]" />
      <Status kind="roadmap" />
    </div>
    <div className={wide ? "mt-6 grid grid-cols-[1fr_224px] items-start gap-8" : "mt-6"}>
      <div>
        <h3 className="s-h3">{item.name}</h3>
        <p className="s-body mt-3">{item.copy}</p>
        {item.to && <div className="mt-6"><StoryLink to={item.to}>See the plan</StoryLink></div>}
      </div>
      <div className={wide ? "" : "mt-6"}>{wide ? flow : compact}</div>
    </div>
  </article>;
}
function HorizonHeader() {
  return <div>
    <Kicker>Expand</Kicker>
    <h2 className="s-h2 mt-4">And the infrastructure <span className="s-soft">keeps growing.</span></h2>
    <p className="s-body mt-4 max-w-lg">Four future layers, connected to the same control plane. They are on the roadmap — not available yet.</p>
  </div>;
}

export function Expand() {
  const mobile = useIsMobile();
  const spineRef = useSpineSection(4);
  if (mobile) {
    return <section ref={spineRef} id="expand" className="px-6 py-[12svh]">
      <HorizonHeader />
      <div className="mt-10 space-y-12">{HORIZON.map((h, i) => <HorizonPanel key={h.name} item={h} index={i} />)}</div>
    </section>;
  }
  return <Scene id="expand" stages={3} vh={46}>
    {(stage, live, progress) => <ExpandTrack progress={progress} live={live} />}
  </Scene>;
}
function ExpandTrack({ progress, live }) {
  const track = useRef(null);
  const [shift, setShift] = useState(0);
  useEffect(() => { if (live) setSpine(4); }, [live]);
  useEffect(() => {
    const measure = () => track.current && setShift(Math.max(0, track.current.scrollWidth - window.innerWidth + 80));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const x = useTransform(progress, [0.05, 0.95], [0, -shift]);
  return <div className="relative flex h-full flex-col pt-28">
    <div className="s-grid" />
    <div className="relative px-10"><HorizonHeader /></div>
    {/* the horizon: the control plane's edge, extending right */}
    <div className="relative mt-8 flex items-center gap-4 px-10">
      <span className="s-chip" data-tone="itops">ITOps control plane</span>
      <span aria-hidden className="h-px flex-1 bg-[var(--s-line2)]" />
      <span className="s-mono !text-[9.5px]">Horizon →</span>
    </div>
    <motion.div ref={track} className="s-track relative mt-8 px-10" style={{ x }}>
      {HORIZON.map((h, i) => <HorizonPanel key={h.name} item={h} index={i} wide />)}
    </motion.div>
  </div>;
}

/* ── LEARN — Moonsav ITOps Academy (technical learning, distinct from Cyber Sachet) ── */

export function Learn() {
  const ref = useSpineSection(4);
  return <section ref={ref} id="learn" className="relative px-6 py-[16svh] md:px-10">
    <InView className="mx-auto max-w-7xl">
      {(seen, live) => <>
        <div className="s-rise"><Kicker tone="var(--s-blue)">Learn</Kicker></div>
        <h2 className="s-display s-rise mt-5" style={{ "--i": 1 }}>Operate. <span style={{ color: "var(--s-blue)" }}>Learn.</span> <span className="s-soft">Improve.</span></h2>
        <div className="mt-14 grid items-start gap-12 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
          <div className="s-rise" style={{ "--i": 2 }}>
            <p className="s-mono">Technical learning</p>
            <h3 className="s-h3 mt-3">Moonsav ITOps Academy</h3>
            <p className="s-body mt-3 max-w-md">Cloud, DevOps, and Infrastructure courses with real graded quizzes and verifiable certificates.</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {["Cloud", "DevOps", "Infrastructure"].map(t => <li key={t} className="s-chip" style={{ "--chip": "var(--s-blue)" }}>{t}</li>)}
            </ul>
            <div className="mt-7 flex items-center gap-6"><Status kind="live" /><StoryLink to="/academy">View solution</StoryLink></div>
          </div>
          <div className="s-rise" style={{ "--i": 3 }}>
            <Flow steps={[{ label: "Learn" }, { label: "Practice" }, { label: "Assess" }, { label: "Certify", tone: "itops" }]} dir="row" live={live} className="hidden sm:flex" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-dim)] sm:hidden">Learn  →  Practice  →  Assess  →  Certify</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
              <div className="s-panel p-4 font-mono text-[11px] leading-relaxed">
                <p className="text-[var(--s-faint)]"># lab · linux fundamentals</p>
                <p className="mt-2"><span style={{ color: "var(--s-blue)" }}>$</span> systemctl status nginx</p>
                <p className="text-[var(--s-green)]">● active (running)</p>
                <p className="mt-3 border-t border-[var(--s-line)] pt-3 text-[var(--s-dim)]">Graded quiz <span className="float-right text-[var(--s-fg)]">18 / 20</span></p>
              </div>
              <div className="s-panel relative overflow-hidden p-5">
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--s-blue)" }} />
                <p className="s-mono">Certificate of completion</p>
                <p className="mt-3 text-lg font-semibold tracking-tight">Infrastructure fundamentals</p>
                <p className="mt-1 text-sm text-[var(--s-dim)]">Moonsav ITOps Academy</p>
                <p className="mt-5 flex items-center justify-between border-t border-[var(--s-line)] pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-faint)]">
                  <span>ID · ITOPS-0000</span>
                  <span style={{ color: "var(--s-blue)" }}>Verifiable ✓</span>
                </p>
              </div>
            </div>
            {SAMPLE}
          </div>
        </div>
      </>}
    </InView>
  </section>;
}

/* ── THE RETURN — the opening environment, the same signal, one system ── */

export function Finale() {
  const mobile = useIsMobile();
  return <Scene id="finale" stages={5} vh={mobile ? 44 : 46}>
    {(stage, live) => <FinaleStage stage={stage} live={live} mobile={mobile} />}
  </Scene>;
}
function FinaleStage({ stage, live, mobile }) {
  useEffect(() => { if (live) setSpine(5); }, [live]);
  const world = stage <= 1;
  const consoleOn = stage === 2 || stage === 3;
  const lines = [null, null, ["From every signal", "to one system."], ["From every incident", "to one response."]];
  return <div className="relative h-full">
    <div className="s-grid" />
    {/* the environment returns, complete */}
    <div className={`s-fade absolute ${mobile ? "inset-x-3 bottom-3 top-[30%]" : "bottom-8 left-1/2 top-56 w-[60%] -translate-x-1/2"}`} data-on={world ? "1" : "0"}>
      <Topology layout={mobile ? "mobile" : "desktop"} reveal={8} signals live={live && world} quiet={stage === 1} connect={stage >= 1} hub={stage >= 1} label="The whole environment again, every system connected to ITOps" />
    </div>
    <div className="pointer-events-none absolute inset-x-6 top-24 md:top-28">
      <div className="relative mx-auto h-40 max-w-6xl text-center">
        <Stage on={stage === 0}>
          <Kicker>The return</Kicker>
          <p className="s-h3 mt-4">Website. Server. Network. Security. <span className="s-soft">Application. Cloud. Endpoint. People.</span></p>
        </Stage>
        <Stage on={stage === 1}>
          <Kicker>The return</Kicker>
          <p className="s-h3 mt-4">Every signal, <span className="s-accent">one place.</span></p>
        </Stage>
        {lines.map((l, i) => l && <Stage key={i} on={stage === i}>
          <p className="s-h2">{l[0]} <span className="s-accent s-rise inline-block" style={{ "--i": 6 }}>{l[1]}</span></p>
        </Stage>)}
      </div>
    </div>
    {/* the same control plane as before */}
    <div className="s-fade absolute inset-x-4 bottom-6 top-[27%] flex items-start justify-center md:inset-x-10 md:top-[38%]" data-on={consoleOn ? "1" : "0"} aria-hidden>
      <div className="w-full max-w-[980px]">
        {mobile ? <ControlPlaneCompact /> : <Fit w={1120} h={548} maxH="calc(62svh - 60px)"><ControlPlane /></Fit>}
      </div>
    </div>
    {/* the final statement — and the signal the page began with */}
    <Stage on={stage === 4} className="grid place-items-center px-6">
      <div className="max-w-5xl text-center">
        <Signal />
        <h2 className="s-display mt-8">One IT operations <span className="s-accent">platform.</span></h2>
        <p className="s-body mx-auto mt-7 max-w-lg">Everything connected. Everything visible. One place to operate.</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/solutions" className="s-btn" data-kind="primary">View live modules <span aria-hidden>→</span></Link>
          <Link to="/pricing" className="s-btn" data-kind="ghost">See plans <span aria-hidden>→</span></Link>
        </div>
        <p className="s-mono mt-14">Every signal has a story. ITOps brings it together.</p>
      </div>
    </Stage>
  </div>;
}
