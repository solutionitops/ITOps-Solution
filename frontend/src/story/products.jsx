// Per-product stories. The template (pages/ProductStory.jsx) is shared; each
// product supplies its own headline, story chain, visual and chapters.
// Capability lists, workflow steps and audiences are NOT written here — they
// come from the published product record, so live/roadmap status stays exact.
import { Status } from "./World";
import { Key } from "./Shell";
import { AgentInstall, AlertEvent, AlertRouting, AssetMap, HealthyThenBroken, Inspection, Lifecycle, NetworkPath, RequestJourney, ServerTelemetry, Sparkline } from "./visuals";

const A = ({ children, tone = "var(--s-cyan)" }) => <span style={{ color: tone }}>{children}</span>;
const Soft = ({ children }) => <span className="s-soft">{children}</span>;
const Keys = ({ items }) => <div className="flex flex-col gap-2.5">{items.map(([k, v, tone]) => <Key key={k} k={k} v={v} tone={tone} />)}</div>;

export const PRODUCTS = {
  "website-api-monitoring": {
    cms: "website-api-monitoring",
    meta: ["Website & API Monitoring — ITOps Solution", "Uptime, keyword, status-code and DNS checks for every website and API endpoint, with response-time history, redirect-chain tracing and automatic incidents."],
    kicker: "Website & API Monitoring",
    headline: <>Know when your digital experience <A>changes.</A></>,
    lead: "Every visit to your site is a small journey: a name resolves, a secure connection opens, a response comes back. ITOps makes that journey on a schedule and tells you the moment it stops working.",
    chain: ["Request", "Observe", "Detect", "Understand", "Respond"],
    hero: <RequestJourney />,
    storyTitle: <>From a request <Soft>to a response you can trust.</Soft></>,
    chapters: [
      ["01", "What happens when someone visits your website?", <p key="a">A name is resolved, a secure connection is made, and a page comes back. Each step can fail on its own — and from the outside, every one of them just looks like “the site is down”.</p>],
      ["02", "What does ITOps measure?", <p key="a">You choose the check: uptime, a keyword on the page, an exact status code, or a DNS record. Every run records the response time, the status, and the full redirect chain.</p>, <Keys key="v" items={[["Monitor.status", "Up", "ok"], ["Response.time", "184 ms"], ["Status.code", "200", "ok"], ["Keyword", "Found", "ok"], ["Redirect.chain", "2 hops"]]} />],
      ["03", "What happens when performance changes?", <p key="a">Every check is stored, so each monitor carries its own response-time history. You can see a slowdown building before it becomes an outage.</p>, <div key="v" className="s-panel p-4"><p className="s-mono !text-[9.5px]">Response time · api.example.com</p><Sparkline seed={5} className="mt-3 h-16 w-full" /></div>],
      ["04", "How incidents are created", <p key="a">One failed check is a blip. Consecutive failures open an incident automatically, with the precise failure attached — a status code, a timeout, or the text that went missing.</p>],
      ["05", "How recovery is tracked", <p key="a">When checks pass again, the incident resolves on its own, and the timeline keeps the real timestamps.</p>],
      ["06", "History — and what comes next", <p key="a">Response-time and incident history are live for every monitor today. Scheduled SLA reports are on the roadmap.</p>, <div key="v" className="flex flex-col gap-3"><span className="flex items-center gap-4"><Status kind="live" /><span className="text-sm">Response-time history</span></span><span className="flex items-center gap-4"><Status kind="roadmap" /><span className="text-sm text-[var(--s-dim)]">SLA reports</span></span></div>],
      ["07", "The dashboard experience", <p key="a">Monitors sit beside your servers, network devices and incidents in one console — and a public status page can show customers the live state.</p>]
    ],
    cta: ["Know before your customers do.", "Add your first monitor on the free Starter plan.", ["Start monitoring", "/register"], ["See plans", "/pricing"]],
    next: ["Response", "Security Monitoring", "/solutions/security-monitoring"]
  },

  "security-monitoring": {
    cms: "security-monitoring",
    meta: ["Security Monitoring — ITOps Solution", "SSL certificate expiry, security headers, cookie flags and a real security score for every endpoint, checked alongside your uptime monitors."],
    kicker: "Security Monitoring",
    kickerTone: "var(--s-violet)",
    headline: <>Your website can be online <A tone="var(--s-violet)">and still be exposed.</A></>,
    lead: "Uptime tells you a site answers. It doesn't tell you whether it answers safely. ITOps inspects every HTTPS endpoint it already monitors and scores what it finds.",
    chain: ["Visible", "Checked", "Scored", "Improved"],
    chainTone: "var(--s-violet)",
    hero: <Inspection />,
    storyTitle: <>An endpoint, <Soft>inspected.</Soft></>,
    chapters: [
      ["01", "Visible", <p key="a">Security checks run with every uptime check. There is nothing extra to set up: every HTTPS monitor is inspected automatically.</p>],
      ["02", "Checked", <p key="a">Six security headers, the flags on every cookie, a server header that gives away its version, and the certificate's issuer, protocol and days remaining.</p>, <Keys key="v" items={[["SSL.expiry", "61 days", "sec"], ["Headers", "5 / 6", "sec"], ["Cookies", "Secure", "sec"], ["Server.version", "Hidden", "sec"]]} />],
      ["03", "Scored", <p key="a">Each endpoint gets a score out of 100, with exactly what is missing listed plainly — not a grade you have to decode.</p>],
      ["04", "Improved", <p key="a">Fix what is flagged and the score follows. Certificates within 14 days of expiring, or already expired, raise an alert on their own.</p>]
    ],
    cta: ["Know your security posture.", "Every HTTPS monitor is scored automatically.", ["Check your endpoint", "/register"], ["See plans", "/pricing"]],
    next: ["Security.score", "Incident Management", "/solutions/incident-management"]
  },

  "incident-management": {
    cms: "alerting-incident-response",
    capFilter: c => !/alert|SMS|Teams/i.test(c.title),
    meta: ["Incident Management — ITOps Solution", "Consecutive failures open an incident automatically with the cause attached, root cause analysis explains why, and recovery closes it on its own."],
    kicker: "Incident Management",
    kickerTone: "var(--s-amber)",
    headline: <>When something breaks, <A tone="var(--s-amber)">context matters.</A></>,
    lead: "Everything is healthy — until one monitor isn't. What happens in the next few minutes decides whether your team spends them fixing the problem or finding it.",
    chain: ["Failure", "Incident", "Timeline", "Alert", "Recovery", "Resolution"],
    chainTone: "var(--s-amber)",
    hero: <HealthyThenBroken />,
    storyTitle: <>The moment <Soft>everything changes.</Soft></>,
    chapters: [
      ["01", "One monitor fails.", <p key="a">A website, a server or a network device stops answering. One failed check is a blip; consecutive failures cross the threshold.</p>],
      ["02", "An incident opens — with its cause.", <p key="a">Automatically, with the precise failure attached: a status code, a timeout, or a DNS or TCP error. Nobody has to triage a red dot.</p>, <Keys key="v" items={[["Incident.open", "#2481", "warn"], ["Monitor", "checkout-service"], ["Cause", "HTTP 503", "warn"]]} />],
      ["03", "Root cause analysis reads the evidence.", <p key="a">A diagnosis built from the real telemetry — DNS, SSL, TCP, HTTP and the response-time trend — with a severity, a confidence level, and prioritized guidance on what to do next.</p>],
      ["04", "The timeline keeps the real timestamps.", <p key="a">Detected, diagnosed, alerted, recovered, closed. Every step is recorded as it happens.</p>, <Lifecycle key="v" />],
      ["05", "Recovery closes the loop.", <p key="a">When checks pass again the incident resolves on its own. Mean time to repair and incident counts are computed from your real history, and a public status page reflects the live state.</p>]
    ],
    cta: ["See the whole incident, not just the alert.", "Incidents open and resolve automatically on every plan.", ["Start monitoring", "/register"], ["How alerts are sent", "/solutions/alerting"]],
    next: ["Resolved", "Multi-Channel Alerting", "/solutions/alerting"]
  },

  alerting: {
    cms: "alerting-incident-response",
    capFilter: c => /alert|SMS|Teams|Escalation|Maintenance|status page/i.test(c.title),
    meta: ["Multi-Channel Alerting — ITOps Solution", "Configure Slack, webhook and email alert channels once per organization and route every operational event to the people who need it."],
    kicker: "Multi-Channel Alerting",
    headline: <>Know. <A>Then notify.</A></>,
    lead: "An incident nobody hears about is still an outage. ITOps sends each event to the channels your team already watches, with the cause in the first message.",
    chain: ["Incident", "Rule", "Slack · Email · Webhook"],
    hero: <AlertRouting />,
    heroNote: "Illustration",
    storyTitle: <>One signal, <Soft>branching to the right people.</Soft></>,
    chapters: [
      ["01", "Configured once, for the whole organization.", <p key="a">Add your Slack, webhook and email channels one time. Every monitor in the organization uses them — there is nothing to wire up per check.</p>],
      ["02", "What triggers an alert", <p key="a">A monitor goes down. A monitor recovers. An SSL certificate is close to expiring. Each one is sent to every channel you have configured.</p>, <Keys key="v" items={[["Monitor.down", "Alert", "warn"], ["Monitor.recovered", "Alert", "ok"], ["SSL.expiry", "Alert", "sec"]]} />],
      ["03", "What an alert says", <p key="a">The monitor, the precise failure, and the incident it opened — so the first message already carries the context, and the recovery message closes it.</p>, <AlertEvent key="v" />],
      ["04", "Limits are real", <p key="a">How many alert channels you can add depends on your plan, and the limit is enforced rather than implied.</p>]
    ],
    cta: ["Send the signal where people are.", "Slack, webhook and email are live today.", ["Start monitoring", "/register"], ["See plans", "/pricing"]],
    next: ["Delivered", "Asset Inventory", "/solutions/asset-inventory"]
  },

  "asset-inventory": {
    staticItem: {
      status: "live",
      live: [
        { title: "Automatic website assets", detail: "Every monitored website becomes an asset as soon as its monitor is created." },
        { title: "Manual assets", detail: "Add servers, databases and other infrastructure by hand to keep one record of what you run." },
        { title: "One list, by type", detail: "Type, name, identifier and the date each asset was added." }
      ],
      roadmap: []
    },
    meta: ["Asset Inventory — ITOps Solution", "Every monitored website becomes an asset automatically; servers, databases and other infrastructure can be tracked manually in one inventory."],
    kicker: "Asset Inventory",
    headline: <>If you don't know what exists, <A>you can't operate it.</A></>,
    lead: "Environments grow one system at a time, and nobody writes them all down. The inventory builds itself from what you monitor, and takes the rest by hand.",
    chain: ["Website", "Server", "Database", "Inventory"],
    hero: <AssetMap />,
    storyTitle: <>An environment, <Soft>becoming a map.</Soft></>,
    chapters: [
      ["01", "It starts with one website.", <p key="a">Create a monitor and the website appears in the inventory on its own. You never enter it twice.</p>],
      ["02", "Then the rest of the environment.", <p key="a">Servers, databases and other infrastructure can be added manually today, so the inventory can describe systems ITOps doesn't yet check.</p>],
      ["03", "One list of what you run.", <p key="a">Each asset has a type, a name, an identifier and the date it was added — the questions people actually ask when something breaks.</p>, <Keys key="v" items={[["Asset.type", "Server"], ["Asset.name", "prod-web-01"], ["Asset.identifier", "10.0.4.12"]]} />],
      ["04", "A record is not a monitor.", <p key="a">Adding a server to the inventory records that it exists; it does not watch it. For live server metrics, install the Kada Nigrani agent.</p>]
    ],
    cta: ["See what you run.", "The inventory starts filling with your first monitor.", ["Start monitoring", "/register"], ["Monitor a server", "/solutions/kada-nigrani"]],
    next: ["Asset.connected", "Network & Device Monitoring", "/solutions/infrastructure-monitor"]
  },

  "infrastructure-monitor": {
    cms: "infrastructure-monitor",
    meta: ["Network & Device Monitoring — ITOps Solution", "Agentless TCP-connect checks and DNS record monitoring for routers, switches, firewalls and any network device with a reachable port."],
    kicker: "Network & Device Monitoring",
    headline: <>See every hop between the internet <A>and your servers.</A></>,
    lead: "A request doesn't reach your application directly. It crosses a router, a firewall and a switch first — and any of them can be the reason it never arrives.",
    chain: ["Internet", "Router", "Firewall", "Switch", "Server", "Application"],
    hero: <NetworkPath />,
    storyTitle: <>A packet, <Soft>travelling through infrastructure.</Soft></>,
    chapters: [
      ["01", "Agentless by design", <p key="a">There is nothing to install on the device. ITOps connects to a port — the same TCP-connect model as Nagios' check_tcp — and measures the real latency.</p>],
      ["02", "Any device with a reachable port", <p key="a">Routers, switches, firewalls, printers, DNS servers and any other TCP service, with one-click presets for common ports such as HTTPS, SSH, DNS and RDP.</p>, <Keys key="v" items={[["Network.reachable", "4 / 4", "ok"], ["TCP.connect", "12 ms", "ok"], ["Port", "443 open", "ok"]]} />],
      ["03", "DNS records, watched", <p key="a">A, AAAA, CNAME, MX, TXT and NS records are checked for you, with an alert when one stops resolving or changes value.</p>],
      ["04", "When a device stops answering", <p key="a">Consecutive failures open an incident with the exact connection error — refused, timed out, or unreachable — and your alert channels fire.</p>],
      ["05", "What comes next", <p key="a">Hardware telemetry over SNMP — CPU, memory, temperature and interface counters — is on the roadmap. It is not available today.</p>, <span key="v" className="flex items-center gap-4"><Status kind="roadmap" /><span className="text-sm text-[var(--s-dim)]">SNMP hardware telemetry</span></span>]
    ],
    cta: ["Watch the path, not just the destination.", "TCP and DNS checks are live today.", ["Start monitoring", "/register"], ["See plans", "/pricing"]],
    next: ["Server", "Kada Nigrani", "/solutions/kada-nigrani"]
  },

  "kada-nigrani": {
    cms: "kada-nigrani",
    meta: ["Kada Nigrani — Linux server monitoring · ITOps Solution", "A lightweight agent streams CPU, memory, disk, load and uptime from your Linux servers into the same dashboard as your website monitors."],
    kicker: "Kada Nigrani · Server Monitoring",
    headline: <>Know what your servers <A>are doing.</A></>,
    lead: "A network check tells you a server answers. It can't tell you the disk is nearly full. Kada Nigrani is a small agent that reports from inside the machine.",
    chain: ["Linux server", "Kada Nigrani agent", "ITOps"],
    hero: <ServerTelemetry />,
    storyTitle: <>Telemetry, <Soft>travelling to the control plane.</Soft></>,
    chapters: [
      ["01", "Register a host", <p key="a">One click creates the host and issues its own private ingest key. You can rotate or revoke that key at any time.</p>],
      ["02", "Install with one line", <p key="a">The agent is plain bash and curl — no runtime to install, and it works on any Linux distribution.</p>, <AgentInstall key="v" />],
      ["03", "Metrics stream in", <p key="a">CPU, memory, disk, load, uptime and process count report every minute over HTTPS, into the same dashboard as your website monitors.</p>, <Keys key="v" items={[["Server.CPU", "42%"], ["Server.memory", "61%"], ["Server.disk", "72%"], ["Server.uptime", "18d 14h", "ok"]]} />],
      ["04", "Online, offline — and why", <p key="a">Each host shows whether it is online and its latest usage, and root cause analysis explains host issues from the real check and metric data.</p>],
      ["05", "Act, with an audit trail", <p key="a">Admins can approve a short list of safe actions — reload a web server, restart a service, clear temporary files — and run them with a full audit trail. It is opt-in per host.</p>]
    ],
    cta: ["See inside every server you run.", "One host is included on the free Starter plan.", ["Monitor a server", "/register"], ["See plans", "/pricing"]],
    next: ["Server.health", "Cyber Sachet", "/cybersachet"]
  }
};

/** Old combined slug → the page that now covers it. */
export const PRODUCT_REDIRECTS = { "alerting-incident-response": "incident-management" };
