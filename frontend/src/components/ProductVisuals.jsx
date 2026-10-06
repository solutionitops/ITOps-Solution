import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

/* ───────────────────────── Animated dashboard mockup ─────────────────────────
 * An illustrative preview of the product UI (sample data, like any SaaS product
 * screenshot). Self-animating SVG — no per-frame React renders. */

/* ───────────────────────── Cyber-Ops Command Center Dashboard Mockup ─────────────────────────
 * Interactive simulated telemetry preview with live incident triggers, dynamic
 * telemetry morphing, node inspection, and real-time activity feed. */

const PATHS = {
  nominal: {
    area: "M0,70 C40,55 70,80 110,60 150,40 190,66 230,48 270,30 310,58 350,38 390,24 430,50 470,34 L470,120 L0,120 Z",
    line: "M0,70 C40,55 70,80 110,60 150,40 190,66 230,48 270,30 310,58 350,38 390,24 430,50 470,34",
    color: "#00f0ff",
    gradient: ["rgba(0, 240, 255, 0.35)", "rgba(0, 240, 255, 0)"]
  },
  spike: {
    area: "M0,70 C40,65 90,75 140,55 180,48 210,85 240,12 280,18 320,65 370,40 420,50 470,45 L470,120 L0,120 Z",
    line: "M0,70 C40,65 90,75 140,55 180,48 210,85 240,12 280,18 320,65 370,40 420,50 470,45",
    color: "#ff4d4d",
    gradient: ["rgba(255, 77, 77, 0.45)", "rgba(255, 77, 77, 0)"]
  },
  healing: {
    area: "M0,60 C40,50 80,55 130,45 180,42 220,38 270,35 320,30 370,32 420,28 470,25 L470,120 L0,120 Z",
    line: "M0,60 C40,50 80,55 130,45 180,42 220,38 270,35 320,30 370,32 420,28 470,25",
    color: "#10b981",
    gradient: ["rgba(16, 185, 129, 0.4)", "rgba(16, 185, 129, 0)"]
  }
};

function useCountUp(to, active, duration = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf = 0;
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(eased * to);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);
  return n;
}

function MiniStat({
  label,
  to,
  decimals = 0,
  suffix = "",
  tone,
  active,
  sublabel = null
}) {
  const n = useCountUp(to, active);
  return (
    <div className="group/stat relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] light:bg-slate-900/[0.03] p-2.5 sm:px-3 sm:py-2.5 transition-all hover:border-white/25 hover:bg-white/[0.06]">
      <p className="font-mono text-[9.5px] uppercase tracking-wider text-white/45 light:text-slate-400">{label}</p>
      <p className={`mt-0.5 text-base sm:text-lg font-semibold tabular-nums ${tone}`}>
        {n.toFixed(decimals)}
        {suffix}
      </p>
      {sublabel && <p className="mt-0.5 text-[9px] text-white/35 light:text-slate-400 truncate">{sublabel}</p>}
    </div>
  );
}

