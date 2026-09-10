import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ShellSession } from "../lib/terminalEngine";

export function LabTerminal({
  labId = "lab-fnd-001",
  projectId = "moonsav",
  envId = "LAB-1042-023",
  initialCommands = [],
  className = ""
}) {
  const [shellSession, setShellSession] = useState(() => new ShellSession({ projectId, labId }));
  const [backendMode, setBackendMode] = useState("simulation"); // 'simulation' | 'reallab'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState("text-xs"); // 'text-[11px]' | 'text-xs' | 'text-sm'
  const [copied, setCopied] = useState(false);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [tabs, setTabs] = useState(() => {
    const session = new ShellSession({ projectId, labId });
    if (initialCommands && initialCommands.length > 0) {
      return [
        {
          id: "tab-1",
          title: "bash (workspace)",
          history: initialCommands.map(ic => ({
            prompt: "engineer@moonsav-prod:~/workspace$",
            command: ic.command,
            output: ic.output,
            exitCode: 0,
            timestamp: new Date().toLocaleTimeString()
          }))
        }
      ];
    }
    const welcomeResult = session.execute("moonsav device status --id PUMP-01");
    return [
      {
        id: "tab-1",
        title: "bash (workspace)",
        history: [
          {
            prompt: "engineer@moonsav-prod:~/workspace$",
            command: "moonsav device status --id PUMP-01",
            output: welcomeResult.output,
            exitCode: 0,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      }
    ];
  });
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExitCode, setLastExitCode] = useState(0);

  // In-terminal Nano editor state
  const [editingFile, setEditingFile] = useState(null); // { path, content, originalContent }
  // In-terminal Htop state
  const [isHtopActive, setIsHtopActive] = useState(false);

  const terminalContainerRef = useRef(null);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize when labId or projectId changes
  useEffect(() => {
    const newSession = new ShellSession({ projectId, labId });
    setShellSession(newSession);

    let initialHistory = [];
    if (initialCommands && initialCommands.length > 0) {
      initialHistory = initialCommands.map(ic => ({
        prompt: "engineer@moonsav-prod:~/workspace$",
        command: ic.command,
        output: ic.output,
        exitCode: 0,
        timestamp: new Date().toLocaleTimeString()
      }));
    } else {
      const welcomeResult = newSession.execute("moonsav device status --id PUMP-01");
      initialHistory = [
        {
          prompt: "engineer@moonsav-prod:~/workspace$",
          command: "moonsav device status --id PUMP-01",
          output: welcomeResult.output,
          exitCode: 0,
          timestamp: new Date().toLocaleTimeString()
        }
      ];
    }

    setTabs([{ id: "tab-1", title: "bash (workspace)", history: initialHistory }]);
    setActiveTabId("tab-1");
    setEditingFile(null);
    setIsHtopActive(false);
    setInputVal("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labId, projectId]);

  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Scroll ONLY the terminal buffer internally without scrolling the entire browser window
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [activeTab?.history, isHtopActive, editingFile]);

  // Execute command pipeline
  const handleExecute = useCallback(async (cmdToRun) => {
    const raw = (cmdToRun || inputVal).trim();
    if (!raw) return;

    // Intercept 'nano' or 'vim' commands
    if (raw.startsWith("nano ") || raw.startsWith("vim ") || raw === "nano" || raw === "vim") {
      const parts = raw.split(" ");
      const filePath = parts[1] || "untitled.txt";
      let content = "";
      try {
        if (shellSession.vfs.exists(filePath)) {
          content = shellSession.vfs.readFile(filePath);
        }
      } catch {
        content = "";
      }
      setEditingFile({ path: filePath, content, originalContent: content });
      setInputVal("");
      return;
    }

    // Intercept 'htop' or 'top'
    if (raw === "htop" || raw === "top") {
      setIsHtopActive(true);
      setInputVal("");
      return;
    }

    if (raw === "clear") {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, history: [] } : t));
      setInputVal("");
      setHistoryIndex(-1);
      return;
    }

    setIsExecuting(true);
    let outputText = "";
    let exitCode = 0;
    const prompt = shellSession.getPrompt();

    if (backendMode === "simulation") {
      const res = shellSession.execute(raw);
      if (res.clear) {
        setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, history: [] } : t));
        setIsExecuting(false);
        setInputVal("");
        setHistoryIndex(-1);
        return;
      }
      outputText = res.output;
      exitCode = res.exitCode;
    } else {
      // Real Lab Backend Execution Bridge (Tier 2: Docker Daemon)
      try {
        const resp = await fetch(`http://localhost:8090/api/labs/${envId}/exec`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: raw })
        });
        if (resp.ok) {
          const data = await resp.json();
          outputText = data.stdout || data.stderr || `[RealLab Docker] Command completed (exit code ${data.exitCode})`;
          exitCode = data.exitCode;
        } else {
          outputText = `[RealLab Daemon: Connection Refused on http://localhost:8090]\nFallback: Executed via In-Memory Shell Engine:\n${shellSession.execute(raw).output}`;
          exitCode = 0;
        }
      } catch {
        outputText = `[RealLab Daemon offline at localhost:8090]\nRunning in Tier 1 Simulation Shell:\n${shellSession.execute(raw).output}`;
        exitCode = 0;
      }
    }

    setIsExecuting(false);
    setLastExitCode(exitCode);

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        return {
          ...t,
          history: [
            ...t.history,
            {
              prompt,
              command: raw,
              output: outputText,
              exitCode,
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        };
      }
      return t;
    }));

    setCmdHistory(prev => [raw, ...prev]);
    setInputVal("");
    setHistoryIndex(-1);
  }, [inputVal, activeTabId, backendMode, envId, shellSession]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
      const completions = shellSession.getCompletions(inputVal);
      if (completions.length === 1) {
        setInputVal(completions[0]);
      } else if (completions.length > 1) {
        // Append completions hint to terminal history
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId) {
            return {
              ...t,
              history: [
                ...t.history,
                {
                  prompt: shellSession.getPrompt(),
                  command: inputVal,
                  output: completions.slice(0, 12).join("    "),
                  exitCode: 0,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]
            };
          }
          return t;
        }));
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, history: [] } : t));
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      if (inputVal) {
        setTabs(prev => prev.map(t => {
          if (t.id === activeTabId) {
            return {
              ...t,
              history: [
                ...t.history,
                {
                  prompt: shellSession.getPrompt(),
                  command: inputVal + "^C",
                  output: "",
                  exitCode: 130,
                  timestamp: new Date().toLocaleTimeString()
                }
              ]
            };
          }
          return t;
        }));
        setInputVal("");
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      setInputVal("");
    }
  };

  // Copy entire terminal session text
  const copyTerminalOutput = () => {
    const text = (activeTab?.history || []).map(h => `${h.prompt} ${h.command}\n${h.output}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Download terminal session log (.txt)
  const downloadSessionLog = () => {
    const text = (activeTab?.history || []).map(h => `${h.prompt} ${h.command}\n${h.output}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moonsav-terminal-${labId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset virtual terminal & VFS
  const handleResetSession = () => {
    shellSession.vfs.reset();
    setShellSession(new ShellSession({ projectId, labId }));
    setTabs([
      {
        id: "tab-1",
        title: "bash (workspace)",
        history: [{
          prompt: "engineer@moonsav-prod:~/workspace$",
          command: "moonsav device status --id PUMP-01",
          output: "Session reset. Reconnected to in-memory Linux virtual file system.",
          exitCode: 0,
          timestamp: new Date().toLocaleTimeString()
        }]
      }
    ]);
    setActiveTabId("tab-1");
    setLastExitCode(0);
  };

  // Save in-terminal Nano editor
  const handleSaveNano = () => {
    if (!editingFile) return;
    try {
      shellSession.vfs.writeFile(editingFile.path, editingFile.content);
      const lineCount = editingFile.content.split("\n").length;
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            history: [
              ...t.history,
              {
                prompt: shellSession.getPrompt(),
                command: `nano ${editingFile.path}`,
                output: `[ Wrote ${lineCount} lines to ${editingFile.path} ]`,
                exitCode: 0,
                timestamp: new Date().toLocaleTimeString()
              }
            ]
          };
        }
        return t;
      }));
    } catch (err) {
      alert(`Failed to save file: ${err.message}`);
    }
    setEditingFile(null);
  };

  // Add new shell tab
  const handleAddTab = () => {
    const newId = `tab-${tabs.length + 1}`;
    setTabs(prev => [
      ...prev,
      { id: newId, title: `bash (${newId})`, history: [] }
    ]);
    setActiveTabId(newId);
  };

  // Close shell tab
  const handleCloseTab = (tabIdToClose, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== tabIdToClose);
    setTabs(remaining);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(remaining[0].id);
    }
  };

  return (
    <div className={`rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden font-mono flex flex-col transition-all duration-300 ${
      isFullscreen
        ? "fixed inset-2 z-50 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] h-[calc(100vh-1rem)]"
        : `${className}`
    }`}>
      
      {/* ─────────────────────────────────────────────────────────────
          TERMINAL TITLEBAR & MULTI-TAB BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-slate-900/95 px-3 py-2 text-xs select-none">
        
        {/* Left: Window Dots & Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex gap-1.5 shrink-0 pr-1">
            <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTabId === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group/tab flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                    isActive
                      ? "bg-slate-950 text-white border border-white/15 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-cyan-400">$</span>
                  <span className="truncate max-w-[120px]">{tab.title}</span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(tab.id, e)}
                      className="opacity-0 group-hover/tab:opacity-100 hover:text-rose-400 p-0.5 text-[10px]"
                      title="Close Tab"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddTab}
              className="px-2 py-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-[11px] font-bold transition-colors"
              title="Open New Terminal Tab"
            >
              +
            </button>
          </div>
        </div>

        {/* Right: Engine Switcher & Utility Actions */}
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="inline-flex rounded-xl bg-black/40 p-0.5 border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setBackendMode("simulation")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                backendMode === "simulation"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Stateful Browser Linux VFS Simulation"
            >
              SIMULATION (VFS)
            </button>
            <button
              type="button"
              onClick={() => setBackendMode("reallab")}
              className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                backendMode === "reallab"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Real Docker Daemon Bridge (:8090)"
            >
              REAL DOCKER LAB
            </button>
          </div>

          {/* Font size toggle */}
          <div className="hidden sm:inline-flex rounded-xl bg-black/30 p-0.5 border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setFontSize("text-[11px]")}
              className={`px-2 py-0.5 rounded font-bold ${fontSize === "text-[11px]" ? "bg-white/20 text-white" : "text-slate-400"}`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize("text-xs")}
              className={`px-2 py-0.5 rounded font-bold ${fontSize === "text-xs" ? "bg-white/20 text-white" : "text-slate-400"}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize("text-sm")}
              className={`px-2 py-0.5 rounded font-bold ${fontSize === "text-sm" ? "bg-white/20 text-white" : "text-slate-400"}`}
            >
              A+
            </button>
          </div>

          {/* Action buttons */}
          <button
            type="button"
            onClick={copyTerminalOutput}
            className="rounded-xl px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 transition-colors"
            title="Copy Terminal Session"
          >
            {copied ? "✔ Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={downloadSessionLog}
            className="rounded-xl px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 border border-white/10 transition-colors hidden md:inline-block"
            title="Download Session Log"
          >
            Log (.txt)
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            className="rounded-xl px-2.5 py-1 bg-white/5 hover:bg-rose-500/20 text-[11px] font-bold text-slate-300 hover:text-rose-300 border border-white/10 transition-colors"
            title="Reset Terminal & VFS State"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-xl p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Workspace"}
          >
            {isFullscreen ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9L4 4m0 0l5 0M4 4l0 5m11 11l5 5m0 0l-5 0m5 0l0-5M9 15l-5 5m0 0l5 0m-5 0l0-5m11-11l5-5m0 0l-5 0m5 0l0 5" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          IN-TERMINAL NANO / VIM FILE EDITOR OVERLAY
         ───────────────────────────────────────────────────────────── */}
      {editingFile ? (
        <div className="flex-1 flex flex-col bg-slate-950 p-4 space-y-3 z-20">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded">GNU nano 6.2</span>
              <span className="text-white font-bold">{editingFile.path}</span>
            </div>
            <span className="text-slate-400 text-[11px]">Modified: {editingFile.content !== editingFile.originalContent ? "Yes" : "No"}</span>
          </div>

          <div className="flex-1 flex gap-2">
            <div className="text-slate-500 select-none text-right pr-2 border-r border-white/10 font-mono text-xs">
              {editingFile.content.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              className="flex-1 bg-transparent text-emerald-300 font-mono text-xs focus:outline-none resize-none leading-relaxed"
              rows={16}
            />
          </div>

          <div className="border-t border-white/10 pt-2 flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded-xl">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-white font-bold"><span className="text-cyan-400">^O</span> WriteOut</span>
              <span className="text-white font-bold"><span className="text-cyan-400">^X</span> Exit</span>
              <span className="text-white font-bold"><span className="text-cyan-400">^K</span> Cut</span>
              <span className="text-white font-bold"><span className="text-cyan-400">^U</span> Paste</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingFile(null)}
                className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 font-bold"
              >
                Cancel (^X)
              </button>
              <button
                type="button"
                onClick={handleSaveNano}
                className="px-4 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
              >
                Save File (^O)
              </button>
            </div>
          </div>
        </div>
      ) : isHtopActive ? (
        /* ─────────────────────────────────────────────────────────────
           IN-TERMINAL HTOP INTERACTIVE PROCESS MONITOR
           ───────────────────────────────────────────────────────────── */
        <div className="flex-1 flex flex-col bg-slate-950 p-4 space-y-4 z-20 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-cyan-400 font-bold text-xs">htop - 12:04:02 up 14 days, 4:12, 1 user, load average: 0.28, 0.42, 0.55</span>
            <button
              type="button"
              onClick={() => setIsHtopActive(false)}
              className="px-3 py-1 rounded bg-red-600 text-white font-bold text-xs hover:bg-red-500"
            >
              Quit (q)
            </button>
          </div>

          {/* Visual ASCII CPU / Memory Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>CPU 1 [||||||||||||||||||||||||||||||||||||              68.4%]</span>
                <span className="text-emerald-400 font-bold">3.80 GHz</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>CPU 2 [||||||||||||||||||||                          42.1%]</span>
                <span className="text-emerald-400 font-bold">3.80 GHz</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>Mem   [||||||||||||||||||||||||||             3.41G/16.0G]</span>
                <span className="text-cyan-400 font-bold">21.3%</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Swp   [                                       0K/2.00G]</span>
                <span className="text-slate-400 font-bold">0.0%</span>
              </div>
            </div>
          </div>

          {/* Process Table */}
          <div className="border border-white/10 rounded-xl overflow-hidden text-xs">
            <div className="bg-cyan-950/60 text-cyan-300 font-bold px-3 py-1.5 flex justify-between">
              <span>PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command</span>
            </div>
            <div className="divide-y divide-white/5 bg-black/40 text-slate-200">
              {[
                { pid: 1420, user: "engineer", pri: 20, ni: 0, virt: "142M", res: "42.8M", shr: "12M", s: "S", cpu: "4.8", mem: "2.4", time: "1:42.10", cmd: "moonsav-ingest --config=config/safety.json" },
                { pid: 1104, user: "emqx", pri: 20, ni: 0, virt: "210M", res: "64.2M", shr: "18M", s: "S", cpu: "1.2", mem: "4.8", time: "0:42.15", cmd: "emqx/bin/emqx start" },
                { pid: 1205, user: "postgres", pri: 20, ni: 0, virt: "340M", res: "84.1M", shr: "24M", s: "S", cpu: "0.8", mem: "5.2", time: "0:38.20", cmd: "postgres: 16-timescaledb worker" },
                { pid: 1308, user: "redis", pri: 20, ni: 0, virt: "84M", res: "16.2M", shr: "8M", s: "S", cpu: "0.4", mem: "1.8", time: "0:12.40", cmd: "redis-server *:6379" },
                { pid: 2840, user: "engineer", pri: 20, ni: 0, virt: "0", res: "0", shr: "0", s: "Z", cpu: "0.0", mem: "0.0", time: "0:00.00", cmd: "leak_proc <defunct>" }
              ].map(p => (
                <div key={p.pid} className="px-3 py-1 flex justify-between font-mono hover:bg-white/5">
                  <span className={p.s === "Z" ? "text-red-400 font-bold" : "text-white"}>
                    {String(p.pid).padStart(5, " ")} {p.user.padEnd(9, " ")} {p.pri}   {p.ni} {p.virt.padStart(5, " ")} {p.res.padStart(6, " ")} {p.shr.padStart(5, " ")} {p.s}  {p.cpu.padStart(4, " ")} {p.mem.padStart(4, " ")} {p.time.padStart(8, " ")} {p.cmd}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           MAIN INTERACTIVE SHELL BUFFER
           ───────────────────────────────────────────────────────────── */
        <div
          ref={terminalContainerRef}
          onClick={() => inputRef.current?.focus()}
          className={`p-4 flex-1 overflow-y-auto space-y-3.5 bg-black/80 cursor-text select-text ${fontSize} ${
            isFullscreen ? "min-h-[500px]" : "min-h-[300px] max-h-[460px]"
          }`}
        >
          {/* MOTD Header */}
          <div className="text-slate-500 text-[11px] leading-relaxed border-b border-white/5 pb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              MOONSAV Linux Shell (v5.2.15-release) • Node: <span className="text-cyan-400 font-bold">{envId}</span> ({projectId})
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE (VFS Stateful)
              </span>
            </div>
          </div>

          {/* Command History Stream */}
          {(activeTab?.history || []).map((entry, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-emerald-400 font-bold">{entry.prompt}</span>
                <span className="font-semibold text-white">{entry.command}</span>
                <span className="text-[10px] text-slate-500 ml-auto">{entry.timestamp}</span>
              </div>
              {entry.output && (
                <pre className="text-slate-200 whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-cyan-500/40 font-mono py-1">
                  {entry.output}
                </pre>
              )}
            </div>
          ))}

          {/* Live Interactive Input Line */}
          <div className="flex items-center gap-2 text-cyan-400 pt-1">
            <span className="text-emerald-400 font-bold shrink-0">{shellSession.getPrompt()}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              placeholder={isExecuting ? "Executing command..." : "Type command (e.g. ls -la, ps aux, nano config/safety.json, docker ps)..."}
              className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder-slate-600"
            />
          </div>
          <div ref={terminalEndRef} />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUICK COMMAND CHIPS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="border-t border-white/10 bg-slate-900/80 p-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="text-slate-400 uppercase font-semibold mr-1">Quick Run:</span>
        {[
          "ps aux --sort=-%cpu",
          "kill -15 1420",
          "ss -tulpn | grep 1883",
          "curl -s localhost:8080/health",
          "docker ps",
          "docker stats --no-stream",
          "kubectl get pods -A",
          "nano config/safety.json",
          "htop",
          "ls -la"
        ].map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleExecute(cmd)}
            className="rounded-lg bg-white/5 border border-white/10 px-2 py-0.5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STATUS FOOTER BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-t border-white/10 text-[10px] text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1 font-bold ${lastExitCode === 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {lastExitCode === 0 ? "✔ 0" : `✘ ${lastExitCode}`}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-indigo-400 font-semibold">git:(main)</span>
          <span className="text-slate-500">|</span>
          <span>{shellSession.vfs.cwd}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">UTF-8</span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-mono">bash 5.2.15</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-bold">&lt;1ms</span>
        </div>
      </div>
    </div>
  );
}
