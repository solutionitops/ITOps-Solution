// Pricing: clarity, trust, comparison. A quiet hero, four plan cards (one
// recommended, one custom), a sizing tool, a visual of how the plans expand, a
// comparison matrix and an FAQ.
//
// Where the numbers come from:
//  • limits (monitors, hosts, alert channels, history) — the plan catalog; they are enforced.
//  • prices — data/planPricing.js, carried over from the previous pricing page.
//  • checkout (Stripe) and the enterprise enquiry behave exactly as before.
// Feature rows only list what the product pages state is live; planned
// capabilities are shown as ROADMAP and are not part of any plan.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCheckoutSession, fetchContentItems, fetchPlanCatalog, fetchPlanUsage, submitWaitlistSignup } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { CURRENCIES, PLAN_PRICES, RECOMMENDED_PLAN } from "../data/planPricing";
import { InView, Kicker, Signal, Status } from "../story/World";
import { Accordion, Btn, PageError, useSolution } from "../story/Page";
import { FormNote, Key, SitePage, usePageMeta } from "../story/Shell";

const titleCase = v => v.charAt(0) + v.slice(1).toLowerCase();
const UNLIMITED = 100000;
const cap = n => (n >= UNLIMITED ? "Unlimited" : String(n));
const INCLUDED = ["Uptime, keyword, status-code and DNS checks", "SSL and security-header scoring", "Automatic incident tracking", "Public status page", "Real-time dashboard"];
const FAQS = [
  { q: "Are the limits really enforced?", a: "Yes. Every limit on this page is enforced by the platform. Creating a monitor beyond your plan's limit is blocked with a clear message telling you the limit and your current plan — there are no silent failures and no overage charges." },
  { q: "Can I start free and upgrade later?", a: "Yes. The Starter plan is free and self-serve: create an account and start monitoring in minutes, with no credit card required. You can upgrade to a paid plan at any time." },
  { q: "How do I pay for a paid plan?", a: "Professional and Business are paid by card through Stripe Checkout. You see the amount there before you confirm. Enterprise is arranged directly with our team." },
  { q: "What counts as a monitor?", a: "Each website, API endpoint, DNS record or network device you check counts as one monitor. Linux servers reporting through the Kada Nigrani agent are counted separately, as server hosts." },
  { q: "How often are my monitors checked?", a: "You choose per monitor: every 30 seconds, 1 minute, 5 minutes or 15 minutes. Our scheduler runs every minute, so the 30-second option currently checks at most once per minute in practice." },
  { q: "Are roadmap features included in a plan?", a: "No. Anything marked Roadmap on this site is planned, not available, and is not part of any plan yet." }
];

/* ── hero visual: capacity growing plan by plan ── */
function GrowthBars({ plans }) {
  if (!plans.length) return null;
  const top = Math.log10(Math.min(Math.max(...plans.map(p => p.maxMonitors)), 1000) + 1);
  return <div className="s-bars" role="img" aria-label={`Monitors included per plan: ${plans.map(p => `${titleCase(p.plan)} ${cap(p.maxMonitors)}`).join(", ")}`}>
    {plans.map((p, i) => {
      const h = Math.max(12, (Math.log10(Math.min(p.maxMonitors, 1000) + 1) / top) * 100);
      return <div key={p.plan}>
        <span className="text-center text-lg font-semibold tabular-nums tracking-tight">{p.maxMonitors >= UNLIMITED ? "∞" : p.maxMonitors}</span>
        <i style={{ height: `${h * 0.72}%`, "--i": i, opacity: p.plan === RECOMMENDED_PLAN ? 1 : 0.55 }} />
        <span className="s-mono text-center !text-[9px]">{titleCase(p.plan)}</span>
      </div>;
    })}
  </div>;
}

