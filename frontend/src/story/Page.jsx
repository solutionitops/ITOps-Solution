// Building blocks shared by every redesigned page. The system is constant —
// type, status marks, chapters, capability lists — while each page supplies
// its own story and its own visual.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView, useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { InView, Kicker, Signal, Status } from "./World";

/* ── data ── */

/** One product's published record: status, capabilities, workflow, audience. */
export function useSolution(slug) {
  const q = useQuery({
    queryKey: ["content", "solutions", "solutions"],
    queryFn: () => fetchContentItems("solutions", "solutions"),
    staleTime: 60_000
  });
  const item = q.data?.find(s => s.itemKey === slug);
  const md = item?.metadata ?? {};
  const caps = Array.isArray(md.capabilities) ? md.capabilities : [];
  return {
    isLoading: q.isLoading,
    isError: q.isError,
    all: q.data ?? [],
    item,
    status: item?.status === "live" ? "live" : item ? "roadmap" : null,
    live: caps.filter(c => c.status === "live"),
    roadmap: caps.filter(c => c.status !== "live"),
    workflow: Array.isArray(md.workflow) ? md.workflow : [],
    whoFor: Array.isArray(md.whoFor) ? md.whoFor : [],
    tech: Array.isArray(md.tech) ? md.tech : [],
    waitlistProduct: md.waitlistProduct
  };
}
export function usePlatformModules() {
  return useQuery({
    queryKey: ["content", "platform", "modules"],
    queryFn: () => fetchContentItems("platform", "modules"),
    staleTime: 60_000
  });
}

/* ── hero ── */

/** The page's own story spine: REQUEST → OBSERVE → DETECT → … */
export function Chain({ steps, tone }) {
  return <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="This page's story">
    {steps.map((s, i) => <li key={s} className="flex items-center gap-3">
      <span className="s-mono !text-[10.5px]" style={{ color: i === steps.length - 1 ? tone ?? "var(--s-cyan)" : "var(--s-dim)" }}>{s}</span>
      {i < steps.length - 1 && <span aria-hidden className="text-[var(--s-faint)]">→</span>}
    </li>)}
  </ol>;
}

export function PageHero({ kicker, kickerTone, title, lead, status, statusLabel, chain, chainTone, actions, visual, note = "Illustration · sample data", wide = false }) {
  return <section className="relative overflow-hidden px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
    <div className="s-grid" />
    <InView className={`relative mx-auto grid max-w-7xl items-center gap-12 ${visual ? (wide ? "lg:grid-cols-[1fr_1.15fr]" : "lg:grid-cols-[1.05fr_1fr]") : ""} lg:gap-16`} amount={0.1}>
      <div>
        <div className="s-rise flex flex-wrap items-center gap-x-5 gap-y-2">
          <Kicker tone={kickerTone}>{kicker}</Kicker>
          {status && <Status kind={status}>{statusLabel}</Status>}
        </div>
        <h1 className="s-display s-rise mt-6 !text-[clamp(2.3rem,5.2vw,4.75rem)]" style={{ "--i": 1 }}>{title}</h1>
        {lead && <p className="s-body s-rise mt-7 max-w-xl" style={{ "--i": 2 }}>{lead}</p>}
        {chain && <div className="s-rise mt-8" style={{ "--i": 3 }}><Chain steps={chain} tone={chainTone} /></div>}
        {actions && <div className="s-rise mt-9 flex flex-wrap items-center gap-3" style={{ "--i": 4 }}>{actions}</div>}
      </div>
      {visual && <div className="s-rise min-w-0" style={{ "--i": 2 }}>
        {visual}
        {note && <p className="s-mono mt-3 text-right !text-[9px]">{note}</p>}
      </div>}
    </InView>
  </section>;
}

/* ── sections ── */

