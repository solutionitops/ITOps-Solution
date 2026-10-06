// The shared "world" of the story page: one topology, one node language, one
// scroll-scene mechanism. Every chapter draws from here so the infrastructure
// introduced at the top is recognisably the same one that returns at the end.
import { memo, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView, useMotionValueEvent, useScroll } from "motion/react";

/* ── hooks ── */

export function useIsMobile(query = "(max-width: 899px)") {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

/**
 * A pinned scene. The section is `stages × vh` tall; its content sticks to the
 * viewport while scroll position picks the current stage. Stage changes are
 * discrete (React state), and the motion between them is CSS — so the scene
 * animates at full frame rate regardless of how the user scrolls.
 * `children(stage, live, progress)`: `live` is false while off-screen, which
 * pauses every looping animation inside.
 */
export function Scene({ id, act, stages, vh = 60, className = "", children }) {
  const ref = useRef(null);
  const live = useInView(ref, { amount: 0 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", v => {
    const s = Math.max(0, Math.min(stages - 1, Math.floor(v * stages)));
    setStage(prev => prev === s ? prev : s);
  });
  return <section ref={ref} id={id} data-act={act} className={`relative ${className}`} style={{ height: `${stages * vh + 100}svh` }}>
    <div className="sticky top-0 h-[100svh] overflow-hidden">
      {children(stage, live, scrollYProgress)}
    </div>
  </section>;
}

/** Marks its children `data-on` the first time they scroll into view. */
export function InView({ as: Tag = "div", className = "", amount = 0.35, children, ...rest }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount });
  const live = useInView(ref, { amount: 0 });
  return <Tag ref={ref} data-on={seen ? "1" : "0"} data-live={live ? "1" : "0"} className={className} {...rest}>
    {typeof children === "function" ? children(seen, live) : children}
  </Tag>;
}

/* ── small primitives ── */

/** One text state of a pinned scene; cross-fades as the stage changes. */
export function Stage({ on, className = "", children }) {
  // `inert` keeps off-stage links out of the tab order and the accessibility tree
  return <div className={`s-stage ${className}`} data-on={on ? "1" : "0"} inert={!on}>{children}</div>;
}

export function Signal({ className = "" }) {
  return <span aria-hidden className={`s-signal ${className}`} />;
}
export function Status({ kind = "live", children }) {
  return <span className="s-status" data-kind={kind}>{children ?? (kind === "live" ? "Live" : kind === "next" ? "Next" : "Roadmap")}</span>;
}
export function Metric({ value, label }) {
  return <div className="s-metric">
    <b>{value}</b>
    <span>{label}</span>
  </div>;
}
export function StoryLink({ to, children }) {
  return <Link to={to} className="s-link">{children} <span aria-hidden>→</span></Link>;
}
/** Chapter marker: `CHAPTER 02 — THE SIGNAL` in the technical voice. */
export function Kicker({ children, tone }) {
  return <p className="s-mono" style={tone ? { color: tone } : undefined}>{children}</p>;
}

/**
 * A chain of systems joined by wires with a travelling packet — the HTML
 * sibling of the SVG topology, used inside chapter visuals.
 * steps: [{ label, tone?: "plain" | "itops" | "roadmap" | "fail" }]
 */
export function Flow({ steps, dir = "row", live = true, tone, className = "" }) {
  return <div className={`s-flow flex ${dir === "row" ? "flex-row items-center" : "flex-col items-stretch"} ${className}`} data-dir={dir} data-live={live ? "1" : "0"} data-tone={tone}>
    {steps.map((s, i) => <FlowStep key={s.label} step={s} last={i === steps.length - 1} index={i} tone={tone} dir={dir} />)}
  </div>;
}
function FlowStep({ step, last, index, tone, dir }) {
  return <>
    <span className={`s-chip ${dir === "col" ? "justify-center" : ""}`} data-tone={step.tone ?? tone}>{step.label}</span>
    {!last && <span className="s-wire" style={{ "--i": index }} aria-hidden />}
  </>;
}

/* ── the topology ── */

