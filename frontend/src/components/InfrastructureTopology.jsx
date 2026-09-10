import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform
} from "motion/react";
import { useTheme } from "../context/ThemeContext";

const EASE = [0.16, 1, 0.3, 1];
const SCROLL_VH_PER_ITEM = 55;

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
    desc: "Simulated spear-phishing drills, interactive employee security training, risk posture scoring, and compliance readiness.",
    stats: ["Simulated phishing", "Risk score", "Compliance logs"],
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

/* Circular chip riding the orbit smoothly around the center */
function OrbitChip({ node, index, geometry, rotation, isActive, onSelect, isLight }) {
  const theta = index * SLICE;

  // Reactively compute 2D positions along the ellipse driven directly by spring rotation
  const x = useTransform(rotation, (r) => {
    const rad = (((theta + r) % 360) * Math.PI) / 180;
    return Math.sin(rad) * geometry.radiusX;
  });

  const y = useTransform(rotation, (r) => {
    const rad = (((theta + r) % 360) * Math.PI) / 180;
    return -Math.cos(rad) * geometry.radiusY;
  });

  const scale = useTransform(rotation, (r) => {
    const rad = (((theta + r) % 360) * Math.PI) / 180;
    const front = (1 + Math.cos(rad)) / 2;
    return 0.82 + 0.30 * front;
  });

  const opacity = useTransform(rotation, (r) => {
    const rad = (((theta + r) % 360) * Math.PI) / 180;
    const front = (1 + Math.cos(rad)) / 2;
    return 0.45 + 0.55 * front;
  });

  const zIndex = useTransform(rotation, (r) => {
    const rad = (((theta + r) % 360) * Math.PI) / 180;
    return Math.round(30 + 20 * Math.cos(rad));
  });

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-auto"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        width: geometry.chip,
        height: geometry.chip,
        marginLeft: -geometry.chip / 2,
        marginTop: -geometry.chip / 2
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(index)}
        aria-label={`Show ${node.title}`}
        aria-current={isActive ? "true" : undefined}
        className="group relative flex h-full w-full items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer"
        style={{
          color: isActive
            ? (isLight ? "#0f172a" : "#ffffff")
            : (isLight ? "#475569" : "rgba(255,255,255,0.7)"),
          borderColor: isActive
            ? node.tint
            : (isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.15)"),
          background: isActive
            ? (isLight
                ? `radial-gradient(circle at 35% 35%, #ffffff, ${node.tint}18)`
                : `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.2), ${node.tint}35), #0d1322`)
            : (isLight
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(15, 23, 42, 0.75)"),
          boxShadow: isActive
            ? `0 0 20px -2px ${node.tint}${isLight ? "40" : "60"}, 0 0 0 2px ${node.tint}`
            : (isLight
                ? "0 3px 10px -2px rgba(0,0,0,0.06)"
                : "0 6px 16px -4px rgba(0,0,0,0.5)")
        }}
      >
        <Icon
          name={node.icon}
          className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 sm:h-5 sm:w-5"
        />

        {/* Live indicator dot on chip */}
        {node.badge === "Live" && (
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
        )}
      </button>

      {/* Minimal clean label underneath */}
      <span
        className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9.5px] font-semibold tracking-wider transition-opacity duration-300"
        style={{
          opacity: isActive ? 1 : 0,
          color: isActive ? node.tint : (isLight ? "#64748b" : "#94a3b8")
        }}
      >
        {node.short}
      </span>
    </motion.div>
  );
}

