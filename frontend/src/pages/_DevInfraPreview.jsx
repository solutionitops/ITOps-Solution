import { LabCard } from "../components/LabCard";
const lab = { objective: "Build the core of a server health check: raise an alert when CPU usage crosses a threshold.", environment: "Any bash shell; a scratch directory under /tmp.", tools: ["bash"], steps: ["cd /tmp/itops_lab", "Create check_cpu.sh (#!/bin/bash)", "Set CPU_USAGE=85 and THRESHOLD=80", "Use if [[ $CPU_USAGE -gt $THRESHOLD ]] to print an ALERT line, else an OK line", "Run: bash check_cpu.sh"], challenge: "Also test a file condition: if /var/log is not writable, print a second alert.", verify: { command: "bash /tmp/itops_lab/check_cpu.sh | grep -i alert", pass: "a line containing ALERT (because 85 is greater than 80)" } };
export default function _DevInfraPreview() {
  const light = typeof window !== "undefined" && window.location.search.includes("light");
  return <div className={light ? "light" : ""}><div className="min-h-screen bg-black light:bg-slate-50 p-6" style={{ fontFamily: "'Readex Pro', system-ui, sans-serif" }}><div className="mx-auto max-w-2xl"><LabCard lab={lab} /></div></div></div>;
}
