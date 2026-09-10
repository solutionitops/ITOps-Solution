// Real In-Browser Linux Terminal & Shell Execution Engine
// Executes real shell commands against the Virtual File System (VFS) and environment state.

import { VirtualFileSystem } from "./virtualFileSystem";

export class ShellSession {
  constructor(options = {}) {
    this.vfs = options.vfs || new VirtualFileSystem();
    this.projectId = options.projectId || "moonsav";
    this.labId = options.labId || "lab-fnd-001";
    this.user = options.user || "engineer";
    this.hostname = options.hostname || "moonsav-prod";
    this.env = {
      USER: this.user,
      HOME: "/home/engineer",
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      PWD: this.vfs.cwd,
      SHELL: "/bin/bash",
      TERM: "xterm-256color",
      LANG: "en_US.UTF-8",
      ...options.env
    };
    this.history = [];
    this.processes = [
      { pid: 1, ppid: 0, user: "root", stat: "Ss", cpu: 0.1, mem: 0.4, time: "0:04", comm: "systemd" },
      { pid: 1104, ppid: 1, user: "emqx", stat: "Ssl", cpu: 1.2, mem: 4.8, time: "0:42", comm: "emqx" },
      { pid: 1205, ppid: 1, user: "postgres", stat: "Ssl", cpu: 0.8, mem: 5.2, time: "0:38", comm: "postgres" },
      { pid: 1308, ppid: 1, user: "redis", stat: "Ssl", cpu: 0.4, mem: 1.8, time: "0:12", comm: "redis-server" },
      { pid: 1420, ppid: 1, user: "engineer", stat: "Sl", cpu: 4.8, mem: 2.4, time: "1:42", comm: "moonsav-ingest" },
      { pid: 2840, ppid: 1420, user: "engineer", stat: "Z", cpu: 0.0, mem: 0.0, time: "0:00", comm: "leak_proc <defunct>" },
      { pid: 2841, ppid: 1420, user: "engineer", stat: "Z", cpu: 0.0, mem: 0.0, time: "0:00", comm: "leak_proc <defunct>" },
      { pid: 4890, ppid: 1, user: "root", stat: "Ssl", cpu: 0.2, mem: 1.1, time: "0:06", comm: "dockerd" }
    ];
    this.services = {
      "moonsav-telemetry": { status: "active (running)", load: "loaded", pid: 1420, memory: "42.8M", tasks: 8 },
      "moonsav-motor": { status: "active (running)", load: "loaded", pid: 1488, memory: "38.2M", tasks: 4 },
      "mosquitto": { status: "active (running)", load: "loaded", pid: 1104, memory: "24.1M", tasks: 6 },
      "nginx": { status: "active (running)", load: "loaded", pid: 1540, memory: "18.4M", tasks: 4 },
      "postgres": { status: "active (running)", load: "loaded", pid: 1205, memory: "64.0M", tasks: 12 },
      "redis": { status: "active (running)", load: "loaded", pid: 1308, memory: "16.2M", tasks: 4 }
    };
    this.sockets = [
      { proto: "tcp", state: "LISTEN", recvQ: 0, sendQ: 128, local: "0.0.0.0:1883", peer: "0.0.0.0:*", pid: 1104, prog: "emqx" },
      { proto: "tcp", state: "LISTEN", recvQ: 0, sendQ: 128, local: "0.0.0.0:8080", peer: "0.0.0.0:*", pid: 1420, prog: "moonsav-ingest" },
      { proto: "tcp", state: "LISTEN", recvQ: 0, sendQ: 128, local: "0.0.0.0:5432", peer: "0.0.0.0:*", pid: 1205, prog: "postgres" },
      { proto: "tcp", state: "LISTEN", recvQ: 0, sendQ: 128, local: "0.0.0.0:6379", peer: "0.0.0.0:*", pid: 1308, prog: "redis-server" },
      { proto: "tcp", state: "LISTEN", recvQ: 0, sendQ: 128, local: "0.0.0.0:80", peer: "0.0.0.0:*", pid: 1540, prog: "nginx" }
    ];
  }

  getPrompt() {
    const cwd = this.vfs.cwd;
    const shortCwd = cwd.startsWith("/home/engineer")
      ? "~" + cwd.slice("/home/engineer".length)
      : cwd;
    return `${this.user}@${this.hostname}:${shortCwd}$`;
  }

  // Parse command line into pipelines and redirection
  parseCommandLine(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Check for output redirection (> or >>)
    let commandStr = trimmed;
    let redirectMode = null;
    let redirectFile = null;

    if (commandStr.includes(">>")) {
      const parts = commandStr.split(">>");
      commandStr = parts[0].trim();
      redirectMode = "append";
      redirectFile = parts[1]?.trim();
    } else if (commandStr.includes(">")) {
      const parts = commandStr.split(">");
      commandStr = parts[0].trim();
      redirectMode = "write";
      redirectFile = parts[1]?.trim();
    }

    // Split pipeline steps (|)
    const pipeSteps = commandStr.split("|").map(s => s.trim()).filter(Boolean);
    return { pipeSteps, redirectMode, redirectFile };
  }

