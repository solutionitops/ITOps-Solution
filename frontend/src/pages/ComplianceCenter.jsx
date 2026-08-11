import { useState } from "react";

const COMPLIANCE_FRAMEWORKS = [
  { key: "ISO27001", name: "ISO / IEC 27001", status: "PASS", score: 94, passedControls: 47, totalControls: 50 },
  { key: "SOC2", name: "SOC 2 Type II", status: "PASS", score: 92, passedControls: 36, totalControls: 39 },
  { key: "PCI_DSS", name: "PCI-DSS v4.0", status: "WARNING", score: 84, passedControls: 25, totalControls: 30 },
  { key: "HIPAA", name: "HIPAA Security Rule", status: "PASS", score: 96, passedControls: 24, totalControls: 25 },
  { key: "GDPR", name: "GDPR Privacy Compliance", status: "PASS", score: 90, passedControls: 18, totalControls: 20 },
];

const CONTROL_CHECKS = [
  { code: "CC6.1", name: "MFA Enforcement on Admin Accounts", status: "PASS", detail: "All platform admins have WebAuthn/TOTP MFA enabled." },
  { code: "CC7.2", name: "Automated Monthly Backup Restore Test", status: "FAIL", detail: "Database backup restore test failed due to timeout.", recommendation: "Enable automated monthly restore verification cron." },
  { code: "A12.6", name: "Vulnerability & Patch Management", status: "WARNING", detail: "2 Critical CVEs detected in secondary Docker image.", recommendation: "Re-base container to Ubuntu 24.04." },
];

export default function ComplianceCenter() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white">Enterprise Compliance Monitoring Center</h1>
        <p className="mt-1 text-xs text-white/50">Real-time control evaluation for ISO 27001, SOC2, PCI-DSS, HIPAA, & GDPR</p>
      </div>

      {/* Framework Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {COMPLIANCE_FRAMEWORKS.map(f => (
          <div key={f.key} className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{f.name}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                f.status === "PASS" ? "bg-emerald-400/20 text-emerald-300" : "bg-amber-400/20 text-amber-300"
              }`}>
                {f.status}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{f.score}%</p>
            <p className="text-[11px] text-white/40">{f.passedControls} / {f.totalControls} Controls Passed</p>
          </div>
        ))}
      </div>

      {/* Controls Table */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Automated Compliance Control Checks</h3>

        <div className="space-y-3">
          {CONTROL_CHECKS.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 font-bold">{c.code}</span>
                  <span className="font-bold text-white">{c.name}</span>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  c.status === "PASS" ? "bg-emerald-400/20 text-emerald-300" : c.status === "FAIL" ? "bg-red-400/20 text-red-300" : "bg-amber-400/20 text-amber-300"
                }`}>
                  {c.status}
                </span>
              </div>
              <p className="text-white/60">{c.detail}</p>
              {c.recommendation && <p className="text-emerald-300 font-semibold">Recommendation: {c.recommendation}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
