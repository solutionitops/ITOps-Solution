// Contact: entering the operational conversation. A small environment terminal
// shapes the message; the form posts through the existing contact endpoint.
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitContactMessage } from "../api/endpoints";
import { InView, Kicker, Signal } from "../story/World";
import { NextPage } from "../story/Page";
import { Field, FormNote, Input, Key, StoryShell, TextArea, usePageMeta } from "../story/Shell";

const ENV = ["Website", "Server", "Network", "Security"];

export default function ContactStory() {
  usePageMeta("Contact — let's see what's happening in your environment", "Tell us what you run and what you want to monitor. ITOps Solution, Kathmandu, Nepal.");
  const [env, setEnv] = useState([]);
  const [f, setF] = useState({ name: "", email: "", company: "", monitor: "", message: "" });
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }));
  const toggle = item => setEnv(v => v.includes(item) ? v.filter(x => x !== item) : [...v, item]);
  // the endpoint stores name, email, topic and message — the rest is folded into the message
  const m = useMutation({
    mutationFn: () => submitContactMessage({
      name: f.name,
      email: f.email,
      topic: "sales",
      message: [f.company && `Company: ${f.company}`, env.length && `Environment: ${env.join(", ")}`, f.monitor && `Wants to monitor: ${f.monitor}`, f.message].filter(Boolean).join("\n")
    })
  });

  return <StoryShell>
    <section className="relative overflow-hidden px-6 pb-24 pt-36 md:px-10 md:pb-32 md:pt-44">
      <div className="s-grid" />
      <InView className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20" amount={0.05}>
        <div>
          <div className="s-rise"><Kicker>Contact</Kicker></div>
          <h1 className="s-display s-rise mt-6 !text-[clamp(2.3rem,5.2vw,4.75rem)]" style={{ "--i": 1 }}>Let's see what's happening <span className="s-accent">in your environment.</span></h1>
          <p className="s-body s-rise mt-7 max-w-md" style={{ "--i": 2 }}>Tell us what you run and what you'd like to watch. A person reads every message.</p>

          {/* the operational terminal: pick what the environment contains */}
          <div className="s-rise s-panel mt-10 max-w-md overflow-hidden" style={{ "--i": 3 }}>
            <div className="flex items-center gap-3 border-b border-[var(--s-line)] bg-[var(--s-panel2)] px-4 py-2.5">
              <Signal />
              <span className="s-mono !text-[9.5px]">Environment</span>
              <span className="s-mono ml-auto !text-[9.5px]">{String(env.length).padStart(2, "0")} selected</span>
            </div>
            <fieldset className="p-3">
              <legend className="sr-only">What does your environment include?</legend>
              {ENV.map(item => {
                const on = env.includes(item);
                return <button key={item} type="button" aria-pressed={on} onClick={() => toggle(item)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-mono text-xs uppercase tracking-[0.16em] transition-colors hover:bg-[var(--s-panel2)]" style={{ color: on ? "var(--s-fg)" : "var(--s-dim)" }}>
                  <span className="grid h-4 w-4 place-items-center rounded border" style={{ borderColor: on ? "var(--s-cyan)" : "var(--s-line2)", color: "var(--s-cyan)" }}>{on ? "✓" : ""}</span>
                  {item}
                  <span className="ml-auto text-[10px]" style={{ color: on ? "var(--s-green)" : "var(--s-faint)" }}>{on ? "Included" : "—"}</span>
                </button>;
              })}
            </fieldset>
          </div>

          <p className="s-rise mt-8 flex flex-col gap-2.5" style={{ "--i": 4 }}>
            <a href="tel:+9779803350658" className="w-fit"><Key k="Phone" v="+977 980-335-0658" /></a>
            <Key k="Based in" v="Kathmandu, Nepal" />
          </p>
        </div>

        <div className="s-rise" style={{ "--i": 2 }}>
          {m.isSuccess ? <div className="s-panel p-8" role="status">
            <p className="s-mono" style={{ color: "var(--s-green)" }}>Message.sent ✓</p>
            <p className="s-h3 mt-4">The conversation has started.</p>
            <p className="s-body mt-3">We'll reply to {f.email}.</p>
          </div> : <form onSubmit={e => { e.preventDefault(); m.mutate(); }} className="s-panel grid gap-5 p-6 sm:grid-cols-2 md:p-8">
            <p className="s-mono sm:col-span-2">What are you trying to monitor?</p>
            <Field label="Name">{p => <Input {...p} required value={f.name} onChange={set("name")} autoComplete="name" />}</Field>
            <Field label="Work email">{p => <Input {...p} type="email" required value={f.email} onChange={set("email")} autoComplete="email" placeholder="you@company.com" />}</Field>
            <Field label="Company">{p => <Input {...p} value={f.company} onChange={set("company")} autoComplete="organization" />}</Field>
            <Field label="Environment" hint="Chosen in the terminal on the left">{p => <Input {...p} readOnly value={env.join(", ")} placeholder="Nothing selected" />}</Field>
            <div className="sm:col-span-2"><Field label="What would you like to monitor?">{p => <Input {...p} value={f.monitor} onChange={set("monitor")} placeholder="e.g. 12 websites and 4 Linux servers" />}</Field></div>
            <div className="sm:col-span-2"><Field label="Message">{p => <TextArea {...p} required value={f.message} onChange={set("message")} />}</Field></div>
            <div className="sm:col-span-2">
              <button type="submit" className="s-btn" data-kind="primary" disabled={m.isPending}>{m.isPending ? "Sending" : "Start a conversation"} <span aria-hidden>→</span></button>
              {m.isPending && <FormNote tone="pending">Sending message…</FormNote>}
              {m.isError && <FormNote tone="error">Request.failed — {m.error?.message ?? "please try again"}</FormNote>}
            </div>
          </form>}
        </div>
      </InView>
    </section>
    <NextPage from="Conversation" label="Explore the platform" to="/platform" />
  </StoryShell>;
}
