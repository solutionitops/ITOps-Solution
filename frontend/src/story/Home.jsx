// Home: the journey of a signal. One signal appears, travels through a website
// request, a server, a network, a security check and an incident, scatters
// across disconnected tools, and arrives in one operational view.
// (The Platform page tells the deeper story — a whole environment converging.)
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { ControlPlane, ControlPlaneCompact, Fit } from "./ControlPlane";
import { Key } from "./Shell";
import { InView, Kicker, Scene, Signal, Stage, Status, useIsMobile } from "./World";

/* ── the rail a signal travels along ── */

const STATIONS = [
  ["Website request", "WEBSITE.REQUEST", "GET / → 200 · 184 ms", "var(--s-green)"],
  ["Server response", "SERVER.RESPONSE", "web-01 · CPU 42%", "var(--s-green)"],
  ["Network packet", "NETWORK.PACKET", "TCP 443 · 12 ms", "var(--s-green)"],
  ["Security check", "SECURITY.CHECK", "TLS valid · score 92", "var(--s-violet)"],
  ["Incident signal", "INCIDENT.OPEN", "checkout-service · 503", "var(--s-amber)"]
];

function Station({ title, k, v, tone, i, flip, mobile }) {
  const text = <div className={mobile ? "" : `flex h-[84px] flex-col ${flip ? "justify-start pt-4" : "justify-end pb-4"}`}>
    <p className="text-sm font-medium md:text-[15px]">{title}</p>
    <p className="s-key mt-1 !text-[9px]">{k}</p>
    <p className="mt-1 font-mono text-[10.5px] text-[var(--s-dim)]">{v}</p>
  </div>;
  if (mobile) {
    return <li className="s-rise relative flex gap-5 pb-5" style={{ "--i": i * 2, "--tone": tone }}>
      <span className="sj-dot relative z-[1] mt-0.5" />
      {text}
    </li>;
  }
  return <li className="s-rise flex flex-col items-center text-center" style={{ "--i": i * 2.4, "--tone": tone }}>
    {flip ? <span className="h-[84px]" /> : text}
    <span className="sj-dot relative z-[1]" />
    {flip ? text : <span className="h-[84px]" />}
  </li>;
}

/** The journey: stations appear one after another; a packet keeps travelling the rail. */
function SignalJourney({ on, arrived, live, mobile }) {
  const end = <li className="s-rise flex items-center gap-5 md:flex-col md:gap-0 md:text-center" style={{ "--i": STATIONS.length * 2.4, "--tone": "var(--s-cyan)" }}>
    {!mobile && <span className="h-[84px]" />}
    <span className="sj-dot relative z-[1]" style={arrived ? { background: "var(--s-cyan)" } : undefined} />
    <div className={mobile ? "" : "flex h-[84px] flex-col justify-start pt-4"}>
      <p className="text-sm font-semibold md:text-[15px]" style={{ color: "var(--s-cyan)" }}>ITOps</p>
      <p className="s-key mt-1 !text-[9px]">One operational view</p>
    </div>
  </li>;
  return <div className="sj mx-auto w-full max-w-6xl" data-dir={mobile ? "col" : "row"} data-end="station" data-on={on ? "1" : "0"} data-live={live ? "1" : "0"} role="img" aria-label="A signal travels from a website request, through a server response, a network packet and a security check, to an incident — and into ITOps">
    <span className="sj-rail" />
    <span className="sj-pkt" />
    <ol className={mobile ? "relative" : "relative grid grid-cols-6"} data-on={on ? "1" : "0"}>
      {STATIONS.map(([title, k, v, tone], i) => <Station key={k} title={title} k={k} v={v} tone={tone} i={i} flip={i % 2 === 1} mobile={mobile} />)}
      {end}
    </ol>
  </div>;
}

/* ── opening ── */

