import { useCallback, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "motion/react";
import { BrandMark } from "./BrandLogo";
import { FeatureIcon } from "./ProductVisuals";
import { Skeleton } from "./Skeleton";
import { ErrorState } from "./EmptyState";
import { useTheme } from "../context/ThemeContext";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_VH_PER_ITEM = 40;
const CORE_COLOR = "#38bdf8";
// Depth of the tilted orbit: services at the back shrink and dim, the docked one sits in front
const BACK_SCALE = 0.8;
const DESKTOP_MIN_WIDTH = 960;
// Card sizes to try, roomiest first. `minRy` is the vertical radius at which the two cards on
// the same side of the orbit (one in front, one behind) stop overlapping.
const DESKTOP_CARDS = [
  { size: "full", cardW: 256, cardH: 150 },
  { size: "dense", cardW: 248, cardH: 118 },
  { size: "mini", cardW: 236, cardH: 96 }
].map((card) => ({ ...card, minRy: Math.ceil((card.cardH * (1 + BACK_SCALE)) / 2 + 10) }));
const TETHER = 22;
// Detail panel heights: roomy desktop, shorter desktop, a wide strip for short laptops and tablets,
// and two phone panels (tall and short screens)
const PANEL_HEIGHT = { full: 204, dense: 172, strip: 150, compact: 252, mini: 160 };
const ORB_LABEL = 18;
// Below this viewport height (landscape phones, tiny windows) the orbit isn't pinned; the services show as a grid
const MIN_PINNED_HEIGHT = 540;

// Keyed by the CMS feature title. Card figures are product facts from the
// site's own copy — not live numbers — so nothing here overstates the product.
// `color` and `ink` are the bright and deep stops of the service's icon gradient:
// `color` glows on the dark band, `ink` keeps text and lines legible on the light one.
const SERVICES = {
  "Uptime & Response Time": {
    key: "uptime",
    short: "Uptime",
    color: "#22d3ee",
    ink: "#0e7490",
    eyebrow: "Availability",
    stats: [["30s", "Interval"], ["4", "Check types"], ["5", "Redirect hops"]],
    tags: ["Keyword checks", "Status-code assertions", "DNS change watch"],
    trend: { label: "Response time", unit: "ms", data: [182, 176, 190, 171, 168, 240, 186, 174, 169, 172, 165, 171, 160, 158] }
  },
  "SSL Certificate Monitoring": {
    key: "ssl",
    short: "SSL",
    color: "#34d399",
    ink: "#047857",
    eyebrow: "Certificates",
    stats: [["Days", "To expiry"], ["Issuer", "Tracked"], ["TLS", "Protocol"]],
    tags: ["Expiry countdown", "Issuer & chain", "Protocol checks"],
    trend: { label: "Days until expiry", unit: "d", data: [19, 18, 17, 16, 15, 14, 13, 90, 89, 88, 87, 86, 85, 84] }
  },
  "Security Posture Scoring": {
    key: "security",
    short: "Security",
    color: "#a78bfa",
    ink: "#6d28d9",
    eyebrow: "Perimeter defense",
    stats: [["0–100", "Score"], ["4", "Key headers"], ["Cookies", "Flag checks"]],
    tags: ["HSTS & CSP", "Cookie flags", "Version-leak detection"],
    trend: { label: "Security score", unit: "", data: [71, 71, 74, 74, 78, 78, 81, 84, 84, 86, 88, 90, 91, 92] }
  },
  "Incident Tracking": {
    key: "incident",
    short: "Incidents",
    color: "#fb7185",
    ink: "#be123c",
    eyebrow: "Command & resolution",
    stats: [["Auto", "Open"], ["Auto", "Resolve"], ["Cause", "Attached"]],
    tags: ["Consecutive-failure rule", "Auto-resolve", "Public status page"],
    trend: { label: "Open incidents", unit: "", data: [3, 2, 4, 2, 1, 1, 3, 1, 0, 1, 0, 0, 1, 0] }
  },
  "Multi-Channel Alerting": {
    key: "alerting",
    short: "Alerting",
    color: "#fbbf24",
    ink: "#b45309",
    eyebrow: "Notifications",
    stats: [["3", "Channels"], ["Instant", "Delivery"], ["1×", "Setup"]],
    tags: ["Slack", "Generic webhooks", "Email"],
    trend: { label: "Alerts delivered", unit: "", data: [14, 9, 17, 11, 8, 6, 12, 7, 9, 5, 6, 4, 7, 5] }
  },
  "Asset Inventory": {
    key: "assets",
    short: "Assets",
    color: "#60a5fa",
    ink: "#1d4ed8",
    eyebrow: "Inventory",
    stats: [["Auto", "Discovery"], ["1-line", "Agent"], ["Per-host", "Keys"]],
    tags: ["Auto-discovered", "Servers · sites · services", "Revocable host keys"],
    trend: { label: "Monitored assets", unit: "", data: [182, 184, 187, 191, 192, 198, 203, 205, 211, 214, 219, 226, 229, 234] }
  }
};

const toneOf = (meta, isLight) => (isLight ? meta.ink : meta.color);

/* ── Deep-space backdrop ────────────────────────────────────────── */

function seeded(seed) {
  return (n) => {
    const s = Math.sin(seed * 91.7 + n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
}

const STARS = Array.from({ length: 150 }, (_, i) => {
  const rand = seeded(i + 3);
  return {
    left: rand(1) * 100,
    top: rand(2) * 100,
    size: 0.6 + rand(3) * 1.5,
    opacity: 0.25 + rand(4) * 0.6,
    twinkle: rand(5) > 0.7,
    duration: 3 + rand(6) * 4,
    delay: -rand(7) * 6
  };
});

// Constellations sit in the outer bands, clear of the orbit
const CONSTELLATIONS = [
  { points: [[3, 12], [7, 8.5], [11, 11], [15, 8], [17.5, 13], [13.5, 16.5], [9.5, 15]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 2]] },
  { points: [[5, 32], [9, 28.5], [12.5, 34], [8.5, 39], [14, 42.5]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4]] },
  { points: [[3.5, 60], [8, 56.5], [12, 61.5], [10, 68], [15, 72.5], [6, 74]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]] },
  { points: [[84, 9], [88, 13.5], [92, 8], [95.5, 14.5], [91, 19.5], [86.5, 18.5]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1]] },
  { points: [[86, 35], [90, 30.5], [94, 36.5], [91, 43], [96.5, 47]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [2, 4]] },
  { points: [[83, 64], [88, 60], [93, 65.5], [89, 72], [95, 77], [85, 77.5]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]] },
  { points: [[18, 86], [23, 83], [28, 88], [24, 94]], edges: [[0, 1], [1, 2], [2, 3]] },
  { points: [[73, 87], [78, 92], [83, 86], [88, 92.5]], edges: [[0, 1], [1, 2], [2, 3]] }
];