function PlanAction({ plan, primary }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const checkout = useMutation({ mutationFn: () => createCheckoutSession(plan) });
  const lead = useMutation({ mutationFn: () => submitWaitlistSignup({ email, product: "upgrade-request", note: `Interested in ${plan}` }) });
  if (plan === "STARTER") return <Link to="/register" className="s-btn w-full justify-center" data-kind="ghost">Get started free <span aria-hidden>→</span></Link>;
  if (plan === "ENTERPRISE") {
    if (lead.isSuccess) return <FormNote tone="ok">Thanks — we'll follow up at {email}.</FormNote>;
    return <form onSubmit={e => { e.preventDefault(); lead.mutate(); }} className="flex flex-col gap-2">
      <label htmlFor="ent-email" className="sr-only">Work email</label>
      <input id="ent-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="s-input" autoComplete="email" />
      <button type="submit" className="s-btn w-full justify-center" data-kind="ghost" disabled={lead.isPending}>{lead.isPending ? "Sending" : "Talk to sales"}</button>
      {lead.isError && <FormNote tone="error">Request failed — please try again.</FormNote>}
    </form>;
  }
  return <div className="flex flex-col gap-2">
    <button type="button" className="s-btn w-full justify-center" data-kind={primary ? "primary" : "ghost"} disabled={checkout.isPending} onClick={() => { setErr(null); checkout.mutate(undefined, { onSuccess: url => { window.location.href = url; }, onError: e => setErr(e.message) }); }}>
      {checkout.isPending ? "Redirecting" : `Upgrade to ${titleCase(plan)}`}
    </button>
    {err && <FormNote tone="error">{err}</FormNote>}
  </div>;
}

function Price({ plan, currency, billing }) {
  const p = PLAN_PRICES[plan];
  if (!p) return <p><span className="text-4xl font-semibold tracking-tight">Custom</span><span className="mt-1.5 block text-sm text-[var(--s-dim)]">Shaped around your infrastructure</span></p>;
  const v = p[currency][billing];
  if (v === 0) return <p><span className="text-4xl font-semibold tracking-tight">Free</span><span className="mt-1.5 block text-sm text-[var(--s-dim)]">No credit card required</span></p>;
  const saved = Math.round((1 - p[currency].yearly / p[currency].monthly) * 100);
  return <p>
    <span className="text-4xl font-semibold tabular-nums tracking-tight">{CURRENCIES[currency].fmt(v)}</span>
    <span className="ml-1.5 text-sm text-[var(--s-dim)]">/ month</span>
    <span className="mt-1.5 block text-sm text-[var(--s-dim)]">{billing === "yearly" ? <>Billed yearly · <span style={{ color: "var(--s-green)" }}>save {saved}%</span></> : "Billed monthly"}</span>
  </p>;
}

/* ── sizing tool: a planning aid over the real limits ── */
const FIELDS = [["websites", "Websites"], ["apis", "API endpoints"], ["network", "Network devices"], ["servers", "Linux servers"], ["channels", "Alert channels"]];
function Sizer({ value, onChange }) {
  const set = (k, n) => onChange({ ...value, [k]: Math.max(0, Math.min(9999, Number.isFinite(n) ? n : 0)) });
  return <fieldset className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
    <legend className="sr-only">Describe your environment</legend>
    {FIELDS.map(([k, label]) => <div key={k}>
      <label htmlFor={`size-${k}`} className="s-label">{label}</label>
      <div className="s-step">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => set(k, value[k] - 1)}>−</button>
        <input id={`size-${k}`} type="number" inputMode="numeric" min={0} value={value[k]} onChange={e => set(k, parseInt(e.target.value, 10))} />
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => set(k, value[k] + 1)}>+</button>
      </div>
    </div>)}
  </fieldset>;
}

/** A plan drawn as the amount of infrastructure it covers. */
function Matrix({ plan }) {
  const open = plan.maxMonitors >= UNLIMITED;
  const m = Math.min(plan.maxMonitors, 100), h = Math.min(plan.maxHosts, 50), a = Math.min(plan.maxAlertChannels, 20);
  const cells = Array.from({ length: 180 }, (_, i) => (open ? null : i < m ? "m" : i < m + h ? "h" : i < m + h + a ? "a" : null));
  return <div className="s-matrix" data-open={open ? "1" : "0"} aria-hidden>
    {cells.map((k, i) => <i key={i} data-k={k ?? undefined} style={{ "--n": i }} />)}
  </div>;
}

