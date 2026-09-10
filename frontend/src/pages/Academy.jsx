import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { ProductShell } from "../components/ProductLayout";
import { Reveal, SpotlightCard } from "../components/Animated";
import { ITOPS_PROJECTS, CERTIFICATION_PATHS } from "../data/itopsAcademyCourses";
import { Icons } from "../components/AcademyITOpsTheme";

const PHILOSOPHY_STEPS = [
  "LEARN", "BUILD", "DEPLOY", "OPERATE", "MONITOR", "BREAK",
  "INVESTIGATE", "FIX", "AUTOMATE", "SECURE", "SCALE", "RECOVER",
  "DOCUMENT", "IMPROVE"
];

const LAB_TIERS = [
  {
    tier: "Tier 1",
    title: "Browser Simulation Engine",
    badge: "Available Now",
    color: "cyan",
    desc: "Zero setup, instant in-browser stateful terminal with interactive topology inspector, simulated command execution, and automated verification."
  },
  {
    tier: "Tier 2",
    title: "Real Docker Compose Lab",
    badge: "Hands-On",
    color: "emerald",
    desc: "Isolated container environments running real Linux, Docker Engine, PostgreSQL, Redis, MQTT brokers, and Nginx reverse proxies."
  },
  {
    tier: "Tier 3",
    title: "Real Kubernetes Cluster Lab",
    badge: "Cloud-Native",
    color: "indigo",
    desc: "Dedicated Kubernetes namespace with real kubectl, Deployments, Services, NetworkPolicies, Prometheus scraping, and Grafana dashboards."
  },
  {
    tier: "Tier 4",
    title: "Full Cloud Infrastructure Lab",
    badge: "Enterprise",
    color: "purple",
    desc: "Multi-VM cloud environments orchestrated via Terraform IaC, Ansible automation, and CI/CD pipelines."
  }
];

const TRACKS = [
  {
    title: "Track 1 — ITOps Foundation",
    icon: Icons.Terminal,
    desc: "Linux kernel, process trees, systemd services, TCP/IP sockets, DNS debugging, TLS 1.3, Git branching, and Bash automation.",
    topics: ["Linux Internals", "Networking & Sockets", "DNS & TLS", "Systemd Services", "Bash Scripting", "Process Triage"]
  },
  {
    title: "Track 2 — DevOps & Orchestration",
    icon: Icons.Rocket,
    desc: "Multi-stage Docker, Compose networking, Nginx reverse proxies, GitHub Actions CI/CD, Terraform IaC, and Kubernetes zero-downtime rollouts.",
    topics: ["Docker & Distroless", "Compose Stacks", "Nginx Gateways", "GitHub Actions", "Terraform Modules", "Kubernetes Rollouts"]
  },
  {
    title: "Track 3 — DevSecOps & Cloud Security",
    icon: Icons.Shield,
    desc: "Shift-left SAST scanning, Gitleaks secret detection, Trivy container CVE scans, HashiCorp Vault dynamic secrets, and K8s NetworkPolicies.",
    topics: ["SAST & Semgrep", "Secret Scanning", "Container CVEs", "HashiCorp Vault", "K8s NetworkPolicy", "Zero Trust"]
  },
  {
    title: "Track 4 — SRE, Observability & Chaos",
    icon: Icons.BarChart,
    desc: "Prometheus metrics, Grafana SLO dashboards, OpenTelemetry distributed tracing, Chaos engineering fault injection, and live incident postmortems.",
    topics: ["Prometheus & PromQL", "Grafana SLOs", "OpenTelemetry Traces", "Chaos Engineering", "Incident Triage", "Blameless Postmortems"]
  }
];