function SpaceBackdrop({ isLight }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Nebula light — pastel washes in light mode */}
      <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-[#3b82f6]/[0.09] blur-[120px] light:bg-[#60a5fa]/[0.16]" />
      <div className="absolute -right-32 top-24 h-[560px] w-[560px] rounded-full bg-[#8b5cf6]/[0.1] blur-[130px] light:bg-[#a78bfa]/[0.16]" />
      <div className="absolute -left-24 bottom-24 h-[420px] w-[420px] rounded-full bg-[#f43f5e]/[0.05] blur-[120px] light:bg-[#fb7185]/[0.1]" />
      <div className="absolute -right-20 bottom-10 h-[480px] w-[480px] rounded-full bg-[#14b8a6]/[0.09] blur-[120px] light:bg-[#2dd4bf]/[0.14]" />
      {/* The active service grades the whole scene */}
      <div
        className="absolute left-1/2 top-1/2 h-[640px] w-[960px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{
          background: `radial-gradient(closest-side, color-mix(in srgb, var(--orbit-tint) ${isLight ? 14 : 18}%, transparent), transparent)`
        }}
      />

      {/* Constellation lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONSTELLATIONS.flatMap((c, ci) =>
          c.edges.map(([a, b], ei) => (
            <line
              key={`${ci}-${ei}`}
              x1={c.points[a][0]}
              y1={c.points[a][1]}
              x2={c.points[b][0]}
              y2={c.points[b][1]}
              stroke={isLight ? "rgba(71, 85, 105, 0.2)" : "rgba(186, 208, 255, 0.2)"}
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          ))
        )}
      </svg>
      {CONSTELLATIONS.flatMap((c, ci) =>
        c.points.map(([x, y], pi) => (
          <span
            key={`${ci}-${pi}`}
            className="absolute h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white light:bg-sky-600"
            style={{ left: `${x}%`, top: `${y}%`, boxShadow: isLight ? "0 0 6px rgba(56, 189, 248, 0.7)" : "0 0 6px rgba(186, 230, 253, 0.9)" }}
          />
        ))
      )}

      {/* Star field — fine slate specks in light mode (dimmed on the wrapper so twinkles stay subtle too) */}
      <div className="absolute inset-0 light:opacity-50">
        {STARS.map((star, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-white light:bg-slate-400 ${star.twinkle ? "animate-orbit-twinkle" : ""}`}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDuration: star.twinkle ? `${star.duration}s` : undefined,
              animationDelay: star.twinkle ? `${star.delay}s` : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* A logarithmic spiral arm, r = a·e^(bθ), from the core out to `reach` */
function spiralArm(offset, reach, turns = 1.35, start = 20) {
  const span = turns * Math.PI * 2;
  const b = Math.log(reach / start) / span;
  let d = "";
  for (let i = 0; i <= 90; i += 1) {
    const theta = (i / 90) * span;
    const r = start * Math.exp(b * theta);
    const x = Math.cos(theta + offset) * r;
    const y = Math.sin(theta + offset) * r;
    d += `${i ? " L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

// Star dust scattered along the arms
const DUST = Array.from({ length: 240 }, (_, i) => {
  const rand = seeded(i + 211);
  const arm = i % 3;
  const t = rand(1);
  const span = 1.35 * Math.PI * 2;
  const theta = t * span;
  const r = 20 * Math.exp((Math.log(290 / 20) / span) * theta) + (rand(2) - 0.5) * 26;
  const angle = theta + (arm * Math.PI * 2) / 3 + (rand(3) - 0.5) * 0.35;
  return { x: Math.cos(angle) * r, y: Math.sin(angle) * r, size: 0.6 + rand(4) * 1.4, opacity: 0.35 + rand(5) * 0.6 };
});

// Spiral colours: starlight on the dark band, sky-to-indigo ink on the light one
const SPIRAL_TONES = {
  dark: {
    glow: [[0, "#e0f2fe", 0.9], [0.4, "#7dd3fc", 0.5], [1, "#7dd3fc", 0]],
    arm: [[0, "#ffffff", 0.95], [0.5, "#bae6fd", 0.45], [1, "#bae6fd", 0]],
    dust: "#e0f2fe",
    dustOpacity: 1,
    nucleus: "radial-gradient(closest-side, rgba(224, 242, 254, 0.5), rgba(56, 189, 248, 0.15) 50%, transparent)"
  },
  light: {
    glow: [[0, "#38bdf8", 0.5], [0.4, "#818cf8", 0.22], [1, "#818cf8", 0]],
    arm: [[0, "#0284c7", 0.85], [0.5, "#6366f1", 0.4], [1, "#6366f1", 0]],
    dust: "#0284c7",
    dustOpacity: 0.7,
    nucleus: "radial-gradient(closest-side, rgba(255, 255, 255, 0.95), rgba(56, 189, 248, 0.22) 50%, transparent)"
  }
};

/* The cosmic spiral behind the core: a tilted disc turning slowly in-plane */
function GalaxySpiral({ size, reduceMotion, isLight }) {
  const half = size / 2;
  const reach = half * 0.9;
  const tone = SPIRAL_TONES[isLight ? "light" : "dark"];
  // Three bright arms plus three fainter ones between them for a denser disc
  const arms = [0, 1, 2].map((k) => spiralArm((k * Math.PI * 2) / 3, reach));
  const faintArms = [0, 1, 2].map((k) => spiralArm((k * Math.PI * 2) / 3 + Math.PI / 3, reach * 0.8, 1.15));
  const spin = reduceMotion ? undefined : "orbit-spin 120s linear infinite";
  const stops = (list) =>
    list.map(([offset, stopColor, stopOpacity]) => (
      <stop key={offset} offset={offset} stopColor={stopColor} stopOpacity={stopOpacity} />
    ));

  return (
    <div aria-hidden className="pointer-events-none absolute" style={{ width: size, height: size, transform: "scaleY(0.6)" }}>
      {/* Soft glow copy */}
      <div className="absolute inset-0" style={{ animation: spin, filter: "blur(10px)" }}>
        <svg viewBox={`${-half} ${-half} ${size} ${size}`} width={size} height={size}>
          <defs>
            <radialGradient id="galaxy-glow" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={reach}>
              {stops(tone.glow)}
            </radialGradient>
          </defs>
          {arms.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="url(#galaxy-glow)" strokeWidth="26" strokeLinecap="round" />
          ))}
          {faintArms.map((d, i) => (
            <path key={`f${i}`} d={d} fill="none" stroke="url(#galaxy-glow)" strokeWidth="14" strokeLinecap="round" opacity="0.6" />
          ))}
        </svg>
      </div>
      {/* Crisp arms + dust */}
      <div className="absolute inset-0" style={{ animation: spin }}>
        <svg viewBox={`${-half} ${-half} ${size} ${size}`} width={size} height={size}>
          <defs>
            <radialGradient id="galaxy-arm" gradientUnits="userSpaceOnUse" cx="0" cy="0" r={reach}>
              {stops(tone.arm)}
            </radialGradient>
          </defs>
          {arms.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="url(#galaxy-arm)" strokeWidth="1.8" strokeLinecap="round" />
          ))}
          {faintArms.map((d, i) => (
            <path key={`f${i}`} d={d} fill="none" stroke="url(#galaxy-arm)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
          ))}
          {DUST.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.size} fill={tone.dust} opacity={p.opacity * tone.dustOpacity * (1 - Math.hypot(p.x, p.y) / (half * 1.1))} />
          ))}
        </svg>
      </div>
      {/* Bright nucleus */}
      <div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: tone.nucleus }}
      />
    </div>
  );
}

