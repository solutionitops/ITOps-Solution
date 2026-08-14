import { useState, useRef, useEffect } from "react";
import { runSimulationCommand } from "../data/itopsAcademyCourses";

const AUTOCOMPLETE_COMMANDS = [
  "docker ps",
  "docker logs -f moonsav-mqtt-broker",
  "docker stats --no-stream",
  "docker compose ps",
  "kubectl get pods",
  "kubectl describe pod moonsav-telemetry",
  "kubectl logs -l app=order-worker",
  "systemctl status moonsav-motor",
  "systemctl restart mosquitto",
  "moonsav device status --id PUMP-01",
  "moonsav device simulate --tank-level 5",
  "curl -s http://localhost:8080/health",
  "curl -s http://localhost:9090/metrics",
  "ps aux --sort=-%cpu | head -5",
  "ss -tulpn | grep 1883",
  "terraform plan",
  "gitleaks detect --verbose",
  "vault read database/creds/moonsav-app",
  "clear"
];

export function LabTerminal({
  labId = "lab-fnd-001",
  projectId = "moonsav",
  envId = "LAB-1042-023",
  initialCommands = [],
  className = ""
}) {
  const [backendMode, setBackendMode] = useState("simulation"); // 'simulation' | 'reallab'
  const [history, setHistory] = useState(() => {
    if (initialCommands && initialCommands.length > 0) {
      return initialCommands.map((ic) => ({
        command: ic.command,
        output: ic.output,
        timestamp: new Date().toLocaleTimeString()
      }));
    }
    return [
      {
        command: "moonsav device status --id PUMP-01",
        output: runSimulationCommand("moonsav device status --id PUMP-01", labId, projectId).output,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
  });

  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleExecute = async (cmdToRun) => {
    const cmd = (cmdToRun || inputVal).trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === "clear") {
      setHistory([]);
      setInputVal("");
      setHistoryIndex(-1);
      return;
    }

    setIsExecuting(true);
    let outputText = "";
    let exitCode = 0;

    if (backendMode === "simulation") {
      const simRes = runSimulationCommand(cmd, labId, projectId);
      outputText = simRes.output;
      exitCode = simRes.exitCode;
    } else {
      // Real Lab Backend Execution
      try {
        const resp = await fetch(`http://localhost:8090/api/labs/${envId}/exec`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd })
        });
        if (resp.ok) {
          const data = await resp.json();
          outputText = data.stdout || data.stderr || `[RealLab] Command completed (exit code ${data.exitCode})`;
          exitCode = data.exitCode;
        } else {
          outputText = `[RealLab Daemon: Connection Refused on http://localhost:8090]\nFallback: Executing via Simulation Engine:\n${runSimulationCommand(cmd, labId, projectId).output}`;
        }
      } catch (err) {
        outputText = `[RealLab Daemon offline at localhost:8090]\nRunning in Tier 1 Simulation Mode:\n${runSimulationCommand(cmd, labId, projectId).output}`;
      }
    }

    setIsExecuting(false);

    setHistory((prev) => [
      ...prev,
      {
        command: cmd,
        output: outputText,
        exitCode,
        backend: backendMode,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    setCmdHistory((prev) => [cmd, ...prev]);
    setInputVal("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleExecute();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex < cmdHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIdx = historyIndex - 1;
        setHistoryIndex(prevIdx);
        setInputVal(cmdHistory[prevIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = AUTOCOMPLETE_COMMANDS.find((c) =>
        c.toLowerCase().startsWith(inputVal.toLowerCase())
      );
      if (match) setInputVal(match);
    }
  };

  const copyTerminalOutput = () => {
    const text = history.map((h) => `$ ${h.command}\n${h.output}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-950/90 shadow-2xl overflow-hidden font-mono flex flex-col ${className}`}>
      {/* Terminal Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/90 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="font-bold text-white/80 ml-2">
            moonsav-lab-terminal
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            [{envId}]
          </span>
        </div>

        {/* Explicit Visible Mode Badges */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-black/60 p-0.5 border border-white/15 text-[10px]">
            <button
              type="button"
              onClick={() => setBackendMode("simulation")}
              className={`rounded px-2.5 py-1 font-bold flex items-center gap-1 transition-colors ${
                backendMode === "simulation"
                  ? "bg-amber-400 text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>🟡</span> SIMULATION (Tier 1)
            </button>
            <button
              type="button"
              onClick={() => setBackendMode("reallab")}
              className={`rounded px-2.5 py-1 font-bold flex items-center gap-1 transition-colors ${
                backendMode === "reallab"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
              title="Real Docker Lab Orchestrator (Port 8090)"
            >
              <span>🟢</span> REAL LAB (Tier 2: Docker)
            </button>
          </div>

          <button
            type="button"
            onClick={copyTerminalOutput}
            className="text-[11px] text-white/50 hover:text-white transition-colors"
            title="Copy terminal session"
          >
            {copied ? "✔ Copied" : "📋 Copy"}
          </button>
          <button
            type="button"
            onClick={() => setHistory([])}
            className="text-[11px] text-white/50 hover:text-white transition-colors"
            title="Clear terminal screen"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Screen Body */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="p-4 flex-1 min-h-[300px] max-h-[440px] overflow-y-auto space-y-4 text-xs bg-black/60 cursor-text"
      >
        {/* Terminal MOTD */}
        <div className="text-white/40 text-[11px] leading-relaxed border-b border-white/5 pb-2 flex items-center justify-between">
          <div>
            MOONSAV ITOps Lab Orchestrator (v2.5.0) • Connected to: <span className="text-cyan-300 font-bold">{envId}</span> ({projectId})
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            backendMode === 'reallab' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
          }`}>
            {backendMode === 'reallab' ? '🟢 REAL LAB (DOCKER COMPOSE)' : '🟡 BROWSER SIMULATION'}
          </span>
        </div>

        {/* Command History Stream */}
        {history.map((entry, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="text-emerald-400 font-bold">moonsav-engineer@lab:~$</span>
              <span className="font-semibold text-white">{entry.command}</span>
              <span className="text-[10px] text-white/30 ml-auto">{entry.timestamp}</span>
            </div>
            {entry.output && (
              <pre className="text-white/80 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-cyan-500/30 text-[11.5px] py-1 font-mono">
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        {/* Live Input Line */}
        <div className="flex items-center gap-2 text-cyan-400 pt-1">
          <span className="text-emerald-400 font-bold shrink-0">moonsav-engineer@lab:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder={isExecuting ? "Executing command..." : "Type command (e.g. docker ps, docker stats, docker logs)..."}
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-white/20"
            autoFocus
          />
        </div>
        <div ref={terminalEndRef} />
      </div>

      {/* Command Suggestion Quick Chips */}
      <div className="border-t border-white/10 bg-slate-900/60 p-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-white/40 uppercase font-semibold mr-1">Quick Exec:</span>
        {[
          "docker ps",
          "docker stats --no-stream",
          "docker logs moonsav-mqtt-broker",
          "moonsav device status",
          "curl -s localhost:8080/health",
          "kubectl get pods"
        ].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleExecute(cmd)}
            className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-white/70 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
