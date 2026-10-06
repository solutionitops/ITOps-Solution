import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { fetchContentItems } from "../api/endpoints";
import { NetworkPulseBackground } from "../components/PageBackgrounds";
import { SpotlightCard } from "../components/Animated";
import { ProductIcon } from "../components/ProductIcon";

const CARD_TINTS = ["cyan", "emerald", "blue", "violet", "amber", "rose", "red"];

const CATEGORIES = [
  { id: "all", label: "All Modules" },
  { id: "infra", label: "Infrastructure & Hosts" },
  { id: "edge", label: "Edge & Web Probing" },
  { id: "security", label: "Perimeter & Security" },
  { id: "incident", label: "Incident Ops" },
  { id: "training", label: "Human Defense & Labs" }
];

const FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "live", label: "Live Today" },
  { value: "roadmap", label: "Roadmap Modules" }
];

export const COVER_MAP = {
  "website-api-monitoring": "/covers/website-api.jpg",
  "security-monitoring": "/covers/security.jpg",
  "kada-nigrani": "/covers/servers.jpg",
  "infrastructure-monitor": "/covers/network.jpg",
  "devops-monitor": "/covers/devops.jpg",
  "alerting-incident-response": "/covers/incidents.jpg",
  "moonsav-edr": "/covers/edr.jpg",
  cybersachet: "/covers/cybersachet.jpg",
  academy: "/covers/academy.jpg"
};