/* The ITOps core disc at the heart of the spiral */
function CoreDisc({ size, isLight }) {
  return (
    <div
      className="relative grid place-items-center rounded-full border border-white/20 light:border-sky-300/70"
      style={{
        width: size,
        height: size,
        background: isLight
          ? "radial-gradient(circle at 50% 35%, #ffffff, #e0f2fe 80%)"
          : "radial-gradient(circle at 50% 35%, #16233b, #070b16 70%)",
        boxShadow: isLight
          ? `0 0 0 6px rgba(56, 189, 248, 0.12), 0 0 40px 4px ${CORE_COLOR}59, 0 14px 28px -14px rgba(15, 23, 42, 0.35), inset 0 1px 0 #ffffff`
          : `0 0 0 6px rgba(56, 189, 248, 0.08), 0 0 44px 6px ${CORE_COLOR}55, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
      }}
    >
      <span className="absolute inset-[5px] rounded-full border border-dashed border-sky-300/25 light:border-sky-500/35" />
      <div className="flex flex-col items-center">
        <BrandMark size={Math.round(size * 0.34)} />
        <span className="mt-0.5 text-[12px] font-bold tracking-tight text-white light:text-slate-900">ITOps</span>
        <span className="font-mono text-[6.5px] uppercase tracking-[0.3em] text-sky-200/60 light:text-sky-700/70">Core</span>
      </div>
    </div>
  );
}

/* ── Scroll & orbit model ───────────────────────────────────────── */

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const rad = (deg) => (deg * Math.PI) / 180;
const fmt = (x, y) => `${x.toFixed(1)} ${y.toFixed(1)}`;

// Scroll progress → service index, holding on each service for part of the scroll
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

// A service's place on the orbit. Bearings are in degrees; 90° (6 o'clock) is the dock, nearest the viewer.
function orbitPose(bearing, g) {
  const a = rad(bearing);
  const front = (1 + Math.sin(a)) / 2;
  return { x: Math.cos(a) * g.rx, y: Math.sin(a) * g.ry, front, scale: BACK_SCALE + (1 - BACK_SCALE) * front };
}

// 1 while a service is parked in the dock, fading out a quarter-step either side
function dockAmount(bearing, slice) {
  const delta = ((((bearing - 90) % 360) + 540) % 360) - 180;
  return clamp01(1 - Math.abs(delta) / (slice * 0.25));
}

// Room for the fixed marketing nav above the heading (it wraps taller on phones and narrow laptops)
function navClearance(stageWidth, stageHeight) {
  if (stageWidth < 1140) return 96;
  return stageHeight < 760 ? 84 : 112;
}

// The spiral is a disc squashed to 60% height. Keep it inside the orbit box so it never runs into the heading.
function withSpiral(g, preferred, max) {
  const spiral = Math.round(Math.min(max, preferred, ((g.cy - 4) * 2) / 0.6));
  return { ...g, spiral, wispRx: spiral * 0.39, wispRy: spiral * 0.39 * 0.61 };
}

// Fit the orbit into the measured box: full cards, then slimmer cards, then icon orbs.
// The box shrinks or grows with whichever panel is showing, so each layout is sized for its own panel;
// otherwise a layout could lock itself in.
function computeGeometry(width, boxHeight, stageWidth, stageHeight, panelNow) {
  const base = { cx: width / 2, stageWidth, stageHeight };
  if (width >= DESKTOP_MIN_WIDTH) {
    const variant = stageHeight >= 960 ? "full" : stageHeight >= 760 ? "dense" : "strip";
    const height = boxHeight + panelNow - PANEL_HEIGHT[variant];
    for (const card of DESKTOP_CARDS) {
      const back = (card.cardH * BACK_SCALE) / 2;
      const front = card.cardH / 2 + TETHER;
      const ry = Math.min(250, (height - back - front) / 2);
      if (ry >= card.minRy) {
        const rx = Math.min(width / 2 - card.cardW / 2 - 12, 440);
        const slack = height - back - front - ry * 2;
        return withSpiral(
          {
            ...base,
            mode: "cards",
            variant,
            cardSize: card.size,
            cardW: card.cardW,
            cardH: card.cardH,
            dockBottom: card.cardH / 2,
            cy: back + ry + slack / 2,
            rx,
            ry,
            coreR: 46,
            height
          },
          rx * 1.6,
          680
        );
      }
    }
  }
  const variant = stageWidth >= 640 ? "strip" : stageHeight >= 760 ? "compact" : "mini";
  const height = boxHeight + panelNow - PANEL_HEIGHT[variant];
  // Bigger planets when a tablet or laptop has the room
  const orb = stageWidth >= 640 && height >= 320 ? 50 : 42;
  const back = (orb * BACK_SCALE) / 2;
  const front = orb / 2 + ORB_LABEL + 14;
  const rx = Math.min(width * 0.4, stageWidth >= 640 ? 340 : 300);
  const ry = Math.max(40, Math.min(rx * 0.7, (height - back - front) / 2));
  const slack = Math.max(0, height - back - front - ry * 2);
  return withSpiral(
    {
      ...base,
      mode: "orbs",
      variant,
      cardSize: "orb",
      cardW: orb,
      cardH: orb,
      dockBottom: orb / 2 + ORB_LABEL,
      cy: back + ry + slack / 2,
      rx,
      ry,
      coreR: ry < 70 ? 26 : 32,
      height
    },
    rx * 2.5,
    460
  );
}

// A dotted star trail from a service into the core, bowed so all trails swirl the same way.
// Coordinates are core-centred.
function trailPath(pose, g) {
  const halfW = (g.cardW * pose.scale) / 2;
  const halfH = (g.cardH * pose.scale) / 2;
  const t = Math.min(halfW / Math.max(Math.abs(pose.x), 1e-6), halfH / Math.max(Math.abs(pose.y), 1e-6));
  // Where the line to the core leaves the card
  const ax = pose.x * (1 - t);
  const ay = pose.y * (1 - t);
  const len = Math.hypot(ax, ay) || 1;
  const ux = -ax / len;
  const uy = -ay / len;
  const ex = -ux * (g.coreR + 8);
  const ey = -uy * (g.coreR + 8);
  const mx = (ax + ex) / 2 - uy * len * 0.2;
  const my = (ay + ey) / 2 + ux * len * 0.2;
  return `M ${fmt(ax, ay)} Q ${fmt(mx, my)} ${fmt(ex, ey)}`;
}

// A coloured arc of light hugging the spiral, centred on a service's bearing
function arcPath(bearing, rx, ry, spread) {
  const a0 = rad(bearing - spread);
  const a1 = rad(bearing + spread);
  return `M ${fmt(Math.cos(a0) * rx, Math.sin(a0) * ry)} A ${rx} ${ry} 0 0 1 ${fmt(Math.cos(a1) * rx, Math.sin(a1) * ry)}`;
}

/* ── Orbit pieces ───────────────────────────────────────────────── */

function cardSurface(color, ink, active, isLight) {
  if (isLight) {
    return {
      background: `linear-gradient(155deg, ${color}${active ? "30" : "1a"}, ${color}05 62%), rgba(255, 255, 255, 0.9)`,
      borderColor: `${ink}${active ? "b3" : "3d"}`,
      boxShadow: active
        ? `0 0 0 1px ${ink}4d, 0 18px 44px -16px ${color}b3, inset 0 1px 0 #ffffff`
        : `0 12px 32px -20px rgba(15, 23, 42, 0.35), inset 0 1px 0 #ffffff`
    };
  }
  return {
    background: `linear-gradient(155deg, ${color}${active ? "38" : "26"}, ${ink}14 62%), rgba(8, 12, 24, 0.8)`,
    borderColor: `${color}${active ? "e6" : "66"}`,
    boxShadow: active
      ? `0 0 0 1px ${color}80, 0 0 34px -2px ${color}8c, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      : `0 0 22px -8px ${color}66, inset 0 1px 0 rgba(255, 255, 255, 0.06)`
  };
}

// Type scale for each card size
const NODE_SIZES = {
  full: { pad: "p-4", icon: 30, title: "text-[14px]", gap: "mt-3", value: "text-[14px]", label: "text-[10px]" },
  dense: { pad: "p-3.5", icon: 26, title: "text-[13.5px]", gap: "mt-2", value: "text-[13px]", label: "text-[10px]" },
  mini: { pad: "px-3 py-2.5", icon: 22, title: "text-[12.5px]", gap: "mt-1.5", value: "text-[12px]", label: "text-[9.5px]" }
};

// `shade` (a motion value, 0–1) dims cards at the back of the orbit. It is an overlay rather than
// element opacity, because opacity below 1 would switch off the card's backdrop blur.
function ServiceNode({ feature, meta, active, onSelect, isLight, size = "full", shade, className = "" }) {
  const t = NODE_SIZES[size];
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show ${feature.title}`}
      className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border text-left backdrop-blur-md transition-[transform,box-shadow,border-color,background] duration-500 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 light:focus-visible:ring-slate-900/40 ${t.pad} ${className}`}
      style={{ ...cardSurface(meta.color, meta.ink, active, isLight), transform: active ? "scale(1.04)" : undefined }}
    >
      <div className="flex items-center gap-2.5">
        <FeatureIcon title={feature.title} size={t.icon} />
        <span className={`font-semibold leading-tight tracking-tight text-white light:text-slate-900 ${t.title}`}>
          {feature.title}
        </span>
      </div>
      <div className={`grid grid-cols-3 gap-2 ${t.gap}`}>
        {meta.stats.map(([value, label]) => (
          <div key={label} className="min-w-0">
            <p className={`truncate font-semibold tabular-nums text-white light:text-slate-900 ${t.value}`}>{value}</p>
            <p className={`mt-0.5 truncate text-white/55 light:text-slate-500 ${t.label}`}>{label}</p>
          </div>
        ))}
      </div>
      {shade && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#050811] light:bg-slate-50"
          style={{ opacity: shade }}
        />
      )}
    </button>
  );
}

// Phones and short screens: each service is an icon planet with a label, like the platform orbit
function ServiceOrb({ feature, meta, active, onSelect, isLight, size, labelOpacity }) {
  const tone = toneOf(meta, isLight);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`Show ${feature.title}`}
      className="group relative block h-full w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 light:focus-visible:ring-slate-900/40"
    >
      <span
        className="block rounded-xl transition-shadow duration-500"
        style={{
          boxShadow: active
            ? `0 0 0 2px ${isLight ? "#ffffff" : "#050811"}, 0 0 0 3.5px ${tone}, 0 0 26px ${meta.color}`
            : `0 0 18px -6px ${meta.color}`
        }}
      >
        <FeatureIcon title={feature.title} size={size} />
      </span>
      <motion.span
        className={`pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] font-semibold tracking-wide ${
          active ? "" : "text-white/55 light:text-slate-500"
        }`}
        style={{ opacity: labelOpacity, ...(active ? { color: tone } : {}) }}
      >
        {meta.short}
      </motion.span>
    </button>
  );
}

// One service riding the orbit: position, depth scale, dimming and stacking all follow the scroll
function OrbitService({ service, index, slice, rotation, g, active, isLight, revealed, onSelect }) {
  const bearing = useTransform(rotation, (r) => 90 + index * slice + r);
  const x = useTransform(bearing, (b) => Math.cos(rad(b)) * g.rx);
  const y = useTransform(bearing, (b) => Math.sin(rad(b)) * g.ry);
  const front = useTransform(bearing, (b) => (1 + Math.sin(rad(b))) / 2);
  const scale = useTransform(front, (f) => BACK_SCALE + (1 - BACK_SCALE) * f);
  const zIndex = useTransform(front, (f) => Math.round(f * 100));
  const isOrb = g.mode === "orbs";
  // Cards dim with a shade overlay (see ServiceNode); orbs have no backdrop blur, so plain opacity is fine
  const shade = useTransform(front, (f) => (1 - f) * 0.5);
  const opacity = useTransform(front, (f) => 0.5 + 0.5 * f);
  // The planet at the very back hides its label, which would otherwise crowd the core on flat orbits
  const labelOpacity = useTransform(front, (f) => clamp01(f * 5));

  return (
    <motion.div
      className="absolute"
      style={{ left: -g.cardW / 2, top: -g.cardH / 2, width: g.cardW, height: g.cardH, x, y, scale, zIndex, opacity: isOrb ? opacity : 1 }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.15 + index * 0.07 }}
      >
        {isOrb ? (
          <ServiceOrb feature={service.feature} meta={service.meta} active={active} onSelect={onSelect} isLight={isLight} size={g.cardW} labelOpacity={labelOpacity} />
        ) : (
          <ServiceNode
            feature={service.feature}
            meta={service.meta}
            active={active}
            onSelect={onSelect}
            isLight={isLight}
            size={g.cardSize}
            shade={shade}
            className="h-full w-full"
          />
        )}
      </motion.div>
    </motion.div>
  );
}

// The light a service throws on the spiral, plus its star trail into the core
function OrbitTrace({ meta, index, slice, rotation, g, isLight }) {
  const tone = toneOf(meta, isLight);
  const bearing = useTransform(rotation, (r) => 90 + index * slice + r);
  const trail = useTransform(bearing, (b) => trailPath(orbitPose(b, g), g));
  // The docked service swaps its trail for the beam
  const trailOpacity = useTransform(bearing, (b) => 0.75 * (1 - dockAmount(b, slice)));
  const wispWide = useTransform(bearing, (b) => arcPath(b, g.wispRx, g.wispRy, 26));
  const wispCore = useTransform(bearing, (b) => arcPath(b, g.wispRx, g.wispRy, 11));
  const outer = useTransform(bearing, (b) => arcPath(b + 8, g.wispRx * 1.09, g.wispRy * 1.09, 20));

  return (
    <g>
      <motion.path d={wispWide} fill="none" stroke={tone} strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
      <motion.path
        d={wispCore}
        fill="none"
        stroke={tone}
        strokeOpacity="0.9"
        strokeWidth="2.4"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 ${isLight ? 3 : 6}px ${meta.color})` }}
      />
      {g.mode === "cards" && (
        <motion.path d={outer} fill="none" stroke={tone} strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 6" />
      )}
      <motion.path
        d={trail}
        fill="none"
        stroke={tone}
        strokeOpacity="0.55"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
        className="animate-orbit-dash"
        style={{ opacity: trailOpacity }}
      />
    </g>
  );
}

