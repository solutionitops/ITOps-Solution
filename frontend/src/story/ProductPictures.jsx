// Pictures for the Products page, for visitors who don't read dashboards:
//  • PlainSteps — what a product does, in three simple pictures and plain words;
//  • Shot — a real screen of the product, framed (files in public/products/);
//  • ProductGlance — every product in one line, as a picture index.
import { InView } from "./World";

/* ── line illustrations (24 × 24, one stroke weight) ── */
const ICONS = {
  browser: "M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 9h18M6.5 6.5h.01M9 6.5h.01M8 14l2.5 2.5L16 11.5",
  browserDown: "M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 9h18M6.5 6.5h.01M9 6.5h.01M9.5 12l5 5M14.5 12l-5 5",
  bell: "M6 16v-5a6 6 0 1112 0v5l1.5 2h-15zM10 20.5h4M12 2.5V5",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3M12 14.5v2",
  score: "M4 17a8 8 0 1116 0M12 17l4.5-6M3 20h18",
  list: "M10 6h10M10 12h10M10 18h10M4 6l1.2 1.2L7.5 5M4 12l1.2 1.2L7.5 11M4.5 17.5l2.5 2.5M7 17.5L4.5 20",
  install: "M4 5h16v6H4zM7.5 8h.01M11 8h5M12 13v6M9 16.5l3 3 3-3",
  bars: "M4 20V12M9.5 20V5M15 20v-9M20.5 20v-5M2 20h20",
  screen: "M3 5h18v11H3zM8 20h8M12 16v4M6.5 12.5l3-3 2.5 2 4.5-4.5",
  router: "M3 13h18v6H3zM7 16h.01M11 16h.01M17 13V9M14.6 9a3.4 3.4 0 014.8 0M12.5 6.8a6.4 6.4 0 019 0",
  unlink: "M10 14l-3 3a3 3 0 01-4-4l3-3M14 10l3-3a3 3 0 014 4l-3 3M8 4v2.5M4 8h2.5M16 20v-2.5M20 16h-2.5",
  pin: "M12 21s-6.5-5.2-6.5-11a6.5 6.5 0 0113 0c0 5.8-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  warning: "M12 3.5l9.5 16.5h-19zM12 10v4.5M12 17.5h.01",
  message: "M4 5h16v11H10l-5 4v-4H4zM8 9h8M8 12.5h5",
  done: "M12 21a9 9 0 100-18 9 9 0 000 18zM8 12.2l2.8 2.8 5.2-6",
  book: "M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5zM5 19.5A1.5 1.5 0 006.5 21H19M9 7.5h6M9 11h6",
  quiz: "M12 21a9 9 0 100-18 9 9 0 000 18zM9.6 9.4a2.5 2.5 0 114 2c-.9.6-1.6 1.1-1.6 2.1M12 17h.01",
  people: "M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16.5 5.2a3 3 0 010 5.6M17.5 14.6A6 6 0 0121 20",
  terminal: "M3 5h18v14H3zM7 10l3 2.5L7 15M12.5 15H17",
  lab: "M9.5 3h5M10 3v6l-5.2 9a2 2 0 001.7 3h11a2 2 0 001.7-3L14 9V3M7.6 15h8.8",
  certificate: "M5 4h14v11H5zM9 8h6M9 11h4M9.5 15v6l2.5-1.8 2.5 1.8v-6"
};
function Pic({ name, tone, size = 44 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={tone ?? "currentColor"} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICONS[name]} /></svg>;
}

// What each product does, said the way you would say it to someone outside IT.
export const PLAIN = {
  "website-api-monitoring": { tone: "var(--s-cyan)", line: "Tells you the moment your website stops working.", steps: [["browser", "We visit your website", "On a schedule you choose — as often as every minute."], ["browserDown", "It stops working", "We notice straight away, and record what went wrong."], ["bell", "You get a message", "So you hear it from us, not from a customer."]] },
  "security-monitoring": { tone: "var(--s-violet)", line: "Checks how safe your website is, and scores it.", steps: [["lock", "We check the locks", "Your site's certificate and its safety settings."], ["score", "You get a score", "One number out of 100 for each website."], ["list", "We list what to fix", "Exactly what is missing — no guesswork."]] },
  "kada-nigrani": { tone: "var(--s-blue)", line: "Shows how busy and how full your servers are.", steps: [["install", "Add a small helper", "One line installs it on a Linux server."], ["bars", "It reports every minute", "How busy the server is, and how full."], ["screen", "See every server", "All of them on one screen, online or offline."]] },
  "infrastructure-monitor": { tone: "var(--s-cyan)", line: "Checks that routers, switches and firewalls still answer.", steps: [["router", "We knock on each door", "A quick connection to every device — nothing to install."], ["unlink", "One stops answering", "We see which one, and how it failed."], ["pin", "You know where to look", "The device and the exact error, not a guess."]] },
  "alerting-incident-response": { tone: "var(--s-amber)", line: "Tells the right people, and closes the case when it's fixed.", steps: [["warning", "Something breaks", "A problem is opened on its own, with the cause attached."], ["message", "Your team is told", "By Slack, email or webhook — where they already are."], ["done", "Fixed, and closed", "When things recover, the problem closes itself."]] },
  cybersachet: { tone: "var(--s-amber)", line: "Teaches your staff to spot scams and stay safe online.", steps: [["book", "Short lessons", "On real threats, like fake emails and weak passwords."], ["quiz", "A quiz at the end", "Every course finishes with a scored quiz."], ["people", "See who is trained", "Completion and scores for each person."]] },
  academy: { tone: "var(--s-blue)", line: "Trains engineers with courses, labs and certificates.", steps: [["terminal", "Learn", "Structured courses in cloud, DevOps and infrastructure."], ["lab", "Practise", "Labs that run in your browser, with quizzes that are really graded."], ["certificate", "Get certified", "A certificate anyone can verify."]] }
};

