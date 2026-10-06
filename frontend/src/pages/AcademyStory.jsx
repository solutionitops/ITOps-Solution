// Moonsav ITOps Academy: a technical learning journey — learn, practice,
// assess, certify. Distinct from Cyber Sachet (security awareness for everyone);
// this is engineering education. Tracks, lab tiers, environments, certification
// paths and FAQ are the academy's own published content.
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { CERTIFICATION_PATHS, ITOPS_PROJECTS } from "../data/itopsAcademyCourses";
import { FAQ, LAB_TIERS, PHILOSOPHY_STEPS, TRACKS } from "../data/academyPage";
import { Btn, Capabilities, NextPage, PageCTA, PageHero, Section } from "../story/Page";
import { Key, StoryShell, useHashScroll, usePageMeta } from "../story/Shell";
import { LearningJourney } from "../story/visuals";

const BLUE = "var(--s-blue)";

export default function AcademyStory() {
  usePageMeta("Moonsav ITOps Academy — technical learning · ITOps Solution", "DevOps, DevSecOps and SRE learning with production-style simulation, graded quizzes and verifiable certificates.");
  useHashScroll();
  const planned = useQuery({ queryKey: ["content", "academy", "planned_capabilities"], queryFn: () => fetchContentItems("academy", "planned_capabilities") });
  const roadmap = (planned.data ?? []).map(i => ({ title: i.title, detail: i.body }));
  const projects = Object.values(ITOPS_PROJECTS);

  return <StoryShell>
    <PageHero
      kicker="Moonsav ITOps Academy · Technical learning"
      kickerTone={BLUE}
      status="live"
      title={<>Learn the system. Build the system. <span style={{ color: BLUE }}>Operate the system.</span></>}
      lead="An interactive DevOps, DevSecOps and SRE learning platform with production-style simulation — for engineers who learn by running things, breaking them, and fixing them."
      chain={["Learn", "Practice", "Assess", "Certify"]}
      chainTone={BLUE}
      visual={<LearningJourney />}
      wide
      actions={<><Btn to="/training/academy">Launch engineer workspace</Btn><Btn href="#tracks" kind="ghost">See the tracks</Btn></>}
    />

    <Section tone="alt" kicker="The operating loop" title="How a production engineer actually works.">
      <ol className="s-rise flex flex-wrap items-center gap-x-2.5 gap-y-3">
        {PHILOSOPHY_STEPS.map((s, i) => <li key={s} className="flex items-center gap-2.5">
          <span className="s-chip" data-tone="plain">{s}</span>
          {i < PHILOSOPHY_STEPS.length - 1 && <span aria-hidden className="text-[var(--s-faint)]">→</span>}
        </li>)}
      </ol>
    </Section>

    <Section id="tracks" kicker="Learn" title="Four tracks, from foundation to SRE.">
      {TRACKS.map((t, i) => <div key={t.title} className="s-rise s-row grid-cols-1 md:grid-cols-[56px_1fr_1fr] md:gap-x-12" style={{ "--i": i }}>
        <span className="s-mono">0{i + 1}</span>
        <div>
          <h3 className="s-h3">{t.title.replace(/^Track \d+ — /, "")}</h3>
          <p className="s-body mt-3 max-w-lg">{t.desc}</p>
        </div>
        <ul className="flex flex-wrap content-start gap-2">
          {t.topics.map(topic => <li key={topic} className="s-chip" style={{ "--chip": BLUE }}>{topic}</li>)}
        </ul>
      </div>)}
    </Section>

    <Section tone="alt" kicker="Practice" title="Labs that get progressively more real.">
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-[var(--s-line)] bg-[var(--s-line)] md:grid-cols-2">
        {LAB_TIERS.map((t, i) => <li key={t.tier} className="s-rise bg-[var(--s-panel)] p-6" style={{ "--i": i }}>
          <div className="flex items-center justify-between gap-3">
            <span className="s-mono">{t.tier}</span>
            <span className="s-mono !text-[9.5px]" style={{ color: BLUE }}>{t.badge}</span>
          </div>
          <h3 className="mt-4 text-xl font-medium tracking-tight">{t.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--s-dim)]">{t.desc}</p>
        </li>)}
      </ul>
      <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
        {projects.map((p, i) => <div key={p.id} className="s-rise border-l border-[var(--s-line2)] pl-6" style={{ "--i": i }}>
          <p className="s-mono" style={{ color: BLUE }}>{p.badge}</p>
          <h3 className="s-h3 mt-3">{p.name}</h3>
          <p className="mt-1 text-sm text-[var(--s-dim)]">{p.tagline}</p>
          <p className="s-body mt-4">{p.description}</p>
        </div>)}
      </div>
    </Section>

    <Section kicker="Assess and certify" title="Certificates you have to earn." lead="Every certification is gated by verified lab completions and resolved incidents — and each one can be verified.">
      <ul className="grid gap-x-12 md:grid-cols-2">
        {CERTIFICATION_PATHS.map((c, i) => <li key={c.id} className="s-rise s-row grid-cols-[1fr_auto] !border-b-0" style={{ "--i": Math.min(i, 6) }}>
          <span className="text-lg font-medium tracking-tight">{c.title}</span>
          <span className="s-mono !text-[9.5px]" style={{ color: BLUE }}>{c.level}</span>
          <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{c.description}</span>
          <span className="col-span-2 flex flex-wrap gap-x-6 gap-y-1.5">
            <Key k="Code" v={c.code} />
            <Key k="Labs" v={String(c.requiredLabsCount)} />
            <Key k="Incidents" v={String(c.requiredIncidentsCount)} />
            <Key k="Min score" v={`${c.minScore}%`} />
          </span>
        </li>)}
      </ul>
      <p className="s-rise mt-8"><Btn to="/verify" kind="ghost">Verify a certificate</Btn></p>
    </Section>

    {roadmap.length > 0 && <Section tone="alt" kicker="Status" title="What is planned next." lead="These are not available yet.">
      <Capabilities live={[]} roadmap={roadmap} />
    </Section>}

    <Section kicker="Questions" title="Before you start.">
      {FAQ.map((f, i) => <details key={f.q} className="s-rise group border-t border-[var(--s-line)] py-5 last:border-b" style={{ "--i": i }}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
          <span className="text-lg font-medium tracking-tight md:text-xl">{f.q}</span>
          <span aria-hidden className="mt-1 text-[var(--s-dim)] transition-transform group-open:rotate-45">+</span>
        </summary>
        <p className="s-body mt-4 max-w-3xl">{f.a}</p>
      </details>)}
    </Section>

    <PageCTA title="Operate. Learn. Improve." lead="Open the workspace and start with the first lab.">
      <Btn to="/training/academy">Launch engineer workspace</Btn>
      <Btn to="/contact" kind="ghost">Ask about access</Btn>
    </PageCTA>
    <NextPage from="Certified" label="Roadmap" to="/roadmap" />
  </StoryShell>;
}
