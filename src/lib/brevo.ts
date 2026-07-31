/**
 * Brevo transactional email + contact helpers.
 *
 * Nothing here is called until a subscriber has confirmed, except
 * `sendConfirmationEmail` — that ordering is the whole point of double opt-in.
 */

const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";
const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

// Public-facing sender for all newsletter mail. Aliased in Google Workspace
// to florence@innercreate.com so replies land in Florence's main inbox.
const SENDER_EMAIL = "hello@innercreate.com";
const SENDER_NAME = "Innercreate";
// Where new-subscriber notifications are delivered.
const OWNER_EMAIL = "florence@innercreate.com";

const CONFIRM_SUBJECT = "Please confirm your subscription";
const WELCOME_SUBJECT = "A note from Florence";

export type BrevoConfig = { apiKey: string; listId: number };

/**
 * Addresses are validated before they reach here, but they are still
 * user-supplied text being interpolated into an email Florence opens — escape
 * at the point of use rather than relying on validation alone.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(inner: string) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#faf6ef;font-family:Georgia,'Cormorant Garamond',serif;color:#1a1612;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#faf6ef;">
<tr><td align="center" style="padding:56px 24px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="520" style="max-width:520px;width:100%;">
<tr><td style="padding:0 8px;">
${inner}
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

async function send(
  apiKey: string,
  payload: Record<string, unknown>,
  label: string
): Promise<boolean> {
  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error(`[Newsletter] ${label} failed ${res.status}: ${txt}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Newsletter] ${label} error:`, err);
    return false;
  }
}

/**
 * The only mail an unconfirmed address ever receives. One click-through link,
 * no marketing content — so if a bot submitted someone else's address, the
 * worst they get is a single "did you mean to do this?" note.
 */
export async function sendConfirmationEmail(
  to: string,
  confirmUrl: string,
  apiKey: string
): Promise<boolean> {
  const html = shell(
    `<p style="margin:0 0 28px;font-size:24px;font-weight:400;color:#1a1612;letter-spacing:0.01em;line-height:1.35;">One more step.</p>
<p style="margin:0 0 20px;font-size:17px;line-height:1.7;color:#3a342d;">Someone (hopefully you) asked to join the Innercreate newsletter with this address. Tap below to confirm and you&rsquo;re in.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 28px;"><tr><td style="background-color:#c4956a;border-radius:4px;">
<a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;font-family:-apple-system,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#1a1612;text-decoration:none;">Confirm subscription</a>
</td></tr></table>
<p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#6b6259;">If you didn&rsquo;t ask for this, just ignore this email &mdash; nothing will happen and you won&rsquo;t hear from us again. The link expires in 48 hours.</p>
<p style="margin:24px 0 0;font-size:13px;letter-spacing:0.06em;"><a href="https://innercreate.com" style="color:#c4956a;text-decoration:none;">innercreate.com</a></p>`
  );

  const text = `One more step.

Someone (hopefully you) asked to join the Innercreate newsletter with this address. Confirm here:

${confirmUrl}

If you didn't ask for this, just ignore this email — nothing will happen and you won't hear from us again. The link expires in 48 hours.

innercreate.com`;

  return send(
    apiKey,
    {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      replyTo: { name: SENDER_NAME, email: SENDER_EMAIL },
      subject: CONFIRM_SUBJECT,
      htmlContent: html,
      textContent: text,
    },
    "Confirmation email"
  );
}

export async function sendWelcomeEmail(
  to: string,
  apiKey: string
): Promise<boolean> {
  const html = shell(
    `<p style="margin:0 0 28px;font-size:24px;font-weight:400;color:#1a1612;letter-spacing:0.01em;line-height:1.35;">Thank you for being here.</p>
<p style="margin:0 0 20px;font-size:17px;line-height:1.7;color:#3a342d;">I&rsquo;ll write to you once a month &mdash; songs, news, a little of what&rsquo;s on my mind.</p>
<p style="margin:0 0 36px;font-size:17px;line-height:1.7;color:#3a342d;">No noise, I promise.</p>
<p style="margin:0 0 4px;font-size:17px;font-style:italic;color:#1a1612;line-height:1.5;">Love,<br>Florence x</p>
<p style="margin:24px 0 0;font-size:13px;letter-spacing:0.06em;"><a href="https://innercreate.com" style="color:#c4956a;text-decoration:none;">innercreate.com</a></p>`
  );

  const text = `Thank you for being here.

I'll write to you once a month — songs, news, a little of what's on my mind.

No noise, I promise.

Love,
Florence x

innercreate.com`;

  return send(
    apiKey,
    {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to }],
      replyTo: { name: SENDER_NAME, email: SENDER_EMAIL },
      subject: WELCOME_SUBJECT,
      htmlContent: html,
      textContent: text,
    },
    "Welcome email"
  );
}