export function Section({ id, kicker, kickerTone, title, lead, children, tone = "plain", className = "" }) {
  return <section id={id} className={`relative px-6 py-20 md:px-10 md:py-28 ${tone === "alt" ? "border-y border-[var(--s-line)] bg-[var(--s-bg2)]" : ""} ${className}`}>
    <InView className="mx-auto max-w-7xl" amount={0.08}>
      {(kicker || title) && <div className="max-w-3xl">
        {kicker && <div className="s-rise"><Kicker tone={kickerTone}>{kicker}</Kicker></div>}
        {title && <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.9rem,4.2vw,3.5rem)]" style={{ "--i": 1 }}>{title}</h2>}
        {lead && <p className="s-body s-rise mt-5 max-w-xl" style={{ "--i": 2 }}>{lead}</p>}
      </div>}
      <div className={kicker || title ? "mt-12 md:mt-14" : ""}>{children}</div>
    </InView>
  </section>;
}

/** A numbered beat of the page's story: number, statement, body, optional visual. */
export function Chapter({ n, title, children, visual, i = 0 }) {
  return <div className="s-rise s-row grid-cols-1 md:grid-cols-[64px_1fr_1fr] md:gap-x-12" style={{ "--i": Math.min(i, 6) }}>
    <span className="s-mono">{n}</span>
    <div>
      <h3 className="s-h3">{title}</h3>
      <div className="s-body mt-3 max-w-lg space-y-3">{children}</div>
    </div>
    <div className="min-w-0 md:pt-1">{visual}</div>
  </div>;
}

/** Live and roadmap capabilities side by side — status is never ambiguous. */
export function Capabilities({ live, roadmap, liveTitle = "Live today", roadmapTitle = "On the roadmap" }) {
  if (!live.length && !roadmap.length) return null;
  const List = ({ items, kind }) => <ul>
    {items.map(c => <li key={c.title} className="s-row grid-cols-[1fr_auto] !py-4">
      <span className="text-[15px] font-medium tracking-tight" style={kind === "roadmap" ? { color: "var(--s-dim)" } : undefined}>{c.title}</span>
      <Status kind={kind} />
      {c.detail && <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{c.detail}</span>}
    </li>)}
  </ul>;
  return <div className={`grid gap-12 ${live.length && roadmap.length ? "lg:grid-cols-2" : ""} lg:gap-16`}>
    {live.length > 0 && <div className="s-rise">
      <p className="s-mono mb-4" style={{ color: "var(--s-green)" }}>{liveTitle} · {String(live.length).padStart(2, "0")}</p>
      <List items={live} kind="live" />
    </div>}
    {roadmap.length > 0 && <div className="s-rise" style={{ "--i": 2 }}>
      <p className="s-mono mb-4" style={{ color: "var(--s-gray)" }}>{roadmapTitle} · {String(roadmap.length).padStart(2, "0")}</p>
      <List items={roadmap} kind="roadmap" />
      <p className="s-mono mt-4 !text-[9.5px]">Not available yet. No dates are promised.</p>
    </div>}
  </div>;
}

export function HowItWorks({ steps }) {
  if (!steps.length) return null;
  return <ol className="grid gap-x-10 gap-y-2 md:grid-cols-2">
    {steps.map((s, i) => <li key={s.title} className="s-rise s-row grid-cols-[44px_1fr] !border-b-0" style={{ "--i": Math.min(i, 6) }}>
      <span className="s-mono" style={{ color: "var(--s-cyan)" }}>{String(i + 1).padStart(2, "0")}</span>
      <div>
        <p className="text-lg font-medium tracking-tight">{s.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--s-dim)]">{s.detail}</p>
      </div>
    </li>)}
  </ol>;
}

export function ChipList({ items, tone = "plain" }) {
  return <ul className="flex flex-wrap gap-2">
    {items.map(t => <li key={t} className="s-chip !whitespace-normal" data-tone={tone}>{t}</li>)}
  </ul>;
}
export function Bullets({ items }) {
  return <ul className="grid gap-x-10 md:grid-cols-2">
    {items.map((t, i) => <li key={t} className="s-rise s-row grid-cols-[28px_1fr] !border-b-0 !py-4" style={{ "--i": Math.min(i, 6) }}>
      <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--s-cyan)]" />
      <span className="text-[15px] leading-relaxed text-[var(--s-dim)]">{t}</span>
    </li>)}
  </ul>;
}

/* ── endings ── */

