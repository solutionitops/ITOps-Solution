import { useCallback, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from "motion/react";
import { useTheme } from "../context/ThemeContext";
import { BrandMark } from "./BrandLogo";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_VH_PER_STEP = 40;
// Below this viewport height (landscape phones, tiny windows) the story isn't pinned; each step shows in turn
const MIN_PINNED_HEIGHT = 540;

const TONES = { ok: "#10b981", flow: "#0ea5e9", critical: "#ef4444", warning: "#f59e0b" };

// The five steps. Titles and bodies are written for someone who has never run a server.
const STEPS = [
  {
    id: "connect",
    num: "01",
    label: "Connect",
    tint: "#38bdf8",
    ink: "#0369a1",
    title: "Tell ITOps what to watch",
    body: "Paste a website or API address, or run one line on a Linux server. Each glowing dot on the map is something you own, wherever in the world it runs.",
    tech: "HTTP(S) monitors by URL · lightweight Linux agent (bash + curl) with a per-host, revocable key",
    icon: "plug"
  },
  {
    id: "monitor",
    num: "02",
    label: "Monitor",
    tint: "#22d3ee",
    ink: "#0e7490",
    title: "It checks everything, around the clock",
    body: "Like a guard doing rounds, ITOps asks each dot a question as often as every 30 seconds. The line going out is the question; the dot coming back is the answer.",
    tech: "HTTP GET · status-code and keyword assertions · response time · redirect chain up to 5 hops · DNS changes · TLS expiry",
    icon: "pulse"
  },
  {
    id: "detect",
    num: "03",
    label: "Detect",
    tint: "#f59e0b",
    ink: "#b45309",
    title: "It notices the moment something breaks",
    body: "The API in N. Virginia has stopped answering properly — its answer comes back red. ITOps waits for a few failed checks in a row, so a one-off blip never wakes anyone up.",
    tech: "Consecutive-failure threshold before an incident opens · the failing status code and check are recorded as the cause",
    icon: "search"
  },
  {
    id: "alert",
    num: "04",
    label: "Alert",
    tint: "#fb7185",
    ink: "#be123c",
    title: "The right people hear about it at once",
    body: "An incident opens with the exact error attached and goes straight to Slack, email, or your own tools — so the person who can fix it knows what broke and where.",
    tech: "Incident record with the failing check attached · delivery to Slack, email and generic webhooks",
    icon: "bell"
  },
  {
    id: "resolve",
    num: "05",
    label: "Resolve",
    tint: "#34d399",
    ink: "#047857",
    title: "It confirms the fix, then keeps watching",
    body: "When the API answers correctly again, ITOps closes the incident by itself, tells the team it's fixed and carries on checking.",
    tech: "Auto-resolve once checks pass · recovery notification · the incident stays in your history for review",
    icon: "shieldcheck"
  }
];
const STEP = { CONNECT: 0, MONITOR: 1, DETECT: 2, ALERT: 3, RESOLVE: 4 };

// A sample customer's infrastructure. ITOps runs every check from its own engine — the map shows
// where *your* things live, not where checks come from.
const ASSETS = [
  { id: "lb", icon: "cloud", name: "Load balancer", host: "lb.us-west-2", place: "Oregon", lon: -122.7, lat: 45.5, label: "top", ok: "200 OK · 212 ms" },
  { id: "api", icon: "api", name: "API", host: "api.example.com", place: "N. Virginia", lon: -77.5, lat: 38.9, label: "bottom", ok: "200 OK · 186 ms" },
  { id: "web", icon: "globe", name: "Website", host: "shop.example.com", place: "Frankfurt", lon: 8.7, lat: 50.1, label: "top", ok: "200 OK · 142 ms" },
  { id: "srv", icon: "server", name: "Server", host: "prod-web-01", place: "Singapore", lon: 103.8, lat: 1.35, label: "left", ok: "Agent online · CPU 34%" },
  { id: "edge", icon: "server", name: "Server", host: "edge-syd-01", place: "Sydney", lon: 151.2, lat: -33.9, label: "left", ok: "Agent online · CPU 21%" }
];
const FAILING = "api";
// The asset each step zooms in on — it matches the close-up cards below the map
const FOCUS = ["web", "web", "api", "api", "api"];
// Simulated time, so the story reads as one timeline
const CLOCK = ["09:38:00", "09:39:30", "09:41:07", "09:41:08", "09:49:12"];

// What runs and how often — the product's real cadences
const CHECK_SCHEDULE = [
  ["Uptime & status codes", "as often as every 30s"],
  ["Keywords & response time", "with every check"],
  ["SSL certificates", "daily"],
  ["Security headers", "every scan"],
  ["Server health (agent)", "every minute"]
];

/* ── World map ──────────────────────────────────────────────────── */

// Land as a dot grid: 144 × 54 cells of 2.5°, from 78.75°N down to 56.25°S (Natural Earth 1:110m,
// rasterised once). Each row is hex, one bit per cell.
const MAP_COLS = 144;
const MAP_ROWS = 54;
const MAP_TOP = 78.75;
const MAP_STEP = 2.5;
const LAND_ROWS = [
  "000000c0078fffff00020000000040000000",
  "00000018ff007fff00000003001ff801d000",
  "00000375af003ffe0000000408fffff0c000",
  "01fe007f23783ffe0000f0001bffffffff08",
  "3ffffffffffffffffffc00e0040000000000",
  "dffffffffffffffffff0c300000000000000",
  "03ffffffe2080e00003effffffffffffffbf",
  "07f9ffffc0700000003e4ffffffffffffc60",
  "00601fffe07e000002063fffffffffff0180",
  "02000ffffe7f80000210fffffffffffc0380",
  "000007fffe7fc0000bbfffffffffffff8200",
  "000007fffff8400000ffffffffffffff4000",
  "000003fffffc200001ffffffffffffff0000",
  "000003fffffa000001fbf5e7fffffffe0000",
  "000003fffff000000f9de067fffffff08000",
  "000003ffffc000000f12dff7ffffff608000",
  "000001ffff8000000f041ff3ffffff910000",
  "000000ffffc0000007f007ffffffff070000",
  "0000007fff0000000ffc83ffffffff080000",
  "0000001ff20000000fffffefffffff800000",
  "0000002f810000001ffffbf7ffffff000000",
  "00000017800000003ffffdfa1fffff800000",
  "00000003830000007ffffeff0ff7fc000000",
  "00000003884000007ffffefe07c7c0000000",
  "00000001f80000003ffffe7c0783e0800000",
  "000000001e0000007fffff700301f0800000",
  "00000000060000007fffff80030170800000",
  "00000000022e00003ffffff0030121000000",
  "00000000007f80001ffffff0008000200000",
  "00000000007fe0000d3fffe0000283000000",
  "00000000007ff000000fffc0000146000000",
  "0000000000fff000000fff800000ce000000",
  "0000000000fffe00000fff000000ce870000",
  "0000000001ffff800007ff0000000001c000",
  "0000000000ffffc00007ff0000001801e000",
  "00000000007fffc00007ff00000000401000",
  "00000000007fff800007ff000000000e0000",
  "00000000003fff000007ff100000003c4000",
  "00000000001fff000007fe300000007fc000",
  "00000000000fff000007fc20000000ffe000",
  "00000000000ffe000003fc60000007fff000",
  "00000000000ff8000003fc20000007fff800",
  "00000000000ff8000003f800000003fff800",
  "00000000001ff0000001f000000003fff800",
  "00000000001fe0000001e000000003c3f800",
  "00000000001f80000000000000000001f000",
  "00000000001f80000000000000000000f000",
  "00000000001e000000000000000000000002",
  "00000000003e000000000000000000002008",
  "00000000003c000000000000000000000010",
  "00000000003c000000000000000000000000",
  "000000000038000000000000000000000000",
  "000000000030000000000000000000000000",
  "00000000000c000000000000000000000000"
];

// All the land dots as one path — thousands of dots, a single DOM node
const LAND_PATH = (() => {
  const r = 0.34;
  let d = "";
  LAND_ROWS.forEach((row, y) => {
    for (let i = 0; i < row.length; i += 1) {
      const nibble = parseInt(row[i], 16);
      for (let b = 0; b < 4; b += 1) {
        if (nibble & (8 >> b)) {
          const x = i * 4 + b + 0.5;
          d += `M${(x - r).toFixed(2)} ${y + 0.5}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
        }
      }
    }
  });
  return d;
})();

const project = (lon, lat) => ({ x: (lon + 180) / MAP_STEP, y: (MAP_TOP - lat) / MAP_STEP });
const ENGINE = { x: MAP_COLS / 2, y: MAP_ROWS - 3.5 };

// A check's path from the engine to an asset, bowed upward like a flight route
function routePath(asset) {
  const p = project(asset.lon, asset.lat);
  const cx = (ENGINE.x + p.x) / 2;
  const cy = Math.min(ENGINE.y, p.y) - 12;
  return `M ${ENGINE.x} ${ENGINE.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
}

/* ── Small pieces ───────────────────────────────────────────────── */

function Icon({ name, className = "h-3.5 w-3.5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true
  };
  switch (name) {
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
        </svg>
      );
    case "api":
      return (
        <svg {...common}>
          <path d="M8 4C6 4 5 5 5 7v2.5C5 10.5 4.3 12 3 12c1.3 0 2 1.5 2 2.5V17c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2.5c0 1 .7 2.5 2 2.5-1.3 0-2 1.5-2 2.5V17c0 2-1 3-3 3" />
        </svg>
      );
    case "server":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="7" rx="2" />
          <rect x="3" y="13" width="18" height="7" rx="2" />
          <path d="M7 7.5h.01M7 16.5h.01" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7 18a4.5 4.5 0 0 1-.5-8.97A6 6 0 0 1 18 9.5a4.25 4.25 0 0 1-.75 8.5H7z" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M5 12.5l4.2 4.2L19 7" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <path d="M7 7l10 10M17 7L7 17" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
        </svg>
      );
    case "hash":
      return (
        <svg {...common}>
          <path d="M9 4L7 20M17 4l-2 16M4 9h16M3 15h16" />
        </svg>
      );
    case "plug":
      return (
        <svg {...common}>
          <path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0zM12 16.5V21" />
        </svg>
      );
    case "pulse":
      return (
        <svg {...common}>
          <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-4.2-4.2M11 8v3.5M11 14h.01" />
        </svg>
      );
    case "shieldcheck":
      return (
        <svg {...common}>
          <path d="M12 3l8 3.5v5c0 4.5-3.4 8.4-8 9.5-4.6-1.1-8-5-8-9.5v-5z" />
          <path d="M9 12.2l2.2 2.2 4-4.4" />
        </svg>
      );
    case "hook":
      return (
        <svg {...common}>
          <path d="M9 7a3 3 0 1 1 4.5 2.6L10 16M15 17h5a3 3 0 1 1-3 3M7 12.5a3 3 0 1 0 3 5h6" />
        </svg>
      );
    default:
      return null;
  }
}

function Tick({ ok = true, size = "h-3.5 w-3.5" }) {
  const color = ok ? TONES.ok : TONES.critical;
  return (
    <span className={`grid shrink-0 place-items-center rounded-full ${size}`} style={{ color, background: `${color}22` }}>
      <Icon name={ok ? "check" : "cross"} className="h-2.5 w-2.5" />
    </span>
  );
}

// Per-step status of each asset on the map
function assetState(asset, step) {
  if (step === STEP.CONNECT) return "new";
  if (asset.id !== FAILING) return "ok";
  if (step === STEP.DETECT || step === STEP.ALERT) return "down";
  if (step === STEP.RESOLVE) return "recovered";
  return "ok";
}
const STATE_COLOR = { new: "#38bdf8", ok: TONES.ok, down: TONES.critical, recovered: TONES.ok };

/* ── Map panel ──────────────────────────────────────────────────── */

function AssetPin({ asset, index, step, compact, sparse, isLight }) {
  const state = assetState(asset, step);
  const color = STATE_COLOR[state];
  const p = project(asset.lon, asset.lat);
  const tag =
    state === "down" ? "502 Bad Gateway" : state === "recovered" ? "Recovered · 191 ms" : state === "ok" ? asset.ok : "Connected";
  const focused = FOCUS[step] === asset.id;
  // Small maps only label the asset the story is about; on phones it sits below the pin, clear of the window bar
  const showLabel = !sparse || focused;
  const side = compact ? "bottom" : asset.label;
  const place =
    side === "left"
      ? "right-full top-1/2 mr-2.5 -translate-y-1/2 items-end text-right"
      : side === "top"
        ? "bottom-full left-1/2 mb-2.5 -translate-x-1/2 items-center text-center"
        : "left-1/2 top-full mt-2.5 -translate-x-1/2 items-center text-center";

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: `${(p.x / MAP_COLS) * 100}%`, top: `${(p.y / MAP_ROWS) * 100}%` }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: step === STEP.CONNECT ? 0.15 + index * 0.12 : 0 }}
    >
      {/* A dashed lens around the asset this step is about */}
      {focused && (
        <span
          aria-hidden
          className="animate-orbit-spin-slow absolute left-0 top-0 -ml-[17px] -mt-[17px] block h-[34px] w-[34px] rounded-full border border-dashed"
          style={{ borderColor: color }}
        />
      )}
      {/* The dot itself */}
      <span className="absolute left-0 top-0 -ml-[7px] -mt-[7px] block h-3.5 w-3.5">
        {(state === "new" || state === "down") && (
          <span className="absolute inset-0 animate-ping rounded-full opacity-70" style={{ background: color }} />
        )}
        <span
          className="absolute inset-0 rounded-full border-2 transition-colors duration-500"
          style={{ background: color, borderColor: isLight ? "#ffffff" : "#0b1020", boxShadow: `0 0 12px ${color}` }}
        />
      </span>
      {showLabel && (
        <div className={`pointer-events-none absolute flex flex-col gap-1 ${place}`}>
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10.5px] font-semibold backdrop-blur-sm border-white/10 bg-[#0b1224]/85 text-white light:border-slate-900/10 light:bg-white/90 light:text-slate-800"
          >
            <span style={{ color }}>
              <Icon name={asset.icon} className="h-3 w-3" />
            </span>
            {asset.name}
            <span className="font-normal text-white/50 light:text-slate-400">· {asset.place}</span>
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.3 }}
              className="whitespace-nowrap font-mono text-[9.5px] font-semibold"
              style={{ color }}
            >
              {tag}
            </motion.span>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function Routes({ step, reduceMotion, isLight }) {
  const flow = isLight ? "#0891b2" : "#22d3ee";
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`} preserveAspectRatio="none" aria-hidden>
      {ASSETS.map((asset, i) => {
        const d = routePath(asset);
        const down = assetState(asset, step) === "down";
        const color = down ? TONES.critical : step === STEP.CONNECT ? "#38bdf8" : isLight ? "#0891b2" : "#22d3ee";
        return (
          <g key={asset.id}>
            <motion.path
              d={d}
              fill="none"
              stroke={color}
              strokeWidth="1.3"
              strokeOpacity={down ? 0.85 : 0.5}
              strokeDasharray={down ? "3 3" : undefined}
              vectorEffect="non-scaling-stroke"
              // Fade rather than draw in: pathLength dashes break with non-scaling strokes
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.12 }}
            />
            {!reduceMotion && step !== STEP.CONNECT && (
              <>
                <circle r="0.7" fill={flow}>
                  <animateMotion dur="2.6s" begin={`${-i * 0.5}s`} repeatCount="indefinite" path={d} />
                </circle>
                <circle r="0.75" fill={down ? TONES.critical : TONES.ok}>
                  <animateMotion
                    dur="2.6s"
                    begin={`${1.3 - i * 0.5}s`}
                    repeatCount="indefinite"
                    path={d}
                    keyPoints="1;0"
                    keyTimes="0;1"
                    calcMode="linear"
                  />
                </circle>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function EngineNode({ step, compact }) {
  const tint = STEPS[step].tint;
  const status = ["Adding 5 monitors", "Checking 5 monitors", "1 check failing", "Incident open · alerts sent", "All 5 healthy"][step];
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(ENGINE.x / MAP_COLS) * 100}%`, top: `${(ENGINE.y / MAP_ROWS) * 100}%` }}
    >
      <span className="animate-orbit-sonar absolute inset-0 rounded-full border" style={{ borderColor: tint }} aria-hidden />
      <div
        className={`relative flex items-center gap-2 rounded-full border bg-[#0b1224] shadow-lg light:bg-white ${compact ? "p-1" : "py-1 pl-1 pr-3"}`}
        style={{ borderColor: `${tint}99`, boxShadow: `0 0 22px -4px ${tint}` }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/5 light:bg-slate-100">
          <BrandMark size={18} />
        </span>
        {!compact && (
          <span className="leading-tight">
            <span className="block text-[11px] font-bold text-white light:text-slate-900">ITOps engine</span>
            <span className="block whitespace-nowrap font-mono text-[9px] font-semibold" style={{ color: tint }}>
              {status}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

// The dotted world with the customer's assets, check routes and the ITOps engine
// `sparse`: too small to label every asset, so only the one in focus is labelled
function MapPanel({ step, compact, sparse = compact, isLight, reduceMotion, style }) {
  return (
    <div className="relative" style={style}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`} preserveAspectRatio="none" aria-hidden>
        <path d={LAND_PATH} fill={isLight ? "rgba(71, 85, 105, 0.28)" : "rgba(148, 163, 184, 0.3)"} />
      </svg>
      <Routes step={step} reduceMotion={reduceMotion} isLight={isLight} />
      {ASSETS.map((asset, i) => (
        <AssetPin key={asset.id} asset={asset} index={i} step={step} compact={compact} sparse={sparse} isLight={isLight} />
      ))}
      <EngineNode step={step} compact={compact} />
    </div>
  );
}

// What each colour on the map means
function MapLegend({ isLight, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[9.5px] text-white/55 light:text-slate-500 ${className}`}>
      {[
        [isLight ? "#0891b2" : "#22d3ee", "Question sent"],
        [TONES.ok, "Healthy answer"],
        [TONES.critical, "Problem"],
        ["#38bdf8", "Just added"]
      ].map(([color, label]) => (
        <span key={label} className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

// Keeps the map at its 8:3 shape inside whatever box it is given
function FittedMap({ step, isLight, reduceMotion }) {
  const boxRef = useRef(null);
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const measure = () => {
      const { width, height } = box.getBoundingClientRect();
      const w = Math.min(width, ((height - 22) * MAP_COLS) / MAP_ROWS);
      setSize({ width: w, height: (w * MAP_ROWS) / MAP_COLS });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={boxRef} className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
      {size && (
        <>
          <MapPanel step={step} sparse={size.width < 640} isLight={isLight} reduceMotion={reduceMotion} style={size} />
          <MapLegend isLight={isLight} />
        </>
      )}
    </div>
  );
}

/* ── Step cards: the close-up for each step ─────────────────────── */

function Card({ title, badge, tone, children }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.035] p-3 light:border-slate-900/10 light:bg-white">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-white/50 light:text-slate-500">{title}</p>
        {badge && (
          <span className="shrink-0 rounded-full px-1.5 py-px font-mono text-[9px] font-bold" style={{ color: tone, background: `${tone}1f` }}>
            {badge}
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Row({ children, className = "" }) {
  return <div className={`flex items-center gap-2 text-[11.5px] text-white/80 light:text-slate-700 ${className}`}>{children}</div>;
}

// One line of a check, with an optional plain-language note for non-technical readers
function CodeLine({ ok, note, children }) {
  return (
    <p className={`flex items-center gap-1.5 ${ok === false ? "text-red-400" : ""}`}>
      {ok !== undefined && <Tick ok={ok} />}
      <span className="truncate">{children}</span>
      {note && <span className="ml-auto shrink-0 pl-2 font-sans text-[10px] italic text-white/45">{note}</span>}
    </p>
  );
}

function Code({ children }) {
  return (
    <div className="space-y-1 rounded-lg bg-black/40 p-2 font-mono text-[10.5px] leading-snug text-white/80 light:bg-slate-900 light:text-slate-100">
      {children}
    </div>
  );
}

// Response time, sampled; `fail` marks the stretch where checks errored
function Spark({ data, fail = [], color, height = 44 }) {
  const w = 200;
  // Scale to the real readings only; failed checks have none
  const readings = data.filter((_, i) => !fail.includes(i));
  const max = Math.max(...readings);
  const min = Math.min(...readings) - 40;
  const x = (i) => (i / (data.length - 1)) * w;
  const y = (v) => 4 + (1 - (v - min) / (max - min || 1)) * (height - 8);
  let d = "";
  data.forEach((v, i) => {
    const broken = fail.includes(i);
    const start = i === 0 || fail.includes(i - 1);
    if (!broken) d += `${start ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" aria-hidden>
      {fail.map((i) => (
        <rect key={i} x={x(i) - 4} y="2" width="8" height={height - 4} rx="2" fill={TONES.critical} opacity="0.22" />
      ))}
      <motion.path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: EASE }} />
      {fail.map((i) => (
        <circle key={`x${i}`} cx={x(i)} cy={height / 2} r="2.4" fill={TONES.critical} />
      ))}
    </svg>
  );
}

const HEALTHY_SERIES = [150, 146, 158, 141, 139, 152, 147, 143, 161, 149, 142, 138, 145, 151, 140, 142];
const API_SERIES = [184, 190, 179, 188, 186, 0, 0, 0, 0, 197, 189, 183, 191, 186, 192, 191];
const API_FAIL = [5, 6, 7, 8];

function stepCards(step, isLight) {
  const ok = isLight ? "#047857" : "#34d399";
  switch (step) {
    case STEP.CONNECT:
      return [
        <Card key="a" title="Add a website or API">
          <div className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5 font-mono text-[11px] text-white/85 light:border-slate-900/15 light:bg-slate-50 light:text-slate-800">
            https://shop.example.com<span className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-current" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {["Uptime", "Keyword", "SSL", "Security"].map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 light:text-sky-700">
                <Icon name="check" className="h-2.5 w-2.5" />
                {c}
              </span>
            ))}
          </div>
        </Card>,
        <Card key="b" title="Add a Linux server">
          <Code>
            <p>
              <span className="text-emerald-400">$</span> curl -fsSL …/kada-nigrani-agent.sh
            </p>
            <p className="text-white/45 light:text-slate-400"># one line · bash and curl only</p>
          </Code>
          <p className="mt-1.5 text-[10.5px] text-white/55 light:text-slate-500">Reports CPU, memory and disk every minute.</p>
        </Card>,
        <Card key="c" title="Your monitors" badge="5 added" tone="#38bdf8">
          <div className="space-y-1">
            {ASSETS.map((a) => (
              <Row key={a.id} className="text-[11px]">
                <Tick />
                <span className="truncate">{a.host}</span>
                <span className="ml-auto shrink-0 text-[10px] text-white/45 light:text-slate-400">{a.place}</span>
              </Row>
            ))}
          </div>
        </Card>
      ];
    case STEP.MONITOR:
      return [
        <Card key="a" title="Response time · shop.example.com" badge="142 ms" tone={ok}>
          <Spark data={HEALTHY_SERIES} color={ok} />
          <p className="mt-1 text-[10.5px] text-white/55 light:text-slate-500">One reading per check, around the clock</p>
        </Card>,
        <Card key="b" title="What one check looks at">
          <Code>
            <p className="text-white/50 light:text-slate-400">GET https://shop.example.com</p>
            <CodeLine ok note="it answered normally">
              HTTP/1.1 200 OK
            </CodeLine>
            <CodeLine ok note="the page looks right">
              keyword “Add to cart”
            </CodeLine>
            <CodeLine ok note="padlock is valid">
              SSL · 84 days left
            </CodeLine>
          </Code>
        </Card>,
        <Card key="c" title="What runs, how often">
          <div className="space-y-1">
            {CHECK_SCHEDULE.map(([what, when]) => (
              <Row key={what} className="justify-between text-[11px]">
                <span className="truncate">{what}</span>
                <span className="shrink-0 font-mono text-[10px]" style={{ color: isLight ? "#0e7490" : "#22d3ee" }}>
                  {when}
                </span>
              </Row>
            ))}
          </div>
        </Card>
      ];
    case STEP.DETECT:
      return [
        <Card key="a" title="What failed" badge="Down" tone={TONES.critical}>
          <Code>
            <p className="text-white/50 light:text-slate-400">GET https://api.example.com/v2</p>
            <CodeLine ok={false} note="the app behind it failed">
              HTTP/1.1 502 Bad Gateway
            </CodeLine>
            <CodeLine note="should mean “all good”">expected 200 OK</CodeLine>
          </Code>
        </Card>,
        <Card key="b" title="Confirmed, not a blip">
          <div className="flex items-center gap-1.5">
            {["09:40:07", "09:40:37", "09:41:07"].map((t, i) => (
              <motion.div
                key={t}
                className="flex-1 rounded-lg border border-red-400/30 bg-red-500/10 px-1 py-1.5 text-center"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.25 }}
              >
                <div className="flex justify-center">
                  <Tick ok={false} />
                </div>
                <p className="mt-1 font-mono text-[9.5px] text-white/60 light:text-slate-500">{t}</p>
              </motion.div>
            ))}
          </div>
          <p className="mt-1.5 text-[10.5px] text-white/60 light:text-slate-500">3 failed checks in a row → incident opens. A single blip is ignored.</p>
        </Card>,
        <Card key="c" title="Response time · api.example.com" badge="No answer" tone={TONES.critical}>
          <Spark data={API_SERIES.slice(0, 9)} fail={[5, 6, 7, 8]} color={ok} />
          <p className="mt-1 text-[10.5px] text-white/55 light:text-slate-500">Normal, then errors from 09:40</p>
        </Card>
      ];
    case STEP.ALERT:
      return [
        <Card key="a" title="Incident #2484" badge="Critical" tone={TONES.critical}>
          <p className="text-[13px] font-semibold text-white light:text-slate-900">api.example.com is down</p>
          <p className="mt-0.5 text-[11px] text-white/60 light:text-slate-500">502 Bad Gateway · 3 failed checks</p>
          <p className="mt-2 font-mono text-[10px] text-white/45 light:text-slate-400">Opened 09:41:07 · cause attached</p>
        </Card>,
        <Card key="b" title="Who was told">
          <div className="space-y-1.5">
            {[
              ["hash", "Slack", "#on-call"],
              ["mail", "Email", "ops@example.com"],
              ["hook", "Webhook", "your own tools"]
            ].map(([icon, name, where], i) => (
              <motion.div key={name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.18 }}>
                <Row className="text-[11px]">
                  <span className="text-rose-300 light:text-rose-600">
                    <Icon name={icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold">{name}</span>
                  <span className="truncate text-white/45 light:text-slate-400">{where}</span>
                  <span className="ml-auto shrink-0 font-mono text-[9.5px] font-bold" style={{ color: ok }}>
                    Delivered
                  </span>
                </Row>
              </motion.div>
            ))}
          </div>
        </Card>,
        <Card key="c" title="What the alert says">
          <div className="flex gap-2 rounded-lg bg-black/30 p-2 light:bg-slate-50">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/10 light:bg-white">
              <BrandMark size={14} />
            </span>
            <div className="min-w-0 text-[11px] leading-snug">
              <p className="font-semibold text-white light:text-slate-900">ITOps Alerts</p>
              <p className="text-white/75 light:text-slate-600">
                <span className="font-semibold text-red-400 light:text-red-600">Down:</span> api.example.com returned 502 (expected 200). Failing since
                09:40:07.
              </p>
            </div>
          </div>
        </Card>
      ];
    default:
      return [
        <Card key="a" title="What happened">
          <div className="space-y-1">
            {[
              ["09:40", "First failed check", TONES.critical],
              ["09:41", "Incident opened · team alerted", "#fb7185"],
              ["09:44", "Acknowledged by on-call", TONES.warning],
              ["09:49", "Checks passing · auto-resolved", TONES.ok]
            ].map(([time, what, color]) => (
              <Row key={time} className="text-[11px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
                <span className="w-9 shrink-0 font-mono text-[10px] text-white/45 light:text-slate-400">{time}</span>
                <span className="truncate">{what}</span>
              </Row>
            ))}
          </div>
        </Card>,
        <Card key="b" title="Response time · api.example.com" badge="Recovered" tone={ok}>
          <Spark data={API_SERIES} fail={API_FAIL} color={ok} />
          <p className="mt-1 text-[10.5px] text-white/55 light:text-slate-500">Back to 191 ms, recovery alert sent</p>
        </Card>,
        <Card key="c" title="Still watching">
          <p className="text-2xl font-semibold tracking-tight text-white light:text-slate-900">
            5<span className="text-base text-white/40 light:text-slate-400"> / 5 healthy</span>
          </p>
          <p className="mt-1 text-[11px] text-white/60 light:text-slate-500">Checks keep running on the same schedule, day and night.</p>
        </Card>
      ];
  }
}

/* ── The scene: a monitoring window that changes with each step ─── */

function WindowBar({ step, compact }) {
  const s = STEPS[step];
  const status = ["Connecting", "All healthy", "1 problem", "1 incident open", "All healthy"][step];
  const statusColor = [s.tint, TONES.ok, TONES.critical, TONES.critical, TONES.ok][step];
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-3 py-2 light:border-slate-900/10">
      <span className="flex gap-1" aria-hidden>
        <span className="h-2 w-2 rounded-full bg-red-400/70" />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
      </span>
      <p className="truncate text-[11px] font-semibold text-white/80 light:text-slate-700">{compact ? "Live map" : "ITOps · Your infrastructure, live"}</p>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {!compact && (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={CLOCK[step]}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="font-mono text-[10px] tabular-nums text-white/55 light:text-slate-500"
              title="Simulated time"
            >
              {CLOCK[step]}
            </motion.span>
          </AnimatePresence>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold" style={{ color: statusColor, borderColor: `${statusColor}55`, background: `${statusColor}14` }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor }} />
          {status}
        </span>
        {!compact && (
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/60 light:border-slate-900/10 light:text-slate-500">5 monitors</span>
        )}
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/45 light:border-slate-900/10 light:text-slate-400">
          Simulated
        </span>
      </div>
    </div>
  );
}

function Caption({ step, compact }) {
  const s = STEPS[step];
  return (
    <div className="shrink-0 border-t border-white/10 px-4 py-3 light:border-slate-900/10">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className="flex gap-3"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {!compact && (
            <span
              aria-hidden
              className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{
                color: "var(--orbit-tint)",
                background: "color-mix(in srgb, var(--orbit-tint) 14%, transparent)",
                boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--orbit-tint) 35%, transparent)"
              }}
            >
              <Icon name={s.icon} className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <p className={`font-semibold text-white light:text-slate-900 ${compact ? "text-[14px]" : "text-[15px]"}`}>
              <span className="mr-2 font-mono text-[11px]" style={{ color: "var(--orbit-tint)" }}>
                {s.num}
              </span>
              {s.title}
            </p>
            <p className={`mt-0.5 leading-relaxed text-white/70 light:text-slate-600 ${compact ? "text-[12.5px]" : "text-[13px]"}`}>{s.body}</p>
            {/* For readers who want the detail */}
            <p
              className={`mt-1 font-mono text-[10.5px] leading-snug text-white/45 light:text-slate-500 ${
                compact ? "[@media(max-height:719px)]:hidden" : ""
              }`}
            >
              <span className="font-semibold" style={{ color: "var(--orbit-tint)" }}>
                Under the hood ·{" "}
              </span>
              {s.tech}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// layout: "stacked" (map over three cards), "side" (map beside two cards), "mobile" (map, one card)
function MonitoringScene({ step, layout, isLight, reduceMotion, withCaption = true, sideCards = 2 }) {
  const cards = stepCards(step, isLight);
  const count = layout === "stacked" ? 3 : layout === "side" ? sideCards : 1;
  const compact = layout === "mobile";

  const cardBlock = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: EASE }}
        className={layout === "stacked" ? "grid shrink-0 grid-cols-3 gap-3" : layout === "side" ? "flex min-h-0 flex-col gap-3" : "shrink-0"}
      >
        {cards.slice(0, count)}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070c19]/85 backdrop-blur-md light:border-slate-900/10 light:bg-white/80"
      style={{ boxShadow: `0 30px 80px -40px var(--orbit-tint), inset 0 1px 0 ${isLight ? "#ffffff" : "rgba(255,255,255,0.06)"}` }}
    >
      <WindowBar step={step} compact={compact} />
      {compact ? (
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5 p-2.5">
          <MapPanel step={step} compact isLight={isLight} reduceMotion={reduceMotion} style={{ width: "100%", aspectRatio: `${MAP_COLS} / ${MAP_ROWS}` }} />
          <MapLegend isLight={isLight} className="[@media(max-height:719px)]:hidden" />
          {cardBlock}
        </div>
      ) : (
        <div className={`min-h-0 flex-1 gap-3 p-3 ${layout === "side" ? "grid grid-cols-[minmax(0,1fr)_280px]" : "flex flex-col"}`}>
          <FittedMap step={step} isLight={isLight} reduceMotion={reduceMotion} />
          {cardBlock}
        </div>
      )}
      {withCaption && <Caption step={step} compact={compact} />}
    </div>
  );
}

/* ── Heading, stepper, progress ─────────────────────────────────── */

function SectionHeading({ pinned, isLight }) {
  return (
    <div className="relative z-20 shrink-0 text-center">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.28em] text-white/50 light:text-slate-500">How it works</p>
      <h2
        className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-[2.6rem] md:leading-[1.1] light:text-slate-900"
        style={pinned ? { fontSize: "clamp(1.4rem, min(4.4vh, 6.4vw), 2.6rem)", lineHeight: 1.12 } : undefined}
      >
        Connect. Monitor.{" "}
        <span
          className="orbit-gradient-text inline-block pb-[0.08em]"
          style={{
            backgroundImage: isLight
              ? "linear-gradient(100deg, #0891b2 0%, #2563eb 25%, #7c3aed 50%, #2563eb 75%, #0891b2 100%)"
              : "linear-gradient(100deg, #00f0ff 0%, #3b82f6 25%, #a78bfa 50%, #3b82f6 75%, #00f0ff 100%)"
          }}
        >
          Know.
        </span>
      </h2>
      <p
        className={`mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/55 light:text-slate-600 ${
          pinned ? "[@media(max-height:899px)]:hidden" : ""
        }`}
      >
        Connect your infrastructure once. ITOps continuously checks its health, security, and availability — and alerts you before
        your customers notice.
      </p>
    </div>
  );
}

function Stepper({ step, onSelect, isLight }) {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl items-center" role="tablist" aria-label="How it works steps">
      {STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        const tone = isLight ? s.ink : s.tint;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(i)}
              className="group flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 light:focus-visible:ring-slate-900/40"
              style={{ background: active ? `${s.tint}1f` : "transparent" }}
            >
              <span
                className="grid h-6 w-6 place-items-center rounded-full border font-mono text-[10px] font-bold transition-all duration-300"
                style={{
                  color: active ? (isLight ? "#ffffff" : "#050811") : done ? tone : undefined,
                  background: active ? tone : "transparent",
                  borderColor: active || done ? tone : isLight ? "rgba(15,23,42,0.2)" : "rgba(255,255,255,0.2)",
                  boxShadow: active ? `0 0 14px ${s.tint}` : "none"
                }}
              >
                {done ? <Icon name="check" className="h-3 w-3" /> : s.num}
              </span>
              <span
                className={`text-[12.5px] font-semibold transition-colors ${active ? "text-white light:text-slate-900" : "text-white/50 light:text-slate-500"}`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px flex-1 bg-white/12 light:bg-slate-900/12">
                <span
                  className="block h-full transition-[width] duration-500"
                  style={{ width: done ? "100%" : "0%", background: `linear-gradient(90deg, ${isLight ? s.ink : s.tint}, ${isLight ? STEPS[i + 1].ink : STEPS[i + 1].tint})` }}
                />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const DIGIT_VARIANTS = {
  enter: (d) => ({ y: d >= 0 ? 12 : -12, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (d) => ({ y: d >= 0 ? -12 : 12, opacity: 0 })
};

function MobilePager({ step, direction, onSelect, isLight }) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex items-center whitespace-nowrap font-mono text-xs font-bold text-white/90 light:text-slate-800">
        <span className="relative inline-flex h-4 w-[2ch] overflow-hidden" style={{ color: "var(--orbit-tint)" }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.span
              key={step}
              custom={direction}
              variants={DIGIT_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE }}
              className="absolute inset-0 flex items-center"
            >
              {STEPS[step].num}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="ml-1 text-white/30 light:text-slate-400">/ 05</span>
      </div>
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Step ${s.num}: ${s.label}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === step ? 22 : 7,
              background: i <= step ? (isLight ? s.ink : s.tint) : isLight ? "rgba(15,23,42,0.18)" : "rgba(255,255,255,0.2)"
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[9.5px] uppercase tracking-widest text-white/40 light:text-slate-500">{STEPS[step].label}</span>
    </div>
  );
}

/* ── Pinned story ───────────────────────────────────────────────── */

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

// Room for the fixed marketing nav above the heading (it wraps taller on phones and narrow laptops)
function navClearance(width, height) {
  if (width < 1140) return 96;
  return height < 760 ? 84 : 112;
}

// Choose how the scene is arranged from the space it gets
function sceneLayout(width, height) {
  if (width < 640) return "mobile";
  const mapHeight = height - 44 - 100 - 150 - 36;
  return Math.min(width - 24, (mapHeight * MAP_COLS) / MAP_ROWS) >= (width - 24) * 0.55 ? "stacked" : "side";
}

function PinnedStory({ isLight, reduceMotion }) {
  const count = STEPS.length;
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const [{ step, direction }, setNav] = useState({ step: 0, direction: 0 });
  const [frame, setFrame] = useState(null);

  const isInView = useInView(trackRef, { margin: "200px" });
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const [input, output] = useMemo(() => steppedRange(count), [count]);
  const stepped = useTransform(scrollYProgress, input, output);
  const barClip = useTransform(scrollYProgress, (v) => `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`);

  useMotionValueEvent(stepped, "change", (v) => {
    const next = Math.round(v);
    setNav((prev) => (prev.step === next ? prev : { step: next, direction: next > prev.step ? 1 : -1 }));
  });

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const scene = sceneRef.current;
    if (!stage || !scene) return undefined;
    const measure = () => {
      const s = stage.getBoundingClientRect();
      const b = scene.getBoundingClientRect();
      // Beside the map there is room for two close-up cards only on taller screens
      setFrame({ width: s.width, height: s.height, layout: sceneLayout(b.width, b.height), sideCards: b.height - 130 >= 290 ? 2 : 1 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);

  // Land on the right step when the page opens part-way through the track
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -track.getBoundingClientRect().top / distance));
    setNav({ step: Math.round(progress * (count - 1)), direction: 0 });
  }, [count]);

  const goTo = useCallback(
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
        goTo(step + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goTo(step - 1);
      }
    },
    [step, goTo]
  );

  const tint = isLight ? STEPS[step].ink : STEPS[step].tint;
  const mobile = frame?.layout === "mobile";
  const suite = `linear-gradient(90deg, ${STEPS.map((s) => (isLight ? s.ink : s.tint)).join(", ")})`;

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="how-it-works"
        ref={trackRef}
        aria-label="How it works"
        className="relative w-full bg-[#050811] light:bg-slate-50"
        style={{ height: `${count * SCROLL_VH_PER_STEP + 100}vh` }}
      >
        <div
          className="sticky top-0 isolate h-svh w-full overflow-hidden bg-[#050811] text-white light:bg-slate-50 light:text-slate-900"
          style={{ "--orbit-tint": tint, transition: "--orbit-tint 0.7s ease" }}
        >
          <Backdrop isLight={isLight} />
          <div
            ref={stageRef}
            onKeyDown={onKeyDown}
            tabIndex={-1}
            className="relative flex h-full w-full flex-col items-center px-4 pb-4 pt-24 focus:outline-none sm:px-8"
            style={frame ? { paddingTop: navClearance(frame.width, frame.height) } : undefined}
          >
            <SectionHeading pinned isLight={isLight} />
            {!mobile && (
              <div className="mt-3 w-full shrink-0">
                <Stepper step={step} onSelect={goTo} isLight={isLight} />
              </div>
            )}
            <div ref={sceneRef} className="relative mt-3 min-h-0 w-full max-w-6xl flex-1">
              {frame && <MonitoringScene step={step} layout={frame.layout} sideCards={frame.sideCards} isLight={isLight} reduceMotion={reduceMotion || !isInView} />}
            </div>
            <div className="mt-3 w-full max-w-6xl shrink-0">
              {mobile ? (
                <MobilePager step={step} direction={direction} onSelect={goTo} isLight={isLight} />
              ) : (
                <div className="flex items-center justify-center gap-2 font-mono text-[9.5px] uppercase tracking-widest text-white/40 light:text-slate-500">
                  <span>Scroll to follow the story</span>
                  <span aria-hidden className="flex h-5 w-3.5 justify-center rounded-full border border-white/30 light:border-slate-400">
                    <span className="animate-orbit-wheel mt-1 h-1.5 w-0.5 rounded-full" style={{ background: "var(--orbit-tint)" }} />
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Progress through the story, graded through each step's colour */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/5 light:bg-slate-900/5">
            <motion.div className="h-full" style={{ background: suite, clipPath: barClip }} />
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Backdrop({ isLight }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="enterprise-grid absolute inset-0 opacity-40" />
      <div className="absolute -left-40 top-10 h-[480px] w-[480px] rounded-full bg-[#3b82f6]/[0.08] blur-[120px] light:bg-[#60a5fa]/[0.14]" />
      <div className="absolute -right-32 bottom-10 h-[520px] w-[520px] rounded-full bg-[#8b5cf6]/[0.08] blur-[130px] light:bg-[#a78bfa]/[0.14]" />
      <div
        className="absolute left-1/2 top-1/2 h-[560px] w-[900px] max-w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px]"
        style={{ background: `radial-gradient(closest-side, color-mix(in srgb, var(--orbit-tint) ${isLight ? 12 : 16}%, transparent), transparent)` }}
      />
    </div>
  );
}

/* ── Short screens: the same story, one step after another ─────── */

const SHORT_QUERY = `(max-height: ${MIN_PINNED_HEIGHT - 1}px)`;
function subscribeViewport(onChange) {
  const query = window.matchMedia(SHORT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const isTooShortToPin = () => window.matchMedia(SHORT_QUERY).matches;

function StackedStory({ isLight, reduceMotion }) {
  return (
    <section id="how-it-works" aria-label="How it works" className="relative isolate overflow-hidden bg-[#050811] px-4 py-16 text-white sm:px-8 light:bg-slate-50 light:text-slate-900">
      <Backdrop isLight={isLight} />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading isLight={isLight} />
        <div className="mt-10 space-y-8">
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ "--orbit-tint": isLight ? s.ink : s.tint }}>
              <MonitoringScene step={i} layout="mobile" isLight={isLight} reduceMotion={reduceMotion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksFlow() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const reduceMotion = useReducedMotion();
  const tooShort = useSyncExternalStore(subscribeViewport, isTooShortToPin, () => false);
  return tooShort ? <StackedStory isLight={isLight} reduceMotion={reduceMotion} /> : <PinnedStory isLight={isLight} reduceMotion={reduceMotion} />;
}
