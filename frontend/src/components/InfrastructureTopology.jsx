import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { BrandMark } from "./BrandLogo";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_VH_PER_ITEM = 40;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

function Icon({ name, className = "h-4 w-4" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  switch (name) {
    case "monitor":
      // Website & API Monitoring
      return (
        <svg {...common}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="M6 10l3.5-3.5 3 3 2.5-2.5 3 3" />
        </svg>
      );
    case "server":
      // Server Monitoring (Kada Nigrani)
      return (
        <svg {...common}>
          <rect x="2" y="3" width="20" height="7" rx="2" />
          <rect x="2" y="14" width="20" height="7" rx="2" />
          <path d="M6 6.5h.01M6 17.5h.01M10 6.5h8M10 17.5h8" />
        </svg>
      );
    case "devops":
      // DevOps Monitoring
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="9" r="3" />
          <path d="M6 9v6" />
          <path d="M6 12a6 6 0 0 0 6-6" />
          <path d="M12 6h3" />
        </svg>
      );
    case "academy":
      // Moonsav ITOps Academy
      return (
        <svg {...common}>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      );
    case "cybersachet":
      // Cyber Awareness (CyberSachet)
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
    case "security":
      // Security Monitoring
      return (
        <svg {...common}>
          <path d="M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "incident":
      // Incident Management
      return (
        <svg {...common}>
          <path d="M10.3 3.5l-8.5 14.8c-.8 1.4.2 3.2 1.8 3.2h16.8c1.6 0 2.6-1.8 1.8-3.2L13.7 3.5c-.8-1.4-2.6-1.4-3.4 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      );
    case "network":
      // Network & Device Monitoring
      return (
        <svg {...common}>
          <rect x="3" y="16" width="6" height="5" rx="1" />
          <rect x="15" y="16" width="6" height="5" rx="1" />
          <rect x="9" y="3" width="6" height="5" rx="1" />
          <path d="M12 8v5M6 16v-3h12v3" />
        </svg>
      );
    default:
      return null;
  }
}

// Exactly the 8 requested platform solutions
const PLATFORM_NODES = [
  {
    id: "website-api",
    icon: "monitor",
    short: "Website & API",
    title: "Website & API Monitoring",
    subtitle: "UPTIME & HEALTH",
    badge: "Live",
    desc: "Continuous HTTP, API endpoint, SSL, and DNS checks every 30s with instant outage alerts and multi-hop redirect tracing.",
    stats: ["30s check interval", "SSL expiry", "Global latency"],
    href: "/solutions/website-api-monitoring",
    tint: "#10b981",
    dotColor: "bg-emerald-500"
  },
  {
    id: "server-nigrani",
    icon: "server",
    short: "Server Monitoring",
    title: "Server Monitoring (Kada Nigrani)",
    subtitle: "HOST TELEMETRY",
    badge: "Live",
    desc: "Real-time CPU, RAM, disk metrics, load averages, and active process inspection on any Linux host with a 1-line bash agent.",
    stats: ["1-line agent", "Live process metrics", "Revocable keys"],
    href: "/solutions/kada-nigrani",
    tint: "#0ea5e9",
    dotColor: "bg-sky-500"
  },
  {
    id: "devops-monitoring",
    icon: "devops",
    short: "DevOps Monitoring",
    title: "DevOps Monitoring",
    subtitle: "CI/CD & RUNTIMES",
    badge: null,
    desc: "End-to-end visibility into deployment pipelines, container health, build runtimes, and engineering release velocity.",
    stats: ["Pipeline telemetry", "Container health", "GitOps ready"],
    href: "/solutions/devops-monitor",
    tint: "#6366f1",
    dotColor: "bg-indigo-500"
  },
  {
    id: "itops-academy",
    icon: "academy",
    short: "ITOps Academy",
    title: "Moonsav ITOps Academy",
    subtitle: "HANDS-ON SRE LABS",
    badge: null,
    desc: "Interactive Linux internals, production Docker/K8s diagnostics, real-time telemetry labs, and industry credentials.",
    stats: ["Interactive Linux labs", "Production SRE", "Industry certs"],
    href: "/academy",
    tint: "#a855f7",
    dotColor: "bg-purple-500"
  },
  {
    id: "cybersachet",
    icon: "cybersachet",
    short: "Cyber Awareness",
    title: "Cyber Awareness (CyberSachet)",
    subtitle: "HUMAN DEFENSE",
    badge: "Live",
    // Matches the CyberSachet product page: phishing simulations and compliance
    // reporting are roadmap items there, so they are not claimed here.
    desc: "Structured security-awareness courses, each ending in a scored quiz, with completion tracked per employee and licensing per organization.",
    stats: ["Structured courses", "Scored quizzes", "Progress tracking"],
    href: "/cybersachet",
    tint: "#f59e0b",
    dotColor: "bg-amber-500"
  },
  {
    id: "security-monitoring",
    icon: "security",
    short: "Security Monitoring",
    title: "Security Monitoring",
    subtitle: "PERIMETER DEFENSE",
    badge: null,
    desc: "0–100 security scoring, CSP & HSTS header enforcement, open port vulnerability scans, and sensitive header leak detection.",
    stats: ["0–100 score", "CSP / HSTS check", "Port scanner"],
    href: "/solutions/security-monitoring",
    tint: "#14b8a6",
    dotColor: "bg-teal-500"
  },
  {
    id: "incident-management",
    icon: "incident",
    short: "Incident Management",
    title: "Incident Management",
    subtitle: "COMMAND & RESOLUTION",
    badge: null,
    desc: "Automatic incident creation, Slack/webhook routing, and self-healing auto-resolve the moment a service recovers.",
    stats: ["Slack / webhooks", "Smart dedup", "Auto-resolve"],
    href: "/solutions/alerting-incident-response",
    tint: "#f43f5e",
    dotColor: "bg-rose-500"
  },
  {
    id: "network-device",
    icon: "network",
    short: "Network & Device",
    title: "Network & Device Monitoring",
    subtitle: "EDGE & HARDWARE",
    badge: "Live",
    desc: "Monitor routers, switches, edge devices, bandwidth saturation, packet loss, and latency across distributed nodes.",
    stats: ["SNMP / ping", "Bandwidth", "Hardware uptime"],
    href: "/solutions/infrastructure-monitor",
    tint: "#38bdf8",
    dotColor: "bg-cyan-500"
  }
];

const COUNT = PLATFORM_NODES.length;
const SLICE = 360 / COUNT; // 45deg

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

/* ── Solar system model ─────────────────────────────────────────── */

// The ITOps core is the sun; its colours come from the site's signature
// gradient (--grad-brand: cyan → blue → violet) so it matches every CTA.
const CORE_COLOR = "#22d3ee";

const INDEX_BY_ID = Object.fromEntries(PLATFORM_NODES.map((node, index) => [node.id, index]));

// Modules that feed each other — drawn as correlation arcs between planets
const LINKS = [
  ["website-api", "incident-management"],
  ["website-api", "security-monitoring"],
  ["website-api", "network-device"],
  ["server-nigrani", "devops-monitoring"],
  ["server-nigrani", "network-device"],
  ["server-nigrani", "incident-management"],
  ["server-nigrani", "itops-academy"],
  ["devops-monitoring", "incident-management"],
  ["devops-monitoring", "itops-academy"],
  ["itops-academy", "cybersachet"],
  ["cybersachet", "security-monitoring"],
  ["cybersachet", "incident-management"],
  ["security-monitoring", "network-device"]
].map(([a, b]) => [INDEX_BY_ID[a], INDEX_BY_ID[b]]);

const RELATED = PLATFORM_NODES.map((_, index) =>
  LINKS.flatMap(([a, b]) => (a === index ? [b] : b === index ? [a] : []))
);

function mixHex(from, to, t) {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const channel = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

// Sphere palette per planet: lit highlight, body colour, shadowed limb
const PALETTES = PLATFORM_NODES.map((node) => ({
  light: mixHex(node.tint, "#ffffff", 0.55),
  base: node.tint,
  deep: mixHex(node.tint, "#020617", 0.5)
}));

/* ── Orbit math ─────────────────────────────────────────────────── */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const easeOutBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

const FRONT_SCALE = 1.12;
const BACK_SCALE = 0.72;
const LINK_BEND = 0.35;

// On first view the planets are flung out of the sun one after another.
const INTRO_STAGGER = 0.06;
function introProgress(index, k) {
  return clamp01((k - index * INTRO_STAGGER) / (1 - (COUNT - 1) * INTRO_STAGGER));
}

// Radians from 6 o'clock — the front of the orbit, nearest the viewer and the card.
function orbitAngle(index, r, k) {
  const spiral = (1 - easeOutCubic(introProgress(index, k))) * 120;
  return ((index * SLICE + r - spiral) * Math.PI) / 180;
}

// Screen position, depth and size of every planet for one frame
function computeLayout(r, k, geometry) {
  return PLATFORM_NODES.map((_, index) => {
    const p = introProgress(index, k);
    const angle = orbitAngle(index, r, k);
    const reach = easeOutBack(p);
    const depth = Math.cos(angle); // 1 = front of the orbit, -1 = behind the sun
    const front = (1 + depth) / 2;
    return {
      x: Math.sin(angle) * geometry.radiusX * reach,
      y: depth * geometry.radiusY * reach,
      depth,
      front,
      scale: (BACK_SCALE + (FRONT_SCALE - BACK_SCALE) * front) * (0.3 + 0.7 * easeOutCubic(p)),
      opacity: (0.5 + 0.5 * front) * clamp01(p * 2.5),
      reveal: clamp01(p * 1.5)
    };
  });
}

// Light each sphere from the sun: highlight on the sun-facing side,
// terminator shadow on the far side.
function planetShading(point, palette) {
  const len = Math.hypot(point.x, point.y) || 1;
  const ux = point.x / len;
  const uy = point.y / len;
  const angle = (Math.atan2(ux, -uy) * 180) / Math.PI;
  return `linear-gradient(${angle.toFixed(1)}deg, transparent 40%, rgba(2, 6, 23, 0.45) 100%), radial-gradient(circle at ${(50 - ux * 24).toFixed(1)}% ${(50 - uy * 24).toFixed(1)}%, ${palette.light} 0%, ${palette.base} 46%, ${palette.deep} 100%)`;
}

function svgId(prefix, id) {
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

function seeded(seed) {
  return (n) => {
    const s = Math.sin(seed * 91.7 + n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
}

// Deterministic twinkling starfield
const STARS = Array.from({ length: 36 }, (_, i) => {
  const rand = seeded(i + 1);
  return {
    left: 2 + rand(1) * 96,
    top: 4 + rand(2) * 92,
    size: 1 + rand(3) * 2,
    duration: 2.5 + rand(4) * 4,
    delay: -rand(5) * 6,
    tinted: rand(6) > 0.7
  };
});

// A smooth telemetry trace that repeats every 100 units, so a 200-unit
// strip scrolled by half its width loops seamlessly.
function sparkPath(seed) {
  const rand = seeded(seed + 3);
  const steps = 14;
  const ys = Array.from({ length: steps }, (_, i) => 12 + rand(i) * 20);
  const points = [];
  for (let period = 0; period < 2; period += 1) {
    for (let i = 0; i < steps; i += 1) points.push([period * 100 + (i * 100) / steps, ys[i]]);
  }
  points.push([200, ys[0]]);
  let line = `M${points[0][0]} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const mx = ((x0 + x1) / 2).toFixed(2);
    line += ` C${mx} ${y0.toFixed(2)} ${mx} ${y1.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return { line, area: `${line} L200 40 L0 40 Z` };
}

/* ── Motion variants ────────────────────────────────────────────── */

const CARD_VARIANTS = {
  enter: (dir) => ({ opacity: 0, x: dir * 40, rotateY: dir * 14, scale: 0.94, filter: "blur(6px)" }),
  center: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE, staggerChildren: 0.05, delayChildren: 0.08 }
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir * -32,
    rotateY: dir * -10,
    scale: 0.96,
    filter: "blur(4px)",
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] }
  })
};

const ITEM_VARIANTS = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

const ORB_VARIANTS = {
  enter: { scale: 0.4, rotate: -90 },
  center: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 360, damping: 16 } }
};

