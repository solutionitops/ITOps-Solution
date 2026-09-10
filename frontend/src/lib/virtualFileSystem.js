// In-Memory Virtual File System (VFS) for MOONSAV ITOps Academy Terminal
// Provides authentic Linux filesystem semantics with standard paths and realistic configs.

export const DEFAULT_WORKSPACE_PATH = "/home/engineer/workspace";

export const INITIAL_FILESYSTEM = {
  "/": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/home": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/home/engineer": {
    type: "dir",
    owner: "engineer",
    group: "engineer",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:05"
  },
  "/home/engineer/workspace": {
    type: "dir",
    owner: "engineer",
    group: "engineer",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 09:00"
  },
  "/home/engineer/workspace/Dockerfile": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:12",
    content: `# Multi-stage Build for MOONSAV Ingestion Service
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o moonsav-ingest .

FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /app/moonsav-ingest /moonsav-ingest
USER 10001:10001
EXPOSE 8080 1883
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \\
  CMD ["/moonsav-ingest", "--healthcheck"]
ENTRYPOINT ["/moonsav-ingest"]
`
  },
  "/home/engineer/workspace/docker-compose.yaml": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:15",
    content: `version: "3.9"

services:
  mqtt-broker:
    image: emqx/emqx:5.4-alpine
    container_name: moonsav-mqtt-broker
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "18083:18083"
    environment:
      - EMQX_ALLOW_ANONYMOUS=true
    volumes:
      - ./config/mosquitto.conf:/opt/emqx/etc/emqx.conf:ro
    healthcheck:
      test: ["CMD", "/opt/emqx/bin/emqx", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  telemetry-svc:
    build: .
    container_name: moonsav-telemetry
    restart: on-failure:5
    ports:
      - "8080:8080"
    environment:
      - MQTT_HOST=mqtt-broker
      - MQTT_PORT=1883
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      mqtt-broker:
        condition: service_healthy
      postgres:
        condition: service_healthy

  postgres:
    image: timescale/timescaledb:latest-pg16
    container_name: moonsav-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=moonsav_telemetry
      - POSTGRES_USER=moonsav
      - POSTGRES_PASSWORD=supersecret
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U moonsav -d moonsav_telemetry"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7.2-alpine
    container_name: moonsav-redis
    ports:
      - "6379:6379"
    command: ["redis-server", "--appendonly", "yes"]

volumes:
  pgdata:
`
  },
  "/home/engineer/workspace/main.go": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:30",
    content: `package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type TelemetryData struct {
	DeviceID    string  \`json:"deviceId"\`
	TankLevelPct float64 \`json:"tankLevelPct"\`
	FlowRateLPM float64 \`json:"flowRateLPM"\`
	MotorTempC  float64 \`json:"motorTempC"\`
	DryRunTripped bool  \`json:"dryRunTripped"\`
	Timestamp   int64   \`json:"timestamp"\`
}

func main() {
	log.Println("[INFO] Starting MOONSAV Ingestion Service v2.4.0")

	// HTTP Health Endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "UP",
			"healthy": true,
			"uptimeSeconds": time.Now().Unix(),
		})
	})

	go func() {
		if err := http.ListenAndServe(":8080", nil); err != nil {
			log.Fatalf("[FATAL] HTTP server error: %v", err)
		}
	}()

	log.Println("[INFO] Listening on HTTP :8080 for health probes and Prometheus metrics")

	// Graceful shutdown handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan
	log.Println("[INFO] Gracefully shutting down MOONSAV telemetry listener...")
}
`
  },
  "/home/engineer/workspace/Makefile": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:00",
    content: `.PHONY: all build test lint run clean

all: build

build:
	go build -v -o bin/moonsav-ingest .

test:
	go test -v -race -cover ./...

lint:
	golangci-lint run

run:
	go run main.go

clean:
	rm -rf bin/
`
  },
  "/home/engineer/workspace/README.md": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:05",
    content: `# MOONSAV Smart Infrastructure Lab Workspace

Welcome to the production engineering lab workstation.

## Directory Structure
- \`config/\`: Mosquitto MQTT, Nginx, Prometheus, and Safety interlock configs
- \`k8s/\`: Kubernetes Deployment, Service, and NetworkPolicy manifests
- \`scripts/\`: Operational diagnosis and automated chaos runbooks
- \`Dockerfile\` & \`docker-compose.yaml\`: Container stack definitions

## Quick Shortcuts
- Test HTTP Health: \`curl -s http://localhost:8080/health\`
- Inspect Process Table: \`ps aux --sort=-%cpu | head -10\`
- View MQTT Sockets: \`ss -tulpn | grep 1883\`
- Run Container Stack: \`docker compose ps\`
- View Live Pods: \`kubectl get pods -A\`
`
  },
  "/home/engineer/workspace/config": {
    type: "dir",
    owner: "engineer",
    group: "engineer",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 09:20"
  },
  "/home/engineer/workspace/config/safety.json": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:22",
    content: `{
  "safetyVersion": "2.4.0",
  "lowWaterCutoffPct": 10.0,
  "highWaterLimitPct": 98.0,
  "maxMotorTempC": 85.0,
  "dryRunWatchdogSeconds": 3,
  "flowFailureGraceSeconds": 5,
  "autoCoolDownMinutes": 15,
  "interlockKillMode": "mixed"
}
`
  },
  "/home/engineer/workspace/config/mosquitto.conf": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:23",
    content: `# MOONSAV Mosquitto / EMQX Broker Configuration
listener 1883 0.0.0.0
allow_anonymous true
max_connections 50000
persistence true
persistence_location /mosquitto/data/
log_dest file /var/log/mosquitto/mosquitto.log
log_type error
log_type warning
log_type notice
log_type information
`
  },
  "/home/engineer/workspace/config/nginx.conf": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:25",
    content: `events {
    worker_connections 4096;
}

http {
    upstream backend_nodes {
        least_conn;
        server 127.0.0.1:8080 max_fails=3 fail_timeout=10s;
        server 127.0.0.1:8081 backup;
    }

    server {
        listen 80;
        server_name api.moonsav.internal;

        location /health {
            proxy_pass http://backend_nodes;
            proxy_connect_timeout 2s;
            proxy_read_timeout 3s;
        }

        location / {
            proxy_pass http://backend_nodes;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
`
  },
  "/home/engineer/workspace/config/prometheus.yml": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:26",
    content: `global:
  scrape_interval: 5s
  evaluation_interval: 5s

scrape_configs:
  - job_name: "moonsav-telemetry"
    static_configs:
      - targets: ["localhost:8080"]

  - job_name: "emqx-broker"
    static_configs:
      - targets: ["localhost:18083"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["localhost:9100"]
`
  },
  "/home/engineer/workspace/k8s": {
    type: "dir",
    owner: "engineer",
    group: "engineer",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 09:40"
  },
  "/home/engineer/workspace/k8s/deployment.yaml": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:41",
    content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: moonsav-telemetry
  namespace: production
  labels:
    app: moonsav-telemetry
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: moonsav-telemetry
  template:
    metadata:
      labels:
        app: moonsav-telemetry
    spec:
      containers:
        - name: telemetry
          image: moonsav/telemetry-svc:v2.4.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              name: http
            - containerPort: 1883
              name: mqtt
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 3
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
`
  },
  "/home/engineer/workspace/k8s/service.yaml": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rw-r--r--",
    mtime: "Aug 14 09:42",
    content: `apiVersion: v1
