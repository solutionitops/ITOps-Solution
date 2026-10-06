// Products: an ecosystem you can see, not a list. A layered hero built from
// product interface fragments, then one section per product — each with its own
// composition and something to interact with — and a searchable index.
//
// Every product's name, status, description and capabilities are read from the
// published product records; nothing about what a product does is written here.
// Interface fragments use sample data and are labelled as illustrations.
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import { Flow, InView, Kicker, Signal, Status, useIsMobile } from "../story/World";
import { Btn, PageError, PageLoading, useSolution } from "../story/Page";
import { Key, SitePage, usePageMeta } from "../story/Shell";
import { AgentInstall, AlertRouting, Challenge, Inspection, LearningJourney, NetworkPath, ServerTelemetry, Sparkline } from "../story/visuals";
import { PlainSteps, ProductGlance, Shot } from "../story/ProductPictures";

const NOTE = <p className="s-mono mt-3 text-right !text-[9px]">Illustration · sample data</p>;
const linkFor = p => p.href ?? `/solutions/${p.itemKey}`;

/* ── hero: three product surfaces, layered ── */
function HeroComposition() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const onMove = e => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    ref.current.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const reset = () => { ref.current?.style.setProperty("--px", 0); ref.current?.style.setProperty("--py", 0); };
  const rows = [["api.example.com", "API", "184 ms"], ["app.example.com", "Website", "212 ms"], ["example.com", "DNS", "Resolved"], ["core-gateway:443", "TCP", "12 ms"]];
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={reset} className="s-layers mx-auto h-[380px] w-full max-w-[560px] sm:h-[440px]" role="img" aria-label="Three product interfaces layered together: a monitor list, a server's live metrics and a security score">
    {/* monitors */}
    <div className="s-layer s-panel absolute left-0 top-6 w-[78%] overflow-hidden" style={{ "--depth": -10 }}>
      <div className="flex items-center justify-between border-b border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
        <span className="s-mono !text-[9.5px]">Monitors</span>
        <span className="s-status" data-kind="live">All healthy</span>
      </div>
      <div className="px-4 py-1.5">
        {rows.map(([n, t, v]) => <div key={n} className="cp-row !py-2.5 text-[12.5px]">
          <span className="cp-dot" /><span className="truncate">{n}</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--s-faint)]">{t}</span>
          <span className="cp-num">{v}</span>
        </div>)}
      </div>
    </div>
    {/* server */}
    <div className="s-layer s-panel absolute right-0 top-[38%] w-[56%] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" style={{ "--depth": 16 }}>
      <div className="flex items-baseline justify-between">
        <span className="s-mono !text-[9.5px]">prod-web-01 · CPU</span>
        <span className="text-lg font-semibold tabular-nums">42%</span>
      </div>
      <Sparkline seed={2} className="mt-2 h-12 w-full" />
      <p className="mt-3 flex justify-between font-mono text-[10px] text-[var(--s-dim)]"><span>MEM 61%</span><span>DISK 72%</span><span>UP 18d</span></p>
    </div>
    {/* security score */}
    <div className="s-layer s-panel absolute bottom-2 left-[8%] flex w-[46%] items-center gap-4 p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" style={{ "--depth": 28 }}>
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--s-line)" strokeWidth="6" />
          <circle cx="36" cy="36" r="30" fill="none" stroke="var(--s-violet)" strokeWidth="6" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="26" />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums">86</span>
      </div>
      <div className="min-w-0">
        <p className="s-mono !text-[9.5px]">Security score</p>
        <p className="mt-1 truncate text-sm text-[var(--s-dim)]">app.example.com</p>
      </div>
    </div>
  </div>;
}

/* ── interactive fragments ── */

