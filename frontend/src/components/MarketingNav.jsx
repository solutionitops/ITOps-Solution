import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BrandLogo } from "./BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

const scrollToHero = () => {
  const hero = document.getElementById("hero") || document.getElementById("hero-mobile");
  if (hero) {
    hero.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
};

function openSearch() {
  window.dispatchEvent(new Event("open-command-palette"));
}

function SearchButton({ className = "" }) {
  return <button type="button" onClick={openSearch} aria-label="Search pages and products" className={`flex items-center gap-2 rounded-full border light:border-white/60 border-transparent px-3.5 py-2 text-sm text-neutral-300 light:text-slate-500 backdrop-blur-md transition-colors hover:text-white light:hover:text-slate-900 ${className}`}>
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
    <span className="hidden lg:inline">Search</span>
    <kbd className="hidden rounded-md border border-white/15 light:border-slate-900/15 px-1.5 py-0.5 text-[10px] text-white/40 light:text-slate-400 lg:inline">⌘K</kbd>
  </button>;
}

const NAV_LINKS = [{
  label: "Platform",
  to: "/platform"
}, {
  label: "Products",
  to: "/solutions"
}, {
  label: "Pricing",
  to: "/pricing"
}, {
  label: "Company",
  to: "/company"
}, {
  label: "Support",
  to: "/support"
}];

export function MarketingNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, targetPath) => {
    setMobileOpen(false);
    if (location.pathname === targetPath) {
      e.preventDefault();
      scrollToHero();
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  };

  return <>
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-4 px-6 pt-6 md:px-10 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3">
        <Link to="/" onClick={(e) => handleNavClick(e, "/")} className="flex items-center rounded-full border border-white/10 light:border-white/60 bg-neutral-900/90 light:bg-white/70 py-1.5 pl-3.5 pr-5 backdrop-blur-md light:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_30px_-12px_rgba(15,23,42,0.18)]">
          {/* Smaller on phones so the pill doesn't crowd the search/CTA buttons. */}
          <span className="flex h-10 items-center sm:hidden"><BrandLogo size={30} /></span>
          <span className="hidden sm:flex"><BrandLogo size={40} /></span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full bg-neutral-900/90 light:bg-white/70 border light:border-white/60 border-transparent light:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_30px_-12px_rgba(15,23,42,0.18)] px-3 py-2 backdrop-blur-md md:flex">
          {NAV_LINKS.map(link => <NavLink key={link.label} to={link.to} onClick={(e) => handleNavClick(e, link.to)} className={({
            isActive
          }) => `rounded-full px-5 py-2 text-sm transition-colors ${isActive ? "bg-white text-black light:bg-slate-900 light:text-white" : "text-neutral-300 light:text-slate-500 hover:text-white light:hover:text-slate-900"}`}>
            {link.label}
          </NavLink>)}
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-4">
        <SearchButton className="bg-neutral-900/90 light:bg-white/70 light:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_30px_-12px_rgba(15,23,42,0.18)]" />
        <ThemeToggle className="bg-neutral-900/90 light:bg-white/70 backdrop-blur-md light:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_30px_-12px_rgba(15,23,42,0.18)]" />
        <Link to="/login" onClick={(e) => handleNavClick(e, "/login")} className="hidden text-sm text-neutral-300 light:text-slate-500 transition-colors hover:text-white light:hover:text-slate-900 sm:inline">
          Log in
        </Link>
        <Link to="/pricing" onClick={(e) => handleNavClick(e, "/pricing")} className="rounded-full bg-white text-black light:bg-slate-900 light:text-white whitespace-nowrap px-4 py-3 text-sm font-normal transition-colors sm:px-6 hover:bg-neutral-200 light:hover:bg-slate-800 light:shadow-[0_8px_24px_-10px_rgba(15,23,42,0.4)]">
          Get Started
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/90 light:bg-white/70 text-neutral-300 light:text-slate-600 border light:border-white/60 border-transparent backdrop-blur-md hover:text-white light:hover:text-slate-900 md:hidden"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
    </nav>

    {mobileOpen && (
      <div className="fixed inset-x-4 top-20 z-50 rounded-2xl border border-white/10 light:border-slate-200 bg-neutral-950/95 light:bg-white/95 p-4 shadow-2xl backdrop-blur-xl md:hidden">
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={(e) => handleNavClick(e, link.to)}
              className={({ isActive }) => `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-black light:bg-slate-900 light:text-white"
                  : "text-neutral-300 light:text-slate-600 hover:bg-white/5 light:hover:bg-slate-100 hover:text-white light:hover:text-slate-900"
              }`}
            >
              <span>{link.label}</span>
              <span className="text-xs opacity-50">→</span>
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-white/10 light:border-slate-200 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={(e) => handleNavClick(e, "/login")}
              className="rounded-xl px-4 py-2.5 text-center text-sm text-neutral-300 light:text-slate-600 hover:bg-white/5"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    )}
  </>;
}