const PILL_VARIANTS = {
  enter: { opacity: 0, y: 6, scale: 0.85 },
  center: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 22 } },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

const DIGIT_VARIANTS = {
  enter: (dir) => ({ y: dir < 0 ? "-100%" : "100%", opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (dir) => ({ y: dir < 0 ? "100%" : "-100%", opacity: 0 })
};

const HEADLINE_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
};

const WORD_VARIANTS = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(8px)" },
  show: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } }
};

const HEADLINE_WORDS = ["One", "Platform,", "Growing"];

/* ── The sun: ITOps Solution core ───────────────────────────────── */

function OrbitSun({ geometry, intro, isLight }) {
  const size = geometry.sun;
  const scale = useTransform(intro, (k) => 0.2 + 0.8 * easeOutBack(clamp01(k / 0.35)));
  const opacity = useTransform(intro, (k) => clamp01(k / 0.15));

  return (
    <motion.div
      role="img"
      aria-label="ITOps Solution core"
      className="pointer-events-none absolute"
      style={{ width: size, height: size, left: -size / 2, top: -size / 2, zIndex: 30, scale, opacity }}
    >
      {/* Corona glow */}
      <div
        className="absolute rounded-full"
        style={{
          inset: -size * 0.95,
          background: `radial-gradient(closest-side, rgba(0, 240, 255, ${isLight ? 0.16 : 0.22}), rgba(59, 130, 246, ${isLight ? 0.1 : 0.14}) 45%, rgba(167, 139, 250, 0.06) 70%, transparent)`
        }}
      />
      {/* Corona rays, two fields turning against each other */}
      <div
        className="absolute rounded-full animate-sun-rays"
        style={{
          inset: -size * 0.5,
          background: "repeating-conic-gradient(from 0deg, rgba(0, 240, 255, 0) 0deg, rgba(0, 240, 255, 0.55) 1.5deg, rgba(0, 240, 255, 0) 3deg, rgba(0, 240, 255, 0) 12deg)",
          WebkitMask: "radial-gradient(closest-side, transparent 55%, #000 62%, transparent 100%)",
          mask: "radial-gradient(closest-side, transparent 55%, #000 62%, transparent 100%)",
          opacity: isLight ? 0.55 : 0.7
        }}
      />
      <div
        className="absolute rounded-full animate-sun-rays-rev"
        style={{
          inset: -size * 0.34,
          background: "repeating-conic-gradient(from 7deg, rgba(167, 139, 250, 0) 0deg, rgba(167, 139, 250, 0.6) 2deg, rgba(59, 130, 246, 0) 4deg, rgba(59, 130, 246, 0) 20deg)",
          WebkitMask: "radial-gradient(closest-side, transparent 62%, #000 70%, transparent 100%)",
          mask: "radial-gradient(closest-side, transparent 62%, #000 70%, transparent 100%)",
          opacity: isLight ? 0.5 : 0.65
        }}
      />
      {/* Solar pulses */}
      {[0, 1.1].map((delay) => (
        <span
          key={delay}
          className="absolute inset-0 rounded-full border animate-orbit-sonar motion-reduce:hidden"
          style={{ borderColor: "rgba(0, 240, 255, 0.45)", animationDelay: `${delay}s`, animationDuration: "2.8s" }}
        />
      ))}
      {/* Plasma sphere: bright core, brand gradient toward the limb */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 44% 40%, #f0feff 0%, #a5f3fc 24%, #00f0ff 44%, #3b82f6 72%, #7c6cf0 100%)",
          boxShadow: `0 0 30px 6px rgba(0, 240, 255, ${isLight ? 0.35 : 0.45}), 0 0 80px 18px rgba(59, 130, 246, ${isLight ? 0.18 : 0.28}), inset -6px -8px 18px rgba(49, 46, 129, 0.45), inset 4px 5px 14px rgba(255, 255, 255, 0.55)`
        }}
      />
      {/* Slowly churning surface */}
      <div
        className="absolute inset-0 rounded-full mix-blend-overlay animate-orbit-spin-slow"
        style={{
          background: "conic-gradient(from 0deg, rgba(255, 255, 255, 0.35), transparent 18%, rgba(255, 255, 255, 0.2) 36%, transparent 55%, rgba(255, 255, 255, 0.3) 74%, transparent 90%)"
        }}
      />
      {/* Brand */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0b1f3f]">
        <BrandMark mono size={Math.round(size * (geometry.compact ? 0.42 : 0.32))} />
        {!geometry.compact && (
          <>
            <span className="mt-0.5 text-[12px] font-extrabold leading-none tracking-tight">ITOps</span>
            <span className="mt-0.5 font-mono text-[6.5px] font-bold uppercase leading-none tracking-[0.3em]">
              Solution
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Planets ────────────────────────────────────────────────────── */

/* Saturn-style ring, coplanar with the orbit; drawn as a back half and a
   front half so it wraps around the sphere. */
function PlanetRing({ size, ratio, tint, half }) {
  const a = size * 1.02;
  const b = Math.max(a * ratio, 6);
  const width = a * 2.4 + 8;
  const height = b * 2.4 + 8;
  const arc = (rx, ry) =>
    half === "back" ? `M ${-rx} 0 A ${rx} ${ry} 0 0 1 ${rx} 0` : `M ${rx} 0 A ${rx} ${ry} 0 0 1 ${-rx} 0`;

  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 ${half === "back" ? "z-0" : "z-[2]"}`}
      style={{ width, height, marginLeft: -width / 2, marginTop: -height / 2 }}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
    >
      <svg className="overflow-visible" width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
        <path d={arc(a, b)} fill="none" stroke={tint} strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
        <path d={arc(a * 1.16, b * 1.16)} fill="none" stroke={tint} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      </svg>
    </motion.span>
  );
}

/* A small moon circling the focused planet on the same tilted plane */
function PlanetMoon({ size, ratio, clock }) {
  const a = size * 1.4;
  const b = Math.max(a * ratio, 8);
  const x = useTransform(clock, (t) => Math.cos(t * 1.5) * a);
  const y = useTransform(clock, (t) => Math.sin(t * 1.5) * b);
  const zIndex = useTransform(clock, (t) => (Math.sin(t * 1.5) > 0 ? 3 : 0));

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full motion-reduce:hidden"
      style={{
        x,
        y,
        zIndex,
        background: "radial-gradient(circle at 35% 35%, #ffffff, #cbd5e1 60%, #64748b)",
        boxShadow: "0 0 6px rgba(255, 255, 255, 0.7)"
      }}
    />
  );
}

function OrbitPlanet({ node, index, layout, geometry, clock, isActive, isRelated, onSelect, isLight }) {
  const palette = PALETTES[index];
  const x = useTransform(layout, (l) => l[index].x);
  const y = useTransform(layout, (l) => l[index].y);
  const scale = useTransform(layout, (l) => l[index].scale);
  const opacity = useTransform(layout, (l) => l[index].opacity);
  // Planets behind the sun (depth < 0) slip under it; front ones pass over it
  const zIndex = useTransform(layout, (l) => Math.round(30 + 20 * l[index].depth));
  const background = useTransform(layout, (l) => planetShading(l[index], palette));
  const size = geometry.planet;
  const ratio = geometry.radiusY / geometry.radiusX;

  let labelState = "opacity-60";
  if (isActive) labelState = "opacity-100";
  else if (geometry.compact) labelState = "opacity-0 group-hover/planet:opacity-100";
  else if (isRelated) labelState = "opacity-95";

  return (
    <motion.div
      className="group/planet absolute left-0 top-0"
      style={{ x, y, scale, opacity, zIndex, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      {isActive && <PlanetRing size={size} ratio={ratio} tint={node.tint} half="back" />}

      <motion.button
        type="button"
        onClick={() => onSelect(index)}
        aria-label={`Show ${node.title}`}
        aria-current={isActive ? "true" : undefined}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className="relative z-[1] flex h-full w-full cursor-pointer items-center justify-center rounded-full text-white transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        style={{
          background,
          boxShadow: isActive
            ? `0 0 0 2px ${node.tint}, 0 0 26px 4px ${node.tint}99`
            : isRelated
              ? `0 0 0 1.5px ${node.tint}aa, 0 0 14px ${node.tint}55`
              : (isLight ? "0 6px 14px -6px rgba(15, 23, 42, 0.35)" : "0 6px 16px -6px rgba(0, 0, 0, 0.6)")
        }}
      >
        {/* Icon pops in whenever the planet takes focus */}
        <motion.span
          key={isActive ? "active" : "idle"}
          className="flex"
          initial={isActive ? { scale: 0.4, rotate: -90 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        >
          <Icon name={node.icon} className="h-4 w-4 drop-shadow-[0_1px_2px_rgba(2,6,23,0.55)] sm:h-5 sm:w-5" />
        </motion.span>

        {/* Live indicator dot */}
        {node.badge === "Live" && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white/70" />
          </span>
        )}
      </motion.button>

      {isActive && <PlanetRing size={size} ratio={ratio} tint={node.tint} half="front" />}
      {isActive && <PlanetMoon size={size} ratio={ratio} clock={clock} />}

      <span
        className={`pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] font-semibold tracking-wider transition-opacity duration-300 ${labelState}`}
        style={{ color: isActive || isRelated ? node.tint : (isLight ? "#475569" : "#94a3b8") }}
      >
        {node.short}
      </span>
    </motion.div>
  );
}

/* ── Links: gravity spokes and correlation arcs ─────────────────── */

/* A packet sliding along a spoke segment [x1, y1, x2, y2] */
function SpokePacket({ segment, clock, phase, speed, outward, color, radius, strength }) {
  const t = useTransform(clock, (c) => (c * speed + phase) % 1);
  const cx = useTransform([segment, t], ([s, p]) => s[0] + (s[2] - s[0]) * (outward ? p : 1 - p));
  const cy = useTransform([segment, t], ([s, p]) => s[1] + (s[3] - s[1]) * (outward ? p : 1 - p));
  const opacity = useTransform([t, strength], ([p, s]) => Math.sin(p * Math.PI) * s);
  return <motion.circle r={radius} cx={cx} cy={cy} fill={color} style={{ opacity }} />;
}

/* Sun ⇄ planet: the core powers each module (cyan, outward) and each
   module reports telemetry back (its own colour, inward). */
function OrbitSpoke({ node, index, layout, geometry, clock, isActive, isLight }) {
  const gradientId = svgId("orbit-spoke", useId());
  const segment = useTransform(layout, (l) => {
    const p = l[index];
    const len = Math.hypot(p.x, p.y);
    const ux = len ? p.x / len : 0;
    const uy = len ? p.y / len : 0;
    // From the sun's surface to the planet's surface, never through either
    const start = geometry.sun / 2 + 4;
    const end = Math.max(start, len - (geometry.planet * p.scale) / 2 - 3);
    return [ux * start, uy * start, ux * end, uy * end];
  });
  const x1 = useTransform(segment, (s) => s[0]);
  const y1 = useTransform(segment, (s) => s[1]);
  const x2 = useTransform(segment, (s) => s[2]);
  const y2 = useTransform(segment, (s) => s[3]);
  const strength = useTransform(layout, (l) => (0.3 + 0.7 * l[index].front) * l[index].reveal);
  // Dash period is 14, so wrapping at 140 keeps the outward flow seamless
  const flow = useTransform(clock, (t) => -((t * 24) % 140));

  return (
    <g>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isLight ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.12)"}
        strokeWidth={1}
        strokeDasharray="2 6"
        style={{ opacity: strength }}
      />
      {isActive && (
        <>
          <defs>
            <motion.linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={x1} y1={y1} x2={x2} y2={y2}>
              <stop offset="0" stopColor={CORE_COLOR} />
              <stop offset="1" stopColor={node.tint} />
            </motion.linearGradient>
          </defs>
          <motion.line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={`url(#${gradientId})`}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeDasharray="6 8"
            style={{ opacity: strength, strokeDashoffset: flow }}
          />
        </>
      )}
      {isActive ? (
        [0, 0.5].flatMap((phase) => [
          <SpokePacket key={`out-${phase}`} segment={segment} clock={clock} phase={phase} speed={0.5} outward color={CORE_COLOR} radius={2.4} strength={strength} />,
          <SpokePacket key={`in-${phase}`} segment={segment} clock={clock} phase={phase + 0.25} speed={0.5} outward={false} color={node.tint} radius={2.4} strength={strength} />
        ])
      ) : (
        <SpokePacket
          segment={segment}
          clock={clock}
          phase={index * 0.137}
          speed={0.28}
          outward={false}
          color={node.tint}
          radius={1.7}
          strength={strength}
        />
      )}
    </g>
  );
}