export default function PricingStory() {
  usePageMeta("Plans & pricing — ITOps Solution", "Start free on the Starter plan and upgrade when you need more monitors, server hosts, alert channels or history. Every limit is real and enforced.");
  const { user } = useAuth();
  const plansQ = useQuery({ queryKey: ["plan-catalog"], queryFn: fetchPlanCatalog });
  const usage = useQuery({ queryKey: ["plan-usage"], queryFn: fetchPlanUsage, enabled: !!user });
  const copyQ = useQuery({ queryKey: ["content", "pricing", "plan_copy"], queryFn: () => fetchContentItems("pricing", "plan_copy") });
  const sol = useSolution("");
  const copy = useMemo(() => new Map((copyQ.data ?? []).map(i => [i.itemKey, i])), [copyQ.data]);
  const plans = plansQ.data ?? [];

  const [currency, setCurrency] = useState("NPR");
  const [billing, setBilling] = useState("monthly");
  const [env, setEnv] = useState({ websites: 3, apis: 0, network: 0, servers: 1, channels: 1 });
  const need = { monitors: env.websites + env.apis + env.network, hosts: env.servers, channels: env.channels };
  const fit = plans.find(p => p.maxMonitors >= need.monitors && p.maxHosts >= need.hosts && p.maxAlertChannels >= need.channels);
  const planned = sol.all.filter(s => ["website-api-monitoring", "alerting-incident-response", "kada-nigrani"].includes(s.itemKey)).flatMap(s => (s.metadata?.capabilities ?? []).filter(c => c.status !== "live").map(c => c.title)).slice(0, 6);

  return <SitePage>
    {/* hero */}
    <section id="hero" className="relative overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
      <div className="s-grid" />
      <InView className="relative mx-auto grid max-w-7xl items-end gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20" amount={0.05}>
        <div>
          <p className="s-path s-rise">Pricing / <b>Plans</b></p>
          <h1 className="s-display s-rise mt-7" style={{ "--i": 1 }}>Start free. <span className="s-accent">Scale when ready.</span></h1>
          <p className="s-body s-rise mt-7 max-w-lg" style={{ "--i": 2 }}>The Starter plan is free and self-serve. When your environment grows, a bigger plan raises four numbers — monitors, server hosts, alert channels and history. Every limit below is real and enforced.</p>
          <div className="s-rise mt-9 flex flex-wrap gap-3" style={{ "--i": 3 }}>
            <Btn to="/register">Get started free</Btn>
            <Btn href="#plans" kind="ghost">Compare plans</Btn>
          </div>
        </div>
        <div className="s-rise" style={{ "--i": 2 }}>
          <p className="s-mono mb-5">Monitors included, by plan</p>
          <GrowthBars plans={plans} />
        </div>
      </InView>
    </section>

    {/* plans */}
    <section id="plans" className="relative scroll-mt-24 border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-16 md:px-10 md:py-24">
      <InView className="mx-auto max-w-7xl" amount={0.03}>
        <div className="s-rise flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker>Plans</Kicker>
            <h2 className="s-h2 mt-4 !text-[clamp(1.9rem,4vw,3.25rem)]">Pick the size of your environment.</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="s-label">Currency</p>
              <div className="s-seg" role="group" aria-label="Currency">
                {Object.entries(CURRENCIES).map(([k, c]) => <button key={k} type="button" aria-pressed={currency === k} onClick={() => setCurrency(k)}>{c.label}</button>)}
              </div>
            </div>
            <div>
              <p className="s-label">Billing</p>
              <div className="s-seg" role="group" aria-label="Billing period">
                {[["monthly", "Monthly"], ["yearly", "Yearly"]].map(([v, l]) => <button key={v} type="button" aria-pressed={billing === v} onClick={() => setBilling(v)}>{l}</button>)}
              </div>
            </div>
          </div>
        </div>

        {user && usage.data && <p className="s-rise mt-8 flex flex-wrap gap-x-8 gap-y-2 border-l border-[var(--s-cyan)] pl-4">
          <Key k="Your plan" v={titleCase(usage.data.plan)} tone="info" />
          <Key k="Monitors" v={`${usage.data.currentMonitors} / ${cap(usage.data.maxMonitors)}`} />
          <Key k="Alert channels" v={`${usage.data.currentAlertChannels} / ${cap(usage.data.maxAlertChannels)}`} />
        </p>}

        {plansQ.isLoading ? <p className="s-mono mt-12">Loading plans<span className="animate-pulse">_</span></p> : plansQ.isError ? <PageError message="The plans couldn't be loaded." onRetry={() => plansQ.refetch()} /> : <ul className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 xl:mt-16 xl:grid-cols-4">
          {plans.map((p, i) => {
            const rec = p.plan === RECOMMENDED_PLAN, custom = p.plan === "ENTERPRISE", fits = fit?.plan === p.plan;
            return <li key={p.plan} className="s-rise s-card" data-rec={rec ? "1" : "0"} data-custom={custom ? "1" : "0"} data-fit={fits ? "1" : "0"} style={{ "--i": i }}>
              <p className="flex min-h-[20px] items-center justify-between gap-3">
                <span className="s-mono">{copy.get(p.plan)?.title ?? " "}</span>
                {rec && <span className="s-mono !text-[9.5px]" style={{ color: "var(--s-cyan)" }}>Recommended</span>}
              </p>
              <h3 className="s-h3 mt-4">{titleCase(p.plan)}</h3>
              <p className="mt-2 min-h-[2.75rem] text-sm leading-relaxed text-[var(--s-dim)]">{copy.get(p.plan)?.subtitle}</p>
              <div className="mt-5 min-h-[76px]"><Price plan={p.plan} currency={currency} billing={billing} /></div>
              <dl className="mt-5 flex-1">
                {[["Monitors", cap(p.maxMonitors)], ["Server hosts", cap(p.maxHosts)], ["Alert channels", cap(p.maxAlertChannels)], ["History", `${p.historyDays} days`]].map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-4 border-t border-[var(--s-line)] py-2.5">
                  <dt className="text-sm text-[var(--s-dim)]">{k}</dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>)}
              </dl>
              <p className="mb-4 mt-2 min-h-[18px] font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--s-cyan)" }}>{fits ? "● Fits the environment below" : ""}</p>
              <PlanAction plan={p.plan} primary={rec} />
            </li>;
          })}
        </ul>}
        <p className="s-rise mt-8 text-sm text-[var(--s-dim)]">Every plan includes uptime, keyword, status-code and DNS checks, SSL and security-header scoring, automatic incident tracking, a public status page and a real-time dashboard.</p>
      </InView>
    </section>

    {/* sizing tool */}
    {plans.length > 0 && <section className="relative px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto max-w-7xl" amount={0.08}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <div className="s-rise"><Kicker>Not sure?</Kicker></div>
            <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.9rem,4vw,3.25rem)]" style={{ "--i": 1 }}>Tell us what you run.</h2>
            <p className="s-body s-rise mt-5 max-w-sm" style={{ "--i": 2 }}>Enter your environment and the plan that covers it is highlighted above. It's worked out from the published limits — a planning aid, not a quote.</p>
          </div>
          <div className="s-rise" style={{ "--i": 2 }}>
            <Sizer value={env} onChange={setEnv} />
            <div className="s-panel mt-6 flex flex-wrap items-center justify-between gap-6 p-6" aria-live="polite">
              <p className="flex flex-wrap gap-x-8 gap-y-2">
                <Key k="Monitors needed" v={String(need.monitors)} />
                <Key k="Hosts needed" v={String(need.hosts)} />
                <Key k="Channels needed" v={String(need.channels)} />
              </p>
              <p className="text-right">
                <span className="s-mono block">Plan that covers it</span>
                <span className="s-h3 mt-1 block" style={{ color: "var(--s-cyan)" }}>{fit ? titleCase(fit.plan) : "Talk to our team"}</span>
              </p>
            </div>
          </div>
        </div>
      </InView>
    </section>}

    {/* how the plans expand */}
    {plans.length > 0 && <section className="relative border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto max-w-7xl" amount={0.1}>
        <div className="s-rise"><Kicker>What changes</Kicker></div>
        <h2 className="s-h2 s-rise mt-4 max-w-4xl" style={{ "--i": 1 }}>You're not buying more dashboards. <span className="s-soft">You're widening what your team can see.</span></h2>
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p, i) => <li key={p.plan} className="s-rise" style={{ "--i": i + 2 }}>
            <p className="flex items-center gap-3"><span className="s-mono" style={{ color: "var(--s-cyan)" }}>0{i + 1}</span><span className="text-lg font-medium tracking-tight">{titleCase(p.plan)}</span>{i < plans.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-[var(--s-line2)] xl:block" />}</p>
            <div className="mt-5"><Matrix plan={p} /></div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-faint)]">{p.maxMonitors >= UNLIMITED ? "No fixed ceiling" : `${p.maxMonitors} monitors · ${p.maxHosts} hosts · ${p.maxAlertChannels} channels`}</p>
          </li>)}
        </ol>
        <p className="s-rise mt-8 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--s-faint)]">
          <span><span className="mr-2 inline-block h-2 w-2 rounded-[2px] bg-[var(--s-cyan)]" />Monitors</span>
          <span><span className="mr-2 inline-block h-2 w-2 bg-[var(--s-blue)]" />Server hosts</span>
          <span><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--s-amber)]" />Alert channels</span>
        </p>
      </InView>
    </section>}

    {/* comparison */}
    {plans.length > 0 && <section className="relative px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto max-w-7xl" amount={0.05}>
        <div className="s-rise"><Kicker>Compare</Kicker></div>
        <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.9rem,4vw,3.25rem)]" style={{ "--i": 1 }}>Every capability, every plan.</h2>
        <div className="s-rise mt-10 overflow-x-auto" style={{ "--i": 2 }}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--s-line2)]">
                <th scope="col" className="s-mono py-3 pr-4 !text-[10px] font-medium">Capability</th>
                {plans.map(p => <th scope="col" key={p.plan} className="s-mono px-4 py-3 !text-[10px] font-medium" style={p.plan === RECOMMENDED_PLAN ? { color: "var(--s-cyan)" } : undefined}>{titleCase(p.plan)}</th>)}
              </tr>
            </thead>
            <tbody>
              {[["Monitors", p => cap(p.maxMonitors)], ["Server hosts (Kada Nigrani)", p => cap(p.maxHosts)], ["Alert channels", p => cap(p.maxAlertChannels)], ["Check history", p => `${p.historyDays} days`]].map(([label, cell]) => <tr key={label} className="border-b border-[var(--s-line)]">
                <th scope="row" className="py-3.5 pr-4 font-normal text-[var(--s-dim)]">{label}</th>
                {plans.map(p => <td key={p.plan} className="px-4 py-3.5 font-medium tabular-nums">{cell(p)}</td>)}
              </tr>)}
              {INCLUDED.map(label => <tr key={label} className="border-b border-[var(--s-line)]">
                <th scope="row" className="py-3.5 pr-4 font-normal text-[var(--s-dim)]">{label}</th>
                {plans.map(p => <td key={p.plan} className="px-4 py-3.5" style={{ color: "var(--s-green)" }}><span aria-label="Included">✓</span></td>)}
              </tr>)}
              {planned.map(label => <tr key={label} className="border-b border-[var(--s-line)]">
                <th scope="row" className="py-3.5 pr-4 font-normal text-[var(--s-faint)]">{label}</th>
                {plans.map(p => <td key={p.plan} className="px-4 py-3.5"><Status kind="roadmap" /></td>)}
              </tr>)}
            </tbody>
          </table>
        </div>
      </InView>
    </section>}

    {/* FAQ */}
    <section id="faq" className="relative scroll-mt-24 border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20" amount={0.05}>
        <div>
          <div className="s-rise"><Kicker>Questions</Kicker></div>
          <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.9rem,4vw,3.25rem)]" style={{ "--i": 1 }}>Before you choose.</h2>
          <p className="s-rise mt-6" style={{ "--i": 2 }}><Link to="/support" className="s-link">Ask us something else <span aria-hidden>→</span></Link></p>
        </div>
        <div className="s-rise" style={{ "--i": 2 }}><Accordion items={FAQS} idPrefix="price-faq" /></div>
      </InView>
    </section>

    {/* closing */}
    <section className="relative overflow-hidden px-6 py-24 md:px-10 md:py-36">
      <div className="s-grid" />
      <InView className="relative mx-auto max-w-5xl text-center">
        <div className="s-rise"><Signal /></div>
        <h2 className="s-display s-rise mt-8 !text-[clamp(2.2rem,5.4vw,4.75rem)]" style={{ "--i": 1 }}>Running something bigger?</h2>
        <p className="s-body s-rise mx-auto mt-6 max-w-xl" style={{ "--i": 2 }}>Banks, hospitals, government, MSPs — if you need custom limits, isolated tenants or a dedicated onboarding, talk to us directly and we'll shape Enterprise around your infrastructure.</p>
        <div className="s-rise mt-9 flex flex-wrap justify-center gap-3" style={{ "--i": 3 }}>
          <Btn to="/company#contact">Talk to our team</Btn>
          <Btn to="/platform" kind="ghost">Explore the platform</Btn>
        </div>
      </InView>
    </section>
  </SitePage>;
}