export async function notifyOwner(
  subscriberEmail: string,
  apiKey: string
): Promise<boolean> {
  return send(
    apiKey,
    {
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: OWNER_EMAIL, name: "Florence" }],
      replyTo: { email: subscriberEmail },
      subject: `New subscriber — ${subscriberEmail}`,
      htmlContent: `<div style="font-family:-apple-system,system-ui,sans-serif;max-width:480px;color:#1a1612;line-height:1.5"><p style="font-size:16px;margin:0 0 12px">Someone just confirmed their subscription on innercreate.com.</p><p style="font-size:18px;font-weight:600;margin:0 0 16px">${escapeHtml(subscriberEmail)}</p><p style="font-size:13px;color:#666;margin:0">They confirmed via double opt-in, so this is a verified address. They&rsquo;ve been added to your <strong>innercreate-newsletter</strong> list in Brevo and have received the welcome email. Reply to this email to write back to them directly.</p></div>`,
      textContent: `Someone just confirmed their subscription on innercreate.com:\n\n${subscriberEmail}\n\nThey confirmed via double opt-in, so this is a verified address. They've been added to your innercreate-newsletter list in Brevo and have received the welcome email. Reply to this email to write back to them directly.`,
    },
    "Notification email"
  );
}

export type ContactState =
  /** On the newsletter list already — don't pester them again. */
  | "active"
  /** Hard-bounced or marked us as spam — must not be mailed again. */
  | "blacklisted"
  /** Known to Brevo but not on this list — fine to invite. */
  | "other-list"
  | "absent"
  | "unknown";

/**
 * Decides whether an address may be sent a confirmation at all.
 *
 * `blacklisted` is the important one. Brevo blacklists on hard bounce or spam
 * complaint, and all 15 addresses from the July 2026 bot run are in that state.
 * Re-mailing them is the single most damaging thing for sender reputation, so a
 * bot replaying the same harvested list must not be able to trigger it.
 */
export async function lookupContact(
  email: string,
  { apiKey, listId }: BrevoConfig
): Promise<ContactState> {
  try {
    const res = await fetch(
      `${BREVO_CONTACTS_URL}/${encodeURIComponent(email)}`,
      { headers: { accept: "application/json", "api-key": apiKey } }
    );
    if (res.status === 404) return "absent";
    if (!res.ok) return "unknown";
    const body = (await res.json()) as {
      emailBlacklisted?: boolean;
      listIds?: number[];
    };
    if (body.emailBlacklisted) return "blacklisted";
    if (!body.listIds?.includes(listId)) return "other-list";
    return "active";
  } catch (err) {
    console.error("[Newsletter] Contact lookup error:", err);
    return "unknown";
  }
}

export type AddContactResult = "created" | "existing" | "failed";

export async function addContact(
  email: string,
  { apiKey, listId }: BrevoConfig
): Promise<AddContactResult> {
  let res: Response;
  try {
    res = await fetch(BREVO_CONTACTS_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });
  } catch (err) {
    console.error("[Newsletter] Brevo network error:", err);
    return "failed";
  }

  // 201: new contact created. 204: existing contact updated / re-added —
  // which is also what a replayed confirmation link produces, so treating it
  // as "existing" keeps confirmation idempotent (no duplicate welcome mail).
  if (res.status === 201) return "created";
  if (res.status === 204) return "existing";

  let body: { code?: string; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // non-JSON body, ignore
  }
  if (res.status === 400 && body.code === "duplicate_parameter") {
    return "existing";
  }

  console.error(
    `[Newsletter] Brevo error ${res.status} ${body.code ?? ""}: ${body.message ?? ""}`
  );
  return "failed";
}
