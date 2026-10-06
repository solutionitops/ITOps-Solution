// One product page, in the shared structure: intro → the story → how it works →
// capabilities (live / roadmap) → who it's for → call to action → next page.
// Products with a custom story live in story/products.jsx; any other published
// product is rendered from its record alone.
import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { submitWaitlistSignup } from "../api/endpoints";
import { Btn, Bullets, Capabilities, Chapter, ChipList, HowItWorks, NextPage, PageCTA, PageError, PageHero, PageLoading, Section, useSolution } from "../story/Page";
import { FormNote, StoryShell, usePageMeta } from "../story/Shell";
import { PRODUCTS, PRODUCT_REDIRECTS } from "../story/products";
import { PlannedFlow } from "../story/visuals";

function Waitlist({ product }) {
  const [email, setEmail] = useState("");
  const m = useMutation({ mutationFn: () => submitWaitlistSignup({ email, product }) });
  if (m.isSuccess) return <FormNote tone="ok">Waitlist.joined ✓ — we'll write when it ships.</FormNote>;
  return <form onSubmit={e => { e.preventDefault(); m.mutate(); }} className="mx-auto w-full max-w-md text-left">
    <label htmlFor="waitlist-email" className="s-label">Work email</label>
    <div className="flex gap-2">
      <input id="waitlist-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="s-input" autoComplete="email" />
      <button type="submit" className="s-btn shrink-0" data-kind="primary" disabled={m.isPending}>{m.isPending ? "Sending" : "Join the waitlist"}</button>
    </div>
    {m.isError && <FormNote tone="error">Request failed — please try again.</FormNote>}
  </form>;
}

export default function ProductStory() {
  const { slug } = useParams();
  const cfg = PRODUCTS[slug];
  const sol = useSolution(cfg?.cms ?? slug);
  const stat = cfg?.staticItem;
  const title = cfg?.kicker ?? sol.item?.title ?? "Product";
  usePageMeta(cfg?.meta?.[0] ?? `${title} — ITOps Solution`, cfg?.meta?.[1] ?? sol.item?.body ?? "");

  if (PRODUCT_REDIRECTS[slug]) return <Navigate to={`/solutions/${PRODUCT_REDIRECTS[slug]}`} replace />;
  if (!stat && sol.isLoading) return <StoryShell><PageLoading /></StoryShell>;
  if (!stat && sol.isError) return <StoryShell><PageError message="This product couldn't be loaded." /></StoryShell>;
  if (!stat && !sol.item) return <StoryShell><PageError message="We couldn't find that product." /></StoryShell>;

  const status = stat?.status ?? sol.status;
  const keep = cfg?.capFilter ?? (() => true);
  const live = stat?.live ?? sol.live.filter(keep);
  const roadmap = stat?.roadmap ?? sol.roadmap.filter(keep);
  const isRoadmap = status !== "live";

  return <StoryShell>
    <PageHero
      kicker={title}
      kickerTone={cfg?.kickerTone}
      status={status}
      title={cfg?.headline ?? sol.item.subtitle ?? sol.item.title}
      lead={cfg?.lead ?? sol.item.body}
      chain={cfg?.chain}
      chainTone={cfg?.chainTone}
      visual={cfg?.hero ?? (roadmap.length > 0 ? <PlannedFlow items={roadmap.map(c => c.title)} /> : null)}
      note={cfg ? cfg.heroNote ?? "Illustration · sample data" : "Planned · not available yet"}
      actions={isRoadmap ? <Btn href="#get">Join the waitlist</Btn> : <><Btn to={cfg?.cta?.[2]?.[1] ?? "/register"}>{cfg?.cta?.[2]?.[0] ?? "Start monitoring"}</Btn><Btn href="#capabilities" kind="ghost">What's included</Btn></>}
    />

    {cfg?.chapters && <Section tone="alt" kicker="The story" title={cfg.storyTitle}>
      {cfg.chapters.map(([n, t, body, visual], i) => <Chapter key={n} n={n} title={t} visual={visual} i={i}>{body}</Chapter>)}
    </Section>}

    {sol.workflow.length > 0 && !cfg?.staticItem && <Section kicker="How it works" title="From setup to signal.">
      <HowItWorks steps={sol.workflow} />
    </Section>}

    <Section id="capabilities" tone={sol.workflow.length ? "alt" : "plain"} kicker="Status" title={isRoadmap ? "Planned — not shipped yet." : "What is live, and what is next."} lead={isRoadmap ? "Everything below is on the roadmap. None of it is available today." : undefined}>
      <Capabilities live={live} roadmap={roadmap} />
    </Section>

    {(sol.whoFor.length > 0 || sol.tech.length > 0) && !stat && <Section kicker="Who it's for" title="Built for the people who get paged.">
      {sol.whoFor.length > 0 && <Bullets items={sol.whoFor} />}
      {sol.tech.length > 0 && <div className="s-rise mt-12">
        <p className="s-mono mb-4">Works across</p>
        <ChipList items={sol.tech} />
      </div>}
    </Section>}

    <div id="get">
      {isRoadmap ? <PageCTA title="Not shipped yet." lead="Join the waitlist and we'll tell you when it is — no dates promised until it's real.">
        <Waitlist product={sol.waitlistProduct ?? slug} />
      </PageCTA> : <PageCTA title={cfg?.cta?.[0] ?? "Ready when you are."} lead={cfg?.cta?.[1] ?? "Start on the free Starter plan."}>
        <Btn to={cfg?.cta?.[2]?.[1] ?? "/register"}>{cfg?.cta?.[2]?.[0] ?? "Start monitoring"}</Btn>
        <Btn to={cfg?.cta?.[3]?.[1] ?? "/pricing"} kind="ghost">{cfg?.cta?.[3]?.[0] ?? "See plans"}</Btn>
      </PageCTA>}
    </div>

    {cfg?.next ? <NextPage from={cfg.next[0]} label={cfg.next[1]} to={cfg.next[2]} /> : <NextPage from="ITOps" label="All products" to="/solutions" />}
  </StoryShell>;
}
