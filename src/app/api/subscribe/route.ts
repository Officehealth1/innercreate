import { NextResponse } from "next/server";
import {
  clientIp,
  isValidEmail,
  mailboxKey,
  normalizeEmail,
  rateLimit,
  resolveTrustedOrigin,
  signConfirmToken,
} from "@/lib/newsletter";
import { lookupContact, sendConfirmationEmail } from "@/lib/brevo";

// node:crypto (HMAC token signing) requires the Node runtime.
export const runtime = "nodejs";

/** Honeypot field name — must match the hidden input in NewsletterForm. */
const HONEYPOT_FIELD = "company";

const IP_LIMIT = 5;
const IP_WINDOW_MS = 15 * 60 * 1000;
const MAILBOX_LIMIT = 2;
const MAILBOX_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Backstop on the Brevo free plan's 300 sends/day. Without it a bot that
 * rotates both IP and recipient could burn the whole daily allowance, which
 * would silently break welcome mail and Florence's own campaigns. Leaves
 * headroom for welcome + notification mail on top of confirmations.
 *
 * Raise via NEWSLETTER_DAILY_CAP if the Brevo plan is upgraded.
 */
const GLOBAL_DAILY_CONFIRMATIONS = (() => {
  const raw = Number.parseInt(process.env.NEWSLETTER_DAILY_CAP ?? "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 120;
})();

/**
 * Uniform success response.
 *
 * Returned whether the address is new, already subscribed, or a honeypot hit,
 * so the endpoint can't be used to enumerate who is on the list — or to work
 * out which submissions were silently dropped.
 */
function accepted() {
  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const origin = resolveTrustedOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Rate limit before anything expensive, so malformed floods are capped too.
  // A null IP means the platform header was missing; skip rather than bucket
  // every such request together, which would rate-limit the whole site at once.
  const ip = clientIp(request);
  if (ip) {
    const ipLimit = rateLimit(`ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSeconds) },
        }
      );
    }
  } else {
    console.warn("[Newsletter] No client IP header; per-IP limit skipped");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: invisible to humans, irresistible to form-filling bots. Answer
  // exactly as we would a real signup so the bot has no failure signal.
  const honeypot = payload[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.warn(`[Newsletter] Honeypot triggered from ${ip}`);
    return accepted();
  }

  const { email } = payload;
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const address = normalizeEmail(email);
  if (!isValidEmail(address)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  // Per-mailbox cap, keyed on the real inbox behind dots and +tags. Stops one
  // address being mail-bombed through rotating aliases or rotating IPs.
  const mailboxLimit = rateLimit(
    `mailbox:${mailboxKey(address)}`,
    MAILBOX_LIMIT,
    MAILBOX_WINDOW_MS
  );
  if (!mailboxLimit.allowed) {
    // Uniform response: revealing the cap would confirm the address exists.
    console.warn("[Newsletter] Mailbox cooldown hit");
    return accepted();
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listIdRaw = process.env.BREVO_LIST_ID;
  const listId = listIdRaw ? Number.parseInt(listIdRaw, 10) : NaN;
  const secret = process.env.NEWSLETTER_SECRET;

  if (!apiKey || !Number.isFinite(listId) || !secret) {
    console.error(
      "[Newsletter] Missing BREVO_API_KEY, BREVO_LIST_ID or NEWSLETTER_SECRET"
    );
    return NextResponse.json(
      { error: "Newsletter signup is not configured." },
      { status: 500 }
    );
  }

  const state = await lookupContact(address, { apiKey, listId });
  // Already subscribed — no second confirmation.
  if (state === "active") return accepted();
  // Hard-bounced or previously marked us as spam. Mailing these again is what
  // wrecks sender reputation, and it's exactly what a bot replaying a harvested
  // list would trigger. A genuine returning subscriber needs a manual re-add.
  if (state === "blacklisted") {
    console.warn("[Newsletter] Suppressed confirmation to blacklisted address");
    return accepted();
  }

  const globalCap = rateLimit(
    "global:confirmations",
    GLOBAL_DAILY_CONFIRMATIONS,
    24 * 60 * 60 * 1000
  );
  if (!globalCap.allowed) {
    // Loud: this is either a sustained attack or genuine viral traffic, and
    // both need a human to look at the Brevo quota.
    console.error(
      `[Newsletter] Daily confirmation cap (${GLOBAL_DAILY_CONFIRMATIONS}) reached — suppressing sends`
    );
    return accepted();
  }

  const token = signConfirmToken(address, secret);
  // `origin` came from the allowlist, so the confirmation link can never be
  // pointed at an attacker-controlled host.
  const confirmUrl = `${origin}/subscribe/confirm?token=${encodeURIComponent(token)}`;

  const sent = await sendConfirmationEmail(address, confirmUrl, apiKey);
  if (!sent) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  return accepted();
}
