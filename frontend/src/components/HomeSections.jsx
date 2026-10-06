// Home-page sections: the layered product bento, the sector switcher and the
// closing call to action. Copy here only claims what the product pages claim —
// DevOps Monitor is on the roadmap and is labelled that way.
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Reveal, SpotlightCard } from "./Animated";
import { CTALink } from "./Button";
import { BrandMark } from "./BrandLogo";
import { HostsVisual, IncidentVisual, SecurityVisual, UptimeVisual } from "./FeatureShowcase";
const EASE = [0.16, 1, 0.3, 1];

function StatusBadge({ status }) {
  if (status === "live") {
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 light:bg-emerald-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300 light:text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 light:bg-emerald-500 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
      Live
    </span>;
  }
  return <span className="rounded-full bg-white/10 light:bg-slate-900/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/55 light:text-slate-500">
    Roadmap
  </span>;
}
function Tick() {
  return <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300 light:text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
function SampleNote({ children = "Illustration · sample data" }) {
  return <p className="mt-2 text-right font-mono text-[9px] uppercase tracking-[0.18em] text-white/25 light:text-slate-400">{children}</p>;
}

/* ── Layer visuals (the other three reuse FeatureShowcase vignettes) ── */

/* ── Layer visuals: High-tech, interactive Cyber-Ops modules ── */

/** Kada Nigrani: Interactive host switcher, live gauges, and copyable bash installer */
function ServersVisual() {
  const [activeHost, setActiveHost] = useState("prod-web-01");
  const [copied, setCopied] = useState(false);

  const HOST_DATA = {
    "prod-web-01": { status: "Online", ok: true, cpu: 31, mem: 58, disk: 44, load: "0.42", uptime: "41d 6h", procs: 184 },
    "prod-web-02": { status: "Online", ok: true, cpu: 26, mem: 52, disk: 38, load: "0.31", uptime: "38d 14h", procs: 172 },
    "edge-syd-01": { status: "Online", ok: true, cpu: 46, mem: 64, disk: 52, load: "0.68", uptime: "19d 2h", procs: 148 },
    "db-backup-02": { status: "Idle", ok: false, cpu: 14, mem: 34, disk: 79, load: "0.18", uptime: "84d 11h", procs: 92 }
  };

  const current = HOST_DATA[activeHost] || HOST_DATA["prod-web-01"];

  const copyInstall = () => {
    navigator.clipboard?.writeText("curl -fsSL https://itops.solution/agent.sh | bash");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Terminal & Host selector */}
      <div className="mockup-dark flex flex-col justify-between rounded-2xl p-4 border border-white/10 light:border-slate-900/10">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-[10px] text-white/50">KADA_AGENT // INSTALL</span>
            <button
              onClick={copyInstall}
              className="rounded bg-white/10 px-2 py-0.5 font-mono text-[9px] text-cyan-300 hover:bg-cyan-400/20 transition-colors"
            >
              {copied ? "✓ COPIED" : "COPY CMD"}
            </button>
          </div>
          <div className="mt-2.5 font-mono text-[11px] leading-relaxed">
            <p className="text-white/80"><span className="text-emerald-400">$</span> curl -fsSL …/agent.sh | bash</p>
            <p className="mt-1 text-emerald-300/90 text-[10px]">✓ agent registered (auth key verified)</p>
            <p className="text-white/40 text-[10px]">✓ streaming metrics every 60s</p>
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <p className="font-mono text-[10px] text-white/45 mb-1.5 uppercase">Select Active Host:</p>
          <ul className="space-y-1 text-[11px]">
            {Object.entries(HOST_DATA).map(([name, data]) => (
              <li
                key={name}
                onClick={() => setActiveHost(name)}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
                  activeHost === name ? "bg-white/10 text-white font-medium" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${data.ok ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-amber-400"}`} />
                <span className="font-mono">{name}</span>
                <span className={`ml-auto font-mono text-[10px] ${data.ok ? "text-emerald-300/90" : "text-amber-300/90"}`}>
                  {data.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dynamic host resource gauges */}
      <div className="mockup-dark rounded-2xl p-4 flex flex-col justify-between border border-white/10 light:border-slate-900/10">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
              <span className="font-mono font-medium">{activeHost}</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-300">Ubuntu 24.04</span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              ["CPU Load", current.cpu, "bg-cyan-400"],
              ["Memory", current.mem, "bg-blue-400"],
              ["Disk Root", current.disk, "bg-violet-400"]
            ].map(([label, pct, tone]) => (
              <div key={label}>
                <div className="flex justify-between font-mono text-[11px] text-white/60">
                  <span>{label}</span>
                  <span className="font-semibold text-white">{pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className={`h-full rounded-full ${tone}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/40 p-2 text-center font-mono text-[10px] text-white/60">
          <div>
            <p className="text-white/40">uptime</p>
            <p className="text-white font-medium">{current.uptime}</p>
          </div>
          <div>
            <p className="text-white/40">load avg</p>
            <p className="text-cyan-300 font-medium">{current.load}</p>
          </div>
          <div>
            <p className="text-white/40">procs</p>
            <p className="text-white font-medium">{current.procs}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** DevOps Monitor: Interactive pipeline stage explorer */
function PipelineVisual() {
  const [activeStage, setActiveStage] = useState(2); // default Test
  const stages = [
    { name: "Commit", detail: "SHA #8833749 · 2m ago", metric: "3 commits", icon: "✓" },
    { name: "Build", detail: "Docker multi-arch container", metric: "4m 12s", icon: "✓" },
    { name: "Test", detail: "Integration & e2e test suite", metric: "124/124 OK", icon: "✓" },
    { name: "Deploy", detail: "Canary rolling deploy (K8s)", metric: "0 downtime", icon: "🚀" }
  ];

  return (
    <div className="mockup-dark rounded-2xl p-5 border border-white/10 light:border-slate-900/10">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono text-white/70">CI/CD // checkout-service</span>
        <span className="font-mono text-cyan-300 text-[11px] bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
          release-v2.4.1
        </span>
      </div>

      {/* Stepper with click interaction */}
      <ol className="mt-5 flex items-center">
        {stages.map((s, i) => (
          <li
            key={s.name}
            onClick={() => setActiveStage(i)}
            className="flex flex-1 items-center last:flex-none cursor-pointer group"
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold transition-all ${
                  activeStage === i
                    ? "border-cyan-400 bg-cyan-400/20 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-110"
                    : "border-indigo-300/40 bg-indigo-400/10 text-indigo-200 group-hover:border-white/40"
                }`}
              >
                {s.icon}
              </span>
              <span className={`text-[10px] font-mono ${activeStage === i ? "text-cyan-300 font-semibold" : "text-white/50"}`}>
                {s.name}
              </span>
            </div>
            {i < stages.length - 1 && (
              <span className="mx-1.5 mb-5 h-px flex-1 bg-gradient-to-r from-indigo-300/60 to-indigo-300/20" />
            )}
          </li>
        ))}
      </ol>

      {/* Dynamic Stage Details */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase text-white/40">Stage Detail ({stages[activeStage].name}):</span>
          <p className="text-white/90 text-[11px] mt-0.5">{stages[activeStage].detail}</p>
        </div>
        <span className="rounded bg-indigo-500/20 px-2.5 py-1 text-indigo-300 font-semibold text-[11px]">
          {stages[activeStage].metric}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono">
        {[["4m 12s", "build time"], ["12 / 12", "pods healthy"], ["0", "failed checks"]].map(([v, l]) => (
          <div key={l} className="rounded-lg border border-white/10 bg-black/30 py-2">
            <p className="text-xs font-semibold text-white">{v}</p>
            <p className="text-[9px] text-white/40">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** CyberSachet: Interactive security training completion radar */
function PeopleVisual() {
  const [selectedCourse, setSelectedCourse] = useState(0);
  const R = 34;
  const C = 2 * Math.PI * R;
  const courses = [
    { name: "Phishing Awareness", pct: 100, lessons: "6/6 done", score: "Score: 100%" },
    { name: "Passwords & MFA Security", pct: 84, lessons: "4/5 done", score: "Score: 84%" },
    { name: "Social Engineering Defense", pct: 60, lessons: "3/5 done", score: "Score: 60%" }
  ];

  const overall = Math.round(courses.reduce((acc, c) => acc + c.pct, 0) / courses.length);

  return (
    <div className="mockup-dark rounded-2xl p-5 border border-white/10 light:border-slate-900/10">
      <div className="flex items-center justify-between text-xs font-mono mb-4">
        <span className="text-white/60">CYBERSACHET // TEAM DEFENSE</span>
        <span className="text-amber-300 text-[11px]">GRADE: A (HUMAN POSTURE)</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <motion.circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - overall / 100) }}
              transition={{ duration: 1.2, ease: EASE }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <span className="text-xl font-semibold leading-none text-white font-mono">
              {overall}<span className="text-xs text-white/50">%</span>
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {courses.map((c, i) => (
            <div
              key={c.name}
              onClick={() => setSelectedCourse(i)}
              className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                selectedCourse === i ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="flex justify-between font-mono text-[11px]">
                <span className="truncate text-white/80">{c.name}</span>
                <span className={c.pct === 100 ? "text-emerald-300 font-semibold" : "text-amber-300"}>
                  {c.pct === 100 ? "✓ 100%" : `${c.pct}%`}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full rounded-full ${c.pct === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-[10px] text-white/60">
        <span>Active module: <strong className="text-white">{courses[selectedCourse].name}</strong></span>
        <span className="text-cyan-300">{courses[selectedCourse].score}</span>
      </div>
    </div>
  );
}

/** Layer 04: Interactive Website & API Monitoring Visual */
function InteractiveUptimeVisual() {
  const [selectedRegion, setSelectedRegion] = useState("IAD");
  const REGIONS = {
    IAD: { label: "US East (N. Virginia)", ms: "18ms", uptime: "99.99%" },
    FRA: { label: "Europe (Frankfurt)", ms: "24ms", uptime: "99.98%" },
    NRT: { label: "Asia Pacific (Tokyo)", ms: "78ms", uptime: "100.0%" },
    SYD: { label: "Australia (Sydney)", ms: "108ms", uptime: "99.95%" }
  };

  const ticks = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="mockup-dark rounded-2xl p-5 border border-white/10 light:border-slate-900/10">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-white/70">api.production · 24h checks</span>
        <span className="text-emerald-300 font-semibold">{REGIONS[selectedRegion].uptime}</span>
      </div>

      {/* Region Switcher Pills */}
      <div className="mt-3 flex gap-1.5 font-mono text-[10px]">
        {Object.entries(REGIONS).map(([code, r]) => (
          <button
            key={code}
            onClick={() => setSelectedRegion(code)}
            className={`rounded px-2 py-0.5 transition-colors ${
              selectedRegion === code ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40" : "text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {code} ({r.ms})
          </button>
        ))}
      </div>

      {/* 24-Hour Uptime Bars */}
      <div className="mt-3 flex gap-1">
        {ticks.map((i) => (
          <div
            key={i}
            className={`h-8 flex-1 rounded-sm transition-transform hover:scale-125 ${
              i === 11 ? "bg-amber-400/80" : "bg-emerald-400/80"
            }`}
            title={`Hour ${i}:00 · ${i === 11 ? "Minor latency blip (240ms)" : "Nominal (18-24ms)"}`}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono">
        {[
          [REGIONS[selectedRegion].ms, "response time"],
          ["30s", "check interval"],
          ["2 hops", "SSL + DNS ok"]
        ].map(([v, l]) => (
          <div key={l} className="rounded-lg border border-white/10 bg-black/40 py-2">
            <p className="text-xs font-semibold text-white">{v}</p>
            <p className="text-[9px] text-white/40">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Layer 05: Interactive Security Posture Scoreboard */
function InteractiveSecurityVisual() {
  const [activeHeader, setActiveHeader] = useState("strict-transport-security");
  const R = 34;
  const C = 2 * Math.PI * R;
  const score = 0.94;

  const HEADERS = {
    "strict-transport-security": { ok: true, detail: "max-age=31536000; includeSubDomains; preload" },
    "content-security-policy": { ok: true, detail: "default-src 'self'; script-src 'self' 'nonce-...' " },
    "x-frame-options": { ok: true, detail: "DENY (Clickjacking attack vector prevented)" },
    "permissions-policy": { ok: true, detail: "camera=(), microphone=(), geolocation=()" }
  };

  return (
    <div className="mockup-dark rounded-2xl p-5 border border-white/10 light:border-slate-900/10">
      <div className="flex items-center justify-between text-xs font-mono mb-4">
        <span className="text-white/60">PERIMETER AUDIT // HTTPS</span>
        <span className="text-emerald-300 font-semibold">GRADE: A+</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative h-24 w-24 shrink-0">
          <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
            <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <motion.circle
              cx="42"
              cy="42"
              r={R}
              fill="none"
              stroke="#10b981"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              whileInView={{ strokeDashoffset: C * (1 - score) }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: EASE }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center font-mono">
            <span className="text-2xl font-bold text-white">94</span>
          </div>
        </div>

        <ul className="flex-1 space-y-1.5 font-mono text-[10px]">
          {Object.entries(HEADERS).map(([h]) => (
            <li
              key={h}
              onClick={() => setActiveHeader(h)}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-2.5 py-1 transition-colors ${
                activeHeader === h ? "border-emerald-400/50 bg-emerald-400/10 text-white" : "border-white/10 bg-black/30 text-white/60 hover:text-white"
              }`}
            >
              <code className="truncate max-w-[140px]">{h}</code>
              <span className="text-emerald-300 font-bold">✓</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[10px] text-white/50">
        <span className="text-emerald-300">Policy: </span>
        <span className="text-white/80">{HEADERS[activeHeader]?.detail}</span>
      </div>
    </div>
  );
}

/** Layer 06: Interactive Incident Resolution Simulation */
function InteractiveIncidentVisual() {
  const [testSimulating, setTestSimulating] = useState(false);
  const [simStep, setSimStep] = useState(3); // default all resolved

  const steps = [
    { t: "14:02:11", msg: "checkout-service failed 2 consecutive checks (503)", tone: "text-red-300", badge: "DETECT" },
    { t: "14:02:12", msg: "Incident opened · Slack (#sre) + Webhook dispatched", tone: "text-amber-300", badge: "ALERT" },
    { t: "14:02:18", msg: "AI Root Cause Analysis: Node #4 memory saturation", tone: "text-violet-300", badge: "DIAGNOSE" },
    { t: "14:02:26", msg: "Checks passing · Incident auto-resolved (15s MTTR)", tone: "text-emerald-300", badge: "RESOLVE" }
  ];

  const handleRunSim = () => {
    setTestSimulating(true);
    setSimStep(0);
    setTimeout(() => setSimStep(1), 600);
    setTimeout(() => setSimStep(2), 1200);
    setTimeout(() => {
      setSimStep(3);
      setTestSimulating(false);
    }, 1800);
  };

  return (
    <div className="mockup-dark rounded-2xl p-5 border border-white/10 light:border-slate-900/10">
      <div className="flex items-center justify-between text-xs font-mono mb-3">
        <span className="text-white/70">INCIDENT #2481 // LIFECYCLE</span>
        <button
          onClick={handleRunSim}
          disabled={testSimulating}
          className="rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[9px] transition-colors"
        >
          {testSimulating ? "SIMULATING DISPATCH…" : "TEST SIGNAL FLOW"}
        </button>
      </div>

      <div className="space-y-2">
        {steps.map((s, i) => (
          <motion.div
            key={s.t}
            className={`flex items-start gap-2.5 rounded-lg border p-2 transition-all font-mono text-[11px] ${
              i <= simStep ? "border-white/10 bg-black/40 opacity-100" : "border-white/5 bg-black/10 opacity-30"
            }`}
          >
            <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/50">
              {s.badge}
            </span>
            <div className="min-w-0 flex-1">
              <p className={s.tone}>{s.msg}</p>
              <p className="text-[9px] text-white/40">{s.t}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-white/50 pt-2 border-t border-white/10">
        <span>Channels: <strong className="text-white">Slack, PagerDuty, Email</strong></span>
        <span className="text-emerald-400">✓ AUTO-RESOLVED</span>
      </div>
    </div>
  );
}

const LAYERS = [{
  n: "01",
  layer: "Servers",
  product: "Kada Nigrani",
  cover: "/covers/servers.jpg",
  status: "live",
  tint: "blue",
  tone: "text-blue-300 light:text-blue-600",
  span: "lg:col-span-12",
  wide: true,
  title: "See inside every server you run",
  body: "One line installs a lightweight agent on any Linux host. CPU, memory, disk, load and process counts stream into the same dashboard as your websites.",
  points: ["One-line install — bash and curl only", "Online and offline state for every host", "Per-host keys you can rotate or revoke"],
  href: "/solutions/kada-nigrani",
  cta: "Explore Kada Nigrani",
  visual: <ServersVisual />
}, {
  n: "02",
  layer: "Pipeline",
  product: "DevOps Monitor",
  cover: "/covers/devops.jpg",
  status: "roadmap",
  tint: "violet",
  tone: "text-indigo-300 light:text-indigo-600",
  span: "lg:col-span-6",
  title: "Watch every release, commit to production",
  body: "Monitoring for the tools your engineers actually run. It is on our roadmap, not shipped yet — join the waitlist and help shape it.",
  points: ["CI/CD pipelines and deployments", "Docker and Kubernetes health", "Terraform and infrastructure-as-code"],
  href: "/solutions/devops-monitor",
  cta: "See what's planned",
  visual: <PipelineVisual />,
  note: "Interactive prototype · planned module"
}, {
  n: "03",
  layer: "People",
  product: "CyberSachet",
  cover: "/covers/cybersachet.jpg",
  status: "live",
  tint: "amber",
  tone: "text-amber-300 light:text-amber-600",
  span: "lg:col-span-6",
  title: "Make every employee part of the defence",
  body: "Structured security-awareness courses built from real lessons, each ending in a scored quiz — so awareness is measured, not assumed.",
  points: ["Courses a team can actually finish", "Quiz scores and completion per employee", "Licensed per organization"],
  href: "/cybersachet",
  cta: "Explore CyberSachet",
  visual: <PeopleVisual />
}, {
  n: "04",
  layer: "Edge",
  product: "Website & API Monitoring",
  cover: "/covers/website-api.jpg",
  status: "live",
  tint: "cyan",
  tone: "text-cyan-300 light:text-cyan-600",
  span: "lg:col-span-4",
  title: "Know before your customers do",
  body: "Every endpoint checked as often as every 30 seconds — status codes, page text and DNS records — with the failing check and full redirect chain attached.",
  points: ["Uptime, keyword, status-code and DNS checks", "Response-time history on every check", "Redirect chains traced up to 5 hops"],
  href: "/solutions/website-api-monitoring",
  cta: "Explore website monitoring",
  visual: <InteractiveUptimeVisual />
}, {
  n: "05",
  layer: "Perimeter",
  product: "Security Monitoring",
  cover: "/covers/security.jpg",
  status: "live",
  tint: "emerald",
  tone: "text-emerald-300 light:text-emerald-600",
  span: "lg:col-span-4",
  title: "A security score you can act on",
  body: "Each endpoint is graded out of 100 on the headers that actually stop attacks, plus cookie flags and version leaks. SSL expiry is tracked per certificate.",
  points: ["Security-header scoring on every HTTPS endpoint", "SSL expiry tracking with early alerts"],
  href: "/solutions/security-monitoring",
  cta: "Explore security monitoring",
  visual: <InteractiveSecurityVisual />
}, {
  n: "06",
  layer: "Response",
  product: "Incidents & Alerting",
  cover: "/covers/incidents.jpg",
  status: "live",
  tint: "rose",
  tone: "text-rose-300 light:text-rose-600",
  span: "lg:col-span-4",
  title: "From failure to fix, automatically",
  body: "Consecutive failures open an incident with the real cause attached. Slack, webhook and email alerts fire at once, and recovery closes it on its own.",
  points: ["Auto-open and auto-resolve incidents", "Shareable public status page per organization"],
  href: "/solutions/alerting-incident-response",
  cta: "See how incidents work",
  visual: <InteractiveIncidentVisual />
}];

function LayerCard({ item, index, isFocused }) {
  return (
    <SpotlightCard
      tint={item.tint}
      delay={(index % 3) * 0.07}
      className={`relative overflow-hidden ${item.span} p-6 md:p-7 transition-all duration-300 ${
        isFocused ? "ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.25)]" : ""
      }`}
    >
      {/* Subtle atmospheric cover backdrop */}
      {item.cover && (
        <div className="pointer-events-none absolute right-0 top-0 h-44 w-52 overflow-hidden opacity-[0.06] select-none">
          <img src={item.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0b0f19]" />
        </div>
      )}
      <div id={`layer-${item.n}`} className={item.wide ? "grid h-full items-center gap-8 lg:grid-cols-[1fr_1.5fr]" : "flex h-full flex-col gap-6"}>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            {item.cover && (
              <img
                src={item.cover}
                alt=""
                className="h-5 w-5 rounded object-cover border border-white/20 shadow-xs"
              />
            )}
            <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${item.tone}`}>
              Layer {item.n} · {item.layer}
            </span>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-4 text-sm font-medium text-white/55 light:text-slate-500">{item.product}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white light:text-slate-900 md:text-2xl">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-white/60 light:text-slate-500">{item.body}</p>
          <ul className="mt-4 space-y-2">
            {item.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-white/70 light:text-slate-600">
                <Tick />
                {p}
              </li>
            ))}
          </ul>
          <Link
            to={item.href}
            className={`group/link mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${item.tone} transition-opacity hover:opacity-80`}
          >
            {item.cta}
            <span aria-hidden className="transition-transform group-hover/link:translate-x-1">→</span>
          </Link>
        </div>
        <div className={item.wide ? "" : "mt-auto"}>
          {item.visual}
          <SampleNote>{item.note}</SampleNote>
        </div>
      </div>
    </SpotlightCard>
  );
}

/**
 * "Layers of defence" — High-tech Cyber Defense Matrix with interactive layer nexus
 */
export function DefenceLayers() {
  const reduce = useReducedMotion();
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [layerFilter, setLayerFilter] = useState("all"); // "all" | "flagship" | "telemetry"

  const displayedLayers = LAYERS.filter((l) => {
    if (layerFilter === "flagship") return ["01", "02", "03"].includes(l.n);
    if (layerFilter === "telemetry") return ["04", "05", "06"].includes(l.n);
    return true;
  });

  const handleSelectLayer = (n) => {
    setSelectedLayer(n);
    const el = document.getElementById(`layer-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section id="layers" className="relative overflow-hidden border-t border-white/10 light:border-slate-900/8 bg-neutral-950/60 light:bg-white px-6 py-28 md:px-10">
      <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-24 h-[420px] w-[420px] rounded-full bg-violet-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 text-xs font-mono text-cyan-300 light:text-cyan-700">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
            UNIFIED DEFENSE MATRIX // 6 DEFENSE VECTORS
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Code, servers, people.
            <span className="text-gradient block">One line of defence.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/55 light:text-slate-500 md:text-base">
            Three flagship products and the telemetry that ties them together into one unified autonomous command deck.
          </p>

          {/* Filter Pills */}
          <div className="mt-6 inline-flex rounded-full border border-white/10 bg-neutral-900/80 p-1 font-mono text-xs">
            {[
              ["all", "All 6 Layers"],
              ["flagship", "Flagships (3)"],
              ["telemetry", "Telemetry Vectors (3)"]
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setLayerFilter(val)}
                className={`rounded-full px-3.5 py-1.5 transition-all ${
                  layerFilter === val
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Interactive Neural Chain Dock */}
        <Reveal delay={0.1} className="relative mx-auto mt-12 max-w-4xl">
          <div className="absolute left-[8%] right-[8%] top-[15px] hidden h-px bg-white/12 light:bg-slate-900/10 sm:block" />
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute top-[14px] hidden h-[3px] w-16 rounded-full opacity-80 [background:var(--grad-brand)] sm:block shadow-[0_0_8px_rgba(0,240,255,0.8)]"
              animate={{ left: ["6%", "84%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          )}
          <ol className="relative grid grid-cols-3 gap-y-5 sm:grid-cols-6">
            {LAYERS.map((l) => {
              const isSelected = selectedLayer === l.n;
              return (
                <li
                  key={l.n}
                  onClick={() => handleSelectLayer(l.n)}
                  className="flex flex-col items-center gap-2 text-center cursor-pointer group"
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border font-mono text-[10px] transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-400 text-black font-bold scale-110 shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                        : "border-white/15 light:border-slate-900/12 bg-neutral-900 light:bg-white text-white/70 light:text-slate-600 group-hover:border-cyan-400/50"
                    }`}
                  >
                    {l.n}
                  </span>
                  <span className={`text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${isSelected ? "text-cyan-300 font-bold" : l.tone}`}>
                    {l.layer}
                  </span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          {displayedLayers.map((item, i) => (
            <LayerCard
              key={item.n}
              item={item}
              index={i}
              isFocused={selectedLayer === item.n}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Sectors ── */

const SECTOR_ICONS = {
  it: <><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></>,
  bank: <><path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></>,
  edu: <><path d="M2 9l10-5 10 5-10 5-10-5z" /><path d="M6 11.5V16c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5M22 9v5" /></>,
  industry: <><path d="M3 20V10l6 4V10l6 4V5h4v15H3z" /><path d="M7 17h2M12 17h2" /></>
};
const SECTORS = [{
  key: "it",
  name: "IT & technology companies",
  short: "IT & technology",
  tone: "34,211,238",
  toneLight: "8,145,178",
  stake: "Your product is your uptime.",
  lead: "SaaS and IT service teams live and die by availability. See every API, site and host in one place — and hear about a failure before a customer does.",
  monitor: "APIs, websites and Linux hosts on one dashboard, with response-time history on every check.",
  secure: "A 0–100 security score for each endpoint, and SSL-expiry alerts before a certificate lapses.",
  train: "Security awareness for engineers and non-engineers alike, tracked per employee.",
  watch: [["api.example.com", "API", "200 · 142 ms"], ["app.example.com", "Website", "99.98%"], ["web-01", "Linux host", "CPU 31%"], ["Whole team", "CyberSachet", "84% trained"]]
}, {
  key: "bank",
  name: "Banking & financial institutions",
  short: "Banking & finance",
  tone: "52,211,153",
  toneLight: "5,150,105",
  stake: "Every minute offline is a headline.",
  lead: "Customers expect net banking and payments to simply work. Watch the services they touch around the clock, with a clear record of every incident.",
  monitor: "Customer portals, payment APIs and the servers behind them — checked as often as every 30 seconds.",
  secure: "Security headers, cookie flags and certificate expiry graded on every customer-facing endpoint.",
  train: "Awareness courses with scored quizzes for every employee, and a completion record per person.",
  watch: [["netbanking.example.com", "Portal", "200 · 188 ms"], ["Payments API", "API", "99.99%"], ["core-app-01", "Linux host", "Load 0.42"], ["Branch staff", "CyberSachet", "92% trained"]]
}, {
  key: "edu",
  name: "Educational organizations",
  short: "Education",
  tone: "167,139,250",
  toneLight: "109,74,222",
  stake: "Thousands of students, one login rush.",
  lead: "Admissions, results and exam days put everything under load at once. Know the moment a portal slows down — and tell students the truth on a status page.",
  monitor: "Student portals, LMS and admission sites watched continuously, with a public status page for students and staff.",
  secure: "Spot weak security headers and expiring certificates across every campus site.",
  train: "Awareness courses for staff and faculty, plus hands-on Linux and DevOps labs in ITOps Academy.",
  watch: [["portal.example.edu", "Student portal", "200 · 212 ms"], ["lms.example.edu", "LMS", "99.95%"], ["results.example.edu", "Website", "SSL · 61 days"], ["Faculty & staff", "CyberSachet", "76% trained"]]
}, {
  key: "industry",
  name: "Industry & manufacturing",
  short: "Industry",
  tone: "251,191,36",
  toneLight: "180,116,8",
  stake: "When systems stop, the line stops.",
  lead: "Plants, warehouses and branch sites depend on servers and network gear nobody is watching at 3 a.m. Put them all on the same screen.",
  monitor: "Servers, routers and switches across every site — network and device monitoring alongside host metrics.",
  secure: "Score the security of supplier and customer portals, and track every certificate.",
  train: "Short, structured courses for staff on the floor and in the office, with completion tracked.",
  watch: [["erp.example.com", "Website", "200 · 164 ms"], ["plant-01 gateway", "Router", "Ping 4 ms"], ["mes-srv-02", "Linux host", "Disk 44%"], ["Operations team", "CyberSachet", "81% trained"]]
}];
const PILLARS = [["monitor", "Monitor", "Website & API · Kada Nigrani"], ["secure", "Secure", "Security Monitoring"], ["train", "Train", "CyberSachet"]];

function SectorIcon({ name, className = "h-5 w-5" }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {SECTOR_ICONS[name]}
  </svg>;
}

/**
 * "Built for every sector" — a tabbed brief per industry showing how the same
 * three jobs (monitor, secure, train) answer that sector's stakes.
 */
export function SectorShowcase() {
  const [active, setActive] = useState(0);
  const s = SECTORS[active];
  function onKey(e) {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + SECTORS.length) % SECTORS.length;
    setActive(next);
    document.getElementById(`sector-tab-${SECTORS[next].key}`)?.focus();
  }
  return <section id="industries" className="relative overflow-hidden border-t border-white/10 light:border-slate-900/8 px-6 py-24 md:px-10">
    <div className="relative mx-auto max-w-7xl">
      <Reveal className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45 light:text-slate-400">Built for every sector</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
          Different industries.
          <span className="text-gradient block">The same zero-surprise standard.</span>
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 light:text-slate-500 md:text-base">
          From global IT teams to banks, campuses and factory floors — the stakes change, the platform doesn't.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 grid gap-5 lg:grid-cols-[300px_1fr]">
        <div role="tablist" aria-label="Sectors" aria-orientation="vertical" onKeyDown={onKey} className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {SECTORS.map((sec, i) => {
            const on = i === active;
            return <button key={sec.key} id={`sector-tab-${sec.key}`} type="button" role="tab" aria-selected={on} aria-controls="sector-panel" tabIndex={on ? 0 : -1} onClick={() => setActive(i)} style={{ "--tone": sec.tone, "--tone-l": sec.toneLight }} className={`group relative flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 lg:shrink ${on ? "border-[rgba(var(--tone),0.45)] bg-[rgba(var(--tone),0.08)] light:border-[rgba(var(--tone-l),0.4)] light:bg-[rgba(var(--tone-l),0.07)]" : "border-white/10 light:border-slate-900/10 bg-white/[0.02] light:bg-white hover:border-white/20 light:hover:border-slate-900/20"}`}>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${on ? "border-[rgba(var(--tone),0.4)] bg-[rgba(var(--tone),0.14)] text-[rgb(var(--tone))] light:text-[rgb(var(--tone-l))]" : "border-white/10 light:border-slate-900/10 text-white/50 light:text-slate-500"}`}>
                <SectorIcon name={sec.key} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 light:text-slate-400">0{i + 1}</span>
                <span className={`block whitespace-nowrap text-sm font-medium lg:whitespace-normal ${on ? "text-white light:text-slate-900" : "text-white/65 light:text-slate-600"}`}>
                  <span className="lg:hidden">{sec.short}</span>
                  <span className="hidden lg:inline">{sec.name}</span>
                </span>
              </span>
            </button>;
          })}
        </div>

        <div id="sector-panel" role="tabpanel" aria-labelledby={`sector-tab-${s.key}`} style={{ "--tone": s.tone, "--tone-l": s.toneLight }} className="relative overflow-hidden rounded-3xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white light:shadow-[0_8px_40px_-20px_rgba(15,23,42,0.25)]">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[rgba(var(--tone),0.14)] blur-[90px] transition-colors duration-500" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={s.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }} className="relative grid gap-8 p-6 md:p-9 xl:grid-cols-[1.25fr_1fr]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--tone))] light:text-[rgb(var(--tone-l))]">{s.name}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white light:text-slate-900 md:text-3xl">{s.stake}</h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60 light:text-slate-500">{s.lead}</p>
                <dl className="mt-7 space-y-4">
                  {PILLARS.map(([field, label, products]) => <div key={field} className="flex gap-4">
                    <dt className="w-[70px] shrink-0 pt-0.5">
                      <span className="block text-sm font-semibold text-white light:text-slate-900">{label}</span>
                    </dt>
                    <dd className="min-w-0 border-l border-white/10 light:border-slate-900/10 pl-4">
                      <p className="text-sm leading-relaxed text-white/70 light:text-slate-600">{s[field]}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 light:text-slate-400">{products}</p>
                    </dd>
                  </div>)}
                </dl>
                <div className="mt-8 flex flex-wrap gap-3">
                  <CTALink to="/pricing" size="sm">See plans <span aria-hidden>→</span></CTALink>
                  <CTALink to="/company" variant="secondary" size="sm">Talk to us</CTALink>
                </div>
              </div>

              <div className="self-center">
                <div className="mockup-dark rounded-2xl p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Watchlist · {s.short}</span>
                    <span className="flex items-center gap-1.5 text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
                      All healthy
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {s.watch.map(([name, kind, metric], i) => <motion.li key={name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs text-white/85">{name}</span>
                        <span className="block text-[10px] text-white/40">{kind}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-white/60">{metric}</span>
                    </motion.li>)}
                  </ul>
                </div>
                <SampleNote />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </div>
  </section>;
}

/* ── Closing call to action ── */

const FIRST_STEPS = [{
  n: "01",
  title: "Add a site or API",
  body: "Checks start right away — as often as every 30 seconds, with alerts the moment something breaks.",
  href: "/solutions/website-api-monitoring"
}, {
  n: "02",
  title: "Install the server agent",
  body: "One line on any Linux host. CPU, memory and disk appear on the same dashboard.",
  href: "/solutions/kada-nigrani"
}, {
  n: "03",
  title: "Train your team",
  body: "CyberSachet courses and quizzes, with completion tracked for every employee.",
  href: "/cybersachet"
}];

/** The closing panel: one promise, one primary action, and the first three steps. */
export function ClosingCTA() {
  return <section id="cta" className="px-6 pb-24 pt-8 md:px-10">
    <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 light:border-slate-900/10 bg-neutral-950 light:bg-white px-6 py-16 text-center light:shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] md:px-14 md:py-20">
      <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,rgba(59,130,246,0.28),transparent_70%)] light:bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,rgba(59,130,246,0.14),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-16 top-0 h-px opacity-70 [background:var(--grad-brand)]" />

      <div className="relative">
        <div className="relative mx-auto grid h-20 w-20 place-items-center">
          <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-xl" />
          <BrandMark size={64} className="relative" />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 light:text-slate-400">Secure · Monitor · Automate · Scale</p>
        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
          Ready to stop finding out
          <span className="text-gradient block">from your customers?</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/60 light:text-slate-500 md:text-base">
          Start on the free Starter plan and have your first monitor running in minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CTALink to="/pricing" size="lg" magnetic>
            Start free <span aria-hidden>→</span>
          </CTALink>
          <CTALink to="/platform" variant="secondary" size="lg">
            Explore the platform
          </CTALink>
        </div>
        <p className="mt-4 text-xs text-white/40 light:text-slate-500">Free Starter plan · No credit card required</p>

        <ol className="mt-12 grid gap-4 text-left md:grid-cols-3">
          {FIRST_STEPS.map(step => <li key={step.n}>
            <Link to={step.href} className="group/step block h-full rounded-2xl border border-white/10 light:border-slate-900/10 bg-white/[0.03] light:bg-slate-50 p-5 backdrop-blur-sm transition-colors hover:border-white/25 light:hover:border-slate-900/25">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300 light:text-cyan-600">Step {step.n}</span>
              <span className="mt-2 flex items-center justify-between gap-3 text-base font-medium text-white light:text-slate-900">
                {step.title}
                <span aria-hidden className="text-white/40 light:text-slate-400 transition-transform group-hover/step:translate-x-1">→</span>
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-white/55 light:text-slate-500">{step.body}</span>
            </Link>
          </li>)}
        </ol>
      </div>
    </Reveal>
  </section>;
}
