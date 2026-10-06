// Content of the Moonsav ITOps Academy marketing page (tracks, lab tiers, FAQ).
// Moved out of pages/Academy.jsx unchanged so the redesigned page reuses it.
export const PHILOSOPHY_STEPS = [
  "LEARN", "BUILD", "DEPLOY", "OPERATE", "MONITOR", "BREAK",
  "INVESTIGATE", "FIX", "AUTOMATE", "SECURE", "SCALE", "RECOVER",
  "DOCUMENT", "IMPROVE"
];

export const LAB_TIERS = [
  {
    tier: "Tier 1",
    title: "Browser Simulation Engine",
    badge: "Available Now",
    color: "cyan",
    desc: "Zero setup, instant in-browser stateful terminal with interactive topology inspector, simulated command execution, and automated verification."
  },
  {
    tier: "Tier 2",
    title: "Real Docker Compose Lab",
    badge: "Hands-On",
    color: "emerald",
    desc: "Isolated container environments running real Linux, Docker Engine, PostgreSQL, Redis, MQTT brokers, and Nginx reverse proxies."
  },
  {
    tier: "Tier 3",
    title: "Real Kubernetes Cluster Lab",
    badge: "Cloud-Native",
    color: "indigo",
    desc: "Dedicated Kubernetes namespace with real kubectl, Deployments, Services, NetworkPolicies, Prometheus scraping, and Grafana dashboards."
  },
  {
    tier: "Tier 4",
    title: "Full Cloud Infrastructure Lab",
    badge: "Enterprise",
    color: "purple",
    desc: "Multi-VM cloud environments orchestrated via Terraform IaC, Ansible automation, and CI/CD pipelines."
  }
];

export const TRACKS = [
  {
    title: "Track 1 — ITOps Foundation",
    desc: "Linux kernel, process trees, systemd services, TCP/IP sockets, DNS debugging, TLS 1.3, Git branching, and Bash automation.",
    topics: ["Linux Internals", "Networking & Sockets", "DNS & TLS", "Systemd Services", "Bash Scripting", "Process Triage"]
  },
  {
    title: "Track 2 — DevOps & Orchestration",
    desc: "Multi-stage Docker, Compose networking, Nginx reverse proxies, GitHub Actions CI/CD, Terraform IaC, and Kubernetes zero-downtime rollouts.",
    topics: ["Docker & Distroless", "Compose Stacks", "Nginx Gateways", "GitHub Actions", "Terraform Modules", "Kubernetes Rollouts"]
  },
  {
    title: "Track 3 — DevSecOps & Cloud Security",
    desc: "Shift-left SAST scanning, Gitleaks secret detection, Trivy container CVE scans, HashiCorp Vault dynamic secrets, and K8s NetworkPolicies.",
    topics: ["SAST & Semgrep", "Secret Scanning", "Container CVEs", "HashiCorp Vault", "K8s NetworkPolicy", "Zero Trust"]
  },
  {
    title: "Track 4 — SRE, Observability & Chaos",
    desc: "Prometheus metrics, Grafana SLO dashboards, OpenTelemetry distributed tracing, Chaos engineering fault injection, and live incident postmortems.",
    topics: ["Prometheus & PromQL", "Grafana SLOs", "OpenTelemetry Traces", "Chaos Engineering", "Incident Triage", "Blameless Postmortems"]
  }
];

export const FAQ = [
  {
    q: "How does MOONSAV ITOps Academy differ from standard tutorial websites?",
    a: "MOONSAV ITOps Academy is built around real operating environments. You do not just watch videos; you take control of real architectures (IoT water pumps & distributed microservices), inspect live topologies, execute terminal commands, respond to live production outages, and author blameless postmortems."
  },
  {
    q: "What is the difference between Simulation Mode and Real Lab Mode?",
    a: "Simulation Mode (Tier 1) provides an instant in-browser stateful shell, interactive topology inspector, and automated validators with zero wait time. Real Lab Mode (Tiers 2-4) provisions isolated Docker containers and Kubernetes namespaces for live containerized execution."
  },
  {
    q: "What are the two flagship practical environments?",
    a: "1. MOONSAV Smart Infrastructure Lab — our real IoT industrial product with virtual motors, water tanks, telemetry, and MQTT brokers. 2. MOONSAV Distributed Systems Lab — an enterprise e-commerce platform with Nginx gateway, Order/Inventory microservices, RabbitMQ message brokers, Celery workers, and PostgreSQL replication."
  },
  {
    q: "How are MOONSAV certifications verified?",
    a: "Certifications strictly require passing hands-on lab milestones, solving unknown root cause production incidents under active SLO pressure, and submitting audited blameless postmortems."
  }
];