export function InfrastructureTopology() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const [geometry, setGeometry] = useState({ radiusX: 380, radiusY: 155, chip: 48, compact: false });

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
    setActive((current) => (current === index ? current : index));
  }, []);

  useMotionValueEvent(rotationTarget, "change", syncActive);

  // Measure stage dynamically with spacious horizontal ellipse to prevent congestion
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      const compact = width < 768;

      // Generous horizontal spread, moderate vertical height to keep airy clearances
      const radiusX = compact
        ? Math.min(width * 0.38, 140)
        : Math.max(320, Math.min(width * 0.36, 450));

      const radiusY = compact
        ? 80
        : Math.max(135, Math.min(height * 0.23, 170));

      const chip = compact ? 40 : 48;
      setGeometry({ radiusX, radiusY, chip, compact });
    };
    measure();
    const observer = new ResizeObserver(measure);
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
    setActive(index);
    setReady(true);
  }, []);

  return (
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
            tabIndex={-1}
            className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pb-3 pt-18 sm:px-8 sm:pb-5 sm:pt-20 md:pt-22 focus:outline-none"
          >
            {/* Subtle center ambient illumination tailored to the active module */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] transition-colors duration-700 sm:h-[500px] sm:w-[500px]"
              style={{
                background: isLight
                  ? `radial-gradient(circle, ${activeNode.tint}14 0%, transparent 65%)`
                  : `radial-gradient(circle, ${activeNode.tint}22 0%, transparent 70%)`
              }}
            />

            {/* Header: Compact, clean, safe clearance below floating navbar */}
            <div className="relative z-30 shrink-0 text-center">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 backdrop-blur-md transition-colors duration-300 ${
                  isLight
                    ? "border-emerald-200/80 bg-emerald-50/90 text-emerald-800 shadow-xs"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] sm:text-[10.5px]">
                  THE COMPLETE PLATFORM
                </span>
              </div>
              <h2
                className={`mt-1.5 text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl transition-colors duration-300 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                One Platform, Growing Module by Module
              </h2>
              <p
                className={`mx-auto mt-1 hidden sm:block max-w-lg text-xs leading-relaxed transition-colors duration-300 ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Scroll to rotate the suite — each solution steps into focus with real-time telemetry.
              </p>
            </div>

            {/* Interactive Stage: Spacious Orbit Ring + Orbiting Chips + Compact Center Details Card */}
            <div className="relative z-20 flex w-full flex-1 items-center justify-center">
              <div className="relative h-full w-full">
                {/* Dashed Elliptical Orbit Track line */}
                <svg
                  className="pointer-events-none absolute left-1/2 overflow-visible"
                  style={{
                    top: geometry.compact ? "34%" : "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                  width={geometry.radiusX * 2 + 50}
                  height={geometry.radiusY * 2 + 50}
                >
                  <ellipse
                    cx={(geometry.radiusX * 2 + 50) / 2}
                    cy={(geometry.radiusY * 2 + 50) / 2}
                    rx={geometry.radiusX}
                    ry={geometry.radiusY}
                    fill="none"
                    stroke={isLight ? "rgba(15, 23, 42, 0.10)" : "rgba(255, 255, 255, 0.10)"}
                    strokeWidth="1.2"
                    strokeDasharray="4 6"
                  />
                </svg>

                {/* Lit focal slot for active node at the top */}
                <div
                  className="pointer-events-none absolute left-1/2 h-16 w-28 -translate-x-1/2 rounded-full blur-xl transition-colors duration-500"
                  style={{
                    top: geometry.compact ? "34%" : "50%",
                    marginTop: -geometry.radiusY - 32,
                    background: `radial-gradient(closest-side, ${activeNode.tint}70, transparent)`
                  }}
                />

                {/* Orbiting circular nodes */}
                <div
                  className="absolute left-1/2"
                  style={{
                    top: geometry.compact ? "34%" : "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  {PLATFORM_NODES.map((node, index) => (
                    <OrbitChip
                      key={node.id}
                      node={node}
                      index={index}
                      geometry={geometry}
                      rotation={rotation}
                      isActive={index === active}
                      onSelect={goToIndex}
                      isLight={isLight}
                    />
                  ))}
                </div>

                {/* Center Stage Pop-up & Scale Detail Card: Compact & Airy */}
                <div
                  className={`pointer-events-none z-25 ${
                    geometry.compact
                      ? "absolute inset-x-4 top-[68%] w-auto max-w-sm mx-auto -translate-y-1/2"
                      : "absolute left-1/2 top-1/2 w-[min(330px,82vw)] -translate-x-1/2 -translate-y-1/2"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {ready && (
                      <motion.div
                        key={activeNode.id}
                        initial={{ opacity: 0, scale: 0.90, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.32, ease: EASE }}
                        className={`pop-card pointer-events-auto rounded-2xl border p-3.5 sm:p-4 text-center shadow-xl backdrop-blur-xl transition-colors duration-300 ${
                          isLight
                            ? "bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-300/50"
                            : "bg-slate-950/90 border-white/15 text-white shadow-black/70"
                        }`}
                        style={{
                          boxShadow: isLight
                            ? `0 16px 36px -10px ${activeNode.tint}25, 0 1px 3px rgba(0,0,0,0.04)`
                            : `0 20px 48px -12px ${activeNode.tint}35, 0 0 0 1px rgba(255,255,255,0.08)`
                        }}
                      >
                        {/* Top row: category + live badge */}
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <span
                            className="font-mono text-[9px] font-bold uppercase tracking-wider"
                            style={{ color: activeNode.tint }}
                          >
                            {activeNode.subtitle}
                          </span>
                          {activeNode.badge === "Live" && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9.5px] font-bold text-emerald-600 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>

                        {/* Title & Icon Header */}
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
                            style={{
                              color: activeNode.tint,
                              borderColor: `${activeNode.tint}40`,
                              background: isLight ? `${activeNode.tint}12` : `${activeNode.tint}20`
                            }}
                          >
                            <Icon name={activeNode.icon} className="h-3.5 w-3.5" />
                          </span>
                          <h3
                            className={`text-sm sm:text-base font-bold leading-tight transition-colors duration-300 ${
                              isLight ? "text-slate-900" : "text-white"
                            }`}
                          >
                            {activeNode.title}
                          </h3>
                        </div>

                        {/* Description */}
                        <p
                          className={`mt-1.5 line-clamp-2 text-[11px] leading-relaxed transition-colors duration-300 ${
                            isLight ? "text-slate-600" : "text-slate-300"
                          }`}
                        >
                          {activeNode.desc}
                        </p>

                        {/* Feature Stats Pills */}
                        <div className="mt-2.5 flex flex-wrap justify-center gap-1">
                          {activeNode.stats.map((stat) => (
                            <span
                              key={stat}
                              className={`rounded-full border px-2 py-0.5 text-[9.5px] font-medium backdrop-blur-sm transition-colors duration-300 ${
                                isLight
                                  ? "border-slate-200/90 bg-slate-100/90 text-slate-700"
                                  : "border-white/10 bg-white/[0.05] text-slate-300"
                              }`}
                            >
                              {stat}
                            </span>
                          ))}
                        </div>

                        {/* CTA Link */}
                        <Link
                          to={activeNode.href}
                          className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold transition-all duration-200 hover:scale-105 ${
                            isLight
                              ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                              : "bg-white text-slate-950 hover:bg-slate-100 shadow-md"
                          }`}
                        >
                          <span>Explore solution</span>
                          <span aria-hidden>→</span>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Bottom Controls: Step Counter, Navigation Dots, Scroll Hint */}
            <div className="relative z-30 flex w-full shrink-0 items-center justify-between gap-4 px-3 pb-1 sm:px-8">
              {/* Step counter */}
              <div
                className={`font-mono text-xs font-bold transition-colors duration-300 ${
                  isLight ? "text-slate-800" : "text-white/90"
                }`}
              >
                <span style={{ color: activeNode.tint }}>{String(active + 1).padStart(2, "0")}</span>
                <span className={isLight ? "text-slate-400" : "text-white/30"}>
                  {" "}
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
                            : isLight
                              ? "rgba(15, 23, 42, 0.18)"
                              : "rgba(255, 255, 255, 0.2)"
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
                className={`hidden items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest sm:flex transition-colors duration-300 ${
                  isLight ? "text-slate-500" : "text-white/40"
                }`}
              >
                <span>Scroll to rotate</span>
                <span className="inline-block animate-bounce">↓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