/** Website & API: switch between the four live check types. */
const CHECKS = {
  Uptime: { ask: "GET https://app.example.com", lines: [["status", "200 OK", "ok"], ["time", "184 ms"], ["redirects", "http → https → /home (2 hops)"]], verdict: "Up" },
  Keyword: { ask: 'expect text "Sign in" on /login', lines: [["status", "200 OK", "ok"], ["keyword", "found", "ok"], ["time", "201 ms"]], verdict: "Up" },
  "Status code": { ask: "expect 401 on /api/private", lines: [["status", "401 Unauthorized", "ok"], ["match", "as expected", "ok"], ["time", "96 ms"]], verdict: "Up" },
  DNS: { ask: "A record · app.example.com", lines: [["answer", "203.0.113.10"], ["change", "none since last check", "ok"], ["resolver", "resolved"]], verdict: "Unchanged" }
};
function CheckSwitcher() {
  const [type, setType] = useState("Uptime");
  const c = CHECKS[type];
  return <div>
    <div className="s-seg" role="group" aria-label="Check type">
      {Object.keys(CHECKS).map(k => <button key={k} type="button" aria-pressed={type === k} onClick={() => setType(k)}>{k}</button>)}
    </div>
    <div className="s-panel mt-4 overflow-hidden" aria-live="polite">
      <div className="flex items-center gap-2 border-b border-[var(--s-line)] px-4 py-3 font-mono text-[11.5px] text-[var(--s-dim)]">
        <span style={{ color: "var(--s-cyan)" }}>›</span>{c.ask}
      </div>
      <div key={type} className="space-y-2 p-4 font-mono text-[12px]">
        {c.lines.map(([k, v, tone], i) => <p key={k} className="flex gap-4" style={{ animation: `s-step-in 0.4s var(--s-ease) ${i * 0.09}s both` }}>
          <span className="w-20 shrink-0 text-[var(--s-faint)]">{k}</span>
          <span style={tone ? { color: "var(--s-green)" } : undefined}>{v}</span>
        </p>)}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
        <Key k="Monitor.status" v={c.verdict} tone="ok" />
        <span className="s-mono !text-[9px]">checked on a schedule you pick</span>
      </div>
    </div>
    {NOTE}
  </div>;
}

/** Incidents: step through the three states of one outage. */
const STATES = { Healthy: ["var(--s-green)", "OK", "No open incidents", null], Failing: ["var(--s-amber)", "503 · failing", "Incident #2481 opened · alerts sent", "warn"], Recovered: ["var(--s-green)", "OK", "Incident #2481 resolved automatically", "ok"] };
function IncidentStates() {
  const [state, setState] = useState("Failing");
  const [tone, value, line, kind] = STATES[state];
  const rows = [["api.example.com", "API"], ["checkout-service", "Keyword"], ["example.com", "DNS"]];
  return <div>
    <div className="s-seg" role="group" aria-label="Incident state">
      {Object.keys(STATES).map(k => <button key={k} type="button" aria-pressed={state === k} onClick={() => setState(k)}>{k}</button>)}
    </div>
    <div className="s-panel mt-4 overflow-hidden" aria-live="polite">
      <div className="px-4 py-1.5">
        {rows.map(([n, t], i) => {
          const hit = i === 1;
          return <div key={n} className="cp-row !py-3 text-[13px]" style={{ opacity: state === "Failing" && !hit ? 0.45 : 1, transition: "opacity 0.4s" }}>
            <span className="cp-dot" style={{ background: hit ? tone : "var(--s-green)", transition: "background 0.4s" }} />
            <span className="truncate">{n}</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--s-faint)]">{t}</span>
            <span className="cp-num" style={hit ? { color: tone } : undefined}>{hit ? value : "OK"}</span>
          </div>;
        })}
      </div>
      <p className="border-t border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: kind === "warn" ? "var(--s-amber)" : kind === "ok" ? "var(--s-green)" : "var(--s-dim)" }}>{line}</p>
    </div>
  </div>;
}

/* ── per-product text ── */
function Copy({ n, product, tone, cta = "View product", children }) {
  const caps = (product.metadata?.capabilities ?? []).filter(c => c.status === "live").slice(0, 3);
  return <div>
    <div className="s-rise flex flex-wrap items-center gap-x-5 gap-y-2">
      <Kicker tone={tone}>{n} · {product.title}</Kicker>
      <Status kind={product.status === "live" ? "live" : "roadmap"} />
    </div>
    <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.8rem,3.6vw,3rem)]" style={{ "--i": 1 }}>{product.subtitle}</h2>
    <p className="s-body s-rise mt-5 max-w-xl" style={{ "--i": 2 }}>{product.body}</p>
    {caps.length > 0 && <ul className="s-rise mt-6 space-y-2" style={{ "--i": 3 }}>
      {caps.map(c => <li key={c.title} className="flex items-start gap-3 text-sm">
        <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tone ?? "var(--s-cyan)" }} />{c.title}
      </li>)}
    </ul>}
    {children}
    <p className="s-rise mt-8" style={{ "--i": 4 }}><Link to={linkFor(product)} className="s-link">{cta} <span aria-hidden>→</span></Link></p>
  </div>;
}
const Band = ({ id, alt, invert, children }) => <section id={id} className={`relative scroll-mt-24 px-6 py-20 md:px-10 md:py-28 ${invert ? "s-invert" : alt ? "border-y border-[var(--s-line)] bg-[var(--s-bg2)]" : ""}`}>
  <InView className="mx-auto max-w-7xl" amount={0.08}>{children}</InView>