export function HomeOpening() {
  const mobile = useIsMobile();
  return <Scene id="top" stages={5} vh={mobile ? 40 : 42}>
    {(stage, live) => <div className="relative h-full">
      <div className="s-grid" />
      <Stage on={stage === 0} className="grid place-items-center">
        <Signal />
      </Stage>
      <Stage on={stage === 1} className="grid place-items-center px-6">
        <p className="s-display max-w-5xl text-center">Your IT environment <span className="s-soft">never stops moving.</span></p>
      </Stage>
      <Stage on={stage === 2} className="grid place-items-center px-6">
        <div className="text-center">
          <h1 className="s-display">ITOps helps you <span className="s-accent">see it.</span></h1>
          <p className="mt-8 flex items-center justify-center gap-3 text-[var(--s-dim)]"><Signal /> <span className="s-mono !text-[10.5px]">Follow one signal</span></p>
        </div>
      </Stage>

      {/* the journey, then the destination */}
      <div className="pointer-events-none absolute inset-x-6 top-24 md:inset-x-10 md:top-[17svh]">
        <div className="relative mx-auto h-44 max-w-5xl text-center md:h-56">
          <Stage on={stage === 3}>
            <Kicker>A signal's journey</Kicker>
            <p className="s-h3 mx-auto mt-4 max-w-3xl">A request arrives. A server answers. A packet moves. A certificate is checked. <span style={{ color: "var(--s-amber)" }}>Then something fails.</span></p>
          </Stage>
          <Stage on={stage === 4}>
            <h2 className="s-display !text-[clamp(2.2rem,6vw,5.25rem)]">One place <span className="s-accent">to operate.</span></h2>
            <div className="pointer-events-auto mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/platform" className="s-btn" data-kind="primary">Explore the platform <span aria-hidden>→</span></Link>
              <a href="#signals" className="s-btn" data-kind="ghost">See how it works <span aria-hidden>→</span></a>
            </div>
          </Stage>
        </div>
      </div>
      <div className="s-fade absolute inset-x-6 bottom-[6svh] md:inset-x-10 md:bottom-[19svh]" data-on={stage >= 3 ? "1" : "0"}>
        <SignalJourney on={stage >= 3} arrived={stage === 4} live={live && stage >= 3} mobile={mobile} />
      </div>
      <p className="s-mono s-fade absolute bottom-6 left-1/2 -translate-x-1/2 !text-[9.5px]" data-on={stage === 0 ? "1" : "0"}>Scroll to begin ↓</p>
    </div>}
  </Scene>;
}

/* ── chapter 2: everything generates a signal ── */

const EMITTERS = [
  ["Website", ["Uptime", "Latency", "Requests"]],
  ["Server", ["CPU", "Memory", "Disk", "Uptime"]],
  ["Network", ["Connectivity", "DNS", "TCP", "Traffic"]],
  ["Security", ["SSL", "Headers", "Cookies", "Risk"]],
  ["Application", ["Errors", "Deployments", "Performance"]],
  ["Cloud", ["Resource health"]],
  ["Endpoint", ["Patch", "Firewall", "Encryption"]],
  ["People", ["Awareness", "Risk", "Action"]]
];
function wave(seed) {
  let d = "";
  for (let i = 0; i <= 16; i += 1) {
    const y = 18 + 8 * Math.sin(i * 0.9 + seed * 1.7) + 4.5 * Math.sin(i * 2.1 + seed);
    d += `${i === 0 ? "M" : "L"}${i * 10} ${y.toFixed(1)}`;
  }
  return d;
}