// Faint star-chart grid centred on the core (desktop only)
function StarChart({ g, isLight }) {
  const k = g.spiral / 640;
  const ring = isLight ? "rgba(71, 85, 105, 0.12)" : "rgba(148, 163, 184, 0.08)";
  const spoke = isLight ? "rgba(71, 85, 105, 0.07)" : "rgba(148, 163, 184, 0.05)";
  return (
    <svg aria-hidden className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
      {[190, 320, 470, 640, 820].map((r) => (
        <circle key={r} r={r * k} fill="none" stroke={ring} />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const a = rad(i * 15);
        return <line key={i} x1={Math.cos(a) * 130 * k} y1={Math.sin(a) * 130 * k} x2={Math.cos(a) * 900} y2={Math.sin(a) * 900} stroke={spoke} />;
      })}
      {[0, 30, 150, 180, 210, 330].map((deg) => {
        const a = rad(-deg);
        const x = Math.cos(a) * 655 * k;
        const y = Math.sin(a) * 655 * k;
        // Only the bearings that land inside the orbit box
        if (g.cy + y < 12 || g.cy + y > g.height - 12) return null;
        return (
          <text key={deg} x={x} y={y} textAnchor="middle" className="fill-white/25 font-mono text-[10px] light:fill-slate-400">
            {deg}°
          </text>
        );
      })}
    </svg>
  );
}