/* Planet ⇄ planet: an arc bent toward the sun, since every correlation
   runs through the shared core. Lit up for the focused planet's partners. */
function OrbitLink({ from, to, layout, clock, isActive, isLight }) {
  const gradientId = svgId("orbit-link", useId());
  const d = useTransform(layout, (l) => {
    const a = l[from];
    const b = l[to];
    const cx = ((a.x + b.x) / 2) * LINK_BEND;
    const cy = ((a.y + b.y) / 2) * LINK_BEND;
    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  });
  const reveal = useTransform(layout, (l) => Math.min(l[from].reveal, l[to].reveal));
  const ax = useTransform(layout, (l) => l[from].x);
  const ay = useTransform(layout, (l) => l[from].y);
  const bx = useTransform(layout, (l) => l[to].x);
  const by = useTransform(layout, (l) => l[to].y);
  const flow = useTransform(clock, (t) => -((t * 22) % 100));
  const t = useTransform(clock, (c) => (c * 0.35) % 1);
  // Quadratic Bézier point for the travelling packet
  const packetX = useTransform([layout, t], ([l, p]) => {
    const a = l[from];
    const b = l[to];
    const c = ((a.x + b.x) / 2) * LINK_BEND;
    return (1 - p) ** 2 * a.x + 2 * (1 - p) * p * c + p ** 2 * b.x;
  });
  const packetY = useTransform([layout, t], ([l, p]) => {
    const a = l[from];
    const b = l[to];
    const c = ((a.y + b.y) / 2) * LINK_BEND;
    return (1 - p) ** 2 * a.y + 2 * (1 - p) * p * c + p ** 2 * b.y;
  });
  const packetOpacity = useTransform([t, reveal], ([p, r]) => Math.sin(p * Math.PI) * r);

  if (!isActive) {
    return (
      <motion.path
        d={d}
        fill="none"
        stroke={isLight ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.07)"}
        strokeWidth={1}
        style={{ opacity: reveal }}
      />
    );
  }

  return (
    <g>
      <defs>
        <motion.linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={ax} y1={ay} x2={bx} y2={by}>
          <stop offset="0" stopColor={PLATFORM_NODES[from].tint} />
          <stop offset="1" stopColor={PLATFORM_NODES[to].tint} />
        </motion.linearGradient>
      </defs>
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeDasharray="4 6"
        style={{ opacity: reveal, strokeDashoffset: flow }}
      />
      <motion.circle r={2} cx={packetX} cy={packetY} fill={PLATFORM_NODES[to].tint} style={{ opacity: packetOpacity }} />
    </g>
  );
}