// Rich fallback catalog ensuring instant load & robust resilience
const CATALOG = [
  {
    id: "website-api-monitoring",
    itemKey: "website-api-monitoring",
    title: "Website & API Monitoring",
    subtitle: "Uptime, response time & multi-step synthetic checks",
    category: "edge",
    status: "live",
    tint: "cyan",
    body: "Every endpoint checked as often as every 30 seconds — status codes, keyword verification, DNS records, and full 5-hop redirect chains attached.",
    tags: ["30s Cadence", "Global Mesh Probes", "Keyword Canaries", "Redirect Tracer"],
    capabilities: [
      { title: "Sub-minute HTTP/3 uptime checks", status: "live" },
      { title: "Full redirect-chain latency inspection", status: "live" },
      { title: "Synthetic keyword & status code asserts", status: "live" },
      { title: "Multi-region DNS propagation monitoring", status: "live" },
      { title: "Scheduled executive SLA PDF reports", status: "roadmap" }
    ],
    architecture: {
      deployment: "Agentless (Global Cloud Probes)",
      cadence: "30 seconds",
      protocols: "HTTP/1.1, HTTP/2, HTTP/3, TLS 1.3, DNS",
      alerts: "Slack, PagerDuty, Webhooks, Email"
    }
  },
  {
    id: "security-monitoring",
    itemKey: "security-monitoring",
    title: "Security Monitoring",
    subtitle: "Headers, SSL expiration & attack surface scoring",
    category: "security",
    status: "live",
    tint: "emerald",
    body: "A security score you can act on. Graded out of 100 on headers that actually stop attacks (HSTS, CSP, X-Frame), cookie flags, and automated SSL certificate renewal alerts.",
    tags: ["Posture Score / 100", "SSL Countdown", "HSTS & CSP Checks", "Zero Agent"],
    capabilities: [
      { title: "Automated security-header posture grading", status: "live" },
      { title: "SSL certificate expiry tracking & alerts", status: "live" },
      { title: "Cookie security flag audits (SameSite, Secure)", status: "live" },
      { title: "Server version header leak detection", status: "live" },
      { title: "Automated sub-resource integrity (SRI) scan", status: "roadmap" }
    ],
    architecture: {
      deployment: "Agentless (Automated on HTTPS monitors)",
      cadence: "Continuous on every check",
      protocols: "TLS 1.2/1.3, HTTPS, DNSSEC",
      alerts: "Multi-channel early warning at 30, 14 & 3 days"
    }
  },
  {
    id: "kada-nigrani",
    itemKey: "kada-nigrani",
    title: "Kada Nigrani (Server Monitoring)",
    subtitle: "Lightweight Linux agent & live host telemetry",
    category: "infra",
    status: "live",
    tint: "blue",
    body: "See inside every server you run. One line installs a lightweight agent on any Linux host. CPU, memory, disk, load average, and process counts stream into your unified console.",
    tags: ["One-Line Install", "Bash & Curl Only", "Per-Host Keys", "Real-Time Top"],
    capabilities: [
      { title: "One-line bash installer for any Linux distro", status: "live" },
      { title: "Real-time CPU, RAM, disk & load telemetry", status: "live" },
      { title: "Per-host ingest keys with instant revocation", status: "live" },
      { title: "Process count & memory hog tracking", status: "live" },
      { title: "Autonomous self-healing runbook execution", status: "roadmap" }
    ],
    architecture: {
      deployment: "Lightweight agent (Bash / curl)",
      cadence: "60-second telemetry ingest",
      protocols: "HTTPS out-bound only (zero open ports)",
      alerts: "High load threshold, offline heartbeats"
    }
  },
  {
    id: "infrastructure-monitor",
    itemKey: "infrastructure-monitor",
    title: "Network & Device Monitoring",
    subtitle: "Agentless TCP-connect & DNS health across the path",
    category: "infra",
    status: "live",
    tint: "violet",
    body: "See every hop between the internet and your servers. Agentless TCP-connect checks and DNS record monitoring for routers, switches, firewalls, and any network device with a reachable port.",
    tags: ["Agentless TCP", "Router & Switch Ports", "DNS Diff Alerts", "Sub-Second Ping"],
    capabilities: [
      { title: "Agentless TCP port latency measurement", status: "live" },
      { title: "A, AAAA, CNAME, MX, TXT record drift watch", status: "live" },
      { title: "Port preset library (SSH, HTTPS, DNS, RDP)", status: "live" },
      { title: "Immediate incident opening on connection drop", status: "live" },
      { title: "SNMP v3 hardware telemetry (fan, temp, PSU)", status: "roadmap" }
    ],
    architecture: {
      deployment: "Agentless cloud probes",
      cadence: "30s to 5m customizable",
      protocols: "TCP connect, ICMP ping, DNS over UDP/TCP",
      alerts: "Refused, timed-out, unreachable alerts"
    }
  },
  {
    id: "alerting-incident-response",
    itemKey: "alerting-incident-response",
    title: "Incidents & Multi-Channel Alerting",
    subtitle: "Automated triage, Slack/webhook routing & root-cause analysis",
    category: "incident",
    status: "live",
    tint: "rose",
    body: "From failure to fix, automatically. Consecutive failures open an incident with the real cause attached. Slack, webhook, and email alerts fire at once, and recovery closes it on its own.",
    tags: ["Auto-Resolve", "AI Root Cause", "Slack & PagerDuty", "Public Status Page"],
    capabilities: [
      { title: "Auto-open on consecutive check failures", status: "live" },
      { title: "Slack, webhook, email & Discord dispatch", status: "live" },
      { title: "Automatic resolution upon check recovery", status: "live" },
      { title: "Public branded status page per organization", status: "live" },
      { title: "AI-assisted Root Cause Diagnosis (RCA)", status: "live" }
    ],
    architecture: {
      deployment: "Built-in control plane core",
      cadence: "Real-time instant dispatch (<200ms)",
      protocols: "Webhooks, Slack API, SMTP, Discord",
      alerts: "Configured once org-wide, zero per-check wiring"
    }
  },
  {
    id: "cybersachet",
    itemKey: "cybersachet",
    title: "CyberSachet",
    subtitle: "Human defense & security-awareness training",
    category: "training",
    status: "live",
    tint: "amber",
    body: "Make every employee part of the defence. Structured security-awareness courses built from real lessons, each ending in a scored quiz — so awareness is measured, not assumed.",
    tags: ["Human Posture", "Scored Quizzes", "Phishing Simulation", "Team Progress Ring"],
    capabilities: [
      { title: "Interactive phishing simulation & breakdown", status: "live" },
      { title: "Passwords & MFA defense courseware", status: "live" },
      { title: "Social engineering recognition training", status: "live" },
      { title: "Per-employee quiz scores & completion logs", status: "live" },
      { title: "Automated spear-phishing test campaigns", status: "roadmap" }
    ],
    architecture: {
      deployment: "In-browser web training portal",
      cadence: "Self-paced + quarterly recurring cycles",
      protocols: "Web LMS, interactive SCORM-ready",
      alerts: "Manager completion reports, reminder pings"
    }
  },
  {
    id: "devops-monitor",
    itemKey: "devops-monitor",
    title: "DevOps Monitor",
    subtitle: "CI/CD pipelines, container fleets & release telemetry",
    category: "infra",
    status: "roadmap",
    tint: "violet",
    body: "Watch every release, commit to production. Monitoring for the tools your engineers actually run. Track GitHub Actions, Docker containers, and Kubernetes deployments in one pipeline.",
    tags: ["CI/CD Pipelines", "Docker & K8s", "Terraform Drift", "Release Canaries"],
    capabilities: [
      { title: "GitHub Actions & GitLab CI build telemetry", status: "roadmap" },
      { title: "Docker daemon & container restart counters", status: "roadmap" },
      { title: "Kubernetes pod readiness & crashloop tracking", status: "roadmap" },
      { title: "Terraform state drift detection alerts", status: "roadmap" }
    ],
    architecture: {
      deployment: "K8s DaemonSet & CI Runner Plugin",
      cadence: "Continuous event webhooks",
      protocols: "OpenTelemetry, gRPC, Docker Socket",
      alerts: "Build breakages, container OOM kills"
    }
  },
  {
    id: "moonsav-edr",
    itemKey: "moonsav-edr",
    title: "MoonSav EDR & Threat Shield",
    subtitle: "Next-gen endpoint detection & active threat containment",
    category: "security",
    status: "roadmap",
    tint: "red",
    body: "Continuous behavioral telemetry across workstations and servers to intercept lateral movement, credential harvesting, memory tampering, and zero-day execution.",
    tags: ["Kernel Telemetry", "Process Tree Audit", "Active Quarantine", "Zero-Day Shield"],
    capabilities: [
      { title: "Kernel-level file & process execution hooks", status: "roadmap" },
      { title: "Behavioral anomaly & living-off-the-land flags", status: "roadmap" },
      { title: "Instant node network isolation trigger", status: "roadmap" },
      { title: "MITRE ATT&CK matrix technique alignment", status: "roadmap" }
    ],
    architecture: {
      deployment: "eBPF (Linux) / Driver (Windows)",
      cadence: "Real-time streaming",
      protocols: "gRPC TLS Mutual Auth",
      alerts: "Sev-1 immediate incident escalation"
    }
  },
  {
    id: "academy",
    itemKey: "academy",
    title: "Moonsav ITOps Academy",
    subtitle: "Hands-on SRE labs, Linux deep-dives & certifications",
    category: "training",
    status: "live",
    tint: "violet",
    body: "Master production systems engineering. Interactive Linux troubleshooting labs, container runtime debugging, SRE incident command simulations, and verifiable certifications.",
    tags: ["Live Browser Terminal", "Red Hat & Linux", "Hands-on Labs", "Cryptographic Certs"],
    capabilities: [
      { title: "Interactive in-browser Linux terminal sandbox", status: "live" },
      { title: "Red Hat Enterprise Linux essential training", status: "live" },
      { title: "Live troubleshooting & log analysis labs", status: "live" },
      { title: "Cryptographically verifiable certificates", status: "live" },
      { title: "Multi-player incident response war-room labs", status: "roadmap" }
    ],
    architecture: {
      deployment: "WebAssembly terminal & cloud micro-VMs",
      cadence: "On-demand hands-on sessions",
      protocols: "xterm.js, WebSocket PTY, QR verification",
      alerts: "Course completion & certification notifications"
    }
  }
];

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Solutions() {
  const { data: remoteSolutions, isLoading } = useQuery({
    queryKey: ["content", "solutions", "solutions"],
    queryFn: () => fetchContentItems("solutions", "solutions")
  });

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("bento"); // "bento" | "ecosystem"
  const [inspectItem, setInspectItem] = useState(null);

  // Merge remote items with rich catalog metadata
  const products = useMemo(() => {
    return CATALOG.map((local) => {
      const match = (remoteSolutions ?? []).find(
        (r) => r.itemKey === local.itemKey || r.itemKey === local.id
      );
      if (!match) return local;
      return {
        ...local,
        title: match.title || local.title,
        subtitle: match.subtitle || local.subtitle,
        body: match.body || local.body,
        status: match.status || local.status,
        href: match.href || `/solutions/${local.itemKey}`
      };
    });
  }, [remoteSolutions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const haystack = `${p.title} ${p.subtitle} ${p.body} ${p.tags?.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, query, status, category]);

  return (
    <div
      className="min-h-screen bg-black light:bg-slate-50 text-white light:text-slate-900 antialiased"
      style={{ fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif" }}
    >
      <MarketingNav />
      <div className="enterprise-grid pointer-events-none fixed inset-0 z-0 opacity-60" aria-hidden />

      <main className="relative z-10 px-6 pb-28 pt-36 md:px-10">
        {/* ── Cyber-Ops Command Hero Deck ── */}
        <div className="relative isolate mx-auto max-w-6xl 3xl:max-w-[1500px] overflow-hidden rounded-3xl bg-[#0b1020] border border-white/10 light:bg-white light:border-slate-900/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] pb-14 pt-14 text-center text-white light:text-slate-900">
          <NetworkPulseBackground tint="blue" />
          <div className="radar-sweep-beam opacity-30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-black light:to-white" />

          <div className="relative z-10 px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-mono text-cyan-300 light:text-cyan-700 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 [animation:pulse-glow_1.4s_ease-in-out_infinite]" />
              ITOps Product Matrix // 9 Autonomous Modules
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-6xl">
              Independent Modules. <span className="text-gradient">One Unified Platform.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/65 light:text-slate-600">
              Each ITOps Solution product stands on its own — deploy one for a single specialized team or link them
              all into a consolidated, autonomous SRE command deck.
            </p>

            {/* Live Fleet Stats Ticker */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-xs">
              {[
                ["9", "Specialized Modules"],
                ["6", "Live Production"],
                ["30s", "Max Probing Cadence"],
                ["0", "Agent Overhead"],
                ["100%", "API Coverage"]
              ].map(([val, label]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.03] light:bg-slate-900/[0.03] px-3.5 py-2 backdrop-blur-md"
                >
                  <span className="font-semibold text-cyan-300 light:text-cyan-600 text-sm">{val}</span>{" "}
                  <span className="text-white/45 light:text-slate-400 text-[11px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Control Console: Search, Categories, Statuses, and View Modes ── */}
        <div className="mx-auto mt-12 max-w-6xl 3xl:max-w-[1500px] space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="group relative w-full lg:max-w-sm">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35 light:text-slate-400 transition-colors group-focus-within:text-cyan-300">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules, protocols, tags…"
                aria-label="Search modules"
                className="h-11 w-full rounded-full border border-white/12 light:border-slate-900/12 bg-black/50 light:bg-white pl-11 pr-4 text-sm text-white light:text-slate-900 placeholder:text-white/35 light:placeholder:text-slate-400 transition-all focus:border-cyan-400/50 focus:shadow-[0_0_0_4px_rgba(0,240,255,0.14)] focus:outline-none"
              />
            </div>

            {/* View Mode Toggle & Status Filter */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <div className="flex rounded-full border border-white/10 bg-black/40 light:bg-white p-1" role="group">
                {FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatus(f.value)}
                    aria-pressed={status === f.value}
                    className={`rounded-full px-3.5 py-1 text-xs font-mono transition-all ${
                      status === f.value
                        ? "bg-white text-black font-semibold shadow-sm"
                        : "text-white/60 light:text-slate-500 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* View Switcher: Bento vs Ecosystem Pipeline */}
              <div className="flex rounded-full border border-white/10 bg-black/40 light:bg-white p-1">
                <button
                  onClick={() => setViewMode("bento")}
                  className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
                    viewMode === "bento" ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40" : "text-white/50 hover:text-white"
                  }`}
                >
                  ⊞ Bento Grid
                </button>
                <button
                  onClick={() => setViewMode("ecosystem")}
                  className={`rounded-full px-3 py-1 font-mono text-xs transition-all ${
                    viewMode === "ecosystem" ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40" : "text-white/50 hover:text-white"
                  }`}
                >
                  ☊ Ecosystem Stack
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  category === c.id
                    ? "bg-white/15 text-white border border-white/30 shadow-sm"
                    : "border border-white/5 bg-white/[0.02] text-white/55 hover:bg-white/10 hover:text-white light:text-slate-600"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── View 1: Bento Grid Mode ── */}
        {viewMode === "bento" && (
          <div className="mx-auto mt-8 grid max-w-6xl 3xl:max-w-[1500px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading &&
              [0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}

            {!isLoading && filtered.length === 0 && (
              <div className="col-span-full rounded-2xl border border-white/10 bg-neutral-900/60 p-12 text-center">
                <p className="text-base text-white/60">No modules match “{query}”.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setCategory("all");
                  }}
                  className="mt-4 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs text-cyan-300 hover:bg-white/10"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {filtered.map((item, i) => {
              const liveCount = item.capabilities.filter((c) => c.status === "live").length;
              const isLive = item.status === "live";
              const coverImg = item.coverImage || COVER_MAP[item.itemKey] || "/covers/website-api.jpg";

              return (
                <SpotlightCard
                  key={item.id}
                  tint={CARD_TINTS[i % CARD_TINTS.length]}
                  delay={i * 0.05}
                  className="h-full flex flex-col justify-between overflow-hidden rounded-2xl cyber-glow-box group border border-white/10 p-0"
                >
                  <div>
                    {/* Coverpage Banner with Image & High-Tech Overlay */}
                    <div className="relative h-44 w-full overflow-hidden border-b border-white/10 bg-black/60">
                      <img
                        src={coverImg}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/65 to-black/30" />

                      {/* Header Badges on Cover */}
                      <div className="absolute inset-x-0 top-0 p-3.5 flex items-center justify-between z-10">
                        <span className="rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-0.5 font-mono text-[10px] text-white/80 uppercase">
                          {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 backdrop-blur-md ${
                            isLive
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                              : "bg-amber-950/80 text-amber-300 border border-amber-400/40"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isLive ? "bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" : "bg-amber-400"
                            }`}
                          />
                          {isLive ? "Live" : "Roadmap"}
                        </span>
                      </div>

                      {/* Overlapping Product Identity */}
                      <div className="absolute inset-x-0 bottom-0 p-4 flex items-center gap-3 z-10">
                        <ProductIcon itemKey={item.itemKey} size={42} />
                        <div>
                          <h2 className="text-base font-semibold tracking-tight text-white group-hover:text-cyan-300 transition-colors drop-shadow">
                            {item.title}
                          </h2>
                          <p className="text-[11px] text-white/70 font-mono drop-shadow line-clamp-1">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content below cover banner */}
                    <div className="p-5">
                      <p className="text-sm leading-relaxed text-white/65 light:text-slate-600 line-clamp-3">
                        {item.body}
                      </p>

                      {/* Feature tags */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {item.tags?.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/60 light:text-slate-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer & Quick Actions */}
                  <div className="px-5 pb-5 border-t border-white/10 light:border-slate-900/10 pt-4 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setInspectItem(item);
                      }}
                      className="font-mono text-xs text-white/50 hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>⚡ Quick Spec</span>
                    </button>

                    <Link
                      to={item.href || `/solutions/${item.itemKey}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 light:text-slate-700 hover:text-cyan-300 transition-all group-hover:translate-x-0.5"
                    >
                      <span>Explore Module</span>
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        )}

        {/* ── View 2: Ecosystem Architecture Stack ── */}
        {viewMode === "ecosystem" && (
          <div className="mx-auto mt-8 max-w-6xl 3xl:max-w-[1500px] space-y-6">
            <div className="cyber-glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Consolidated Defense Architecture</h3>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    Data flow from external customer request to internal host and incident resolution.
                  </p>
                </div>
                <span className="font-mono text-xs text-cyan-300 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                  5 INTEGRATED LAYERS
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    tier: "01 // EDGE & SYNTHETICS",
                    color: "border-cyan-400/40 bg-cyan-400/5",
                    modules: ["website-api-monitoring"]
                  },
                  {
                    tier: "02 // PERIMETER & DEFENSE",
                    color: "border-emerald-400/40 bg-emerald-400/5",
                    modules: ["security-monitoring", "moonsav-edr"]
                  },
                  {
                    tier: "03 // INFRASTRUCTURE & RELEASES",
                    color: "border-blue-400/40 bg-blue-400/5",
                    modules: ["kada-nigrani", "infrastructure-monitor", "devops-monitor"]
                  },
                  {
                    tier: "04 // OPERATIONS & TRIAGE",
                    color: "border-rose-400/40 bg-rose-400/5",
                    modules: ["alerting-incident-response"]
                  },
                  {
                    tier: "05 // HUMAN DEFENSE & LABS",
                    color: "border-amber-400/40 bg-amber-400/5",
                    modules: ["cybersachet", "academy"]
                  }
                ].map((row, idx) => (
                  <div key={row.tier} className={`rounded-xl border p-4 ${row.color} relative`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-semibold text-white/80">{row.tier}</span>
                      <span className="font-mono text-[10px] text-white/40">LAYER {idx + 1}</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {row.modules.map((mKey) => {
                        const m = CATALOG.find((c) => c.itemKey === mKey);
                        if (!m) return null;
                        return (
                          <div
                            key={mKey}
                            onClick={() => setInspectItem(m)}
                            className="cursor-pointer rounded-lg border border-white/10 bg-black/40 p-3 hover:border-white/30 transition-all flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <ProductIcon itemKey={m.itemKey} size={30} />
                              <div>
                                <p className="text-xs font-semibold text-white">{m.title}</p>
                                <p className="text-[10px] text-white/40 font-mono">{m.architecture.deployment}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-300">Spec →</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Spec Inspection Modal / Drawer ── */}
        <AnimatePresence>
          {inspectItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl cyber-glass border border-white/20 shadow-2xl flex flex-col"
              >
                {/* Modal Cover Image Header Banner */}
                <div className="relative h-40 w-full overflow-hidden border-b border-white/10 shrink-0 bg-black/80">
                  <img
                    src={inspectItem.coverImage || COVER_MAP[inspectItem.itemKey] || "/covers/website-api.jpg"}
                    alt={inspectItem.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222] via-[#0c1222]/75 to-black/35" />
                  <div className="radar-sweep-beam" />

                  {/* Badges & Close Button */}
                  <div className="absolute inset-x-0 top-0 p-4 flex items-center justify-between z-10">
                    <span className="rounded-full bg-black/70 backdrop-blur-md border border-cyan-400/40 px-3 py-0.5 font-mono text-[10px] text-cyan-300 uppercase tracking-wider">
                      SPEC ARCHITECTURE // {CATEGORIES.find(c => c.id === inspectItem.category)?.label || inspectItem.category}
                    </span>
                    <button
                      onClick={() => setInspectItem(null)}
                      className="rounded-full bg-black/60 backdrop-blur-md border border-white/20 p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                      aria-label="Close modal"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Overlaid Title & Product Icon */}
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-center gap-3.5 z-10">
                    <ProductIcon itemKey={inspectItem.itemKey} size={46} />
                    <div>
                      <h3 className="text-xl font-bold text-white drop-shadow">{inspectItem.title}</h3>
                      <p className="text-xs font-mono text-cyan-300 drop-shadow">{inspectItem.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto space-y-5">
                  <p className="text-sm leading-relaxed text-white/70">{inspectItem.body}</p>

                {/* Architecture Specifications */}
                <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-3.5 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40">Deployment Model:</span>
                    <span className="text-white font-medium">{inspectItem.architecture.deployment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Check Frequency:</span>
                    <span className="text-cyan-300 font-medium">{inspectItem.architecture.cadence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Protocols & Standards:</span>
                    <span className="text-white">{inspectItem.architecture.protocols}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Alert Channels:</span>
                    <span className="text-emerald-300">{inspectItem.architecture.alerts}</span>
                  </div>
                </div>

                {/* Capabilities list */}
                <div className="mt-5">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white/50 mb-2">
                    Capabilities ({inspectItem.capabilities?.length || 0})
                  </h4>
                  <ul className="space-y-1.5 font-mono text-xs">
                    {inspectItem.capabilities?.map((c) => (
                      <li key={c.title} className="flex items-center justify-between rounded bg-white/[0.03] px-2.5 py-1.5">
                        <span className="text-white/80">{c.title}</span>
                        <span
                          className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                            c.status === "live" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"
                          }`}
                        >
                          {c.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Modal CTA footer */}
                <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setInspectItem(null)}
                    className="rounded-full px-4 py-2 text-xs font-mono text-white/60 hover:text-white"
                  >
                    Close
                  </button>
                  <Link
                    to={inspectItem.href || `/solutions/${inspectItem.itemKey}`}
                    className="rounded-full bg-cyan-400 px-5 py-2 text-xs font-semibold text-black hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  >
                    Open Full Documentation →
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>

        {/* Footer CTA */}
        <p className="mx-auto mt-16 max-w-5xl text-center text-sm text-white/40 light:text-slate-500">
          Need an custom deployment or enterprise package?{" "}
          <Link to="/pricing" className="font-semibold text-cyan-300 light:text-cyan-600 hover:underline">
            Compare plans
          </Link>{" "}
          or{" "}
          <Link to="/support" className="font-semibold text-cyan-300 light:text-cyan-600 hover:underline">
            reach out to operations
          </Link>
          .
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}