  // Execute command pipeline
  execute(rawCommand) {
    const parsed = this.parseCommandLine(rawCommand);
    if (!parsed) return { output: "", exitCode: 0 };

    this.history.push(rawCommand);
    let pipeInput = "";
    let lastExitCode = 0;

    for (let i = 0; i < parsed.pipeSteps.length; i++) {
      const stepStr = parsed.pipeSteps[i];
      const result = this.executeSingle(stepStr, pipeInput);
      pipeInput = result.output;
      lastExitCode = result.exitCode;
      if (result.clear) {
        return { output: "", clear: true, exitCode: 0 };
      }
    }

    let finalOutput = pipeInput;

    // Handle redirection
    if (parsed.redirectMode && parsed.redirectFile) {
      try {
        if (parsed.redirectMode === "append") {
          this.vfs.appendFile(parsed.redirectFile, finalOutput + "\n");
        } else {
          this.vfs.writeFile(parsed.redirectFile, finalOutput + "\n");
        }
        finalOutput = "";
      } catch (err) {
        return { output: `bash: ${parsed.redirectFile}: ${err.message}`, exitCode: 1 };
      }
    }

    return { output: finalOutput, exitCode: lastExitCode };
  }

  // Tokenize arguments handling double and single quotes
  tokenize(commandStr) {
    const tokens = [];
    let current = "";
    let inQuotes = null;

    for (let i = 0; i < commandStr.length; i++) {
      const char = commandStr[i];
      if (char === '"' || char === "'") {
        if (inQuotes === char) {
          inQuotes = null;
        } else if (!inQuotes) {
          inQuotes = char;
        } else {
          current += char;
        }
      } else if (char === " " && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  executeSingle(cmdStr, stdin = "") {
    const tokens = this.tokenize(cmdStr);
    if (tokens.length === 0) return { output: "", exitCode: 0 };

    const cmd = tokens[0];
    const args = tokens.slice(1);

    // Command Handlers
    switch (cmd) {
      case "clear":
        return { output: "", clear: true, exitCode: 0 };

      case "pwd":
        return { output: this.vfs.cwd, exitCode: 0 };

      case "whoami":
        return { output: this.user, exitCode: 0 };

      case "id":
        return { output: `uid=10001(${this.user}) gid=10001(${this.user}) groups=10001(${this.user}),27(sudo),998(docker)`, exitCode: 0 };

      case "uptime":
        return { output: " 12:04:02 up 14 days,  4:12,  1 user,  load average: 0.28, 0.42, 0.55", exitCode: 0 };

      case "date":
        return { output: new Date().toUTCString(), exitCode: 0 };

      case "echo":
        return { output: args.join(" "), exitCode: 0 };

      case "cd": {
        const target = args[0] || "/home/engineer/workspace";
        try {
          this.vfs.changeDir(target);
          this.env.PWD = this.vfs.cwd;
          return { output: "", exitCode: 0 };
        } catch (err) {
          return { output: err.message, exitCode: 1 };
        }
      }

      case "ls": {
        const hasA = args.some(a => a.startsWith("-") && a.includes("a"));
        const hasL = args.some(a => a.startsWith("-") && a.includes("l"));
        const targetArg = args.find(a => !a.startsWith("-")) || ".";

        try {
          const entries = this.vfs.listDir(targetArg);
          if (hasL) {
            let totalBlocks = entries.length * 4;
            const lines = [`total ${totalBlocks}`];
            if (hasA) {
              lines.push(`drwxr-xr-x 4 ${this.user} ${this.user} 4096 Aug 14 09:00 .`);
              lines.push(`drwxr-xr-x 3 root root 4096 Aug 14 08:00 ..`);
            }
            for (const e of entries) {
              if (!hasA && e.name.startsWith(".")) continue;
              const isDir = e.node.type === "dir";
              const size = isDir ? 4096 : (e.node.content?.length || 0);
              lines.push(`${e.node.mode || (isDir ? "drwxr-xr-x" : "-rw-r--r--")} 1 ${e.node.owner || this.user} ${e.node.group || this.user} ${String(size).padStart(6, " ")} ${e.node.mtime || "Aug 14 09:00"} ${e.name}${isDir ? "/" : ""}`);
            }
            return { output: lines.join("\n"), exitCode: 0 };
          } else {
            const filtered = entries
              .filter(e => hasA || !e.name.startsWith("."))
              .map(e => (e.node.type === "dir" ? `${e.name}/` : e.name));
            return { output: filtered.join("  "), exitCode: 0 };
          }
        } catch (err) {
          return { output: err.message, exitCode: 1 };
        }
      }

      case "cat": {
        if (args.length === 0) {
          return { output: stdin || "", exitCode: 0 };
        }
        try {
          const outputs = args.map(f => this.vfs.readFile(f));
          return { output: outputs.join("\n"), exitCode: 0 };
        } catch (err) {
          return { output: err.message, exitCode: 1 };
        }
      }

      case "head": {
        let n = 10;
        let fileIndex = 0;
        if (args[0]?.startsWith("-n") || (args[0] === "-n" && args[1])) {
          n = parseInt(args[0].replace("-n", "") || args[1], 10) || 10;
          fileIndex = args[0] === "-n" ? 2 : 1;
        } else if (args[0]?.startsWith("-") && !isNaN(parseInt(args[0].slice(1), 10))) {
          n = parseInt(args[0].slice(1), 10);
          fileIndex = 1;
        }

        const targetFile = args[fileIndex];
        const content = targetFile ? this.vfs.readFile(targetFile) : stdin;
        const lines = content.split("\n").slice(0, n);
        return { output: lines.join("\n"), exitCode: 0 };
      }

      case "tail": {
        let n = 10;
        let fileIndex = 0;
        if (args[0]?.startsWith("-n") || (args[0] === "-n" && args[1])) {
          n = parseInt(args[0].replace("-n", "") || args[1], 10) || 10;
          fileIndex = args[0] === "-n" ? 2 : 1;
        } else if (args[0]?.startsWith("-") && !isNaN(parseInt(args[0].slice(1), 10))) {
          n = parseInt(args[0].slice(1), 10);
          fileIndex = 1;
        }

        const targetFile = args[fileIndex];
        const content = targetFile ? this.vfs.readFile(targetFile) : stdin;
        const allLines = content.split("\n");
        const lines = allLines.slice(Math.max(0, allLines.length - n));
        return { output: lines.join("\n"), exitCode: 0 };
      }

      case "mkdir": {
        const isP = args.includes("-p");
        const target = args.find(a => !a.startsWith("-"));
        if (!target) return { output: "mkdir: missing operand", exitCode: 1 };
        try {
          this.vfs.mkdir(target, isP);
          return { output: "", exitCode: 0 };
        } catch (err) {
          return { output: err.message, exitCode: 1 };
        }
      }

      case "touch": {
        const target = args[0];
        if (!target) return { output: "touch: missing file operand", exitCode: 1 };
        try {
          if (!this.vfs.exists(target)) {
            this.vfs.writeFile(target, "");
          }
          return { output: "", exitCode: 0 };
        } catch (err) {
          return { output: `touch: ${err.message}`, exitCode: 1 };
        }
      }

      case "rm": {
        const isR = args.some(a => a.startsWith("-") && (a.includes("r") || a.includes("R")));
        const isF = args.some(a => a.startsWith("-") && a.includes("f"));
        const target = args.find(a => !a.startsWith("-"));
        if (!target) return { output: "rm: missing operand", exitCode: 1 };
        try {
          this.vfs.remove(target, isR);
          return { output: "", exitCode: 0 };
        } catch (err) {
          if (isF) return { output: "", exitCode: 0 };
          return { output: err.message, exitCode: 1 };
        }
      }

      case "grep": {
        const isI = args.some(a => a.startsWith("-") && a.includes("i"));
        const isV = args.some(a => a.startsWith("-") && a.includes("v"));
        const isN = args.some(a => a.startsWith("-") && a.includes("n"));
        const nonFlagArgs = args.filter(a => !a.startsWith("-"));
        const pattern = nonFlagArgs[0];
        const targetFile = nonFlagArgs[1];

        if (!pattern) return { output: "grep: missing pattern", exitCode: 2 };

        let content = stdin;
        if (targetFile) {
          try {
            content = this.vfs.readFile(targetFile);
          } catch (err) {
            return { output: err.message, exitCode: 2 };
          }
        }

        const lines = content.split("\n");
        const re = new RegExp(pattern, isI ? "i" : "");
        const matched = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const hasMatch = re.test(line);
          const keep = isV ? !hasMatch : hasMatch;
          if (keep) {
            matched.push(isN ? `${i + 1}:${line}` : line);
          }
        }

        return {
          output: matched.join("\n"),
          exitCode: matched.length > 0 ? 0 : 1
        };
      }

      case "wc": {
        const isL = args.includes("-l");
        const target = args.find(a => !a.startsWith("-"));
        const content = target ? this.vfs.readFile(target) : stdin;
        const lineCount = content ? content.trim().split("\n").length : 0;
        if (isL) {
          return { output: String(lineCount), exitCode: 0 };
        }
        const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;
        const byteCount = content.length;
        return { output: `  ${lineCount}  ${wordCount}  ${byteCount}`, exitCode: 0 };
      }

      case "sort": {
        const lines = (stdin || "").split("\n").filter(Boolean);
        lines.sort();
        return { output: lines.join("\n"), exitCode: 0 };
      }

      case "ps": {
        const isAux = args.includes("aux") || args.includes("-ef") || args.some(a => a.includes("aux"));
        if (isAux) {
          const lines = [
            "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND"
          ];
          for (const p of this.processes) {
            lines.push(
              `${p.user.padEnd(8, " ")} ${String(p.pid).padStart(5, " ")} ${p.cpu.toFixed(1).padStart(4, " ")} ${p.mem.toFixed(1).padStart(4, " ")}  104820  14200 ?        ${p.stat.padEnd(4, " ")} 08:00   ${p.time.padStart(4, " ")} ${p.comm}`
            );
          }
          return { output: lines.join("\n"), exitCode: 0 };
        }
        return {
          output: "  PID TTY          TIME CMD\n 1420 pts/0    00:00:01 bash\n 5042 pts/0    00:00:00 ps",
          exitCode: 0
        };
      }

      case "top":
      case "htop": {
        return {
          output: `[HTOP MODE] Interactive system monitor initialized.\nTasks: 42 total, 1 running, 41 sleeping, 2 zombie\n%Cpu(s):  6.4 us,  2.1 sy,  0.0 ni, 91.2 id,  0.3 wa\nMiB Mem :  16000.2 total,   8210.4 free,   3412.0 used,   4377.8 buff/cache\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1420 engineer  20   0  142820  42800  12400 S   4.8   2.4   1:42.10 moonsav-ingest\n 1104 emqx      20   0  210400  64100  18200 S   1.2   4.8   0:42.15 emqx\n 1205 postgres  20   0  340100  84200  24000 S   0.8   5.2   0:38.20 postgres\n 1308 redis     20   0   84200  16200   8400 S   0.4   1.8   0:12.40 redis-server\n 2840 engineer  20   0       0      0      0 Z   0.0   0.0   0:00.00 leak_proc <defunct>`,
          exitCode: 0
        };
      }

      case "kill": {
        const sig = args.find(a => a.startsWith("-")) || "-15";
        const pidStr = args.find(a => !a.startsWith("-"));
        const pid = parseInt(pidStr, 10);
        if (!pid) return { output: "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...", exitCode: 1 };

        const procIndex = this.processes.findIndex(p => p.pid === pid);
        if (procIndex === -1) {
          return { output: `bash: kill: (${pid}) - No such process`, exitCode: 1 };
        }

        // Remove defunct child zombies if parent or zombie terminated
        if (pid === 1420 || sig === "-9" || sig === "-15") {
          this.processes = this.processes.filter(p => p.pid !== pid && p.ppid !== pid);
        } else {
          this.processes.splice(procIndex, 1);
        }
        return { output: "", exitCode: 0 };
      }

      case "pgrep": {
        const pattern = args.find(a => !a.startsWith("-"));
        if (!pattern) return { output: "", exitCode: 1 };
        const matches = this.processes.filter(p => p.comm.includes(pattern));
        if (matches.length > 0) {
          return { output: matches.map(m => m.pid).join("\n"), exitCode: 0 };
        }
        return { output: "", exitCode: 1 };
      }

      case "lsof": {
        const portMatch = args.join(" ").match(/:(\d+)/);
        if (portMatch) {
          const port = portMatch[1];
          return {
            output: `COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nemqx      1104     emqx   18u  IPv4  48201      0t0  TCP *:${port} (LISTEN)`,
            exitCode: 0
          };
        }
        return {
          output: `COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nmoonsav-i 1420 engineer  cwd    DIR    8,1     4096  1042 /home/engineer/workspace\nmoonsav-i 1420 engineer  rtd    DIR    8,1     4096     2 /\nmoonsav-i 1420 engineer  txt    REG    8,1 12480200 48201 /home/engineer/workspace/moonsav-ingest\nmoonsav-i 1420 engineer    0u   CHR  136,0      0t0     3 /dev/pts/0\nmoonsav-i 1420 engineer    1u   CHR  136,0      0t0     3 /dev/pts/0\nmoonsav-i 1420 engineer    3u  IPv4  48204      0t0  TCP localhost:8080 (LISTEN)`,
          exitCode: 0
        };
      }

      case "free": {
        const isM = args.includes("-m");
        const isH = args.includes("-h") || !isM;
        if (isM) {
          return {
            output: "               total        used        free      shared  buff/cache   available\nMem:           16000        3412        8210         180        4377       12120\nSwap:           2048           0        2048",
            exitCode: 0
          };
        }
        return {
          output: "               total        used        free      shared  buff/cache   available\nMem:            15Gi       3.3Gi       8.0Gi       180Mi       4.2Gi        11Gi\nSwap:          2.0Gi          0B       2.0Gi",
          exitCode: 0
        };
      }

      case "df": {
        return {
          output: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/root        48G   12G   34G  27% /\ntmpfs           7.8G     0  7.8G   0% /dev/shm\ntmpfs           3.1G  1.2M  3.1G   1% /run\n/dev/sda1       100M  6.2M   94M   7% /boot/efi",
          exitCode: 0
        };
      }

      case "uname": {
        const isA = args.includes("-a");
        if (isA) {
          return { output: "Linux moonsav-prod-node-01 6.5.0-28-generic #29-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux", exitCode: 0 };
        }
        return { output: "Linux", exitCode: 0 };
      }

      case "ss":
      case "netstat": {
        const lines = [
          "State    Recv-Q Send-Q   Local Address:Port   Peer Address:Port  Process"
        ];
        for (const s of this.sockets) {
          lines.push(
            `${s.state.padEnd(8, " ")} ${String(s.recvQ).padStart(6, " ")} ${String(s.sendQ).padStart(6, " ")} ${s.local.padStart(20, " ")} ${s.peer.padStart(18, " ")} users:(("${s.prog}",pid=${s.pid},fd=3))`
          );
        }
        return { output: lines.join("\n"), exitCode: 0 };
      }

      case "systemctl": {
        const action = args[0] || "status";
        const svc = (args[1] || "").replace(".service", "") || "moonsav-telemetry";

        if (action === "status") {
          const service = this.services[svc] || { status: "active (running)", load: "loaded", pid: 1420, memory: "42.8M", tasks: 8 };
          return {
            output: `● ${svc}.service - MOONSAV Platform Component\n     Loaded: ${service.load} (/etc/systemd/system/${svc}.service; enabled; vendor preset: enabled)\n     Active: ${service.status} since Mon 2026-08-14 08:14:02 UTC; 2h ago\n   Main PID: ${service.pid} (${svc})\n      Tasks: ${service.tasks} (limit: 4665)\n     Memory: ${service.memory} (limit: 256.0M)\n        CPU: 1.42s`,
            exitCode: 0
          };
        }

        if (action === "restart" || action === "start") {
          if (this.services[svc]) {
            this.services[svc].status = "active (running)";
            this.services[svc].pid = Math.floor(Math.random() * 2000) + 1000;
          }
          return { output: "", exitCode: 0 };
        }

        if (action === "stop") {
          if (this.services[svc]) {
            this.services[svc].status = "inactive (dead)";
          }
          return { output: "", exitCode: 0 };
        }

        return { output: `systemctl: command executed for ${svc}`, exitCode: 0 };
      }

      case "journalctl": {
        return {
          output: `-- Logs begin at Mon 2026-08-14 08:00:00 UTC, end at Mon 2026-08-14 12:04:00 UTC. --\nAug 14 11:58:02 moonsav-prod systemd[1]: Starting MOONSAV Ingestion Service...\nAug 14 11:58:03 moonsav-prod moonsav-telemetry[1420]: [INFO] Ingestion worker pool initialized with 16 goroutines\nAug 14 11:58:04 moonsav-prod moonsav-telemetry[1420]: [INFO] MQTT client connected to tcp://127.0.0.1:1883\nAug 14 11:58:05 moonsav-prod moonsav-telemetry[1420]: [INFO] HTTP Health probe listening on :8080\nAug 14 12:00:01 moonsav-prod moonsav-telemetry[1420]: [DEBUG] Flushed 4800 records to TimescaleDB in 3.8ms`,
          exitCode: 0
        };
      }

      case "curl": {
        const url = args.find(a => !a.startsWith("-")) || "";
        const isI = args.includes("-I") || args.includes("-i");
        const isHealth = url.includes("health") || url.includes(":8080") || url.includes(":80");
        const isMetrics = url.includes("metrics") || url.includes(":9090");

        if (isHealth) {
          if (isI) {
            return {
              output: "HTTP/1.1 200 OK\nDate: Mon, 14 Aug 2026 12:04:02 GMT\nContent-Type: application/json\nContent-Length: 104\nConnection: keep-alive",
              exitCode: 0
            };
          }
          return {
            output: JSON.stringify({
              status: "UP",
              healthy: true,
              database: "CONNECTED",
              redis: "CONNECTED",
              mqtt: "CONNECTED",
              uptimeSeconds: 14205,
              version: "2.4.0"
            }, null, 2),
            exitCode: 0
          };
        }

        if (isMetrics) {
          return {
            output: `# HELP moonsav_motor_commands_total Total number of pump motor commands processed
# TYPE moonsav_motor_commands_total counter
moonsav_motor_commands_total{action="start",status="success"} 48210
moonsav_motor_commands_total{action="stop",status="success"} 48190
moonsav_motor_commands_total{action="start",status="failure"} 12
# HELP moonsav_http_request_duration_seconds HTTP request latency histogram
# TYPE moonsav_http_request_duration_seconds histogram
moonsav_http_request_duration_seconds_bucket{le="0.005"} 41200
moonsav_http_request_duration_seconds_bucket{le="0.01"} 48100
moonsav_http_request_duration_seconds_bucket{le="0.025"} 48200
moonsav_http_request_duration_seconds_bucket{le="+Inf"} 48210
moonsav_http_request_duration_seconds_sum 124.52
moonsav_http_request_duration_seconds_count 48210`,
            exitCode: 0
          };
        }

        return {
          output: `<!DOCTYPE html><html><head><title>MOONSAV Gateway</title></head><body><h1>200 OK</h1></body></html>`,
          exitCode: 0
        };
      }

      case "docker": {
        const sub = args[0] || "ps";
        if (sub === "ps") {
          return {
            output: "CONTAINER ID   IMAGE                          STATUS                   PORTS                    NAMES\n8f2a1b9c3d4e   moonsav/device-simulator:v1    Up 42 minutes            0.0.0.0:48201->48201/tcp moonsav-device-sim\n3d8f1a2c9e0b   emqx/emqx:5.4-alpine           Up 42 minutes (healthy)  0.0.0.0:1883->1883/tcp   moonsav-mqtt-broker\n4e9c2a1b8f3d   moonsav/telemetry-svc:v2       Up 42 minutes (healthy)  0.0.0.0:8080->8080/tcp   moonsav-telemetry\n7c1a9e2d3b4f   postgres:16-timescale          Up 42 minutes (healthy)  0.0.0.0:5432->5432/tcp   moonsav-postgres\n1a2b3c4d5e6f   redis:7.2-alpine               Up 42 minutes (healthy)  0.0.0.0:6379->6379/tcp   moonsav-redis",
            exitCode: 0
          };
        }
        if (sub === "stats") {
          return {
            output: "CONTAINER ID   NAME                  CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O         PIDS\n8f2a1b9c3d4e   moonsav-device-sim    0.85%     24.12MiB / 15.62GiB   0.15%     4.2MB / 1.8MB     0B / 12KB         6\n3d8f1a2c9e0b   moonsav-mqtt-broker   1.42%     64.20MiB / 15.62GiB   0.40%     18.4MB / 14.2MB   1.2MB / 4.8MB     18\n4e9c2a1b8f3d   moonsav-telemetry     2.10%     42.80MiB / 15.62GiB   0.27%     14.8MB / 12.1MB   0B / 28KB         12\n7c1a9e2d3b4f   moonsav-postgres      0.95%     84.10MiB / 15.62GiB   0.53%     8.4MB / 12.0MB    14.2MB / 42.0MB   16\n1a2b3c4d5e6f   moonsav-redis         0.30%     16.20MiB / 15.62GiB   0.10%     6.1MB / 5.8MB     0B / 8KB          4",
            exitCode: 0
          };
        }
        if (sub === "logs") {
          const target = args[1] || "moonsav-mqtt-broker";
          return {
            output: `2026-08-14T11:42:01.104Z [notice] Client PUMP-01 connected from 192.168.1.105:48201
2026-08-14T11:42:01.105Z [notice] Client PUMP-01 subscribed topic 'moonsav/+/commands' QoS=1
2026-08-14T11:42:02.108Z [debug] Packet published topic 'moonsav/PUMP-01/telemetry' payload=142B
2026-08-14T11:42:03.110Z [debug] Ingestion subscriber acknowledged telemetry batch offset=48201`,
            exitCode: 0
          };
        }
        if (sub === "compose") {
          return {
            output: "NAME                  IMAGE                         COMMAND                  SERVICE         CREATED          STATUS                    PORTS\nmoonsav-device-sim    moonsav/device-simulator:v1   \"python sim.py\"          device-sim      42 minutes ago   Up 42 minutes             0.0.0.0:48201->48201/tcp\nmoonsav-mqtt-broker   emqx/emqx:5.4-alpine          \"/opt/emqx/bin/emqx …\"   mqtt-broker     42 minutes ago   Up 42 minutes (healthy)   0.0.0.0:1883->1883/tcp\nmoonsav-telemetry     moonsav-telemetry             \"/moonsav-ingest\"        telemetry-svc   42 minutes ago   Up 42 minutes (healthy)   0.0.0.0:8080->8080/tcp",
            exitCode: 0
          };
        }
        return { output: `Docker command '${args.join(" ")}' completed successfully.`, exitCode: 0 };
      }

      case "kubectl": {
        const sub = args[0] || "get";
        const resource = args[1] || "pods";

        if (sub === "get" && (resource === "pods" || resource === "pod")) {
          return {
            output: "NAME                                READY   STATUS    RESTARTS   AGE\nmoonsav-telemetry-7d9f8c6b4d-2xk9p  1/1     Running   0          4d2h\nmoonsav-telemetry-7d9f8c6b4d-9mzq2  1/1     Running   0          4d2h\nmoonsav-telemetry-7d9f8c6b4d-l4v8k  1/1     Running   0          4d2h\nmoonsav-motor-5f8b9d6c7e-jv7lh      1/1     Running   0          4d2h\nmoonsav-mqtt-0                      1/1     Running   0          14d\nmoonsav-postgres-0                  1/1     Running   0          14d",
            exitCode: 0
          };
        }

        if (sub === "get" && (resource === "nodes" || resource === "node")) {
          return {
            output: "NAME             STATUS   ROLES           AGE   VERSION\nmoonsav-node-01  Ready    control-plane   28d   v1.29.2\nmoonsav-node-02  Ready    worker          28d   v1.29.2\nmoonsav-node-03  Ready    worker          28d   v1.29.2",
            exitCode: 0
          };
        }

        if (sub === "get" && (resource === "svc" || resource === "services")) {
          return {
            output: "NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE\nkubernetes              ClusterIP   10.96.0.1       <none>        443/TCP             28d\nmoonsav-telemetry-svc   ClusterIP   10.104.142.18   <none>        80/TCP,1883/TCP     14d\nmoonsav-postgres-svc    ClusterIP   10.108.82.10    <none>        5432/TCP            14d",
            exitCode: 0
          };
        }

        if (sub === "describe") {
          return {
            output: `Name:             moonsav-telemetry-7d9f8c6b4d-2xk9p
Namespace:        production
Priority:         0
Node:             moonsav-node-02/10.0.0.12
Start Time:       Mon, 10 Aug 2026 14:20:00 UTC
Labels:           app=moonsav-telemetry
                  pod-template-hash=7d9f8c6b4d
Status:           Running
IP:               10.244.2.48
Containers:
  telemetry:
    Container ID:   containerd://8f2a1b9c3d4e
    Image:          moonsav/telemetry-svc:v2.4.0
    Port:           8080/TCP, 1883/TCP
    State:          Running
      Started:      Mon, 10 Aug 2026 14:20:02 UTC
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  256Mi
    Requests:
      cpu:     100m
      memory:  128Mi
Conditions:
  Type              Status
  Initialized       True
  Ready             True
  ContainersReady   True
  PodScheduled      True`,
            exitCode: 0
          };
        }

        return { output: `kubectl ${args.join(" ")} executed successfully.`, exitCode: 0 };
      }

      case "git": {
        const sub = args[0] || "status";
        if (sub === "status") {
          return {
            output: "On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  (use \"git add <file>...\" to update what will be committed)\n\tmodified:   config/safety.json\n\nno changes added to commit (use \"git add\")",
            exitCode: 0
          };
        }
        if (sub === "log") {
          return {
            output: `commit 4f8e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f (HEAD -> main, origin/main)
Author: SRE Engineer <engineer@moonsav.internal>
Date:   Mon Aug 14 09:30:00 2026 +0000

    feat(sre): enforce dry-run safety cutoff and multi-window SLO alerting

commit 9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b
Author: Platform Team <platform@moonsav.internal>
Date:   Mon Aug 14 08:15:00 2026 +0000

    chore: configure distroless container builds and trivy scan gates`,
            exitCode: 0
          };
        }
        if (sub === "diff") {
          return {
            output: `diff --git a/config/safety.json b/config/safety.json
index 84a20b1..4f8e1a2 100644
--- a/config/safety.json
+++ b/config/safety.json
@@ -6,3 +6,3 @@
-  "dryRunWatchdogSeconds": 10,
+  "dryRunWatchdogSeconds": 3,
-  "interlockKillMode": "none"
+  "interlockKillMode": "mixed"`,
            exitCode: 0
          };
        }
        return { output: `[git] ${args.join(" ")} complete.`, exitCode: 0 };
      }

      case "moonsav": {
        const sub1 = args[0] || "status";
        const sub2 = args[1] || "";

        if (sub1 === "device" && (sub2 === "status" || sub2 === "")) {
          return {
            output: `========================================
MOONSAV SMART WATER CONTROLLER (PUMP-01)
========================================
STATE:            PUMP_ONLINE_NORMAL
RPM:              2,840
WATER FLOW:       12.4 Liters/Minute
TANK LEVEL:       72.4% (Overhead)
TEMPERATURE:      48.2 °C (Safe < 70°C)
CURRENT DRAW:     8.4 A (Nominal)
MQTT HEARTBEAT:   CONNECTED (0.8s ago)
DRY-RUN CUTOFF:   ARMED & ACTIVE
========================================`,
            exitCode: 0
          };
        }

        if (sub1 === "device" && sub2 === "simulate") {
          return {
            output: `[SIMULATOR] Injecting synthetic sensor parameters...\n[SIMULATOR] Published updated telemetry to MQTT topic 'moonsav/PUMP-01/telemetry'\n[SIMULATOR] Status: Packet accepted by EMQX broker (QoS 1).`,
            exitCode: 0
          };
        }

        return {
          output: `MOONSAV Platform CLI v2.4.0\nUsage: moonsav [device|motor|telemetry|incident|status] <command>`,
          exitCode: 0
        };
      }

      case "ping": {
        const host = args.find(a => !a.startsWith("-")) || "127.0.0.1";
        return {
          output: `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.038 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.041 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.039 ms
64 bytes from ${host}: icmp_seq=4 ttl=64 time=0.040 ms

--- ${host} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3064ms
rtt min/avg/max/mdev = 0.038/0.039/0.041/0.002 ms`,
          exitCode: 0
        };
      }

      case "dig": {
        const domain = args.find(a => !a.startsWith("-")) || "payment.internal.svc";
        return {
          output: `; <<>> DiG 9.18.18-0ubuntu0.22.04.1-Ubuntu <<>> ${domain}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 48201
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; ANSWER SECTION:
${domain}.		30	IN	A	10.0.4.15

;; Query time: 1 msec
;; SERVER: 127.0.0.53#53(127.0.0.53) (UDP)
;; WHEN: Mon Aug 14 12:04:02 UTC 2026
;; MSG SIZE  rcvd: 64`,
          exitCode: 0
        };
      }

      case "nslookup": {
        const domain = args[0] || "localhost";
        return {
          output: `Server:\t\t127.0.0.53\nAddress:\t127.0.0.53#53\n\nNon-authoritative answer:\nName:\t${domain}\nAddress: 127.0.0.1`,
          exitCode: 0
        };
      }

      case "nc": {
        return {
          output: `Connection to localhost (127.0.0.1) 1883 port [tcp/mqtt] succeeded!`,
          exitCode: 0
        };
      }

      case "tcpdump": {
        return {
          output: `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
12:04:01.104210 IP 192.168.1.105.48201 > 10.0.0.12.1883: Flags [P.], seq 1:143, ack 1, win 502, length 142
12:04:01.104250 IP 10.0.0.12.1883 > 192.168.1.105.48201: Flags [.], ack 143, win 501, length 0
12:04:02.105412 IP 192.168.1.105.48201 > 10.0.0.12.1883: Flags [P.], seq 143:285, ack 1, win 502, length 142
3 packets captured\n3 packets received by filter\n0 packets dropped by kernel`,
          exitCode: 0
        };
      }

      case "terraform": {
        return {
          output: `Acquiring state lock. This may take a few moments...
Terraform used the selected providers to generate the following execution plan:

No changes. Your infrastructure matches the configuration.

Terraform has compared your real infrastructure against your configuration and found no differences.`,
          exitCode: 0
        };
      }

      case "vault": {
        return {
          output: `Key                Value
---                -----
lease_id           database/creds/moonsav-app/8f2a1b9c
lease_duration     1h
lease_renewable    true
password           A1b-9f2K-48dE-x9mz
username           v-app-moonsav-1420`,
          exitCode: 0
        };
      }

      case "gitleaks": {
        return {
          output: `    ○
    │╲
    │ ○
    ○  새
    SCAN COMPLETED: 0 leaks found across 48 commits. Clean scan.`,
          exitCode: 0
        };
      }

      default:
        // Check if executable file in VFS exists
        try {
          if (this.vfs.exists(cmd)) {
            const content = this.vfs.readFile(cmd);
            return {
              output: `[EXECUTING SCRIPT: ${cmd}]\n${content.slice(0, 300)}...`,
              exitCode: 0
            };
          }
        } catch {
          // ignore
        }

        return {
          output: `bash: ${cmd}: command not found`,
          exitCode: 127
        };
    }
  }

  // Generate dynamic Tab auto-completions
  getCompletions(currentInput) {
    const tokens = currentInput.split(" ");
    const lastToken = tokens[tokens.length - 1] || "";

    const COMMAND_LIST = [
      "docker ps", "docker stats --no-stream", "docker logs moonsav-mqtt-broker", "docker compose ps", "docker compose up -d",
      "kubectl get pods -A", "kubectl get nodes", "kubectl get svc", "kubectl describe pod", "kubectl logs",
      "systemctl status moonsav-telemetry", "systemctl status mosquitto", "systemctl restart mosquitto", "systemctl restart moonsav-telemetry",
      "journalctl -u moonsav-telemetry -n 20",
      "moonsav device status", "moonsav device simulate", "moonsav status",
      "curl -s http://localhost:8080/health", "curl -s http://localhost:9090/metrics",
      "ps aux --sort=-%cpu", "kill -15 1420", "kill -9", "pgrep", "lsof -i :1883", "ss -tulpn", "ss -t -i",
      "nano config/safety.json", "nano config/mosquitto.conf", "nano Dockerfile", "vim config/safety.json",
      "cat Dockerfile", "cat config/safety.json", "cat config/mosquitto.conf", "cat main.go",
      "ls -la", "pwd", "cd config", "cd k8s", "cd scripts", "cd ..", "cd ~", "clear", "htop", "top", "free -h", "df -h",
      "git status", "git log", "git diff", "terraform plan", "gitleaks detect", "vault read"
    ];

    if (tokens.length === 1) {
      return COMMAND_LIST.filter(c => c.startsWith(lastToken));
    }

    // Auto-complete files/directories in CWD
    try {
      const dirEntries = this.vfs.listDir(".");
      const fileMatches = dirEntries
        .map(e => (e.node.type === "dir" ? `${e.name}/` : e.name))
        .filter(n => n.toLowerCase().startsWith(lastToken.toLowerCase()));

      if (fileMatches.length > 0) {
        const prefix = tokens.slice(0, -1).join(" ") + " ";
        return fileMatches.map(f => prefix + f);
      }
    } catch {
      // ignore
    }

    return COMMAND_LIST.filter(c => c.toLowerCase().startsWith(currentInput.toLowerCase()));
  }
}
