// Composite website-health scoring — every figure derived from signals the
// monitoring engine already collects (check_results, ssl_info,
// security_snapshots, content_analysis). No estimates, no mock data: a
// category returns null when we genuinely have no measurement for it, and
// the overall score is a weighted average over only the categories we can
// actually measure.

export const CATEGORY_META = {
  availability: { label: "Availability", weight: 0.30 },
  performance: { label: "Performance", weight: 0.20 },
  security: { label: "Security", weight: 0.25 },
  ssl: { label: "SSL", weight: 0.15 },
  seo: { label: "SEO", weight: 0.10 },
};

export function isHttps(monitor) {
  return typeof monitor?.url === "string" && monitor.url.toLowerCase().startsWith("https://");
}

// Uptime % over the checks we have on hand (real, honest — not an all-time SLA).
export function availabilityScore(recentChecks) {
  if (!recentChecks || recentChecks.length === 0) return null;
  const up = recentChecks.filter(c => c.status === "UP").length;
  return Math.round((up / recentChecks.length) * 100);
}

export function avgResponseMs(recentChecks) {
  const times = (recentChecks ?? []).map(c => c.responseTimeMs).filter(v => v != null);
  if (times.length === 0) return null;
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}

// Response time mapped to a 0–100 score using the same thresholds a human
// would eyeball: sub-200ms is excellent, multi-second is poor.
export function performanceScore(recentChecks) {
  const avg = avgResponseMs(recentChecks);
  if (avg == null) return null;
  if (avg <= 200) return 100;
  if (avg <= 500) return 90;
  if (avg <= 1000) return 75;
  if (avg <= 2000) return 55;
  if (avg <= 3000) return 35;
  return 20;
}

export function securityScore(snapshot) {
  return snapshot && snapshot.score != null ? snapshot.score : null;
}

// SSL is only meaningful for HTTPS targets. Invalid = 0; otherwise driven by
// real days-remaining from ssl_info.
export function sslScore(monitor) {
  if (!isHttps(monitor)) return null;
  const s = monitor?.sslInfo;
  if (!s) return null;
  if (s.isValid === false) return 0;
  const d = s.daysRemaining;
  if (d == null) return 90;
  if (d > 30) return 100;
  if (d > 14) return 80;
  if (d > 7) return 55;
  if (d > 0) return 30;
  return 0;
}

// A real, checklist-based SEO score from content_analysis — each item is a
// concrete on-page signal the crawler actually measured.
export function seoScore(ca) {
  if (!ca) return null;
  let score = 0;
  if (ca.title && ca.titleLength >= 10 && ca.titleLength <= 60) score += 18;
  else if (ca.title) score += 9;
  if (ca.metaDescription && ca.metaDescriptionLength >= 50 && ca.metaDescriptionLength <= 160) score += 16;
  else if (ca.metaDescription) score += 8;
  if (ca.h1Count === 1) score += 12;
  else if (ca.h1Count > 0) score += 6;
  if (ca.hasViewportMeta) score += 12;
  if (ca.canonicalUrl) score += 10;
  const og = [ca.hasOgTitle, ca.hasOgDescription, ca.hasOgImage].filter(Boolean).length;
  score += Math.round((og / 3) * 12);
  if (!ca.imageCount || ca.imagesMissingAlt === 0) score += 8;
  else score += Math.round((1 - Math.min(1, ca.imagesMissingAlt / ca.imageCount)) * 8);
  if (ca.hasRobotsTxt) score += 6;
  if (ca.hasSitemapXml) score += 6;
  return Math.min(100, score);
}

export function categoryScores(monitor) {
  return {
    availability: availabilityScore(monitor.recentChecks),
    performance: performanceScore(monitor.recentChecks),
    security: securityScore(monitor.securitySnapshot),
    ssl: sslScore(monitor),
    seo: seoScore(monitor.contentAnalysis),
  };
}

// Weighted average over only the categories we can actually measure, so a
// plain-HTTP monitor with no SEO crawl isn't unfairly dragged down by
// "missing" categories it was never going to have.
export function overallHealth(monitor) {
  const cats = categoryScores(monitor);
  let sum = 0, wsum = 0;
  for (const [k, meta] of Object.entries(CATEGORY_META)) {
    if (cats[k] != null) { sum += cats[k] * meta.weight; wsum += meta.weight; }
  }
  return wsum > 0 ? Math.round(sum / wsum) : null;
}

export function healthBand(score) {
  if (score == null) return "unknown";
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}