/* ── Orbits ─────────────────────────────────────────────────────── */

/* Comet on the outer orbit; it drifts on its own and whips along with the scroll */
function OrbitComet({ rotation, clock, rx, ry }) {
  const offset = useTransform([rotation, clock], ([r, t]) => {
    const head = r * (100 / 360) - t * 3;
    return -(((head % 100) + 100) % 100);
  });

  return [
    [12, 4, 0.06],
    [6, 2, 0.2],
    [2.5, 1.5, 0.75]
  ].map(([length, width, alpha]) => (
    <motion.ellipse
      key={length}
      rx={rx}
      ry={ry}
      fill="none"
      pathLength={100}
      strokeDasharray={`${length} ${100 - length}`}
      strokeLinecap="round"
      strokeWidth={width}
      stroke={CORE_COLOR}
      style={{ opacity: alpha, strokeDashoffset: offset }}
    />
  ));
}

/* A small body riding one of the inner orbits */
function OrbitAsteroid({ clock, rx, ry, speed, phase, radius, color }) {
  const cx = useTransform(clock, (t) => Math.sin(t * speed + phase) * rx);
  const cy = useTransform(clock, (t) => Math.cos(t * speed + phase) * ry);
  return <motion.circle r={radius} cx={cx} cy={cy} fill={color} />;
}