const NODES = [
  { id: "internet", label: "Internet", sig: "1.2k req/min", group: 1 },
  { id: "website", label: "Website", sig: "Uptime 99.98%", group: 1, system: true },
  { id: "server", label: "Server", sig: "CPU 42%", group: 2, system: true },
  { id: "network", label: "Network", sig: "TCP connect OK", group: 3, system: true },
  { id: "dns", label: "DNS", sig: "Resolved", group: 3 },
  { id: "firewall", label: "Firewall", sig: "443 open", group: 4 },
  { id: "security", label: "Security", sig: "Score 92 · SSL valid", sigShort: "Score 92", group: 4, system: true },
  { id: "application", label: "Application", sig: "Response 184ms", group: 5, system: true },
  { id: "data", label: "Database", sig: "Query 12ms", group: 5 },
  { id: "cloud", label: "Cloud", sig: "Resource healthy", sigShort: "Healthy", group: 6, system: true },
  { id: "endpoint", label: "Endpoint", sig: "Protected", group: 7, system: true },
  { id: "people", label: "People", sig: "38 online", group: 8, system: true }
];
const EDGES = [
  ["internet", "website", "HTTPS"], ["dns", "website", "DNS"], ["security", "website", "TLS"],
  ["website", "firewall", "HTTP"], ["firewall", "network", "TCP"], ["network", "server", "TCP"],
  ["endpoint", "network", "TCP"], ["people", "endpoint", ""], ["server", "application", "AGENT"],
  ["cloud", "server", "API"], ["cloud", "application", ""], ["application", "data", "SQL"]
];
const TOOLS = ["Monitoring tool", "Security tool", "Server tool", "Network tool", "Email", "Slack", "Spreadsheets", "Tickets", "Dashboards", "Terminals"];
const TOOLS_SHORT = ["Monitor", "Security", "Server", "Network", "Email", "Slack", "Sheets", "Tickets", "Boards", "Terminal"];
// node → tool tangles; deliberately crossing sides so the picture reads as "messy"
const MESSY = [["website", 5], ["website", 2], ["server", 7], ["server", 0], ["network", 8], ["network", 1], ["security", 3], ["security", 6], ["application", 9], ["application", 4], ["dns", 6], ["cloud", 2], ["endpoint", 9], ["people", 5]];

const LAYOUTS = {
  desktop: {
    vb: [900, 660], nw: 152, nh: 42, tw: 124, th: 30, short: false,
    pos: { internet: [450, 40], website: [450, 128], dns: [250, 128], security: [650, 128], firewall: [450, 216], network: [450, 304], endpoint: [250, 304], people: [250, 392], server: [450, 392], cloud: [650, 436], application: [450, 480], data: [450, 568] },
    tools: [[72, 70], [72, 190], [72, 310], [72, 430], [72, 550], [828, 70], [828, 190], [828, 310], [828, 430], [828, 550]],
    hub: [828, 330]
  },
  mobile: {
    vb: [400, 600], nw: 112, nh: 36, tw: 70, th: 24, short: true,
    pos: { internet: [200, 26], website: [200, 94], dns: [62, 94], security: [338, 94], firewall: [200, 162], network: [200, 230], endpoint: [62, 230], people: [62, 298], server: [200, 298], cloud: [338, 332], application: [200, 366], data: [200, 434] },
    tools: [[44, 512], [122, 512], [200, 512], [278, 512], [356, 512], [44, 552], [122, 552], [200, 552], [278, 552], [356, 552]],
    hub: [200, 536]
  }
};

function connector(a, b, nw, nh) {
  const [x1, y1] = a, [x2, y2] = b;
  if (Math.abs(x1 - x2) < 1) {
    const d = y2 > y1 ? 1 : -1;
    return `M${x1} ${y1 + d * nh / 2}L${x2} ${y2 - d * nh / 2}`;
  }
  const d = x2 > x1 ? 1 : -1;
  const sx = x1 + d * nw / 2, ex = x2 - d * nw / 2, mx = (sx + ex) / 2;
  return `M${sx} ${y1}C${mx} ${y1} ${mx} ${y2} ${ex} ${y2}`;
}
function tangle(a, t, i) {
  const [x1, y1] = a, [x2, y2] = t;
  const bend = (i % 2 ? 1 : -1) * (40 + (i % 3) * 26);
  return `M${x1} ${y1}C${x1 + (x2 - x1) * 0.35} ${y1 + bend} ${x1 + (x2 - x1) * 0.7} ${y2 - bend} ${x2} ${y2}`;
}
function converge(a, hub, mobile) {
  const [x1, y1] = a, [hx, hy] = hub;
  return mobile ? `M${x1} ${y1}C${x1} ${(y1 + hy) / 2 + 30} ${hx} ${hy - 90} ${hx} ${hy}` : `M${x1} ${y1}C${x1 + (hx - x1) * 0.55} ${y1} ${hx - 150} ${hy} ${hx} ${hy}`;
}

/**
 * The infrastructure. State is declarative so every scene can reuse it:
 *  reveal    0–8, how many system groups have appeared
 *  signals   nodes show a metric and packets travel the edges
 *  fragment  other tools appear and connections tangle
 *  quiet     everything dims (the pause before the first connection)
 *  connect   one cyan line per system converges on a single hub
 *  hub       the hub is named
 *  fail      id of a node whose signal has changed for the worse
 *  failSig   the text of that changed signal
 */
