// The Platform page: the "Six Services, One Dashboard" hero, then one continuous
// story — SIGNAL → SYSTEM → INCIDENT → RESPONSE → INTELLIGENCE → CONTROL.
// The previous card-based platform page lives on at /platform-classic
// (pages/Platform.jsx).
import { useRef } from "react";
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

export default function PlatformStory() {
  const {
    data: features,
    isLoading: featuresLoading,
    isError: featuresError,
    refetch: refetchFeatures
  } = useQuery({
    queryKey: ["content", "landing", "features"],
    queryFn: () => fetchContentItems("landing", "features")
  });
  // The hero has its own step counter in the same corner, so the story's spine
  // indicator stays out of the way until the hero has scrolled past.
  const heroRef = useRef(null);
  const inHero = useInView(heroRef, { margin: "0px 0px -35% 0px" });
  return <div className="story antialiased">
    <MarketingNav />
    <main>
      {/* Hero: the six live services orbiting the ITOps core. It keeps the site's own typeface
          (it was designed in it), and has no `overflow-hidden` ancestor — its stage is sticky. */}
      <section ref={heroRef} id="hero" data-section="services" className="relative w-full" style={{ fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif" }}>
        <ServiceConstellation features={features} loading={featuresLoading} error={featuresError} onRetry={() => refetchFeatures()} />
      </section>

      {/* Acts I–V: signal → environment → signals → fragmentation → connection → control plane */}
      <ActsOneToFive />
      {/* Now the modules have meaning */}
      <Architecture />
      <Workflow />
      <Observe />
      <Protect />
      <Human />
      {/* Act VI: something breaks → incident → alert → recovery */}
      <Respond />
      <Control />
      <Expand />
      <Learn />
      {/* The return: the same environment, the same signal, one system */}
      <Finale />
    </main>
    {!inHero && <SpineIndicator />}
    <MarketingFooter />
  </div>;
}
