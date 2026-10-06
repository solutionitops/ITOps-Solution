import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { MarketingNav } from "../components/MarketingNav";
import { MarketingFooter } from "../components/MarketingFooter";
import {
  fetchContentItems,
  fetchPlanCatalog,
  fetchPlanUsage,
  submitWaitlistSignup,
  createCheckoutSession
} from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { MetricBarsBackground } from "../components/PageBackgrounds";
import { Reveal, SpotlightCard } from "../components/Animated";
import { Skeleton } from "../components/Skeleton";
import { ErrorState } from "../components/EmptyState";
import { BrandMark } from "../components/BrandLogo";
import { CTALink } from "../components/Button";

const UNLIMITED = 100000;

function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function cap(n) {
  if (n == null) return "—";
  return n >= UNLIMITED ? "Unlimited" : String(n);
}

const CURRENCIES = {
  NPR: {
    code: "NPR",
    label: "NPR (रू) · Nepal Domestic",
    symbol: "रू",
    vatNote: "Inclusive of standard digital tax",
    fmt: n => `रू ${Number(n).toLocaleString("en-IN")}`
  },
  USD: {
    code: "USD",
    label: "USD ($) · Global International",
    symbol: "$",
    vatNote: "Global billing processed via Stripe",
    fmt: n => `$${Number(n).toLocaleString("en-US")}`
  }
};

// Default pricing structure (NPR & USD) with 20% savings on yearly commitments
const PLAN_CONFIG = {
  STARTER: {
    tint: "emerald",
    tagline: "Free Forever · Zero Risk",
    highlightBadge: "Free Forever",
    recommended: false,
    cadence: "60-second checks",
    description: "For solo developers, side projects & testing production uptime with instant alerts.",
    pricing: {
      NPR: { monthly: 0, yearly: 0 },
      USD: { monthly: 0, yearly: 0 }
    },
    specs: {
      monitors: 3,
      hosts: 1,
      alertChannels: 1,
      members: 3,
      historyDays: 7
    },
    keyPoints: [
      "3 HTTP, HTTPS & Keyword monitors",
      "1 Server host (Kada Nigrani Linux agent)",
      "1 Alert channel (Slack or Webhook)",
      "60-second synthetic check cadence",
      "Automated SSL certificate expiry alerts",
      "Public status page with live uptime",
      "7 days telemetry & incident history"
    ]
  },
  PROFESSIONAL: {
    tint: "cyan",
    tagline: "Most Popular · High Velocity",
    highlightBadge: "★ Most Popular",
    recommended: true,
    cadence: "30-second checks",
    description: "For fast-moving engineering teams monitoring production services, APIs and servers.",
    pricing: {
      NPR: { monthly: 2499, yearly: 1999 },
      USD: { monthly: 19, yearly: 15 }
    },
    specs: {
      monitors: 25,
      hosts: 10,
      alertChannels: 5,
      members: 25,
      historyDays: 30
    },
    keyPoints: [
      "25 High-cadence Website & API monitors",
      "10 Server hosts (Kada Nigrani Linux agent)",
      "5 Alert channels (Slack, Discord, Email, Webhooks)",
      "Sub-30s check cadence across global mesh",
      "Automated Root Cause Analysis (RCA)",
      "5-hop HTTP redirect chain latency tracing",
      "Custom domain status page with SSL",
      "30 days high-resolution telemetry history"
    ]
  },
  BUSINESS: {
    tint: "violet",
    tagline: "Scale Ops · Multi-Cluster",
    highlightBadge: "High Throughput",
    recommended: false,
    cadence: "30-second priority checks",
    description: "For growing organizations running microservices, multi-host clusters and on-call rotations.",
    pricing: {
      NPR: { monthly: 7999, yearly: 6399 },
      USD: { monthly: 59, yearly: 47 }
    },
    specs: {
      monitors: 100,
      hosts: 50,
      alertChannels: 20,
      members: 100,
      historyDays: 90
    },
    keyPoints: [
      "100 Website, API & TCP socket monitors",
      "50 Server hosts with real-time process explorer",
      "20 Multi-destination alert channels & PagerDuty",
      "TCP & DNS latency breakdown metrics",
      "CyberSachet security posture scoring",
      "Multi-step escalation policies & on-call routing",
      "Role-Based Access Control (RBAC) & Audit logs",
      "90 days extended telemetry & incident history"
    ]
  },
  ENTERPRISE: {
    tint: "amber",
    tagline: "Mission Critical · Sovereign VPC",
    highlightBadge: "Custom SLA",
    recommended: false,
    cadence: "10-second checks",
    description: "For banks, hospitals, telecom, MSPs and sovereign clouds requiring bespoke SLAs and isolation.",
    pricing: {
      NPR: { monthly: null, yearly: null },
      USD: { monthly: null, yearly: null }
    },
    specs: {
      monitors: UNLIMITED,
      hosts: UNLIMITED,
      alertChannels: UNLIMITED,
      members: UNLIMITED,
      historyDays: 365
    },
    keyPoints: [
      "Unlimited monitors with 10-second check interval",
      "Unlimited Linux host telemetry agents",
      "Dedicated VPC probe relays & on-premise collectors",
      "99.99% Contractual Uptime SLA with financial credit",
      "Custom data retention up to 7 years",
      "Dedicated Technical Account Manager & 24/7 hotline",
      "Custom Nepal VAT invoice or international wire transfer",
      "Tailored security DPA & on-premise deployment option"
    ]
  }
};

