// Home page — cinematic layout: black, Space Mono, full-viewport video
// backgrounds, a mouse-scrubbed hero and scramble text. The layout follows the
// supplied "SynapseX" spec; the wording is ITOps Solution's own (taken from the
// previous home page, which still lives at /classic).
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { BrandMark } from "../components/BrandLogo";
import "./home-cinematic.css";

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/";
const VIDEO = {
  hero: `${CDN}hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4`,
  second: `${CDN}hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4`,
  metrics: `${CDN}hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4`,
  technology: `${CDN}hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4`,
  footer: `${CDN}hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4`
};
const NAV = [["Platform", "/platform"], ["Products", "/solutions"], ["Pricing", "/pricing"], ["Company", "/company"], ["Support", "/support"], ["Log in", "/login"]];
const METRICS = [["30s", "Fastest check interval"], ["24/7", "Continuous checks"], ["4", "Check types live"]];
const CAPABILITIES = [
  ["Uptime & Response Time", "Checks every website and API endpoint on a schedule you pick."],
  ["Security Posture Scoring", "Scores every endpoint on its headers, cookies and certificate."],
  ["Incident Tracking", "Opens an incident on repeated failures, resolves it on recovery."],
  ["Multi-Channel Alerting", "Slack, webhooks and email, configured once per organization."]
];
const STEPS = ["Connect", "Monitor", "Know"];
const EASE = [0.215, 0.61, 0.355, 1];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function useMedia(query) {
  const [on, setOn] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const h = () => setOn(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [query]);
  return on;
}

/* ── text animations ── */

/** Entrance reveal: characters resolve left to right out of random glyphs. */
function ScrambleIn({ text, delay = 0, triggered }) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(null);
  useEffect(() => {
    if (!triggered) return undefined;
    if (reduce) { setOut(text); return undefined; }
    let interval;
    const start = setTimeout(() => {
      let frame = 0;
      interval = setInterval(() => {
        frame += 0.5; // 0.5 characters per frame
        const cursor = Math.floor(frame);
        let s = "";
        for (let i = 0; i < text.length; i += 1) {
          if (text[i] === " ") s += " ";
          else if (i < cursor) s += text[i];
          else if (i < cursor + 3) s += rand();
        }
        setOut(s);
        if (cursor >= text.length) clearInterval(interval);
      }, 25);
    }, delay);
    return () => { clearTimeout(start); clearInterval(interval); };
  }, [triggered, text, delay, reduce]);
  return <span aria-hidden>{out || " "}</span>;
}

