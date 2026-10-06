// Company: human, story, culture, authenticity.
//
// Real information only. People come from the published leadership list (shown
// with initials until a portrait is added to their record), the figures are
// counted from the published module and product lists, and the story shows no
// dates because none are published. Richer profiles appear automatically when a
// person's record carries them:
//   metadata: { imageUrl, discipline, focus, experience, specialty, bio, quote, areas[] }
import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { fetchContentItems, submitContactMessage } from "../api/endpoints";
import { Flow, InView, Kicker, Signal, Topology } from "../story/World";
import { Btn, CountUp, usePlatformModules, useSolution } from "../story/Page";
import { Field, FormNote, Input, Key, Select, SitePage, TextArea, useHashScroll, usePageMeta } from "../story/Shell";

const PHONE = "+977 980-335-0658";
const EMAIL = "support@itopssolution.tech";

/* ── the story: stages, drawn as you scroll ── */
function Timeline({ steps }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  return <ol ref={ref} className="s-tl space-y-14 md:space-y-10">
    <motion.span aria-hidden className="s-tl-fill" style={{ scaleY: reduce ? 1 : scaleY }} />
    {steps.map((s, i) => <li key={s.label} className="s-tl-step">
      <InView amount={0.4}>
        <p className="s-rise flex items-center gap-4"><span className="s-mono" style={{ color: "var(--s-cyan)" }}>0{i + 1}</span><span className="s-mono">{s.label}</span></p>
        <h3 className="s-h3 s-rise mt-4" style={{ "--i": 1 }}>{s.title}</h3>
        <p className="s-body s-rise mt-3" style={{ "--i": 2 }}>{s.body}</p>
        {s.artifact && <div className="s-rise mt-6" style={{ "--i": 3 }}>{s.artifact}</div>}
      </InView>
    </li>)}
  </ol>;
}
function Chips({ items, tone }) {
  return <ul className="flex flex-wrap gap-1.5">{items.map(t => <li key={t} className="s-chip !whitespace-normal !px-2.5 !py-1.5 !text-[9px]" data-tone={tone}>{t}</li>)}</ul>;
}

/* ── culture ── */
const PRINCIPLES = [
  ["See the system", "You cannot operate what you cannot see."],
  ["Context over noise", "More alerts do not automatically create better operations."],
  ["Design for real infrastructure", "Websites fail. Servers fail. Networks change. Certificates expire. Operations must account for reality."],
  ["Live means live", "A capability is marked live only when it works in the product. Everything else is labelled roadmap."]
];
const LOOP = [["Build", ""], ["Test", ""], ["Something breaks", "warn"], ["Investigate", ""], ["Fix", ""], ["Learn", ""], ["Ship again", "ok"]];

/* ── people ── */
const DISCIPLINES = [[/founder|chief|ceo|cto|coo|head|director|lead/i, "Leadership"], [/engineer|developer|cto|architect/i, "Engineering"], [/product|design/i, "Product"], [/security/i, "Security"], [/operations|sre|devops|reliab/i, "Operations"], [/support|success|customer/i, "Customer success"]];
function disciplinesOf(person) {
  const explicit = person.metadata?.discipline;
  if (explicit) return Array.isArray(explicit) ? explicit : [explicit];
  const found = DISCIPLINES.filter(([re]) => re.test(person.subtitle ?? "")).map(([, d]) => d);
  return found.length ? found : ["Team"];
}
function Person({ person }) {
  const md = person.metadata ?? {};
  const name = person.title.trim();
  const initials = name.split(/\s+/).map(p => p[0]).join("");
  const areas = Array.isArray(md.areas) && md.areas.length ? md.areas : disciplinesOf(person);
  const facts = [["Focus", md.focus], ["Experience", md.experience], ["Specialty", md.specialty]].filter(([, v]) => v);
  return <article className="group grid gap-6 sm:grid-cols-[minmax(0,200px)_1fr] sm:gap-8">
    <div className="relative w-full max-w-[150px] overflow-hidden rounded-2xl sm:max-w-none">
      {md.imageUrl ? <img src={md.imageUrl} alt={`Portrait of ${name}`} className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" /> : <div className="grid aspect-[4/5] w-full place-items-center border border-[var(--s-line2)] bg-[var(--s-panel2)]" aria-hidden>
        <span className="text-6xl font-semibold tracking-tight text-[var(--s-faint)] transition-colors duration-500 group-hover:text-[var(--s-cyan)]">{initials}</span>
      </div>}
    </div>
    <div>
      <p className="s-mono">{disciplinesOf(person).join(" · ")}</p>
      <h3 className="s-h2 mt-3 !text-[clamp(1.8rem,3.2vw,2.6rem)]">{name}</h3>
      <p className="mt-2 text-lg text-[var(--s-dim)]">{person.subtitle?.trim()}</p>
      {facts.length > 0 && <p className="mt-5 flex flex-col gap-2">{facts.map(([k, v]) => <Key key={k} k={k} v={v} />)}</p>}
      {md.bio && <p className="s-body mt-5">{md.bio}</p>}
      {md.quote && <p className="mt-5 text-lg font-medium leading-snug tracking-tight">“{md.quote}”</p>}
      {/* the line from a person to what they work on */}
      <div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-2">
        <span className="s-chip" data-tone="plain">{name.split(/\s+/)[0]}</span>
        <span aria-hidden className="h-px w-6 bg-[var(--s-line2)] transition-all duration-500 group-hover:w-10 group-hover:bg-[var(--s-cyan)]" />
        {areas.map(a => <span key={a} className="s-chip">{a}</span>)}
        <span aria-hidden className="h-px w-6 bg-[var(--s-line2)] transition-all duration-500 group-hover:w-10 group-hover:bg-[var(--s-cyan)]" />
        <span className="s-chip" data-tone="itops">ITOps</span>
      </div>
    </div>
  </article>;
}

