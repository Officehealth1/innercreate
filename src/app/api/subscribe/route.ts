import { NextResponse } from "next/server";

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";
const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

// Public-facing sender for all newsletter mail. Aliased in Google Workspace
// to florence@innercreate.com so replies land in Florence's main inbox.
const SENDER_EMAIL = "hello@innercreate.com";
const SENDER_NAME = "Innercreate";
// Where new-subscriber notifications are delivered.
const OWNER_EMAIL = "florence@innercreate.com";

const WELCOME_SUBJECT = "A note from Florence";

const WELCOME_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${WELCOME_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#faf6ef;font-family:Georgia,'Cormorant Garamond',serif;color:#1a1612;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#faf6ef;">
<tr><td align="center" style="padding:56px 24px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;width:100%;">
<tr><td style="padding:0 8px;">
<p style="margin:0 0 28px;font-size:24px;font-weight:400;color:#1a1612;letter-spacing:0.01em;line-height:1.35;">Thank you for being here.</p>
<p style="margin:0 0 20px;font-size:17px;line-height:1.7;color:#3a342d;">I&rsquo;ll write to you once a month &mdash; songs, news, a little of what&rsquo;s on my mind.</p>
<p style="margin:0 0 36px;font-size:17px;line-height:1.7;color:#3a342d;">No noise, I promise.</p>
<p style="margin:0 0 4px;font-size:17px;font-style:italic;color:#1a1612;line-height:1.5;">Love,<br>Florence x</p>
<p style="margin:24px 0 0;font-size:13px;letter-spacing:0.06em;"><a href="https://innercreate.com" style="color:#c4956a;text-decoration:none;">innercreate.com</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const WELCOME_TEXT = `Thank you for being here.

I'll write to you once a month — songs, news, a little of what's on my mind.

No noise, I promise.

Love,
Florence x

innercreate.com`;

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

async function sendWelcomeEmail(subscriberEmail: string, apiKey: string) {
  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: subscriberEmail }],
        replyTo: { name: SENDER_NAME, email: SENDER_EMAIL },
        subject: WELCOME_SUBJECT,
        htmlContent: WELCOME_HTML,
        textContent: WELCOME_TEXT,
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(
        `[Newsletter] Welcome email failed ${res.status}: ${txt}`
      );
    }
  } catch (err) {
    console.error("[Newsletter] Welcome email error:", err);
  }
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
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: OWNER_EMAIL, name: "Florence" }],
        replyTo: { email: subscriberEmail },
        subject: `New subscriber — ${subscriberEmail}`,
        htmlContent: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:480px;color:#1a1612;line-height:1.5"><p style="font-size:16px;margin:0 0 12px">Someone just joined your newsletter on innercreate.com.</p><p style="font-size:18px;font-weight:600;margin:0 0 16px">${subscriberEmail}</p><p style="font-size:13px;color:#666;margin:0">They&rsquo;ve been added to your <strong>innercreate-newsletter</strong> list in Brevo and have received the welcome email. Reply to this email to write back to them directly.</p></div>`,
        textContent: `Someone just joined your newsletter on innercreate.com:\n\n${subscriberEmail}\n\nThey've been added to your innercreate-newsletter list in Brevo and have received the welcome email. Reply to this email to write back to them directly.`,
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

  // 201: new contact created — send welcome + owner notification.
  // Awaited (not deferred via after()) so the sends reliably run on
  // serverless platforms that freeze the function after the response.
  // Both helpers swallow their own errors, so a mail failure never
  // blocks the success response — the contact is already saved.
  if (brevoRes.status === 201) {
    await Promise.allSettled([
      sendWelcomeEmail(trimmed, apiKey),
      notifyOwner(trimmed, apiKey),
    ]);
    return NextResponse.json({ success: true });
  }

  // 204: existing contact updated / re-added — silently dedupe, no email.
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