/** Hover scramble: everything scrambles, then resolves left to right. */
function ScrambleText({ text, isHovered, className }) {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (!isHovered) { setOut(text); return undefined; }
    let frame = 0;
    const interval = setInterval(() => {
      const cursor = Math.floor(frame / 4); // 4 frames per character
      setOut(text.split("").map((ch, i) => (ch === " " || i < cursor ? ch : rand())).join(""));
      frame += 1;
      if (cursor >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [isHovered, text]);
  return <span className={className} aria-label={text}><span aria-hidden>{out}</span></span>;
}
function HoverScramble({ text }) {
  const [hover, setHover] = useState(false);
  return <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}><ScrambleText text={text} isHovered={hover} /></span>;
}

/* ── navbar ── */

function SquashHamburger({ open, small }) {
  const w = small ? 15 : 18, h = small ? 10 : 12, bar = small ? 1.2 : 1.5;
  const mid = (h - bar) / 2;
  const spring = { type: "spring", stiffness: 300, damping: 20 };
  const base = { position: "absolute", left: 0, width: "100%", height: bar, background: "#fff", borderRadius: 2 };
  return <span className="relative block" style={{ width: w, height: h }} aria-hidden>
    <motion.span style={{ ...base, top: 0 }} animate={open ? { rotate: 45, y: mid } : { rotate: 0, y: 0 }} transition={spring} />
    <motion.span style={{ ...base, top: mid }} animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={spring} />
    <motion.span style={{ ...base, top: h - bar }} animate={open ? { rotate: -45, y: -mid } : { rotate: 0, y: 0 }} transition={spring} />
  </span>;
}

const MotionLink = motion.create(Link);
const PILL = { type: "spring", stiffness: 350, damping: 28 };

function Navbar({ visible }) {
  const [open, setOpen] = useState(false);
  const wide = useMedia("(min-width: 1024px)"); // room for every link inside the pill
  const phone = useMedia("(max-width: 639px)"); // the capsule itself holds the first two links
  useEffect(() => {
    if (!open) return undefined;
    const esc = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);
  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const linkCls = "whitespace-nowrap text-white/85 transition-colors hover:text-white";

  return <motion.nav aria-label="Primary" className="fixed inset-x-0 top-0 z-50 h-20" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.8 }}>
    {/* desktop / tablet */}
    <div className="hidden h-full items-center justify-between px-6 sm:flex md:px-8">
      <div className="flex items-center gap-2">
        <motion.div className={`${open ? "hidden md:flex" : "flex"} h-12 rounded-[14px] bg-white/15 backdrop-blur-md`} whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.22)" }} whileTap={{ scale: 0.98 }}>
          <Link to="/" onClick={toTop} className="flex h-full items-center gap-2 px-5" aria-label="ITOps Solution — home">
            <BrandMark size={18} />
            <span className="text-[16px] font-medium tracking-tight text-white">ITOps</span>
          </Link>
        </motion.div>
        <motion.div className="flex h-12 items-center overflow-hidden rounded-[14px] bg-white/15 backdrop-blur-md" initial={false} animate={{ width: open && wide ? 590 : 48 }} transition={PILL}>
          <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className={`grid shrink-0 place-items-center transition-colors ${open && wide ? "ml-1.5 h-9 w-9 rounded-[11px] bg-white/10 hover:bg-white/20" : "h-12 w-12 rounded-[14px]"}`}>
            <SquashHamburger open={open} />
          </button>
          <AnimatePresence>
            {open && wide && <motion.div className="flex items-center gap-[18px] pl-4 pr-5 text-[16px] font-normal" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.25 }}>
              {NAV.map(([label, to]) => <Link key={to} to={to} className={linkCls}><HoverScramble text={label} /></Link>)}
            </motion.div>}
          </AnimatePresence>
        </motion.div>
      </div>
      <GetStarted className="h-12 px-6 text-[16px]" />
    </div>

    {/* mobile */}
    <div className="flex h-full items-center gap-2 px-4 sm:hidden">
      <motion.div className="h-9 shrink-0 overflow-hidden rounded-[10px] bg-white/15 backdrop-blur-md" initial={false} animate={{ width: open ? 0 : "auto", opacity: open ? 0 : 1 }} transition={PILL}>
        <Link to="/" onClick={toTop} className="flex h-full items-center gap-1.5 px-3" aria-label="ITOps Solution — home" tabIndex={open ? -1 : 0}>
          <BrandMark size={14} />
          <span className="text-[13px] font-medium tracking-tight text-white">ITOps</span>
        </Link>
      </motion.div>
      <motion.div className="flex h-9 items-center overflow-hidden rounded-[10px] bg-white/15 backdrop-blur-md" initial={false} animate={{ width: open ? "100%" : 36 }} transition={PILL}>
        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className={`grid shrink-0 place-items-center ${open ? "ml-1 h-7 w-7 rounded-[8px] bg-white/10" : "h-9 w-9"}`}>
          <SquashHamburger open={open} small />
        </button>
        {open && <motion.div className="flex items-center gap-4 pl-3 pr-3 text-[13px]" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
          {NAV.slice(0, 2).map(([label, to]) => <Link key={to} to={to} className={linkCls}>{label}</Link>)}
        </motion.div>}
      </motion.div>
      <GetStarted className="ml-auto h-9 shrink-0 px-3.5 text-[13px]" />
    </div>

    {/* below 1024px the full list drops under the bar */}
    <AnimatePresence>
      {open && !wide && <motion.div className="absolute left-4 right-4 top-[68px] rounded-[14px] bg-white/15 p-2 backdrop-blur-md sm:left-6 sm:right-auto sm:top-[72px] sm:w-64 md:left-8" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        {(phone ? NAV.slice(2) : NAV).map(([label, to]) => <Link key={to} to={to} className="block rounded-[10px] px-4 py-2.5 text-[14px] text-white/85 transition-colors hover:bg-white/10 hover:text-white">{label}</Link>)}
      </motion.div>}
    </AnimatePresence>
  </motion.nav>;
}

function GetStarted({ className }) {
  const [hover, setHover] = useState(false);
  return <MotionLink to="/pricing" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={`flex items-center gap-2 rounded-full bg-white font-normal text-black ${className}`} whileHover={{ scale: 1.03, backgroundColor: "#e2e2e6" }} whileTap={{ scale: 0.97 }}>
    <ScrambleText text="Get Started" isHovered={hover} />
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4.5 11.5l7-7M5.5 4.5h6v6" /></svg>
  </MotionLink>;
}

