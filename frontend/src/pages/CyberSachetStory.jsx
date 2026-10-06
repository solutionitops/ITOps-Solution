// Cyber Sachet: human security. Deliberately a different register from the
// monitoring pages — warmer accent, a person and a question instead of nodes
// and packets. Live vs next is exact: courses, quizzes and tracking are live;
// phishing simulations and compliance reporting are not.
import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../api/endpoints";
import { Btn, Capabilities, Chapter, NextPage, PageCTA, PageHero, Section } from "../story/Page";
import { StoryShell, usePageMeta } from "../story/Shell";
import { Challenge, Roster } from "../story/visuals";

const AMBER = "var(--s-amber)";
// What is live today, as stated on the product's own record.
const LIVE = [
  { title: "Structured courses", detail: "Security-awareness courses built from real lessons, not a single long video — organized so a team can actually finish them." },
  { title: "Quizzes and progress tracking", detail: "Each course ends in a scored quiz; completion and quiz scores are tracked per employee so admins can see who is actually trained." },
  { title: "Per-organization licensing", detail: "A platform admin licenses Cyber Sachet for an organization — every licensed user then sees their courses on login." }
];

export default function CyberSachetStory() {
  usePageMeta("Cyber Sachet — security awareness training · ITOps Solution", "Structured security-awareness courses and scored quizzes for licensed organizations, with completion and scores tracked per employee.");
  const planned = useQuery({ queryKey: ["content", "cybersachet", "planned_capabilities"], queryFn: () => fetchContentItems("cybersachet", "planned_capabilities") });
  const roadmap = (planned.data ?? []).map(i => ({ title: i.title, detail: i.body }));

  return <StoryShell>
    <PageHero
      kicker="Cyber Sachet · Human security"
      kickerTone={AMBER}
      status="live"
      title={<>Security starts <span style={{ color: AMBER }}>with people.</span></>}
      lead="Firewalls and certificates protect systems. They don't stop someone from typing a password into the wrong page. Cyber Sachet trains the people behind the infrastructure — and measures whether it worked."
      chain={["Learn", "Quiz", "Score", "Awareness"]}
      chainTone={AMBER}
      visual={<Challenge />}
      note="Illustration · sample question"
      actions={<><Btn to="/login">Log in to start training</Btn><Btn href="#status" kind="ghost">What's included</Btn></>}
    />

    <Section tone="alt" kicker="The story" title={<>A person, a question, <span className="s-soft">a better habit.</span></>}>
      <Chapter n="01" title="A person receives a challenge." i={0}><p>Not a system, not an endpoint: someone on your team, facing the kind of message that actually arrives in an inbox.</p></Chapter>
      <Chapter n="02" title="Learn" i={1}><p>Structured courses built from real lessons, on the threats your organization actually faces — like phishing and password reuse — sized so people finish them.</p></Chapter>
      <Chapter n="03" title="Quiz" i={2}><p>Every course ends in a scored quiz. Awareness is checked, not assumed.</p></Chapter>
      <Chapter n="04" title="Score" i={3} visual={<Roster />}><p>Completion and quiz scores are tracked per employee, so an admin can see who is trained and who still needs to be.</p></Chapter>
      <Chapter n="05" title="Awareness, across the organization" i={4}><p>Cyber Sachet is licensed per organization. Once it is, every licensed person sees their courses the moment they log in.</p></Chapter>
    </Section>

    <Section id="status" kicker="Status" title="What is live, and what is next." lead="Phishing simulations and compliance reporting are not built yet. We'd rather say that than show a demo of something that doesn't exist.">
      <Capabilities live={LIVE} roadmap={roadmap} roadmapTitle="Next" />
    </Section>

    <PageCTA title="Train the people behind the systems." lead="Cyber Sachet is available to licensed organizations today.">
      <Btn to="/login">Log in to start training</Btn>
      <Btn to="/contact" kind="ghost">Ask about licensing</Btn>
    </PageCTA>
    <NextPage from="Awareness" label="Moonsav ITOps Academy" to="/academy" />
  </StoryShell>;
}
