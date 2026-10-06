// The story spine — SIGNAL → SYSTEM → INCIDENT → RESPONSE → INTELLIGENCE → CONTROL.
// Scenes report which step they are on; a fixed indicator shows it, so the
// visitor always knows where in the narrative they are.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";

export const SPINE = ["Signal", "System", "Incident", "Response", "Intelligence", "Control"];

let current = 0;
const subs = new Set();
export function setSpine(i) {
  if (i === current) return;
  current = i;
  subs.forEach(f => f());
}
function subscribe(f) {
  subs.add(f);
  return () => subs.delete(f);
}

/** Sets the spine step while this element crosses the middle of the viewport. */
export function useSpineSection(index) {
  const ref = useRef(null);
  const mid = useInView(ref, { margin: "-50% 0px -50% 0px" });
  useEffect(() => {
    if (mid) setSpine(index);
  }, [mid, index]);
  return ref;
}

export function SpineIndicator() {
  const i = useSyncExternalStore(subscribe, () => current, () => 0);
  return <div className="s-acts" aria-hidden>
    <span className="s-mono !text-[9.5px]" style={{ color: "var(--s-cyan)" }}>0{i + 1}</span>
    {SPINE.map((s, n) => <i key={s} data-on={n === i ? "1" : "0"} />)}
    <span className="s-mono !text-[9.5px]" style={{ color: "var(--s-fg)" }}>{SPINE[i]}</span>
  </div>;
}
