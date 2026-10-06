// A loader for page-to-page navigation.
//
// Moving to a heavy page (Platform above all) used to leave the previous page
// frozen on screen while the new one downloaded and was built — several seconds
// on a phone, with no sign that the tap had registered. This covers that gap:
// it appears as soon as a link to another page is clicked, the new page loads
// behind it, and it fades away once that page is on screen.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import logoDark from "../assets/itops-logo-lockup-dark.svg";
import logoLight from "../assets/itops-logo-lockup.svg";

const SHOW_AFTER = 220;   // ms — navigations faster than this never show the loader
const GIVE_UP_AFTER = 12000;

/** The internal page a click will navigate to, or null. */
function destination(event) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const a = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!a || a.target === "_blank" || a.hasAttribute("download")) return null;
  let url;
  try { url = new URL(a.href, window.location.href); } catch { return null; }
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null; // same page (or an in-page #section)
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return null;   // a file, not a page
  return url.pathname;
}

export function RouteLoader() {
  const { pathname } = useLocation();
  const [state, setState] = useState("idle"); // idle → loading → leaving → idle
  const timers = useRef({});

  useEffect(() => {
    const t = timers.current;
    const onClick = e => {
      if (!destination(e)) return;
      clearTimeout(t.show); clearTimeout(t.giveUp); clearTimeout(t.leave);
      t.show = setTimeout(() => setState("loading"), SHOW_AFTER);
      t.giveUp = setTimeout(() => setState("idle"), GIVE_UP_AFTER);
    };
    // Capture phase: this must run before the router's own click handler, which
    // changes the address straight away (and would make every link look "same page").
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(t.show); clearTimeout(t.giveUp); clearTimeout(t.leave);
    };
  }, []);

  // The location only changes once the new page has rendered, so this is "it's ready".
  // A layout effect, so a pending "show" timer is cancelled in the same commit and the
  // loader can't flash up after a page that was already quick.
  useLayoutEffect(() => {
    const t = timers.current;
    clearTimeout(t.show); clearTimeout(t.giveUp);
    setState(s => (s === "loading" ? "leaving" : s));
    t.leave = setTimeout(() => setState("idle"), 320);
    return () => clearTimeout(t.leave);
  }, [pathname]);

  if (state === "idle") return null;
  return <div className="route-loader" data-page-loader data-state={state} role="status" aria-live="polite">
    <img src={logoDark} alt="" className="block light:hidden" />
    <img src={logoLight} alt="" className="hidden light:block" />
    <span className="route-loader-bar" aria-hidden><i /></span>
    <span className="sr-only">Loading page…</span>
  </div>;
}
