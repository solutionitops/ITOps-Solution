// Phase 1 of the ITOps design system: the shell every redesigned page shares —
// navigation, footer, status signature, form controls and page metadata.
// Pages still on the previous design keep MarketingNav / MarketingFooter until
// their own phase.
import { useEffect, useId, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { BrandLogo } from "../components/BrandLogo";
import { ThemeToggle } from "../components/ThemeToggle";
import { fetchContentItems, submitWaitlistSignup } from "../api/endpoints";
import { Signal } from "./World";
import { SpineIndicator } from "./spine";
import "./story.css";

/* ── status: real, not decorative ── */

/**
 * "Platform online" is only shown when the platform's API actually answered.
 * It reuses the platform-modules query, so pages that already load that data
 * make no extra request.
 */
export function usePlatformStatus() {
  const q = useQuery({
    queryKey: ["content", "platform", "modules"],
    queryFn: () => fetchContentItems("platform", "modules"),
    staleTime: 60_000
  });
  return q.isSuccess ? "online" : q.isError ? "unknown" : "checking";
}
export function PlatformStatus({ online = "Platform online" }) {
  const s = usePlatformStatus();
  return <span className="s-status" data-kind={s === "online" ? "live" : "unknown"} role="status">
    {s === "online" ? online : s === "checking" ? "Checking status" : "Status unavailable"}
  </span>;
}

/* ── page metadata ── */

/** Sets the document title and description for a page, restoring them on leave. */
export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title;
    const tags = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]'].map(sel => document.querySelector(sel));
    const prev = tags.map(t => t?.getAttribute("content"));
    document.title = title;
    [description, title, description, title, description].forEach((v, i) => v && tags[i]?.setAttribute("content", v));
    return () => {
      document.title = prevTitle;
      tags.forEach((t, i) => prev[i] != null && t?.setAttribute("content", prev[i]));
    };
  }, [title, description]);
}

/**
 * Scrolls to `#hash` on arrival. Content above the target loads in after the
 * page mounts and pushes it down, so the scroll is repeated a few times — and
 * abandoned the moment the visitor scrolls for themselves.
 */
export function useHashScroll() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return undefined;
    let cancelled = false;
    const stop = () => { cancelled = true; };
    const go = () => { if (!cancelled) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" }); };
    const timers = [120, 600, 1400, 2400].map(ms => setTimeout(go, ms));
    window.addEventListener("wheel", stop, { passive: true, once: true });
    window.addEventListener("touchmove", stop, { passive: true, once: true });
    window.addEventListener("keydown", stop, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [hash]);
}

/* ── signature label ── */

/** `MONITOR.STATUS  OK` — the technical voice used across the site. */
export function Key({ k, v, tone }) {
  return <span className="s-key" data-tone={tone}>{k}{v != null && <b>{v}</b>}</span>;
}

/* ── navigation ── */

const NAV = [["Platform", "/platform"], ["Solutions", "/solutions"], ["Pricing", "/pricing"], ["Resources", "/resources"], ["Company", "/company"], ["Contact", "/contact"]];

function openSearch() {
  window.dispatchEvent(new Event("open-command-palette"));
}

