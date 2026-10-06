// Two Platform-page sections: the architecture (who uses it, what it runs,
// what it keeps, where it sends things) and the workflow a single signal
// follows. Everything named here is a live part of the product.
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { InView, Kicker } from "./World";
import { useSpineSection } from "./spine";

const LAYERS = [
  ["Users", ["On-call engineers", "IT and operations teams", "Employees in training"]],
  ["Platform", ["ITOps control plane"], true],
  ["Services", ["Website & API monitoring", "Security monitoring", "Kada Nigrani", "Network & device checks", "Incidents & alerting"]],
  ["Data", ["Check results", "Response-time history", "Host metrics", "Incident timelines", "Asset inventory"]],
  ["Integrations", ["Slack", "Webhook", "Email", "Public status page"]]
];

/** Users → Platform → Services → Data → Integrations. */
export function Architecture() {
  const ref = useSpineSection(1);
  return <section ref={ref} id="architecture" className="relative scroll-mt-24 px-6 py-[14svh] md:px-10">
    <InView className="mx-auto max-w-7xl" amount={0.12}>
      {(seen, live) => <>
        <div className="s-rise"><Kicker>Architecture</Kicker></div>
        <h2 className="s-h2 s-rise mt-4 max-w-4xl" style={{ "--i": 1 }}>One platform <span className="s-soft">between your people and your systems.</span></h2>
        <div className="s-arch s-rise mt-12" style={{ "--i": 2 }} data-live={live ? "1" : "0"} role="img" aria-label="Architecture: users work in the ITOps control plane, which runs the monitoring services, keeps their data, and sends alerts to Slack, webhooks, email and a public status page">
          {LAYERS.map(([name, items, core], i) => <ArchColumn key={name} name={name} items={items} core={core} index={i} last={i === LAYERS.length - 1} />)}
        </div>
      </>}
    </InView>
  </section>;
}
function ArchColumn({ name, items, core, index, last }) {
  return <>
    <div className="s-arch-col" data-core={core ? "1" : "0"}>
      <p className="s-mono" style={core ? { color: "var(--s-cyan)" } : undefined}>0{index + 1} · {name}</p>
      {items.map(t => <span key={t} className="s-chip !whitespace-normal" data-tone={core ? "itops" : "plain"}>{t}</span>)}
    </div>
    {!last && <span aria-hidden className="s-arch-wire" style={{ "--i": index }} />}
  </>;
}

const STEPS = [
  ["Input", "A check runs, or an agent reports.", "GET /checkout → 503", "var(--s-cyan)"],
  ["Processing", "The result is compared with what's expected, and consecutive failures are counted.", "2 consecutive failures", "var(--s-cyan)"],
  ["Automation", "An incident opens with its cause attached, and your alert channels fire.", "Incident #2481 · Slack · email", "var(--s-amber)"],
  ["Analytics", "Root cause analysis reads the telemetry; history and time-to-repair are kept.", "Cause: HTTP 503 from origin", "var(--s-violet)"],
  ["Result", "Checks pass again, the incident resolves itself, and the status page reflects it.", "Resolved automatically", "var(--s-green)"]
];

/** Input → Processing → Automation → Analytics → Result, drawn as you scroll. */
export function Workflow() {
  const spine = useSpineSection(1);
  const track = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start 80%", "end 45%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return <section ref={spine} id="workflow" className="relative scroll-mt-24 border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-[14svh] md:px-10">
    <div className="mx-auto max-w-7xl">
      <InView amount={0.4}>
        <div className="s-rise"><Kicker>Workflow</Kicker></div>
        <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>What happens to <span className="s-accent">one signal.</span></h2>
      </InView>
      <div ref={track} className="relative mt-14">
        {/* the rail fills as the section scrolls through */}
        <span aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-[var(--s-line2)] lg:bottom-auto lg:left-0 lg:right-0 lg:top-[5px] lg:h-px lg:w-auto" />
        <motion.span aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px origin-top bg-[var(--s-cyan)] lg:hidden" style={{ scaleY: reduce ? 1 : p }} />
        <motion.span aria-hidden className="absolute left-0 right-0 top-[5px] hidden h-px origin-left bg-[var(--s-cyan)] lg:block" style={{ scaleX: reduce ? 1 : p }} />
        <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-8">
          {STEPS.map(([name, line, evidence, tone], i) => <li key={name} className="relative pl-8 lg:pl-0 lg:pt-9">
            <InView amount={0.6}>
              <span aria-hidden className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full ring-4 ring-[var(--s-bg2)] lg:top-0" style={{ background: tone }} />
              <p className="s-rise s-mono" style={{ color: tone }}>0{i + 1}</p>
              <h3 className="s-h3 s-rise mt-3" style={{ "--i": 1 }}>{name}</h3>
              <p className="s-rise mt-3 text-sm leading-relaxed text-[var(--s-dim)]" style={{ "--i": 2 }}>{line}</p>
              <p className="s-rise s-panel mt-5 px-3 py-2.5 font-mono text-[11px]" style={{ "--i": 3, color: tone }}>{evidence}</p>
            </InView>
          </li>)}
        </ol>
      </div>
      <p className="s-mono mt-8 !text-[9px]">Illustration · sample data</p>
    </div>
  </section>;
}