kind: Service
metadata:
  name: moonsav-telemetry-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app: moonsav-telemetry
  ports:
    - name: http
      port: 80
      targetPort: 8080
    - name: mqtt
      port: 1883
      targetPort: 1883
`
  },
  "/home/engineer/workspace/scripts": {
    type: "dir",
    owner: "engineer",
    group: "engineer",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 09:45"
  },
  "/home/engineer/workspace/scripts/health_check.sh": {
    type: "file",
    owner: "engineer",
    group: "engineer",
    mode: "-rwxr-xr-x",
    mtime: "Aug 14 09:46",
    content: `#!/usr/bin/env bash
set -euo pipefail

echo "=== MOONSAV Automated Health Validator ==="
echo -n "1. Checking HTTP /health endpoint: "
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health || echo "FAIL")
if [ "$STATUS_CODE" = "200" ]; then
  echo "✔ OK (HTTP 200)"
else
  echo "✘ FAILED (Code: $STATUS_CODE)"
fi

echo -n "2. Checking MQTT Broker TCP Socket (1883): "
if ss -tln | grep -q ":1883 "; then
  echo "✔ LISTENING"
else
  echo "✘ PORT NOT BOUND"
fi

echo -n "3. Checking Defunct/Zombie Processes: "
ZOMBIES=$(ps -eo stat,ppid,pid,comm | grep -w "Z" | wc -l)
if [ "$ZOMBIES" -eq 0 ]; then
  echo "✔ 0 Zombies Found"