const FAQ = [
  {
    q: "How does MOONSAV ITOps Academy differ from standard tutorial websites?",
    a: "MOONSAV ITOps Academy is built around real operating environments. You do not just watch videos; you take control of real architectures (IoT water pumps & distributed microservices), inspect live topologies, execute terminal commands, respond to live production outages, and author blameless postmortems."
  },
  {
    q: "What is the difference between Simulation Mode and Real Lab Mode?",
    a: "Simulation Mode (Tier 1) provides an instant in-browser stateful shell, interactive topology inspector, and automated validators with zero wait time. Real Lab Mode (Tiers 2-4) provisions isolated Docker containers and Kubernetes namespaces for live containerized execution."
  },
  {
    q: "What are the two flagship practical environments?",
    a: "1. MOONSAV Smart Infrastructure Lab — our real IoT industrial product with virtual motors, water tanks, telemetry, and MQTT brokers. 2. MOONSAV Distributed Systems Lab — an enterprise e-commerce platform with Nginx gateway, Order/Inventory microservices, RabbitMQ message brokers, Celery workers, and PostgreSQL replication."
  },
  {
    q: "How are MOONSAV certifications verified?",
    a: "Certifications strictly require passing hands-on lab milestones, solving unknown root cause production incidents under active SLO pressure, and submitting audited blameless postmortems."
  }
];

