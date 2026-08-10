// Deterministic remediation for the exact security headers the check engine
// flags as missing (see _shared/checks.ts SECURITY_HEADERS). These are
// safe, widely-recommended default values, and the generated config is
// copy-paste ready — no remote execution, no guessing. The header keys here
// match the lowercase names stored in security_snapshots.missing_headers.

export const HEADER_FIXES = {
  "strict-transport-security": {
    name: "Strict-Transport-Security",
    label: "HSTS",
    severity: "high",
    value: "max-age=31536000; includeSubDomains",
    why: "Forces browsers to use HTTPS on every future request, blocking protocol-downgrade and cookie-hijacking attacks.",
  },
  "content-security-policy": {
    name: "Content-Security-Policy",
    label: "CSP",
    severity: "high",
    value: "default-src 'self'",
    why: "Controls which sources scripts, styles, and frames may load from — the primary defense against cross-site scripting (XSS).",
  },
  "x-frame-options": {
    name: "X-Frame-Options",
    label: "X-Frame-Options",
    severity: "medium",
    value: "SAMEORIGIN",
    why: "Prevents your pages from being embedded in a hostile iframe (clickjacking).",
  },
  "x-content-type-options": {
    name: "X-Content-Type-Options",
    label: "X-Content-Type-Options",
    severity: "medium",
    value: "nosniff",
    why: "Stops browsers from MIME-sniffing a response into a different content type than declared.",
  },
  "referrer-policy": {
    name: "Referrer-Policy",
    label: "Referrer-Policy",
    severity: "low",
    value: "strict-origin-when-cross-origin",
    why: "Limits how much of the referring URL is leaked to other sites.",
  },
  "permissions-policy": {
    name: "Permissions-Policy",
    label: "Permissions-Policy",
    severity: "low",
    value: "geolocation=(), microphone=(), camera=()",
    why: "Disables powerful browser features the site doesn't use, shrinking its attack surface.",
  },
};

export const PLATFORMS = [
  { key: "nginx", label: "Nginx" },
  { key: "apache", label: "Apache" },
  { key: "cloudflare", label: "Cloudflare" },
];

export const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

// Only headers we actually know how to fix (defensive: ignore anything
// unexpected in the stored array), sorted worst-first.
export function knownMissing(missingHeaders) {
  return (missingHeaders ?? [])
    .filter(h => HEADER_FIXES[h])
    .sort((a, b) => SEVERITY_ORDER[HEADER_FIXES[a].severity] - SEVERITY_ORDER[HEADER_FIXES[b].severity]);
}

export function generateConfig(missingHeaders, platform) {
  const headers = knownMissing(missingHeaders);
  if (headers.length === 0) return "# All recommended security headers are already present.";
  if (platform === "nginx") {
    return [
      "# Add inside your server { } block, then: nginx -t && systemctl reload nginx",
      ...headers.map(h => `add_header ${HEADER_FIXES[h].name} "${HEADER_FIXES[h].value}" always;`),
    ].join("\n");
  }
  if (platform === "apache") {
    return [
      "# Requires mod_headers. Add to your VirtualHost or .htaccess, then: systemctl reload apache2",
      ...headers.map(h => `Header always set ${HEADER_FIXES[h].name} "${HEADER_FIXES[h].value}"`),
    ].join("\n");
  }
  if (platform === "cloudflare") {
    return [
      "# Cloudflare → Rules → Transform Rules → Modify Response Header → Set static:",
      ...headers.map(h => `${HEADER_FIXES[h].name}: ${HEADER_FIXES[h].value}`),
    ].join("\n");
  }
  return "";
}