/* ── contact (same endpoint and topics as before) ── */
const TOPICS = [["company", "Company"], ["sales", "Sales"], ["support", "Support"], ["other", "Other"]];
function Contact() {
  const [f, setF] = useState({ name: "", email: "", topic: "company", message: "" });
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }));
  const m = useMutation({ mutationFn: () => submitContactMessage(f) });
  if (m.isSuccess) return <div className="s-panel p-8" role="status">
    <p className="s-mono" style={{ color: "var(--s-green)" }}>Message sent ✓</p>
    <p className="s-h3 mt-4">Thanks — it's with the team.</p>
    <p className="s-body mt-3">We'll get back to you at {f.email}.</p>
  </div>;
  return <form onSubmit={e => { e.preventDefault(); m.mutate(); }} className="s-panel grid gap-5 p-6 sm:grid-cols-2 md:p-8">
    <Field label="Name">{p => <Input {...p} required value={f.name} onChange={set("name")} autoComplete="name" />}</Field>
    <Field label="Email">{p => <Input {...p} type="email" required value={f.email} onChange={set("email")} autoComplete="email" />}</Field>
    <div className="sm:col-span-2"><Field label="Topic">{p => <Select {...p} value={f.topic} onChange={set("topic")}>{TOPICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>}</Field></div>
    <div className="sm:col-span-2"><Field label="Message">{p => <TextArea {...p} required value={f.message} onChange={set("message")} />}</Field></div>
    <div className="sm:col-span-2">
      <button type="submit" className="s-btn" data-kind="primary" disabled={m.isPending}>{m.isPending ? "Sending" : "Send message"} <span aria-hidden>→</span></button>
      {m.isError && <FormNote tone="error">{m.error?.message ?? "Something went wrong — please try again."}</FormNote>}
    </div>
  </form>;
}

