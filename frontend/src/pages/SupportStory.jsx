// Support: the journey of a support signal.
//   You → message → ITOps → a person on the team → a response → you.
//
// The page's one promise is the existing one — "no bots, a real person reads
// every message" — so nothing here implies more than that:
//  • no ticket numbers, no response-time promise, no automated classification;
//  • "Received by team" is shown only after the message has actually been stored;
//  • Knowledge Base and Live Chat take their status from the published support
//    channels (currently "Coming Soon") and are drawn as outlines, not products;
//  • the questions are the published FAQs, arranged as a path.
// The form posts through the existing contact endpoint, which accepts four
// topics; the six choices on the page map onto them and are named in the message.
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useInView, useReducedMotion } from "motion/react";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { fetchContentItems, submitContactMessage } from "../api/endpoints";
import { Field, FormNote, Input, TextArea } from "../story/Shell";
import { Flow, InView, Kicker, Signal, Status, useIsMobile } from "../story/World";
import "../story/story.css";

const PHONE = "+977 980-335-0658";
const PHONE_HREF = "tel:+9779803350658";
const EMAIL = "support@itopssolution.tech";

// label → the topic value the endpoint accepts
const TOPICS = [["Bug", "support"], ["Billing", "support"], ["Product", "other"], ["Support", "support"], ["Sales", "sales"], ["Other", "other"]];

/* ── the hero film: the journey of a support signal ── */
// Shown as part of the page rather than as a video player: no frame and no
// controls, with its edges faded into the background (see .s-film). It plays
// muted and looped while on screen, pauses off-screen, and stays on its still
// frame when the visitor prefers reduced motion. Files live in public/support/
// (web copies of the supplied support.mp4, without audio).
function SupportFilm() {
  const wrap = useRef(null);
  const video = useRef(null);
  const visible = useInView(wrap, { amount: 0.25 });
  const reduce = useReducedMotion();
  const playing = visible && !reduce;
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);
  return <figure ref={wrap} className="s-film">
    <video ref={video} muted loop playsInline disablePictureInPicture preload="metadata" poster="/support/support-signal-poster.jpg" width="1280" height="720" aria-label="Animation: a customer's email, call or message travels to ITOps support, a person on the team investigates it, and their response travels back to the customer.">
      <source src="/support/support-signal.webm" type="video/webm" />
      <source src="/support/support-signal.mp4" type="video/mp4" />
    </video>
  </figure>;
}

/* ── after sending: what actually happens, in order ── */
function Sent({ state, email, onRetry }) {
  // 1 created → 2 travelling (while the request is in flight) → 3 received (stored) → 4 a human takes over
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (state === "pending") { const id = setTimeout(() => setStep(2), reduce ? 0 : 500); return () => clearTimeout(id); }
    if (state === "success") {
      if (reduce) { setStep(4); return undefined; }
      setStep(s => Math.max(s, 2));
      const a = setTimeout(() => setStep(3), 900), b = setTimeout(() => setStep(4), 1900);
      return () => { clearTimeout(a); clearTimeout(b); };
    }
    return undefined;
  }, [state, reduce]);

  if (state === "error") return <div className="s-panel p-7 md:p-9" role="alert">
    <p className="s-mono" style={{ color: "var(--s-amber)" }}>Signal not delivered</p>
    <p className="s-h3 mt-4">Your message didn't reach us.</p>
    <p className="s-body mt-3">Nothing was lost — your message is still in the form. Try again, or call {PHONE}.</p>
    <button type="button" onClick={onRetry} className="s-btn mt-6" data-kind="primary">Back to the form <span aria-hidden>→</span></button>
  </div>;

  const rows = [["Signal created", "✓"], ["Travelling to ITOps", "→"], ["Received by the team", "●"], ["A human will take it from here.", "✓"]];
  return <div className="s-panel p-7 md:p-9" role="status" aria-live="polite">
    <ol className="s-sent">
      {rows.map(([label, mark], i) => {
        const on = step > i;
        return <li key={label} data-on={on ? "1" : "0"} className="relative flex items-start gap-5 pb-7 last:pb-0">
          {i < rows.length - 1 && <span aria-hidden className="absolute left-[13px] top-7 h-full w-px bg-[var(--s-line2)]" />}
          <span className="mark relative bg-[var(--s-panel)]">{on ? mark : ""}</span>
          <div className="min-w-0 flex-1">
            <p className="s-mono !text-[9.5px]">Step {i + 1}</p>
            <p className={i === 3 ? "s-h3 mt-1" : "mt-1 font-mono text-sm uppercase tracking-[0.14em]"}>{label}</p>
            {i === 1 && <span className="sj relative mt-3 block h-3 w-full max-w-xs" data-dir="row" data-on="1" data-live={step === 2 ? "1" : "0"} aria-hidden>
              <span className="sj-rail" />
              <span className="sj-pkt" style={{ animationDuration: "1.4s" }} />
            </span>}
            {i === 3 && on && <p className="s-body mt-2">We'll reply to {email}.</p>}
          </div>
        </li>;
      })}
    </ol>
  </div>;
}