const COMPARISON_CATEGORIES = [
  {
    name: "Monitoring & Probes",
    items: [
      { label: "Check Cadence", starter: "60 seconds", pro: "30 seconds", biz: "30s (Priority)", ent: "10 seconds" },
      { label: "Global Probe Mesh Regions", starter: "2 Regions", pro: "6 Regions", biz: "12 Regions", ent: "Dedicated Relays" },
      { label: "HTTP, HTTPS & API Checks", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Keyword & Status Code Asserts", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "5-Hop Redirect Chain Tracing", starter: "—", pro: "✓", biz: "✓", ent: "✓" },
      { label: "TCP & Multi-Region DNS Checks", starter: "—", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Sub-Resource Integrity (SRI) Scan", starter: "—", pro: "—", biz: "✓", ent: "✓" }
    ]
  },
  {
    name: "Kada Nigrani (Server Infrastructure)",
    items: [
      { label: "Lightweight Linux Agent (<0.5% CPU)", starter: "1 Host", pro: "10 Hosts", biz: "50 Hosts", ent: "Unlimited" },
      { label: "Live CPU, RAM & Disk Telemetry", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Load Average & Network I/O Streams", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Live Process Tree & Top Resource Consumers", starter: "—", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Host Disk Inode & Saturation Warnings", starter: "—", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Air-Gapped / Private VPC Agent Relay", starter: "—", pro: "—", biz: "—", ent: "✓" }
    ]
  },
  {
    name: "Incidents, Alerting & Status Pages",
    items: [
      { label: "Alert Notification Channels", starter: "1 Channel", pro: "5 Channels", biz: "20 Channels", ent: "Unlimited" },
      { label: "Slack, Discord & Webhook Integration", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Autonomous Root-Cause Analysis (RCA)", starter: "—", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Public Status Page", starter: "Standard", pro: "Custom Domain + SSL", biz: "Multi-Brand Pages", ent: "Private & White-Label" },
      { label: "Auto-Healing & Self-Resolving Incidents", starter: "✓", pro: "✓", biz: "✓", ent: "✓" },
      { label: "Multi-Tier Escalation Rotations", starter: "—", pro: "—", biz: "✓", ent: "✓" }
    ]
  },
  {
    name: "Security, Governance & Compliance",
    items: [
      { label: "SSL Expiry Tracking & Scoring", starter: "7-Day Alerts", pro: "30-Day Alerts", biz: "30-Day Alerts", ent: "Continuous Audit" },
      { label: "Security Header Posture Score (/100)", starter: "Basic", pro: "Full Breakdown", biz: "Advanced Posture", ent: "Custom Baselines" },
      { label: "Role-Based Access Control (RBAC)", starter: "—", pro: "Admins & Members", biz: "Granular RBAC", ent: "Custom Dynamic RBAC" },
      { label: "Audit Logging & Event Streams", starter: "—", pro: "—", biz: "✓", ent: "✓ (Immutable S3/VPC)" },
      { label: "Telemetry History Retention", starter: "7 Days", pro: "30 Days", biz: "90 Days", ent: "365+ Days" },
      { label: "Support & SLA", starter: "Community", pro: "Standard Email", biz: "Priority Response", ent: "99.99% SLA + 24/7 TAM" }
    ]
  }
];

const FAQS = [
  {
    q: "Are the monitor and server limits strictly enforced?",
    a: "Yes. Every limit listed above is directly enforced by the platform's core scheduler. There are zero surprise overage fees or bill shocks — when you reach your capacity, you have the option to upgrade instantly or archive unused endpoints."
  },
  {
    q: "Can I pay in Nepali Rupees (NPR) with local payment methods?",
    a: "Absolutely. NPR is our primary currency in Nepal. We support seamless local digital checkout as well as corporate VAT invoicing for businesses registered in Nepal. International organizations can pay in USD via Stripe."
  },
  {
    q: "How does the Kada Nigrani server monitoring agent impact host performance?",
    a: "The agent is engineered in minimal C/Go and uses less than 15MB of RAM and typically under 0.2% CPU. It runs cleanly as a systemd service on any Linux distribution (Ubuntu, Debian, RHEL, Rocky, Alpine) with a single-line bash command."
  },
  {
    q: "What is the difference between Monthly and Annual billing?",
    a: "When you choose Annual billing, you receive an immediate 20% discount (equivalent to over 2 months completely free every year). You can switch between billing periods anytime from your organization settings."
  },
  {
    q: "Can I start on the free Starter plan and upgrade later?",
    a: "Yes! The Starter plan is 100% free forever and requires no credit card. When your architecture expands and you need sub-30s intervals, more server hosts, or team members, your upgrades apply immediately with zero disruption."
  },
  {
    q: "What does Enterprise custom architecture include?",
    a: "Enterprise is designed for banks, healthcare providers, telecom operators and MSPs. It includes dedicated regional VPC probe relays, custom DPAs, ISO/SOC-2 compliance artifacts, white-labeled status pages, and a contractual 99.99% uptime guarantee."
  }
];

function UpgradeForm({ plan, billing = "monthly" }) {
  const [email, setEmail] = useState("");
  const [checkoutError, setCheckoutError] = useState(null);

  const checkout = useMutation({
    mutationFn: () => createCheckoutSession(plan)
  });

  const lead = useMutation({
    mutationFn: () =>
      submitWaitlistSignup({
        email,
        product: "upgrade-request",
        note: `Interested in ${plan} (${billing})`
      })
  });

  if (plan === "ENTERPRISE") {
    if (lead.isSuccess) {
      return (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <p className="text-xs font-medium text-emerald-300">
            Inquiry received. Our infrastructure architect will reach out to <span className="underline">{email}</span> within 4 hours.
          </p>
        </div>
      );
    }

    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          lead.mutate();
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="work@enterprise.com"
          className="w-full rounded-xl border border-white/15 light:border-slate-300 bg-black/50 light:bg-slate-100 px-3.5 py-2.5 text-xs text-white light:text-slate-900 placeholder:text-white/40 light:placeholder:text-slate-400 focus:border-amber-400 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={lead.isPending}
          className="w-full rounded-xl border border-amber-400/40 bg-amber-400/10 light:bg-amber-500/20 px-4 py-2.5 text-xs font-semibold text-amber-300 light:text-amber-800 transition-all hover:bg-amber-400 hover:text-black active:scale-[0.98] disabled:opacity-50"
        >
          {lead.isPending ? "Connecting..." : "Request Architecture Consultation →"}
        </button>
        {lead.isError && (
          <p className="text-[11px] text-red-400 text-center">Failed to submit. Please contact support.</p>
        )}
      </form>
    );
  }

  function handleUpgrade() {
    setCheckoutError(null);
    checkout.mutate(undefined, {
      onSuccess: url => {
        window.location.href = url;
      },
      onError: err => setCheckoutError(err.message)
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={checkout.isPending}
        className={`w-full rounded-xl py-3 px-4 text-center text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-60 ${
          plan === "PROFESSIONAL"
            ? "bg-cyan-400 text-black hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(0,240,255,0.4)]"
            : "bg-white text-black light:bg-slate-900 light:text-white hover:bg-neutral-200 light:hover:bg-slate-800"
        }`}
      >
        {checkout.isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
            Initializing Stripe Checkout…
          </span>
        ) : (
          `Upgrade to ${titleCase(plan)}`
        )}
      </button>
      {checkoutError && (
        <p className="text-[11px] text-amber-300 light:text-amber-700 text-center">{checkoutError}</p>
      )}
    </div>
  );
}

// Interactive Infrastructure Sizer (Stack Estimator)
function InfrastructureSizer({ plans, onSelectPlan }) {
  const [monitors, setMonitors] = useState(15);
  const [hosts, setHosts] = useState(4);
  const [channels, setChannels] = useState(3);
  const [members, setMembers] = useState(5);

  const totalMonthlyProbes = monitors * 2 * 60 * 24 * 30; // 30-day calculation

  // Find optimal plan based on user requirements
  const recommendedPlan = useMemo(() => {
    for (const p of plans) {
      if (
        p.maxMonitors >= monitors &&
        p.maxHosts >= hosts &&
        p.maxAlertChannels >= channels &&
        (p.maxMembers == null || p.maxMembers >= members)
      ) {
        return p;
      }
    }
    return plans.find(p => p.plan === "ENTERPRISE") ?? plans[plans.length - 1];
  }, [plans, monitors, hosts, channels, members]);

  const planName = recommendedPlan?.plan ?? "PROFESSIONAL";
  const cfg = PLAN_CONFIG[planName] ?? PLAN_CONFIG.PROFESSIONAL;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 light:border-slate-900/10 bg-neutral-900/50 light:bg-white p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 light:border-slate-900/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Interactive Capacity Sizer
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white light:text-slate-900">
            Calculate your infrastructure demand
          </h3>
          <p className="mt-1 text-sm text-white/60 light:text-slate-500">
            Adjust the sliders below to see your estimated monthly probe volume and get an instant plan match.
          </p>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-white/10 light:border-slate-200 bg-black/40 light:bg-slate-100 p-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 light:text-slate-500">
              Estimated Monthly Probes
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-cyan-400 light:text-cyan-600">
              {(totalMonthlyProbes / 1000000).toFixed(1)}M <span className="text-xs font-normal text-white/50 light:text-slate-500">checks/mo</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-white/80 light:text-slate-700">Websites & API Endpoints</span>
              <span className="font-mono text-cyan-400 light:text-cyan-600 font-semibold">{monitors} endpoints</span>
            </div>
            <input
              type="range"
              min="1"
              max="150"
              value={monitors}
              onChange={e => setMonitors(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 light:text-slate-400 font-mono mt-1">
              <span>1</span>
              <span>25 (Pro)</span>
              <span>100 (Business)</span>
              <span>150+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-white/80 light:text-slate-700">Server Hosts (Kada Nigrani Linux agents)</span>
              <span className="font-mono text-cyan-400 light:text-cyan-600 font-semibold">{hosts} hosts</span>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              value={hosts}
              onChange={e => setHosts(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 light:text-slate-400 font-mono mt-1">
              <span>1 (Starter)</span>
              <span>10 (Pro)</span>
              <span>50 (Business)</span>
              <span>80+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-white/80 light:text-slate-700">Alert Channels (Slack, Discord, Webhooks)</span>
              <span className="font-mono text-cyan-400 light:text-cyan-600 font-semibold">{channels} channels</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={channels}
              onChange={e => setChannels(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 light:text-slate-400 font-mono mt-1">
              <span>1</span>
              <span>5</span>
              <span>20</span>
              <span>30+</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="font-medium text-white/80 light:text-slate-700">Team Members & On-Call Seats</span>
              <span className="font-mono text-cyan-400 light:text-cyan-600 font-semibold">{members} seats</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={members}
              onChange={e => setMembers(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-white/30 light:text-slate-400 font-mono mt-1">
              <span>1</span>
              <span>10</span>
              <span>25</span>
              <span>50+</span>
            </div>
          </div>
        </div>

        {/* Dynamic Recommendation Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-cyan-400/30 bg-cyan-950/20 light:bg-cyan-50/50 p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 light:text-cyan-700 font-semibold">
              Calculated Best Fit
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <h4 className="text-3xl font-bold tracking-tight text-white light:text-slate-900">
                {titleCase(planName)}
              </h4>
              <span className="rounded-full bg-cyan-400/20 px-2.5 py-0.5 text-xs font-medium text-cyan-300 light:text-cyan-800">
                {cfg.highlightBadge}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/70 light:text-slate-600">
              {cfg.description}
            </p>

            <ul className="mt-5 space-y-2 text-xs text-white/80 light:text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                Capacity for <strong>{cap(recommendedPlan?.maxMonitors)}</strong> monitors (you need {monitors})
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                Capacity for <strong>{cap(recommendedPlan?.maxHosts)}</strong> server hosts (you need {hosts})
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                <strong>{recommendedPlan?.historyDays ?? 30} days</strong> metric & incident history
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                {cfg.cadence}
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-cyan-400/20">
            <button
              type="button"
              onClick={() => onSelectPlan(planName)}
              className="w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-center text-xs font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Focus {titleCase(planName)} Plan Card ↓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stack ROI & Consolidation View (ITOps vs Fragmented tools)
function StackRoiComparison({ currency }) {
  const cur = CURRENCIES[currency];
  const items = [
    { tool: "Dedicated Uptime Service", costUsd: 34, costNpr: 4500, itopsFeature: "Included (30s multi-region probes)" },
    { tool: "Server Host Agent (CPU/RAM/Disk)", costUsd: 65, costNpr: 8700, itopsFeature: "Included (Kada Nigrani Linux agent)" },
    { tool: "On-Call & Pager Routing", costUsd: 79, costNpr: 10500, itopsFeature: "Included (Autonomous incident mesh)" },
    { tool: "Hosted Public Status Page", costUsd: 39, costNpr: 5200, itopsFeature: "Included (Custom domain + SSL)" },
    { tool: "SSL & Security Header Auditing", costUsd: 35, costNpr: 4700, itopsFeature: "Included (Continuous posture scoring)" }
  ];

  const totalToolUsd = items.reduce((acc, i) => acc + i.costUsd, 0);
  const totalToolNpr = items.reduce((acc, i) => acc + i.costNpr, 0);

  const itopsProUsd = 15; // annual rate
  const itopsProNpr = 1999;

  const totalFragmented = currency === "NPR" ? cur.fmt(totalToolNpr) : cur.fmt(totalToolUsd);
  const itopsCost = currency === "NPR" ? cur.fmt(itopsProNpr) : cur.fmt(itopsProUsd);
  const monthlySavings = currency === "NPR" ? cur.fmt(totalToolNpr - itopsProNpr) : cur.fmt(totalToolUsd - itopsProUsd);

  return (
    <div className="rounded-3xl border border-white/10 light:border-slate-900/10 bg-neutral-900/40 light:bg-white p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 light:border-slate-900/10 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            TCO & Tool Consolidation
          </span>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white light:text-slate-900">
            Stop paying 5 vendors for 1 operational picture
          </h3>
          <p className="mt-1 text-sm text-white/60 light:text-slate-500">
            How ITOps Solution replaces disconnected SaaS subscriptions into one unified control plane.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase text-emerald-400 font-bold">Estimated Savings</p>
            <p className="text-xl font-bold text-white light:text-slate-900">
              {monthlySavings} <span className="text-xs font-normal text-white/50 light:text-slate-500">/ mo</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 light:border-slate-200 text-white/40 light:text-slate-500 font-mono uppercase tracking-wider">
              <th className="py-3 px-4">Traditional Fragmented Tool</th>
              <th className="py-3 px-4">Average Monthly Spend</th>
              <th className="py-3 px-4">ITOps Solution Unified Platform</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] light:divide-slate-200">
            {items.map(item => (
              <tr key={item.tool} className="hover:bg-white/[0.02] light:hover:bg-slate-50">
                <td className="py-3.5 px-4 font-medium text-white/80 light:text-slate-800">{item.tool}</td>
                <td className="py-3.5 px-4 font-mono text-red-400 light:text-red-600">
                  {currency === "NPR" ? cur.fmt(item.costNpr) : cur.fmt(item.costUsd)} / mo
                </td>
                <td className="py-3.5 px-4 font-mono text-emerald-300 light:text-emerald-700 font-semibold">
                  ✓ {item.itopsFeature}
                </td>
              </tr>
            ))}
            <tr className="bg-white/[0.03] light:bg-slate-100 font-semibold">
              <td className="py-4 px-4 text-white light:text-slate-900">Total Monthly Cost</td>
              <td className="py-4 px-4 font-mono text-red-400 line-through">{totalFragmented} / mo</td>
              <td className="py-4 px-4 font-mono text-cyan-400 light:text-cyan-700 text-sm">
                From {itopsCost} / mo (Save ~85%)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PricingSection() {
  const { user } = useAuth();
  const [currency, setCurrency] = useState("NPR");
  const [billing, setBilling] = useState("yearly"); // monthly | yearly
  const [activeTab, setActiveTab] = useState("cards"); // cards | sizer | matrix | roi | faq
  const [highlightedPlan, setHighlightedPlan] = useState("PROFESSIONAL");

  const cur = CURRENCIES[currency];

  const {
    data: plans,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["plan-catalog"],
    queryFn: fetchPlanCatalog
  });

  const { data: usage } = useQuery({
    queryKey: ["plan-usage"],
    queryFn: fetchPlanUsage,
    enabled: !!user
  });

  const { data: planCopyItems } = useQuery({
    queryKey: ["content", "pricing", "plan_copy"],
    queryFn: () => fetchContentItems("pricing", "plan_copy")
  });

  const planCopy = useMemo(
    () =>
      new Map(
        (planCopyItems ?? []).map(item => [
          item.itemKey,
          {
            forWho: item.title,
            tagline: item.subtitle,
            metadata: item.metadata ?? {}
          }
        ])
      ),
    [planCopyItems]
  );

  const mergedPlans = useMemo(() => {
    if (!plans || plans.length === 0) {
      return ["STARTER", "PROFESSIONAL", "BUSINESS", "ENTERPRISE"].map(p => ({
        plan: p,
        ...PLAN_CONFIG[p].specs
      }));
    }
    return plans;
  }, [plans]);

  function getPlanPrice(planKey) {
    const cmsItem = planCopy.get(planKey);
    const cmsPrice = cmsItem?.metadata?.price?.[currency]?.[billing];
    if (cmsPrice != null && cmsPrice !== "") {
      return Number(cmsPrice);
    }
    const def = PLAN_CONFIG[planKey]?.pricing?.[currency]?.[billing];
    return def;
  }

  function handleSelectPlanFromSizer(planKey) {
    setHighlightedPlan(planKey);
    setActiveTab("cards");
    const el = document.getElementById(`plan-${planKey}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <section className="relative z-10 px-4 pb-28 pt-32 sm:px-6 md:px-10 max-w-7xl 3xl:max-w-[1700px] mx-auto">
      {/* Hero Header */}
      <div className="relative isolate mx-auto overflow-hidden rounded-3xl border border-white/10 light:border-slate-900/10 bg-[#090d18] light:bg-white p-8 md:p-14 text-center light:shadow-[0_20px_60px_-25px_rgba(15,23,42,0.1)]">
        <MetricBarsBackground tint="cyan" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#090d18] light:to-white" />

        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 light:border-slate-300 bg-white/5 light:bg-slate-100 px-3.5 py-1 text-[11px] font-mono uppercase tracking-widest text-cyan-300 light:text-cyan-700">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            Live Global Probe Mesh · Sub-30s Cadence
          </div>

          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.03em] text-white light:text-slate-900 sm:text-5xl md:text-6xl leading-[1.08]">
            Predictable Capacity.{" "}
            <span className="text-gradient block sm:inline">Engineered for Zero Downtime.</span>
          </h1>

          <p className="mt-5 text-base leading-relaxed text-white/65 light:text-slate-600 sm:text-lg">
            Every synthetic probe interval, Linux server host, alert channel, and team seat limit is transparent and
            enforced. Start free on Starter — scale without quota cliff surprises.
          </p>

          {/* Interactive Top Segment Controls */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {/* Currency Selector */}
            <div className="inline-flex items-center rounded-2xl border border-white/10 light:border-slate-300 bg-black/40 light:bg-slate-100 p-1 backdrop-blur-md">
              {Object.keys(CURRENCIES).map(cKey => (
                <button
                  key={cKey}
                  type="button"
                  onClick={() => setCurrency(cKey)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    currency === cKey
                      ? "bg-white text-black shadow-md light:bg-slate-900 light:text-white"
                      : "text-white/60 light:text-slate-600 hover:text-white"
                  }`}
                >
                  {cKey === "NPR" ? "🇳🇵 NPR (रू)" : "🌐 USD ($)"}
                </button>
              ))}
            </div>

            {/* Billing Frequency Toggle */}
            <div className="inline-flex items-center rounded-2xl border border-white/10 light:border-slate-300 bg-black/40 light:bg-slate-100 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  billing === "monthly"
                    ? "bg-white text-black shadow-md light:bg-slate-900 light:text-white"
                    : "text-white/60 light:text-slate-600 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`relative rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                  billing === "yearly"
                    ? "bg-white text-black shadow-md light:bg-slate-900 light:text-white"
                    : "text-white/60 light:text-slate-600 hover:text-white"
                }`}
              >
                <span>Yearly</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 light:text-emerald-700">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-white/40 light:text-slate-400 font-mono">
            {cur.vatNote} · Free Starter plan forever
          </p>
        </div>
      </div>

      {/* Logged-in User Active Quota HUD */}
      {user && usage && (
        <Reveal className="mx-auto mt-8 max-w-4xl">
          <div className="rounded-2xl border border-cyan-400/25 bg-neutral-900/80 light:bg-white p-5 shadow-[0_0_40px_-15px_rgba(0,240,255,0.2)] backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400">
                  <BrandMark size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-mono tracking-wider text-white/50 light:text-slate-500">
                      Active Organization Plan:
                    </span>
                    <span className="rounded-md bg-cyan-400/15 px-2 py-0.5 text-xs font-bold text-cyan-300 light:text-cyan-800 uppercase">
                      {usage.plan}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 light:text-slate-600 mt-0.5">
                    Live production limits enforced on all probes and hosts
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <div className="rounded-lg bg-black/40 light:bg-slate-100 px-3 py-1.5 border border-white/10 light:border-slate-200">
                  <span className="text-white/40 light:text-slate-500">Monitors: </span>
                  <span className="text-cyan-400 light:text-cyan-700 font-semibold">
                    {usage.currentMonitors} / {cap(usage.maxMonitors)}
                  </span>
                </div>
                <div className="rounded-lg bg-black/40 light:bg-slate-100 px-3 py-1.5 border border-white/10 light:border-slate-200">
                  <span className="text-white/40 light:text-slate-500">Alerts: </span>
                  <span className="text-emerald-400 light:text-emerald-700 font-semibold">
                    {usage.currentAlertChannels} / {cap(usage.maxAlertChannels)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* View Switcher Tabs (Plans / Sizer / Matrix / ROI / FAQ) */}
      <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-1 rounded-2xl border border-white/10 light:border-slate-200 bg-neutral-900/60 light:bg-white p-1.5 backdrop-blur-xl">
        {[
          ["cards", "Plan Tiers"],
          ["sizer", "Stack Sizer"],
          ["matrix", "Full Matrix"],
          ["roi", "Tool ROI"],
          ["faq", "FAQ"]
        ].map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`flex-1 rounded-xl py-2 px-3 text-center text-xs font-medium transition-all ${
              activeTab === tabKey
                ? "bg-white text-black shadow-sm light:bg-slate-900 light:text-white"
                : "text-white/60 light:text-slate-600 hover:text-white light:hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Content Area based on Tab */}
      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* TAB 1: CARDS */}
        {activeTab === "cards" && (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 rounded-3xl" />
                ))}
              </div>
            ) : isError ? (
              <ErrorState message="Unable to load live pricing plans from catalog." onRetry={() => refetch()} />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
                {mergedPlans.map((plan, i) => {
                  const planKey = plan.plan;
                  const cfg = PLAN_CONFIG[planKey] ?? PLAN_CONFIG.STARTER;
                  const cms = planCopy.get(planKey);
                  const price = getPlanPrice(planKey);
                  const isHighlighted = highlightedPlan === planKey;

                      return (
                        <SpotlightCard
                          key={planKey}
                          id={`plan-${planKey}`}
                          tint={cfg.recommended || isHighlighted ? "cyan" : "white"}
                          delay={i * 0.08}
                          className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 ${
                            isHighlighted || cfg.recommended
                              ? "border-cyan-400/60 shadow-[0_0_60px_-15px_rgba(0,240,255,0.25)] scale-[1.02] z-10"
                              : "border-white/10 light:border-slate-200"
                          }`}
                        >
                          {/* Top Badges */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                                  cfg.recommended
                                    ? "bg-cyan-400/15 border-cyan-400/30 text-cyan-300 light:text-cyan-800"
                                    : "bg-white/5 border-white/10 light:bg-slate-100 light:border-slate-200 text-white/70 light:text-slate-600"
                                }`}
                              >
                                {cfg.highlightBadge}
                              </span>
                              <span className="text-[10px] font-mono text-white/40 light:text-slate-400">
                                {cfg.cadence}
                              </span>
                            </div>

                        {/* Title & Tagline */}
                        <div className="mt-4">
                          <h2 className="text-2xl font-bold tracking-tight text-white light:text-slate-900">
                            {titleCase(planKey)}
                          </h2>
                          <p className="mt-1 text-xs text-white/60 light:text-slate-500 min-h-[32px]">
                            {cms?.tagline ?? cfg.description}
                          </p>
                        </div>

                        {/* Price Tag */}
                        <div className="mt-5 border-y border-white/10 light:border-slate-200 py-4">
                          {price === 0 ? (
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
                                  Free
                                </span>
                                <span className="text-xs text-white/40 light:text-slate-400">/ forever</span>
                              </div>
                              <p className="text-[10px] font-mono text-emerald-400 mt-1">
                                No credit card required · Instant setup
                              </p>
                            </div>
                          ) : price != null ? (
                            <div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold tracking-tight tabular-nums text-white light:text-slate-900">
                                  {cur.fmt(price)}
                                </span>
                                <span className="text-xs text-white/50 light:text-slate-500">
                                  / {billing === "yearly" ? "month" : "month"}
                                </span>
                              </div>
                              {billing === "yearly" && (
                                <p className="text-[10px] font-mono text-cyan-300 light:text-cyan-700 mt-1">
                                  Billed annually ({cur.fmt(price * 12)}/yr) · 20% discount
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-extrabold tracking-tight text-white light:text-slate-900">
                                  Custom
                                </span>
                                <span className="text-xs text-white/40 light:text-slate-400">/ tailored</span>
                              </div>
                              <p className="text-[10px] font-mono text-amber-300 light:text-amber-700 mt-1">
                                Dedicated VPC probes & Custom SLA
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Primary Quota Metric Badges */}
                        <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="rounded-xl border border-white/10 light:border-slate-200 bg-black/30 light:bg-slate-50 p-2.5">
                            <span className="block text-[10px] text-white/40 light:text-slate-400">Monitors</span>
                            <span className="font-bold text-white light:text-slate-900">
                              {cap(plan.maxMonitors)}
                            </span>
                          </div>
                          <div className="rounded-xl border border-white/10 light:border-slate-200 bg-black/30 light:bg-slate-50 p-2.5">
                            <span className="block text-[10px] text-white/40 light:text-slate-400">Server Hosts</span>
                            <span className="font-bold text-white light:text-slate-900">
                              {cap(plan.maxHosts)}
                            </span>
                          </div>
                          <div className="rounded-xl border border-white/10 light:border-slate-200 bg-black/30 light:bg-slate-50 p-2.5">
                            <span className="block text-[10px] text-white/40 light:text-slate-400">Alerts</span>
                            <span className="font-bold text-white light:text-slate-900">
                              {cap(plan.maxAlertChannels)}
                            </span>
                          </div>
                          <div className="rounded-xl border border-white/10 light:border-slate-200 bg-black/30 light:bg-slate-50 p-2.5">
                            <span className="block text-[10px] text-white/40 light:text-slate-400">History</span>
                            <span className="font-bold text-white light:text-slate-900">
                              {plan.historyDays} Days
                            </span>
                          </div>
                        </div>

                        {/* Feature Highlights List */}
                        <ul className="mt-6 space-y-2 text-xs text-white/70 light:text-slate-600">
                          {cfg.keyPoints.map(point => (
                            <li key={point} className="flex items-start gap-2">
                              <span
                                className={`mt-0.5 shrink-0 ${
                                  planKey === "PROFESSIONAL" ? "text-cyan-400" : "text-emerald-400"
                                }`}
                              >
                                ✓
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button / Upgrade Form */}
                      <div className="mt-8 pt-4 border-t border-white/10 light:border-slate-200">
                        {planKey === "STARTER" ? (
                          <Link
                            to="/register"
                            className="block w-full rounded-xl bg-white light:bg-slate-900 py-3 text-center text-xs font-semibold text-black light:text-white transition-all hover:bg-neutral-200 light:hover:bg-slate-800 active:scale-[0.98]"
                          >
                            Deploy Free Starter →
                          </Link>
                        ) : (
                          <UpgradeForm plan={planKey} billing={billing} />
                        )}
                      </div>
                    </SpotlightCard>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INFRASTRUCTURE SIZER */}
        {activeTab === "sizer" && (
          <InfrastructureSizer plans={mergedPlans} onSelectPlan={handleSelectPlanFromSizer} />
        )}

        {/* TAB 3: FULL FEATURE MATRIX */}
        {activeTab === "matrix" && (
          <div className="overflow-hidden rounded-3xl border border-white/10 light:border-slate-900/10 bg-neutral-900/60 light:bg-white backdrop-blur-xl">
            <div className="p-6 md:p-8 border-b border-white/10 light:border-slate-200">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                Granular Specifications
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-white light:text-slate-900">
                Detailed capability breakdown across all tiers
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 light:border-slate-200 bg-black/40 light:bg-slate-100 font-mono text-[11px] uppercase tracking-wider text-white/50 light:text-slate-500">
                    <th className="py-4 px-6 w-1/3">Capability</th>
                    <th className="py-4 px-4 text-emerald-400 font-bold">Starter</th>
                    <th className="py-4 px-4 text-cyan-400 font-bold">Professional</th>
                    <th className="py-4 px-4 text-violet-400 font-bold">Business</th>
                    <th className="py-4 px-4 text-amber-400 font-bold">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] light:divide-slate-200">
                  {COMPARISON_CATEGORIES.map(category => (
                    <tr key={category.name} className="contents">
                      <tr className="bg-white/[0.02] light:bg-slate-50">
                        <td
                          colSpan={5}
                          className="py-3 px-6 font-mono text-xs font-bold uppercase tracking-widest text-cyan-300 light:text-cyan-700"
                        >
                          {category.name}
                        </td>
                      </tr>
                      {category.items.map(item => (
                        <tr key={item.label} className="hover:bg-white/[0.02] light:hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-6 font-medium text-white/80 light:text-slate-700">{item.label}</td>
                          <td className="py-3.5 px-4 font-mono text-white/70 light:text-slate-600">{item.starter}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-cyan-300 light:text-cyan-800">{item.pro}</td>
                          <td className="py-3.5 px-4 font-mono text-white/70 light:text-slate-600">{item.biz}</td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-amber-300 light:text-amber-800">{item.ent}</td>
                        </tr>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TOOL CONSOLIDATION / ROI */}
        {activeTab === "roi" && <StackRoiComparison currency={currency} />}

        {/* TAB 5: FAQS */}
        {activeTab === "faq" && (
          <div className="grid gap-4 md:grid-cols-2">
            {FAQS.map(faq => (
              <div
                key={faq.q}
                className="rounded-2xl border border-white/10 light:border-slate-200 bg-neutral-900/50 light:bg-white p-6 backdrop-blur-md"
              >
                <h4 className="text-sm font-semibold text-white light:text-slate-900">{faq.q}</h4>
                <p className="mt-2 text-xs leading-relaxed text-white/60 light:text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Trust & Assurance Badges */}
      <div className="mt-20 border-y border-white/10 light:border-slate-900/10 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
          <div>
            <p className="text-2xl font-bold text-cyan-400">99.99%</p>
            <p className="text-xs text-white/50 light:text-slate-500 mt-1 font-mono uppercase">Global Probe SLA</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">&lt; 0.5% CPU</p>
            <p className="text-xs text-white/50 light:text-slate-500 mt-1 font-mono uppercase">Linux Agent Overhead</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-violet-400">SOC-2 / ISO</p>
            <p className="text-xs text-white/50 light:text-slate-500 mt-1 font-mono uppercase">Security Aligned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">60 Seconds</p>
            <p className="text-xs text-white/50 light:text-slate-500 mt-1 font-mono uppercase">Setup to First Check</p>
          </div>
        </div>
      </div>

      {/* Enterprise Architecture Consultation Callout */}
      <Reveal className="relative mt-20 overflow-hidden rounded-3xl border border-white/10 light:border-slate-900/10 bg-neutral-950 light:bg-white p-8 md:p-14 text-center">
        <div className="pointer-events-none absolute inset-0 [background:var(--grad-brand-soft)] opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-96 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[100px]" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="rounded-full bg-amber-400/10 px-3 py-1 font-mono text-xs uppercase tracking-wider text-amber-300 light:text-amber-800 border border-amber-400/20">
            Dedicated Enterprise Inquiries
          </span>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-white light:text-slate-900 md:text-4xl">
            Running sovereign clouds, banks, or hospital networks?
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/60 light:text-slate-600">
            If you need on-premise agent collectors, air-gapped probes, custom compliance DPAs, or tailored Nepal VAT
            invoicing, talk directly to our systems architecture team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <CTALink to="/company" size="md" magnetic>
              Schedule Architecture Consultation →
            </CTALink>
            <CTALink to="/support" variant="secondary" size="md">
              Review Support & SLAs
            </CTALink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Pricing() {
  return (
    <div
      className="min-h-screen bg-black light:bg-slate-50 text-white light:text-slate-900 antialiased"
      style={{
        fontFamily: "'Readex Pro', system-ui, -apple-system, sans-serif"
      }}
    >
      <MarketingNav />
      <div className="enterprise-grid pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden />

      <main className="relative z-10">
        <PricingSection />
      </main>

      <MarketingFooter />
    </div>
  );
}