</section>;

// CyberSachet has its own page rather than a product record; this is that page's own wording.
const CYBERSACHET = { itemKey: "cybersachet", title: "CyberSachet", status: "live", href: "/cybersachet", subtitle: "Cybersecurity awareness training for your whole team", body: "Structured courses and quizzes that build real awareness of the threats your organization actually faces, like phishing and password reuse. Completion and quiz scores are tracked per employee.", metadata: { capabilities: [{ title: "Structured courses", status: "live" }, { title: "Quizzes and progress tracking", status: "live" }, { title: "Per-organization licensing", status: "live" }] } };

export default function ProductsShowcase() {
  usePageMeta("Products — ITOps Solution", "Website and API monitoring, security scoring, Linux server monitoring, network checks, incidents and alerting, and training — independent products on one platform.");
  const sol = useSolution("");
  const mobile = useIsMobile();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const byKey = useMemo(() => Object.fromEntries(sol.all.map(s => [s.itemKey, s])), [sol.all]);
  const everything = useMemo(() => [...sol.all, ...(byKey.cybersachet ? [] : [CYBERSACHET])], [sol.all, byKey]);
  const filtered = everything.filter(s => (status === "all" || s.status === status) && (!query.trim() || `${s.title} ${s.subtitle ?? ""} ${s.body ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())));

  if (sol.isLoading) return <SitePage><PageLoading /></SitePage>;
  if (sol.isError || !sol.all.length) return <SitePage><PageError message="The products couldn't be loaded." /></SitePage>;

  const web = byKey["website-api-monitoring"], sec = byKey["security-monitoring"], kada = byKey["kada-nigrani"], net = byKey["infrastructure-monitor"], inc = byKey["alerting-incident-response"], academy = byKey.academy;
  const planned = sol.all.filter(s => s.status !== "live");
  const liveCount = everything.filter(s => s.status === "live").length;
  const jump = [[web, "web"], [sec, "security"], [kada, "servers"], [net, "network"], [inc, "incidents"], [CYBERSACHET, "people"], [academy, "academy"]].filter(([p]) => p);

  return <SitePage>
    {/* hero */}
    <section id="hero" className="relative overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
      <div className="s-grid" />
      <InView className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16" amount={0.05}>
        <div>
          <p className="s-path s-rise">Products / <b>Ecosystem</b></p>
          <h1 className="s-display s-rise mt-7 !text-[clamp(2.4rem,5.4vw,4.9rem)]" style={{ "--i": 1 }}>Independent products. <span className="s-accent">One platform.</span></h1>
          <p className="s-body s-rise mt-7 max-w-lg" style={{ "--i": 2 }}>Each product stands on its own — adopt one for a single team or run them all from one dashboard. Live products work today; roadmap products are marked as roadmap.</p>
          <p className="s-rise mt-8 flex flex-wrap gap-x-8 gap-y-2" style={{ "--i": 3 }}>
            <Key k="Products.live" v={String(liveCount).padStart(2, "0")} tone="ok" />
            <Key k="Products.roadmap" v={String(planned.length).padStart(2, "0")} />
          </p>
          <div className="s-rise mt-9 flex flex-wrap gap-3" style={{ "--i": 4 }}>
            <Btn href="#web">See the products</Btn>
            <Btn to="/pricing" kind="ghost">Plans</Btn>
          </div>
        </div>
        <div className="s-rise" style={{ "--i": 2 }}><HeroComposition />{NOTE}</div>
      </InView>
      <div className="relative mx-auto mt-16 max-w-7xl">
        <ProductGlance items={jump.map(([p, id]) => [p.itemKey, p.title.replace(/ —.*| \(.*/, ""), id])} />
      </div>
    </section>

    {/* 01 — text left, switchable check on the right */}
    {web && <Band id="web" alt>
      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
        <Copy n="01" product={web} />
        <div className="s-rise" style={{ "--i": 2 }}><CheckSwitcher /></div>
      </div>
      <PlainSteps product="website-api-monitoring" />
    </Band>}

    {/* 02 — inspection on the left, text on the right */}
    {sec && <Band id="security">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div className="s-rise order-2 lg:order-1" style={{ "--i": 2 }}><Inspection />{NOTE}</div>
        <div className="order-1 lg:order-2"><Copy n="02" product={sec} tone="var(--s-violet)" /></div>
      </div>
      <PlainSteps product="security-monitoring" />
    </Band>}

    {/* 03 — headline across the top, then install → telemetry */}
    {kada && <Band id="servers" alt>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="s-rise flex flex-wrap items-center gap-x-5 gap-y-2"><Kicker tone="var(--s-blue)">03 · {kada.title}</Kicker><Status kind="live" /></div>
          <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>{kada.subtitle}</h2>
        </div>
        <div className="lg:pt-10">
          <p className="s-body s-rise" style={{ "--i": 2 }}>{kada.body}</p>
          <p className="s-rise mt-6" style={{ "--i": 3 }}><Link to={linkFor(kada)} className="s-link">View product <span aria-hidden>→</span></Link></p>
        </div>
      </div>
      <div className="s-rise mt-14 grid items-center gap-6 lg:grid-cols-[0.75fr_auto_1.25fr]" style={{ "--i": 3 }}>
        <div><p className="s-mono mb-3">One line to install</p><AgentInstall /></div>
        <span aria-hidden className="mx-auto h-8 w-px bg-[var(--s-line2)] lg:h-px lg:w-12" />
        <div><p className="s-mono mb-3">Then it reports, every minute</p><ServerTelemetry /></div>
      </div>
      {NOTE}
      <PlainSteps product="kada-nigrani" />
    </Band>}

    {/* 04 — the path on the left, a narrow column of text on the right */}
    {net && <Band id="network">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        <div className="s-rise" style={{ "--i": 2 }}><NetworkPath />{NOTE}</div>
        <Copy n="04" product={net} />
      </div>
      <PlainSteps product="infrastructure-monitor" />
    </Band>}

    {/* 05 — centred statement, then the outage you can step through */}
    {inc && <Band id="incidents" alt>
      <div className="mx-auto max-w-3xl text-center">
        <div className="s-rise flex flex-wrap items-center justify-center gap-x-5 gap-y-2"><Kicker tone="var(--s-amber)">05 · {inc.title}</Kicker><Status kind="live" /></div>
        <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>{inc.subtitle}</h2>
        <p className="s-body s-rise mx-auto mt-5 max-w-2xl" style={{ "--i": 2 }}>{inc.body}</p>
      </div>
      <div className="s-rise mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16" style={{ "--i": 3 }}>
        <div><p className="s-mono mb-3">Step through one outage</p><IncidentStates /></div>
        <div><p className="s-mono mb-3">Where the alert goes</p>{mobile ? <Flow dir="col" className="mx-auto w-56" steps={[{ label: "Incident", tone: "fail" }, { label: "Alert rule", tone: "itops" }, { label: "Slack · Email · Webhook" }]} /> : <AlertRouting />}</div>
      </div>
      <p className="s-rise mt-10 text-center" style={{ "--i": 4 }}><Link to={linkFor(inc)} className="s-link">View product <span aria-hidden>→</span></Link></p>
      <PlainSteps product="alerting-incident-response" />
    </Band>}

    {/* 06 — the human product: a light section and a person's question */}
    <Band id="people" invert>
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Copy n="06" product={CYBERSACHET} tone="var(--s-amber)" />
        <div className="s-rise" style={{ "--i": 2 }}><Challenge /><p className="s-mono mt-3 text-right !text-[9px]">Illustration · sample question</p></div>
      </div>
      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div><p className="s-rise s-mono mb-4">Inside the product</p><Shot name="cybersachet-training" alt="The CyberSachet training hub: progress, quiz average, course categories and the first courses" address="CyberSachet · training hub" caption="A real screen from CyberSachet · preview account" /></div>
        <div>
          <p className="s-rise s-mono mb-4">Courses inside</p>
          <ul className="s-rise grid grid-cols-3 gap-3 lg:grid-cols-1" style={{ "--i": 3 }}>
            {[["phishing", "Phishing Awareness"], ["password-mfa", "Password Security & MFA"], ["social-engineering", "Social Engineering"]].map(([file, name]) => <li key={file} className="overflow-hidden rounded-xl border border-[var(--s-line2)] lg:flex lg:items-center lg:gap-4">
              <img src={`/products/course-${file}.webp`} alt="" width="560" height="560" loading="lazy" decoding="async" className="aspect-square w-full object-cover lg:w-24" />
              <span className="block p-3 text-sm font-medium leading-snug tracking-tight lg:p-0 lg:pr-4">{name}</span>
            </li>)}
          </ul>
        </div>
      </div>
      <PlainSteps product="cybersachet" />
    </Band>

    {/* 07 — the academy: lab and certificate wide, text beside */}
    {academy && <Band id="academy">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div className="s-rise order-2 lg:order-1" style={{ "--i": 2 }}><LearningJourney />{NOTE}</div>
        <div className="order-1 lg:order-2"><Copy n="07" product={academy} tone="var(--s-blue)" /></div>
      </div>
      <div className="mt-14"><p className="s-rise s-mono mb-4">Inside the product</p><Shot name="academy-workspace" alt="The Moonsav ITOps Academy workspace: a lab environment with its services, learning tracks and lab progress" address="ITOps Academy · engineer workspace" caption="A real screen from the academy · preview account" /></div>
      <PlainSteps product="academy" />
    </Band>}

    {/* roadmap products, outlined */}
    {planned.length > 0 && <Band alt>
      <div className="s-rise"><Kicker>On the roadmap</Kicker></div>
      <h2 className="s-h2 s-rise mt-4 max-w-3xl" style={{ "--i": 1 }}>Planned next. <span className="s-soft">Not available yet.</span></h2>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {planned.map((p, i) => <Link key={p.itemKey} to={linkFor(p)} className="s-rise group block rounded-2xl border border-dashed border-[var(--s-gray)] p-6 transition-colors hover:border-[var(--s-fg)] md:p-8" style={{ "--i": i + 2 }}>
          <span className="flex items-center justify-between gap-4"><span className="s-h3">{p.title}</span><Status kind="roadmap" /></span>
          <span className="s-body mt-3 block">{p.subtitle}</span>
          <span className="mt-5 flex flex-wrap gap-1.5">
            {(p.metadata?.capabilities ?? []).slice(0, 5).map(c => <span key={c.title} className="s-chip !whitespace-normal !px-2.5 !py-1.5 !text-[9px]" data-tone="roadmap">{c.title}</span>)}
          </span>
          <span className="s-link mt-6">See the plan <span aria-hidden>→</span></span>
        </Link>)}
      </div>
    </Band>}

    {/* searchable index */}
    <Band id="all">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <div className="s-rise"><Kicker>All products</Kicker></div>
          <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.8rem,3.6vw,3rem)]" style={{ "--i": 1 }}>Find one by name.</h2>
          <div className="s-rise mt-8" style={{ "--i": 2 }}>
            <label htmlFor="prod-q" className="s-label">Search products</label>
            <input id="prod-q" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. server, SSL, alerts" className="s-input" />
            <div className="s-seg mt-4" role="group" aria-label="Status">
              {[["all", "All"], ["live", "Live today"], ["roadmap", "Roadmap"]].map(([v, l]) => <button key={v} type="button" aria-pressed={status === v} onClick={() => setStatus(v)}>{l}</button>)}
            </div>
          </div>
        </div>
        <ul aria-live="polite">
          {filtered.length === 0 && <li className="s-body">No products match that search.</li>}
          {filtered.map(p => <li key={p.itemKey}>
            <Link to={linkFor(p)} className="s-row grid-cols-[1fr_auto] !py-5">
              <span className="s-row-title text-lg font-medium tracking-tight">{p.title}</span>
              <Status kind={p.status === "live" ? "live" : "roadmap"} />
              {p.subtitle && <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{p.subtitle}</span>}
            </Link>
          </li>)}
        </ul>
      </div>
    </Band>

    {/* closing */}
    <section className="relative overflow-hidden px-6 py-24 md:px-10 md:py-36">
      <div className="s-grid" />
      <InView className="relative mx-auto max-w-5xl text-center">
        <div className="s-rise"><Signal /></div>
        <h2 className="s-display s-rise mt-8 !text-[clamp(2.2rem,5.4vw,4.75rem)]" style={{ "--i": 1 }}>Start with one. <span className="s-accent">Add the rest when you need them.</span></h2>
        <div className="s-rise mt-10 flex flex-wrap justify-center gap-3" style={{ "--i": 2 }}>
          <Btn to="/pricing">See plans</Btn>
          <Btn to="/platform" kind="ghost">How the platform works</Btn>
        </div>
      </InView>
    </section>
  </SitePage>;
}