export function HomeSignals() {
  return <section id="signals" className="relative px-6 py-[14svh] md:px-10">
    <InView className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20" amount={0.15}>
      {(seen, live) => <>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="s-rise"><Kicker>Chapter 02 — The signal</Kicker></div>
          <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>Everything generates a signal.</h2>
          <p className="s-body s-rise mt-5 max-w-sm" style={{ "--i": 2 }}>Every part of your environment is reporting, all the time. The signals are already there.</p>
        </div>
        <ul>
          {EMITTERS.map(([name, keys], i) => <li key={name} className="s-rise s-row grid-cols-[1fr_auto] md:grid-cols-[150px_1fr_170px] md:items-center" style={{ "--i": i + 2 }}>
            <p className="text-lg font-medium tracking-tight md:text-xl">{name}</p>
            <p className="col-span-2 flex flex-wrap gap-x-5 gap-y-1.5 md:col-span-1">
              {keys.map(k => <Key key={k} k={`${name}.${k}`.replace(/\s+/g, "_")} />)}
            </p>
            <svg viewBox="0 0 160 36" className="s-topo col-start-2 row-start-1 h-9 w-[120px] md:col-start-3 md:w-[170px]" data-signals="1" data-live={live ? "1" : "0"} aria-hidden>
              <path className="s-edge" data-on="1" d={wave(i)} />
              <path pathLength="1" className="s-pkt" data-on="1" style={{ "--d": `${2.4 + (i % 4) * 0.5}s`, "--dl": `${-i * 0.6}s` }} d={wave(i)} />
            </svg>
          </li>)}
        </ul>
      </>}
    </InView>
  </section>;
}

/* ── chapters 3 + 4: the problem isn't data, it's context — then everything connects ── */

