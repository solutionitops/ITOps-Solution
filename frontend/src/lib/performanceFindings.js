// Performance findings derived ONLY from signals the checker reliably records.
// Deliberately conservative about what counts as a "detected problem":
//
//  - Response time (TTFB-ish): the real measured fetch time. Reliable.
//  - Redirect chain: real, from check_results.redirect_chain. Reliable.
//  - Cache-Control presence: read straight from the stored response headers.
//
// We do NOT flag "missing gzip/compression" as a defect, because the fetch
// layer can transparently decompress and drop Content-Encoding — so its
// absence in the stored headers doesn't prove the server isn't compressing.
// Compression/HTTP2 are offered instead as *recommended* best-practice server
// config (clearly labelled), never as a false "you're broken" finding.

export function performanceFindings(monitor, history) {
  const findings = [];
  const times = (history ?? []).map(h => h.responseTimeMs).filter(v => v != null);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  if (avg != null && avg > 2000) {
    findings.push({
      key: "ttfb", severity: "high", title: "Slow server response",
      detail: `Average response time is ${avg.toLocaleString()}ms — well over the 1s target. This is server/application processing time, not page weight: profile the app, add server-side caching, or check the database.`,
    });
  } else if (avg != null && avg > 800) {
    findings.push({
      key: "ttfb", severity: "medium", title: "Elevated server response",
      detail: `Average response time is ${avg.toLocaleString()}ms. Aim for under 800ms — look at server-side caching and slow queries.`,
    });
  }

  const latest = (history ?? [])[0];
  const hops = latest?.redirectChain?.length ?? 0;
  if (hops >= 2) {
    findings.push({
      key: "redirects", severity: "medium", title: "Long redirect chain",
      detail: `${hops} redirects before the final response — each one is a full extra round trip. Collapse to at most one (e.g. redirect straight to the canonical https host).`,
    });
  }

  const headers = monitor.securitySnapshot?.headers ?? {};
  if (monitor.securitySnapshot && !headers["cache-control"]) {
    findings.push({
      key: "cache", severity: "low", title: "No Cache-Control header",
      detail: "The response carries no Cache-Control header. Static assets served without one are re-downloaded on every visit — set a long max-age for versioned assets.",
    });
  }

  return { avg, findings };
}

// Standard, safe server-side performance config — offered as a recommendation
// to copy, not as auto-detected defects.
export const PERF_PLATFORMS = [
  { key: "nginx", label: "Nginx" },
  { key: "apache", label: "Apache" },
];

export function generatePerfConfig(platform) {
  if (platform === "nginx") {
    return [
      "# Compression",
      "gzip on;",
      "gzip_types text/css application/javascript application/json image/svg+xml;",
      "gzip_min_length 1024;",
      "",
      "# Long-lived cache for versioned static assets",
      'location ~* \\.(css|js|woff2|png|jpg|jpeg|webp|svg)$ {',
      '  add_header Cache-Control "public, max-age=31536000, immutable";',
      "}",
      "",
      "# HTTP/2 (with TLS)",
      "# listen 443 ssl http2;",
    ].join("\n");
  }
  return [
    "# Compression (mod_deflate)",
    "AddOutputFilterByType DEFLATE text/css application/javascript application/json image/svg+xml",
    "",
    "# Long-lived cache for versioned static assets (mod_expires)",
    '<FilesMatch "\\.(css|js|woff2|png|jpg|jpeg|webp|svg)$">',
    '  Header set Cache-Control "public, max-age=31536000, immutable"',
    "</FilesMatch>",
    "",
    "# HTTP/2 (mod_http2): Protocols h2 http/1.1",
  ].join("\n");
}
