import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Shared newsletter helpers: address normalisation, signed confirmation
 * tokens, and in-process rate limiting.
 *
 * Context: between 27–31 Jul 2026 the open signup endpoint was used to
 * subscribe 15 harvested third-party addresses (list-bombing), six of them
 * Gmail dot-variants of the same mailbox. Every one of them ended up
 * blacklisted. These helpers back the fixes for that.
 */

// Deliberately stricter than "anything without spaces or @". The loose form
// admits HTML metacharacters (`<b>x</b>@evil.co` passes it), and the address is
// interpolated into the owner notification email. Combined with escaping at the
// point of use, this closes that off entirely.
const EMAIL_RE = /^[A-Za-z0-9._%+'-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_RE.test(trimmed);
}

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

function splitAddress(email: string): [local: string, domain: string] | null {
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return [email.slice(0, at), email.slice(at + 1)];
}

/**
 * The address we store in Brevo and deliver to.
 *
 * Gmail ignores dots in the local part, so `d.a.v.w.ey@gmail.com` and
 * `davwey@gmail.com` are one mailbox. Bots used that to make a single inbox
 * look like six distinct signups, so we collapse dots to one canonical form
 * and let Brevo's own duplicate detection do the rest. Mail to the collapsed
 * form lands in exactly the same inbox, so nothing is lost for the subscriber.
 *
 * `+tags` are deliberately preserved — they are intentional, deliver as typed,
 * and Florence uses them for testing.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const parts = splitAddress(trimmed);
  if (!parts) return trimmed;
  const [local, domain] = parts;
  if (!GMAIL_DOMAINS.has(domain)) return trimmed;
  const undotted = local.replace(/\./g, "");
  // An all-dots local part would normalise to nothing — keep it as-is and let
  // validation reject it rather than producing "@gmail.com".
  if (!undotted) return trimmed;
  return `${undotted}@gmail.com`;
}

/**
 * Rate-limit identity: the real mailbox behind an address. Strips `+tags` as
 * well as dots so a bot cannot sidestep the per-mailbox cooldown by cycling
 * tags. Never used as a delivery address.
 */
export function mailboxKey(email: string): string {
  const normalized = normalizeEmail(email);
  const parts = splitAddress(normalized);
  if (!parts) return normalized;
  const [local, domain] = parts;
  const plus = local.indexOf("+");
  return plus > 0 ? `${local.slice(0, plus)}@${domain}` : normalized;
}

/* -------------------------------------------------------------------------- */
/* Signed confirmation tokens                                                  */
/* -------------------------------------------------------------------------- */

export const CONFIRM_TTL_SECONDS = 48 * 60 * 60;

type TokenPayload = { e: string; x: number };

export type TokenResult =
  | { ok: true; email: string }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

/**
 * Stateless HMAC token — no database needed. The payload carries the address
 * and an absolute expiry; the signature makes both tamper-evident, so an
 * attacker cannot mint a confirmation for an address they do not control.
 */
export function signConfirmToken(
  email: string,
  secret: string,
  ttlSeconds: number = CONFIRM_TTL_SECONDS,
  now: number = Date.now()
): string {
  const payload: TokenPayload = {
    e: email,
    x: Math.floor(now / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyConfirmToken(
  token: unknown,
  secret: string,
  now: number = Date.now()
): TokenResult {
  if (typeof token !== "string" || token.length < 3 || token.length > 512) {
    return { ok: false, reason: "malformed" };
  }
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }
  const [body, sig] = parts;

  // Verify the signature before touching the payload.
  const expected = createHmac("sha256", secret).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (
    given.length !== expected.length ||
    !timingSafeEqual(given, expected)
  ) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    !payload ||
    typeof payload.e !== "string" ||
    typeof payload.x !== "number" ||
    !Number.isFinite(payload.x)
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (!isValidEmail(payload.e)) return { ok: false, reason: "malformed" };
  if (payload.x * 1000 <= now) return { ok: false, reason: "expired" };

  return { ok: true, email: payload.e };
}

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                               */
/* -------------------------------------------------------------------------- */

type Bucket = { count: number; resetAt: number };

/**
 * In-process fixed-window counter.
 *
 * Deliberate limitation: serverless instances do not share this map, so the
 * effective limit is per warm instance rather than global. It is a speed bump
 * for volume abuse, not a hard guarantee — the double opt-in flow is what
 * actually prevents unconfirmed addresses receiving mail. Revisit with a
 * shared store (Netlify Blobs / Upstash) if abuse continues.
 */
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;
let lastPrune = 0;

function prune(now: number) {
  if (now - lastPrune < 60_000 && buckets.size <= MAX_BUCKETS) return;
  lastPrune = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > MAX_BUCKETS) {
    // Bounded memory: evict the entries closest to expiring anyway.
    const byExpiry = [...buckets.entries()].sort(
      (a, b) => a[1].resetAt - b[1].resetAt
    );
    for (const [key] of byExpiry.slice(0, buckets.size - MAX_BUCKETS)) {
      buckets.delete(key);
    }
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test-only: drop all counters so cases don't leak into each other. */
export function __resetRateLimits() {
  buckets.clear();
  lastPrune = 0;
}

/* -------------------------------------------------------------------------- */
/* Request trust helpers                                                       */
/* -------------------------------------------------------------------------- */

export const PRODUCTION_ORIGINS = [
  "https://innercreate.com",
  "https://www.innercreate.com",
];

function allowedOrigins(): string[] {
  // Opt-in extras for Netlify deploy previews and local production builds.
  // Owner-controlled config; keep it empty in the live environment unless a
  // preview URL genuinely needs to submit the form.
  const extra = (process.env.NEWSLETTER_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production") {
    return [...PRODUCTION_ORIGINS, ...extra];
  }
  return [
    ...PRODUCTION_ORIGINS,
    ...extra,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
}

/**
 * Returns the request's origin if it is one we serve the form from, else null.
 *
 * This stops naive scripts that POST with no browser context. A determined bot
 * can forge the header, so it is one layer of several — not the defence.
 */
export function resolveTrustedOrigin(request: Request): string | null {
  const allowed = allowedOrigins();
  const origin = request.headers.get("origin");
  if (origin) return allowed.includes(origin) ? origin : null;

  // Some privacy tooling strips Origin; fall back to Referer.
  const referer = request.headers.get("referer");
  if (referer) {
    const match = allowed.find(
      (o) => referer === o || referer.startsWith(`${o}/`)
    );
    return match ?? null;
  }
  return null;
}

/**
 * Client IP for rate limiting, or null if it can't be established.
 *
 * `x-nf-client-connection-ip` is set by Netlify's edge and cannot be forged by
 * the client, so it is the only source trusted in production.
 * `x-forwarded-for` is a local/dev fallback only — treating it as
 * authoritative in production would let an attacker reset their own limit by
 * rotating the header.
 *
 * Returns null rather than a placeholder on purpose: bucketing every
 * unidentifiable request under one key would turn a per-IP limit into a global
 * one and lock the whole site out of signing up. Callers skip IP limiting when
 * this is null and rely on the per-mailbox and global caps instead.
 */
export function clientIp(request: Request): string | null {
  const netlifyIp = request.headers.get("x-nf-client-connection-ip");
  if (netlifyIp?.trim()) return netlifyIp.trim();
  if (process.env.NODE_ENV !== "production") {
    const xff = request.headers.get("x-forwarded-for");
    if (xff?.trim()) return xff.split(",")[0].trim();
  }
  return null;
}
