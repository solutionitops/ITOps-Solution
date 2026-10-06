import { useEffect, useState } from "react";

// One shared, frame-throttled scroll/resize listener for every reveal on the page.
const checks = new Set();
let frame = 0;
function run() {
  frame = 0;
  checks.forEach(fn => fn());
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(run);
}
function subscribe(fn) {
  if (checks.size === 0) {
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  checks.add(fn);
  return () => {
    checks.delete(fn);
    if (checks.size === 0) {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };
}

/**
 * True once the element has scrolled into view; stays true.
 *
 * Scroll reveals used IntersectionObserver alone, so a section stayed invisible
 * whenever the observer did not report. This measures the element's position
 * on scroll instead, so content cannot stay hidden once it is on screen.
 */
const isPhone = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

export function useSeen(ref, offset = 60) {
  // On phones content is shown straight away: nothing waits on a scroll animation.
  const [seen, setSeen] = useState(isPhone);
  useEffect(() => {
    if (seen) return undefined;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return; // not rendered (e.g. hidden at this breakpoint)
      const vh = window.innerHeight;
      const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      if (r.bottom > 0 && (r.top < vh - offset || (atEnd && r.top < vh))) setSeen(true);
    };
    check();
    const stop = subscribe(check);
    // content above can load late and move this element into view without a scroll
    const t1 = setTimeout(check, 400), t2 = setTimeout(check, 1500);
    return () => { stop(); clearTimeout(t1); clearTimeout(t2); };
  }, [ref, seen, offset]);
  return seen;
}
