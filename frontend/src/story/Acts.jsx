// Acts I–V in one pinned scene: the signal, the environment, the signals, the
// fragmentation, the first connection, and the control plane. One topology
// evolves through all of it — nothing resets between chapters.
import { useEffect } from "react";
import { ControlPlane, ControlPlaneCompact, Fit } from "./ControlPlane";
import { Kicker, Scene, Signal, Stage, Topology, useIsMobile } from "./World";
import { setSpine } from "./spine";

const EVENTS = [["GET", "/", "200 · 184 ms"], ["SERVER", "web-01", "responded"], ["PACKET", "10.0.4.12", "routed"], ["DNS", "example.com", "resolved"], ["SSL", "certificate", "verified"]];
const STAGES = 12;

function Inflow({ live }) {
  // signals from the environment flowing into the console from both sides
  const ys = [90, 190, 300, 410, 510];
  return <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="s-topo absolute inset-0" data-connect="1" data-live={live ? "1" : "0"} aria-hidden>
    {ys.map((y, i) => <g key={y}>
      <path pathLength="1" className="s-conv" style={{ "--i": i * 0.4 }} d={`M0 ${y}C140 ${y} 160 300 300 300`} />
      <path pathLength="1" className="s-pkt conv" style={{ "--d": `${2 + i * 0.3}s`, "--dl": `${-i * 0.5}s` }} d={`M0 ${y}C140 ${y} 160 300 300 300`} />
      <path pathLength="1" className="s-conv" style={{ "--i": i * 0.4 }} d={`M1000 ${y}C860 ${y} 840 300 700 300`} />
      <path pathLength="1" className="s-pkt conv" style={{ "--d": `${2.3 + i * 0.3}s`, "--dl": `${-i * 0.6}s` }} d={`M1000 ${y}C860 ${y} 840 300 700 300`} />
    </g>)}
  </svg>;
}