/* ── the form, inside "send a signal" ── */
function SendSignal() {
  const [topic, setTopic] = useState("Support");
  const [f, setF] = useState({ name: "", email: "", company: "", message: "" });
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }));
  const m = useMutation({
    mutationFn: () => submitContactMessage({
      name: f.name,
      email: f.email,
      topic: TOPICS.find(([l]) => l === topic)[1],
      message: [`Topic: ${topic}`, f.company ? `Company: ${f.company}` : null, "", f.message].filter(v => v !== null).join("\n")
    })
  });
  const sending = m.isPending || m.isSuccess || m.isError;

  return <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
    <div>
      <p className="s-mono">Tell us what is happening</p>
      <div role="radiogroup" aria-label="What is this about?" className="mt-5">
        {TOPICS.map(([label]) => <button key={label} type="button" role="radio" aria-checked={topic === label} onClick={() => setTopic(label)} disabled={sending} className="s-topic">
          <i aria-hidden />
          <span className="text-xl font-medium tracking-tight md:text-2xl">{label}</span>
        </button>)}
      </div>
      <p className="mt-8 flex items-center gap-3"><Signal /><span className="s-mono" style={{ color: "var(--s-green)" }}>Ready to receive</span></p>
      <p className="s-body mt-3 max-w-xs">Your message goes directly to the ITOps team.</p>
    </div>

    {sending ? <Sent state={m.isPending ? "pending" : m.isSuccess ? "success" : "error"} email={f.email} onRetry={() => m.reset()} /> : <form onSubmit={e => { e.preventDefault(); m.mutate(); }} className="s-panel grid gap-5 p-6 sm:grid-cols-2 md:p-8">
      <p className="flex items-center justify-between gap-4 sm:col-span-2">
        <span className="s-mono">Send a signal</span>
        <span className="s-chip !py-1.5" data-tone="itops">{topic}</span>
      </p>
      <Field label="Name">{p => <Input {...p} required value={f.name} onChange={set("name")} autoComplete="name" />}</Field>
      <Field label="Email">{p => <Input {...p} type="email" required value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@company.com" />}</Field>
      <div className="sm:col-span-2"><Field label="Company">{p => <Input {...p} value={f.company} onChange={set("company")} autoComplete="organization" />}</Field></div>
      <div className="sm:col-span-2"><Field label="Message">{p => <TextArea {...p} required value={f.message} onChange={set("message")} placeholder="What's happening?" />}</Field></div>
      <div className="sm:col-span-2">
        <button type="submit" className="s-btn" data-kind="primary">Send signal <span aria-hidden>→</span></button>
        <FormNote>A person reads every message. No bots.</FormNote>
      </div>
    </form>}
  </div>;
}

