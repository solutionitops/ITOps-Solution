// Solutions: problem → capability → outcome. Organized around what goes wrong,
// so a visitor can find the right product without reading every page.
import { Link } from "react-router-dom";
import { InView, Kicker, Status } from "../story/World";
import { Btn, NextPage, PageCTA, PageHero, Section, useSolution } from "../story/Page";
import { StoryShell, useHashScroll, usePageMeta } from "../story/Shell";

const P = { web: ["Website & API Monitoring", "/solutions/website-api-monitoring"], inc: ["Incident Management", "/solutions/incident-management"], alert: ["Multi-Channel Alerting", "/solutions/alerting"], kada: ["Kada Nigrani", "/solutions/kada-nigrani"], sec: ["Security Monitoring", "/solutions/security-monitoring"], cyber: ["Cyber Sachet", "/cybersachet"], net: ["Network & Device Monitoring", "/solutions/infrastructure-monitor"], asset: ["Asset Inventory", "/solutions/asset-inventory"], dash: ["Enterprise Dashboard", "/platform#control"], academy: ["Moonsav ITOps Academy", "/academy"] };
const R = { devops: ["DevOps Monitoring", "/solutions/devops-monitor"], cloud: ["Cloud Monitoring", "/roadmap"], thresholds: ["Resource threshold alerts", "/roadmap"] };

const PROBLEMS = [
  ["When your website goes down", "You hear about it first, with the failing check and its cause attached.", [P.web, P.inc, P.alert], []],
  ["When your server degrades", "You see CPU, memory and disk from inside the machine, and whether each host is online.", [P.kada, P.inc], [R.thresholds]],
  ["When your security posture changes", "A score for every endpoint, an alert before a certificate expires, and training for the people behind them.", [P.sec, P.cyber], []],
  ["When your network becomes unreachable", "The exact connection error — refused, timed out, or unreachable — instead of a guess.", [P.net, P.inc], []],
  ["When your environment grows", "One inventory and one console, instead of a spreadsheet and five tabs.", [P.asset, P.dash], []],
  ["When your team needs to scale", "Train engineers today; DevOps and cloud visibility are on the roadmap.", [P.academy], [R.devops, R.cloud]]
];

// Products that have their own page but no entry in the published product list.
const EXTRA = [{ key: "asset-inventory", title: "Asset Inventory", subtitle: "One inventory of what you run", status: "live", to: "/solutions/asset-inventory" }, { key: "cybersachet", title: "Cyber Sachet", subtitle: "Security awareness training for your whole team", status: "live", to: "/cybersachet" }];
const linkFor = s => s.href ?? (s.itemKey === "alerting-incident-response" ? "/solutions/incident-management" : `/solutions/${s.itemKey}`);

function ProductIndex() {
  const { all, isLoading } = useSolution("");
  const rows = [...all.map(s => ({ key: s.itemKey, title: s.title, subtitle: s.subtitle, status: s.status === "live" ? "live" : "roadmap", to: linkFor(s) })), ...EXTRA].sort((a, b) => (a.status === b.status ? 0 : a.status === "live" ? -1 : 1));
  if (isLoading) return <p className="s-mono">Loading products<span className="animate-pulse">_</span></p>;
  return <ul className="grid gap-x-12 md:grid-cols-2">
    {rows.map((r, i) => <li key={r.key} className="s-rise" style={{ "--i": Math.min(i, 8) }}>
      <Link to={r.to} className="s-row grid-cols-[1fr_auto] !border-b-0 !py-5">
        <span className="s-row-title text-lg font-medium tracking-tight">{r.title}</span>
        <Status kind={r.status} />
        {r.subtitle && <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{r.subtitle}</span>}
      </Link>
    </li>)}
  </ul>;
}

export default function SolutionsStory() {
  usePageMeta("Solutions — what problem does ITOps solve?", "Start from the problem: a website goes down, a server degrades, security posture changes, a network becomes unreachable. See which ITOps capabilities answer each one.");
  useHashScroll();
  return <StoryShell>
    <PageHero
      kicker="Solutions"
      title={<>What problem are you <span className="s-accent">trying to solve?</span></>}
      lead="Start from what goes wrong, not from a product list. Each problem below maps to the capabilities that answer it — and says plainly which of them are live."
      chain={["Problem", "Capability", "Outcome"]}
      actions={<><Btn href="#problems">Find your problem</Btn><Btn href="#products" kind="ghost">All products</Btn></>}
    />

    <section id="problems" className="relative border-y border-[var(--s-line)] bg-[var(--s-bg2)] px-6 py-16 md:px-10 md:py-24">
      <InView className="mx-auto max-w-7xl" amount={0.05}>
        {PROBLEMS.map(([problem, outcome, live, planned], i) => <article key={problem} className="s-rise s-row grid-cols-1 md:grid-cols-[56px_1.1fr_1fr] md:gap-x-12" style={{ "--i": Math.min(i, 6) }}>
          <span className="s-mono">0{i + 1}</span>
          <div>
            <Kicker>Problem</Kicker>
            <h2 className="s-h2 mt-3 !text-[clamp(1.7rem,3.4vw,2.9rem)]">{problem}</h2>
          </div>
          <div>
            <p className="s-mono">Capability</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {live.map(([label, to]) => <li key={label}><Link to={to} className="s-chip transition-colors hover:border-[var(--s-cyan)]">{label}</Link></li>)}
              {planned.map(([label, to]) => <li key={label}><Link to={to} className="s-chip" data-tone="roadmap">{label} · roadmap</Link></li>)}
            </ul>
            <p className="s-mono mt-6">Outcome</p>
            <p className="s-body mt-2 max-w-md">{outcome}</p>
          </div>
        </article>)}
      </InView>
    </section>

    <Section id="products" kicker="Products" title="Every product, and whether it's live.">
      <ProductIndex />
    </Section>

    <PageCTA title="See how they connect." lead="Every product reports into the same control plane.">
      <Btn to="/platform">Explore the platform</Btn>
      <Btn to="/pricing" kind="ghost">See plans</Btn>
    </PageCTA>
    <NextPage from="Outcome" label="The platform story" to="/platform" />
  </StoryShell>;
}