// The docked service's beam into the core and its tether down to the detail panel
function DockBeam({ g, docked, meta, isLight, reduceMotion, revealed }) {
  const tone = toneOf(meta, isLight);
  const near = g.coreR - 4;
  const dockTop = g.ry - g.cardH / 2;
  const dockBottom = g.ry + g.dockBottom;
  const spread = g.mode === "orbs" ? 12 : 46;
  const tetherLength = Math.max(0, g.height - g.cy - dockBottom);
  const wedge = [
    [4, near],
    [spread, dockTop],
    [-spread, dockTop],
    [-4, near]
  ]
    .map(([x, y]) => fmt(x, y))
    .join(" ");
  const center = `M 0 ${dockTop.toFixed(1)} L 0 ${near.toFixed(1)}`;

  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0" style={{ opacity: docked }}>
      <svg className="absolute left-0 top-0 overflow-visible" width="1" height="1">
        <defs>
          <linearGradient id="dock-beam" gradientUnits="userSpaceOnUse" x1="0" y1={near} x2="0" y2={dockTop}>
            <stop offset="0" stopColor={isLight ? tone : "#ffffff"} stopOpacity={isLight ? 0.6 : 0.9} />
            <stop offset="0.35" stopColor={meta.color} stopOpacity={isLight ? 0.4 : 0.55} />
            <stop offset="1" stopColor={meta.color} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <polygon points={wedge} fill="url(#dock-beam)" style={{ filter: "blur(6px)" }} />
        <polygon points={wedge} fill="url(#dock-beam)" opacity="0.55" />
        <path d={center} stroke={isLight ? tone : "#ffffff"} strokeOpacity={isLight ? 0.6 : 0.8} strokeWidth="1.2" />
        {!reduceMotion &&
          revealed &&
          [0, -0.6, -1.2].map((begin) => (
            <circle key={begin} r="3" fill={tone} style={{ filter: `drop-shadow(0 0 6px ${meta.color})` }}>
              <animateMotion dur="1.8s" begin={`${begin}s`} repeatCount="indefinite" path={center} />
            </circle>
          ))}
      </svg>

      {g.mode === "orbs" ? (
        // A ring around the docked planet, as on the platform orbit
        <span
          className="absolute rounded-[50%] border-[1.5px]"
          style={{
            left: -g.cardW * 1.05,
            top: g.ry - g.cardW * 0.32,
            width: g.cardW * 2.1,
            height: g.cardW * 0.64,
            borderColor: "var(--orbit-tint)",
            boxShadow: "0 0 14px -2px var(--orbit-tint)"
          }}
        />
      ) : (
        // A soft cradle of light under the docked card
        <span
          className="absolute rounded-[50%] blur-md"
          style={{
            left: -g.cardW * 0.45,
            top: dockBottom - 12,
            width: g.cardW * 0.9,
            height: 24,
            background: "radial-gradient(closest-side, color-mix(in srgb, var(--orbit-tint) 55%, transparent), transparent)"
          }}
        />
      )}

      {tetherLength > 4 && (
        <span
          className="absolute -ml-px w-0.5 overflow-hidden"
          style={{
            left: 0,
            top: dockBottom,
            height: tetherLength,
            background: "repeating-linear-gradient(to bottom, var(--orbit-tint) 0 4px, transparent 4px 8px)"
          }}
        >
          {!reduceMotion && (
            <motion.span
              className="absolute -left-[2px] top-0 h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--orbit-tint)", boxShadow: "0 0 8px var(--orbit-tint)" }}
              animate={{ y: [0, tetherLength], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
            />
          )}
        </span>
      )}
    </motion.div>
  );
}

/* ── Detail panel ───────────────────────────────────────────────── */

function TrendChart({ trend, color, glow = color, dates, isLight, height = 90 }) {
  const w = 300;
  const h = height;
  const pad = { l: 28, r: 6, t: 8, b: 18 };
  const { data } = trend;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / (max - min || 1)) * (h - pad.t - pad.b);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)} ${h - pad.b} L${pad.l} ${h - pad.b} Z`;
  const ticks = [max, Math.round((max + min) / 2), min];
  const gradientId = `trend-${trend.label.replace(/\W/g, "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`${trend.label}, sample data`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={glow} stopOpacity={isLight ? 0.3 : 0.35} />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke={isLight ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.07)"} strokeDasharray="2 4" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" className="fill-white/35 font-mono text-[8.5px] light:fill-slate-400">
            {v}
          </text>
        </g>
      ))}
      {[0, 4, 9, 13].map((i) => (
        <text key={i} x={x(i)} y={h - 4} textAnchor={i === 0 ? "start" : i === 13 ? "end" : "middle"} className="fill-white/35 font-mono text-[8.5px] light:fill-slate-400">
          {dates[i]}
        </text>
      ))}
      <motion.path
        key={`${trend.label}-area`}
        d={area}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
      <motion.path
        key={`${trend.label}-line`}
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="3" fill={color} style={{ filter: `drop-shadow(0 0 4px ${glow})` }} />
    </svg>
  );
}

function ExploreLink({ href, color }) {
  if (!href) return null;
  return (
    <Link
      to={href}
      className="group/cta inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[12.5px] font-semibold text-slate-950 transition-transform duration-200 hover:scale-[1.03] light:bg-slate-900 light:text-white"
      style={{ boxShadow: `0 8px 24px -8px ${color}` }}
    >
      Explore service
      <span aria-hidden className="transition-transform duration-200 group-hover/cta:translate-x-0.5">→</span>
    </Link>
  );
}