/* ── the support signal map: today's path lit, the next paths outlined ── */
function SignalMap() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const live = useInView(ref, { amount: 0.2 });
  const mobile = useIsMobile();
  if (mobile) return <div ref={ref} role="img" aria-label="Today a message goes from a customer to ITOps and to the team. A knowledge base and live chat are planned.">
    <Flow dir="col" live={live} className="mx-auto w-56" steps={[{ label: "Customer", tone: "plain" }, { label: "Message", tone: "plain" }, { label: "ITOps", tone: "itops" }, { label: "Team" }, { label: "Response" }]} />
    <div className="mx-auto mt-5 flex w-56 flex-col gap-2">
      <span className="s-chip justify-center" data-tone="roadmap">Knowledge base · next</span>
      <span className="s-chip justify-center" data-tone="roadmap">Live chat · next</span>
    </div>
  </div>;
  const node = (x, y, label, tone) => <g key={label}>
    <circle cx={x} cy={y} r="5" fill={tone === "next" ? "var(--s-bg)" : "var(--s-cyan)"} stroke={tone === "next" ? "var(--s-gray)" : "var(--s-cyan)"} strokeDasharray={tone === "next" ? "2 2" : undefined} />
    <text x={x} y={y + (y < 100 ? -14 : 24)} textAnchor="middle" style={{ fill: tone === "next" ? "var(--s-gray)" : "var(--s-fg)", fontSize: 9.5, letterSpacing: "0.16em" }}>{label}</text>
  </g>;
  return <svg ref={ref} viewBox="0 0 760 210" className="s-topo w-full" data-connect={seen ? "1" : "0"} data-live={live ? "1" : "0"} role="img" aria-label="Today a message goes from a customer to ITOps and to the team. A knowledge base and live chat are planned.">
    <path pathLength="1" className="s-conv" d="M60 105H700" />
    <path pathLength="1" className="s-pkt conv" style={{ "--d": "4s" }} d="M60 105H700" />
    <path d="M380 105V36" stroke="var(--s-gray)" strokeDasharray="3 4" />
    <path d="M380 105V174" stroke="var(--s-gray)" strokeDasharray="3 4" />
    {node(60, 105, "Customer")}{node(220, 105, "Message")}{node(380, 105, "ITOps")}{node(540, 105, "Response")}{node(700, 105, "Team")}
    {node(380, 36, "Knowledge base · next", "next")}{node(380, 174, "Live chat · next", "next")}
  </svg>;
}

function Next({ today, todayNote, next, nextNote, status, children }) {
  return <div className="s-rise grid items-center gap-6 border-t border-[var(--s-line)] py-10 md:grid-cols-[0.8fr_auto_1.2fr] md:gap-12">
    <div>
      <p className="s-mono" style={{ color: "var(--s-green)" }}>Today</p>
      <p className="s-h3 mt-3">{today}</p>
      <p className="s-body mt-2">{todayNote}</p>
    </div>
    <span aria-hidden className="hidden h-px w-16 border-t border-dashed border-[var(--s-gray)] md:block" />
    <div className="grid items-center gap-6 sm:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="s-mono" style={{ color: "var(--s-gray)" }}>Next</p>
        <p className="s-h3 mt-3" style={{ color: "var(--s-dim)" }}>{next}</p>
        <p className="s-body mt-2">{nextNote}</p>
      </div>
      <div className="s-soon">
        {children}
        <p className="mt-4 text-right"><Status kind="roadmap">{status}</Status></p>
      </div>
    </div>
  </div>;
}

/* ── help centre: search, topics, and the answers as a path ── */
const CATEGORY = [[/ssl|certificate|security/i, "Security"], [/alert|slack|webhook|notif|incident/i, "Alerting"], [/plan|limit|billing|price/i, "Plans"], [/server|infrastructure|host|agent/i, "Servers"], [/monitor|check/i, "Monitoring"]];
const ORDER = ["Monitoring", "Security", "Servers", "Alerting", "Plans", "Account"];
const categoryOf = q => q.cat ?? (CATEGORY.find(([re]) => re.test(q.title)) ?? [null, "Account"])[1];
// Answers grounded in how the product works; the published FAQs are added to these.
const ANSWERS = [
  ["Monitoring", "How do I add a monitor?", "Point it at any URL, hostname or API endpoint and pick a check type — uptime, keyword, status code, or DNS."],
  ["Security", "How does SSL monitoring work?", "The certificate's issuer, protocol and days remaining are checked per monitor, and an alert is raised when it is within 14 days of expiring or already expired."],
  ["Servers", "How do I install Kada Nigrani?", "Register a host to get its private ingest key, then run the one-line installer on the server. The agent is plain bash and curl and reports every minute."],
  ["Alerting", "How does incident creation work?", "Consecutive failures open an incident automatically with the precise failure attached. When checks pass again, it resolves on its own."],
  ["Alerting", "How do I configure Slack?", "Under Alert Channels, add a Slack channel with your Slack incoming-webhook URL, then send a test alert to confirm it arrives."],
  ["Account", "Which features are live, and which are roadmap?", "Every page marks each capability Live or Roadmap. Anything marked Roadmap is planned and not available yet."]
].map(([cat, title, body]) => ({ id: title, cat, title, body }));
const TILES = {
  Monitoring: ["var(--s-cyan)", "M3 12h4l2.5-6 4 12 2.5-6H21"],
  Security: ["var(--s-violet)", "M12 3l8 3.5V12c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6.5L12 3z"],
  Servers: ["var(--s-blue)", "M4 5h16v6H4zM4 13h16v6H4zM7.5 8h.01M7.5 16h.01"],
  Alerting: ["var(--s-amber)", "M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20h4"],
  Plans: ["var(--s-green)", "M4 7h16v11H4zM4 11h16M8 15h3"],
  Account: ["var(--s-fg)", "M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0"]
};
const POPULAR = ["SSL", "Slack", "monitor limit", "install", "servers"];