export function StoryNav() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const on = () => setCompact(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const esc = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = prev; };
  }, [open]);

  const scrollToHero = () => {
    const hero = document.getElementById("hero") || document.getElementById("hero-mobile");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (e, to) => {
    setOpen(false);
    if (pathname === to) {
      e.preventDefault();
      scrollToHero();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  return <>
    <header className="sn" data-compact={compact || open ? "1" : "0"} data-open={open ? "1" : "0"}>
      <div className="sn-inner">
        <Link to="/" onClick={(e) => handleNavClick(e, "/")} aria-label="ITOps Solution — home" className="flex shrink-0 items-center"><BrandLogo size={30} /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map(([label, to]) => <NavLink key={to} to={to} onClick={(e) => handleNavClick(e, to)} className="sn-link">{label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="mr-2 hidden xl:inline-flex"><PlatformStatus /></span>
          <button type="button" onClick={openSearch} aria-label="Search pages and products" className="sn-icon">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </button>
          <ThemeToggle className="!border-[var(--s-line2)]" />
          <Link to="/login" className="s-btn sn-cta" data-kind="primary">Open platform <span aria-hidden>→</span></Link>
          <button type="button" className="sn-icon sn-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="sn-sheet" onClick={() => setOpen(o => !o)}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>
    </header>
    {open && <div id="sn-sheet" className="sn-sheet lg:hidden">
      <nav aria-label="Primary">
        {NAV.map(([label, to], i) => <NavLink key={to} to={to} onClick={(e) => handleNavClick(e, to)} className="sn-big">
          {label}
          <span className="s-mono !text-[10px]">0{i + 1}</span>
        </NavLink>)}
      </nav>
      <div className="mt-8 flex flex-col gap-5">
        <PlatformStatus />
        <Link to="/login" className="s-btn justify-center" data-kind="primary">Open platform <span aria-hidden>→</span></Link>
      </div>
    </div>}
  </>;
}

/* ── forms ── */

export function Field({ label, hint, error, children }) {
  const id = useId();
  const noteId = `${id}-note`;
  const control = typeof children === "function" ? children({ id, "aria-invalid": error ? "true" : undefined, "aria-describedby": hint || error ? noteId : undefined }) : children;
  return <div>
    <label htmlFor={id} className="s-label">{label}</label>
    {control}
    {(error || hint) && <p id={noteId} className="s-note" data-tone={error ? "error" : undefined}>{error || hint}</p>}
  </div>;
}
export function Input(props) { return <input className="s-input" {...props} />; }
export function TextArea(props) { return <textarea className="s-input" {...props} />; }
export function Select({ children, ...props }) { return <select className="s-input" {...props}>{children}</select>; }
/** System-style feedback line under a form: REQUEST.SENT ✓ */
export function FormNote({ tone, children }) {
  return <p className="s-note" data-tone={tone} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}

/* ── footer ── */

const FOOTER = [{
  heading: "Platform",
  links: [["Overview", "/platform"], ["Solutions", "/solutions"], ["Roadmap", "/roadmap"], ["Pricing", "/pricing"], ["Open platform", "/login"]]
}, {
  heading: "Products",
  links: [["Website & API Monitoring", "/solutions/website-api-monitoring", "live"], ["Security Monitoring", "/solutions/security-monitoring", "live"], ["Network & Device Monitoring", "/solutions/infrastructure-monitor", "live"], ["Kada Nigrani", "/solutions/kada-nigrani", "live"], ["Incident Management", "/solutions/incident-management", "live"], ["Multi-Channel Alerting", "/solutions/alerting", "live"], ["Asset Inventory", "/solutions/asset-inventory", "live"], ["Cyber Sachet", "/cybersachet", "live"], ["Moonsav ITOps Academy", "/academy", "live"], ["DevOps Monitoring", "/solutions/devops-monitor", "roadmap"]]
}, {
  heading: "Resources",
  links: [["Resources & FAQ", "/resources"], ["Verify a certificate", "/verify"], ["Download monitoring agent", "/kada-nigrani-agent.sh", "download"]]
}, {
  heading: "Company",
  links: [["Why ITOps exists", "/company"], ["Contact", "/contact"], ["Become a reseller", "/partners"]]
}];

function Newsletter() {
  const [email, setEmail] = useState("");
  const m = useMutation({ mutationFn: () => submitWaitlistSignup({ email, product: "newsletter" }) });
  if (m.isSuccess) return <FormNote tone="ok">Subscription.created ✓ — we'll keep you posted.</FormNote>;
  return <form onSubmit={e => { e.preventDefault(); m.mutate(); }} className="w-full max-w-sm">
    <label htmlFor="sf-news" className="s-label">Product updates, no noise</label>
    <div className="flex gap-2">
      <input id="sf-news" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="s-input" autoComplete="email" />
      <button type="submit" className="s-btn shrink-0" data-kind="ghost" disabled={m.isPending}>{m.isPending ? "Sending" : "Subscribe"}</button>
    </div>
    {m.isError && <FormNote tone="error">Request failed — please try again.</FormNote>}
  </form>;
}

export function StoryFooter() {
  return <footer className="relative border-t border-[var(--s-line)] bg-[var(--s-bg2)] px-6 pb-8 pt-20 md:px-10">
    <div className="mx-auto max-w-[1600px]">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <Signal />
          <p className="s-display mt-6">Keep watching.</p>
          <p className="s-body mt-5">Your infrastructure never stops moving.</p>
        </div>
        <div className="lg:justify-self-end"><Newsletter /></div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 border-t border-[var(--s-line)] pt-12 md:grid-cols-4">
        {FOOTER.map(col => <nav key={col.heading} aria-label={col.heading}>
          <p className="s-mono">{col.heading}</p>
          <ul className="mt-5 space-y-3">
            {col.links.map(([label, to, flag]) => <li key={label} className="flex items-center gap-2.5 text-sm">
              {flag === "download" ? <a href={to} download className="text-[var(--s-dim)] transition-colors hover:text-[var(--s-fg)]">{label} ↓</a> : <Link to={to} className="text-[var(--s-dim)] transition-colors hover:text-[var(--s-fg)]">{label}</Link>}
              {flag === "roadmap" && <span className="s-status !text-[8.5px]" data-kind="roadmap">Roadmap</span>}
            </li>)}
          </ul>
        </nav>)}
      </div>

      <div className="mt-14 flex flex-col gap-2 text-sm text-[var(--s-dim)] sm:flex-row sm:items-center sm:gap-8">
        <a href="tel:+9779803350658" className="transition-colors hover:text-[var(--s-fg)]">+977 980-335-0658</a>
        <span>Kathmandu, Nepal</span>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--s-line)] pt-6 md:flex-row md:items-center md:justify-between">
        <PlatformStatus online="System online" />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--s-faint)]">
          <span>© {new Date().getFullYear()} ITOps Solution</span>
          <Link to="/privacy" className="transition-colors hover:text-[var(--s-fg)]">Privacy</Link>
          <Link to="/terms" className="transition-colors hover:text-[var(--s-fg)]">Terms</Link>
          <Link to="/cookies" className="transition-colors hover:text-[var(--s-fg)]">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>;
}

/* ── the shell ── */

/** Wraps a redesigned page in the ITOps world: tokens, navigation, footer. */
export function StoryShell({ children, spine = false, hideSpine = false }) {
  return <div className="story antialiased">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[var(--s-fg)] focus:px-3 focus:py-2 focus:text-sm focus:text-[var(--s-bg)]">Skip to content</a>
    <StoryNav />
    <main id="main">{children}</main>
    {spine && !hideSpine && <SpineIndicator />}
    <StoryFooter />
  </div>;
}

/** A redesigned page inside the site's own navigation and footer. */
export function SitePage({ children }) {
  return <div className="story antialiased">
    <MarketingNav />
    <main id="main">{children}</main>
    <MarketingFooter />
  </div>;
}
