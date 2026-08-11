import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMonitors } from "../api/endpoints";
import { DiscoveryProcessScreen } from "../components/DiscoveryProcessScreen";
import { OnboardingDiscoveryReport } from "../components/OnboardingDiscoveryReport";
import { fetchLiveDnsRecords, fetchLiveAsnInfo } from "../lib/onboardingDiscovery";

export default function ApplicationIntelligence() {
  const [customUrl, setCustomUrl] = useState("https://cloudaxisnp.com");
  const [activeUrl, setActiveUrl] = useState("https://cloudaxisnp.com");
  const [liveData, setLiveData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const monitorsQuery = useQuery({ queryKey: ["monitors"], queryFn: fetchMonitors });
  const monitors = monitorsQuery.data || [];

  const handleScan = async (e) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const url = customUrl.trim();
    setActiveUrl(url);
    setIsScanning(true);

    const domain = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    try {
      const dns = await fetchLiveDnsRecords(domain);
      const asn = await fetchLiveAsnInfo(dns.aIp);
      setLiveData({ ...dns, ...asn });
    } catch {
      setLiveData(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Enterprise Application Discovery Engine</h1>
          <p className="mt-1 text-xs text-white/50">Multi-layer DNS, TLS, ASN, HTTP fingerprinting, vulnerability scan, & topology map</p>
        </div>
      </div>

      {/* Target URL Input Form */}
      <form onSubmit={handleScan} className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4 flex flex-wrap gap-3">
        <input
          type="url"
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="Enter website URL (e.g. https://cloudaxisnp.com)"
          className="flex-1 min-w-[280px] rounded-xl border border-white/20 bg-black/40 px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          required
        />
        <button
          type="submit"
          disabled={isScanning}
          className="rounded-xl bg-cyan-400 px-6 py-2.5 text-xs font-bold text-black hover:bg-cyan-300 transition-colors disabled:opacity-40"
        >
          {isScanning ? "Scanning Infrastructure..." : "🔍 Discover Architecture"}
        </button>
      </form>

      {/* Step 1: Live Scanning Process Screen OR Step 2+: Evidence-Backed Report */}
      {isScanning ? (
        <DiscoveryProcessScreen targetUrl={activeUrl} onComplete={() => setIsScanning(false)} />
      ) : (
        <OnboardingDiscoveryReport
          monitor={{ url: activeUrl, name: activeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") }}
          liveData={liveData}
        />
      )}
    </div>
  );
}
