import { NextResponse, after } from "next/server";

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";
const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";
const OWNER_EMAIL = "florence@innercreate.com";

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

async function notifyOwner(subscriberEmail: string, apiKey: string) {
  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "Innercreate", email: OWNER_EMAIL },
        to: [{ email: OWNER_EMAIL, name: "Florence" }],
        replyTo: { email: subscriberEmail },
        subject: `New subscriber — ${subscriberEmail}`,
        htmlContent: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:480px;color:#1a1612;line-height:1.5"><p style="font-size:16px;margin:0 0 12px">Someone just joined your newsletter on innercreate.com.</p><p style="font-size:18px;font-weight:600;margin:0 0 16px">${subscriberEmail}</p><p style="font-size:13px;color:#666;margin:0">They've been added to your <strong>innercreate-newsletter</strong> list in Brevo. Reply to this email to write back to them directly.</p></div>`,
        textContent: `Someone just joined your newsletter on innercreate.com:\n\n${subscriberEmail}\n\nThey've been added to your innercreate-newsletter list in Brevo. Reply to this email to write back to them directly.`,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(
        `[Newsletter] Notification email failed ${res.status}: ${txt}`
      );
    }
  } catch (err) {
    console.error("[Newsletter] Notification email error:", err);
  }
}

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listIdRaw = process.env.BREVO_LIST_ID;
  const listId = listIdRaw ? Number.parseInt(listIdRaw, 10) : NaN;

  if (!apiKey || !Number.isFinite(listId)) {
    console.error(
      "[Newsletter] Missing BREVO_API_KEY or BREVO_LIST_ID env vars"
    );
    return NextResponse.json(
      { error: "Newsletter signup is not configured." },
      { status: 500 }
    );
  }

  const trimmed = (email as string).trim().toLowerCase();

  let brevoRes: Response;
  try {
    brevoRes = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email: trimmed,
        listIds: [listId],
        updateEnabled: true,
      }),
    });
  } catch (err) {
    console.error("[Newsletter] Brevo network error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 502 }
    );
  }

  // 201: new contact created. 204: existing contact updated / added to list.
  if (brevoRes.status === 201) {
    // Truly new subscriber — fire owner notification after response is sent.
    after(() => notifyOwner(trimmed, apiKey));
    return NextResponse.json({ success: true });
  }

  if (brevoRes.status === 204) {
    return NextResponse.json({ success: true });
  }

  let body: { code?: string; message?: string } = {};
  try {
    body = (await brevoRes.json()) as typeof body;
  } catch {
    // non-JSON body, ignore
  }

  if (brevoRes.status === 400 && body.code === "duplicate_parameter") {
    return NextResponse.json({ success: true, alreadySubscribed: true });
  }

  console.error(
    `[Newsletter] Brevo error ${brevoRes.status} ${body.code ?? ""}: ${body.message ?? ""}`
  );
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 502 }
  );
}
