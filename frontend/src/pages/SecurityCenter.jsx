import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitors } from "../api/endpoints";
import { scanVulnerabilities } from "../lib/vulnerabilityScanner";
import { SecurityFixConfig } from "../components/SecurityFixConfig";
import { useToast } from "../components/Toast";

export default function SecurityCenter() {
  const [showFix, setShowFix] = useState(false);
  const toast = useToast();

  const monitorsQuery = useQuery({ queryKey: ["monitors"], queryFn: fetchMonitors });
  const monitors = monitorsQuery.data || [];
  const primaryMonitor = monitors[0] || { name: "Production Gateway", url: "https://cloudaxisnp.com" };

  const vuln = scanVulnerabilities(primaryMonitor);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Security Intelligence & Vulnerability Center</h1>
          <p className="mt-1 text-xs text-white/50">Comprehensive DevSecOps security posture, SSL/TLS checks, missing HTTP headers, & CVE scans</p>
        </div>

        <button
          onClick={() => {
            setShowFix(true);
            toast.success("Generated automated Security Header Remediation script!");
          }}
          className="rounded-xl bg-emerald-400 px-5 py-2.5 text-xs font-bold text-black hover:bg-emerald-300"
        >
          ✨ Fix Security Headers Automatically
        </button>
      </div>

      {/* Security Posture Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          <span className="text-[10px] font-bold uppercase text-emerald-300">SECURITY SCORE</span>
          <p className="mt-1 text-3xl font-bold text-white">{vuln.securityScore} / 100</p>
        </div>
        <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4">
          <span className="text-[10px] font-bold uppercase text-red-300">CRITICAL FINDINGS</span>
          <p className="mt-1 text-3xl font-bold text-red-300">{vuln.criticalCount}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
          <span className="text-[10px] font-bold uppercase text-amber-300">HIGH FINDINGS</span>
          <p className="mt-1 text-3xl font-bold text-amber-300">{vuln.highCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <span className="text-[10px] font-bold uppercase text-white/40">MEDIUM FINDINGS</span>
          <p className="mt-1 text-3xl font-bold text-white">{vuln.mediumCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <span className="text-[10px] font-bold uppercase text-white/40">LOW FINDINGS</span>
          <p className="mt-1 text-3xl font-bold text-white">{vuln.lowCount}</p>
        </div>
      </div>

      {/* Security Fix Config Modal / View */}
      {showFix && (
        <div className="rounded-2xl border border-emerald-400/30 bg-black/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-300">Automated Security Header Injection Config</h3>
            <button onClick={() => setShowFix(false)} className="text-xs text-white/40">Close</button>
          </div>
          <SecurityFixConfig missingHeaders={["Content-Security-Policy", "Strict-Transport-Security", "X-Frame-Options", "X-Content-Type-Options"]} />
        </div>
      )}

      {/* Dependency Vulnerability Findings */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Application Package Vulnerabilities (CVE Scan)</h3>

        <div className="space-y-3">
          {vuln.dependencyVulnerabilities.map((v, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    v.severity === "CRITICAL" ? "bg-red-400/20 text-red-300" : "bg-amber-400/20 text-amber-300"
                  }`}>
                    {v.severity}
                  </span>
                  <span className="font-bold text-white">{v.package} ({v.installedVersion})</span>
                  <span className="font-mono text-cyan-300">{v.cve}</span>
                </div>

                <span className="text-emerald-300 font-semibold">Fix: Upgrade to {v.fixedVersion}</span>
              </div>
              <p className="text-white/60">{v.description}</p>
              <p className="text-white/40 font-mono text-[11px]">{v.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Container Security Scan */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white">Docker Container Security Scan</h3>

        <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Container Image: {vuln.containerSecurity.imageName}</span>
            <span className="text-amber-300 font-bold">{vuln.containerSecurity.criticalCVEs} Critical / {vuln.containerSecurity.highCVEs} High CVEs</span>
          </div>
          <p className="text-white/60">Base OS: {vuln.containerSecurity.baseOS}</p>
          <p className="text-emerald-300 font-semibold">Recommendation: {vuln.containerSecurity.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
