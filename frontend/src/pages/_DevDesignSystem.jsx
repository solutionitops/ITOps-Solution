// Dev-only: the ITOps design system on one page (Phase 1 of the redesign).
// Every redesigned page is assembled from what is shown here.
import { useState } from "react";
import { ControlPlane, Fit } from "../story/ControlPlane";
import { Field, FormNote, Input, Key, Select, StoryShell, TextArea, usePageMeta } from "../story/Shell";
import { Flow, Kicker, Metric, Signal, Status, StoryLink, Topology } from "../story/World";

const COLORS = [["Background", "--s-bg"], ["Panel", "--s-panel"], ["Text", "--s-fg"], ["Cyan · system", "--s-cyan"], ["Blue · secondary", "--s-blue"], ["Violet · security", "--s-violet"], ["Green · healthy / live", "--s-green"], ["Amber · incident", "--s-amber"], ["Red · critical", "--s-red"], ["Gray · roadmap", "--s-gray"]];

function Block({ title, children }) {
  return <section className="border-t border-[var(--s-line)] py-14">
    <Kicker>{title}</Kicker>
    <div className="mt-8">{children}</div>
  </section>;
}

export default function DevDesignSystem() {
  usePageMeta("ITOps design system (dev)", "Internal preview of the ITOps design system.");
  const [sent, setSent] = useState(false);
  return <StoryShell>
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-36 md:px-10">
      <Kicker>Phase 1 — design system</Kicker>
      <h1 className="s-display mt-5">Operational flow.</h1>
      <p className="s-body mt-6 max-w-xl">One type system, one colour language, one node and telemetry vocabulary. Colour carries information; most of the interface stays monochrome.</p>

      <Block title="Typography">
        <p className="s-display">Display — every system tells a story.</p>
        <p className="s-h2 mt-6">Heading 2 — everything generates a signal.</p>
        <p className="s-h3 mt-6">Heading 3 — Website &amp; API Monitoring</p>
        <p className="s-body mt-6 max-w-xl">Body — uptime, response time, redirect chains, and SLA history for every site and endpoint you run.</p>
        <p className="s-mono mt-6">Technical label — chapter 02 — the signal</p>
      </Block>

      <Block title="Colour is information">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {COLORS.map(([name, v]) => <li key={v}>
            <span className="block h-14 rounded-lg border border-[var(--s-line2)]" style={{ background: `var(${v})` }} />
            <span className="mt-2 block text-sm">{name}</span>
            <span className="s-mono !text-[9px]">{v}</span>
          </li>)}
        </ul>
      </Block>

      <Block title="Status and signature labels">
        <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
          <Status kind="live" />
          <Status kind="roadmap" />
          <Status kind="next" />
          <span className="flex items-center gap-3"><Signal /><span className="s-mono">The signal</span></span>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          <Key k="Monitor.status" v="OK" tone="ok" />
          <Key k="Server.CPU" v="42%" />
          <Key k="Incident.open" v="03" tone="warn" />
          <Key k="SSL.expiry" v="61d" tone="sec" />
          <Key k="Network.reachability" v="4/4" tone="ok" />
          <Key k="Security.score" v="92" tone="sec" />
          <Key k="Asset.connected" v="247" tone="info" />
        </div>
      </Block>

      <Block title="Buttons and links">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="s-btn" data-kind="primary">Explore the platform →</button>
          <button type="button" className="s-btn" data-kind="ghost">See how it works →</button>
          <button type="button" className="s-btn" data-kind="primary" disabled>Disabled</button>
          <StoryLink to="/platform">View solution</StoryLink>
        </div>
      </Block>

      <Block title="Nodes, flows and metrics">
        <Flow steps={[{ label: "Request" }, { label: "DNS" }, { label: "HTTPS" }, { label: "Response" }, { label: "ITOps", tone: "itops" }]} />
        <div className="mt-6 max-w-md"><Flow steps={[{ label: "GitHub / CI" }, { label: "Build" }, { label: "Deployment" }]} tone="roadmap" live={false} /></div>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="s-chip">Healthy</span>
          <span className="s-chip" data-tone="fail">Incident</span>
          <span className="s-chip" data-tone="itops">ITOps</span>
          <span className="s-chip" data-tone="roadmap">Roadmap</span>
          <span className="s-chip" data-tone="plain">Neutral</span>
        </div>
        <div className="mt-10 grid max-w-2xl grid-cols-4 gap-4">
          <Metric value="99.98%" label="Uptime" />
          <Metric value="184ms" label="Response" />
          <Metric value="12" label="Redirects" />
          <Metric value="99.9%" label="SLA" />
        </div>
      </Block>

      <Block title="Topology">
        <div className="mx-auto h-[560px] max-w-3xl"><Topology layout="desktop" reveal={8} signals /></div>
        <p className="s-mono mt-4 text-center !text-[9px]">Hover a system to light its telemetry paths · sample data</p>
      </Block>

      <Block title="Control plane">
        <Fit w={1120} h={548} maxH="560px"><ControlPlane /></Fit>
        <p className="s-mono mt-4 text-center !text-[9px]">Illustration · sample data</p>
      </Block>

      <Block title="Forms">
        <form className="grid max-w-2xl gap-5 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <Field label="Name">{p => <Input {...p} placeholder="Your name" autoComplete="name" />}</Field>
          <Field label="Work email" hint="We only use this to reply.">{p => <Input {...p} type="email" placeholder="you@company.com" autoComplete="email" />}</Field>
          <Field label="Environment">{p => <Select {...p} defaultValue="">
            <option value="" disabled>Select one</option>
            <option>Websites &amp; APIs</option>
            <option>Linux servers</option>
            <option>Network devices</option>
          </Select>}</Field>
          <Field label="Company" error="Example of an error state">{p => <Input {...p} placeholder="Company" />}</Field>
          <div className="sm:col-span-2"><Field label="Message">{p => <TextArea {...p} placeholder="What would you like to monitor?" />}</Field></div>
          <div className="sm:col-span-2">
            <button type="submit" className="s-btn" data-kind="primary">Start a conversation →</button>
            {sent && <FormNote tone="ok">Preview only — nothing was sent ✓</FormNote>}
          </div>
        </form>
      </Block>
    </div>
  </StoryShell>;
}
