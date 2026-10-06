import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { ContactForm } from "../components/ContactForm";
import { fetchContentItems } from "../api/endpoints";
import { BrandMark } from "../components/BrandLogo";
import { CTALink } from "../components/Button";

// ── 3D Interactive Tilt Card Component ─────────────────────────────────────────
function TiltCard({ children, className = "" }) {
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotX(rotateX);
    setRotY(rotateY);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.22 });
  }

  function handleMouseLeave() {
    setRotX(0);
    setRotY(0);
    setGlare(g => ({ ...g, opacity: 0 }));
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
      className={`relative will-change-transform ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`
        }}
      />
      {children}
    </div>
  );
}

// ── Stories-Style Carousel Content ────────────────────────────────────────────
const STORIES = [
  {
    id: "01",
    tag: "The Genesis",
    title: "The Outage at 02:14 AM",
    summary:
      "For years, small and mid-market engineering teams experienced downtime the exact same way: through an angry WhatsApp ping or customer tweet.",
    body: "We asked a simple question: why does knowing if your site or API is alive require buying five different enterprise contracts? We built ITOps to give every engineering team sub-30s synthetic alerts and immediate root cause analysis.",
    image: "/covers/incidents.jpg",
    metric: "02:14 AM",
    metricLabel: "Average blind-spot incident discovery"
  },
  {
    id: "02",
    tag: "Kada Nigrani Core",
    title: "Extreme Host Efficiency",
    summary:
      "Server monitoring should never compete with production workloads for CPU or RAM.",
    body: "Our Linux daemon, Kada Nigrani, uses less than 15MB of RAM and typically under 0.2% CPU. A single curl install on Ubuntu, Debian, RHEL or Alpine starts streaming CPU, memory, disk I/O and process trees to your unified console.",
    image: "/covers/servers.jpg",
    metric: "< 15 MB",
    metricLabel: "Daemon memory footprint (<0.2% CPU)"
  },
  {
    id: "03",
    tag: "Global Probe Mesh",
    title: "Synthetic Probes Across 12 Regions",
    summary:
      "Testing from your own VPS doesn't tell you how your users in Mumbai, Tokyo or London experience your app.",
    body: "Our multi-region canary nodes probe HTTP/1.1, HTTP/2, HTTP/3, TLS 1.3 handshakes, and full 5-hop redirect latency chains with microsecond timestamp fidelity, avoiding false positives through multi-region consensus.",
    image: "/covers/website-api.jpg",
    metric: "12 Regions",
    metricLabel: "Sub-30s synthetic probe mesh"
  },
  {
    id: "04",
    tag: "Security Posture",
    title: "CyberSachet Continuous Scoring",
    summary:
      "A fast website with misconfigured security headers or an expiring SSL certificate is a liability.",
    body: "Every HTTPS endpoint monitored is automatically scored out of 100 on HSTS, CSP, and X-Frame headers, with early warning SSL alerts at 30, 14, and 3 days before cert expiration stops customer checkouts.",
    image: "/covers/security.jpg",
    metric: "100 / 100",
    metricLabel: "Automated security posture baseline"
  },
  {
    id: "05",
    tag: "Sovereign Base",
    title: "Engineered in Kathmandu, Nepal",
    summary:
      "Born in Kathmandu to deliver sovereign, honest observability without predatory pricing.",
    body: "We support domestic payment compliance with local VAT invoicing, direct phone engineering access (+977 980-335-0658), and low-latency edge relays to domestic Nepal ISPs alongside global multi-cloud transit.",
    image: "/covers/network.jpg",
    metric: "27.71° N",
    metricLabel: "Kathmandu operational base"
  }
];

