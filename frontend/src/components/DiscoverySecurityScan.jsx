import { useState } from "react";
import { SecurityFixConfig } from "./SecurityFixConfig";
import { useToast } from "./Toast";

export function DiscoverySecurityScan({ securityScan }) {
  const [showFixModal, setShowFixModal] = useState(false);
  const toast = useToast();

  const missingHeaders = securityScan?.headers?.filter(h => h.status === "MISSING").map(h => h.header) || [];

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-400/20 text-emerald-300">🛡️</span>
            <h3 className="text-sm font-semibold text-white">Security & Vulnerability Discovery</h3>
          </div>
          <p className="mt-0.5 text-xs text-white/45">SSL/TLS configuration, missing HTTP security headers, & package vulnerabilities</p>
        </div>

        {missingHeaders.length > 0 && (
          <button
            onClick={() => {
              setShowFixModal(true);
              toast.success("Generated Security Header Policy Fix!");
            }}
            className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 transition-colors"
          >
            ✨ Fix Headers Automatically
          </button>
        )}
      </div>

      {/* SSL Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] font-bold uppercase text-white/40">SSL Status</span>
          <p className="mt-1 text-sm font-bold text-emerald-300">✓ {securityScan?.sslStatus || "GOOD"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] font-bold uppercase text-white/40">Certificate Issuer</span>
          <p className="mt-1 text-sm font-bold text-white">{securityScan?.sslIssuer || "Let's Encrypt"}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] font-bold uppercase text-white/40">Expires In</span>
          <p className="mt-1 text-sm font-bold text-cyan-300">{securityScan?.sslExpiresDays || 42} Days</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <span className="text-[10px] font-bold uppercase text-white/40">TLS Protocol</span>
          <p className="mt-1 text-sm font-bold text-white">TLS {securityScan?.tlsVersion || "1.3"}</p>
        </div>
      </div>

      {/* Security Headers Analysis */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Security Header Analysis</h4>

        <div className="space-y-2">
          {securityScan?.headers?.map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-black/30 p-2 text-xs">
              <span className="font-mono text-white/80">{h.header}</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                h.status === "MISSING" ? "bg-red-400/20 text-red-300" : "bg-emerald-400/20 text-emerald-300"
              }`}>
                ❌ {h.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Fix Modal */}
      {showFixModal && (
        <div className="rounded-xl border border-emerald-400/30 bg-black/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Automated Secure Header Policy Script</span>
            <button onClick={() => setShowFixModal(false)} className="text-xs text-white/40 hover:text-white">✕</button>
          </div>
          <SecurityFixConfig missingHeaders={missingHeaders} />
        </div>
      )}

      {/* Vulnerabilities Scanner */}
      {securityScan?.vulnerabilities?.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">Application Vulnerabilities (CVE Scan)</h4>

          <div className="space-y-2">
            {securityScan.vulnerabilities.map((v, i) => (
              <div key={i} className="flex items-center justify-between text-xs rounded-lg bg-black/30 p-2.5">
                <div>
                  <span className="font-bold text-white">{v.package} ({v.version})</span>
                  <span className="ml-2 font-mono text-cyan-300 text-[11px]">{v.cve}</span>
                </div>
                <span className="text-emerald-300 font-semibold">{v.fix}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
