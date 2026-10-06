// Roadmap: an infrastructure map being expanded, not a dated timeline. Module
// status and every planned capability are read from the published content, and
// no dates are shown because none are committed.
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { InView, Status } from "../story/World";
import { Btn, NextPage, PageCTA, PageHero, PageLoading, Section, usePlatformModules, useSolution } from "../story/Page";
import { Key, StoryShell, usePageMeta } from "../story/Shell";

const CORE = ["Website", "Server", "Network", "Security", "Incident", "Assets"];

/** Today's core, connected — and the next layers, dashed, reaching out from it. */
function ExpansionMap({ future }) {
  return <div className="s-panel p-6 md:p-8">
    <p className="s-mono" style={{ color: "var(--s-green)" }}>Live today</p>
    <ul className="mt-4 grid grid-cols-3 gap-2">
      {CORE.map(c => <li key={c} className="s-chip justify-center">{c}</li>)}
    </ul>
    <div className="mx-auto my-1 flex w-px flex-col items-center">
      <span aria-hidden className="h-6 w-px bg-[var(--s-line2)]" />
    </div>
    <p className="s-chip mx-auto flex w-fit justify-center" data-tone="itops">ITOps control plane</p>
    <div className="mx-auto my-1 flex w-px flex-col items-center">
      <span aria-hidden className="h-6 w-px border-l border-dashed border-[var(--s-gray)]" />
    </div>
    <p className="s-mono" style={{ color: "var(--s-gray)" }}>Expanding</p>
    <ul className="mt-4 grid grid-cols-2 gap-2">
      {future.map(c => <li key={c} className="s-chip justify-center !whitespace-normal text-center" data-tone="roadmap">{c}</li>)}
    </ul>
  </div>;
}

function ModuleList({ items, kind }) {
  return <ul className="grid gap-x-12 md:grid-cols-2">
    {items.map((m, i) => {
      const inner = <>
        <span className="s-row-title text-lg font-medium tracking-tight" style={kind === "roadmap" ? { color: "var(--s-dim)" } : undefined}>{m.title}</span>
        <Status kind={kind} />
        {m.body && <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{m.body}</span>}
      </>;
      return <li key={m.id} className="s-rise" style={{ "--i": Math.min(i, 8) }}>
        {m.href ? <Link to={m.href} className="s-row grid-cols-[1fr_auto] !border-b-0 !py-5">{inner}</Link> : <div className="s-row grid-cols-[1fr_auto] !border-b-0 !py-5">{inner}</div>}
      </li>;
    })}
  </ul>;
}

export default function RoadmapStory() {
  usePageMeta("Roadmap — where the ITOps platform is going", "What is live in ITOps today and which layers are planned next: DevOps, cloud, endpoint and reporting. No dates until a module is real.");
  const mods = usePlatformModules();
  const sol = useSolution("");
  const extra = useQuery({
    queryKey: ["content", "roadmap-extras"],
    queryFn: async () => ({ cyber: await fetchContentItems("cybersachet", "planned_capabilities"), academy: await fetchContentItems("academy", "planned_capabilities") }),
    staleTime: 60_000
  });
  if (mods.isLoading || sol.isLoading) return <StoryShell><PageLoading /></StoryShell>;

  const modules = mods.data ?? [];
  const live = modules.filter(m => m.status === "live");
  const planned = modules.filter(m => m.status !== "live");
  // planned capabilities inside each product, straight from its published record
  const groups = sol.all.map(s => ({ title: s.title, items: (Array.isArray(s.metadata?.capabilities) ? s.metadata.capabilities : []).filter(c => c.status !== "live").map(c => ({ title: c.title, detail: c.detail })) })).filter(g => g.items.length);
  if (extra.data?.cyber?.length) groups.push({ title: "Cyber Sachet", items: extra.data.cyber.map(c => ({ title: c.title, detail: c.body })) });
  if (extra.data?.academy?.length && !groups.some(g => /academy/i.test(g.title))) groups.push({ title: "Moonsav ITOps Academy", items: extra.data.academy.map(c => ({ title: c.title, detail: c.body })) });

  return <StoryShell>
    <PageHero
      kicker="Roadmap"
      title={<>The platform, <span className="s-accent">still expanding.</span></>}
      lead="What is live today, and the layers being added next. There are no dates on this page: a module is announced when it's real, not before."
      chain={["Live today", "Expanding", "Next"]}
      visual={<ExpansionMap future={planned.map(m => m.title)} />}
      note="From the published module list"
      actions={<><Btn href="#planned">What's planned</Btn><Btn to="/platform" kind="ghost">The platform story</Btn></>}
    />

    <Section tone="alt" kicker="Live today" title="The core is real.">
      <InView amount={0.05}>
        <p className="s-rise mb-8 flex flex-wrap gap-x-8 gap-y-2">
          <Key k="Modules.live" v={String(live.length).padStart(2, "0")} tone="ok" />
          <Key k="Modules.roadmap" v={String(planned.length).padStart(2, "0")} />
        </p>
        <ModuleList items={live} kind="live" />
      </InView>
    </Section>

    <Section id="planned" kicker="Expanding" title="New layers, connected to the same control plane." lead="These are planned. None of them is available today.">
      <ModuleList items={planned} kind="roadmap" />
    </Section>

    {groups.length > 0 && <Section tone="alt" kicker="Next" title="Inside the products you already use." lead="Planned capabilities, grouped by product. Open a product to see what is coming to it.">
      <div className="grid gap-x-12 md:grid-cols-2">
        {groups.map(g => <details key={g.title} className="s-rise group border-t border-[var(--s-line)] py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <span className="text-lg font-medium tracking-tight">{g.title}</span>
            <span className="flex items-center gap-4">
              <span className="s-mono !text-[9.5px]">{String(g.items.length).padStart(2, "0")} planned</span>
              <span aria-hidden className="text-[var(--s-dim)] transition-transform group-open:rotate-45">+</span>
            </span>
          </summary>
          <ul className="mt-4 space-y-3">
            {g.items.map(c => <li key={c.title} className="border-l border-dashed border-[var(--s-gray)] pl-4">
              <p className="text-[15px] font-medium text-[var(--s-dim)]">{c.title}</p>
              {c.detail && <p className="mt-1 text-sm leading-relaxed text-[var(--s-faint)]">{c.detail}</p>}
            </li>)}
          </ul>
        </details>)}
      </div>
    </Section>}

    <PageCTA title="Start with what's live." lead="The core platform works today — no waitlist required.">
      <Btn to="/register">Start monitoring</Btn>
      <Btn to="/solutions" kind="ghost">All products</Btn>
    </PageCTA>
    <NextPage from="Next" label="Why ITOps exists" to="/company" />
  </StoryShell>;
}