function QuestionPath({ faqs }) {
  const [open, setOpen] = useState(null);
  const groups = ORDER.map(c => [c, faqs.filter(q => categoryOf(q) === c)]).filter(([, qs]) => qs.length);
  return <div>
    {groups.map(([cat, qs]) => <div key={cat} className="s-branch pb-8 last:pb-0">
      <span className="knot" aria-hidden style={{ borderColor: TILES[cat]?.[0] }} />
      <p className="s-mono" style={{ color: TILES[cat]?.[0] ?? "var(--s-cyan)" }}>{cat}</p>
      {qs.map(q => {
        const on = open === q.id;
        return <div key={q.id} className="s-twig mt-3">
          <button type="button" aria-expanded={on} aria-controls={`faq-${q.id}`} onClick={() => setOpen(on ? null : q.id)} className="flex w-full items-start justify-between gap-6 py-2 text-left transition-colors hover:text-[var(--s-cyan)]">
            <span className="text-lg font-medium tracking-tight md:text-xl">{q.title}</span>
            <span aria-hidden className="mt-1 text-[var(--s-dim)] transition-transform" style={{ transform: on ? "rotate(45deg)" : "none" }}>+</span>
          </button>
          <div id={`faq-${q.id}`} className="s-acc-panel" data-open={on ? "1" : "0"} inert={!on}>
            <div><p className="s-body max-w-2xl pb-3 pt-1">{q.body}</p></div>
          </div>
        </div>;
      })}
    </div>)}
  </div>;
}

function HelpCenter({ faqs, loading }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(null);
  const all = [...ANSWERS, ...faqs];
  const term = q.trim().toLowerCase();
  const found = all.filter(a => (!cat || categoryOf(a) === cat) && (!term || `${a.title} ${a.body} ${categoryOf(a)}`.toLowerCase().includes(term)));
  const count = c => all.filter(a => categoryOf(a) === c).length;
  return <section id="help" className="relative scroll-mt-24 border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-20 md:px-10 md:py-28">
    <InView className="mx-auto max-w-7xl" amount={0.04}>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-20">
        <div>
          <div className="s-rise"><Kicker>Help centre</Kicker></div>
          <h2 className="s-display s-rise mt-4 !text-[clamp(2.3rem,5.2vw,4.5rem)]" style={{ "--i": 1 }}>How can we help?</h2>
        </div>
        <div className="s-rise" style={{ "--i": 2 }}>
          <label htmlFor="help-q" className="sr-only">Search answers</label>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--s-line2)] bg-[var(--s-panel)] px-5 py-4 transition-colors focus-within:border-[var(--s-cyan)]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[var(--s-dim)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input id="help-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Search monitoring, SSL, alerts, servers, plans…" className="w-full bg-transparent text-base text-[var(--s-fg)] placeholder:text-[var(--s-faint)] focus:outline-none" />
            <span className="s-mono shrink-0 !text-[9.5px]" aria-live="polite">{String(found.length).padStart(2, "0")} answers</span>
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-2">
            <span className="s-mono mr-1 !text-[9.5px]">Popular</span>
            {POPULAR.map(t => <button key={t} type="button" onClick={() => { setQ(t); setCat(null); }} className="s-chip !py-1.5 transition-colors hover:border-[var(--s-cyan)]" data-tone="plain">{t}</button>)}
          </p>
        </div>
      </div>

      <div className="s-rise mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" style={{ "--i": 3 }} role="group" aria-label="Topics">
        {ORDER.map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? null : c)} className="s-tile-btn" style={{ "--tile": TILES[c][0] }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={TILES[c][1]} /></svg>
          <span>
            <span className="block text-[15px] font-medium tracking-tight">{c}</span>
            <span className="s-mono mt-1 block !text-[9.5px]">{String(count(c)).padStart(2, "0")} answers</span>
          </span>
        </button>)}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
        <div aria-live="polite">
          {loading ? <p className="s-mono">Loading<span className="animate-pulse">_</span></p> : found.length ? <QuestionPath faqs={found} /> : <p className="s-body">Nothing matches that yet. <a href="#signal" className="s-link">Ask us directly <span aria-hidden>→</span></a></p>}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="s-mono">Quick actions</p>
          <ul className="mt-4">
            {[["Send us a message", "#signal"], [`Call ${PHONE}`, PHONE_HREF], ["Email the team", `mailto:${EMAIL}`]].map(([label, href]) => <li key={label}>
              <a href={href} className="s-row grid-cols-[1fr_auto] !py-4"><span className="s-row-title text-[15px] font-medium tracking-tight">{label}</span><span aria-hidden className="s-row-arrow text-[var(--s-dim)]">→</span></a>
            </li>)}
          </ul>
        </aside>
      </div>
    </InView>
  </section>;
}

