// MOONSAV ITOps Academy — Phase 2 Simulation & Lab Orchestration Engine Data Layer
// Flagship Environments:
// 1. MOONSAV Smart Infrastructure Lab (IoT, Water Motor, Hardware Simulator, MQTT, Telemetry, Real-time Interlocks)
// 2. MOONSAV Distributed Systems Lab (Orders, Inventory, RabbitMQ, Redis, Postgres Replication, Celery Workers)

export const ITOPS_PROJECTS = {
  moonsav: {
    id: "moonsav",
    name: "MOONSAV Smart Infrastructure Lab",
    tagline: "IoT & Industrial Real-Time Control Platform",
    badge: "IoT / Edge / Industrial SRE",
    color: "cyan",
    accent: "from-cyan-500 to-blue-600",
    border: "border-cyan-500/30",
    bg: "bg-cyan-950/20",
    description: "Industrial IoT platform with virtual smart motors, overhead/underground water tanks, ultrasonic level sensors, MQTT broker listeners, TimescaleDB telemetry streams, and automatic dry-run safety cutoff interlocks.",
    architecture: [
      {
        id: "device_sim",
        name: "Device Simulator",
        tech: "Python 3.11 / Paho-MQTT",
        role: "Simulates pump RPM, water flow, motor temperature, dry-run conditions, and voltage sags",
        status: "RUNNING",
        metrics: { rpm: "2840", flowLPM: "12.4", tempC: "48.2", currentA: "8.4" },
        logs: [
          "[INFO] 10:14:02.104 Telemetry tick: Tank=72% Flow=12.4LPM Temp=48.2C",
          "[INFO] 10:14:03.105 MQTT publish topic='moonsav/PUMP-01/telemetry' bytes=142",
          "[DEBUG] 10:14:04.108 Voltage steady at 230.4V, power factor 0.92"
        ],
        config: { deviceId: "PUMP-01", sampleRateHz: 10, safetyCutoffTempC: 85, lowWaterCutoffPct: 10 },
        dependencies: ["mqtt_broker"]
      },
      {
        id: "mqtt_broker",
        name: "MQTT Broker (EMQX)",
        tech: "EMQX v5.4 / Erlang",
        role: "High-throughput M2M message broker handling telemetry streams and control payloads",
        status: "RUNNING",
        metrics: { connections: "2,400", msgsPerSec: "4,820", p99LatencyMs: "4.2", cpuPct: "18.4%" },
        logs: [
          "[INFO] Client PUMP-01 connected from 192.168.1.105:48201",
          "[INFO] Subscribed topic 'moonsav/+/commands' QoS=1",
          "[DEBUG] TLS 1.3 handshake verified with client cert"
        ],
        config: { listener: "0.0.0.0:1883", tlsListener: "0.0.0.0:8883", maxConnections: 50000, keepaliveSec: 60 },
        dependencies: []
      },
      {
        id: "telemetry_svc",
        name: "Telemetry Ingestion Svc",
        tech: "Go 1.22 / Gin",
        role: "Subscribes to sensor topics, validates payloads, and buffers into Redis streams and TimescaleDB",
        status: "RUNNING",
        metrics: { throughputRPS: "4,800", bufferDepth: "12", parseLatencyMs: "0.8", memMB: "42" },
        logs: [
          "[INFO] Ingestion worker pool initialized with 16 goroutines",
          "[INFO] Processing stream buffer: 4800 msgs/s with 0 drop rate",
          "[DEBUG] TimescaleDB hypertable batch write completed in 4.1ms"
        ],
        config: { batchSize: 500, flushIntervalMs: 50, redisStream: "stream:moonsav:telemetry" },
        dependencies: ["mqtt_broker", "redis_cache", "postgres_db"]
      },
      {
        id: "motor_svc",
        name: "Motor Control Service",
        tech: "Node.js 20 / Express",
        role: "Implements automation rules, dry-run emergency cutoffs, scheduled fills, and REST API",
        status: "RUNNING",
        metrics: { activeSchedules: "14", safetyTripsTotal: "0", apiP95Ms: "18.2", errRatePct: "0.00%" },
        logs: [
          "[INFO] Scheduled fill check: Overhead tank at 72% (Threshold: 20%)",
          "[INFO] Safety interlock online: Dry-run watchdog active (0.5s check interval)",
          "[DEBUG] Command dispatch: Motor state HOLD_OFF"
        ],
        config: { safetyCheckIntervalMs: 500, emergencyCutoffSec: 3, maxRunMinutes: 120 },
        dependencies: ["postgres_db", "redis_cache", "mqtt_broker"]
      },
      {
        id: "postgres_db",
        name: "PostgreSQL + TimescaleDB",
        tech: "PostgreSQL 16 / TimescaleDB",
        role: "Time-series sensor telemetry hypertables, device metadata, and audit logs",
        status: "RUNNING",
        metrics: { activeConns: "24/200", diskUsedGB: "42.8", cacheHitRatio: "99.4%", queryLatencyMs: "2.1" },
        logs: [
          "[LOG] database system was not properly shut down; automatic recovery in progress",
          "[LOG] redo starts at 0/1A24B80",
          "[LOG] database system is ready to accept connections"
        ],
        config: { maxConnections: 200, sharedBuffers: "2GB", chunkInterval: "1 day", compression: "allkeys-lru" },
        dependencies: []
      },
      {
        id: "redis_cache",
        name: "Redis State Cache",
        tech: "Redis 7.2 Alpine",
        role: "Real-time 1-second device heartbeat state cache and instantaneous alert pub/sub",
        status: "RUNNING",
        metrics: { usedMemMB: "148", totalKeys: "24,800", hitRatio: "99.8%", connectedClients: "18" },
        logs: [
          "[INFO] 18 clients connected (14 background workers, 4 API replicas)",
          "[INFO] DB 0: 24,800 keys (2,400 active device state hashes)",
          "[DEBUG] Heartbeat eviction sweep completed: 0 expired keys"
        ],
        config: { maxmemory: "1GB", maxmemoryPolicy: "allkeys-lru", save: "900 1" },
        dependencies: []
      }
    ],
    faultTypes: [
      "dry-run", "overload-current", "sensor-drift", "network-drop", "mqtt-auth-reject",
      "high-temperature", "tank-overflow", "packet-storm", "stale-telemetry", "voltage-sag"
    ]
  },
  daig_distributed: {
    id: "daig_distributed",
    name: "MOONSAV Distributed Systems Lab",
    tagline: "High-Volume Microservices Order & Processing Engine",
    badge: "Distributed Systems / Microservices SRE",
    color: "amber",
    accent: "from-amber-500 to-orange-600",
    border: "border-amber-500/30",
    bg: "bg-amber-950/20",
    description: "Enterprise microservices transaction platform adapted from real-world DevOps internship methodologies. Features Nginx gateway, Order/Inventory/Notification microservices, RabbitMQ message broker, Celery workers, Postgres replication, and Redis cache.",
    architecture: [
      {
        id: "api_gateway",
        name: "Nginx API Gateway",
        tech: "Nginx 1.26 / Lua",
        role: "Central reverse proxy, JWT auth verification, header sanitization, rate limiting, and SSL",
        status: "RUNNING",
        metrics: { reqsPerSec: "1,240", p95LatencyMs: "12.4", activeConns: "340", http5xxRate: "0.01%" },
        logs: [
          "[INFO] SSL handshake TLS 1.3 negotiated with client",
          "[INFO] Upstream keepalive connection pool healthy (32 idle sockets)",
          "[DEBUG] Rate limit zone 'daig_limit' capacity: 84% free"
        ],
        config: { workerProcesses: "auto", rateLimitRPS: 50, burst: 100, sslProtocols: "TLSv1.3" },
        dependencies: ["order_svc", "inventory_svc"]
      },
      {
        id: "order_svc",
        name: "Order Processing Service",
        tech: "Node.js 20 / TypeScript",
        role: "Handles order creation, distributed saga transactions, and transactional outbox events",
        status: "RUNNING",
        metrics: { ordersPerMin: "840", sagaSuccessRate: "99.8%", memUsageMB: "184", cpuPct: "14.2%" },
        logs: [
          "[INFO] Created order ORD-8921 (Status: PENDING_RESERVATION)",
          "[INFO] Dispatched RabbitMQ event 'order.created' to exchange 'orders.direct'",
          "[DEBUG] Transaction committed to PostgreSQL in 8.4ms"
        ],
        config: { port: 3000, databasePoolMin: 5, databasePoolMax: 20, sagaTimeoutSec: 10 },
        dependencies: ["postgres_primary", "message_broker", "redis_cluster"]
      },
      {
        id: "inventory_svc",
        name: "Inventory Service",
        tech: "Python 3.11 / FastAPI",
        role: "Real-time stock reservation, warehouse allocations, and lock contention handling",
        status: "RUNNING",
        metrics: { reserveLatencyMs: "4.8", lockContentionMs: "0.2", activeLocks: "8", hitRatio: "98.2%" },
        logs: [
          "[INFO] Acquired Redis distributed lock for SKU-WATER-PUMP-01",
          "[INFO] Reserved quantity: 2 (Stock remaining: 418)",
          "[DEBUG] Published 'inventory.reserved' event for order ORD-8921"
        ],
        config: { lockTimeoutMs: 5000, maxRetries: 3, redisLockPrefix: "lock:inventory" },
        dependencies: ["postgres_primary", "redis_cluster", "message_broker"]
      },
      {
        id: "message_broker",
        name: "RabbitMQ Message Broker",
        tech: "RabbitMQ 3.13 / Erlang",
        role: "AMQP event bus with Dead-Letter Exchanges (DLX), durable queues, and worker dispatch",
        status: "RUNNING",
        metrics: { queueDepth: "14", publishRateRPS: "450", consumeRateRPS: "448", unackedMsgs: "2" },
        logs: [
          "[INFO] Connection accepted from celery-worker-pool-01",
          "[INFO] Queue 'orders.checkout' depth: 14 messages, 8 active consumers",
          "[DEBUG] Dead-letter exchange 'orders.dlx' configured with x-max-retries=3"
        ],
        config: { port: 5672, managementPort: 15672, maxQueueLength: 50000, memoryHighWatermark: "0.6" },
        dependencies: []
      },
      {
        id: "async_workers",
        name: "Celery Background Workers",
        tech: "Python 3.11 / Celery 5.4",
        role: "Async invoice generation, fraud scoring, and customer email/SMS notifications",
        status: "RUNNING",
        metrics: { activeWorkers: "8", tasksCompleted: "48,210", avgTaskDurationMs: "142", oomRestarts: "0" },
        logs: [
          "[INFO] Task generate_invoice_pdf[4f8e1a] succeeded in 124ms",
          "[INFO] Task send_order_confirmation[9a2b4c] dispatched via SMTP",
          "[DEBUG] Worker concurrency: 4 threads/process, max-tasks-per-child=50"
        ],
        config: { concurrency: 4, maxTasksPerChild: 50, taskTimeLimitSec: 300 },
        dependencies: ["message_broker", "redis_cluster"]
      },
      {
        id: "postgres_primary",
        name: "PostgreSQL Primary + Replica",
        tech: "PostgreSQL 16",
        role: "ACID relational storage with PgBouncer connection pooling and streaming replication",
        status: "RUNNING",
        metrics: { pgbouncerPool: "48/100", replicationLagMs: "1.2", tps: "340", bufferHitRatio: "99.8%" },
        logs: [
          "[LOG] PgBouncer pooler listening on port 6432 (pool_mode=transaction)",
          "[LOG] streaming replication established to replica 10.0.4.15",
          "[DEBUG] autovacuum: vacuumed table 'daig_orders' in 18ms"
        ],
        config: { port: 5432, pgbouncerPort: 6432, maxConnections: 200, poolMode: "transaction" },
        dependencies: []
      }
    ],
    faultTypes: [
      "database-deadlock", "redis-eviction-storm", "queue-backlog", "worker-oom-kill",
      "api-timeout-cascade", "slow-query-lock", "message-loss", "network-partition", "split-brain"
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOL DECISION & ENGINEERING JUDGMENT CHALLENGES
// ─────────────────────────────────────────────────────────────────────────────

export const TOOL_DECISION_CHALLENGES = [
  {
    id: "td-001",
    scenario: "MOONSAV API Gateway is throwing HTTP 504 Gateway Timeout on 40% of mobile pump command requests. Which tool should you open FIRST to begin your investigation?",
    options: [
      { tool: "Grafana / Metrics Dashboard", correct: true, rationale: "Correct! Metrics immediately show if the bottleneck is upstream latency in the Motor Service, database lock contention, or MQTT broker congestion, without reading millions of log lines blind." },
      { tool: "Terraform CLI", correct: false, rationale: "Terraform is for provisioning infrastructure, not real-time runtime incident triage." },
      { tool: "Git Repository Log", correct: false, rationale: "Git log shows code changes, but won't tell you where the runtime saturation is happening right now." },
      { tool: "Ansible Playbook", correct: false, rationale: "Ansible is for configuration execution, not diagnostic observability." }
    ]
  },
  {
    id: "td-002",
    scenario: "A Linux host running MOONSAV Telemetry is pinned at 100% CPU. Which command should you execute to identify the exact PID and thread consuming CPU cycles?",
    options: [
      { tool: "ps aux --sort=-%cpu | head -5", correct: true, rationale: "Correct! `ps aux` sorted by `%cpu` instantly displays the top CPU-consuming PIDs, commands, and start times." },
      { tool: "df -h", correct: false, rationale: "`df -h` checks disk volume space, not CPU process utilization." },
      { tool: "netstat -tulpn", correct: false, rationale: "`netstat` shows listening network sockets, not CPU consumption." },
      { tool: "uname -a", correct: false, rationale: "`uname -a` displays kernel version info, not active process statistics." }
    ]
  },
  {
    id: "td-003",
    scenario: "In the Distributed Systems Lab, customer checkout latency spiked from 25ms to 1,200ms across multiple microservices. Which tool isolates WHERE the time was spent across service boundaries?",
    options: [
      { tool: "OpenTelemetry & Jaeger Distributed Traces", correct: true, rationale: "Correct! Distributed tracing shows the exact waterfall timeline across Gateway -> Order Svc -> Inventory Svc -> Database spans." },
      { tool: "Docker ps", correct: false, rationale: "`docker ps` only tells you if containers are running, not where latency occurs inside the call chain." },
      { tool: "RabbitMQ CLI", correct: false, rationale: "RabbitMQ CLI only shows queue depth, not HTTP span breakdown." },
      { tool: "Trivy Scanner", correct: false, rationale: "Trivy scans images for CVE vulnerabilities, not runtime request latency." }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE-BASED SKILL MATRIX DEFINITIONS (With Verifiable Checklists)
// ─────────────────────────────────────────────────────────────────────────────

export const SKILL_MATRIX_DEFINITIONS = [
  {
    id: "linux",
    name: "Linux & System Administration",
    category: "Foundation",
    track: "foundation",
    icon: "🐧",
    evidenceChecklists: {
      1: ["Navigate filesystem with `cd`, `ls -la`, and inspect file types.", "View system logs with `tail` and `cat`."],
      2: ["Manage file permissions with `chmod 755` and ownership with `chown`.", "Manage users and groups with `useradd` and `usermod`."],
      3: ["Control systemd services (`systemctl start/stop/status/restart`).", "Inspect processes with `ps aux`, `top`, and send signals with `kill`."],
      4: ["Diagnose zombie processes and unhandled parent process reaping.", "Implement Linux Cgroups v2 resource limits (`MemoryMax`, `CPUQuota`)."],
      5: ["Tune Linux kernel sysctl parameters (`net.core.somaxconn`, `vm.swappiness`).", "Automate complete multi-node OS hardening and audit compliance."]
    }
  },
  {
    id: "networking",
    name: "Networking & DNS / TLS",
    category: "Foundation",
    track: "foundation",
    icon: "🌐",
    evidenceChecklists: {
      1: ["Inspect IP addresses and interface states using `ip addr` and `ip route`.", "Test basic TCP connectivity with `ping` and `nc -zvw`."],
      2: ["Inspect active listening sockets and port bindings with `ss -tulpn`.", "Diagnose DNS lookups using `dig +trace` and `nslookup`."],
      3: ["Configure `/etc/resolv.conf` timeout and single-request-reopen options.", "Debug HTTP handshake and TLS certificate chains with `openssl s_client`."],
      4: ["Capture and inspect live network packet traces using `tcpdump -i eth0`.", "Configure Linux netfilter/iptables firewall rules and NAT routing."],
      5: ["Implement BGP routing, Calico CNI IPAM, and zero-trust microsegmentation."]
    }
  },
  {
    id: "docker",
    name: "Docker Containerization",
    category: "DevOps",
    track: "devops",
    icon: "🐳",
    evidenceChecklists: {
      1: ["Pull, run, inspect, and stop containers using the Docker CLI.", "View container logs with `docker logs -f`."],
      2: ["Write a functional Dockerfile with `FROM`, `RUN`, `COPY`, and `CMD`.", "Mount bind volumes and configure bridge container networks."],
      3: ["Implement multi-stage Docker builds separating compiler from runtime.", "Configure Docker container healthchecks and restart policies."],
      4: ["Build minimal distroless/rootless container images (UID 10001).", "Optimize image layer caching with BuildKit cache mounts and squash CVEs."],
      5: ["Configure containerd runtime engines, cgroup namespaces, and gVisor sandboxing."]
    }
  },
  {
    id: "kubernetes",
    name: "Kubernetes Orchestration",
    category: "DevOps",
    track: "devops",
    icon: "☸️",
    evidenceChecklists: {
      1: ["Inspect Pods, Nodes, and Namespaces using `kubectl get` and `kubectl describe`.", "View container logs inside Pods with `kubectl logs`."],
      2: ["Deploy stateless applications with Deployments, ReplicaSets, and ClusterIP Services.", "Configure ConfigMaps and Secrets inside Pod environment variables."],
      3: ["Configure Readiness, Liveness, and Startup HTTP probes with initial delays.", "Perform zero-downtime rolling updates with `maxUnavailable: 0`."],
      4: ["Configure PersistentVolumeClaims, StorageClasses, and StatefulSets.", "Implement PodDisruptionBudgets and Horizontal Pod Autoscaling (HPA)."],
      5: ["Architect multi-tenant Kubernetes clusters with RBAC, NetworkPolicies, and Admission Webhooks."]
    }
  },
  {
    id: "prometheus",
    name: "Prometheus Metrics & Observability",
    category: "SRE",
    track: "sre",
    icon: "📊",
    evidenceChecklists: {
      1: ["Understand difference between Metrics, Logs, and Distributed Traces.", "View Prometheus targets page and verify scrape job health."],
      2: ["Write basic PromQL instant queries for counters and gauges.", "Configure Prometheus scrape configurations in `prometheus.yaml`."],
      3: ["Instrument application code with Prometheus Counter, Gauge, and Histogram metrics.", "Write PromQL rate calculations and compute P95/P99 latency percentiles."],
      4: ["Build production Grafana SLO dashboards tracking 30-day Error Budget burn rates.", "Configure Alertmanager routing, grouping, and multi-window alert rules."],
      5: ["Design high-cardinality Thanos / Cortex global metric storage and downsampling architectures."]
    }
  },
  {
    id: "chaos_incident",
    name: "Chaos Engineering & Incident Triage",
    category: "SRE",
    track: "sre",
    icon: "🚨",
    evidenceChecklists: {
      1: ["Understand incident severity levels (SEV-1 to SEV-3) and SLO impact.", "Acknowledge active alerts and participate in incident command channels."],
      2: ["Collect diagnostic evidence (logs, metrics, traces) during an ongoing outage.", "Identify immediate blast radius and engage rollback/mitigation runbooks."],
      3: ["Isolate unknown root causes in distributed systems without preconceived bias.", "Formulate Steady State Hypotheses for Chaos Engineering experiments."],
      4: ["Inject controlled packet loss, jitter, and service crashes using `tc netem` and Chaos Mesh.", "Author comprehensive, blameless postmortems with concrete actionable preventions."],
      5: ["Lead high-stakes enterprise Disaster Recovery (DR) simulations and architect self-healing systems."]
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// RIGOROUS INDUSTRY CERTIFICATION PATHS (Real Incident & Lab Gates)
// ─────────────────────────────────────────────────────────────────────────────

export const CERTIFICATION_PATHS = [
  {
    id: "cert-itops-foundation",
    title: "MOONSAV ITOps Foundation Certified",
    code: "MITOPS-FND",
    level: "Foundation",
    minScore: 80,
    requiredLabsCount: 15,
    requiredIncidentsCount: 3,
    requiredSkills: ["linux", "networking"],
    badgeColor: "from-blue-500 to-cyan-500",
    description: "Validates deep understanding of Linux internals, process trees, TCP/IP socket diagnostics, DNS troubleshooting, and Bash automation."
  },
  {
    id: "cert-devops-engineer",
    title: "MOONSAV Certified DevOps Engineer",
    code: "MITOPS-DEVOPS",
    level: "Intermediate",
    minScore: 85,
    requiredLabsCount: 25,
    requiredIncidentsCount: 5,
    requiredSkills: ["docker", "kubernetes"],
    badgeColor: "from-emerald-500 to-teal-600",
    description: "Validates ability to build automated CI/CD pipelines, containerize microservices, orchestrate Docker Compose stacks, and manage zero-downtime Kubernetes rollouts."
  },
  {
    id: "cert-devsecops-engineer",
    title: "MOONSAV Certified DevSecOps Engineer",
    code: "MITOPS-DEVSECOPS",
    level: "Advanced",
    minScore: 85,
    requiredLabsCount: 20,
    requiredIncidentsCount: 4,
    requiredSkills: ["docker", "kubernetes"],
    badgeColor: "from-rose-500 to-purple-600",
    description: "Demonstrates mastery in shifting security left: SAST/SCA security gates, container image vulnerability scanning, HashiCorp Vault dynamic secrets, and Kubernetes NetworkPolicies."
  },
  {
    id: "cert-k8s-engineer",
    title: "MOONSAV Certified Kubernetes Engineer",
    code: "MITOPS-K8S",
    level: "Advanced",
    minScore: 90,
    requiredLabsCount: 20,
    requiredIncidentsCount: 5,
    requiredSkills: ["kubernetes", "docker"],
    badgeColor: "from-indigo-500 to-blue-700",
    description: "Certifies practical competence in deploying, autoscaling, networking, troubleshooting, and securing container workloads in production Kubernetes clusters."
  },
  {
    id: "cert-sre-engineer",
    title: "MOONSAV Certified SRE & Chaos Engineer",
    code: "MITOPS-SRE",
    level: "Expert",
    minScore: 90,
    requiredLabsCount: 20,
    requiredIncidentsCount: 8,
    requiredSkills: ["prometheus", "chaos_incident"],
    badgeColor: "from-amber-500 to-red-600",
    description: "Validates expertise in Full-Stack Observability (Metrics, Logs, Traces), SLO/SLI definition, live production incident triage, chaos fault injection, and blameless postmortems."
  },
  {
    id: "cert-platform-master",
    title: "MOONSAV Master Platform Architect",
    code: "MITOPS-PLATFORM",
    level: "Mastery",
    minScore: 95,
    requiredLabsCount: 50,
    requiredIncidentsCount: 15,
    requiredSkills: ["linux", "docker", "kubernetes", "prometheus", "chaos_incident"],
    badgeColor: "from-yellow-400 via-amber-500 to-purple-700",
    description: "The premier certification covering complete end-to-end operational mastery across IoT hardware architectures, high-scale distributed microservices, and enterprise automation."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// STATEFUL IN-BROWSER SIMULATION COMMAND DISPATCHER ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function runSimulationCommand(rawCmd, labId = "", projectId = "moonsav") {
  const trimmed = (rawCmd || "").trim();
  const lower = trimmed.toLowerCase();

  // Basic command dispatcher with realistic outputs
  if (lower === "clear") {
    return { output: "", clear: true, exitCode: 0 };
  }

  if (lower === "pwd") {
    return { output: "/home/moonsav/workspace", exitCode: 0 };
  }

  if (lower === "whoami") {
    return { output: "moonsav-engineer (uid=10001 gid=10001)", exitCode: 0 };
  }

  if (lower === "uptime") {
    return { output: " 10:14:02 up 14 days,  2:41,  1 user,  load average: 0.42, 0.58, 0.61", exitCode: 0 };
  }

  if (lower === "docker ps" || lower.startsWith("docker ps")) {
    if (projectId === "moonsav") {
      return {
        output: "CONTAINER ID   IMAGE                          STATUS                   PORTS                    NAMES\n8f2a1b9c3d4e   moonsav/device-simulator:v1    Up 42 minutes            0.0.0.0:48201->48201/tcp moonsav-device-sim\n3d8f1a2c9e0b   emqx/emqx:5.4-alpine           Up 42 minutes (healthy)  0.0.0.0:1883->1883/tcp   moonsav-mqtt-broker\n4e9c2a1b8f3d   moonsav/telemetry-svc:v2       Up 42 minutes (healthy)  0.0.0.0:8080->8080/tcp   moonsav-telemetry\n7c1a9e2d3b4f   postgres:16-timescale          Up 42 minutes (healthy)  0.0.0.0:5432->5432/tcp   moonsav-postgres\n1a2b3c4d5e6f   redis:7.2-alpine               Up 42 minutes (healthy)  0.0.0.0:6379->6379/tcp   moonsav-redis",
        exitCode: 0
      };
    } else {
      return {
        output: "CONTAINER ID   IMAGE                          STATUS                   PORTS                    NAMES\na7c9e21f8b3d   nginx:1.26-alpine              Up 35 minutes            0.0.0.0:80->80/tcp       daig-api-gateway\nb1c4d8a9f2e3   daig/order-service:v2.1        Up 35 minutes (healthy)  0.0.0.0:3000->3000/tcp   daig-orders\nc3f8e1a4d2b9   rabbitmq:3.13-management       Up 35 minutes (healthy)  0.0.0.0:5672, 15672/tcp  daig-rabbitmq\nd4e9a1b2c3d4   daig/celery-worker:v2          Up 35 minutes (healthy)                           daig-worker-01\ne5f6a7b8c9d0   postgres:16-alpine             Up 35 minutes (healthy)  0.0.0.0:5432->5432/tcp   daig-postgres",
        exitCode: 0
      };
    }
  }

  if (lower.startsWith("kubectl get pods")) {
    return {
      output: "NAME                                READY   STATUS    RESTARTS   AGE\nmoonsav-telemetry-7d9f8c6b4d-2xk9p  1/1     Running   0          4d2h\nmoonsav-telemetry-7d9f8c6b4d-9mzq2  1/1     Running   0          4d2h\nmoonsav-motor-5f8b9d6c7e-jv7lh      1/1     Running   0          4d2h\nmoonsav-mqtt-0                      1/1     Running   0          14d\nmoonsav-postgres-0                  1/1     Running   0          14d",
      exitCode: 0
    };
  }

  if (lower.startsWith("kubectl get nodes")) {
    return {
      output: "NAME             STATUS   ROLES           AGE   VERSION\nmoonsav-node-01  Ready    control-plane   28d   v1.29.2\nmoonsav-node-02  Ready    worker          28d   v1.29.2\nmoonsav-node-03  Ready    worker          28d   v1.29.2",
      exitCode: 0
    };
  }

  if (lower.startsWith("moonsav device status")) {
    return {
      output: "========================================\nMOONSAV SMART WATER CONTROLLER (PUMP-01)\n========================================\nSTATE:            PUMP_ONLINE_NORMAL\nRPM:              2,840\nWATER FLOW:       12.4 Liters/Minute\nTANK LEVEL:       72.4% (Overhead)\nTEMPERATURE:      48.2 °C (Safe < 70°C)\nCURRENT DRAW:     8.4 A (Nominal)\nMQTT HEARTBEAT:   CONNECTED (0.8s ago)\nDRY-RUN CUTOFF:   ARMED & ACTIVE\n========================================",
      exitCode: 0
    };
  }

  if (lower.startsWith("moonsav device simulate")) {
    return {
      output: "[SIMULATOR] Injecting synthetic sensor parameters...\n[SIMULATOR] Published updated telemetry to MQTT topic 'moonsav/PUMP-01/telemetry'\n[SIMULATOR] Status: Packet accepted by EMQX broker (QoS 1).",
      exitCode: 0
    };
  }

  if (lower.startsWith("systemctl status")) {
    const svc = lower.split(" ")[2] || "moonsav-telemetry";
    return {
      output: `● ${svc}.service - MOONSAV Platform Component\n     Loaded: loaded (/etc/systemd/system/${svc}.service; enabled; vendor preset: enabled)\n     Active: active (running) since Mon 2026-08-14 08:14:02 UTC; 2h ago\n   Main PID: 1420 (${svc})\n      Tasks: 8 (limit: 4665)\n     Memory: 42.8M (limit: 256.0M)\n        CPU: 1.42s`,
      exitCode: 0
    };
  }

  if (lower.startsWith("curl") && lower.includes("health")) {
    return {
      output: '{"status":"UP","healthy":true,"database":"CONNECTED","redis":"CONNECTED","mqtt":"CONNECTED","uptimeSeconds":14205}',
      exitCode: 0
    };
  }

  if (lower.startsWith("curl") && lower.includes("metrics")) {
    return {
      output: "# HELP moonsav_motor_commands_total Total number of pump motor commands processed\n# TYPE moonsav_motor_commands_total counter\nmoonsav_motor_commands_total{action=\"start\",status=\"success\"} 48210\nmoonsav_motor_commands_total{action=\"stop\",status=\"success\"} 48190\nmoonsav_motor_commands_total{action=\"start\",status=\"failure\"} 12",
      exitCode: 0
    };
  }

  if (lower === "ls" || lower === "ls -la") {
    return {
      output: "total 48\ndrwxr-xr-x 6 moonsav moonsav 4096 Aug 14 10:12 .\ndrwxr-xr-x 3 root    root    4096 Aug 14 08:00 ..\n-rw-r--r-- 1 moonsav moonsav  842 Aug 14 09:12 Dockerfile\n-rw-r--r-- 1 moonsav moonsav 1420 Aug 14 09:15 docker-compose.yaml\n-rw-r--r-- 1 moonsav moonsav 2840 Aug 14 09:30 main.go\n-rw-r--r-- 1 moonsav moonsav  312 Aug 14 09:00 Makefile\ndrwxr-xr-x 2 moonsav moonsav 4096 Aug 14 09:20 config\ndrwxr-xr-x 4 moonsav moonsav 4096 Aug 14 09:40 k8s",
      exitCode: 0
    };
  }

  if (lower.startsWith("git status")) {
    return {
      output: "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\tmodified:   config/safety.json\n\nno changes added to commit (use \"git add\")",
      exitCode: 0
    };
  }

  if (lower.startsWith("terraform plan")) {
    return {
      output: "Acquiring state lock. This may take a few moments...\nTerraform used the selected providers to generate the following execution plan:\n\nNo changes. Your infrastructure matches the configuration.\n\nTerraform has compared your real infrastructure against your configuration and found no differences.",
      exitCode: 0
    };
  }

  // Fallback default message
  return {
    output: `bash: ${trimmed}: command executed successfully (exit code 0)`,
    exitCode: 0
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE ENGINE & PERSISTENCE
// ─────────────────────────────────────────────────────────────────────────────

const ITOPS_STORAGE_KEY = "moonsav_itops_academy_progress_v2";

export function getITOpsStoredState() {
  try {
    const raw = localStorage.getItem(ITOPS_STORAGE_KEY);
    if (!raw) return getDefaultITOpsState();
    return JSON.parse(raw);
  } catch {
    return getDefaultITOpsState();
  }
}

export function saveITOpsStoredState(state) {
  try {
    localStorage.setItem(ITOPS_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save ITOps state to localStorage:", err);
  }
}

function getDefaultITOpsState() {
  return {
    enrolled: true,
    activeProjectId: "moonsav",
    activeTrackId: "foundation",
    activeLabId: "lab-fnd-001",
    activeIncidentId: null,
    labEnvironmentStatus: "IDLE", // IDLE, STARTING, RUNNING, FAILED, COMPLETED
    currentEnvId: "LAB-1042-023",
    completedLabIds: ["lab-fnd-001"],
    acknowledgedIncidentIds: [],
    resolvedIncidentIds: [],
    xp: 450,
    streakDays: 4,
    skills: {
      linux: 4,
      networking: 3,
      docker: 3,
      kubernetes: 2,
      prometheus: 3,
      chaos_incident: 2
    },
    scores: {
      detection: 85,
      investigation: 90,
      rootCause: 80,
      fix: 85,
      automation: 75,
      verification: 95,
      documentation: 80
    },
    certificates: ["cert-itops-foundation"],
    labEvidence: {},
    postmortems: {}
  };
}

export function localCompleteITOpsLab(labId, evidence = "") {
  const state = getITOpsStoredState();
  if (!state.completedLabIds.includes(labId)) {
    state.completedLabIds.push(labId);
    state.xp += 150;
  }
  if (evidence) {
    state.labEvidence[labId] = evidence;
  }
  state.labEnvironmentStatus = "COMPLETED";
  saveITOpsStoredState(state);
  return state;
}

export function localAcknowledgeIncident(incidentId) {
  const state = getITOpsStoredState();
  if (!state.acknowledgedIncidentIds.includes(incidentId)) {
    state.acknowledgedIncidentIds.push(incidentId);
    state.xp += 50;
  }
  saveITOpsStoredState(state);
  return state;
}

export function localResolveIncident(incidentId, postmortemText = "") {
  const state = getITOpsStoredState();
  if (!state.resolvedIncidentIds.includes(incidentId)) {
    state.resolvedIncidentIds.push(incidentId);
    state.xp += 250;
  }
  if (postmortemText) {
    state.postmortems[incidentId] = postmortemText;
  }
  saveITOpsStoredState(state);
  return state;
}

export const ITOPS_LABS = [
  // ── TRACK 1: ITOPS FOUNDATION (25 Labs) ──────────────────────────────────
  {
    id: "lab-fnd-001",
    track: "foundation",
    project: "moonsav",
    title: "Linux Process Triage & Zombie Hunt",
    slug: "linux-process-triage",
    difficulty: "Beginner",
    estimatedMinutes: 25,
    skills: ["linux"],
    objective: "Diagnose an unresponsive system telemetry agent causing high load by analyzing process trees, identifying defunct/zombie processes, and reclaiming system file handles.",
    environment: "Ubuntu 22.04 LTS / Systemd / Procfs",
    tools: ["ps", "top", "htop", "kill", "pgrep", "lsof"],
    prerequisites: "Basic command-line terminal navigation",
    architectureRef: "Linux Kernel Procfs & Systemd Process Management",
    task: "Identify the PID of the misbehaving telemetry child process leaking descriptors, terminate it gracefully with SIGTERM, and configure systemd limit guards.",
    failureInjection: "A background loop spawns forks without reaping exit codes, consuming file descriptors in `/proc`.",
    guidedSteps: [
      "Execute `ps aux --sort=-%cpu | head -10` to inspect top CPU consumers.",
      "Check for zombie state processes: `ps -eo stat,ppid,pid,comm | grep -w 'Z'`.",
      "Inspect open file descriptors of the leaking PID: `lsof -p <PID> | wc -l`.",
      "Send graceful termination signal `kill -15 <PID>` and verify reaper cleanup with `watch -n 1 'ps aux | grep moonsav'`."
    ],
    challengeSummary: "Locate the parent daemon spawning orphaned subprocesses and patch its systemd unit file `KillMode=mixed` to prevent child leakages.",
    incidentSummary: "CRITICAL: Host telemetry collector process table saturated (98% PID exhaustion).",
    hints: [
      "Check the process status flags in `ps` output — `Z` indicates a defunct zombie process.",
      "A zombie cannot be killed directly because it is already dead; its parent process must be signaled or restarted to reap it.",
      "Use `pstree -p <parent_pid>` to trace which service spawned the rogue children.",
      "Check `/etc/systemd/system/moonsav-telemetry.service` for missing `TasksMax` and `KillMode` settings."
    ],
    verify: {
      command: "pgrep -f 'leak_proc' || echo 'CLEAN_VERIFIED'",
      pass: "CLEAN_VERIFIED"
    },
    sreLesson: "Orphaned processes and unhandled SIGCHLD signals cause kernel PID exhaustion, leading to mysterious fork failures for legitimate services.",
    interviewQuestion: "What is the exact difference between a Zombie process and an Orphan process in Linux, and why does `kill -9` fail on a zombie?"
  },
  {
    id: "lab-fnd-002",
    track: "foundation",
    project: "moonsav",
    title: "Linux Network Interface & Socket Diagnostics",
    slug: "linux-network-socket-diagnostics",
    difficulty: "Beginner",
    estimatedMinutes: 30,
    skills: ["networking", "linux"],
    objective: "Troubleshoot why the MOONSAV Smart Water Gateway fails to receive incoming sensor telemetry on port 1883.",
    environment: "Linux Networking Stack / Netfilter / Iproute2",
    tools: ["ss", "ip", "netstat", "tcpdump", "iptables", "nc"],
    prerequisites: "TCP/IP 3-way handshake concepts",
    architectureRef: "MOONSAV IoT Gateway & MQTT Socket Listener",
    task: "Verify interface binding (0.0.0.0 vs 127.0.0.1), detect port collisions, inspect socket buffer drops, and verify packet arrival with `tcpdump`.",
    failureInjection: "MQTT broker is bound strictly to `localhost` (127.0.0.1) instead of `0.0.0.0`, dropping all external sensor telemetry packets.",
    guidedSteps: [
      "Inspect active listening TCP sockets: `ss -tulpn | grep 1883`.",
      "Notice the local address column shows `127.0.0.1:1883` instead of `*:1883`.",
      "Check incoming packets on eth0: `sudo tcpdump -i eth0 port 1883 -nn -c 5`.",
      "Update `/etc/mosquitto/mosquitto.conf` with `listener 1883 0.0.0.0` and reload systemd."
    ],
    challengeSummary: "Analyze socket receive queues with `ss -t -i` and identify dropped packets caused by a saturated backlog buffer.",
    incidentSummary: "ALERT: Edge devices reporting connection refused on TCP 1883.",
    hints: [
      "Look closely at the IP address preceding port 1883 in `ss -tulpn`.",
      "If it says `127.0.0.1`, external network packets on `eth0` will be rejected by the TCP stack.",
      "Inspect the broker configuration file in `/etc/mosquitto/conf.d/`.",
      "Restart the service with `sudo systemctl restart mosquitto` and re-verify with `ss -tulpn`."
    ],
    verify: {
      command: "ss -tln | grep -q '0.0.0.0:1883' && echo 'SOCKET_LISTENING_ALL_INTERFACES'",
      pass: "SOCKET_LISTENING_ALL_INTERFACES"
    },
    sreLesson: "Localhost binding is a safe security default in development but the #1 cause of 'connection refused' errors in staging and edge deployments.",
    interviewQuestion: "Explain the difference between TCP listen backlog queue `SO_BACKLOG` and socket receive buffer `SO_RCVBUF` under high packet rates."
  },
  {
    id: "lab-fnd-003",
    track: "foundation",
    project: "daig_distributed",
    title: "DNS Resolution Cascade & Resolv.conf Tuning",
    slug: "dns-resolution-tuning",
    difficulty: "Intermediate",
    estimatedMinutes: 30,
    skills: ["networking", "linux"],
    objective: "Debug intermittent 5-second HTTP timeouts in the Distributed Systems Lab caused by improper DNS resolver fallback and IPv6 AAAA lookups.",
    environment: "CoreDNS / Systemd-Resolved / Linux Glibc Resolver",
    tools: ["dig", "nslookup", "strace", "curl", "tcpdump"],
    prerequisites: "DNS records (A, CNAME, AAAA) & `/etc/resolv.conf`",
    architectureRef: "Distributed Order Service DNS resolution chain",
    task: "Diagnose why API calls to `payment.internal.svc` pause for 5.002s before succeeding by inspecting sequential timeout behavior in `resolv.conf`.",
    failureInjection: "The primary nameserver in `/etc/resolv.conf` is unreachable, triggering default 5s retry delays on every new curl connection.",
    guidedSteps: [
      "Benchmark single request latency: `curl -w 'time_namelookup: %{time_namelookup}\\n' -o /dev/null -s http://payment.internal.svc/health`.",
      "Observe `time_namelookup` is > 5.0 seconds.",
      "Inspect resolver configuration: `cat /etc/resolv.conf`.",
      "Add `options timeout:1 attempts:2 single-request-reopen` and test resolution with `dig +trace payment.internal.svc`."
    ],
    challengeSummary: "Implement local DNS caching with `nscd` or `systemd-resolved` and eliminate duplicate DNS queries across high-throughput workers.",
    incidentSummary: "P1 INCIDENT: Order Checkout latency spiked by 5000ms across 100% of transactions.",
    hints: [
      "Measure where time is spent in the curl handshake using the `-w` timing flags.",
      "Check if `time_namelookup` dominates total request time.",
      "Verify connectivity to each IP listed under `nameserver` in `/etc/resolv.conf` using `nc -zvw 2 <IP> 53`.",
      "Configure `options timeout:1` and ensure healthy DNS resolvers are placed at the top of the list."
    ],
    verify: {
      command: "curl -w '%{time_namelookup}' -o /dev/null -s http://localhost:8080/health 2>/dev/null | awk '{if ($1 < 0.1) print \"DNS_FAST\"; else print \"DNS_SLOW\"}'",
      pass: "DNS_FAST"
    },
    sreLesson: "DNS is often the invisible bottleneck in microservice architectures. Without proper connection pooling or local caching, every HTTP call re-queries DNS.",
    interviewQuestion: "How does the `ndots:5` option in Kubernetes `/etc/resolv.conf` affect DNS query volume and response latency in distributed systems?"
  },
  {
    id: "lab-dev-001",
    track: "devops",
    project: "moonsav",
    title: "Multi-Stage Dockerfile Optimization & Rootless Containers",
    slug: "docker-multistage-rootless",
    difficulty: "Intermediate",
    estimatedMinutes: 35,
    skills: ["docker"],
    objective: "Refactor a bloated 1.4GB MOONSAV Telemetry container into an optimized 45MB rootless Alpine/Distroless container with immutable layers.",
    environment: "Docker Engine 26.0 / BuildKit",
    tools: ["docker", "docker buildx", "trivy", "dive"],
    prerequisites: "Dockerfile instructions (FROM, RUN, COPY, CMD)",
    architectureRef: "MOONSAV Telemetry Container Build Pipeline",
    task: "Implement a 2-stage build separating Go/Node compiler dependencies from the final minimal runtime, run as non-root user (UID 10001), and eliminate CVEs.",
    failureInjection: "The legacy Dockerfile copied the entire `.git` directory and npm cache, ran as root, and contained 4 high-severity CVEs in the base image.",
    guidedSteps: [
      "Build legacy image and check size: `docker build -t legacy-telemetry . && docker images legacy-telemetry`.",
      "Analyze layers with Dive: `docker history legacy-telemetry`.",
      "Create multi-stage Dockerfile with `FROM golang:1.22-alpine AS builder` and `FROM gcr.io/distroless/static-debian12:nonroot`.",
      "Scan new image with Trivy: `trivy image --severity HIGH,CRITICAL moonsav-telemetry:v2`."
    ],
    challengeSummary: "Configure Docker BuildKit cache mounts (`--mount=type=cache,target=/root/.cache/go-build`) to reduce build times from 3 minutes to under 8 seconds.",
    incidentSummary: "SECURITY AUDIT: Telemetry container flagged for running as root with 1.4GB unneeded attack surface.",
    hints: [
      "Never include build compilers or dev dependencies in your final container layer.",
      "Use `.dockerignore` to block `node_modules`, `.git`, `.env`, and test artifacts from being sent in build context.",
      "Add `USER 10001:10001` or use distroless nonroot base images.",
      "Set `CGO_ENABLED=0` when compiling Go binaries for scratch/distroless deployment."
    ],
    verify: {
      command: "docker run --rm moonsav-telemetry:v2 id -u | grep -q '10001' && echo 'ROOTLESS_PASS'",
      pass: "ROOTLESS_PASS"
    },
    sreLesson: "Smaller containers start faster in Kubernetes during auto-scaling events and drastically minimize vulnerabilities in production CVE scans.",
    interviewQuestion: "Why should you never use `latest` tags in production Docker images, and how do immutable image digests (`@sha256:...`) prevent supply-chain drift?"
  },
  {
    id: "lab-sre-001",
    track: "sre",
    project: "moonsav",
    title: "Prometheus Metric Instrumentation & Grafana SLO Dashboard",
    slug: "prometheus-instrumentation-grafana-slo",
    difficulty: "Intermediate",
    estimatedMinutes: 40,
    skills: ["prometheus"],
    objective: "Instrument the MOONSAV Smart Water Motor Controller with Prometheus client metrics, define a 99.9% Motor Command Success Rate SLO, and build an alerting dashboard.",
    environment: "Prometheus 2.51 / Grafana 10.4 / Node.js Prometheus Client",
    tools: ["prometheus", "grafana", "promtool", "curl", "k6"],
    prerequisites: "Prometheus metric types (Counter, Gauge, Histogram)",
    architectureRef: "MOONSAV Full-Stack Observability Pipeline",
    task: "Export `moonsav_motor_commands_total` (counter) and `moonsav_motor_command_duration_seconds` (histogram), configure Prometheus scrape job, and compute 30-day burn rate in PromQL.",
    failureInjection: "Motor driver latency silently degrades from 50ms to 2400ms without throwing 500 errors, escaping basic HTTP status monitoring.",
    guidedSteps: [
      "Add Prometheus exporter middleware to motor service exposing metrics on `:9090/metrics`.",
      "Verify metric output: `curl -s http://localhost:9090/metrics | grep moonsav_motor`.",
      "Write PromQL SLO query: `sum(rate(moonsav_motor_commands_total{status=\"success\"}[5m])) / sum(rate(moonsav_motor_commands_total[5m])) * 100`.",
      "Import Grafana dashboard JSON and configure alerting threshold if Error Budget burn rate > 14.4x over 1 hour."
    ],
    challengeSummary: "Implement Multi-Window Multi-Burn-Rate alerting in Prometheus Alertmanager according to Google SRE Workbook standards.",
    incidentSummary: "SLO BREACH: Motor command latency exceeded 1000ms threshold; 45% of customer tank top-offs timed out.",
    hints: [
      "Use Histograms for measuring latencies; never average averages in PromQL.",
      "Use `histogram_quantile(0.99, sum(rate(moonsav_motor_command_duration_seconds_bucket[5m])) by (le))` to calculate P99 latency.",
      "Check Prometheus Targets page (`http://localhost:9090/targets`) to ensure your scrape job status is `UP`.",
      "Validate your alerting rule syntax using `promtool check rules alerts.yaml`."
    ],
    verify: {
      command: "curl -s http://localhost:9090/metrics | grep -q 'moonsav_motor_commands_total' && echo 'METRICS_EXPORTED'",
      pass: "METRICS_EXPORTED"
    },
    sreLesson: "If you cannot measure it, you cannot operate it. Latency percentiles (P95/P99) reveal systemic degradation long before average metrics show a blip.",
    interviewQuestion: "Why is tracking P99 latency mathematically superior to tracking average (mean) latency in high-throughput distributed systems?"
  },
  {
    id: "lab-sre-003",
    track: "sre",
    project: "moonsav",
    title: "Chaos Engineering: Network Partition & Dry-Run Motor Cutoff",
    slug: "chaos-network-partition-dryrun",
    difficulty: "Advanced",
    estimatedMinutes: 45,
    skills: ["chaos_incident"],
    objective: "Execute a chaos experiment injecting 40% packet loss and 500ms jitter between the IoT Device Simulator and the MOONSAV Controller to test emergency dry-run protection.",
    environment: "Pumba / Chaos Mesh / Linux TC Netem",
    tools: ["tc", "pumba", "chaos-mesh", "ping", "mqtt-cli"],
    prerequisites: "Chaos principles, steady-state hypothesis, blast radius",
    architectureRef: "MOONSAV Chaos Injection & Safety Interlock Architecture",
    task: "Formulate a Steady State Hypothesis, inject network corruption using `tc qdisc add dev eth0 root netem delay 500ms 100ms loss 40%`, and verify the motor automatically shuts down within 3 seconds of telemetry loss.",
    failureInjection: "The water level drops below critical threshold (10%), but high network latency delays sensor packets, causing the pump to run dry and overheat.",
    guidedSteps: [
      "Define steady state hypothesis: 'Motor commands never exceed 3s without active telemetry heartbeat.'",
      "Inject packet corruption: `sudo tc qdisc add dev eth0 root netem delay 500ms 100ms loss 30%`.",
      "Simulate low-water event via device CLI: `moonsav device simulate --tank-level 5%`.",
      "Verify safety cutoff triggered: `moonsav device status --device-id PUMP-01` confirms `STATE: EMERGENCY_DRY_RUN_SHUTDOWN`."
    ],
    challengeSummary: "Automate this chaos test as a pre-deployment gate in CI/CD pipeline using Chaos Mesh workflows.",
    incidentSummary: "CRITICAL FAILURE: Physical pump motor burned out due to delayed dry-run sensor alert during network congestion.",
    hints: [
      "Check active traffic control rules using `tc qdisc show dev eth0`.",
      "Remove chaos injection when finished: `sudo tc qdisc del dev eth0 root`.",
      "Observe device logs: the local edge safety watchdog must not rely on cloud acknowledgement to trigger emergency cutoff.",
      "Review edge firmware fail-safe timeouts in `config/safety.json`."
    ],
    verify: {
      command: "moonsav device status --id PUMP-01 2>/dev/null | grep -q 'EMERGENCY_SHUTDOWN' && echo 'FAILSAFE_TRIGGERED'",
      pass: "FAILSAFE_TRIGGERED"
    },
    sreLesson: "Do not wait for outages in production to discover how your system fails. Inject controlled failure in staging to prove your resilience mechanisms actually work.",
    interviewQuestion: "How do you define a 'Steady State Hypothesis' in Chaos Engineering, and what automated abort criteria should halt an active experiment?"
  }
];

export const ITOPS_INCIDENTS = [
  {
    id: "inc-moon-001",
    level: "Level 1 (Beginner)",
    project: "moonsav",
    title: "Level 1: MQTT Message Broker Daemon Down",
    severity: "SEV-1",
    status: "active",
    startedAt: "8 minutes ago",
    affectedService: "moonsav-mqtt-broker (Port 1883)",
    symptoms: "Motor command success rate dropped from 99.8% to 0.00%. Telemetry ingestion completely halted across all 24 pumps.",
    unknownRootCause: "Mosquitto daemon process exited due to an unhandled SIGTERM signal during buffer reload.",
    sloImpact: "Motor Command Availability dropped to 0.00%. Error budget consumed: 48%.",
    requiredObservabilityPillars: ["Process Table", "Docker Status", "Mosquitto Sockets"],
    telemetryData: {
      devicesOnline: 0,
      totalDevices: 24,
      mqttConnections: 0,
      packetLossPct: 100,
      errorRateRPS: 420
    },
    hints: [
      "Check container runtime status: `docker ps` or `docker compose ps`.",
      "Inspect logs of the broker: `docker logs moonsav-mqtt-broker --tail 50`.",
      "Check whether port 1883 is listening: `ss -tulpn | grep 1883` or `nc -zv localhost 1883`.",
      "Restart the broker container: `docker compose restart moonsav-mqtt-broker`."
    ],
    resolutionAction: "Restart Mosquitto broker daemon and verify listener socket on port 1883.",
    prevention: "Configure Docker `restart: always` policy and add Prometheus alert on broker disconnect.",
    postmortemTemplate: {
      title: "Postmortem: Level 1 MQTT Process Down",
      impact: "All 24 smart pumps disconnected for 8 minutes.",
      rootCause: "Mosquitto daemon ungraceful termination without auto-restart.",
      actionItems: ["Set restart policy in docker compose", "Add blackbox TCP probe on 1883"]
    }
  },
  {
    id: "inc-moon-002",
    level: "Level 2 (Intermediate)",
    project: "moonsav",
    title: "Level 2: Redis Memory Pressure & Key Eviction Storm",
    severity: "SEV-2",
    status: "active",
    startedAt: "14 minutes ago",
    affectedService: "moonsav-redis / moonsav-api",
    symptoms: "Device heartbeats expiring prematurely. UI intermittently displays 'Device State Unknown'. API P95 latency increased by 140ms.",
    unknownRootCause: "Telemetry heartbeat keys written without TTL; Redis `maxmemory 256mb` reached, triggering allkeys-lru eviction of active device tokens.",
    sloImpact: "Telemetry Read Availability: 97.4% (SLO Target: 99.95%).",
    requiredObservabilityPillars: ["Prometheus Metrics", "Loki Logs"],
    telemetryData: {
      redisMemoryUsageMB: 255.8,
      evictedKeysPerSec: 1480,
      heartbeatMissRatePct: 24.2,
      apiP95LatencyMs: 245
    },
    hints: [
      "Open Prometheus and query Redis memory: `moonsav_redis_memory_used_bytes` or `docker stats moonsav-redis`.",
      "Query Loki for Redis warnings: `{job=\"moonsav-containers\"} |= \"OOM\"` or `{job=\"moonsav-containers\"} |= \"eviction\"`.",
      "Inspect Redis key TTLs using `redis-cli TTL device:PUMP-01:state`.",
      "Apply 60s expiration on telemetry writes and increase Redis memory limit to 512MB."
    ],
    resolutionAction: "Flush stale unexpiring keys, enforce explicit 60s TTL on heartbeat writes, and tune `maxmemory 512mb`.",
    prevention: "Add Prometheus alert for Redis memory utilization > 80% and enforce key TTL linting.",
    postmortemTemplate: {
      title: "Postmortem: Level 2 Redis Eviction Storm",
      impact: "Intermittent device state loss for 14 minutes.",
      rootCause: "Missing TTL on ephemeral telemetry cache entries caused LRU eviction of auth tokens.",
      actionItems: ["Enforce strict TTL on Redis sets", "Increase Redis memory limit", "Add memory usage alert"]
    }
  },
  {
    id: "inc-moon-003",
    level: "Level 3 (Advanced)",
    project: "moonsav",
    title: "Level 3: PostgreSQL Lock Contention & Slow Query Latency",
    severity: "SEV-1",
    status: "active",
    startedAt: "19 minutes ago",
    affectedService: "moonsav-postgres / sensor_telemetry table",
    symptoms: "Motor command dispatch API endpoints experiencing 504 Gateway Timeouts. Grafana shows API P95 latency degraded to 2,400ms.",
    unknownRootCause: "An unindexed telemetry analytics query executed a table lock on `sensor_telemetry`, stalling all concurrent INSERT transactions.",
    sloImpact: "API P95 Latency breached 300ms SLO (measured: 2,410ms). Error budget burning at 4.2x normal rate.",
    requiredObservabilityPillars: ["Prometheus Metrics", "Jaeger Tracing", "PostgreSQL pg_stat_activity"],
    telemetryData: {
      p95LatencyMs: 2410,
      activeLocks: 18,
      blockedQueries: 42,
      sloErrorBudgetRemainingPct: 62.4
    },
    hints: [
      "Look at Jaeger distributed traces: notice that `moonsav-postgres: INSERT INTO motor_commands` span accounts for 92% of the request time.",
      "Check active PostgreSQL queries: `docker exec moonsav-postgres psql -U moonsav -d moonsav_iot -c 'SELECT pid, query, state FROM pg_stat_activity WHERE state != \"idle\";'`.",
      "Identify the blocking long-running query and terminate it with `SELECT pg_terminate_backend(<pid>);`.",
      "Create the missing composite index: `CREATE INDEX idx_telemetry_device_time ON sensor_telemetry(device_id, recorded_at DESC);`."
    ],
    resolutionAction: "Terminate blocking analytical query, create missing composite index on `sensor_telemetry`, and configure `statement_timeout = '5s'`.",
    prevention: "Add database statement timeout limit in `postgresql.conf` and route analytics queries to read-replicas.",
    postmortemTemplate: {
      title: "Postmortem: Level 3 Database Lock Contention",
      impact: "API P95 latency spiked to 2.4s for 19 minutes; 32% of motor commands timed out.",
      rootCause: "Unindexed full-table sequential scan locked the sensor telemetry hypertable.",
      actionItems: ["Add statement_timeout 5s", "Add composite index on device_id + recorded_at", "Implement Jaeger trace sampling"]
    }
  },
  {
    id: "inc-moon-004",
    level: "Level 4 (Expert)",
    project: "moonsav",
    title: "Level 4: API Degradation Caused by Database Pool Exhaustion",
    severity: "SEV-1",
    status: "active",
    startedAt: "22 minutes ago",
    affectedService: "moonsav-api / connection-pool",
    symptoms: "API healthcheck endpoint `/health` reports `status: DEGRADED`. HTTP 500 errors on `/api/v1/devices`. PromQL shows pool wait time > 8 seconds.",
    unknownRootCause: "Database client connections were not released in the exception handler of `moonsav-api/server.js`, leaking pool clients until `max: 10` connections were exhausted.",
    sloImpact: "Overall Service Availability dropped to 78.2%. Error budget burn rate: 6.8x.",
    requiredObservabilityPillars: ["Prometheus Metrics", "Loki Logs", "Jaeger Tracing", "Node.js Heap Dumps"],
    telemetryData: {
      poolActiveConnections: 10,
      poolWaitingRequests: 142,
      http500RatePct: 21.8,
      sloBurnRate: 6.8
    },
    hints: [
      "Check Prometheus metric `pg_pool_active_connections` vs `pg_pool_max_connections`.",
      "Inspect Loki logs for pool errors: `{job=\"moonsav-containers\"} |= \"timeout: connection pool exhausted\"`.",
      "Look at Jaeger traces: notice requests waiting indefinitely in `pg.connect()` before aborting.",
      "Patch `server.js` to ensure `client.release()` is called inside a `finally` block."
    ],
    resolutionAction: "Fix connection leak in error handling middleware, increase pool size to 25 with connection timeouts, and restart API.",
    prevention: "Use AsyncLocalStorage context-managed connection wrappers and enable pool leak detection alerts in Prometheus.",
    postmortemTemplate: {
      title: "Postmortem: Level 4 Connection Pool Leak",
      impact: "Service degraded with 21.8% HTTP 500 errors for 22 minutes.",
      rootCause: "Unreleased database connection inside try/catch block without finally clause.",
      actionItems: ["Wrap connections in finally blocks", "Add pool exhaustion alert", "Implement pool health probes"]
    }
  },
  {
    id: "inc-moon-005",
    level: "Level 5 (Staff SRE / Cascading Failure)",
    project: "moonsav",
    title: "Level 5: Cascading Telemetry Pipeline & Safety Cutoff Failure",
    severity: "SEV-1",
    status: "active",
    startedAt: "28 minutes ago",
    affectedService: "MQTT -> Telemetry -> API -> Postgres -> Safety Watchdog",
    symptoms: "Cascading multi-tier collapse: MQTT broker connection storm -> Ingestion queue backlog -> Database write queue saturation -> Safety watchdog failure -> Pump thermal runaway risk.",
    unknownRootCause: "Edge network flicker caused 2,400 devices to reconnect simultaneously with zero backoff jitter; MQTT broker saturated, ingestion workers crashed, and stale sensor telemetry prevented dry-run safety cutoff from engaging.",
    sloImpact: "Critical multi-system SLO breach. All error budgets exhausted (100% burned). Physical asset damage imminent.",
    requiredObservabilityPillars: ["Prometheus (PromQL)", "Loki (LogQL)", "Jaeger Distributed Tracing", "Grafana Unified SRE Dashboard"],
    telemetryData: {
      reconnectStormRPS: 12400,
      mqttSocketBacklog: 8200,
      safetyWatchdogState: "STALLED",
      pumpsAtRisk: 8,
      sloBurnRate: 14.2
    },
    hints: [
      "Step 1 (Metrics): Observe PromQL spike in `moonsav_mqtt_messages_total` and `moonsav_slo_burn_rate`.",
      "Step 2 (Logs): Query Loki for `{job=\"moonsav-containers\"} |= \"connection storm\"` and `{job=\"moonsav-containers\"} |= \"watchdog timeout\"`.",
      "Step 3 (Traces): Identify waterfall bottleneck where DB write queue latency starved the watchdog goroutines.",
      "Step 4 (Mitigation): Apply rate-limiting in Mosquitto, enable exponential backoff on simulator, and prioritize safety watchdog thread."
    ],
    resolutionAction: "Apply connection rate limiting on MQTT broker, flush stale write queues, deploy backoff jitter algorithm to device simulators, and restore watchdog priority.",
    prevention: "Implement token bucket rate-limiting at edge ingress, decouple safety watchdog from database write path, and establish chaos injection pipeline for reconnect storms.",
    postmortemTemplate: {
      title: "Postmortem: Level 5 Cascading Pipeline Collapse",
      impact: "Complete system telemetry freeze and safety cutoff stall across entire fleet for 28 minutes.",
      rootCause: "Unthrottled reconnect storm overwhelmed message ingestion, starving safety watchdog threads.",
      actionItems: ["Implement edge token-bucket rate limiting", "Decouple safety watchdog from telemetry DB writes", "Automate reconnect jitter"]
    }
  },
  {
    id: "inc-daig-001",
    level: "Distributed Systems (Level 3)",
    project: "daig_distributed",
    title: "RabbitMQ Dead-Letter Queue Backlog & Worker OOM-Kill",
    severity: "SEV-1",
    status: "active",
    startedAt: "15 minutes ago",
    affectedService: "rabbitmq / celery-order-workers",
    symptoms: "Checkout queue depth exploded to 48,000 unconsumed messages. Celery background workers exiting with `ExitCode 137 (OOMKilled)`. Order confirmation emails not sending.",
    unknownRootCause: "A malformed JSON payload in a bulk order caused worker memory leak; RabbitMQ requeued the message infinitely (poison pill) crashing all 8 worker replicas in a loop.",
    sloImpact: "Order Processing Latency P99 spiked to 45 minutes. Backlog growing at 500 msgs/sec.",
    requiredObservabilityPillars: ["Prometheus Metrics", "Loki Logs", "Jaeger Tracing"],
    telemetryData: {
      queueDepth: 48120,
      consumerCount: 0,
      workerRestarts: 42,
      memoryUsageMB: 1024,
      poisonMessagesDetected: 1
    },
    hints: [
      "Check RabbitMQ queue depth and consumer count: `rabbitmqctl list_queues name messages consumers`.",
      "Inspect Celery worker container crash reasons: `docker ps` or `kubectl describe pod -l app=order-worker` — look for `OOMKilled: true`.",
      "Check worker logs to identify the poison pill message: `docker logs moonsav-order-worker --tail=50`.",
      "Configure a Dead-Letter Exchange (DLX) with `x-max-retries: 3` and move the poison message to a dead-letter queue."
    ],
    resolutionAction: "Quarantine poison pill message to DLQ, configure Celery `max_tasks_per_child=50` to prevent memory leaks, and scale workers.",
    prevention: "Implement strict JSON schema validation before publishing to RabbitMQ and configure `x-dead-letter-exchange` with exponential backoff.",
    postmortemTemplate: {
      title: "Postmortem: RabbitMQ Poison Pill Queue Cascade Outage",
      impact: "Order background processing stalled for 35 minutes.",
      rootCause: "Uncaught JSON parsing exception caused infinite worker crash loops on re-queued messages.",
      actionItems: ["Configure RabbitMQ Dead Letter Exchange", "Add Zod schema pre-validation", "Set Celery max-tasks-per-child limit"]
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 9-DIMENSION OBSERVABILITY ASSESSMENT SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export const OBSERVABILITY_SCORE_WEIGHTS = {
  detection: { weight: 10, label: "Detection & Alerting Speed" },
  observabilitySelection: { weight: 10, label: "Observability Signal Selection (Metrics vs Logs vs Traces)" },
  investigation: { weight: 15, label: "Systematic Diagnostic Triage" },
  evidenceQuality: { weight: 15, label: "Audited Evidence & Query Quality" },
  rootCauseAnalysis: { weight: 20, label: "Root-Cause Precision" },
  mitigation: { weight: 10, label: "Technical Fix & Service Recovery" },
  verification: { weight: 10, label: "Automated SLO Recovery Verification" },
  automation: { weight: 5, label: "Automation Scripting & Guardrails" },
  documentation: { weight: 5, label: "Blameless Postmortem Documentation" }
};