export default function AboutStory() {
  usePageMeta("Company — why ITOps exists · ITOps Solution", "ITOps Solution builds monitoring products in Kathmandu, Nepal: one honest, working view of whether your systems are up, secure and healthy.");
  useHashScroll();
  const leadership = useQuery({ queryKey: ["content", "company", "leadership"], queryFn: () => fetchContentItems("company", "leadership") });
  const mv = useQuery({ queryKey: ["content", "company", "mission_vision"], queryFn: () => fetchContentItems("company", "mission_vision") });
  const mods = usePlatformModules();
  const sol = useSolution("");
  const live = (mods.data ?? []).filter(m => m.status === "live");
  const planned = (mods.data ?? []).filter(m => m.status !== "live");
  const mission = mv.data?.find(i => i.itemKey === "mission")?.body;
  const vision = mv.data?.find(i => i.itemKey === "vision")?.body;

  const steps = [
    { label: "The question", title: "Can a small team see everything?", body: "ITOps started as a focused answer to one question: can a small team get enterprise-grade infrastructure visibility without buying five different tools?", artifact: <Chips items={["Monitoring", "Security", "Servers", "Alerts", "Status page"]} tone="roadmap" /> },
    { label: "The problem", title: "Finding out from customers.", body: "It was built by people who got tired of learning about an outage from the people affected by it.", artifact: <p className="s-panel max-w-xs p-4 text-sm"><span className="s-mono block !text-[9px]">Message · 09:14</span><span className="mt-2 block font-medium">“Is the site down for you too?”</span></p> },
    { label: "The first build", title: "Is it up, how fast, what changed.", body: "The platform began with website and API monitoring and grew outward from there, one real module at a time.", artifact: <Flow steps={[{ label: "Request" }, { label: "Response" }, { label: "ITOps", tone: "itops" }]} className="max-w-sm" /> },
    { label: "Today", title: `${live.length || "Several"} modules, live.`, body: mission ?? "One honest, working view of whether your systems are up, secure and healthy.", artifact: <Chips items={live.map(m => m.title.trim())} /> },
    { label: "What comes next", title: "Module by module.", body: vision ?? "The platform keeps growing — and a module ships only when it's real.", artifact: <Chips items={planned.map(m => m.title.trim())} tone="roadmap" /> }
  ];
  const stats = [[live.length, "Modules live today"], [planned.length, "On the roadmap"], [sol.all.length, "Products"]];

  return <SitePage>
    {/* hero: the argument, beside a living environment */}
    <section id="hero" className="relative overflow-hidden px-6 pb-16 pt-36 md:px-10 md:pb-24 md:pt-44">
      <div className="s-grid" />
      <InView className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16" amount={0.05}>
        {(seen, liveNow) => <>
          <div>
            <p className="s-path s-rise">Company / <b>Why ITOps exists</b></p>
            <h1 className="s-display s-rise mt-7 !text-[clamp(2.4rem,5.6vw,5rem)]" style={{ "--i": 1 }}>It became easier to build.</h1>
            <p className="s-display s-rise s-soft !text-[clamp(2.4rem,5.6vw,5rem)]" style={{ "--i": 4 }}>It became harder to operate.</p>
            <p className="s-body s-rise mt-8 max-w-lg" style={{ "--i": 6 }}>More websites, more servers, more cloud, more alerts, more tools. The signals multiplied; visibility didn't. We build systems that make IT operations visible — from Kathmandu, Nepal.</p>
            <div className="s-rise mt-9 flex flex-wrap gap-3" style={{ "--i": 7 }}>
              <Btn href="#story">Read the story</Btn>
              <Btn href="#contact" kind="ghost">Talk to us</Btn>
            </div>
          </div>
          <div className="s-rise mx-auto h-[420px] w-full max-w-[420px] md:h-[520px]" style={{ "--i": 3 }}>
            <Topology layout="mobile" reveal={8} signals connect={seen} hub={seen} live={liveNow} label="An IT environment — website, servers, network, security, application, cloud, endpoints and people — connected to ITOps" />
          </div>
        </>}
      </InView>
    </section>

    {/* figures, counted from the published lists */}
    <section className="border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map(([n, label], i) => <div key={label} className={`py-10 pr-6 ${i > 0 ? "lg:border-l lg:border-[var(--s-line)] lg:pl-8" : ""} ${i === 1 ? "border-l border-[var(--s-line)] pl-6" : ""}`}>
          <p className="s-display !text-[clamp(2.6rem,5vw,4.5rem)]">{n ? <CountUp to={n} pad={2} /> : "—"}</p>
          <p className="s-mono mt-3">{label}</p>
        </div>)}
        <div className="border-l border-[var(--s-line)] py-10 pl-6 lg:pl-8">
          <p className="s-display !text-[clamp(1.6rem,2.6vw,2.4rem)] !leading-[1.15]">Kathmandu,<br />Nepal</p>
          <p className="s-mono mt-3">Where we build</p>
        </div>
      </div>
    </section>

    {/* story */}
    <section id="story" className="relative scroll-mt-24 px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-6xl">
        <InView amount={0.3} className="mb-16 max-w-3xl md:mx-auto md:text-center">
          <div className="s-rise"><Kicker>Our story</Kicker></div>
          <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>From one question <span className="s-soft">to one platform.</span></h2>
        </InView>
        <Timeline steps={steps} />
      </div>
    </section>

    {/* culture: what we hold to, and the loop we work in */}
    <section className="relative border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:gap-20" amount={0.06}>
        <div>
          <div className="s-rise"><Kicker>How we think</Kicker></div>
          <h2 className="s-h2 s-rise mt-4 !text-[clamp(1.9rem,4vw,3.25rem)]" style={{ "--i": 1 }}>Four things we hold to be true.</h2>
          <ol className="mt-10">
            {PRINCIPLES.map(([t, d], i) => <li key={t} className="s-rise s-row grid-cols-[44px_1fr]" style={{ "--i": i + 2 }}>
              <span className="s-mono">0{i + 1}</span>
              <div><h3 className="s-h3">{t}</h3><p className="s-body mt-2 max-w-xl">{d}</p></div>
            </li>)}
          </ol>
        </div>
        <div>
          <div className="s-rise"><Kicker>How we work</Kicker></div>
          <ol className="mt-10">
            {LOOP.map(([step, tone], i) => <li key={step} className="s-rise relative flex items-center gap-5 pb-5 last:pb-0" style={{ "--i": i + 2 }}>
              {i < LOOP.length - 1 && <span aria-hidden className="absolute left-[5px] top-5 h-full w-px bg-[var(--s-line2)]" />}
              <span className="relative h-[11px] w-[11px] shrink-0 rounded-full ring-4 ring-[var(--s-bg2)]" style={{ background: tone === "warn" ? "var(--s-amber)" : tone === "ok" ? "var(--s-green)" : "var(--s-faint)" }} />
              <span className="font-mono text-sm uppercase tracking-[0.16em]" style={{ color: tone === "warn" ? "var(--s-amber)" : undefined }}>{step}</span>
            </li>)}
          </ol>
        </div>
      </InView>
    </section>

    {/* people — the light, editorial section */}
    {leadership.data?.length > 0 && <section id="people" className="s-invert relative scroll-mt-24 px-6 py-24 md:px-10 md:py-32">
      <InView className="mx-auto max-w-7xl" amount={0.06}>
        <div className="s-rise"><Kicker>People</Kicker></div>
        <h2 className="s-display s-rise mt-4 !text-[clamp(2.3rem,5.4vw,4.75rem)]" style={{ "--i": 1 }}>The people behind <span className="s-accent">the signal.</span></h2>
        <p className="s-body s-rise mt-6 max-w-md" style={{ "--i": 2 }}>Infrastructure may be automated. Operations are still human.</p>
        <div className="mt-14 grid gap-14 lg:grid-cols-2 lg:gap-16">
          {leadership.data.map((p, i) => <div key={p.id} className="s-rise" style={{ "--i": i + 3 }}><Person person={p} /></div>)}
        </div>
      </InView>
    </section>}

    {/* contact */}
    <section id="contact" className="relative scroll-mt-24 px-6 py-20 md:px-10 md:py-28">
      <InView className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20" amount={0.05}>
        <div>
          <div className="s-rise"><Kicker>Get in touch</Kicker></div>
          <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>Tell us what you run.</h2>
          <p className="s-body s-rise mt-5 max-w-sm" style={{ "--i": 2 }}>A person reads every message.</p>
          <ul className="s-rise mt-10" style={{ "--i": 3 }}>
            <li className="s-row grid-cols-[90px_1fr] !py-4"><span className="s-mono">Call</span><a href="tel:+9779803350658" className="text-lg font-medium tabular-nums tracking-tight transition-colors hover:text-[var(--s-cyan)]">{PHONE}</a></li>
            <li className="s-row grid-cols-[90px_1fr] !py-4"><span className="s-mono">Email</span><a href={`mailto:${EMAIL}`} className="text-[15px] font-medium tracking-tight transition-colors hover:text-[var(--s-cyan)] sm:text-lg">{EMAIL}</a></li>
            <li className="s-row grid-cols-[90px_1fr] !py-4"><span className="s-mono">Based in</span><span className="text-lg font-medium tracking-tight">Kathmandu, Nepal</span></li>
          </ul>
        </div>
        <div className="s-rise" style={{ "--i": 2 }}><Contact /></div>
      </InView>
    </section>

    {/* closing */}
    <section className="relative overflow-hidden border-t border-[var(--s-line)] px-6 py-28 md:px-10 md:py-40">
      <div className="s-grid" />
      <InView className="relative mx-auto max-w-6xl">
        <p className="s-rise flex items-center gap-4"><Signal /><span className="s-mono">ITOps Solution</span></p>
        <p className="s-display s-rise s-soft mt-8" style={{ "--i": 1 }}>We don't just monitor systems.</p>
        <p className="s-display s-rise" style={{ "--i": 4 }}>We help people <span className="s-accent">understand them.</span></p>
        <div className="s-rise mt-12 flex flex-wrap gap-3" style={{ "--i": 6 }}>
          <Btn to="/platform">Explore the platform</Btn>
          <Btn to="/pricing" kind="ghost">See plans</Btn>
        </div>
      </InView>
    </section>
  </SitePage>;
}