// The same incident, as seen from eight tools that don't talk to each other.
const WINDOWS = [
  ["Monitoring", <>api.example.com <b>DOWN</b></>, 3, 6, -5],
  ["Security tool", <>SSL expires in <b>6 days</b></>, 64, 2, 4],
  ["Email", <>[ALERT] checkout failing <b>(14)</b></>, 31, 20, 2],
  ["Slack", <>#ops — anyone seeing this?</>, 70, 36, -3],
  ["Spreadsheet", <>servers_final_v3.xlsx</>, 1, 46, 3],
  ["Tickets", <>INC-204 · <b>unassigned</b></>, 38, 55, -4],
  ["Dashboard A", <>CPU <b>96%</b> · prod-db-01</>, 67, 68, 5],
  ["Dashboard B", <>uptime 99.2% · yesterday</>, 12, 74, -2]
];

export function HomeContext() {
  const mobile = useIsMobile();
  return <Scene id="context" stages={4} vh={mobile ? 42 : 44}>
    {stage => <div className="relative h-full">
      <div className="s-grid" />
      <div className="pointer-events-none absolute inset-x-6 top-24 md:top-28">
        <div className="relative mx-auto h-40 max-w-5xl text-center">
          <Stage on={stage === 0}>
            <Kicker>Chapter 03 — The problem</Kicker>
            <h2 className="s-h2 mt-4">The problem isn't data.</h2>
          </Stage>
          <Stage on={stage === 1}>
            <Kicker>Chapter 03 — The problem</Kicker>
            <h2 className="s-h2 mt-4"><span className="s-soft">It's</span> context.</h2>
            <p className="s-body mx-auto mt-4 max-w-md">One incident. Eight tools. Nobody sees the whole picture.</p>
          </Stage>
          <Stage on={stage === 2}>
            <Kicker>Chapter 04 — The connection</Kicker>
            <h2 className="s-display mt-3">ITOps<span className="s-accent">.</span></h2>
          </Stage>
          <Stage on={stage === 3}>
            <Kicker>Chapter 04 — The connection</Kicker>
            <h2 className="s-h2 mt-3">Every signal, <span className="s-accent">in context.</span></h2>
          </Stage>
        </div>
      </div>

      {/* eight tools → one point */}
      <div className="absolute inset-x-4 bottom-8 top-[38%] md:inset-x-[12%] md:top-[36%]" aria-hidden={stage > 1 ? true : undefined}>
        {WINDOWS.map(([title, body, x, y, r], i) => {
          const gone = stage >= 2;
          return <div key={title} className="s-win" style={{ "--i": i, left: gone ? "50%" : `${x * (mobile ? 0.72 : 1)}%`, top: gone ? "40%" : `${y}%`, opacity: gone ? 0 : 1, transform: gone ? "translate(-50%, -50%) scale(0.2)" : `rotate(${r}deg)`, transition: "left 0.9s var(--s-ease), top 0.9s var(--s-ease), transform 0.9s var(--s-ease), opacity 0.8s var(--s-ease)", transitionDelay: `${i * 45}ms` }}>
            <header>{title}</header>
            <p>{body}</p>
          </div>;
        })}
        <span className="s-fade absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2" data-on={stage === 2 ? "1" : "0"} style={{ transitionDelay: "0.5s" }}><Signal /></span>
      </div>

      {/* the platform dashboard */}
      <div className="s-fade absolute inset-x-4 bottom-6 top-[34%] flex items-start justify-center md:inset-x-10" data-on={stage === 3 ? "1" : "0"} aria-hidden={stage === 3 ? undefined : true}>
        <div className="w-full max-w-[1040px]">
          {mobile ? <ControlPlaneCompact /> : <Fit w={1120} h={548} maxH="calc(66svh - 70px)"><ControlPlane /></Fit>}
          <p className="s-mono mt-3 text-center !text-[9px]">Illustration · sample data</p>
        </div>
      </div>
    </div>}
  </Scene>;
}

/* ── chapter 5: capabilities ── */

const CAPABILITIES = [
  ["Observe", "Know what is happening before your users tell you.", ["Website & API Monitoring", "Network & Device Monitoring", "Kada Nigrani"], "observe", "live"],
  ["Protect", "See the security posture of every endpoint — and train the people behind them.", ["Security Monitoring", "Cyber Sachet"], "protect", "live"],
  ["Respond", "Turn a failed signal into an incident, an alert and a recovery.", ["Incident Management", "Multi-Channel Alerting"], "respond", "live"],
  ["Control", "Know what you have, and see all of it in one console.", ["Asset Inventory", "Enterprise Dashboard"], "control", "live"],
  ["Learn", "Technical courses with graded quizzes and verifiable certificates.", ["Moonsav ITOps Academy"], "learn", "live"],
  ["Expand", "DevOps, cloud, endpoints and reporting are the next layers.", ["DevOps", "Cloud", "Endpoint", "Reporting & Analytics"], "expand", "roadmap"]
];

export function HomeCapabilities() {
  return <section id="capabilities" className="relative px-6 py-[14svh] md:px-10">
    <InView className="mx-auto max-w-7xl" amount={0.12}>
      <div className="s-rise"><Kicker>Chapter 05 — The platform</Kicker></div>
      <h2 className="s-h2 s-rise mt-4 max-w-4xl" style={{ "--i": 1 }}>Six things one system does <span className="s-soft">for your environment.</span></h2>
      <div className="mt-14">
        {CAPABILITIES.map(([word, line, modules, anchor, status], i) => <Link key={word} to={`/platform#${anchor}`} className="s-rise s-row grid-cols-[auto_1fr_auto] md:grid-cols-[56px_minmax(220px,0.9fr)_1.4fr_auto]" style={{ "--i": i + 2 }}>
          <span className="s-mono">0{i + 1}</span>
          <span className="s-row-title s-h2 !text-[clamp(1.9rem,4.4vw,3.75rem)]">{word}</span>
          <span className="col-span-3 md:col-span-1">
            <span className="s-body block max-w-xl">{line}</span>
            <span className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <Status kind={status} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-faint)]">{modules.join(" · ")}</span>
            </span>
          </span>
          <span aria-hidden className="s-row-arrow col-start-3 row-start-1 self-center text-xl text-[var(--s-dim)] md:col-start-4">→</span>
        </Link>)}
      </div>
    </InView>
  </section>;
}

/* ── chapter 6: the ecosystem, straight from the platform's own module list ── */

