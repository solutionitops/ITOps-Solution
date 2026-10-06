// Resources: the operational knowledge centre. Honest about what exists — the
// FAQ and the tools are real; the article library is not published yet, and
// the page says so instead of showing placeholder posts.
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { Status } from "../story/World";
import { Btn, NextPage, PageCTA, PageHero, Section } from "../story/Page";
import { StoryShell, usePageMeta } from "../story/Shell";

const CATEGORIES = ["ITOps", "Linux", "Networking", "Cloud", "DevOps", "Security", "Monitoring", "Incident response", "How-to"];
const TOOLS = [
  ["Monitoring agent", "The Kada Nigrani agent script for Linux servers — plain bash and curl.", "/kada-nigrani-agent.sh", "download"],
  ["Verify a certificate", "Check that a Moonsav ITOps Academy certificate is genuine.", "/verify"],
  ["The platform story", "How every signal in an environment reaches one control plane.", "/platform"],
  ["Roadmap", "What is live today and what is planned next.", "/roadmap"]
];

export default function ResourcesStory() {
  usePageMeta("Resources — ITOps Solution", "Answers to common questions, the Linux monitoring agent, certificate verification and the platform roadmap.");
  const faqs = useQuery({ queryKey: ["content", "support", "faqs"], queryFn: () => fetchContentItems("support", "faqs") });
  const channels = useQuery({ queryKey: ["content", "support", "channels"], queryFn: () => fetchContentItems("support", "channels") });

  return <StoryShell>
    <PageHero
      kicker="Resources"
      title={<>Knowledge, close to <span className="s-accent">the systems it's about.</span></>}
      lead="Answers, tools and downloads for the people operating ITOps. The article library is still being written — it will appear here when it's ready, not before."
      actions={<><Btn href="#answers">Read the answers</Btn><Btn to="/contact" kind="ghost">Ask a question</Btn></>}
    />

    <Section id="answers" tone="alt" kicker="Answers" title="Questions people actually ask.">
      {faqs.isLoading ? <p className="s-mono">Loading<span className="animate-pulse">_</span></p> : faqs.data?.length ? <div>
        {faqs.data.map((q, i) => <details key={q.id} className="s-rise group border-t border-[var(--s-line)] py-5 last:border-b" style={{ "--i": Math.min(i, 6) }}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6">
            <span className="text-lg font-medium tracking-tight md:text-xl">{q.title}</span>
            <span aria-hidden className="mt-1 text-[var(--s-dim)] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="s-body mt-4 max-w-3xl">{q.body}</p>
        </details>)}
      </div> : <p className="s-body">No answers are published yet. <Link to="/contact" className="s-link">Ask us directly</Link></p>}
    </Section>

    <Section kicker="Tools and downloads" title="Things you can use today.">
      <ul className="grid gap-x-12 md:grid-cols-2">
        {TOOLS.map(([title, body, to, kind], i) => {
          const inner = <>
            <span className="s-row-title text-lg font-medium tracking-tight">{title}</span>
            <span aria-hidden className="s-row-arrow text-[var(--s-dim)]">{kind === "download" ? "↓" : "→"}</span>
            <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{body}</span>
          </>;
          return <li key={title} className="s-rise" style={{ "--i": i }}>
            {kind === "download" ? <a href={to} download className="s-row grid-cols-[1fr_auto] !border-b-0 !py-5">{inner}</a> : <Link to={to} className="s-row grid-cols-[1fr_auto] !border-b-0 !py-5">{inner}</Link>}
          </li>;
        })}
      </ul>
    </Section>

    <Section tone="alt" kicker="Articles and guides" title="The library is being written." lead="These are the subjects it will cover. Nothing is published yet, so there is nothing to list here.">
      <ul className="s-rise flex flex-wrap gap-2">
        {CATEGORIES.map(c => <li key={c} className="s-chip" data-tone="roadmap">{c}</li>)}
      </ul>
      {channels.data?.length > 0 && <ul className="mt-12 grid gap-x-12 md:grid-cols-3">
        {channels.data.map((c, i) => <li key={c.id} className="s-rise s-row grid-cols-[1fr_auto] !border-b-0" style={{ "--i": i }}>
          <span className="text-lg font-medium tracking-tight">{c.title}</span>
          <Status kind={/available/i.test(c.status ?? "") ? "live" : "roadmap"}>{c.status}</Status>
          <span className="col-span-2 text-sm leading-relaxed text-[var(--s-dim)]">{c.body}</span>
        </li>)}
      </ul>}
    </Section>

    <PageCTA title="Still have a question?" lead="Send it to us — bugs, billing, or how something works.">
      <Btn to="/contact">Start a conversation</Btn>
      <Btn to="/platform" kind="ghost">Explore the platform</Btn>
    </PageCTA>
    <NextPage from="Knowledge" label="Why ITOps exists" to="/company" />
  </StoryShell>;
}