export default function SupportStory() {
  const faqs = useQuery({ queryKey: ["content", "support", "faqs"], queryFn: () => fetchContentItems("support", "faqs") });
  const channels = useQuery({ queryKey: ["content", "support", "channels"], queryFn: () => fetchContentItems("support", "channels") });
  const statusOf = name => channels.data?.find(c => c.title.toLowerCase().includes(name))?.status ?? "Coming soon";
  useEffect(() => {
    const prev = document.title;
    document.title = "Support — your message has a human destination · ITOps Solution";
    return () => { document.title = prev; };
  }, []);

  return <div className="story antialiased">
    <MarketingNav />
    <main>
      {/* 1 — the hero: the journey itself */}
      <section id="hero" className="relative overflow-hidden px-6 pb-20 pt-36 md:px-10 md:pb-28 md:pt-44">
        <div className="s-grid" />
        <InView className="relative mx-auto max-w-7xl" amount={0.05}>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.25fr] lg:gap-10">
            <div>
              <p className="s-path s-rise">Support / <b>Direct line</b></p>
              <h1 className="s-display s-rise mt-7 !text-[clamp(2.4rem,5vw,4.5rem)]" style={{ "--i": 1 }}>Your message has a <span className="s-accent">human destination.</span></h1>
              <p className="s-body s-rise mt-7 max-w-lg" style={{ "--i": 2 }}>No bots. No automated maze. Send us what's happening and a member of the ITOps team will read it directly.</p>
              <div className="s-rise mt-9 flex flex-wrap items-center gap-3" style={{ "--i": 3 }}>
                <a href="#signal" className="s-btn" data-kind="primary">Start a conversation <span aria-hidden>→</span></a>
                <a href="#help" className="s-btn" data-kind="ghost">Search answers</a>
              </div>
            </div>
            {/* larger than its column: it bleeds toward the edge of the screen */}
            <div className="s-rise" style={{ "--i": 2 }}><SupportFilm /></div>
          </div>
          <p className="s-h2 s-rise mt-14 border-t border-[var(--s-line)] pt-10 md:mt-20" style={{ "--i": 4 }}>We'll answer directly — <span className="s-soft">no bots.</span></p>
        </InView>
      </section>

      {/* help centre: search, topics, answers */}
      <HelpCenter faqs={faqs.data ?? []} loading={faqs.isLoading} />

      {/* 2 — send a signal */}
      <section id="signal" className="relative scroll-mt-24 px-6 py-20 md:px-10 md:py-28">
        <InView className="mx-auto max-w-7xl" amount={0.04}>
          <div className="s-rise"><Kicker>How can we help?</Kicker></div>
          <h2 className="s-h2 s-rise mt-4" style={{ "--i": 1 }}>Send a signal.</h2>
          <div className="s-rise mt-12" style={{ "--i": 2 }}><SendSignal /></div>
        </InView>
      </section>

      {/* 3 — the next layer */}
      <section className="relative overflow-hidden px-6 py-20 md:px-10 md:py-28">
        <div className="s-grid" />
        <InView className="relative mx-auto max-w-7xl" amount={0.04}>
          <div className="s-rise"><Kicker>The next layer</Kicker></div>
          <h2 className="s-h2 s-rise mt-4 max-w-4xl" style={{ "--i": 1 }}>We're building the next way <span className="s-soft">to help.</span></h2>
          <div className="s-rise mx-auto mt-12 max-w-4xl" style={{ "--i": 2 }}><SignalMap /></div>
          <div className="mt-12">
            <Next today="Direct support" todayNote="Real people, reading what you send." next="Knowledge base" nextNote="Self-serve guides, when you'd rather look it up." status={statusOf("knowledge")}>
              <p className="s-mono !text-[9.5px]">Knowledge base</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[12px]">
                {["/monitoring", "/ssl", "/alerts", "/servers", "/network"].map(p => <li key={p}>{p}</li>)}
              </ul>
            </Next>
            <Next today="Form and phone" todayNote="A direct response, from the team." next="Live chat" nextNote="A real-time conversation with the team." status={statusOf("chat")}>
              <p className="s-mono !text-[9.5px]">ITOps live chat</p>
              <div className="mt-3 space-y-2.5">
                <p className="s-bubble">● Customer</p>
                <p className="s-bubble ml-auto text-right">● ITOps representative</p>
              </div>
            </Next>
          </div>
        </InView>
      </section>

      {/* 5 — or just talk to us (the light, human section) */}
      <section id="talk" className="s-invert relative scroll-mt-24 px-6 py-20 md:px-10 md:py-28">
        <InView className="mx-auto max-w-7xl" amount={0.05}>
          <h2 className="s-display s-rise !text-[clamp(2.3rem,5.4vw,4.75rem)]">Or just talk to us.</h2>
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_1.3fr_1fr] lg:gap-10">
            <div className="s-rise border-t border-[var(--s-line2)] pt-6" style={{ "--i": 1 }}>
              <p className="s-mono">Call</p>
              <p className="s-h3 mt-4 tabular-nums !text-[clamp(1.25rem,2vw,1.75rem)]">{PHONE}</p>
              <p className="mt-6"><a href={PHONE_HREF} className="s-link">Call the team <span aria-hidden>→</span></a></p>
            </div>
            <div className="s-rise border-t border-[var(--s-line2)] pt-6" style={{ "--i": 2 }}>
              <p className="s-mono">Email</p>
              <p className="s-h3 mt-4 !text-[clamp(1.25rem,2vw,1.75rem)] [overflow-wrap:anywhere]">{EMAIL}</p>
              <p className="mt-6"><a href={`mailto:${EMAIL}`} className="s-link">Send an email <span aria-hidden>→</span></a></p>
            </div>
            <div className="s-rise border-t border-[var(--s-line2)] pt-6" style={{ "--i": 3 }}>
              <p className="s-mono">Location</p>
              <p className="s-h3 mt-4 !text-[clamp(1.25rem,2vw,1.75rem)]">Kathmandu, Nepal</p>
              {/* a restrained technical map, not an embedded one */}
              <div className="mt-6 font-mono text-[11px] uppercase leading-[2] tracking-[0.18em]" role="img" aria-label="ITOps is based in Kathmandu, Nepal">
                <p className="text-[var(--s-faint)]">Nepal</p>
                <p><span className="mr-3 inline-block h-2 w-2 rounded-full bg-[var(--s-cyan)] align-middle" />Kathmandu</p>
                <p className="text-[var(--s-faint)]"><span className="mr-3 inline-block w-2 text-center">│</span>27.72° N · 85.32° E</p>
                <p><span className="mr-3 inline-block w-2 text-center text-[var(--s-faint)]">└</span>ITOps</p>
              </div>
            </div>
          </div>
        </InView>
      </section>

      {/* 6 — the ending */}
      <section className="relative overflow-hidden px-6 py-28 md:px-10 md:py-40">
        <div className="s-grid" />
        <InView className="relative mx-auto max-w-5xl text-center">
          <h2 className="s-display s-rise">Some problems are easier to explain <span className="s-accent">to a person.</span></h2>
          <p className="s-body s-rise mx-auto mt-8 max-w-sm" style={{ "--i": 2 }}>Tell us what's happening. We'll take it from there.</p>
          <p className="s-rise mt-10" style={{ "--i": 3 }}><a href="#signal" className="s-btn" data-kind="primary">Start a conversation <span aria-hidden>→</span></a></p>
          <p className="s-rise mt-14 flex items-center justify-center gap-3" style={{ "--i": 4 }}><Signal /><span className="s-mono">Human support · No bots</span></p>
        </InView>
      </section>
    </main>
    <MarketingFooter />
  </div>;
}