/* Orbital plane, inner orbits, the main planet track with its lit focus
   arc, and the outer comet orbit — all concentric around the sun. */
function OrbitRings({ geometry, rotation, clock, intro, isLight }) {
  const focusId = svgId("orbit-focus", useId());
  const planeId = svgId("orbit-plane", useId());
  const { radiusX: rx, radiusY: ry } = geometry;
  const outer = 1.18;
  const width = (rx * outer + 30) * 2;
  const height = (ry * outer + 30) * 2;
  const scale = useTransform(intro, [0, 0.7], [0.5, 1]);
  const opacity = useTransform(intro, [0, 0.45], [0, 1]);
  const faint = isLight ? "rgba(15, 23, 42, 0.07)" : "rgba(255, 255, 255, 0.07)";
  const track = isLight ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.13)";

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute"
      style={{ left: -width / 2, top: -height / 2, width, height, scale, opacity }}
    >
      <svg className="overflow-visible" width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
        <defs>
          <radialGradient id={planeId}>
            <stop offset="0" stopColor="#3b82f6" stopOpacity={isLight ? 0.08 : 0.14} />
            <stop offset="0.6" stopColor="#00f0ff" stopOpacity={isLight ? 0.03 : 0.05} />
            <stop offset="1" stopColor="#00f0ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={focusId} gradientUnits="userSpaceOnUse" x1={-rx * 0.5} y1={0} x2={rx * 0.5} y2={0}>
            <stop offset="0" style={{ stopColor: "var(--orbit-tint)", stopOpacity: 0 }} />
            <stop offset="0.5" style={{ stopColor: "var(--orbit-tint)", stopOpacity: 1 }} />
            <stop offset="1" style={{ stopColor: "var(--orbit-tint)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Orbital plane */}
        <ellipse rx={rx * outer} ry={ry * outer} fill={`url(#${planeId})`} />

        {/* Inner orbits with small bodies */}
        {[0.5, 0.74].map((f) => (
          <ellipse key={f} rx={rx * f} ry={ry * f} fill="none" stroke={faint} strokeWidth="1" />
        ))}
        <OrbitAsteroid clock={clock} rx={rx * 0.5} ry={ry * 0.5} speed={0.5} phase={1} radius={1.8} color="#a78bfa" />
        <OrbitAsteroid clock={clock} rx={rx * 0.74} ry={ry * 0.74} speed={0.32} phase={3.6} radius={1.6} color="#00f0ff" />
        <OrbitAsteroid clock={clock} rx={rx * 0.74} ry={ry * 0.74} speed={0.32} phase={0.4} radius={1.2} color="#3b82f6" />

        {/* Outer comet orbit */}
        <ellipse
          rx={rx * outer}
          ry={ry * outer}
          fill="none"
          stroke={faint}
          strokeWidth="1"
          strokeDasharray="1 9"
          className="animate-orbit-dash-rev"
        />
        <OrbitComet rotation={rotation} clock={clock} rx={rx * outer} ry={ry * outer} />

        {/* Main planet orbit */}
        <ellipse
          rx={rx}
          ry={ry}
          fill="none"
          stroke={track}
          strokeWidth="1.2"
          strokeDasharray="4 6"
          className="animate-orbit-dash"
        />
        {/* The ellipse path starts at 3 o'clock, so 6 o'clock (the focus slot) sits at 25% */}
        <ellipse
          rx={rx}
          ry={ry}
          fill="none"
          pathLength={100}
          stroke={`url(#${focusId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="14 86"
          strokeDashoffset={-18}
        />
      </svg>
    </motion.div>
  );
}

/* Beam docking the focused planet to the detail card beneath it; it only
   shows once the planet has actually settled into the front slot. */
function DockBeam({ geometry, layout, clock, active }) {
  const top = geometry.radiusY + (geometry.planet * FRONT_SCALE) / 2 + geometry.labelSpace;
  const length = Math.max(0, geometry.height - geometry.centerY - top);
  const packet = useTransform(clock, (t) => ((t * 0.8) % 1) * length);
  const opacity = useTransform(layout, (l) => clamp01((l[active].front - 0.94) / 0.05) * l[active].reveal);
  if (length < 6) return null;

  return (
    <motion.div aria-hidden className="pointer-events-none absolute" style={{ left: -1, top, width: 2, height: length, opacity }}>
      <motion.div
        key={active}
        className="absolute inset-0 origin-top rounded-full"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        style={{ background: "linear-gradient(to bottom, var(--orbit-tint), color-mix(in srgb, var(--orbit-tint) 30%, transparent))" }}
      />
      <motion.span
        className="absolute left-1/2 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full motion-reduce:hidden"
        style={{ y: packet, background: "var(--orbit-tint)", boxShadow: "0 0 8px var(--orbit-tint)" }}
      />
    </motion.div>
  );
}

/* ── Detail card ────────────────────────────────────────────────── */

function PlatformCard({ node, index, direction, isLight, compact, dense, glare, glareOpacity, onSelect }) {
  const spark = useMemo(() => sparkPath(index), [index]);
  const fillId = svgId("orbit-spark", useId());
  // The sun sits above the card, so the badge planet is lit from the top
  const orbShading = useMemo(() => planetShading({ x: 0, y: 1 }, PALETTES[index]), [index]);
  const related = RELATED[index];

  const cta = (
    <Link
      to={node.href}
      className={`group/cta inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold transition-all duration-200 hover:scale-105 ${
        isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-950 hover:bg-slate-100"
      }`}
      style={{ boxShadow: `0 6px 18px -6px ${node.tint}${isLight ? "80" : "aa"}` }}
    >
      <span>Explore solution</span>
      <span aria-hidden className="transition-transform duration-200 group-hover/cta:translate-x-1">→</span>
    </Link>
  );

  return (
    <motion.div
      custom={direction}
      variants={CARD_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      className={`pop-card pointer-events-auto relative h-full overflow-hidden rounded-2xl border p-3.5 text-left backdrop-blur-xl transition-colors duration-300 sm:px-5 sm:py-4 ${
        isLight ? "bg-white/95 border-slate-200/90 text-slate-900" : "bg-slate-950/90 border-white/15 text-white"
      }`}
      style={{
        transformPerspective: 900,
        "--beam-color": node.tint,
        boxShadow: isLight
          ? `0 16px 36px -10px ${node.tint}30, 0 1px 3px rgba(0,0,0,0.04)`
          : `0 20px 48px -12px ${node.tint}40, 0 0 0 1px rgba(255,255,255,0.08)`
      }}
    >
      {/* Light beam circling the border */}
      <span aria-hidden className="orbit-beam-border" />

      {/* Live telemetry trace scrolling behind the content */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-12 w-[200%] opacity-80"
        style={{ animation: "marquee 10s linear infinite" }}
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={node.tint} stopOpacity={isLight ? 0.12 : 0.2} />
            <stop offset="1" stopColor={node.tint} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={spark.area} fill={`url(#${fillId})`} />
        <path d={spark.line} fill="none" stroke={node.tint} strokeOpacity="0.35" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Cursor-following glare */}
      <motion.span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: glare, opacity: glareOpacity }} />

      {/* One-shot sheen as the card lands */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent to-transparent motion-reduce:hidden ${
          isLight ? "via-white/80" : "via-white/10"
        }`}
        style={{ animation: "sheen 1.3s ease-out 0.25s 1 both" }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {/* Planet badge, category, title, CTA */}
        <motion.div variants={ITEM_VARIANTS} className="flex items-center gap-3">
          <motion.span
            variants={ORB_VARIANTS}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: orbShading, boxShadow: `0 0 0 1.5px ${node.tint}66, 0 0 18px ${node.tint}55` }}
          >
            <Icon name={node.icon} className="h-4 w-4 drop-shadow-[0_1px_2px_rgba(2,6,23,0.55)]" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider" style={{ color: node.tint }}>
                {node.subtitle}
              </span>
              {node.badge === "Live" && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[9px] font-bold text-emerald-600 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <h3
              className={`mt-0.5 truncate text-sm font-bold leading-tight transition-colors duration-300 sm:text-base ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              {node.title}
            </h3>
          </div>
          {!compact && cta}
        </motion.div>

        {/* Description */}
        <motion.p
          variants={ITEM_VARIANTS}
          className={`mt-2 line-clamp-2 text-[11.5px] leading-relaxed transition-colors duration-300 ${
            isLight ? "text-slate-600" : "text-slate-300"
          }`}
        >
          {node.desc}
        </motion.p>

        {/* Feature Stats Pills */}
        {!compact && !dense && (
          <div className="mt-2 flex flex-wrap gap-1">
            {node.stats.map((stat) => (
              <motion.span
                key={stat}
                variants={PILL_VARIANTS}
                className={`rounded-full border px-2 py-0.5 text-[9.5px] font-medium transition-colors duration-300 ${
                  isLight
                    ? "border-slate-200/90 bg-slate-100/90 text-slate-700"
                    : "border-white/10 bg-white/[0.05] text-slate-300"
                }`}
              >
                {stat}
              </motion.span>
            ))}
          </div>
        )}

        {/* Correlated modules — the planets this one works with */}
        <motion.div
          variants={ITEM_VARIANTS}
          className={`flex flex-wrap items-center gap-1.5 ${compact ? "mt-2.5" : "mt-auto pt-2"}`}
        >
          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${isLight ? "text-slate-400" : "text-white/40"}`}>
            Orbits with
          </span>
          {related.map((relatedIndex) => {
            const partner = PLATFORM_NODES[relatedIndex];
            return (
              <button
                key={partner.id}
                type="button"
                onClick={() => onSelect(relatedIndex)}
                aria-label={`Show ${partner.title}`}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors duration-200 ${
                  isLight
                    ? "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100"
                    : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: partner.tint, boxShadow: `0 0 6px ${partner.tint}` }} />
                {partner.short}
              </button>
            );
          })}
        </motion.div>

        {compact && (
          <motion.div variants={ITEM_VARIANTS} className="mt-auto flex justify-center pt-2.5">
            {cta}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Section ────────────────────────────────────────────────────── */

export function InfrastructureTopology() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const reduceMotion = useReducedMotion();

  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const orbitRef = useRef(null);
  const [{ active, direction }, setNav] = useState({ active: 0, direction: 0 });
  const [revealed, setRevealed] = useState(false);
  const [geometry, setGeometry] = useState({
    radiusX: 380,
    radiusY: 130,
    planet: 50,
    labelSpace: 28,
    sun: 100,
    centerY: 200,
    height: 400,
    compact: false,
    dense: false
  });

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"]
  });

  const [input, output] = useMemo(() => steppedRange(COUNT), []);
  const stepped = useTransform(scrollYProgress, input, output);
  const rotationTarget = useTransform(stepped, (v) => -v * SLICE);
  const rotation = useSpring(rotationTarget, { stiffness: 85, damping: 22, mass: 0.65 });

  const syncActive = useCallback((r) => {
    const index = ((Math.round(-r / SLICE) % COUNT) + COUNT) % COUNT;
    setNav((prev) =>
      prev.active === index ? prev : { active: index, direction: index > prev.active ? 1 : -1 }
    );
  }, []);

  useMotionValueEvent(rotationTarget, "change", syncActive);

  // Shared animation clock (seconds); it only ticks while the stage is on screen
  const clock = useMotionValue(0);
  const stageInView = useInView(stageRef, { amount: 0.25 });
  useAnimationFrame((_, delta) => {
    if (!stageInView || reduceMotion) return;
    clock.set(clock.get() + Math.min(delta, 64) / 1000);
  });

  // Intro: 0 → 1 the first time the stage scrolls into view
  const intro = useMotionValue(0);
  const introStarted = useRef(false);
  useEffect(() => {
    if (!stageInView || introStarted.current) return;
    introStarted.current = true;
    if (reduceMotion) {
      intro.set(1);
      setRevealed(true);
      return;
    }
    animate(intro, 1, { duration: 1.9, ease: [0.22, 1, 0.36, 1] });
    setTimeout(() => setRevealed(true), 520);
  }, [stageInView, reduceMotion, intro]);

  // One layout pass per frame, shared by every planet, spoke and link
  const layout = useTransform([rotation, intro], ([r, k]) => computeLayout(r, k, geometry));

  // Pointer parallax on the star backdrop only, so the system itself stays aligned
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 50, damping: 18 });
  const smoothY = useSpring(pointerY, { stiffness: 50, damping: 18 });
  const backdropX = useTransform(smoothX, (v) => v * -28);
  const backdropY = useTransform(smoothY, (v) => v * -18);

  const onStagePointerMove = useCallback(
    (event) => {
      if (reduceMotion || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [reduceMotion, pointerX, pointerY]
  );

  const onStagePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  // Card 3D tilt + glare that follows the cursor
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [5, -5]), { stiffness: 180, damping: 18 });
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 18 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, { stiffness: 160, damping: 24 });
  const glare = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, color-mix(in srgb, var(--orbit-tint) 16%, transparent), transparent 70%)`;

  const onCardPointerMove = useCallback(
    (event) => {
      if (reduceMotion || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      tiltX.set(px - 0.5);
      tiltY.set(py - 0.5);
      glareX.set(px * 100);
      glareY.set(py * 100);
      glareOpacity.set(1);
    },
    [reduceMotion, tiltX, tiltY, glareX, glareY, glareOpacity]
  );

  const onCardPointerLeave = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
    glareOpacity.set(0);
  }, [tiltX, tiltY, glareOpacity]);

  // Fit the system into the space between the header and the docked card:
  // the orbit is centred, with the dock beam taking any spare height below.
  useLayoutEffect(() => {
    const box = orbitRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return undefined;
    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      const compact = width < 720;
      // Short viewports get a slimmer card so the orbit keeps its room
      const dense = !compact && stage.getBoundingClientRect().height < 760;
      const planet = compact ? 38 : 50;
      const labelSpace = compact ? 22 : 28;
      const back = (planet * BACK_SCALE) / 2 + (compact ? 8 : 16);
      const front = (planet * FRONT_SCALE) / 2 + labelSpace;
      const beam = compact ? 14 : 22;

      const radiusX = compact
        ? Math.min(width * 0.41, 165)
        : Math.max(300, Math.min(width * 0.34, 440));
      const maxRadiusY = compact ? radiusX * 0.68 : Math.min(radiusX * 0.4, 175);
      const radiusY = Math.max(compact ? 52 : 64, Math.min(maxRadiusY, (height - back - front - beam) / 2));

      const slack = Math.max(0, height - (back + radiusY * 2 + front + beam));
      const centerY = back + radiusY + slack / 2;
      const sun = Math.round(Math.min(radiusY * 0.8, compact ? 64 : 116));
      setGeometry({ radiusX, radiusY, planet, labelSpace, sun, centerY, height, compact, dense });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const trackDocumentTop = () => {
    const track = trackRef.current;
    return track ? track.getBoundingClientRect().top + window.scrollY : 0;
  };

  const goToIndex = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    const top = trackDocumentTop() + (index / (COUNT - 1)) * distance;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const activeNode = PLATFORM_NODES[active] || PLATFORM_NODES[0];
  const related = RELATED[active];

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goToIndex(Math.min(COUNT - 1, active + 1));
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goToIndex(Math.max(0, active - 1));
      }
    },
    [active, goToIndex]
  );

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / distance));
    const index = Math.round(progress * (COUNT - 1));
    rotation.jump?.(-index * SLICE);
    setNav({ active: index, direction: 0 });
  }, [rotation]);

  const isInView = useInView(trackRef, { margin: "200px" });
  const wavesOpacity = useTransform(intro, [0.3, 1], [0, 1]);
  const svgPad = 30;
  const svgWidth = (geometry.radiusX + svgPad) * 2;
  const svgHeight = (geometry.radiusY + svgPad) * 2;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full">
        {/* Full-screen scroll track */}
        <div
          ref={trackRef}
          className="relative w-full"
          style={{ height: `${COUNT * SCROLL_VH_PER_ITEM + 100}vh` }}
        >
          <div
            className={`sticky top-0 flex h-screen w-full flex-col items-center justify-between overflow-hidden transition-colors duration-500 ${
              isLight
                ? "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900"
                : "bg-gradient-to-b from-[#0b0f19] via-[#080c14] to-[#04070d] text-white"
            }`}
          >
            <div
              ref={stageRef}
              onKeyDown={onKeyDown}
              onPointerMove={onStagePointerMove}
              onPointerLeave={onStagePointerLeave}
              tabIndex={-1}
              className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pb-3 pt-24 sm:px-8 sm:pb-5 sm:pt-28 md:pt-32 focus:outline-none"
              style={{ "--orbit-tint": activeNode.tint, transition: "--orbit-tint 0.7s ease" }}
            >
              {/* Backdrop: grid, nebula glows, twinkling stars — active only when in viewport */}
              {isInView && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-10"
                  style={{ x: backdropX, y: backdropY }}
                >
                  <div className={`enterprise-grid absolute inset-0 ${isLight ? "opacity-60" : "opacity-50"}`} />
                  <div
                    className="absolute left-[10%] top-[16%] h-72 w-72 rounded-full blur-[100px] animate-orbit-drift gpu-layer"
                    style={{ background: isLight ? "rgba(0, 240, 255, 0.07)" : "rgba(0, 240, 255, 0.10)" }}
                  />
                  <div
                    className="absolute bottom-[12%] right-[8%] h-80 w-80 rounded-full blur-[110px] animate-orbit-drift gpu-layer"
                    style={{
                      background: isLight ? "rgba(167, 139, 250, 0.08)" : "rgba(167, 139, 250, 0.12)",
                      animationDelay: "-9s"
                    }}
                  />
                  <div
                    className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] gpu-layer"
                    style={{
                      background: `radial-gradient(circle, color-mix(in srgb, var(--orbit-tint) ${isLight ? 8 : 12}%, transparent) 0%, transparent 70%)`
                    }}
                  />
                  {(geometry.compact ? STARS.slice(0, 16) : STARS).map((star, i) => (
                    <span
                      key={i}
                      className="absolute rounded-full animate-orbit-twinkle"
                      style={{
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        width: star.size,
                        height: star.size,
                        background: star.tinted
                          ? "#00f0ff"
                          : (isLight ? "rgba(15, 23, 42, 0.28)" : "rgba(255, 255, 255, 0.8)"),
                        animationDuration: `${star.duration}s`,
                        animationDelay: `${star.delay}s`
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Header: Compact, clean, safe clearance below floating navbar */}
              <div className="relative z-30 shrink-0 text-center">
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-0.5 backdrop-blur-md transition-colors duration-300 ${
                    isLight
                      ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-800 shadow-xs"
                      : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] sm:text-[10.5px]">
                    THE COMPLETE PLATFORM
                  </span>
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent to-transparent motion-reduce:hidden ${
                      isLight ? "via-white/70" : "via-white/20"
                    }`}
                    style={{ animation: "sheen 3.8s ease-in-out infinite" }}
                  />
                </motion.div>
                <motion.h2
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.6 }}
                  variants={HEADLINE_VARIANTS}
                  className={`mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl transition-colors duration-300 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {HEADLINE_WORDS.map((word) => (
                    <motion.span key={word} variants={WORD_VARIANTS} className="mr-[0.26em] inline-block">
                      {word}
                    </motion.span>
                  ))}
                  <motion.span
                    variants={WORD_VARIANTS}
                    className="orbit-gradient-text inline-block pb-[0.08em]"
                    style={{
                      // Same stops as --grad-brand, mirrored so the pan loops seamlessly
                      backgroundImage: isLight
                        ? "linear-gradient(100deg, #0891b2 0%, #2563eb 25%, #7c3aed 50%, #2563eb 75%, #0891b2 100%)"
                        : "linear-gradient(100deg, #00f0ff 0%, #3b82f6 25%, #a78bfa 50%, #3b82f6 75%, #00f0ff 100%)"
                    }}
                  >
                    Module by Module
                  </motion.span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.8 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
                  className={`mx-auto mt-1 hidden sm:block max-w-lg text-xs leading-relaxed transition-colors duration-300 ${
                    isLight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Every module orbits one ITOps core — powered by it, feeding it telemetry, and linked to the rest.
                </motion.p>
              </div>

              {/* Interactive Stage: solar system + docked detail card */}
              <div className="relative z-20 flex min-h-0 w-full flex-1 flex-col items-center">
                <div ref={orbitRef} className="relative min-h-0 w-full flex-1">
                  {/* Orbit plane: a zero-size origin at the sun's centre */}
                  <div className="absolute left-1/2 h-0 w-0" style={{ top: geometry.centerY }}>
                    {/* Solar wind rippling out across the orbital plane */}
                    <motion.div aria-hidden className="pointer-events-none absolute" style={{ opacity: wavesOpacity }}>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="absolute rounded-[50%] border animate-orbit-ripple motion-reduce:hidden"
                          style={{
                            width: geometry.radiusX * 2,
                            height: geometry.radiusY * 2,
                            left: -geometry.radiusX,
                            top: -geometry.radiusY,
                            borderColor: isLight ? "rgba(59, 130, 246, 0.22)" : "rgba(0, 240, 255, 0.22)",
                            animationDelay: `${-i * 1.8}s`
                          }}
                        />
                      ))}
                    </motion.div>

                    <OrbitRings geometry={geometry} rotation={rotation} clock={clock} intro={intro} isLight={isLight} />

                    {/* Correlation arcs between planets, then sun ⇄ planet spokes */}
                    <svg
                      aria-hidden
                      className="pointer-events-none absolute overflow-visible"
                      style={{ left: -svgWidth / 2, top: -svgHeight / 2 }}
                      width={svgWidth}
                      height={svgHeight}
                      viewBox={`${-svgWidth / 2} ${-svgHeight / 2} ${svgWidth} ${svgHeight}`}
                    >
                      {LINKS.map(([a, b], i) => {
                        const isActive = a === active || b === active;
                        // Active arcs always run from the focused planet to its partner
                        const [from, to] = b === active ? [b, a] : [a, b];
                        return (
                          <OrbitLink
                            key={i}
                            from={from}
                            to={to}
                            layout={layout}
                            clock={clock}
                            isActive={isActive}
                            isLight={isLight}
                          />
                        );
                      })}
                      {PLATFORM_NODES.map((node, index) => (
                        <OrbitSpoke
                          key={node.id}
                          node={node}
                          index={index}
                          layout={layout}
                          geometry={geometry}
                          clock={clock}
                          isActive={index === active}
                          isLight={isLight}
                        />
                      ))}
                    </svg>

                    <OrbitSun geometry={geometry} intro={intro} isLight={isLight} />

                    {PLATFORM_NODES.map((node, index) => (
                      <OrbitPlanet
                        key={node.id}
                        node={node}
                        index={index}
                        layout={layout}
                        geometry={geometry}
                        clock={clock}
                        isActive={index === active}
                        isRelated={related.includes(index)}
                        onSelect={goToIndex}
                        isLight={isLight}
                      />
                    ))}

                    <DockBeam geometry={geometry} layout={layout} clock={clock} active={active} />
                  </div>
                </div>

                {/* Docked detail card, centred under the sun */}
                <div
                  className="pointer-events-none relative z-30 w-full max-w-[660px] shrink-0"
                  style={{ height: geometry.compact ? 244 : geometry.dense ? 144 : 176 }}
                >
                  {/* Docking port where the beam lands */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-0 z-40 -ml-1 -mt-1 h-2 w-2 rounded-full"
                    style={{ background: "var(--orbit-tint)", boxShadow: "0 0 10px var(--orbit-tint)" }}
                  />
                  <motion.div
                    className="h-full"
                    onPointerMove={onCardPointerMove}
                    onPointerLeave={onCardPointerLeave}
                    style={{ rotateX, rotateY, transformPerspective: 1000 }}
                  >
                    <AnimatePresence mode="wait" custom={direction}>
                      {revealed && (
                        <PlatformCard
                          key={activeNode.id}
                          node={activeNode}
                          index={active}
                          direction={direction}
                          isLight={isLight}
                          compact={geometry.compact}
                          dense={geometry.dense}
                          glare={glare}
                          glareOpacity={glareOpacity}
                          onSelect={goToIndex}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Bottom Controls: Step Counter, Navigation Dots, Scroll Hint */}
              <div className="relative z-30 mt-3 flex w-full shrink-0 items-center justify-between gap-4 px-3 pb-1 sm:px-8">
                {/* Step counter with rolling digits */}
                <div
                  className={`flex items-center font-mono text-xs font-bold transition-colors duration-300 ${
                    isLight ? "text-slate-800" : "text-white/90"
                  }`}
                >
                  <span className="relative inline-flex h-4 w-[2ch] overflow-hidden" style={{ color: "var(--orbit-tint)" }}>
                    <AnimatePresence initial={false} custom={direction}>
                      <motion.span
                        key={active}
                        custom={direction}
                        variants={DIGIT_VARIANTS}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute inset-0 flex items-center"
                      >
                        {String(active + 1).padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className={`ml-1 ${isLight ? "text-slate-400" : "text-white/30"}`}>
                    / {String(COUNT).padStart(2, "0")}
                  </span>
                </div>

                {/* 8 Pagination Dots & Quick Step buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToIndex(Math.max(0, active - 1))}
                    aria-label="Previous item"
                    disabled={active === 0}
                    className={`hidden h-6 w-6 items-center justify-center rounded-full border transition-all disabled:opacity-30 sm:flex ${
                      isLight
                        ? "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100 shadow-xs"
                        : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10"
                    }`}
                  >
                    ‹
                  </button>

                  <div className="flex items-center gap-1.5">
                    {PLATFORM_NODES.map((node, index) => (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => goToIndex(index)}
                        aria-label={`Go to ${node.title}`}
                        className="h-1.5 rounded-full transition-all duration-300 focus:outline-none"
                        style={{
                          width: index === active ? 24 : 7,
                          background:
                            index === active
                              ? node.tint
                              : index < active
                                ? `${node.tint}70`
                                : isLight
                                  ? "rgba(15, 23, 42, 0.18)"
                                  : "rgba(255, 255, 255, 0.2)",
                          boxShadow: index === active ? `0 0 10px ${node.tint}` : "none"
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => goToIndex(Math.min(COUNT - 1, active + 1))}
                    aria-label="Next item"
                    disabled={active === COUNT - 1}
                    className={`hidden h-6 w-6 items-center justify-center rounded-full border transition-all disabled:opacity-30 sm:flex ${
                      isLight
                        ? "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100 shadow-xs"
                        : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/10"
                    }`}
                  >
                    ›
                  </button>
                </div>

                {/* Scroll Hint */}
                <div
                  className={`hidden items-center gap-2 font-mono text-[9.5px] uppercase tracking-widest sm:flex transition-colors duration-300 ${
                    isLight ? "text-slate-500" : "text-white/40"
                  }`}
                >
                  <span>Scroll to orbit</span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-3.5 justify-center rounded-full border ${
                      isLight ? "border-slate-400" : "border-white/30"
                    }`}
                  >
                    <span className="mt-1 h-1.5 w-0.5 rounded-full animate-orbit-wheel" style={{ background: "var(--orbit-tint)" }} />
                  </span>
                </div>
              </div>

              {/* Continuous scroll progress through the suite, in the brand gradient */}
              <div
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-[2px] ${isLight ? "bg-slate-900/5" : "bg-white/5"}`}
              >
                <motion.div
                  className="h-full origin-left"
                  style={{
                    scaleX: scrollYProgress,
                    background: "linear-gradient(90deg, #00f0ff, #3b82f6, #a78bfa)",
                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.6)"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