function Prologue({ stage, live, mobile }) {
  // spine: the opening and the environment are SIGNAL; from fragmentation on it is SYSTEM
  useEffect(() => {
    if (live) setSpine(stage < 7 ? 0 : 1);
  }, [stage, live]);

  const split = stage >= 3 && stage <= 10;
  const console_ = stage === 11;
  const topo = {
    reveal: stage < 3 ? 0 : 8,
    signals: stage >= 4,
    fragment: stage === 7 || stage === 8,
    quiet: stage === 9 || stage === 10,
    connect: stage >= 9,
    hub: stage >= 10
  };

  return <div className="relative h-full">
    <div className="s-grid" />

    {/* the world */}
    <div className={`s-fade absolute ${mobile ? "inset-x-3 bottom-3 top-[40%]" : "bottom-10 right-6 top-24 w-[60%]"}`} data-on={split ? "1" : "0"}>
      <Topology layout={mobile ? "mobile" : "desktop"} live={live && split} {...topo} label="An organization's infrastructure: internet, website, DNS, security, firewall, network, endpoints, people, server, cloud, application and database" />
    </div>

    {/* opening — centred */}
    <div className="pointer-events-none absolute inset-0">
      <Stage on={stage === 0} className="grid place-items-center">
        <Signal />
      </Stage>
      <Stage on={stage === 1} className="grid place-items-center px-6">
        <div className="max-w-5xl text-center">
          <p className="s-display">Your IT environment <span className="s-soft">is always moving.</span></p>
          <ul className="mx-auto mt-10 max-w-md space-y-2 text-left font-mono text-[11px] tracking-wider text-[var(--s-dim)] md:text-xs" data-on={stage === 1 ? "1" : "0"}>
            {EVENTS.map(([a, b, c], i) => <li key={a} className="s-rise flex items-center gap-3 border-b border-[var(--s-line)] pb-2" style={{ "--i": i + 2 }}>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--s-cyan)]" />
              <span className="w-14 text-[var(--s-fg)]">{a}</span>
              <span className="flex-1 truncate">{b}</span>
              <span className="text-[var(--s-green)]">{c}</span>
            </li>)}
          </ul>
        </div>
      </Stage>
      <Stage on={stage === 2} className="grid place-items-center px-6">
        <div className="text-center">
          <h1 className="s-display">Every system<br />tells a story.</h1>
          <p className="mt-8 flex items-center justify-center gap-3 text-lg text-[var(--s-dim)] md:text-xl"><Signal /> ITOps listens.</p>
        </div>
      </Stage>
    </div>

    {/* chapters 01–04 — text on the left, the world on the right */}
    <div className={`pointer-events-none absolute ${mobile ? "inset-x-6 top-24 h-[30%]" : "bottom-0 left-10 top-0 w-[36%]"}`}>
      <div className={`relative h-full ${mobile ? "" : "flex items-center"}`}>
        <div className="relative h-[60%] w-full md:h-[46%]">
          <Stage on={stage === 3}>
            <Kicker>Chapter 01 — The environment</Kicker>
            <h2 className="s-h2 mt-4">It starts with infrastructure.</h2>
            <p className="s-body mt-5 max-w-sm">A website. A server. A network. A security layer. An application. Cloud resources. Endpoints. And the people who use them.</p>
          </Stage>
          <Stage on={stage === 4}>
            <Kicker>Chapter 02 — The signal</Kicker>
            <h2 className="s-h2 mt-4">Everything generates a signal.</h2>
            <p className="s-body mt-5 max-w-sm">Uptime. Latency. CPU. DNS. SSL. Every component reports, all the time.</p>
          </Stage>
          <Stage on={stage === 5}>
            <Kicker>Chapter 02 — The signal</Kicker>
            <h2 className="s-h2 mt-4">The problem isn't a lack of data.</h2>
          </Stage>
          <Stage on={stage === 6}>
            <Kicker>Chapter 02 — The signal</Kicker>
            <h2 className="s-h2 mt-4"><span className="s-soft">It's a lack of</span> context.</h2>
          </Stage>
          <Stage on={stage === 7}>
            <Kicker>Chapter 03 — The fragmentation</Kicker>
            <h2 className="s-h2 mt-4">Your infrastructure is connected.</h2>
            <p className="s-body mt-5 max-w-sm">Monitoring in one tool. Security in another. Alerts in email, answers in a spreadsheet.</p>
          </Stage>
          <Stage on={stage === 8}>
            <Kicker>Chapter 03 — The fragmentation</Kicker>
            <h2 className="s-h2 mt-4">Your tools shouldn't feel <span className="s-soft">disconnected.</span></h2>
          </Stage>
          <Stage on={stage === 9}>
            <Kicker>Chapter 04 — The first connection</Kicker>
            <h2 className="s-h2 mt-4">What if every signal had one place to go?</h2>
          </Stage>
          <Stage on={stage === 10}>
            <Kicker>Chapter 04 — The first connection</Kicker>
            <h2 className="s-display mt-4 flex items-baseline gap-4">ITOps<span className="s-accent">.</span></h2>
          </Stage>
        </div>
      </div>
    </div>

    {/* chapter 05 — the control plane */}
    <div className="s-fade absolute inset-0 flex flex-col items-center px-4 pb-6 pt-24 md:px-10 md:pt-28" data-on={console_ ? "1" : "0"} aria-hidden={console_ ? undefined : true} style={{ pointerEvents: console_ ? "auto" : "none", transform: console_ ? "none" : "scale(0.96)" }}>
      {!mobile && <Inflow live={live && console_} />}
      <div className="relative text-center">
        <Kicker>Chapter 05 — The control plane</Kicker>
        <h2 className="s-h2 mt-3">One place. <span className="s-accent">Every signal.</span></h2>
      </div>
      <div className="relative mt-6 w-full max-w-[1120px] md:mt-8">
        {mobile ? <ControlPlaneCompact /> : <Fit w={1120} h={548} maxH="calc(100svh - 300px)"><ControlPlane /></Fit>}
        <p className="s-mono mt-3 text-center !text-[9px]">Illustration · sample data</p>
      </div>
    </div>

    <p className="s-mono s-fade absolute bottom-6 left-1/2 -translate-x-1/2 !text-[9.5px]" data-on={stage === 0 ? "1" : "0"}>Scroll to begin ↓</p>
  </div>;
}

export function ActsOneToFive() {
  const mobile = useIsMobile();
  return <Scene id="story" stages={STAGES} vh={mobile ? 40 : 42}>
    {(stage, live) => <Prologue stage={stage} live={live} mobile={mobile} />}
  </Scene>;
}