else
  echo "⚠ WARNING: $ZOMBIES Defunct Processes Detected!"
fi
`
  },
  "/etc": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/etc/resolv.conf": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-rw-r--r--",
    mtime: "Aug 14 08:00",
    content: `# Dynamic resolv.conf(5) file for glibc resolver
nameserver 127.0.0.53
options edns0 trust-ad timeout:2 attempts:2
search moonsav.internal
`
  },
  "/etc/hosts": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-rw-r--r--",
    mtime: "Aug 14 08:00",
    content: `127.0.0.1 localhost
127.0.1.1 moonsav-prod-node-01
10.0.4.15 payment.internal.svc
10.0.4.18 inventory.internal.svc
`
  },
  "/etc/systemd": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/etc/systemd/system": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/etc/systemd/system/moonsav-telemetry.service": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-rw-r--r--",
    mtime: "Aug 14 08:15",
    content: `[Unit]
Description=MOONSAV Industrial Telemetry Ingestion Daemon
After=network.target mqtt.service postgres.service

[Service]
Type=simple
User=engineer
Group=engineer
WorkingDirectory=/home/engineer/workspace
ExecStart=/home/engineer/workspace/moonsav-ingest
Restart=on-failure
RestartSec=5s
TasksMax=4096
KillMode=mixed
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
`
  },
  "/var": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/var/log": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "drwxr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/var/log/syslog": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-rw-r--r--",
    mtime: "Aug 14 10:14",
    content: `Aug 14 10:14:00 moonsav-prod systemd[1]: Started MOONSAV Platform Component.
Aug 14 10:14:02 moonsav-prod moonsav-telemetry[1420]: [INFO] Ingestion worker pool initialized with 16 goroutines
Aug 14 10:14:03 moonsav-prod moonsav-telemetry[1420]: [INFO] MQTT client connected to tcp://127.0.0.1:1883
Aug 14 10:14:04 moonsav-prod moonsav-telemetry[1420]: [DEBUG] TimescaleDB hypertable batch write completed in 4.1ms
Aug 14 10:14:05 moonsav-prod emqx[1104]: [notice] Client PUMP-01 authenticated via TLS 1.3
`
  },
  "/proc": {
    type: "dir",
    owner: "root",
    group: "root",
    mode: "dr-xr-xr-x",
    mtime: "Aug 14 08:00"
  },
  "/proc/cpuinfo": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-r--r--r--",
    mtime: "Aug 14 08:00",
    content: `processor\t: 0
vendor_id\t: GenuineIntel
cpu family\t: 6
model_name\t: Intel(R) Xeon(R) Platinum 8480+ @ 3.80GHz
cpu MHz\t\t: 3799.998
cache size\t: 107520 KB
cpu cores\t: 8
`
  },
  "/proc/meminfo": {
    type: "file",
    owner: "root",
    group: "root",
    mode: "-r--r--r--",
    mtime: "Aug 14 08:00",
    content: `MemTotal:       16384210 kB
