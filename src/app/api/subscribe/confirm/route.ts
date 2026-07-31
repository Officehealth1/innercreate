import { NextResponse } from "next/server";
import {
  clientIp,
  isValidEmail,
  normalizeEmail,
  rateLimit,
  resolveTrustedOrigin,
  verifyConfirmToken,
} from "@/lib/newsletter";
import { addContact, notifyOwner, sendWelcomeEmail } from "@/lib/brevo";

export const runtime = "nodejs";

const IP_LIMIT = 20;
const IP_WINDOW_MS = 15 * 60 * 1000;

/**
 * Second half of double opt-in: the only path that can create a contact.
 *
 * Deliberately POST, not GET. Corporate link scanners and antivirus proxies
 * routinely fetch URLs in inbound mail; if confirmation happened on GET they
 * would auto-confirm bot-submitted addresses and defeat the whole mechanism.
 * The emailed link opens a page with a button that posts here.
 */
export async function POST(request: Request) {
  const origin = resolveTrustedOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Null IP (missing platform header) skips the limit rather than bucketing
  // every request together — see clientIp().
  const ip = clientIp(request);
  if (ip) {
    const limit = rateLimit(`confirm:${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(limit.retryAfterSeconds) },
        }
      );
    }
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

  const result = verifyConfirmToken(payload.token, secret);
  if (!result.ok) {
    const expired = result.reason === "expired";
    if (!expired) {
      console.warn(`[Newsletter] Bad confirm token (${result.reason}) from ${ip}`);
    }
    return NextResponse.json(
      {
        error: expired
          ? "That confirmation link has expired. Please sign up again."
          : "That confirmation link isn't valid. Please sign up again.",
        expired,
      },
      { status: 400 }
    );
  }

  // Re-normalise rather than trusting the token's stored form, so a token
  // minted before a normalisation change still lands on one canonical contact.
  const address = normalizeEmail(result.email);
  if (!isValidEmail(address)) {
    return NextResponse.json(
      { error: "That confirmation link isn't valid. Please sign up again." },
      { status: 400 }
    );
  }

  const outcome = await addContact(address, { apiKey, listId });
  if (outcome === "failed") {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  // Only a genuinely new contact triggers mail. A replayed link returns
  // "existing", so clicking twice never sends a second welcome.
  if (outcome === "created") {
    await Promise.allSettled([
      sendWelcomeEmail(address, apiKey),
      notifyOwner(address, apiKey),
    ]);
  }

  return NextResponse.json({ success: true, email: address });
}
