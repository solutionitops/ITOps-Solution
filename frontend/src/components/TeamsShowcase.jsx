import { useCallback, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from "motion/react";
import { useTheme } from "../context/ThemeContext";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_VH_PER_TEAM = 45;
const MIN_PINNED_HEIGHT = 540;
// Scenes are drawn on a fixed canvas and scaled to fit, so they look the same at every size
const CANVAS_W = 720;
const CANVAS_H = 520;

/* ── Content ────────────────────────────────────────────────────── */

// One slide per team. Every bullet is something the product does today.
const TEAMS = [
  {
    id: "itops",
    num: "01",
    team: "IT Operations",
    tint: "#22d3ee",
    ink: "#0e7490",
    title: "Know it's down before the tickets arrive",
    body: "Every website, API and endpoint is checked around the clock. When one fails, an incident opens with the cause already attached.",
    bullets: ["Uptime, status-code and keyword checks as often as every 30s", "Incidents open and resolve by themselves", "One dashboard for the whole estate"],
    cta: { label: "Uptime monitoring", href: "/solutions/website-api-monitoring" },
    scene: "noc"
  },
  {
    id: "systems",
    num: "02",
    team: "Systems & Infrastructure",
    tint: "#60a5fa",
    ink: "#1d4ed8",
    title: "See inside every server you run",
    body: "A one-line agent on any Linux host streams CPU, memory, disk and load into the same dashboard as your websites.",
    bullets: ["One-line install — bash and curl only", "Online and offline state for every host", "Per-host keys you can rotate or revoke"],
    cta: { label: "Server monitoring", href: "/solutions/kada-nigrani" },
    scene: "rack"
  },
  {
    id: "devops",
    num: "03",
    team: "DevOps & SRE",
    tint: "#fbbf24",
    ink: "#b45309",
    title: "Ship fast without breaking what customers use",
    body: "When a release breaks something, you hear about it in the channel you already watch, and response-time history shows exactly when it changed.",
    bullets: ["Response-time history on every check", "Slack, email and webhook alerts", "Auto-resolve the moment it's fixed"],
    cta: { label: "DevOps monitoring", href: "/solutions/devops-monitor" },
    scene: "pipeline"
  },
  {
    id: "security",
    num: "04",
    team: "Cybersecurity",
    tint: "#a78bfa",
    ink: "#6d28d9",
    title: "Close the gaps attackers look for first",
    body: "Every endpoint is scored on the headers and certificates that actually stop attacks, and your people learn to spot the rest.",
    bullets: ["Security score 0–100 · HSTS, CSP and more", "SSL expiry, issuer and protocol tracking", "Cyber Sachet awareness training for staff"],
    cta: { label: "Security monitoring", href: "/solutions/security-monitoring" },
    scene: "shield"
  },
  {
    id: "company",
    num: "05",
    team: "The whole company",
    tint: "#34d399",
    ink: "#047857",
    title: "Reliability everyone can see",
    body: "Leaders get the uptime story at a glance, customers get an honest status page, and the team keeps getting sharper.",
    bullets: ["Opt-in public status page for customers", "Uptime and incident history for reviews", "ITOps Academy hands-on labs to upskill"],
    cta: { label: "See plans", href: "/pricing" },
    scene: "status"
  }
];

const toneOf = (team, isLight) => (isLight ? team.ink : team.tint);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const OK = "#10b981";
const BAD = "#ef4444";
const WARN = "#f59e0b";

/* ── Scene building blocks ──────────────────────────────────────── */

// A glass panel that follows the theme
function Glass({ className = "", style, title, right, children }) {
  return (
    <div
      className={`absolute rounded-2xl border border-white/10 bg-[#0b1224]/90 p-3.5 text-white shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md light:border-slate-900/10 light:bg-white/95 light:text-slate-900 light:shadow-[0_28px_70px_-32px_rgba(15,23,42,0.4)] ${className}`}
      style={style}
    >
      {title && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50 light:text-slate-500">{title}</p>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Pill({ color, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[9.5px] font-bold" style={{ color, background: `${color}1f` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

function Check({ color = OK }) {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="7" fill={`${color}26`} />
      <path d="M4.8 8.2l2.1 2.1 4.3-4.6" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Uptime bars: one per day; `bad` days red, `warn` days amber
function Bars({ n, bad = [], warn = [], height = 22, gap = 2 }) {
  return (
    <div className="flex items-end" style={{ gap, height }}>
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="flex-1 rounded-[2px]"
          style={{ height: "100%", background: bad.includes(i) ? BAD : warn.includes(i) ? WARN : OK, opacity: bad.includes(i) || warn.includes(i) ? 1 : 0.85 }}
        />
      ))}
    </div>
  );
}

function Spark({ points, color, width = 180, height = 48, fill = true }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const xy = points.map((v, i) => [(i / (points.length - 1)) * width, 4 + (1 - (v - min) / (max - min || 1)) * (height - 8)]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" aria-hidden>
      {fill && <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={color} opacity="0.14" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

// Soft light and a receding grid floor under every scene
function Floor({ tint, isLight }) {
  const grid = isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(148, 163, 184, 0.12)";
  return (
    <>
      <div
        className="absolute -inset-x-16 top-10 bottom-0"
        style={{ background: `radial-gradient(ellipse 60% 55% at 55% 55%, ${tint}${isLight ? "26" : "30"}, transparent 70%)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[210px]"
        style={{
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
          transform: "perspective(520px) rotateX(64deg)",
          transformOrigin: "bottom",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
          maskImage: "linear-gradient(to top, black, transparent)"
        }}
      />
    </>
  );
}

// Monitors on the NOC wall stay dark in both themes — they are screens
function Screen({ title, children }) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-white/10 bg-gradient-to-b from-[#0d1528] to-[#080d1a] p-3 text-white">
      <p className="mb-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/45">{title}</p>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

/* ── Scene 1: IT Operations — the NOC wall ──────────────────────── */

function NocScene({ isLight }) {
  const endpoints = [
    ["shop.example.com", OK, "142 ms"],
    ["api.example.com", OK, "191 ms"],
    ["lb.us-west-2", OK, "212 ms"],
    ["status.example.com", OK, "98 ms"],
    ["mail.example.com", WARN, "slow"]
  ];
  return (
    <>
      <Floor tint="#22d3ee" isLight={isLight} />
      <div
        className="absolute left-[34px] top-[34px] h-[372px] w-[652px]"
        style={{ transform: "perspective(1700px) rotateY(-15deg) rotateX(5deg)", transformOrigin: "62% 50%" }}
      >
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-2.5 rounded-[22px] border border-white/10 bg-[#05080f] p-2.5 shadow-[0_50px_120px_-40px_rgba(34,211,238,0.55)]">
          <Screen title="Uptime · 30 days">
            <p className="text-[34px] font-semibold leading-none tracking-tight">
              99.98<span className="text-lg text-white/45">%</span>
            </p>
            <div className="mt-4">
              <Bars n={30} warn={[17]} height={28} />
            </div>
          </Screen>
          <Screen title="Endpoints">
            <div className="space-y-1.5">
              {endpoints.map(([host, color, value]) => (
                <div key={host} className="flex items-center gap-2 text-[10.5px]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                  <span className="truncate text-white/80">{host}</span>
                  <span className="ml-auto shrink-0 font-mono text-[9.5px]" style={{ color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Screen>
          <Screen title="Response time">
            <Spark points={[150, 146, 158, 141, 139, 152, 147, 143, 161, 149, 142, 138, 145, 151, 140, 142]} color="#22d3ee" height={70} />
            <p className="mt-1 font-mono text-[9.5px] text-cyan-300">142 ms now</p>
          </Screen>
          <Screen title="Checks">
            <div className="flex h-full items-center gap-3">
              <div className="relative h-16 w-16 shrink-0">
                <span className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                <span className="animate-orbit-spin-slow absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400" />
                <span className="absolute inset-0 grid place-items-center font-mono text-[11px] font-bold text-cyan-300">30s</span>
              </div>
              <p className="text-[11px] leading-snug text-white/70">
                Every endpoint,
                <br />
                around the clock
              </p>
            </div>
          </Screen>
          <Screen title="Incidents">
            <div className="space-y-2 text-[10.5px]">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <p className="font-semibold text-emerald-300">#2484 · Resolved</p>
                <p className="text-white/60">api.example.com · 8 min</p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2">
                <p className="font-semibold text-amber-300">#2485 · Open</p>
                <p className="text-white/60">mail.example.com · slow</p>
              </div>
            </div>
          </Screen>
          <Screen title="Alerts delivered">
            <div className="space-y-2 text-[10.5px]">
              {["Slack · #on-call", "Email · ops@", "Webhook · your tools"].map((row) => (
                <div key={row} className="flex items-center gap-2 text-white/80">
                  <Check />
                  {row}
                </div>
              ))}
            </div>
          </Screen>
        </div>
      </div>
      {/* A toast in front of the wall gives the scene depth */}
      <motion.div
        className="absolute left-[18px] top-[392px] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1224]/95 px-4 py-3 text-white shadow-2xl light:border-slate-900/10 light:bg-white light:text-slate-900"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
      >
        <Check />
        <div className="text-[12px] leading-tight">
          <p className="font-semibold">api.example.com recovered</p>
          <p className="text-white/55 light:text-slate-500">Incident #2484 auto-resolved · 191 ms</p>
        </div>
      </motion.div>
    </>
  );
}

/* ── Scene 2: Systems — the server rack ─────────────────────────── */

function RackScene({ isLight }) {
  const units = 9;
  const scale = 230 / 260;
  const unitY = (i) => 20 + (42 + i * 46 + 19) * scale;
  const hosts = [
    ["prod-web-01", OK, "Online"],
    ["prod-web-02", OK, "Online"],
    ["edge-syd-01", OK, "Online"],
    ["db-backup-02", WARN, "Seen 4m ago"]
  ];
  return (
    <>
      <Floor tint="#60a5fa" isLight={isLight} />
      {/* Links from the rack to what it reports */}
      <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {[
          [418, unitY(0), 470, 96],
          [250, unitY(6), 282, 348],
          [418, unitY(7), 470, 350]
        ].map(([x1, y1, x2, y2], i) => (
          <path key={i} d={`M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}`} fill="none" stroke="#60a5fa" strokeOpacity="0.6" strokeWidth="1.4" strokeDasharray="0.1 5" strokeLinecap="round" className="animate-orbit-dash" />
        ))}
      </svg>
      {/* The rack, drawn isometric; it stays metal-dark in both themes */}
      <svg viewBox="0 0 260 480" className="absolute left-[250px] top-[20px] w-[230px] drop-shadow-[0_40px_60px_rgba(0,0,0,0.5)]" aria-hidden>
        <defs>
          <linearGradient id="rack-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#253049" />
            <stop offset="1" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="rack-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0b1220" />
            <stop offset="1" stopColor="#1a2336" />
          </linearGradient>
        </defs>
        <polygon points="0,30 50,0 240,0 190,30" fill="#2d3a55" />
        <polygon points="190,30 240,0 240,440 190,470" fill="url(#rack-side)" />
        <rect x="0" y="30" width="190" height="440" rx="4" fill="url(#rack-front)" />
        {Array.from({ length: units }, (_, i) => {
          const y = 42 + i * 46;
          const warn = i === 7;
          return (
            <g key={i}>
              <rect x="10" y={y} width="170" height="38" rx="3" fill="#0a1020" stroke="#2b3753" />
              {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                <rect key={v} x={70 + v * 14} y={y + 11} width="8" height="16" rx="1.5" fill="#1b2539" />
              ))}
              <circle cx="24" cy={y + 13} r="3.2" fill={warn ? WARN : OK} className="animate-pulse" style={{ animationDelay: `${-i * 0.37}s`, animationDuration: warn ? "0.9s" : "2.2s" }} />
              <circle cx="36" cy={y + 13} r="3.2" fill="#38bdf8" opacity="0.8" className="animate-pulse" style={{ animationDelay: `${-i * 0.61}s` }} />
              <rect x="18" y={y + 24} width="34" height="4" rx="2" fill="#1f2a40" />
            </g>
          );
        })}
      </svg>
      <Glass className="left-[470px] top-[56px] w-[226px]" title="prod-web-01" right={<Pill color={OK}>Online</Pill>}>
        {[
          ["CPU", 34],
          ["Memory", 61],
          ["Disk", 72]
        ].map(([label, value]) => (
          <div key={label} className="mb-2">
            <div className="mb-1 flex justify-between text-[10.5px]">
              <span className="text-white/65 light:text-slate-500">{label}</span>
              <span className="font-mono font-semibold">{value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 light:bg-slate-900/10">
              <div className="h-full rounded-full" style={{ width: `${value}%`, background: value > 70 ? WARN : "#60a5fa" }} />
            </div>
          </div>
        ))}
        <div className="flex justify-between text-[10.5px]">
          <span className="text-white/65 light:text-slate-500">Load average</span>
          <span className="font-mono font-semibold">0.42</span>
        </div>
      </Glass>
      <Glass className="left-[18px] top-[300px] w-[264px]" title="Install on a host">
        <div className="rounded-lg bg-black/50 p-2.5 font-mono text-[10px] leading-relaxed text-slate-200 light:bg-slate-900">
          <p>
            <span className="text-emerald-400">$</span> curl -fsSL …/kada-nigrani-agent.sh
          </p>
          <p className="text-emerald-400">✓ agent installed</p>
          <p className="text-white/50">→ reporting every minute</p>
        </div>
      </Glass>
      <Glass className="left-[470px] top-[312px] w-[226px]" title="Hosts">
        <div className="space-y-1.5">
          {hosts.map(([name, color, state]) => (
            <div key={name} className="flex items-center gap-2 text-[10.5px]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <span className="font-mono">{name}</span>
              <span className="ml-auto" style={{ color }}>
                {state}
              </span>
            </div>
          ))}
        </div>
      </Glass>
    </>
  );
}

/* ── Scene 3: DevOps — a release, a break, a rollback ───────────── */

function PipelineScene({ isLight }) {
  const stages = ["Commit", "Build", "Test", "Deploy"];
  const muted = isLight ? "#64748b" : "#94a3b8";
  // Response time: normal, a failing stretch after the release, then normal after the rollback
  const normal = [188, 184, 192, 186, 181, 190, 187];
  const after = [189, 185, 191, 186, 183];
  const w = 600;
  const h = 150;
  const x = (i, n, from, to) => from + (i / (n - 1)) * (to - from);
  const y = (v) => 30 + (1 - (v - 170) / 40) * 80;
  const left = normal.map((v, i) => `${i ? "L" : "M"}${x(i, normal.length, 0, 230).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const right = after.map((v, i) => `${i ? "L" : "M"}${x(i, after.length, 400, w).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <>
      <Floor tint="#fbbf24" isLight={isLight} />
      <Glass className="left-[30px] top-[24px] w-[660px]" title="Pipeline · checkout-service">
        <div className="flex items-center">
          {stages.map((stage, i) => (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-emerald-400/70 bg-emerald-400/10">
                  <Check />
                </span>
                <span className="text-[11.5px] font-semibold">{stage}</span>
              </div>
              {i < stages.length - 1 && (
                <span className="relative mx-3 h-px flex-1 bg-emerald-400/40">
                  <motion.span
                    className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-amber-300 shadow-[0_0_10px_#fbbf24]"
                    animate={{ left: ["0%", "100%"] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear", delay: i * 0.6 }}
                  />
                </span>
              )}
            </div>
          ))}
          <span className="ml-4 rounded-full bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300 light:text-amber-700">v2.4.1</span>
        </div>
      </Glass>
      <Glass className="left-[30px] top-[128px] w-[660px]" title="Response time · api.example.com" right={<Pill color={OK}>Recovered</Pill>}>
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" aria-hidden>
          <rect x="240" y="18" width="150" height="112" rx="6" fill={BAD} opacity="0.13" />
          {[250, 270, 290, 310, 330, 350, 370].map((cx) => (
            <circle key={cx} cx={cx} cy="74" r="3.5" fill={BAD} />
          ))}
          <path d={left} fill="none" stroke={OK} strokeWidth="2.2" strokeLinejoin="round" />
          <path d={right} fill="none" stroke={OK} strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="236" x2="236" y1="10" y2="140" stroke="#fbbf24" strokeDasharray="4 4" />
          <line x1="394" x2="394" y1="10" y2="140" stroke={OK} strokeDasharray="4 4" />
          <text x="236" y="148" textAnchor="middle" fontSize="11" fill="#f59e0b" fontFamily="ui-monospace, monospace">
            14:02 release
          </text>
          <text x="315" y="40" textAnchor="middle" fontSize="11" fill={BAD} fontFamily="ui-monospace, monospace">
            502 errors
          </text>
          <text x="394" y="148" textAnchor="middle" fontSize="11" fill={OK} fontFamily="ui-monospace, monospace">
            14:08 rollback
          </text>
          <text x="600" y="24" textAnchor="end" fontSize="11" fill={muted} fontFamily="ui-monospace, monospace">
            189 ms
          </text>
        </svg>
      </Glass>
      <Glass className="left-[30px] top-[362px] w-[300px]" title="Incident #2491">
        <div className="space-y-1.5 text-[11px]">
          {[
            ["14:03", "Opened · 502 Bad Gateway", BAD],
            ["14:04", "Acknowledged by on-call", WARN],
            ["14:09", "Checks passing · auto-resolved", OK]
          ].map(([time, what, color]) => (
            <div key={time} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
              <span className="w-10 font-mono text-[10px] text-white/45 light:text-slate-400">{time}</span>
              <span>{what}</span>
            </div>
          ))}
        </div>
      </Glass>
      <Glass className="left-[350px] top-[362px] w-[340px]" title="#deploys · Slack">
        <div className="space-y-2 text-[11px] leading-snug">
          <p>
            <span className="font-semibold text-red-400 light:text-red-600">Down</span> · api.example.com returned 502 (expected 200) since 14:03
          </p>
          <p>
            <span className="font-semibold text-emerald-400 light:text-emerald-600">Resolved</span> · checks passing again at 14:09
          </p>
        </div>
      </Glass>
    </>
  );
}

/* ── Scene 4: Cybersecurity — the shield ────────────────────────── */

function ShieldScene({ isLight }) {
  const score = 92;
  const arc = Math.PI * 52;
  return (
    <>
      <Floor tint="#a78bfa" isLight={isLight} />
      {/* Rings and shield at the centre */}
      <div className="absolute left-[200px] top-[70px] h-[320px] w-[320px]">
        <span className="animate-orbit-spin-slow absolute inset-0 rounded-full border border-dashed border-violet-400/40" />
        <span className="absolute inset-[34px] rounded-full border border-violet-400/25" style={{ animation: "orbit-spin 22s linear infinite reverse" }} />
        <span className="absolute inset-[70px] rounded-full bg-violet-500/15 blur-2xl" />
        <svg viewBox="0 0 120 140" className="absolute left-1/2 top-1/2 h-[190px] w-[163px] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_40px_rgba(124,58,237,0.55)]" aria-hidden>
          <defs>
            <linearGradient id="shield-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c4b5fd" />
              <stop offset="0.5" stopColor="#8b5cf6" />
              <stop offset="1" stopColor="#4c1d95" />
            </linearGradient>
          </defs>
          <path d="M60 4l50 18v38c0 34-22 62-50 74C32 122 10 94 10 60V22z" fill="url(#shield-fill)" />
          <path d="M60 4l50 18v38c0 34-22 62-50 74" fill="#ffffff" opacity="0.12" />
          <rect x="42" y="62" width="36" height="30" rx="5" fill="#ffffff" />
          <path d="M48 62v-8a12 12 0 0 1 24 0v8" fill="none" stroke="#ffffff" strokeWidth="6" />
          <circle cx="60" cy="75" r="4" fill="#6d28d9" />
          <rect x="58.5" y="76" width="3" height="9" rx="1.5" fill="#6d28d9" />
        </svg>
      </div>
      <Glass className="left-[18px] top-[40px] w-[200px]" title="Security score">
        <svg viewBox="0 0 120 70" className="h-auto w-full" aria-hidden>
          <path d="M8 62a52 52 0 0 1 104 0" fill="none" stroke={isLight ? "#e2e8f0" : "rgba(255,255,255,0.1)"} strokeWidth="9" strokeLinecap="round" />
          <path d="M8 62a52 52 0 0 1 104 0" fill="none" stroke="#a78bfa" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(arc * score) / 100} ${arc}`} />
          <text x="60" y="58" textAnchor="middle" fontSize="24" fontWeight="700" fill="currentColor">
            {score}
          </text>
        </svg>
        <p className="text-center text-[10.5px] text-white/60 light:text-slate-500">out of 100 · shop.example.com</p>
      </Glass>
      <Glass className="left-[18px] top-[266px] w-[214px]" title="Security headers">
        <div className="space-y-1.5 text-[11px]">
          {[
            ["Strict-Transport-Security", OK],
            ["Content-Security-Policy", OK],
            ["X-Frame-Options", OK],
            ["Cookie Secure flag", WARN]
          ].map(([name, color]) => (
            <div key={name} className="flex items-center gap-2">
              <Check color={color} />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      </Glass>
      <Glass className="left-[500px] top-[52px] w-[204px]" title="Certificate" right={<Pill color={OK}>Valid</Pill>}>
        <p className="font-mono text-[12px] font-semibold">*.example.com</p>
        <div className="mt-2 space-y-1 text-[10.5px] text-white/65 light:text-slate-500">
          <p>Protocol · TLS 1.3</p>
          <p>Issuer tracked · chain OK</p>
          <p>
            Expires in <span className="font-semibold text-emerald-400 light:text-emerald-600">84 days</span>
          </p>
        </div>
      </Glass>
      <Glass className="left-[492px] top-[280px] w-[212px]" title="Cyber Sachet training">
        <div className="space-y-1.5 text-[11px]">
          {["Phishing awareness", "Password security & MFA", "Social engineering"].map((course) => (
            <div key={course} className="flex items-center gap-2">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-violet-500/20 text-[9px] text-violet-300 light:text-violet-700">▶</span>
              {course}
            </div>
          ))}
        </div>
      </Glass>
    </>
  );
}

/* ── Scene 5: The whole company — the status page ───────────────── */

function StatusScene({ isLight }) {
  const components = [
    ["Website", [], []],
    ["API", [31], [30]],
    ["Checkout", [], [12]],
    ["Servers", [], []]
  ];
  return (
    <>
      <Floor tint="#34d399" isLight={isLight} />
      <Glass className="left-[24px] top-[28px] w-[488px] !p-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5 light:border-slate-900/10">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400/70" />
            <span className="h-2 w-2 rounded-full bg-amber-400/70" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          </span>
          <span className="ml-2 flex-1 rounded-md bg-white/5 px-2 py-1 font-mono text-[10.5px] text-white/60 light:bg-slate-100 light:text-slate-500">status.example.com</span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/15 px-3.5 py-3">
            <Check />
            <p className="text-[14px] font-semibold text-emerald-300 light:text-emerald-700">All systems operational</p>
          </div>
          <div className="mt-4 space-y-3.5">
            {components.map(([name, bad, warn]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-semibold">{name}</span>
                  <span className="text-white/50 light:text-slate-400">{bad.length ? "99.93%" : warn.length ? "99.97%" : "100%"} · 45 days</span>
                </div>
                <Bars n={45} bad={bad} warn={warn} height={20} gap={2} />
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-white/60 light:border-slate-900/10 light:text-slate-500">
            <span className="font-semibold text-white/85 light:text-slate-700">Past incident</span> · API outage · resolved in 6 min
          </p>
        </div>
      </Glass>
      <Glass className="left-[526px] top-[48px] w-[184px]" title="Uptime this quarter">
        <p className="text-[36px] font-semibold leading-none tracking-tight">
          99.98<span className="text-lg text-white/45 light:text-slate-400">%</span>
        </p>
        <div className="mt-3">
          <Spark points={[99.9, 99.95, 99.97, 99.93, 99.99, 99.98, 99.98]} color="#34d399" height={40} />
        </div>
      </Glass>
      <Glass className="left-[520px] top-[300px] w-[180px]" title="ITOps Academy">
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <Check />
            Linux fundamentals lab
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-amber-400 border-r-transparent" />
            RHEL essentials
          </div>
        </div>
      </Glass>
    </>
  );
}

const SCENES = { noc: NocScene, rack: RackScene, pipeline: PipelineScene, shield: ShieldScene, status: StatusScene };

// Scales the fixed-size scene canvas to fit its box
function SceneCanvas({ scene, isLight }) {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      setScale(Math.min(width / CANVAS_W, height / CANVAS_H, 1.2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  const Scene = SCENES[scene];
  return (
    <div ref={boxRef} className="absolute inset-0">
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `translate(-50%, -50%) scale(${scale})`, opacity: scale ? 1 : 0 }}
      >
        <Scene isLight={isLight} />
        <span className="absolute bottom-1 right-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35 light:text-slate-400">
          Illustration · sample data
        </span>
      </div>
    </div>
  );
}

/* ── Slide text ─────────────────────────────────────────────────── */

function SlideText({ team, index, isLight }) {
  const tone = toneOf(team, isLight);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl font-semibold" style={{ color: tone }}>
          {team.num}
        </span>
        <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.24em] text-white/45 light:text-slate-500">
          {team.team} · {index + 1} / {TEAMS.length}
        </span>
      </div>
      <h3
        className="mt-3 font-semibold tracking-tight text-white light:text-slate-900"
        style={{ fontSize: "clamp(1.45rem, min(4.8vh, 3.3vw), 3.1rem)", lineHeight: 1.06 }}
      >
        {team.title}
      </h3>
      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-white/65 sm:text-[15px] lg:mt-4 light:text-slate-600">{team.body}</p>
      <ul className="mt-4 space-y-1.5 lg:mt-5 lg:space-y-2">
        {team.bullets.map((bullet, i) => (
          <li
            key={bullet}
            className={`flex gap-2.5 text-[13px] text-white/80 sm:text-[14px] light:text-slate-700 ${i === 2 ? "[@media(max-height:699px)]:hidden" : ""}`}
          >
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tone }} />
            {bullet}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex gap-2.5 sm:gap-3 lg:mt-7">
        <Link
          to={team.cta.href}
          className="whitespace-nowrap rounded-full border border-white/20 px-4 py-2.5 text-[10.5px] sm:px-5 sm:text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10 light:border-slate-900/15 light:text-slate-800 light:hover:bg-slate-900/5"
        >
          {team.cta.label}
        </Link>
        <Link
          to="/pricing"
          className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full py-2.5 pl-4 pr-2.5 text-[10.5px] sm:pl-5 sm:text-[11.5px] font-semibold uppercase tracking-[0.14em]"
          // Bright tints carry dark text; the deeper light-mode inks carry white
          style={{ background: tone, color: isLight ? "#ffffff" : "#050811", boxShadow: `0 12px 30px -12px ${team.tint}` }}
        >
          Start free
          <span className="grid h-6 w-6 place-items-center rounded-full bg-white/30 transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Intro: clean, before the slides ────────────────────────────── */

function Intro({ onPick, isLight }) {
  return (
    <section className="relative overflow-hidden bg-[#050811] px-6 pb-16 pt-24 text-white md:px-10 md:pb-20 md:pt-32 light:bg-white light:text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[900px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{ background: `radial-gradient(closest-side, ${isLight ? "rgba(56,189,248,0.12)" : "rgba(56,189,248,0.1)"}, transparent)` }}
      />
      <div className="relative mx-auto max-w-6xl text-center">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.3em] text-white/50 light:text-slate-500">Who it's for</p>
        <h2 className="mt-4 text-[clamp(2.4rem,7vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.035em]">Reliable systems.</h2>
        <p
          className="orbit-gradient-text mt-1 inline-block pb-[0.1em] text-[clamp(1.9rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
          style={{
            backgroundImage: isLight
              ? "linear-gradient(100deg, #0891b2 0%, #2563eb 25%, #7c3aed 50%, #2563eb 75%, #0891b2 100%)"
              : "linear-gradient(100deg, #00f0ff 0%, #3b82f6 25%, #a78bfa 50%, #3b82f6 75%, #00f0ff 100%)"
          }}
        >
          For every team that runs them.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-white/60 md:text-base light:text-slate-600">
          IT, systems, DevOps and security teams each get the view they need — and the whole company gets systems that stay up and stay secure.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 md:grid-cols-5">
          {TEAMS.map((team, i) => (
            <button key={team.id} type="button" onClick={() => onPick(i)} className="group cursor-pointer text-center focus:outline-none">
              <span className="block font-mono text-xl font-semibold" style={{ color: toneOf(team, isLight) }}>
                {team.num}
              </span>
              <span className="mt-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/55 transition-colors group-hover:text-white light:text-slate-500 light:group-hover:text-slate-900">
                {team.team}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 light:text-slate-400">Scroll to meet your team ↓</p>
      </div>
    </section>
  );
}

/* ── Pinned slides ──────────────────────────────────────────────── */

function steppedRange(count) {
  const last = count - 1;
  const hold = 0.35 / last;
  const input = [];
  const output = [];
  for (let i = 0; i <= last; i += 1) {
    const center = i / last;
    if (i > 0) {
      input.push(center - hold);
      output.push(i);
    }
    input.push(i === 0 ? 0 : center);
    output.push(i);
    if (i < last) {
      input.push(center + hold);
      output.push(i);
    }
  }
  return [input, output];
}

function navClearance(width, height) {
  if (width < 1140) return 96;
  return height < 760 ? 84 : 104;
}

// One segment of the progress rail; it fills as you scroll through its slide
function RailSegment({ team, index, progress, active, onPick, isLight }) {
  const fill = useTransform(progress, (v) => clamp01(v * TEAMS.length - index));
  return (
    <button type="button" onClick={() => onPick(index)} aria-label={`${team.team}`} aria-current={active} className="group flex flex-1 cursor-pointer flex-col gap-2 text-left focus:outline-none">
      <span className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/15 light:bg-slate-900/10">
        <motion.span className="absolute inset-0 origin-left" style={{ scaleX: fill, background: toneOf(team, isLight) }} />
      </span>
      <span
        className={`hidden truncate font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] transition-colors md:block ${
          active ? "text-white light:text-slate-900" : "text-white/35 group-hover:text-white/70 light:text-slate-400 light:group-hover:text-slate-700"
        }`}
      >
        {team.team}
      </span>
    </button>
  );
}

function PinnedTeams({ trackRef, isLight, reduceMotion }) {
  const count = TEAMS.length;
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const [frame, setFrame] = useState(null);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const [input, output] = useMemo(() => steppedRange(count), [count]);
  const stepped = useTransform(scrollYProgress, input, output);
  useMotionValueEvent(stepped, "change", (v) => setActive(Math.round(v)));

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      setFrame({ width, height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    setActive(Math.round(clamp01(-track.getBoundingClientRect().top / distance) * (count - 1)));
  }, [trackRef, count]);

  const goTo = useCallback(
    (index) => {
      const track = trackRef.current;
      if (!track) return;
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const top = track.getBoundingClientRect().top + window.scrollY + (Math.min(count - 1, Math.max(0, index)) / (count - 1)) * distance;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [trackRef, count, reduceMotion]
  );

  const team = TEAMS[active];
  return (
    <section
      ref={trackRef}
      id="teams"
      aria-label="Who it's for"
      className="relative w-full bg-[#050811] light:bg-white"
      style={{ height: `${count * SCROLL_VH_PER_TEAM + 100}vh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 isolate h-svh w-full overflow-hidden bg-[#050811] text-white light:bg-white light:text-slate-900"
        style={{ "--orbit-tint": toneOf(team, isLight), transition: "--orbit-tint 0.7s ease" }}
      >
        {/* Clean backdrop: one soft light in the team's colour */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-10%] top-1/2 -z-10 h-[80%] w-[70%] -translate-y-1/2 rounded-full blur-[120px] transition-colors duration-700"
          style={{ background: `radial-gradient(closest-side, color-mix(in srgb, var(--orbit-tint) ${isLight ? 14 : 18}%, transparent), transparent)` }}
        />
        <div
          className="relative mx-auto flex h-full max-w-7xl flex-col px-5 pb-5 pt-24 sm:px-8"
          style={frame ? { paddingTop: navClearance(frame.width, frame.height) } : undefined}
        >
          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,34svh)_auto] content-center gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:items-center lg:gap-10">
            <div className="relative order-1 h-full min-h-0 lg:order-2 lg:mr-[min(-1rem,calc((80rem_-_100vw)/4_-_1rem))]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={team.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <SceneCanvas scene={team.scene} isLight={isLight} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="order-2 min-w-0 lg:order-1">
              <AnimatePresence mode="wait" initial={false}>
                <SlideText key={team.id} team={team} index={active} isLight={isLight} />
              </AnimatePresence>
            </div>
          </div>
          <div className="mt-4 shrink-0">
            <div className="mb-2.5 flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40 light:text-slate-500">
              <span>Who it's for</span>
              <span>
                {team.num} / 0{count}
              </span>
            </div>
            <div className="flex gap-2 md:gap-3">
              {TEAMS.map((t, i) => (
                <RailSegment key={t.id} team={t} index={i} progress={scrollYProgress} active={i === active} onPick={goTo} isLight={isLight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Short screens: every team, one after another ───────────────── */

const SHORT_QUERY = `(max-height: ${MIN_PINNED_HEIGHT - 1}px)`;
function subscribeViewport(onChange) {
  const query = window.matchMedia(SHORT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTooShortToPin = () => window.matchMedia(SHORT_QUERY).matches;

function StackedTeams({ isLight }) {
  return (
    <section id="teams" aria-label="Who it's for" className="bg-[#050811] px-6 pb-16 text-white light:bg-white light:text-slate-900">
      <div className="mx-auto max-w-5xl space-y-14">
        {TEAMS.map((team, i) => (
          <div key={team.id} id={`team-${team.id}`} className="grid items-center gap-6 md:grid-cols-2">
            <div className="relative aspect-[720/520] w-full">
              <SceneCanvas scene={team.scene} isLight={isLight} />
            </div>
            <SlideText team={team} index={i} isLight={isLight} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Section ────────────────────────────────────────────────────── */

export function TeamsShowcase() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const reduceMotion = useReducedMotion();
  const tooShort = useSyncExternalStore(subscribeViewport, isTooShortToPin, () => false);
  const trackRef = useRef(null);

  // The intro's team list jumps straight to that team's slide
  const pick = useCallback(
    (index) => {
      if (tooShort) {
        document.getElementById(`team-${TEAMS[index].id}`)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        return;
      }
      const track = trackRef.current;
      if (!track) return;
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const top = track.getBoundingClientRect().top + window.scrollY + (index / (TEAMS.length - 1)) * distance;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [tooShort, reduceMotion]
  );

  return (
    <MotionConfig reducedMotion="user">
      <Intro onPick={pick} isLight={isLight} />
      {tooShort ? <StackedTeams isLight={isLight} /> : <PinnedTeams trackRef={trackRef} isLight={isLight} reduceMotion={reduceMotion} />}
    </MotionConfig>
  );
}
