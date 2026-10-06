// The Platform page: the "Six Services, One Dashboard" hero, then one continuous
// story — SIGNAL → SYSTEM → INCIDENT → RESPONSE → INTELLIGENCE → CONTROL.
// The previous card-based platform page lives on at /platform-classic
// (pages/Platform.jsx).
import { memo, useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import { ServiceConstellation } from "../components/ServiceConstellation";
import { fetchContentItems } from "../api/endpoints";
import { ActsOneToFive } from "../story/Acts";
import { Control, Expand, Finale, Human, Learn, Observe, Protect, Respond } from "../story/Chapters";
import { Architecture, Workflow } from "../story/PlatformExtras";
import { SpineIndicator } from "../story/spine";
import "../story/story.css";

// The story below the hero is long. Building all of it before showing anything
// kept the previous page on screen for seconds on a phone, so the hero is shown
// first and these sections are then added one at a time while the browser is
// idle. Each is memoized: adding the next one never re-renders the others.
const CHAPTERS = [ActsOneToFive, Architecture, Workflow, Observe, Protect, Human, Respond, Control, Expand, Learn, Finale].map(C => memo(C));

function useBuiltSoFar(total) {
  // a link straight to a #section needs the whole page there at once
  const [n, setN] = useState(() => (window.location.hash ? total : 0));
  useEffect(() => {
    if (n >= total) return undefined;
    const idle = window.requestIdleCallback ?? (cb => setTimeout(cb, 80));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    // A plain update, not a transition: the hero's animation updates constantly, and a
    // transition is restarted every time one of those lands, so it would rarely finish.
    const id = idle(() => setN(v => v + 1), { timeout: 150 });
    return () => cancel(id);
  }, [n, total]);
  return n;
}

/** Hero: the six live services orbiting the ITOps core. It keeps the site's own typeface
 *  (it was designed in it), and has no `overflow-hidden` ancestor — its stage is sticky. */
const Hero = memo(function Hero({ heroRef }) {
  const {
    data: features,
    isLoading: featuresLoading,
    isError: featuresError,
    refetch: refetchFeatures
  } = useQuery({
    queryKey: ["content", "landing", "features"],
    queryFn: () => fetchContentItems("landing", "features")
  });
  return <section ref={heroRef} id="hero" data-section="services" className="relative w-full" style={{ fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif" }}>
    <ServiceConstellation features={features} loading={featuresLoading} error={featuresError} onRetry={() => refetchFeatures()} />
  </section>;
});

export default function PlatformStory() {
  const built = useBuiltSoFar(CHAPTERS.length);
  // The hero has its own step counter in the same corner, so the story's spine
  // indicator stays out of the way until the hero has scrolled past.
  const heroRef = useRef(null);
  const inHero = useInView(heroRef, { margin: "0px 0px -35% 0px" });
  return <div className="story antialiased">
    <MarketingNav />
    <main>
      <Hero heroRef={heroRef} />
      {/* Acts I–V (signal → control plane), the modules, the incident, and the return —
          in order, as each one is ready. */}
      {CHAPTERS.slice(0, built).map((Chapter, i) => <Chapter key={i} />)}
      {built < CHAPTERS.length && <div className="grid h-[60svh] place-items-center" role="status">
        <span className="s-mono flex items-center gap-3"><span className="s-signal" aria-hidden />Loading the story</span>
      </div>}
    </main>
    {!inHero && <SpineIndicator />}
    {built === CHAPTERS.length && <MarketingFooter />}
  </div>;
}