// Used only if the module list can't be loaded; mirrors the published statuses.
const FALLBACK_MODULES = [["Website & API Monitoring", "live"], ["Security Monitoring", "live"], ["Incident Management", "live"], ["Multi-Channel Alerting", "live"], ["Asset Inventory", "live"], ["Enterprise Dashboard", "live"], ["Network & Device Monitoring", "live"], ["Kada Nigrani", "live"], ["Cyber Sachet", "live"], ["Moonsav ITOps Academy", "live"], ["DevOps Monitoring", "roadmap"], ["Cloud Monitoring", "roadmap"], ["Endpoint Monitoring", "roadmap"], ["Reporting & Analytics", "roadmap"]].map(([title, status]) => ({ id: title, title, status }));

export function HomeEcosystem() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["content", "platform", "modules"],
    queryFn: () => fetchContentItems("platform", "modules"),
    staleTime: 60_000
  });
  const modules = isError || (!isLoading && !data?.length) ? FALLBACK_MODULES : data ?? [];
  const live = modules.filter(m => m.status === "live").length;
  return <section id="ecosystem" className="relative border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-[14svh] md:px-10">
    <InView className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20" amount={0.1}>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="s-rise"><Kicker>Chapter 06 — The ecosystem</Kicker></div>
        <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>One platform. <span className="s-soft">Every module reports to it.</span></h2>
        {!isLoading && <p className="s-rise mt-8 flex flex-wrap gap-x-8 gap-y-2" style={{ "--i": 2 }}>
          <Key k="Modules.live" v={String(live).padStart(2, "0")} tone="ok" />
          <Key k="Modules.roadmap" v={String(modules.length - live).padStart(2, "0")} />
        </p>}
        <p className="s-rise mt-8" style={{ "--i": 3 }}><Link to="/platform" className="s-link">Tell me the whole story <span aria-hidden>→</span></Link></p>
      </div>
      <ul aria-busy={isLoading}>
        {isLoading ? Array.from({ length: 8 }, (_, i) => <li key={i} className="s-row"><span className="block h-5 w-2/3 animate-pulse rounded bg-[var(--s-line)]" /></li>) : modules.map((m, i) => {
          const inner = <>
            <span className="s-row-title text-base font-medium tracking-tight md:text-lg">{m.title}</span>
            <Status kind={m.status === "live" ? "live" : "roadmap"} />
            {m.body && <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{m.body}</span>}
          </>;
          const cls = "s-row grid-cols-[1fr_auto] !py-5";
          return <li key={m.id} className="s-rise" style={{ "--i": Math.min(i, 8) }}>
            {m.href ? <Link to={m.href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>}
          </li>;
        })}
      </ul>
    </InView>
  </section>;
}

/* ── final: the same signal, arriving ── */

export function HomeFinale() {
  return <section id="arrive" className="relative overflow-hidden px-6 py-[20svh] md:px-10">
    <div className="s-grid" />
    <InView className="relative mx-auto max-w-5xl text-center">
      {(seen, live) => <>
        {/* the opening signal, now with somewhere to go */}
        <div className="s-rise mx-auto flex max-w-md items-center gap-4" aria-hidden>
          <Signal />
          <span className="sj relative h-4 flex-1" data-dir="row" data-on="1" data-live={live ? "1" : "0"}>
            <span className="sj-rail" />
            <span className="sj-pkt" style={{ animationDuration: "2.4s" }} />
          </span>
          <span className="s-chip" data-tone="itops">ITOps</span>
        </div>
        <h2 className="s-display s-rise mt-12" style={{ "--i": 1 }}>Every signal. <span className="s-accent">One operational view.</span></h2>
        <p className="s-body s-rise mx-auto mt-7 max-w-lg" style={{ "--i": 2 }}>Many systems. Thousands of signals. One place to see them, understand them and act.</p>
        <div className="s-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 3 }}>
          <Link to="/platform" className="s-btn" data-kind="primary">Explore ITOps <span aria-hidden>→</span></Link>
          <Link to="/pricing" className="s-btn" data-kind="ghost">See plans <span aria-hidden>→</span></Link>
        </div>
      </>}
    </InView>
  </section>;
}

/** Keeps the page from restoring a mid-story scroll position on first load. */
export function useStartAtTop() {
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);
}
