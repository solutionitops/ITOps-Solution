import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface AlertEventMonitor {
  id: string;
  name: string;
  url: string;
}

export interface AlertEvent {
  type: "MONITOR_DOWN" | "MONITOR_UP" | "SSL_EXPIRING" | "SSL_EXPIRED";
  monitor: AlertEventMonitor;
  message: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ALERT_EMAIL_FROM = Deno.env.get("ALERT_EMAIL_FROM") ?? "alerts@itops-monitor.local";

// ---------------------------------------------------------------------------
// FINDING-03 & FINDING-04: SSRF protection
// Validates that a URL is safe to fetch before we send an outbound request.
// Blocks:
//   - Non-HTTPS schemes (http://, ftp://, etc.)
//   - Private/loopback IPv4 ranges: 10.*, 172.16-31.*, 192.168.*, 127.*
//   - Link-local: 169.254.* (AWS/GCP/Azure instance metadata endpoint)
//   - IPv6 loopback: [::1]
//   - Bare "localhost" hostname
// ---------------------------------------------------------------------------
const PRIVATE_IPV4_RE = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|127\.\d+\.\d+\.\d+|169\.254\.\d+\.\d+)$/;

function assertSafeUrl(raw: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label}: invalid URL "${raw}"`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${label}: only HTTPS URLs are allowed (got "${parsed.protocol}")`);
  }

  // Strip port and brackets from IPv6 "[::1]"
  const hostname = parsed.hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();

  if (hostname === "localhost" || hostname === "::1") {
    throw new Error(`${label}: loopback addresses are not allowed`);
  }

  if (PRIVATE_IPV4_RE.test(hostname)) {
    throw new Error(`${label}: private/link-local IP ranges are not allowed ("${hostname}")`);
  }
}

export async function dispatchAlert(
  supabase: SupabaseClient,
  organizationId: string,
  event: AlertEvent,
): Promise<void> {
  const { data: channels } = await supabase
    .from("alert_channels")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true);

  await Promise.allSettled((channels ?? []).map((channel) => sendToChannel(channel, event)));
}

// deno-lint-ignore no-explicit-any
async function sendToChannel(channel: any, event: AlertEvent): Promise<void> {
  try {
    if (channel.type === "EMAIL") await sendEmailAlert(channel.config, event);
    if (channel.type === "SLACK") await sendSlackAlert(channel.config, event);
    if (channel.type === "WEBHOOK") await sendWebhookAlert(channel.config, event);
  } catch (err) {
    console.error(`Failed to send alert via channel ${channel.id} (${channel.type}):`, err);
  }
}

export async function sendEmailAlert(cfg: { to: string }, event: AlertEvent): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn(`[email alert skipped: RESEND_API_KEY not configured] ${cfg.to}: ${event.message}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: ALERT_EMAIL_FROM,
      to: cfg.to,
      subject: `[ITOps Monitor] ${event.type.replace(/_/g, " ")} — ${event.monitor.name}`,
      text: event.message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API responded with ${response.status}`);
  }
}

export async function sendSlackAlert(cfg: { webhookUrl: string }, event: AlertEvent): Promise<void> {
  // FINDING-04: Validate the Slack webhook URL before fetching to prevent SSRF.
  assertSafeUrl(cfg.webhookUrl, "Slack webhook");

  const emoji = event.type === "MONITOR_UP" ? ":white_check_mark:" : ":rotating_light:";
  const response = await fetch(cfg.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `${emoji} *${event.type.replace(/_/g, " ")}*\n${event.message}` }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook responded with ${response.status}`);
  }
}

export async function sendWebhookAlert(cfg: { url: string }, event: AlertEvent): Promise<void> {
  // FINDING-03: Validate the webhook URL before fetching to prevent SSRF.
  assertSafeUrl(cfg.url, "Webhook");

  const response = await fetch(cfg.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: event.type,
      message: event.message,
      monitor: event.monitor,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded with ${response.status}`);
  }
}
