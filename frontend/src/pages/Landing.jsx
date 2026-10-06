import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { Reveal } from "../components/Animated";
import { CTALink } from "../components/Button";
import { DashboardMockup, LiveActivityFeed, TechMarquee } from "../components/ProductVisuals";
import { InfrastructureTopology } from "../components/InfrastructureTopology";
import { HowItWorksFlow } from "../components/HowItWorksFlow";
import { TeamsShowcase } from "../components/TeamsShowcase";
import { ClosingCTA, DefenceLayers, SectorShowcase } from "../components/HomeSections";
import { fetchContentItems } from "../api/endpoints";
import { useTheme } from "../context/ThemeContext";
const EASE = [0.16, 1, 0.3, 1];

const NODES = [{
  x: 15,
  y: 22
}, {
  x: 42,
  y: 14
}, {
  x: 70,
  y: 26
}, {
  x: 24,
  y: 52
}, {
  x: 55,
  y: 58
}, {
  x: 82,
  y: 46
}, {
  x: 46,
  y: 78
}, {
  x: 78,
  y: 76
}];
const EDGES = [[0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [4, 6], [5, 7], [6, 7]];
function NetworkBackground() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const gridRgba = isLight ? "rgba(15,23,42,0.07)" : "rgba(255,255,255,0.06)";
  const lineStroke = isLight ? "rgba(15,23,42,0.16)" : "rgba(255,255,255,0.14)";
  return <div className="absolute inset-0 h-full w-full">
    <div className="absolute inset-0 opacity-40" style={{
      backgroundImage: `repeating-linear-gradient(0deg, ${gridRgba} 0px, ${gridRgba} 1px, transparent 1px, transparent 56px), repeating-linear-gradient(90deg, ${gridRgba} 0px, ${gridRgba} 1px, transparent 1px, transparent 56px)`
    }} />
    <div className="absolute inset-x-0 h-40 animate-[scan_7s_linear_infinite] bg-gradient-to-b from-transparent via-white/[0.06] light:via-slate-900/[0.05] to-transparent" />
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {EDGES.map(([a, b], i) => <motion.line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} stroke={lineStroke} strokeWidth={0.15} initial={{
        pathLength: 0,
        opacity: 0
      }} animate={{
        pathLength: 1,
        opacity: 1
      }} transition={{
        duration: 1.6,
        delay: 1 + i * 0.1,
        ease: EASE
      }} />)}
    </svg>
    {NODES.map((node, i) => <motion.div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-white light:bg-slate-900 shadow-[0_0_0_6px_rgba(255,255,255,0.06)] light:shadow-[0_0_0_6px_rgba(15,23,42,0.06)]" style={{
      left: `${node.x}%`,
      top: `${node.y}%`,
      x: "-50%",
      y: "-50%"
    }} initial={{
      opacity: 0,
      scale: 0
    }} animate={{
      opacity: [0.4, 1, 0.4],
      scale: [1, 1.7, 1]
    }} transition={{
      opacity: {
        duration: 2.8,
        repeat: Infinity,
        delay: 1.4 + i * 0.2,
        ease: "easeInOut"
      },
      scale: {
        duration: 2.8,
        repeat: Infinity,
        delay: 1.4 + i * 0.2,
        ease: "easeInOut"
      }
    }} />)}
  </div>;
}
export default function Landing() {
  const {
    data: platformPreview,
    isLoading: platformPreviewLoading,
    isError: platformPreviewError
  } = useQuery({
    queryKey: ["content", "landing", "platform_preview"],
    queryFn: () => fetchContentItems("landing", "platform_preview")
  });
  return <div className="bg-black light:bg-slate-50 text-white light:text-slate-900 antialiased" style={{
    fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif"
  }}>
    <MarketingNav />

    {/* ── Signature hero: the staggered wordmark, restored and elevated ──
          Absolute/percentage-positioned layered typography only holds up
          reliably at wider aspect ratios (tablet/desktop) — on short phone
          viewports (e.g. iPhone SE at 375×667) the percentage math leaves
          the "Systems." headline and the stat row nearly touching. Below
          md we render a normal-flow stacked layout instead, so spacing is
          governed by real element heights rather than viewport-relative
          guesses. */}
    <section id="hero" className="relative hidden h-[100svh] min-h-[640px] w-full overflow-hidden bg-black light:bg-slate-50 md:block" aria-label="Secure Your Systems — ITOps Solution">
      <NetworkBackground />
      <div className="enterprise-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-[120px] gpu-layer" />
      <div className="pointer-events-none absolute -right-32 bottom-10 h-[440px] w-[440px] rounded-full bg-cyan-400/10 blur-[120px] gpu-layer" />

      <div className="relative z-10 h-full w-full">
        <motion.h1 className="absolute left-4 top-[15%] text-[14vw] font-semibold leading-[0.95] tracking-[-0.04em] md:left-10 md:text-[12.5vw]" initial={{
          y: 48,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.9,
          delay: 0.25,
          ease: EASE
        }}>
          Secure
        </motion.h1>
        <motion.h1 className="absolute right-4 top-[35%] text-[14vw] font-semibold leading-[0.95] tracking-[-0.04em] md:right-10 md:text-[12.5vw]" initial={{
          y: 48,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.9,
          delay: 0.42,
          ease: EASE
        }}>
          Your
        </motion.h1>
        <motion.h1 className="absolute left-[10%] top-[55%] text-[14vw] font-semibold leading-[0.95] tracking-[-0.04em] md:left-[22%] md:text-[12.5vw]" initial={{
          y: 48,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.9,
          delay: 0.58,
          ease: EASE
        }}>
          Systems<span className="text-gradient">.</span>
        </motion.h1>

        {/* side blurb, linked to the wordmark */}
        <motion.div className="absolute left-6 top-[45%] max-w-[250px] md:left-10" initial={{
          y: 16,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 0.85,
          ease: EASE
        }}>
          <div className="mb-2 hidden items-center gap-2 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
            <span className="h-px w-20 bg-gradient-to-r from-white/50 to-transparent" />
          </div>
          <p className="text-[15px] leading-snug text-white/85 light:text-slate-700">
            One enterprise dashboard for infrastructure, security, and everything in between.
          </p>
        </motion.div>

        {/* corner stats with connector lines — every number is real */}
        <motion.div className="absolute right-6 top-[13%] md:right-16" initial={{
          y: 16,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 1.0,
          ease: EASE
        }}>
          <div className="flex items-center justify-end gap-3">
            <div className="hidden h-px w-24 rotate-[20deg] bg-gradient-to-r from-transparent to-white/50 md:block" />
            <span className="text-4xl font-semibold tracking-tight md:text-5xl">30s</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/60 light:text-slate-500 md:text-sm">Fastest check interval</p>
        </motion.div>

        <motion.div className="absolute bottom-[30%] left-6 md:bottom-[16%] md:left-16" initial={{
          y: 16,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 1.12,
          ease: EASE
        }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-semibold tracking-tight md:text-5xl">24/7</span>
            <div className="hidden h-px w-24 rotate-[-20deg] bg-gradient-to-l from-transparent to-white/50 md:block" />
          </div>
          <p className="mt-1 text-xs text-white/60 light:text-slate-500 md:text-sm">Continuous checks</p>
        </motion.div>

        <motion.div className="absolute bottom-[30%] right-6 md:bottom-[16%] md:right-16" initial={{
          y: 16,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 1.24,
          ease: EASE
        }}>
          <div className="flex items-center gap-3">
            <div className="hidden h-px w-24 rotate-[-20deg] bg-gradient-to-r from-transparent to-white/50 md:block" />
            <span className="text-4xl font-semibold tracking-tight md:text-5xl">4</span>
          </div>
          <p className="mt-1 text-right text-xs text-white/60 light:text-slate-500 md:text-sm">Check types live</p>
        </motion.div>

        {/* action row — what a visitor actually needs next */}
        <motion.div className="absolute bottom-[5%] left-1/2 flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-3 px-6" initial={{
          y: 20,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 1.35,
          ease: EASE
        }}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CTALink to="/pricing" size="lg" magnetic>
              Start free <span aria-hidden>→</span>
            </CTALink>
            <CTALink to="/platform" variant="secondary" size="lg">
              Explore the platform
            </CTALink>
          </div>
          <p className="text-xs text-white/40 light:text-slate-500">Free Starter plan · No credit card required</p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32 bg-gradient-to-b from-transparent to-black light:to-white" />
    </section>

    {/* ── Mobile hero: the same staggered wordmark and stats as the desktop hero, in normal document
          flow so nothing can overlap. It fills the screen: the type scales with the viewport's width
          and height, and any spare height opens up between the wordmark and the actions. ── */}
    <section id="hero-mobile" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-black light:bg-slate-50 px-6 pb-[max(1.25rem,3svh)] pt-24 md:hidden" aria-label="Secure Your Systems — ITOps Solution">
      <NetworkBackground />
      <div className="enterprise-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-[100px]" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="min-h-[1svh] flex-[1]" />

        {/* Staggered wordmark; the 30s stat sits in the space beside "Your", as on desktop */}
        <div className="relative" style={{ fontSize: "min(20vw, 11.5svh, 150px)" }}>
          <h1 className="font-semibold leading-[0.95] tracking-[-0.04em]">
            {[["Secure", ""], ["Your", "text-right"], ["Systems", "pl-[0.18em]"]].map(([word, align], i) => (
              <motion.span
                key={word}
                className={`block ${align}`}
                initial={{ y: 32, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.14, ease: EASE }}
              >
                {word}
                {i === 2 && <span className="text-gradient">.</span>}
              </motion.span>
            ))}
          </h1>
          <motion.div
            className="absolute left-0 top-[36%]"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[26px] font-semibold leading-none tracking-tight">30s</span>
              <span className="h-px w-8 rotate-[20deg] bg-gradient-to-r from-transparent to-white/50 light:to-slate-400" />
            </div>
            <p className="mt-1 text-[11px] leading-tight text-white/60 light:text-slate-500">
              Fastest check
              <br />
              interval
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-[clamp(14px,2.6svh,28px)] max-w-[320px]"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 [animation:pulse-glow_1.6s_ease-in-out_infinite]" />
            <span className="h-px w-20 bg-gradient-to-r from-white/50 to-transparent light:from-slate-400" />
          </div>
          <p className="text-[15px] leading-snug text-white/85 light:text-slate-700">
            One enterprise dashboard for infrastructure, security, and everything in between.
          </p>
        </motion.div>

        <div className="min-h-[clamp(16px,3svh,40px)] flex-[2]" />

        {/* Corner stats with connector lines — every number is real */}
        <motion.div
          className="flex items-end justify-between gap-4"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
        >
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-semibold tracking-tight">24/7</span>
              <span className="h-px w-10 rotate-[-20deg] bg-gradient-to-l from-transparent to-white/50 light:to-slate-400" />
            </div>
            <p className="mt-1 text-xs text-white/60 light:text-slate-500">Continuous checks</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <span className="h-px w-10 rotate-[-20deg] bg-gradient-to-r from-transparent to-white/50 light:to-slate-400" />
              <span className="text-3xl font-semibold tracking-tight">4</span>
            </div>
            <p className="mt-1 text-xs text-white/60 light:text-slate-500">Check types live</p>
          </div>
        </motion.div>

        {/* action row — what a visitor actually needs next */}
        <motion.div
          className="mt-[clamp(16px,3svh,28px)] flex flex-col items-center gap-3"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.0, ease: EASE }}
        >
          <CTALink to="/pricing" size="lg" magnetic className="w-full justify-center [@media(max-height:700px)]:py-3">
            Start free <span aria-hidden>→</span>
          </CTALink>
          <CTALink to="/platform" variant="secondary" size="lg" className="w-full justify-center [@media(max-height:700px)]:py-3">
            Explore the platform
          </CTALink>
          <p className="text-xs text-white/40 light:text-slate-500">Free Starter plan · No credit card required</p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-black light:to-white" />
    </section>

    {/* ── Product proof: the live dashboard, right below the promise ── */}
    <section className="relative overflow-hidden border-t border-white/10 light:border-slate-900/8 bg-neutral-950/60 light:bg-white px-6 pb-36 pt-24 md:px-10">
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.08] blur-[140px] gpu-layer" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-[450px] w-[450px] rounded-full bg-blue-500/[0.07] blur-[140px] gpu-layer" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.25fr]">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-mono text-cyan-300 light:text-cyan-700 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 [animation:pulse-glow_1.4s_ease-in-out_infinite]" />
            LIVE TELEMETRY // REAL COMMAND DECK
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl leading-[1.1]">
            The dashboard your on-call team will <span className="text-gradient">actually watch.</span>
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65 light:text-slate-600">
            Response times, service health, incidents, and server metrics stream into one real-time view. Checks run
            from every 30 seconds; failures trigger automated root-cause analysis with the exact cause attached and
            alert your channels — then auto-resolve on recovery.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-white/60 light:text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
              <span className="text-emerald-400">✓</span> 30s Check Interval
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
              <span className="text-cyan-400">✓</span> Autonomous RCA
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
              <span className="text-violet-400">✓</span> Auto-Healing Runbooks
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <CTALink to="/solutions" size="md" magnetic>
              Explore all products <span aria-hidden>→</span>
            </CTALink>
            <CTALink to="/pricing" variant="secondary" size="md">
              Start Free (1 Host + Checks)
            </CTALink>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="relative">
            <div className="animate-float">
              <DashboardMockup />
            </div>
            <div className="mt-4 sm:absolute sm:-bottom-12 sm:-left-6 sm:mt-0 sm:w-72 z-20">
              <LiveActivityFeed />
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* technology marquee */}
    <section className="border-y border-white/10 light:border-slate-900/8 bg-neutral-950/60 light:bg-white py-8">
      <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/35 light:text-slate-400">
        One agent, one dashboard — your entire stack
      </p>
      <TechMarquee />
    </section>

    {/* No `overflow-hidden` here: the platform orbit pins its stage with
        `position: sticky`, which an overflowing ancestor would break. */}
    <section id="platform" className="relative w-full pb-16 md:pb-24">
      <div className="relative w-full">
        <InfrastructureTopology items={platformPreview} />

        <div className="mt-8 text-center">
          <Link to="/platform" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors">
            <span>See the full platform roadmap</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>

    {/* Every layer the platform watches, led by the three flagship products. */}
    <div className="content-auto">
      <DefenceLayers />
    </div>

    <HowItWorksFlow />

    {/* Who it's for: one pinned slide per team, each with its own product scene */}
    <TeamsShowcase />

    {/* Who it's for, by industry */}
    <div className="content-auto">
      <SectorShowcase />
    </div>

    <div className="content-auto">
      <ClosingCTA />
    </div>

    <div className="content-auto">
      <MarketingFooter />
    </div>

    <style>{`
        @keyframes scan {
          0% { transform: translateY(-160px); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
  </div>;
}