export const Topology = memo(function Topology({ layout = "desktop", reveal = 8, batchFrom = 0, signals = false, fragment = false, quiet = false, connect = false, hub = false, live = true, fail = null, failSig = "", label = "Infrastructure topology", className = "" }) {
  const L = LAYOUTS[layout];
  const mobile = layout === "mobile";
  const on = id => NODES.find(n => n.id === id).group <= reveal;
  const systems = NODES.filter(n => n.system);
  const [hot, setHot] = useState(null);
  return <svg viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} className={`s-topo ${className}`} role="img" aria-label={label} data-signals={signals ? "1" : "0"} data-fragment={fragment ? "1" : "0"} data-quiet={quiet ? "1" : "0"} data-connect={connect ? "1" : "0"} data-hub={hub ? "1" : "0"} data-live={live ? "1" : "0"}>
    {/* tangles to other tools */}
    {MESSY.map(([id, t], i) => <path key={`m${i}`} className="s-messy" style={{ "--i": i }} d={tangle(L.pos[id], L.tools[t], i)} />)}
    {MESSY.map(([id, t], i) => <path key={`mp${i}`} pathLength="1" className="s-pkt messy" data-rev={i % 3 === 0 ? "1" : "0"} style={{ "--d": `${3 + (i % 4) * 0.6}s`, "--dl": `${-(i * 0.47)}s` }} d={tangle(L.pos[id], L.tools[t], i)} />)}

    {/* edges + protocol labels + packets */}
    {EDGES.map(([a, b, proto], i) => {
      const d = connector(L.pos[a], L.pos[b], L.nw, L.nh);
      const vis = on(a) && on(b);
      const delay = Math.max(0, Math.max(NODES.find(n => n.id === a).group, NODES.find(n => n.id === b).group) - 1 - batchFrom);
      const mx = (L.pos[a][0] + L.pos[b][0]) / 2, my = (L.pos[a][1] + L.pos[b][1]) / 2;
      const vertical = Math.abs(L.pos[a][0] - L.pos[b][0]) < 1;
      return <g key={a + b}>
        <path className="s-edge" data-on={vis ? "1" : "0"} data-hot={hot === a || hot === b ? "1" : "0"} style={{ "--i": delay }} d={d} />
        {proto && !mobile && <text className="s-proto" data-on={vis ? "1" : "0"} x={vertical ? mx + 8 : mx} y={vertical ? my + 3 : my - 6} textAnchor={vertical ? "start" : "middle"}>{proto}</text>}
        <path pathLength="1" className="s-pkt" data-on={vis ? "1" : "0"} style={{ "--d": `${2.2 + (i % 5) * 0.35}s`, "--dl": `${-(i * 0.53)}s` }} d={d} />
      </g>;
    })}

    {/* convergence */}
    {systems.map((n, i) => <path key={`c${n.id}`} pathLength="1" className="s-conv" data-hot={hot === n.id ? "1" : "0"} style={{ "--i": i }} d={converge(L.pos[n.id], L.hub, mobile)} />)}
    {systems.map((n, i) => <path key={`cp${n.id}`} pathLength="1" className="s-pkt conv" style={{ "--d": `${1.9 + (i % 4) * 0.3}s`, "--dl": `${-(i * 0.4)}s` }} d={converge(L.pos[n.id], L.hub, mobile)} />)}

    {/* tools */}
    {L.tools.map(([x, y], i) => <g key={`t${i}`} className="s-tool" style={{ "--i": i }}>
      <rect x={x - L.tw / 2} y={y - L.th / 2} width={L.tw} height={L.th} rx="7" />
      <text x={x} y={y + 3} textAnchor="middle">{(mobile ? TOOLS_SHORT : TOOLS)[i]}</text>
    </g>)}

    {/* nodes */}
    {NODES.map(n => {
      const [x, y] = L.pos[n.id];
      const failing = fail === n.id;
      const sig = failing ? failSig : (L.short && n.sigShort) || n.sig;
      return <g key={n.id} className="s-node" data-on={on(n.id) ? "1" : "0"} data-state={failing ? "fail" : "ok"} data-lit={failing ? "1" : "0"} style={{ "--i": Math.max(0, n.group - 1 - batchFrom) }} onPointerEnter={() => setHot(n.id)} onPointerLeave={() => setHot(null)}>
        <title>{`${n.label}: ${sig}`}</title>
        <rect x={x - L.nw / 2} y={y - L.nh / 2} width={L.nw} height={L.nh} rx="9" />
        <circle className="dot" cx={x - L.nw / 2 + 13} cy={y - 6} r="2.6" />
        <text className="lbl" x={x - L.nw / 2 + 23} y={y - 2.5}>{n.label}</text>
        <text className="sig" x={x - L.nw / 2 + 23} y={y + 11}>{sig}</text>
      </g>;
    })}

    {/* the one place every signal goes */}
    <g className="s-hub">
      <circle className="ring" cx={L.hub[0]} cy={L.hub[1]} r={mobile ? 30 : 38} />
      <circle className="core" cx={L.hub[0]} cy={L.hub[1] - (hub ? 12 : 0)} r="3.5" />
      <text x={L.hub[0]} y={L.hub[1] + 8} textAnchor="middle">ITOps</text>
    </g>
  </svg>;
});