/** Three pictures and plain words: what the product does for a non-technical reader. */
export function PlainSteps({ product }) {
  const p = PLAIN[product];
  if (!p) return null;
  return <div className="s-rise mt-14 border-t border-[var(--s-line)] pt-8" style={{ "--i": 4 }}>
    <p className="s-mono">In plain words</p>
    <ol className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch md:gap-0">
      {p.steps.map(([icon, title, body], i) => <PlainStep key={title} icon={icon} title={title} body={body} tone={p.tone} index={i} last={i === p.steps.length - 1} />)}
    </ol>
  </div>;
}
function PlainStep({ icon, title, body, tone, index, last }) {
  return <>
    <li className="flex items-center gap-5 rounded-2xl border border-[var(--s-line)] bg-[var(--s-panel)] p-5 md:flex-col md:items-start md:gap-0 md:p-6">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl md:h-[72px] md:w-[72px]" style={{ background: `color-mix(in srgb, ${tone} 10%, transparent)` }}><Pic name={icon} tone={tone} /></span>
      <span className="md:mt-5">
        <span className="s-mono block !text-[9.5px]" style={{ color: tone }}>Step {index + 1}</span>
        <span className="mt-1.5 block text-lg font-medium tracking-tight">{title}</span>
        <span className="mt-1.5 block text-sm leading-relaxed text-[var(--s-dim)]">{body}</span>
      </span>
    </li>
    {!last && <li aria-hidden className="grid place-items-center text-[var(--s-faint)] md:px-3"><span className="rotate-90 md:rotate-0">→</span></li>}
  </>;
}

/** A real screen of the product, in a quiet window frame. */
export function Shot({ name, alt, caption, address }) {
  return <figure className="s-rise overflow-hidden rounded-2xl border border-[var(--s-line2)] bg-[#0b0f19] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)]" style={{ "--i": 3 }}>
    <div className="flex items-center gap-2 border-b border-white/10 bg-[#0e131d] px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" />
      {address && <span className="ml-3 truncate rounded-md bg-black/40 px-3 py-1 font-mono text-[10.5px] text-white/45">{address}</span>}
    </div>
    <picture>
      <source srcSet={`/products/${name}.webp`} type="image/webp" />
      <img src={`/products/${name}.jpg`} alt={alt} width="1600" height="955" loading="lazy" decoding="async" className="block h-auto w-full" />
    </picture>
    {caption && <figcaption className="border-t border-white/10 bg-[#0e131d] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">{caption}</figcaption>}
  </figure>;
}

/** Every product in one line — the picture index under the hero. */
export function ProductGlance({ items }) {
  return <InView amount={0.15}>
    <p className="s-rise s-mono">What each product does, in one line</p>
    <ul className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-[var(--s-line)] bg-[var(--s-line)] sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([key, title, id], i) => <li key={key} className="s-rise" style={{ "--i": Math.min(i + 1, 7) }}>
        <a href={`#${id}`} className="group flex h-full items-start gap-4 bg-[var(--s-bg)] p-5 transition-colors hover:bg-[var(--s-panel)]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${PLAIN[key].tone} 10%, transparent)` }}><Pic name={PLAIN[key].steps[0][0]} tone={PLAIN[key].tone} size={28} /></span>
          <span>
            <span className="block text-[15px] font-medium tracking-tight transition-colors group-hover:text-[var(--s-cyan)]">{title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-[var(--s-dim)]">{PLAIN[key].line}</span>
          </span>
        </a>
      </li>)}
      <li className="s-rise" style={{ "--i": 7 }}>
        <a href="#all" className="group flex h-full items-center justify-between gap-4 bg-[var(--s-bg)] p-5 transition-colors hover:bg-[var(--s-panel)]">
          <span>
            <span className="block text-[15px] font-medium tracking-tight transition-colors group-hover:text-[var(--s-cyan)]">All products</span>
            <span className="mt-1 block text-sm leading-relaxed text-[var(--s-dim)]">Search the full list, including what's planned.</span>
          </span>
          <span aria-hidden className="text-xl text-[var(--s-dim)] transition-transform group-hover:translate-x-1">→</span>
        </a>
      </li>
    </ul>
  </InView>;
}
