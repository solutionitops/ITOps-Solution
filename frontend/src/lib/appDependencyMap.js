/**
 * Digital Twin Application Dependency Map Data Generator
 * Builds nodes, edge latency propagation, and active failure paths.
 */

export function buildDigitalTwinGraph(monitor, isDegraded = false) {
  const siteName = monitor?.name || "Website";
  const siteUrl = monitor?.url || "https://example.com";

  const nodes = [
    { id: "users", name: "Users", type: "users", status: "healthy", icon: "👤", details: "Global Client Traffic" },
    { id: "cloudflare", name: "Cloudflare CDN", type: "gateway", status: "healthy", icon: "☁️", details: "Edge Cache & WAF" },
    { id: "nginx", name: "Nginx Proxy", type: "web", status: isDegraded ? "degraded" : "healthy", icon: "🌐", details: "8 Worker Threads" },
    { id: "frontend", name: `${siteName} Target`, type: "app", status: "healthy", icon: "💻", details: siteUrl },
    { id: "backend", name: `${siteName} API Service`, type: "app", status: isDegraded ? "critical" : "healthy", icon: "⚙️", details: "Node.js App Workers" },
    { id: "database", name: `${siteName} Database`, type: "database", status: isDegraded ? "critical" : "healthy", icon: "🗄️", details: isDegraded ? "98% Pool Connection Usage" : "18% Pool Usage" },
    { id: "storage", name: "Object Storage (S3)", type: "storage", status: "healthy", icon: "📦", details: "Media & Assets" },
  ];

  const edges = [
    { source: "users", target: "cloudflare", latencyMs: 12 },
    { source: "cloudflare", target: "nginx", latencyMs: 24 },
    { source: "nginx", target: "frontend", latencyMs: 15 },
    { source: "nginx", target: "backend", latencyMs: isDegraded ? 840 : 65 },
    { source: "backend", target: "database", latencyMs: isDegraded ? 780 : 12, isBottleneck: isDegraded },
    { source: "backend", target: "storage", latencyMs: 35 },
  ];

  const propagationPath = isDegraded
    ? [
        { from: `${siteName} Database`, to: `${siteName} API Service`, message: "Database pool connection limit hit (98% usage)" },
        { from: `${siteName} API Service`, to: "Nginx Proxy", message: `Upstream response for ${siteUrl} delayed (840ms)` },
        { from: "Nginx Proxy", to: "Cloudflare CDN", message: "Upstream HTTP TTFB timeout warnings" },
        { from: "Cloudflare CDN", to: "Users", message: `Website latency for ${siteName} increased by 230%` },
      ]
    : [];

  return {
    siteName,
    siteUrl,
    nodes,
    edges,
    propagationPath,
    rootCauseNodeId: isDegraded ? "database" : null
  };
}