export function DashboardMockup() {
  const [simMode, setSimMode] = useState("nominal"); // "nominal" | "spike" | "healing"
  const [selectedService, setSelectedService] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [pingSuccess, setPingSuccess] = useState(null);
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("en-US", { hour12: false }));

  const rootRef = useRef(null);
  const inView = useInView(rootRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const services = [
    {
      id: "api",
      name: "api.production",
      status: simMode === "spike" ? "degraded" : "up",
      ms: simMode === "spike" ? "410ms" : simMode === "healing" ? "78ms" : "126ms",
      load: simMode === "spike" ? 89 : simMode === "healing" ? 22 : 42,
      protocol: "HTTP/3 · TLS 1.3",
      region: "iad-edge-01 (US East)",
      p99: simMode === "spike" ? "498ms" : "142ms",
      rate: "99.99%"
    },
    {
      id: "checkout",
      name: "checkout-service",
      status: "up",
      ms: simMode === "spike" ? "142ms" : simMode === "healing" ? "64ms" : "89ms",
      load: simMode === "spike" ? 68 : simMode === "healing" ? 18 : 28,
      protocol: "gRPC · HTTP/2",
      region: "fra-core-02 (EU Central)",
      p99: "98ms",
      rate: "100.0%"
    },
    {
      id: "host",
      name: "web-01 · host",
      status: "up",
      ms: simMode === "spike" ? "cpu 78%" : "cpu 31%",
      load: simMode === "spike" ? 78 : 31,
      protocol: "Kada Nigrani Agent v1.0",
      region: "Ubuntu 24.04 LTS",
      p99: "load 1.12",
      rate: "41d uptime"
    },
    {
      id: "gateway",
      name: "eu-west gateway",
      status: simMode === "spike" ? "degraded" : "up",
      ms: simMode === "spike" ? "580ms" : simMode === "healing" ? "92ms" : "138ms",
      load: simMode === "spike" ? 94 : simMode === "healing" ? 34 : 45,
      protocol: "Envoy Proxy · TLS 1.3",
      region: "lhr-edge-04 (UK London)",
      p99: simMode === "spike" ? "612ms" : "154ms",
      rate: "99.95%"
    }
  ];

  const handleTestPing = (serviceId) => {
    setPingSuccess(serviceId);
    setTimeout(() => setPingSuccess(null), 1800);
  };

  const currentPath = PATHS[simMode] || PATHS.nominal;

  return (
    <div
      ref={rootRef}
      className="cyber-glass relative overflow-hidden rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85)] border border-white/10 light:border-slate-900/10"
    >
      {/* Laser scan line overlay */}
      <div className="pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-cyan-400/[0.04] to-transparent [animation:laser-scan_6s_linear_infinite]" />

      {/* Top Window Bar & Cyber Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 light:border-slate-900/10 bg-black/40 light:bg-slate-900/[0.03] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="ml-2 font-mono text-[11px] font-medium tracking-wider text-white/50 light:text-slate-500">
            ITOPS // COMMAND_DECK · <span className="text-cyan-300 light:text-cyan-600">LIVE_OPS</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="font-mono text-white/40 light:text-slate-400">{clock} UTC</span>
          <span className="hidden sm:inline-block h-3 w-px bg-white/10 light:bg-slate-900/10" />
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-white/70 hover:border-cyan-400/50 hover:text-white transition-colors"
            title="Toggle simulated telemetry stream"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isStreaming ? "bg-emerald-400 [animation:pulse-glow_1.4s_ease-in-out_infinite]" : "bg-white/30"
              }`}
            />
            {isStreaming ? "FEED_ACTIVE" : "PAUSED"}
          </button>
        </div>
      </div>

      {/* Interactive Simulation Switcher Strip */}
      <div className="border-b border-white/10 light:border-slate-900/10 bg-black/30 light:bg-slate-100/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 light:text-slate-500 mr-1 hidden sm:inline">
            Interactive Test:
          </span>
          <button
            onClick={() => setSimMode("nominal")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              simMode === "nominal"
                ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            🟢 Nominal Ops
          </button>
          <button
            onClick={() => setSimMode("spike")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              simMode === "spike"
                ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_12px_rgba(255,77,77,0.25)]"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            ⚡ Simulate Surge
          </button>
          <button
            onClick={() => setSimMode("healing")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              simMode === "healing"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : "text-white/60 hover:text-white border border-transparent hover:bg-white/5"
            }`}
          >
            🛡️ Auto-Remediate
          </button>
        </div>

        {simMode === "spike" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 font-mono text-[10px] text-red-300 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            INCIDENT #3104 AUTO-OPENED
          </span>
        )}
        {simMode === "healing" && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            SELF-HEALED · MTTR: 14s
          </span>
        )}
        {simMode === "nominal" && (
          <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-300/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ALL SYSTEMS GREEN (99.98%)
          </span>
        )}
      </div>

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-5">
        {/* Left 3 Columns: Telemetry Waveform & Mini HUD */}
        <div className="lg:col-span-3">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80 light:text-slate-700 flex items-center gap-1.5">
                Global Response Telemetry
                <span className="font-mono text-[10px] text-white/40 light:text-slate-400 font-normal">(Last 60m)</span>
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-white/40 light:text-slate-400">p95</span>
              <span className={simMode === "spike" ? "text-red-300 font-semibold" : "text-cyan-300"}>
                {simMode === "spike" ? "482ms" : simMode === "healing" ? "88ms" : "142ms"}
              </span>
            </div>
          </div>

          {/* SVG Waveform Chart with interactive scrubber */}
          <div
            className="group/chart relative h-36 w-full overflow-hidden rounded-xl border border-white/10 light:border-slate-900/10 bg-black/40 light:bg-slate-900/[0.03] transition-colors"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setHoverPoint({
                pct,
                ms: simMode === "spike" ? Math.round(180 + pct * 280) : Math.round(90 + Math.sin(pct * Math.PI) * 45)
              });
            }}
            onMouseLeave={() => setHoverPoint(null)}
          >
            {/* Grid crosshairs */}
            <div className="pointer-events-none absolute inset-0 opacity-20 enterprise-grid" />

            <svg viewBox="0 0 470 120" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentPath.gradient[0]} />
                  <stop offset="100%" stopColor={currentPath.gradient[1]} />
                </linearGradient>
              </defs>
              <path d={currentPath.area} fill="url(#areaGradient)" style={{ transition: "d 0.6s ease" }} />
              <path
                d={currentPath.line}
                fill="none"
                stroke={currentPath.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                style={{
                  transition: "stroke 0.4s ease, d 0.6s ease",
                  filter: `drop-shadow(0 0 6px ${currentPath.color}88)`
                }}
              />

              {/* Threshold warning line during spike */}
              {simMode === "spike" && (
                <line x1="0" y1="35" x2="470" y2="35" stroke="#ff4d4d" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              )}
            </svg>

            {/* Hover Scrubber Line & Tooltip */}
            {hoverPoint && (
              <>
                <div
                  className="pointer-events-none absolute inset-y-0 w-px bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  style={{ left: `${hoverPoint.pct * 100}%` }}
                />
                <div
                  className="pointer-events-none absolute top-2 rounded-md border border-white/20 bg-neutral-900/90 px-2 py-1 font-mono text-[10px] text-white backdrop-blur-md shadow-lg"
                  style={{
                    left: `${Math.min(Math.max(hoverPoint.pct * 100, 15), 85)}%`,
                    transform: "translateX(-50%)"
                  }}
                >
                  <span className="text-cyan-300">{hoverPoint.ms}ms</span> · HTTP 200 OK
                </div>
              </>
            )}

            <div className="pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent [animation:sheen_4s_linear_infinite]" />
          </div>

          {/* Mini Stats HUD */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <MiniStat
              label="Fleet Uptime"
              to={simMode === "spike" ? 99.92 : 99.98}
              decimals={2}
              suffix="%"
              tone={simMode === "spike" ? "text-amber-300" : "text-emerald-300"}
              sublabel="Across 28 nodes"
              active={inView}
            />
            <MiniStat
              label="Incidents"
              to={simMode === "spike" ? 1 : 0}
              tone={simMode === "spike" ? "text-red-300" : "text-white light:text-slate-900"}
              sublabel={simMode === "spike" ? "Auto-diagnosing" : "0 active"}
              active={inView}
            />
            <MiniStat
              label="Telemetry Rate"
              to={simMode === "spike" ? 3.4 : 1.4}
              decimals={1}
              suffix="k"
              tone="text-cyan-300"
              sublabel="checks / min"
              active={inView}
            />
          </div>
        </div>

        {/* Right 2 Columns: Interactive Service Nodes Deck */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-white/80 light:text-slate-700">Service Constellation</p>
              <span className="font-mono text-[10px] text-white/40 light:text-slate-400">Click to ping</span>
            </div>

            <div className="space-y-2">
              {services.map((s) => {
                const isSelected = selectedService === s.id;
                const isPinging = pingSuccess === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(isSelected ? null : s.id)}
                    className={`group cursor-pointer rounded-xl border p-2.5 transition-all ${
                      isSelected
                        ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_16px_rgba(0,240,255,0.15)]"
                        : "border-white/10 light:border-slate-900/10 bg-white/[0.03] light:bg-slate-900/[0.02] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            s.status === "up"
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] [animation:pulse-glow_1.8s_ease-in-out_infinite]"
                              : "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping"
                          }`}
                        />
                        <span className="font-mono text-xs text-white/80 light:text-slate-700 group-hover:text-white">
                          {s.name}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          s.status === "up" ? "text-cyan-300 light:text-cyan-600" : "text-red-300 light:text-red-600"
                        }`}
                      >
                        {isPinging ? "PINGING…" : s.ms}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08] light:bg-slate-900/[0.08]">
                        <motion.div
                          className={`h-full rounded-full ${
                            s.status === "up" ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-red-400"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${s.load}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <span className="font-mono text-[9px] text-white/40 light:text-slate-400">{s.load}%</span>
                    </div>

                    {/* Inline Expanded Node Details */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 pt-2 border-t border-white/10 font-mono text-[10px] space-y-1 text-white/60 light:text-slate-500"
                      >
                        <div className="flex justify-between">
                          <span>Protocol:</span>
                          <span className="text-white/80">{s.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Region Node:</span>
                          <span className="text-cyan-300">{s.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>P99 Baseline:</span>
                          <span className="text-emerald-300">{s.p99}</span>
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestPing(s.id);
                            }}
                            className="rounded bg-white/10 hover:bg-cyan-400/20 hover:text-cyan-300 px-2 py-0.5 text-[9px] text-white transition-colors"
                          >
                            {isPinging ? "✓ ACK RECEIVED (12ms)" : "⚡ SEND TEST PACKET"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-black/30 p-2 text-center font-mono text-[10px] text-white/40 light:text-slate-400">
            AUTONOMOUS PROBING: <span className="text-emerald-400">30s CADENCE</span> // ZERO AGENT OVERHEAD
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Upgraded Cyber Activity Feed ───────────────────────── */

const EVENTS = [
  {
    tag: "EDGE_HTTP",
    icon: "✓",
    text: "api.production responded in 126ms (200 OK)",
    tone: "text-emerald-300",
    bg: "bg-emerald-500/10",
    time: "3s ago"
  },
  {
    tag: "SSL_CERT",
    icon: "🔒",
    text: "api.example.com SSL valid — 47 days left (TLS 1.3)",
    tone: "text-cyan-300",
    bg: "bg-cyan-500/10",
    time: "11s ago"
  },
  {
    tag: "KEYWORD",
    icon: "✓",
    text: "checkout-service synthetic canary check passed",
    tone: "text-emerald-300",
    bg: "bg-emerald-500/10",
    time: "24s ago"
  },
  {
    tag: "HOST_KADA",
    icon: "🖥️",
    text: "prod-web-01 CPU 31% · memory 58% · load 0.42",
    tone: "text-blue-300",
    bg: "bg-blue-500/10",
    time: "36s ago"
  },
  {
    tag: "DNS_MESH",
    icon: "◆",
    text: "DNS A record for acme.io verified (4 edge regions)",
    tone: "text-violet-300",
    bg: "bg-violet-500/10",
    time: "48s ago"
  },
  {
    tag: "SELF_HEAL",
    icon: "🛡️",
    text: "Auto-remediation resolved anomaly on node #4 (14s MTTR)",
    tone: "text-emerald-300",
    bg: "bg-emerald-500/10",
    time: "1m ago"
  }
];

export function LiveActivityFeed() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "100px" });
  const [idx, setIdx] = useState(0);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setIdx(i => (i + 1) % EVENTS.length), 2600);
    return () => clearInterval(t);
  }, [inView]);

  const filteredEvents = EVENTS.filter(e => {
    if (filter === "checks") return e.tag.includes("HTTP") || e.tag.includes("KEYWORD");
    if (filter === "security") return e.tag.includes("SSL") || e.tag.includes("SELF_HEAL");
    return true;
  });

  const shown = [0, 1, 2].map(o => filteredEvents[(idx + o) % filteredEvents.length] || filteredEvents[0]);

  return (
    <div ref={ref} className="cyber-glass relative overflow-hidden rounded-2xl p-4 shadow-xl border border-white/10 light:border-slate-900/10">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
          <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-white/70 light:text-slate-600">
            Signal Feed
          </p>
        </div>
        <div className="flex gap-1">
          {["all", "checks", "security"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded px-1.5 py-0.5 font-mono text-[9px] uppercase transition-colors ${
                filter === f ? "bg-white/20 text-white font-semibold" : "text-white/40 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {shown.map((e, i) => (
          <div
            key={`${idx}-${i}-${e.tag}`}
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-black/20 p-2 text-xs transition-opacity"
            style={{ opacity: i === 0 ? 1 : 0.65 }}
          >
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-[10px] font-bold ${e.bg} ${e.tone}`}
            >
              {e.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-white/80 light:text-slate-700">{e.text}</p>
              <div className="flex items-center gap-2 font-mono text-[9px] text-white/40">
                <span>[{e.tag}]</span>
                <span>·</span>
                <span>{e.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ───────────────────────── Feature icons (Six Services cards) ───────────────────────── */

const FEATURE_ICONS = {
  "Uptime & Response Time": {
    gradient: "linear-gradient(135deg, #0e7490, #22d3ee)",
    path: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l3.5 3.5"
  },
  "SSL Certificate Monitoring": {
    gradient: "linear-gradient(135deg, #047857, #34d399)",
    path: "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm-2.8 9.2l2 2 3.8-4"
  },
  "Security Posture Scoring": {
    gradient: "linear-gradient(135deg, #6d28d9, #a78bfa)",
    path: "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm0 5v6m-3-3h6"
  },
  "Incident Tracking": {
    gradient: "linear-gradient(135deg, #be123c, #fb7185)",
    path: "M12 9v4m0 4h.01M10.3 4.3l-8 14A1 1 0 003 20h18a1 1 0 00.9-1.5l-8-14a1 1 0 00-1.6 0z"
  },
  "Multi-Channel Alerting": {
    gradient: "linear-gradient(135deg, #b45309, #fbbf24)",
    path: "M12 3v2m0 14v2M5 12H3m18 0h-2M12 8a4 4 0 014 4c0 2.5 1 3.5 2 4H6c1-.5 2-1.5 2-4a4 4 0 014-4zm-1.5 10a1.5 1.5 0 003 0"
  },
  "Asset Inventory": {
    gradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
    path: "M4 5.5h16v5H4zM4 13.5h16v5H4zM7 8h.01M7 16h.01M11 8h4M11 16h2"
  },
  // Platform module list reuses several of the above by meaning, plus a few new ones.
  "Website & API Monitoring": {
    gradient: "linear-gradient(135deg, #0e7490, #22d3ee)",
    path: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9m0-18C9.5 5.4 8.2 8.6 8.2 12s1.3 6.6 3.8 9M3.5 9h17M3.5 15h17"
  },
  "Security Monitoring": {
    gradient: "linear-gradient(135deg, #047857, #34d399)",
    path: "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm-2.8 9.2l2 2 3.8-4"
  },
  "Incident Management": {
    gradient: "linear-gradient(135deg, #be123c, #fb7185)",
    path: "M12 9v4m0 4h.01M10.3 4.3l-8 14A1 1 0 003 20h18a1 1 0 00.9-1.5l-8-14a1 1 0 00-1.6 0z"
  },
  "Enterprise Dashboard": {
    gradient: "linear-gradient(135deg, #4338ca, #818cf8)",
    path: "M4 5.5h16v5H4zM4 13.5h7v5H4zM13 13.5h7v5h-7z"
  },
  "Network & Device Monitoring": {
    gradient: "linear-gradient(135deg, #6d28d9, #a78bfa)",
    path: "M5 20V10m7 10V4m7 16v-7M3 20h18"
  },
  "Kada Nigrani (Server Monitoring)": {
    gradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
    path: "M4 5.5h16v5H4zM4 13.5h16v5H4zM7 8h.01M7 16h.01M11 8h4M11 16h2"
  },
  // Same module, word order as it's actually titled in the admin-edited
  // "landing/platform_preview" content items.
  "Server Monitoring (Kada Nigrani)": {
    gradient: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
    path: "M4 5.5h16v5H4zM4 13.5h16v5H4zM7 8h.01M7 16h.01M11 8h4M11 16h2"
  },
  "DevOps Monitoring": {
    gradient: "linear-gradient(135deg, #b45309, #fbbf24)",
    path: "M8.5 7A4.5 4.5 0 104 11.5M8.5 7H5M8.5 7v3.5m7 6.5a4.5 4.5 0 104.5-4.5m-4.5 4.5H19m-3.5 0v-3.5M9 15l6-6"
  },
  "Cloud Monitoring": {
    gradient: "linear-gradient(135deg, #0369a1, #38bdf8)",
    path: "M19.4 10.1a7 7 0 0 0-13.7-1A5.5 5.5 0 0 0 6.5 20h12a4.5 4.5 0 0 0 .9-8.9z"
  },
  "Endpoint Monitoring": {
    gradient: "linear-gradient(135deg, #0f766e, #2dd4bf)",
    path: "M4 4h16v12H4zM9 20h6M12 16v4"
  },
  "Cyber Sachet ": {
    gradient: "linear-gradient(135deg, #9d174d, #f472b6)",
    path: "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm0 6v4m0 3h.01"
  },
  "Cyber Awareness (CyberSachet)": {
    gradient: "linear-gradient(135deg, #9d174d, #f472b6)",
    path: "M12 3l7 3v5c0 4.6-3 8.6-7 10-4-1.4-7-5.4-7-10V6l7-3zm0 6v4m0 3h.01"
  },
  "Moonsav ITOps Academy": {
    gradient: "linear-gradient(135deg, #f59e0b, #6366f1)",
    path: "M12 4l9 4.5-9 4.5-9-4.5L12 4zm-6.5 6.75v4c0 2 2.9 3.75 6.5 3.75s6.5-1.75 6.5-3.75v-4M20 8.5v6"
  },
  "Reporting & Analytics": {
    gradient: "linear-gradient(135deg, #4d7c0f, #a3e635)",
    path: "M4 20V10m6 10V4m6 16v-7M3 20h18"
  }
};
const FEATURE_ICON_FALLBACK = {
  gradient: "linear-gradient(135deg, #334155, #94a3b8)",
  path: "M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4"
};
export function FeatureIcon({
  title,
  size = 40
}) {
  const meta = FEATURE_ICONS[title] ?? FEATURE_ICON_FALLBACK;
  return <span aria-hidden className="grid shrink-0 place-items-center rounded-xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110" style={{
    width: size,
    height: size,
    background: meta.gradient
  }}>
      <svg viewBox="0 0 24 24" style={{
      width: size * 0.55,
      height: size * 0.55
    }} fill="none">
        <path d={meta.path} stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>;
}

/* ───────────────────────── Technology marquee (real brand logos) ───────────────────────── */

import { siLinux, siDocker, siKubernetes, siGooglecloud, siPostgresql, siMysql, siRedis, siNginx, siApache, siPrometheus, siGrafana, siTerraform, siGithubactions } from "simple-icons";
// Windows' four-pane mark, drawn as simple rects (simple-icons no longer ships
// Microsoft/AWS marks for trademark reasons; these stand-ins are unmistakable).
const WINDOWS_PATH = "M0 0h11v11H0zM13 0h11v11H13zM0 13h11v11H0zM13 13h11v11H13z";
// Generic cloud glyph, tinted with each provider's brand color.
const CLOUD_PATH = "M19.4 10.1a7 7 0 0 0-13.7-1A5.5 5.5 0 0 0 6.5 20h12a4.5 4.5 0 0 0 .9-8.9zM18.5 18h-12a3.5 3.5 0 0 1-.4-7l1.5-.1.3-1.5a5 5 0 0 1 9.8.7l.2 1.6h1.6a2.5 2.5 0 0 1 0 5z";
const TECH = [{
  name: "Linux",
  hex: siLinux.hex,
  path: siLinux.path
}, {
  name: "Windows",
  hex: "0078D4",
  path: WINDOWS_PATH
}, {
  name: "Docker",
  hex: siDocker.hex,
  path: siDocker.path
}, {
  name: "Kubernetes",
  hex: siKubernetes.hex,
  path: siKubernetes.path
}, {
  name: "AWS",
  hex: "FF9900",
  path: CLOUD_PATH
}, {
  name: "Azure",
  hex: "0078D4",
  path: CLOUD_PATH
}, {
  name: "Google Cloud",
  hex: siGooglecloud.hex,
  path: siGooglecloud.path
}, {
  name: "PostgreSQL",
  hex: siPostgresql.hex,
  path: siPostgresql.path
}, {
  name: "MySQL",
  hex: siMysql.hex,
  path: siMysql.path
}, {
  name: "Redis",
  hex: siRedis.hex,
  path: siRedis.path
}, {
  name: "Nginx",
  hex: siNginx.hex,
  path: siNginx.path
}, {
  name: "Apache",
  hex: siApache.hex,
  path: siApache.path
}, {
  name: "Prometheus",
  hex: siPrometheus.hex,
  path: siPrometheus.path
}, {
  name: "Grafana",
  hex: siGrafana.hex,
  path: siGrafana.path
}, {
  name: "Terraform",
  hex: siTerraform.hex,
  path: siTerraform.path
}, {
  name: "GitHub Actions",
  hex: siGithubactions.hex,
  path: siGithubactions.path
}];
export function TechChip({
  tech
}) {
  return <span className="group/chip inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] light:bg-slate-900/[0.03] px-4 py-2 text-sm text-white/60 light:text-slate-500 transition-colors hover:border-white/25 hover:text-white light:hover:text-slate-900">
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0" style={{
      width: 18,
      height: 18
    }} aria-hidden>
        <path d={tech.path} fill={`#${tech.hex}`} className="opacity-80 transition-opacity group-hover/chip:opacity-100" />
      </svg>
      {tech.name}
    </span>;
}

/** Chip looked up by display name — for CMS-driven tech lists on product pages. */
export function TechChipByName({
  name
}) {
  const tech = TECH.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (!tech) {
    return <span className="inline-flex items-center whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] light:bg-slate-900/[0.03] px-4 py-2 text-sm text-white/60 light:text-slate-500">
        {name}
      </span>;
  }
  return <TechChip tech={tech} />;
}
export function TechMarquee() {
  const row = [...TECH, ...TECH];
  return <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="flex w-max animate-marquee gap-3">
        {row.map((t, i) => <TechChip key={i} tech={t} />)}
      </div>
    </div>;
}

/* ───────────────────────── Animated stat counter ───────────────────────── */

export function StatCounter({
  to,
  suffix = "",
  label,
  prefix = ""
}) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "-60px"
  });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <div ref={ref} className="text-center">
      <p className="text-3xl font-semibold tracking-tight text-white light:text-slate-900 md:text-4xl">
        {prefix}
        {n}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-white/45 light:text-slate-400 md:text-sm">{label}</p>
    </div>;
}