MemFree:         8421040 kB
MemAvailable:   12410290 kB
Buffers:          341200 kB
Cached:          4120400 kB
SwapTotal:       2097148 kB
SwapFree:        2097148 kB
`
  }
};

export class VirtualFileSystem {
  constructor(initialTree = INITIAL_FILESYSTEM) {
    this.tree = JSON.parse(JSON.stringify(initialTree));
    this.cwd = DEFAULT_WORKSPACE_PATH;
  }

  // Canonicalize relative and absolute paths
  resolvePath(targetPath = "", currentDir = this.cwd) {
    if (!targetPath || targetPath.trim() === "") return currentDir;
    let p = targetPath.trim();

    // Handle home alias ~
    if (p === "~" || p.startsWith("~/")) {
      p = "/home/engineer" + p.slice(1);
    }

    // Relative vs Absolute
    if (!p.startsWith("/")) {
      p = `${currentDir === "/" ? "" : currentDir}/${p}`;
    }

    const segments = p.split("/").filter(Boolean);
    const resolved = [];

    for (const seg of segments) {
      if (seg === ".") continue;
      if (seg === "..") {
        resolved.pop();
      } else {
        resolved.push(seg);
      }
    }

    const finalPath = "/" + resolved.join("/");
    return finalPath || "/";
  }

  exists(path, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    return Boolean(this.tree[full]);
  }

  stat(path, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    return this.tree[full] || null;
  }

  readFile(path, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    const node = this.tree[full];
    if (!node) {
      throw new Error(`cat: ${path}: No such file or directory`);
    }
    if (node.type === "dir") {
      throw new Error(`cat: ${path}: Is a directory`);
    }
    return node.content || "";
  }

  writeFile(path, content, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    const parentPath = full.substring(0, full.lastIndexOf("/")) || "/";

    if (!this.exists(parentPath)) {
      this.mkdir(parentPath, true);
    }

    const existing = this.tree[full];
    this.tree[full] = {
      type: "file",
      owner: existing?.owner || "engineer",
      group: existing?.group || "engineer",
      mode: existing?.mode || "-rw-r--r--",
      mtime: "Just now",
      content: String(content)
    };
    return true;
  }

  appendFile(path, content, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    if (this.exists(full)) {
      const existing = this.readFile(full);
      return this.writeFile(full, existing + content, currentDir);
    }
    return this.writeFile(full, content, currentDir);
  }

  mkdir(path, recursive = false, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    if (this.exists(full)) {
      if (this.tree[full].type === "dir") return true;
      throw new Error(`mkdir: cannot create directory '${path}': File exists`);
    }

    const segments = full.split("/").filter(Boolean);
    let cur = "";

    for (let i = 0; i < segments.length; i++) {
      cur += "/" + segments[i];
      if (!this.tree[cur]) {
        if (!recursive && i < segments.length - 1) {
          throw new Error(`mkdir: cannot create directory '${path}': No such file or directory`);
        }
        this.tree[cur] = {
          type: "dir",
          owner: "engineer",
          group: "engineer",
          mode: "drwxr-xr-x",
          mtime: "Just now"
        };
      }
    }
    return true;
  }

  remove(path, recursive = false, currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    if (!this.exists(full)) {
      throw new Error(`rm: cannot remove '${path}': No such file or directory`);
    }

    const isDir = this.tree[full].type === "dir";
    if (isDir && !recursive) {
      throw new Error(`rm: cannot remove '${path}': Is a directory`);
    }

    if (isDir) {
      // Remove child items as well
      for (const key of Object.keys(this.tree)) {
        if (key === full || key.startsWith(full + "/")) {
          delete this.tree[key];
        }
      }
    } else {
      delete this.tree[full];
    }
    return true;
  }

  listDir(path = ".", currentDir = this.cwd) {
    const full = this.resolvePath(path, currentDir);
    const node = this.tree[full];
    if (!node) {
      throw new Error(`ls: cannot access '${path}': No such file or directory`);
    }
    if (node.type !== "dir") {
      return [{ name: full.split("/").pop(), node, path: full }];
    }

    const prefix = full === "/" ? "/" : full + "/";
    const entries = [];
    const seen = new Set();

    for (const key of Object.keys(this.tree)) {
      if (key === full) continue;
      if (key.startsWith(prefix)) {
        const sub = key.slice(prefix.length);
        const name = sub.split("/")[0];
        if (!seen.has(name)) {
          seen.add(name);
          const itemPath = prefix + name;
          entries.push({
            name,
            node: this.tree[itemPath] || { type: "dir", mode: "drwxr-xr-x", owner: "engineer", group: "engineer", mtime: "Aug 14 09:00" },
            path: itemPath
          });
        }
      }
    }

    // Sort directories first, then alphabetical
    entries.sort((a, b) => {
      if (a.node.type === "dir" && b.node.type !== "dir") return -1;
      if (a.node.type !== "dir" && b.node.type === "dir") return 1;
      return a.name.localeCompare(b.name);
    });

    return entries;
  }

  changeDir(path) {
    const full = this.resolvePath(path);
    const node = this.tree[full];
    if (!node) {
      throw new Error(`bash: cd: ${path}: No such file or directory`);
    }
    if (node.type !== "dir") {
      throw new Error(`bash: cd: ${path}: Not a directory`);
    }
    this.cwd = full;
    return this.cwd;
  }

  reset() {
    this.tree = JSON.parse(JSON.stringify(INITIAL_FILESYSTEM));
    this.cwd = DEFAULT_WORKSPACE_PATH;
  }
}
