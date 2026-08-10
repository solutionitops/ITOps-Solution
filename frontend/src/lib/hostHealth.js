// Shared host-health helpers used by both the Server Agents grid (Hosts.jsx)
// and the Infrastructure Map (Infrastructure.jsx) so "healthy / busy /
// critical" means exactly the same thing in both places.

// Worst of a host's three real utilization metrics — the most-saturated
// resource is how you'd actually triage it, not an average that hides a
// pegged disk behind idle CPU.
export function worstMetric(host) {
  const vals = [host.cpuPercent, host.memPercent, host.diskPercent].filter(v => v != null);
  return vals.length ? Math.max(...vals) : null;
}

// A host's overall state: pending (never reported), down (offline),
// crit (>=90% on any resource), warn (>=70%), or ok.
export function healthTone(host) {
  if (!host.lastSeenAt) return "pending";
  if (!host.isOnline) return "down";
  const w = worstMetric(host);
  if (w == null) return "ok";
  if (w >= 90) return "crit";
  if (w >= 70) return "warn";
  return "ok";
}

// A host "needs attention" when it's offline or any resource is critical.
export function needsAttention(host) {
  const tone = healthTone(host);
  return tone === "down" || tone === "crit";
}