/* ── video ── */

/** Looping background video that only plays while on screen (and not at all under reduced motion). */
function BgVideo({ src, className = "absolute inset-0 h-full w-full object-cover" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { rootMargin: "200px" });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  return <video ref={ref} src={src} className={className} muted loop playsInline autoPlay={!reduce} preload="metadata" aria-hidden tabIndex={-1} />;
}

/** The hero video never plays: horizontal mouse movement scrubs its timeline. */
function useMouseScrub(ref, sensitivity = 0.8) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    let target = 0, lastX = null, seeking = false;
    v.pause();
    // one seek at a time: the next is issued from `seeked`, so no frame is dropped
    const seek = () => {
      if (!v.duration || Math.abs(v.currentTime - target) < 0.01) return;
      seeking = true;
      v.currentTime = target;
    };
    const onSeeked = () => { seeking = false; seek(); };
    const onMove = e => {
      if (lastX === null) { lastX = e.clientX; return; }
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (!v.duration || window.scrollY > window.innerHeight) return;
      target = Math.max(0, Math.min(v.duration - 0.05, target + (dx / window.innerWidth) * v.duration * sensitivity));
      if (!seeking) seek();
    };
    v.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMove);
    return () => { v.removeEventListener("seeked", onSeeked); window.removeEventListener("mousemove", onMove); };
  }, [ref, sensitivity]);
}

/* ── sections ── */

const H1 = "text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]";

function Hero({ ready }) {
  const video = useRef(null);
  useMouseScrub(video);
  return <section className="relative h-screen h-[100dvh] overflow-hidden bg-[#000]">
    <video ref={video} src={VIDEO.hero} className="absolute inset-0 h-full w-full object-cover" muted playsInline preload="auto" aria-hidden tabIndex={-1} />
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1 }}>
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.05 }} />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 select-none whitespace-nowrap uppercase" style={{ transform: "translate(-50%, calc(-50% + 50px))", fontFamily: '"Anton SC", sans-serif', fontSize: "clamp(120px, 30vw, 521px)", letterSpacing: "-4px", lineHeight: 1, opacity: 0.1, background: "radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Operations</div>

      <div className="relative flex h-full flex-col px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8">
        <div className="flex-1" />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className={H1} aria-label="Secure Your Systems">
              <ScrambleIn text="Secure" delay={200} triggered={ready} /><br />
              <ScrambleIn text="Your Systems" delay={500} triggered={ready} />
            </h1>
            <motion.p className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]" initial={{ opacity: 0, y: 25 }} animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}>
              One enterprise dashboard for infrastructure, security, and everything in between. Response times, service health, incidents, and server metrics stream into one real-time view.
            </motion.p>
          </div>
          <p className={`${H1} text-left md:text-right`} aria-label="One Dashboard">
            <ScrambleIn text="One" delay={700} triggered={ready} /><br />
            <ScrambleIn text="Dashboard" delay={1000} triggered={ready} />
          </p>
        </div>
      </div>
    </motion.div>
  </section>;
}