// ── Pinned Horizontal Scroll Slides ───────────────────────────────────────────
const HORIZONTAL_NODES = [
  {
    code: "KTM-01",
                      <p className="text-[11px] text-slate-500 dark:text-white/40 font-mono">
                        {activeStory.metricLabel}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Visual Image Window */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 aspect-video lg:aspect-square">
                  <img
                    src={activeStory.image}
                    alt={activeStory.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white/90">
                    <span>ITOps // CHAPTER_0{activeStoryIdx + 1}</span>
                    <span className="text-emerald-400">● LIVE RUNBOOK</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Carousel Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-5">
              <span className="text-xs font-mono text-slate-500 dark:text-white/40">
                {isPaused ? "Paused on hover" : "Auto-advancing"}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleSelectStory(activeStoryIdx === 0 ? STORIES.length - 1 : activeStoryIdx - 1)
                  }
                  className="rounded-full border border-slate-300 dark:border-white/15 p-2 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Previous story"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectStory((activeStoryIdx + 1) % STORIES.length)}
                  className="rounded-full border border-slate-300 dark:border-white/15 p-2 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Next story"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. STICKY SCROLLYTELLING (PINNED SPLIT-SCREEN SCROLL STORY)
         ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 md:px-10 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
            Architecture Walkthrough
          </span>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
            How ITOps Replaces the Five-Tool Tax
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Scroll down to see the diagnostic control plane adapt in real time.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 items-start relative">
          {/* Pinned Left Split-Screen Panel */}
          <div className="sticky top-28 self-start rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-950/90 p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-white/60">
                  Interactive Console State
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase ${activeScrollyData.preview.tone === "emerald"
                    ? "bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : activeScrollyData.preview.tone === "cyan"
                      ? "bg-cyan-500/15 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300"
                      : "bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}
              >
                {activeScrollyData.preview.badge}
              </span>
            </div>

            <div className="mt-6">
              <h4 className="text-xl font-bold text-slate-950 dark:text-white">
                {activeScrollyData.preview.title}
              </h4>
              <p className="text-xs font-mono text-slate-500 dark:text-white/50 mt-1">
                Status: {activeScrollyData.preview.status}
              </p>

              <div className="mt-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/60 p-5 font-mono text-xs space-y-2.5">
                {activeScrollyData.preview.lines.map((line, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed ${line.startsWith("✓")
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : line.startsWith("✕")
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-700 dark:text-white/70"
                      }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-white/40">
              <span>ACTIVE STAGE // 0{activeScrollyStep + 1}</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold">AUTO SYNC</span>
            </div>
          </div>

          {/* Scrolling Right Column (Triggers pinned state changes) */}
          <div className="space-y-16 lg:py-6">
            {SCROLLY_STEPS.map((step, idx) => (
              <div
                key={step.id}
                onMouseEnter={() => setActiveScrollyStep(idx)}
                className={`rounded-3xl border p-8 transition-all duration-300 cursor-pointer ${activeScrollyStep === idx
                    ? "border-cyan-500/60 dark:border-cyan-400/50 bg-white dark:bg-neutral-900/80 shadow-lg dark:shadow-[0_0_50px_-20px_rgba(0,240,255,0.25)]"
                    : "border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-neutral-950/40 opacity-70 hover:opacity-100"
                  }`}
              >
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
                  Chapter 0{idx + 1} · {step.kicker}
                </span>
                <h3 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-white/70">
                  {step.text}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-mono text-cyan-600 dark:text-cyan-300 font-semibold">
                  <span>Hover to inspect live preview</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          4. GLASSMORPHISM STAT CARDS OVER A PHOTO, PLUS A 3D TILT CARD
         ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 md:px-10 max-w-7xl mx-auto overflow-hidden">
        {/* Photo Background Frame */}
        <div className="relative rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-white/15 p-8 sm:p-12 md:p-16 shadow-2xl">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/covers/network.jpg')` }}
          />
          <div className="absolute inset-0 z-1 bg-gradient-to-r from-black/95 via-black/85 to-black/90" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Sovereign Infrastructure Presence
              </span>
              <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Grounded in Kathmandu. Deployed across the globe.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-white/75 leading-relaxed max-w-xl">
                We believe in extreme transparency. Here is the operational reality backing every check and metric we
                process.
              </p>

              {/* Floating Glassmorphism Stat Cards Grid Over Photo */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-5 backdrop-blur-2xl shadow-xl">
                  <p className="font-mono text-3xl font-extrabold text-cyan-400">12</p>
                  <p className="mt-1 text-xs font-mono text-white/90 uppercase tracking-wider font-semibold">
                    Global Probe Nodes
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">Multi-region consensus</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-5 backdrop-blur-2xl shadow-xl">
                  <p className="font-mono text-3xl font-extrabold text-emerald-400">&lt; 0.2%</p>
                  <p className="mt-1 text-xs font-mono text-white/90 uppercase tracking-wider font-semibold">
                    Kada Agent CPU
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">&lt; 15MB RAM footprint</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-5 backdrop-blur-2xl shadow-xl">
                  <p className="font-mono text-3xl font-extrabold text-violet-400">Sub-30s</p>
                  <p className="mt-1 text-xs font-mono text-white/90 uppercase tracking-wider font-semibold">
                    Check Cadence
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">Continuous HTTP/3 & TLS</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/[0.08] p-5 backdrop-blur-2xl shadow-xl">
                  <p className="font-mono text-3xl font-extrabold text-amber-400">99.99%</p>
                  <p className="mt-1 text-xs font-mono text-white/90 uppercase tracking-wider font-semibold">
                    Uptime SLA
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">Financially guaranteed</p>
                </div>
              </div>
            </div>

            {/* 3D Tilt Card (Interactive Perspective Pass) */}
            <TiltCard className="rounded-3xl border border-white/25 bg-black/60 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <BrandMark size={32} />
                <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
                  ● ACTIVE VERIFIED PASS
                </span>
              </div>

              <div className="mt-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Sovereign Base</span>
                <h3 className="mt-1 text-2xl font-bold text-white">Kathmandu HQ Hub</h3>
                <p className="mt-1 text-xs font-mono text-cyan-300">Bagmati Province · Nepal</p>
              </div>

              <div className="mt-6 space-y-3 font-mono text-xs border-t border-white/10 pt-4 text-white/70">
                <div className="flex justify-between">
                  <span className="text-white/40">Coordinates:</span>
                  <span>27.7172° N, 85.3240° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Direct Phone:</span>
                  <span className="text-white font-semibold">+977 980-335-0658</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Support SLA:</span>
                  <span className="text-emerald-400">&lt; 2hr Response</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Domestic Tax:</span>
                  <span>Nepal VAT Compliant</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-white/10 p-3 text-center text-xs font-mono text-cyan-300 border border-white/15">
                Hover to test interactive 3D perspective tilt
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          5. SCROLL-JACKED PINNED HORIZONTAL SCROLL SECTION (GLOBAL NODE NETWORK)
         ────────────────────────────────────────────────────────────────────────── */}
      <section ref={horizontalSectionRef} className="relative h-[280vh] w-full">
        {/* Pinned Viewport Stage */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden px-6 md:px-12">
          <div className="max-w-7xl mx-auto w-full mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
              Global Deployment Mesh
            </span>
            <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
              The Edge Infrastructure Gallery
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-white/50 font-mono">
              Scroll down to traverse our global edge probe nodes horizontally →
            </p>
          </div>

          {/* Horizontally Translating Reel */}
          <motion.div style={{ x: horizontalX }} className="flex gap-6 w-max will-change-transform">
            {HORIZONTAL_NODES.map(node => (
              <div
                key={node.code}
                className="w-[340px] sm:w-[420px] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-900/90 shadow-xl dark:shadow-2xl flex flex-col justify-between"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={node.bg} alt={node.city} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 font-mono text-xs text-cyan-400 border border-white/20">
                    {node.code}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-lg font-bold text-white">{node.city}</p>
                    <p className="text-xs font-mono text-emerald-400">{node.latency}</p>
                  </div>
                </div>

                <div className="p-6">
                  <span className="font-mono text-xs uppercase tracking-wider text-cyan-600 dark:text-cyan-300 font-semibold">
                    {node.role}
                  </span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-white/70">
                    {node.specs}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-white/50">
                    <span>NTP Clock: In Sync</span>
                    <span className="text-emerald-500 dark:text-emerald-400 font-semibold">ACTIVE</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          6. ARCH-MASKED IMAGE CARDS (LEADERSHIP & ARCHITECTS)
         ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 md:px-10 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
            Architectural Leadership
          </span>
          <h2 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
            Systems Architects
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-white/60">
            The engineers driving zero-overhead host telemetry and distributed canary networks.
          </p>
        </div>

        {/* Arch-Masked Cathedral Window Grid */}
        <div className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto">
          {(leadership ?? [
            {
              id: "utsav",
              title: "Utsav Khatri",
              subtitle: "Founder & CTO",
              image: "/covers/servers.jpg",
              bio: "Systems architect leading high-cadence probe schedulers, low-latency edge protocols, and minimal Linux kernel telemetry.",
              expertise: ["Systems Architecture", "Go & Kernel", "Kathmandu"]
            },
            {
              id: "pratik",
              title: "Pratik Chaudhary",
              subtitle: "Sr. Software Engineer",
              image: "/covers/security.jpg",
              bio: "Distributed systems engineer driving the real-time agent telemetry stream, multi-region failover, and autonomous RCA engines.",
              expertise: ["Distributed Systems", "Incident Mesh", "Telemetry Core"]
            }
          ]).map((member, i) => (
            <div
              key={member.id}
              className="relative group rounded-t-[140px] rounded-b-3xl overflow-hidden border border-slate-200 dark:border-white/15 bg-white dark:bg-neutral-950/80 shadow-xl dark:shadow-2xl transition-transform duration-300 hover:-translate-y-1"
            >
              {/* Arch-shaped Image Header Window */}
              <div className="relative h-80 sm:h-96 w-full overflow-hidden">
                <img
                  src={member.image ?? (i === 0 ? "/covers/servers.jpg" : "/covers/security.jpg")}
                  alt={member.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-8 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-4 py-1 text-[11px] font-mono text-cyan-300 backdrop-blur-md">
                  EXECUTIVE // 0{i + 1}
                </div>
              </div>

              {/* Lower Bio Card */}
              <div className="p-8 -mt-8 relative z-10 bg-white dark:bg-neutral-950/95">
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{member.title}</h3>
                <p className="mt-1 text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                  {member.subtitle}
                </p>

                <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-white/70">
                  {member.bio}
                </p>

                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
                  {(member.expertise ?? ["Systems Engineering", "Observability"]).map(skill => (
                    <span
                      key={skill}
                      className="rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-[10px] font-mono text-slate-700 dark:text-white/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          7. CORPORATE CONTACT CONSOLE & FOOTER CLOSING
         ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 md:px-10 max-w-5xl mx-auto">
        <div className="rounded-[2.5rem] border border-slate-200 dark:border-white/15 bg-white dark:bg-neutral-950/80 p-8 sm:p-12 shadow-xl dark:shadow-2xl backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold">
                Direct Touchpoints
              </span>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">
                Talk to Engineering in Kathmandu
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed">
                Need on-premise agent collectors, dedicated sovereign VPC relays, or custom Nepal VAT invoicing?
                Connect directly with our team.
              </p>

              <div className="mt-8 space-y-4 font-mono text-xs text-slate-800 dark:text-white/80">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-500">📞</span>
                  <span>+977 980-335-0658 (Direct Phone)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500">🏢</span>
                  <span>Kathmandu, Bagmati Province, Nepal</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-violet-500">✉️</span>
                  <span>support@itops.solution (&lt; 2hr SLA)</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                <Link
                  to="/become-reseller"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Apply for the ITOps Reseller Program →
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 p-2 sm:p-4">
              <ContactForm defaultTopic="company" />
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3">
            <CTALink to="/pricing" size="md" magnetic>
              Explore Packages & Start Free →
            </CTALink>
            <CTALink to="/platform" variant="secondary" size="md">
              Platform Architecture
            </CTALink>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Company() {
  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-white antialiased selection:bg-cyan-500/30 transition-colors duration-300"
      style={{
        fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif"
      }}
    >
      <MarketingNav />
      <main className="relative z-10">
        <CompanySection />
      </main>
      <MarketingFooter />
    </div>
  );
}