export function PageCTA({ title, lead, children }) {
  return <section className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32">
    <div className="s-grid" />
    <InView className="relative mx-auto max-w-4xl text-center">
      <div className="s-rise"><Signal /></div>
      <h2 className="s-display s-rise mt-8 !text-[clamp(2.2rem,5.6vw,4.75rem)]" style={{ "--i": 1 }}>{title}</h2>
      {lead && <p className="s-body s-rise mx-auto mt-6 max-w-lg" style={{ "--i": 2 }}>{lead}</p>}
      <div className="s-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={{ "--i": 3 }}>{children}</div>
    </InView>
  </section>;
}
export function Btn({ to, kind = "primary", children, href }) {
  const inner = <>{children} <span aria-hidden>→</span></>;
  return href ? <a href={href} className="s-btn" data-kind={kind}>{inner}</a> : <Link to={to} className="s-btn" data-kind={kind}>{inner}</Link>;
}

/**
 * Continuity between pages: where this story ends, the next one begins.
 * `from` is the last thing on this page; `label` names the next page.
 */
export function NextPage({ from, label, to }) {
  return <Link to={to} className="group block border-t border-[var(--s-line)] px-6 py-10 transition-colors hover:bg-[var(--s-bg2)] md:px-10">
    <span className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
      <span className="flex items-center gap-4">
        <span className="s-chip" data-tone="plain">{from}</span>
        <span aria-hidden className="h-px w-10 bg-[var(--s-line2)] transition-all group-hover:w-16 group-hover:bg-[var(--s-cyan)]" />
        <span className="s-mono">Next</span>
      </span>
      <span className="s-h3 flex items-center gap-4 transition-colors group-hover:text-[var(--s-cyan)]">{label} <span aria-hidden>→</span></span>
    </span>
  </Link>;
}

/* ── states ── */

export function PageLoading() {
  return <div className="grid min-h-[70svh] place-items-center px-6 pt-32">
    <p className="flex items-center gap-4"><Signal /><span className="s-mono">Loading signal<span className="animate-pulse">_</span></span></p>
  </div>;
}
export function PageError({ message = "This page couldn't be loaded.", onRetry }) {
  return <div className="grid min-h-[70svh] place-items-center px-6 pt-32 text-center">
    <div>
      <p className="s-mono" style={{ color: "var(--s-amber)" }}>Request.failed</p>
      <p className="s-h3 mt-4">{message}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {onRetry && <button type="button" onClick={onRetry} className="s-btn" data-kind="primary">Try again</button>}
        <Link to="/solutions" className="s-btn" data-kind="ghost">All products <span aria-hidden>→</span></Link>
      </div>
    </div>
  </div>;
}

/* ── accordion ── */
export function Accordion({ items, idPrefix = "acc" }) {
  const [open, setOpen] = useState(null);
  return <div>
    {items.map((it, i) => {
      const on = open === i;
      return <div key={it.q} className="s-acc-item">
        <h3>
          <button type="button" className="s-acc-btn" aria-expanded={on} aria-controls={`${idPrefix}-${i}`} onClick={() => setOpen(on ? null : i)}>
            <span>
              {it.tag && <span className="s-mono mb-1.5 block !text-[9.5px]">{it.tag}</span>}
              <span className="text-lg font-medium tracking-tight md:text-xl">{it.q}</span>
            </span>
            <span aria-hidden className="plus text-xl leading-none">+</span>
          </button>
        </h3>
        <div id={`${idPrefix}-${i}`} className="s-acc-panel" data-open={on ? "1" : "0"} inert={!on}>
          <div><p className="s-body max-w-3xl pb-6">{it.a}</p></div>
        </div>
      </div>;
    })}
  </div>;
}

/* ── a number that counts up once, when it scrolls into view ── */
export function CountUp({ to, pad = 0, suffix = "" }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return undefined;
    if (reduce) { setN(to); return undefined; }
    const t0 = performance.now(), dur = 900;
    let raf;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur);
      setN(Math.round(to * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, reduce]);
  return <span ref={ref} className="tabular-nums">{String(n).padStart(pad, "0")}{suffix}</span>;
}