export default function Academy() {
  return (
    <div className="min-h-screen bg-black text-white antialiased font-sans">
      <MarketingNav />

      <main className="pt-32 pb-24 space-y-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20">
          {/* Ambient Glows */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[40rem] rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-3xl opacity-60" />
          </div>

          <ProductShell>
            <div className="mx-auto max-w-4xl text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                INTERACTIVE ENGINEERING & SRE ACADEMY
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                MOONSAV ITOps Academy
              </h1>

              <p className="mx-auto max-w-2xl text-lg text-white/70 leading-relaxed">
                Interactive DevOps, DevSecOps & SRE learning platform with production-style simulation and progressive real infrastructure labs.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  to="/training/academy"
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all"
                >
                  Launch Engineer Workspace →
                </Link>
                <a
                  href="#projects"
                  className="rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
                >
                  Explore Flagship Labs ↓
                </a>
              </div>

              {/* Engineering Philosophy Cycle */}
              <div className="pt-12 border-t border-white/10 mt-12">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-4">
                  THE PRODUCTION ENGINEERING OPERATING LOOP
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold text-cyan-300">
                  {PHILOSOPHY_STEPS.map((step, idx) => (
                    <span key={step} className="flex items-center gap-2">
                      <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-white/90 shadow-sm hover:border-cyan-400 transition-colors">
                        {step}
                      </span>
                      {idx < PHILOSOPHY_STEPS.length - 1 && (
                        <span className="text-white/30">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ProductShell>
        </section>

        {/* SECTION: 4 PROGRESSIVE LAB TIERS */}
        <section className="py-12 bg-white/[0.01] border-y border-white/10">
          <ProductShell>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                PROGRESSIVE INFRASTRUCTURE TIERS
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-white">
                From Browser Simulation to Real Cloud Labs
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Learn concepts with zero setup, then progress into isolated container and Kubernetes environments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {LAB_TIERS.map((t) => (
                <div key={t.tier} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">{t.tier}</span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                        {t.badge}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white">{t.title}</h3>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </ProductShell>
        </section>

        {/* SECTION: TWO FLAGSHIP PRACTICAL PROJECTS */}
        <section id="projects" className="py-12 scroll-mt-20">
          <ProductShell>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                TWO DISTINCT ARCHITECTURES
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-white">
                Two Flagship Practical Environments
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Master both hardware IoT telemetry and high-volume enterprise microservices.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project A: MOONSAV IoT */}
              <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 via-slate-950 to-black p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-cyan-400/20 border border-cyan-400/30 px-3 py-1 text-xs font-bold text-cyan-300">
                      FLAGSHIP A — IoT / INDUSTRIAL SRE
                    </span>
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <Icons.Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    MOONSAV Smart Infrastructure Lab
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Our own real IoT product. Features virtual motor pumps, water tanks, ultrasonic level sensors, MQTT broker listeners, TimescaleDB telemetry, and automated dry-run safety cutoff interlocks.
                  </p>

                  <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-2">
                    <p className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">What You Operate & Break:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/80">
                      <div>• MQTT Broker Sockets</div>
                      <div>• TimescaleDB Telemetry</div>
                      <div>• Dry-Run Interlocks</div>
                      <div>• Device Storm DDoS</div>
                      <div>• Thermal Runaway Triage</div>
                      <div>• Sensor Calibration Loss</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/50">25+ IoT Labs & Outages</span>
                  <Link to="/training/academy" className="text-xs font-bold text-cyan-300 hover:text-cyan-200 underline">
                    Enter IoT Workspace →
                  </Link>
                </div>
              </div>

              {/* Project B: Distributed Systems */}
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-slate-950 to-black p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                      FLAGSHIP B — ENTERPRISE MICROSERVICES
                    </span>
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Icons.Server className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    MOONSAV Distributed Systems Lab
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    High-volume distributed business platform adapted from real DevOps internship methodologies. Features Nginx gateway, Order/Inventory microservices, RabbitMQ message brokers, Celery workers, and PostgreSQL replication.
                  </p>

                  <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-2">
                    <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">What You Operate & Break:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-white/80">
                      <div>• RabbitMQ DLQ Cascades</div>
                      <div>• Celery Worker OOM Kills</div>
                      <div>• Postgres Pool Exhaustion</div>
                      <div>• Redis Eviction Storms</div>
                      <div>• Distributed Traces (Jaeger)</div>
                      <div>• Zero-Downtime Rollouts</div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/50">30+ Microservice Labs</span>
                  <Link to="/training/academy" className="text-xs font-bold text-amber-300 hover:text-amber-200 underline">
                    Enter Distributed Workspace →
                  </Link>
                </div>
              </div>
            </div>
          </ProductShell>
        </section>

        {/* SECTION: 4 COMPREHENSIVE LEARNING TRACKS */}
        <section className="py-12">
          <ProductShell>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                STRUCTURED PROGRESSION
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-white">
                Four Specialized Engineering Tracks
              </h2>
              <p className="mt-3 text-sm text-white/60">
                100+ practical labs taking you from Linux process triage to distributed Kubernetes chaos experiments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRACKS.map((track, i) => {
                const IconComp = track.icon;
                return (
                  <SpotlightCard key={track.title} delay={i * 0.1} className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <IconComp className="w-5 h-5 text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{track.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">
                      {track.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                      {track.topics.map((t) => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          </ProductShell>
        </section>

        {/* SECTION: VERIFIABLE CERTIFICATIONS */}
        <section className="py-12">
          <ProductShell>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                VERIFIABLE CREDENTIALS
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl text-white">
                MOONSAV Industry Certifications
              </h2>
              <p className="mt-3 text-sm text-white/60">
                Every certification is strictly gated by verified lab completions, resolved production incidents, and audited postmortems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CERTIFICATION_PATHS.map((cert) => (
                <div key={cert.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/70">
                        {cert.code}
                      </span>
                      <span className="text-[11px] text-cyan-400">{cert.level}</span>
                    </div>
                    <h4 className="mt-2 text-base font-bold text-white">{cert.title}</h4>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed">{cert.description}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[10px] text-white/40">
                    Requires &ge; {cert.requiredIncidentsCount} Incidents + {cert.requiredLabsCount} Labs
                  </div>
                </div>
              ))}
            </div>
          </ProductShell>
        </section>

        {/* SECTION: FAQ */}
        <section className="py-12 border-t border-white/10">
          <ProductShell>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">FAQ</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {FAQ.map((item, i) => (
                <Reveal key={item.q} delay={i * 0.05}>
                  <details className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 open:bg-white/[0.04]">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
                      {item.q}
                      <span className="text-white/40 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-white/60">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </ProductShell>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 text-center">
          <ProductShell>
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-950 p-12 space-y-6 max-w-4xl mx-auto shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white">
                Ready to Operate Real Infrastructure?
              </h2>
              <p className="text-sm text-white/70 max-w-xl mx-auto">
                Join the MOONSAV ITOps Academy and graduate with demonstrated operational mastery across IoT edge systems and distributed enterprise microservices.
              </p>
              <div>
                <Link
                  to="/training/academy"
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl hover:scale-105 transition-all inline-block"
                >
                  Enter Engineer Workspace →
                </Link>
              </div>
            </div>
          </ProductShell>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