function Cinematic() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const y = useTransform(smooth, [0, 1], [60, -120]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${y}px) translateZ(15px)`;
  return <section ref={ref} id="about" className="relative flex h-screen h-[100dvh] items-center justify-center overflow-hidden bg-[#000]">
    <BgVideo src={VIDEO.second} />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[180px]" style={{ background: "linear-gradient(to bottom, #010103, transparent)" }} />
    <div className="relative z-10 mx-auto max-w-5xl" style={{ perspective: "400px" }}>
      <motion.p className="select-none px-6 text-center font-sans text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]" style={reduce ? undefined : { transform, opacity }}>
        A monitoring platform built for the people who get paged. ITOps checks every endpoint as often as every 30 seconds. Failures open incidents with the exact cause attached. Slack, webhook, and email alerts fire immediately. Recovery closes the incident on its own.
      </motion.p>
    </div>
  </section>;
}

function Metrics() {
  return <section id="metrics" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000] px-6 pb-32 pt-32">
    <BgVideo src={VIDEO.metrics} />
    <div className="relative z-10 mx-auto w-full max-w-6xl">
      <motion.p className="mb-20 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.2 }}>Platform Metrics</motion.p>
      <dl className="grid grid-cols-1 gap-16 text-center md:grid-cols-3 md:gap-8">
        {METRICS.map(([value, label], i) => <motion.div key={label} className="flex flex-col-reverse" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.8, delay: i * 0.15 }}>
          <dt className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">{label}</dt>
          <dd className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white">{value}</dd>
        </motion.div>)}
      </dl>
    </div>
  </section>;
}

function Technology() {
  const inView = { viewport: { once: true, amount: 0.3 } };
  return <section className="relative h-screen h-[100dvh] overflow-hidden bg-[#000]">
    <BgVideo src={VIDEO.technology} />
    <div className="relative z-10 flex h-full flex-col px-8 py-12 sm:px-12 sm:py-16 md:px-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <motion.h2 className="text-[clamp(36px,8vw,72px)] font-light leading-[0.95] tracking-[-0.03em] text-white" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} {...inView} transition={{ duration: 1 }}>Know Before<br />Your Customers Do</motion.h2>
        <motion.p className="max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-[15px] md:pt-2 md:text-right" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} {...inView} transition={{ duration: 1, delay: 0.2 }}>
          Every capability below is live in the product today — no mock screenshots, no “coming soon” asterisks.
        </motion.p>
      </div>
      <div className="flex-1" />
      <motion.ul className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} {...inView} transition={{ duration: 1, delay: 0.3 }}>
        {CAPABILITIES.map(([title, desc], i) => <motion.li key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}>
          <h3 className="mb-2 text-[14px] font-normal text-white sm:text-[16px]">{title}</h3>
          <p className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">{desc}</p>
        </motion.li>)}
      </motion.ul>
    </div>
  </section>;
}

function Architecture() {
  return <section className="flex min-h-screen items-center justify-center bg-[#000] px-6 py-32">
    <div className="mx-auto w-full max-w-3xl text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1 }}>
        <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">How it works</p>
        <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">Connect. Monitor. Know.</h2>
        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">Connect your infrastructure once. ITOps continuously checks its health, security, and availability — and alerts you before your customers notice.</p>
      </motion.div>
      <motion.ol className="mt-20 flex flex-col items-center gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.2, delay: 0.4 }}>
        {STEPS.map((step, i) => <li key={step} className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/10 px-6">
          <span className="text-[12px] uppercase tracking-[0.15em] text-white/30">Step {i + 1}</span>
          <span className="text-[16px] font-light text-white sm:text-[18px]">{step}</span>
        </li>)}
      </motion.ol>
    </div>
  </section>;
}

function Footer() {
  return <footer className="overflow-hidden bg-[#000]">
    <div className="flex min-h-[400px] flex-col md:flex-row">
      <div className="relative h-[300px] md:h-auto md:w-1/2">
        <BgVideo src={VIDEO.footer} />
      </div>
      <div className="flex flex-col justify-between p-10 sm:p-16 md:w-1/2">
        <div>
          <div className="mb-8 flex items-center gap-2 text-white/70">
            <BrandMark size={18} />
            <span className="text-[15px] font-medium tracking-tight">ITOps Solution</span>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">The company behind ITOps Monitor, Kada Nigrani, and CyberSachet — real-time monitoring products for infrastructure, servers, websites, and security.</p>
          <nav aria-label="Footer" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-white/40">
            {[...NAV.slice(0, 5), ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([label, to]) => <Link key={to} to={to} className="transition-colors hover:text-white">{label}</Link>)}
          </nav>
        </div>
        <p className="mt-12 text-[12px] text-white/25">© {new Date().getFullYear()} ITOps Solution. All rights reserved.</p>
      </div>
    </div>
  </footer>;
}

/** True once the page is actually visible: after the site's intro overlay (if any) has gone. */
function useEntrance(delay = 800) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer;
    const poll = setInterval(() => {
      const pre = document.getElementById("itops-preloader");
      if (pre && !pre.classList.contains("is-done")) return;
      clearInterval(poll);
      timer = setTimeout(() => setReady(true), delay);
    }, 100);
    return () => { clearInterval(poll); clearTimeout(timer); };
  }, [delay]);
  return ready;
}

export default function HomeCinematic() {
  const entranceComplete = useEntrance(800);
  // the page is black in either theme, including the area behind overscroll
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "#000";
    return () => { document.body.style.background = prev; };
  }, []);
  return <div className="sx" style={{ fontFamily: '"Space Mono", monospace' }}>
    <Navbar visible={entranceComplete} />
    <main>
      <Hero ready={entranceComplete} />
      <Cinematic />
      <Metrics />
      <Technology />
      <Architecture />
    </main>
    <Footer />
  </div>;
}