function PanelHeading({ feature, meta, ink, iconSize, small = false }) {
  return (
    <div className={`flex min-w-0 items-center ${small ? "gap-3" : "gap-3.5"}`}>
      <span className="shrink-0 rounded-2xl" style={{ boxShadow: `0 0 26px -4px ${meta.color}` }}>
        <FeatureIcon title={feature.title} size={iconSize} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: ink }}>
            {meta.eyebrow}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-px text-[9.5px] font-semibold text-emerald-300 light:border-emerald-600/25 light:text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 light:bg-emerald-500 [animation:pulse-glow_1.8s_ease-in-out_infinite]" />
            LIVE
          </span>
        </div>
        <h3
          className={`mt-0.5 truncate font-semibold tracking-tight text-white light:text-slate-900 ${
            small ? "text-base" : "text-lg sm:text-xl"
          }`}
        >
          {feature.title}
        </h3>
      </div>
    </div>
  );
}

function StatsBox({ stats, className = "" }) {
  return (
    <div
      className={`grid shrink-0 grid-cols-3 gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 light:border-slate-900/10 light:bg-white ${className}`}
    >
      {stats.map(([value, label]) => (
        <div key={label} className="min-w-0">
          <p className="truncate text-[13px] font-semibold tabular-nums text-white light:text-slate-900">{value}</p>
          <p className="truncate text-[10px] text-white/55 light:text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

const PANEL_VARIANTS = {
  enter: (d) => ({ opacity: 0, x: d * 32, filter: "blur(6px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (d) => ({ opacity: 0, x: d * -32, filter: "blur(6px)" })
};

const PANEL_PADDING = { full: "p-5", dense: "px-5 py-4", strip: "px-5 py-4", compact: "p-4", mini: "p-3.5" };

// `variant` is one of the PANEL_HEIGHT keys: the panel fills that fixed height
function DetailPanel({ service, dates, isLight, variant, direction }) {
  const { feature, meta } = service;
  const { color } = meta;
  const ink = toneOf(meta, isLight);
  const body = "text-white/70 light:text-slate-600";

  let content;
  if (variant === "mini") {
    // Short phones: heading, two lines of copy, the call to action and one headline stat
    const [value, label] = meta.stats[0];
    content = (
      <div className="relative flex h-full flex-col">
        <PanelHeading feature={feature} meta={meta} ink={ink} iconSize={36} small />
        <p className={`mt-2 line-clamp-2 text-[12.5px] leading-relaxed ${body}`}>{feature.body}</p>
        <div className="mt-auto flex shrink-0 items-center justify-between gap-3 pt-2">
          <ExploreLink href={feature.href} color={color} />
          <p className="truncate text-right font-mono text-[10px] uppercase tracking-[0.12em] text-white/55 light:text-slate-500">
            <span className="mr-1.5 text-[13px] font-bold tracking-normal" style={{ color: ink }}>
              {value}
            </span>
            {label}
          </p>
        </div>
      </div>
    );
  } else if (variant === "compact") {
    // Tall phones: room for three lines of copy and the stats
    content = (
      <div className="relative flex h-full flex-col">
        <PanelHeading feature={feature} meta={meta} ink={ink} iconSize={40} />
        <p className={`mt-2 line-clamp-3 text-[13px] leading-relaxed ${body}`}>{feature.body}</p>
        <StatsBox stats={meta.stats} className="mt-2.5" />
        <div className="mt-auto shrink-0 pt-2.5">
          <ExploreLink href={feature.href} color={color} />
        </div>
      </div>
    );
  } else if (variant === "strip") {
    // Short laptops and tablets: one wide, low row
    content = (
      <div className="relative grid h-full grid-cols-1 items-center gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <div className="min-w-0">
          <PanelHeading feature={feature} meta={meta} ink={ink} iconSize={40} />
          <p className={`mt-2 line-clamp-3 text-[13px] leading-relaxed ${body}`}>{feature.body}</p>
        </div>
        <div className="hidden min-w-0 flex-col gap-3 sm:flex">
          <StatsBox stats={meta.stats} />
          <div className="flex justify-end">
            <ExploreLink href={feature.href} color={color} />
          </div>
        </div>
      </div>
    );
  } else {
    const dense = variant === "dense";
    content = (
      <div className="relative grid h-full grid-cols-[minmax(0,1fr)_280px] gap-6">
        <div className="flex min-w-0 flex-col">
          <PanelHeading feature={feature} meta={meta} ink={ink} iconSize={dense ? 40 : 46} />
          <p className={`line-clamp-2 text-[14px] leading-relaxed ${body} ${dense ? "mt-2.5" : "mt-3"}`}>{feature.body}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11.5px] text-white/75 light:border-slate-900/10 light:bg-white light:text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <div className="flex justify-end">
            <ExploreLink href={feature.href} color={color} />
          </div>
          <p className="mb-0.5 mt-auto flex items-center justify-between font-mono text-[9.5px] uppercase tracking-[0.14em] text-white/40 light:text-slate-400">
            <span>{meta.trend.label}</span>
            <span>Sample data</span>
          </p>
          <TrendChart trend={meta.trend} color={ink} glow={color} dates={dates} isLight={isLight} height={dense ? 84 : 96} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      custom={direction}
      variants={PANEL_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4, ease: EASE }}
      className={`relative h-full overflow-hidden rounded-2xl border ${PANEL_PADDING[variant]}`}
      style={
        isLight
          ? {
              borderColor: `${ink}4d`,
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96))",
              boxShadow: `0 0 0 1px ${color}1f, 0 28px 60px -28px ${color}a6, inset 0 1px 0 #ffffff`
            }
          : {
              borderColor: `${color}73`,
              background: `linear-gradient(180deg, rgba(15, 21, 36, 0.94), rgba(7, 10, 19, 0.96))`,
              boxShadow: `0 0 0 1px ${color}1f, 0 0 48px -14px ${color}8c, inset 0 1px 0 rgba(255, 255, 255, 0.06)`
            }
      }
    >
      <span aria-hidden className="pointer-events-none absolute -top-24 left-10 h-48 w-72 rounded-full blur-3xl" style={{ background: `${color}24` }} />
      {content}
    </motion.div>
  );
}

/* ── Controls ───────────────────────────────────────────────────── */

function Sparkle({ className = "" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M8 0 C8.6 5.4 10.6 7.4 16 8 C10.6 8.6 8.6 10.6 8 16 C7.4 10.6 5.4 8.6 0 8 C5.4 7.4 7.4 5.4 8 0Z" fill="currentColor" />
    </svg>
  );
}

const DIGIT_VARIANTS = {
  enter: (d) => ({ y: d >= 0 ? 12 : -12, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d >= 0 ? -12 : 12, opacity: 0 })
};

function StepCounter({ active, count, direction }) {
  return (
    <div className="flex items-center whitespace-nowrap font-mono text-xs font-bold text-white/90 light:text-slate-800">
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
      <span className="ml-1 text-white/30 light:text-slate-400">/ {String(count).padStart(2, "0")}</span>
    </div>
  );
}

// Markers for each service on a line whose fill is graded through the six service colours
function OrbitPager({ services, active, progress, suiteGradient, onSelect, isLight }) {
  const count = services.length;
  const pct = (i) => (i / (count - 1)) * 100;
  const fill = useTransform(progress, (v) => `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`);
  const arrow =
    "grid h-7 w-7 shrink-0 cursor-pointer place-items-center text-white/60 transition-colors hover:text-white disabled:cursor-default disabled:opacity-30 light:text-slate-400 light:hover:text-slate-900";

  return (
    <div className="flex w-full items-center gap-3">
      <button type="button" onClick={() => onSelect(active - 1)} disabled={active === 0} aria-label="Previous service" className={arrow}>
        <Sparkle className="h-3.5 w-3.5" />
      </button>
      <div className="relative h-5 flex-1" role="tablist" aria-label="Services">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/15 light:bg-slate-900/15" />
        <motion.span
          className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{ background: suiteGradient, clipPath: fill }}
        />
        {services.map(({ feature, meta }, i) => {
          const isActive = i === active;
          const tone = toneOf(meta, isLight);
          return (
            <button
              key={meta.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={feature.title}
              onClick={() => onSelect(i)}
              className="absolute top-1/2 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 light:focus-visible:ring-slate-900/40"
              style={{ left: `${pct(i)}%` }}
            >
              <span
                className="rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 14 : 8,
                  height: isActive ? 14 : 8,
                  background: isActive || i < active ? meta.color : isLight ? "#ffffff" : "#1e293b",
                  border: `1px solid ${isActive ? "#ffffff" : `${tone}99`}`,
                  boxShadow: isActive ? `0 0 0 4px ${meta.color}33, 0 0 16px ${meta.color}` : "none"
                }}
              />
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => onSelect(active + 1)} disabled={active === count - 1} aria-label="Next service" className={arrow}>
        <Sparkle className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Heading ────────────────────────────────────────────────────── */

// Pinned, the subtitle gives its room to the orbit on shorter screens
function SectionHeading({ pinned, isLight }) {
  return (
    <div className="relative z-20 shrink-0 text-center">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
        className="font-mono text-[10.5px] font-medium uppercase tracking-[0.28em] text-white/50 light:text-slate-500"
      >
        Everything Included
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-[2.6rem] md:leading-[1.1] light:text-slate-900"
        // Pinned, the title scales with the screen height too, so short laptops keep room for the orbit
        style={pinned ? { fontSize: "clamp(1.4rem, min(4.6vh, 6.4vw), 2.6rem)", lineHeight: 1.12 } : undefined}
      >
        Six Services,{" "}
        <span
          className="orbit-gradient-text inline-block pb-[0.08em]"
          style={{
            // The site's brand gradient, mirrored so the pan loops seamlessly
            backgroundImage: isLight
              ? "linear-gradient(100deg, #0891b2 0%, #2563eb 25%, #7c3aed 50%, #2563eb 75%, #0891b2 100%)"
              : "linear-gradient(100deg, #00f0ff 0%, #3b82f6 25%, #a78bfa 50%, #3b82f6 75%, #00f0ff 100%)"
          }}
        >
          One Dashboard
        </span>
      </motion.h2>
      <p
        className={`mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/55 light:text-slate-600 ${
          pinned ? "[@media(max-height:959px)]:hidden" : ""
        }`}
      >
        Every module below is live in the product today and feeds the same dashboard, incidents, and alerts.
      </p>
    </div>
  );
}

/* ── The pinned orbit ───────────────────────────────────────────── */

function ServiceOrbit({ services, dates, isLight, reduceMotion }) {
  const count = services.length;
  const slice = 360 / count;
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const orbitRef = useRef(null);
  const panelRef = useRef(null);
  const [{ active, direction }, setNav] = useState({ active: 0, direction: 0 });
  const [geometry, setGeometry] = useState(null);
  const revealed = useInView(stageRef, { once: true, amount: 0.3 });
  const isInView = useInView(trackRef, { margin: "200px" });

  // Scroll through the track turns the orbit one service at a time
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const [input, output] = useMemo(() => steppedRange(count), [count]);
  const stepped = useTransform(scrollYProgress, input, output);
  const rotationTarget = useTransform(stepped, (v) => -v * slice);
  const spring = useSpring(rotationTarget, { stiffness: 85, damping: 22, mass: 0.65 });
  const rotation = reduceMotion ? rotationTarget : spring;
  const progress = useTransform(rotation, (r) => clamp01(-r / slice / (count - 1)));
  const docked = useTransform(rotation, (r) => {
    const k = -r / slice;
    return clamp01(1 - Math.abs(k - Math.round(k)) * 4);
  });
  const barClip = useTransform(scrollYProgress, (v) => `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`);

  const syncActive = useCallback(
    (r) => {
      const index = ((Math.round(-r / slice) % count) + count) % count;
      setNav((prev) => (prev.active === index ? prev : { active: index, direction: index > prev.active ? 1 : -1 }));
    },
    [slice, count]
  );
  useMotionValueEvent(rotationTarget, "change", syncActive);

  // Fit the orbit into whatever height the header, panel and controls leave
  useLayoutEffect(() => {
    const box = orbitRef.current;
    const stage = stageRef.current;
    if (!box || !stage) return undefined;
    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      const panelNow = panelRef.current?.offsetHeight ?? PANEL_HEIGHT.dense;
      const { width: stageWidth, height: stageHeight } = stage.getBoundingClientRect();
      setGeometry(computeGeometry(width, height, stageWidth, stageHeight, panelNow));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // Land on the right service when the page opens part-way through the track
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    const index = Math.round(clamp01(-track.getBoundingClientRect().top / distance) * (count - 1));
    spring.jump(-index * slice);
    setNav({ active: index, direction: 0 });
  }, [spring, slice, count]);

  const goToIndex = useCallback(
    (index) => {
      const track = trackRef.current;
      if (!track) return;
      const target = Math.min(count - 1, Math.max(0, index));
      const distance = Math.max(1, track.offsetHeight - window.innerHeight);
      const top = track.getBoundingClientRect().top + window.scrollY + (target / (count - 1)) * distance;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [count, reduceMotion]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goToIndex(active + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goToIndex(active - 1);
      }
    },
    [active, goToIndex]
  );

  const current = services[active];
  const tint = toneOf(current.meta, isLight);
  const suiteGradient = `linear-gradient(90deg, ${services.map(({ meta }) => toneOf(meta, isLight)).join(", ")})`;
  const orbs = geometry?.mode === "orbs";
  const variant = geometry?.variant ?? "dense";
  const panelHeight = PANEL_HEIGHT[variant];

  return (
    <MotionConfig reducedMotion="user">
      <div ref={trackRef} className="relative w-full bg-[#050811] light:bg-slate-50" style={{ height: `${count * SCROLL_VH_PER_ITEM + 100}vh` }}>
        <div
          className="sticky top-0 isolate h-svh w-full overflow-hidden bg-[#050811] text-white light:bg-slate-50 light:text-slate-900"
          style={{ "--orbit-tint": tint, transition: "--orbit-tint 0.7s ease" }}
        >
          <SpaceBackdrop isLight={isLight} />

          <div
            ref={stageRef}
            onKeyDown={onKeyDown}
            tabIndex={-1}
            className="relative flex h-full w-full flex-col items-center px-4 pb-4 pt-24 focus:outline-none sm:px-8 md:pt-28"
            style={geometry ? { paddingTop: navClearance(geometry.stageWidth, geometry.stageHeight) } : undefined}
          >
            <SectionHeading pinned isLight={isLight} />

            {/* The orbit: spiral, core, traces, beam and the six services */}
            <div ref={orbitRef} className="relative isolate z-10 mt-2 min-h-0 w-full max-w-7xl flex-1">
              {geometry && (
                <div className="absolute h-0 w-0" style={{ left: geometry.cx, top: geometry.cy }}>
                  {!orbs && <StarChart g={geometry} isLight={isLight} />}
                  <div className="absolute" style={{ left: -geometry.spiral / 2, top: -geometry.spiral / 2 }}>
                    <GalaxySpiral size={geometry.spiral} reduceMotion={reduceMotion || !isInView} isLight={isLight} />
                  </div>
                  <svg aria-hidden className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
                    {services.map(({ meta }, i) => (
                      <OrbitTrace key={meta.key} meta={meta} index={i} slice={slice} rotation={rotation} g={geometry} isLight={isLight} />
                    ))}
                  </svg>
                  <DockBeam g={geometry} docked={docked} meta={current.meta} isLight={isLight} reduceMotion={reduceMotion || !isInView} revealed={revealed} />
                  {services.map((service, i) => (
                    <OrbitService
                      key={service.meta.key}
                      service={service}
                      index={i}
                      slice={slice}
                      rotation={rotation}
                      g={geometry}
                      active={i === active}
                      isLight={isLight}
                      revealed={revealed}
                      onSelect={() => goToIndex(i)}
                    />
                  ))}
                  {/* ITOps core, with sonar pulses in the active service's colour */}
                  <motion.div
                    className="absolute z-[200]"
                    style={{ left: -geometry.coreR, top: -geometry.coreR }}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    {!reduceMotion && isInView &&
                      [0, 1.1].map((delay) => (
                        <span
                          key={delay}
                          aria-hidden
                          className="animate-orbit-sonar absolute inset-0 rounded-full border"
                          style={{ borderColor: "var(--orbit-tint)", animationDelay: `${delay}s` }}
                        />
                      ))}
                    <CoreDisc size={geometry.coreR * 2} isLight={isLight} />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Detail panel, docked under the orbit */}
            <div ref={panelRef} className="relative z-20 w-full shrink-0" style={{ height: panelHeight, maxWidth: orbs ? (variant === "strip" ? 720 : 560) : 900 }}>
              <span
                aria-hidden
                className="absolute left-1/2 top-0 z-30 -ml-1 -mt-1 h-2 w-2 rounded-full"
                style={{ background: "var(--orbit-tint)", boxShadow: "0 0 10px var(--orbit-tint)" }}
              />
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <DetailPanel
                  key={current.meta.key}
                  service={current}
                  dates={dates}
                  isLight={isLight}
                  variant={variant}
                  direction={direction}
                />
              </AnimatePresence>
            </div>

            {/* Step counter, pager and scroll hint */}
            <div className="relative z-20 mt-3 grid w-full max-w-7xl shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[1fr_minmax(0,440px)_1fr]">
              <StepCounter active={active} count={count} direction={direction} />
              <OrbitPager
                services={services}
                active={active}
                progress={progress}
                suiteGradient={suiteGradient}
                onSelect={goToIndex}
                isLight={isLight}
              />
              <div className="hidden items-center justify-self-end gap-2 whitespace-nowrap font-mono text-[9.5px] uppercase tracking-widest text-white/40 sm:flex light:text-slate-500">
                <span>Scroll to explore</span>
                <span aria-hidden className="flex h-5 w-3.5 justify-center rounded-full border border-white/30 light:border-slate-400">
                  <span className="animate-orbit-wheel mt-1 h-1.5 w-0.5 rounded-full" style={{ background: "var(--orbit-tint)" }} />
                </span>
              </div>
            </div>
          </div>

          {/* Continuous progress through the suite, graded through each service's colour */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/5 light:bg-slate-900/5">
            <motion.div className="h-full" style={{ background: suiteGradient, clipPath: barClip }} />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}

/* ── Short screens ──────────────────────────────────────────────── */

// Whether the viewport is too short to pin the orbit (landscape phones, tiny windows)
const SHORT_QUERY = `(max-height: ${MIN_PINNED_HEIGHT - 1}px)`;
function subscribeViewport(onChange) {
  const query = window.matchMedia(SHORT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTooShortToPin = () => window.matchMedia(SHORT_QUERY).matches;

// The services as a selectable grid with the same detail panel
function ServiceGrid({ services, dates, isLight }) {
  const [active, setActive] = useState(0);
  const current = services[active];
  const panel = (variant) => (
    <AnimatePresence mode="wait" initial={false}>
      <DetailPanel key={current.meta.key} service={current} dates={dates} isLight={isLight} variant={variant} direction={0} />
    </AnimatePresence>
  );

  return (
    <div
      className="relative isolate overflow-hidden bg-[#050811] px-6 py-16 text-white md:px-10 light:bg-slate-50 light:text-slate-900"
      style={{ "--orbit-tint": toneOf(current.meta, isLight), transition: "--orbit-tint 0.7s ease" }}
    >
      <SpaceBackdrop isLight={isLight} />
      <div className="relative mx-auto max-w-5xl">
        <SectionHeading isLight={isLight} />
        <div className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {services.map(({ feature, meta }, i) => (
            <ServiceNode
              key={meta.key}
              feature={feature}
              meta={meta}
              active={i === active}
              onSelect={() => setActive(i)}
              isLight={isLight}
              size="dense"
              className="min-h-[118px]"
            />
          ))}
        </div>
        <div className="mt-5 sm:hidden">{panel("compact")}</div>
        <div className="mt-5 hidden sm:block">{panel("strip")}</div>
      </div>
    </div>
  );
}

/* ── Section ────────────────────────────────────────────────────── */

export function ServiceConstellation({ features, loading, error, onRetry }) {
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const tooShort = useSyncExternalStore(subscribeViewport, isTooShortToPin, () => false);

  const services = useMemo(
    () => (features ?? []).map((feature) => ({ feature, meta: SERVICES[feature.title] })).filter((s) => s.meta),
    [features]
  );

  // Chart dates: the last 14 days ending today
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    });
  }, []);

  if (!loading && !error && services.length > 1) {
    return tooShort ? (
      <ServiceGrid services={services} dates={dates} isLight={isLight} />
    ) : (
      <ServiceOrbit services={services} dates={dates} isLight={isLight} reduceMotion={reduceMotion} />
    );
  }

  // Loading, error, or too few services to orbit: a plain band with the same backdrop
  return (
    <div className="relative isolate overflow-hidden bg-[#050811] px-6 py-20 text-white md:px-10 md:py-24 light:bg-slate-50 light:text-slate-900">
      <SpaceBackdrop isLight={isLight} />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading isLight={isLight} />
        <div className="mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl light:bg-slate-200/60" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message="Couldn't load the feature list." onRetry={onRetry} />
          ) : (
            <div className="mx-auto grid max-w-sm gap-4">
              {services.map(({ feature, meta }) => (
                <ServiceNode key={meta.key} feature={feature} meta={meta} active isLight={isLight} className="min-h-[132px]" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
