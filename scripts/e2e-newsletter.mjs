/**
 * E2E suite for the newsletter signup hardening (honeypot, origin allowlist,
 * rate limits, Gmail canonicalisation, double opt-in).
 *
 * Usage, from the repo root:
 *   npm run build
 *   NEWSLETTER_ALLOWED_ORIGINS=http://localhost:3000 npm start &
 *   node scripts/e2e-newsletter.mjs
 *
 * Run against a PRODUCTION build so the production code paths — strict origin
 * allowlist, no x-forwarded-for fallback — are the ones under test.
 *
 * The server must be freshly started: rate-limit counters live in process
 * memory, so a re-run against a warm server will trip the per-mailbox cap.
 *
 * This sends real mail to the owner's own mailbox and creates then deletes a
 * throwaway Brevo contact. It never mails an address we don't control.
 */
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const ORIGIN = process.env.TEST_ORIGIN || "http://localhost:3000";

const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const API_KEY = env.BREVO_API_KEY;
const SECRET = env.NEWSLETTER_SECRET;
if (!API_KEY || !SECRET) throw new Error("missing env");

const OWNER_MAILBOX = "florencedha@gmail.com";
// Unique per run: Brevo's transactional log is per-address history, so a fixed
// address would let a previous run's welcome email fail this run's
// "nothing sent before confirmation" assertion.
const TEST_ADDR = `florencedha+e2e${Date.now()}@gmail.com`;
const DOTTED = "f.l.o.r.e.n.c.e.d.h.a@gmail.com";
const HONEYPOT_PROBE = "honeypot-probe@innercreate.com";

/* ---------------------------------------------------------------- helpers */

let pass = 0;
const failures = [];

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function post(path, body, opts = {}) {
  const { origin = ORIGIN, ip = "203.0.113.1", raw } = opts;
  const headers = { "content-type": "application/json" };
  if (origin) headers.origin = origin;
  if (ip) headers["x-nf-client-connection-ip"] = ip;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: raw !== undefined ? raw : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, json, headers: res.headers };
}

async function brevo(path, init = {}) {
  return fetch(`https://api.brevo.com/v3${path}`, {
    ...init,
    headers: { accept: "application/json", "api-key": API_KEY, ...(init.headers || {}) },
  });
}

async function getContact(email) {
  const res = await brevo(`/contacts/${encodeURIComponent(email)}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

async function deleteContact(email) {
  const res = await brevo(`/contacts/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  return res.status;
}

/** Subjects of transactional emails Brevo has logged for an address. */
async function sentSubjects(email) {
  const res = await brevo(`/smtp/emails?email=${encodeURIComponent(email)}&limit=100`);
  if (!res.ok) return [];
  const d = await res.json();
  return (d.transactionalEmails || []).map((e) => e.subject);
}

/**
 * Brevo's log is eventually consistent — observed indexing lag is over a
 * minute, so poll generously rather than assuming a send failed.
 */
async function waitFor(fn, { timeoutMs = 240000, intervalMs = 5000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await fn()) return true;
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/** Independent HMAC implementation — cross-checks the app's signer. */
function mintToken(email, ttlSeconds) {
  const payload = { e: email, x: Math.floor(Date.now() / 1000) + ttlSeconds };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/* ------------------------------------------------------------------- run */

console.log(`\nE2E against ${BASE}\n`);

// Pre-clean so "contact must not exist yet" is a real assertion.
await deleteContact(TEST_ADDR);

console.log("Trust boundary");
{
  const r = await post("/api/subscribe", { email: "a@b.co" }, { origin: null, ip: "203.0.113.10" });
  check("POST with no Origin/Referer is rejected", r.status === 403, `got ${r.status}`);
}
{
  const r = await post("/api/subscribe", { email: "a@b.co" }, { origin: "https://evil.example", ip: "203.0.113.11" });
  check("POST from foreign Origin is rejected", r.status === 403, `got ${r.status}`);
}
{
  const r = await post("/api/subscribe/confirm", { token: "x" }, { origin: "https://evil.example", ip: "203.0.113.21" });
  check("Confirm from foreign Origin is rejected", r.status === 403, `got ${r.status}`);
}

console.log("\nInput validation");
{
  const r = await post("/api/subscribe", { email: "not-an-email" }, { ip: "203.0.113.12" });
  check("Invalid email rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await post("/api/subscribe", null, { raw: "{not json", ip: "203.0.113.13" });
  check("Malformed JSON rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await post("/api/subscribe", { email: 12345 }, { ip: "203.0.113.22" });
  check("Non-string email rejected", r.status === 400, `got ${r.status}`);
}

console.log("\nHoneypot");
const honeypotBefore = (await sentSubjects(HONEYPOT_PROBE)).length;
{
  const r = await post(
    "/api/subscribe",
    { email: HONEYPOT_PROBE, company: "Acme Corp" },
    { ip: "203.0.113.14" }
  );
  check("Honeypot submission returns normal success (no bot signal)", r.status === 200 && r.json?.success === true, `got ${r.status} ${JSON.stringify(r.json)}`);
}

console.log("\nGmail dot canonicalisation + existing-subscriber suppression");
const ownerBefore = (await sentSubjects(OWNER_MAILBOX)).length;
{
  const r = await post("/api/subscribe", { email: DOTTED }, { ip: "203.0.113.15" });
  check("Dotted variant accepted with uniform response", r.status === 200 && r.json?.success === true, `got ${r.status}`);
  const dottedSends = await sentSubjects(DOTTED);
  check("No mail sent to the dotted alias itself", dottedSends.length === 0, `${dottedSends.length} found`);
}

console.log("\nDouble opt-in: signup sends confirmation only");
{
  const r = await post("/api/subscribe", { email: TEST_ADDR }, { ip: "203.0.113.16" });
  check("Signup accepted", r.status === 200 && r.json?.success === true, `got ${r.status} ${JSON.stringify(r.json)}`);

  const contact = await getContact(TEST_ADDR);
  check("Contact NOT created before confirmation", contact === null, contact ? "contact exists" : "");

  const got = await waitFor(async () =>
    (await sentSubjects(TEST_ADDR)).some((s) => /confirm/i.test(s))
  );
  check("Confirmation email was sent", got);

  const subjects = await sentSubjects(TEST_ADDR);
  check(
    "Welcome email NOT sent before confirmation",
    !subjects.some((s) => /note from florence/i.test(s)),
    JSON.stringify(subjects)
  );
}

// Checked after the sends above have had time to land.
{
  const ownerAfter = (await sentSubjects(OWNER_MAILBOX)).length;
  check(
    "Active subscriber received no duplicate confirmation",
    ownerAfter === ownerBefore,
    `before=${ownerBefore} after=${ownerAfter}`
  );
  const honeypotAfter = (await sentSubjects(HONEYPOT_PROBE)).length;
  check(
    "Honeypot submission sent no mail at all",
    honeypotAfter === honeypotBefore,
    `before=${honeypotBefore} after=${honeypotAfter}`
  );
}

console.log("\nBlacklisted addresses are never re-mailed");
{
  // Build a throwaway blacklisted contact rather than probing one of the 15
  // real bot-run victims — if the suppression regressed, this test must not be
  // what sends mail to a stranger.
  //
  // Deliberately a DIFFERENT mailbox from TEST_ADDR. Keyed on florencedha this
  // would be the 3rd hit on that mailbox and the per-mailbox cooldown would
  // suppress the send on its own, so the assertion below would pass without
  // the blacklist check doing any work at all.
  const blacklisted = `team+blk${Date.now()}@irislab.com`;
  await brevo("/contacts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: blacklisted, emailBlacklisted: true }),
  });
  const created = await getContact(blacklisted);
  check("Blacklisted fixture created", created?.emailBlacklisted === true, JSON.stringify(created?.emailBlacklisted));

  const r = await post("/api/subscribe", { email: blacklisted }, { ip: "203.0.113.30" });
  check("Blacklisted address gets uniform success", r.status === 200 && r.json?.success === true, `got ${r.status}`);
  await new Promise((res) => setTimeout(res, 10000));
  const sends = await sentSubjects(blacklisted);
  check("No confirmation sent to blacklisted address", sends.length === 0, JSON.stringify(sends));
  await deleteContact(blacklisted);
}

console.log("\nAddress validation hardening");
for (const bad of ['<b>x</b>@evil.co', 'a"b@evil.co', "a<script>@x.co", "a@b", "a@b.c_d"]) {
  const r = await post("/api/subscribe", { email: bad }, { ip: "203.0.113.31" });
  check(`Rejects ${JSON.stringify(bad)}`, r.status === 400, `got ${r.status}`);
}
// The accept side of validation is already covered above: DOTTED exercises
// dots and TEST_ADDR exercises +tags and digits, both accepted. Asserting it
// again with a fresh address would mean sending mail to an address nobody
// owns, which is the exact bounce behaviour this whole change exists to stop.

console.log("\nToken integrity");
{
  const valid = mintToken(TEST_ADDR, 3600);
  const tampered = valid.slice(0, -3) + (valid.slice(-3) === "AAA" ? "BBB" : "AAA");
  const r = await post("/api/subscribe/confirm", { token: tampered }, { ip: "203.0.113.17" });
  check("Tampered signature rejected", r.status === 400, `got ${r.status}`);
}
{
  // Re-sign a payload claiming a different address — the classic forgery.
  const body = Buffer.from(JSON.stringify({ e: "attacker@evil.example", x: Math.floor(Date.now() / 1000) + 3600 }), "utf8").toString("base64url");
  const forged = `${body}.${createHmac("sha256", "wrong-secret").update(body).digest("base64url")}`;
  const r = await post("/api/subscribe/confirm", { token: forged }, { ip: "203.0.113.23" });
  check("Token signed with wrong secret rejected", r.status === 400, `got ${r.status}`);
  const c = await getContact("attacker@evil.example");
  check("Forged token created no contact", c === null);
}
{
  const expired = mintToken(TEST_ADDR, -60);
  const r = await post("/api/subscribe/confirm", { token: expired }, { ip: "203.0.113.18" });
  check("Expired token rejected", r.status === 400 && r.json?.expired === true, `got ${r.status} ${JSON.stringify(r.json)}`);
}
{
  const r = await post("/api/subscribe/confirm", { token: 12345 }, { ip: "203.0.113.24" });
  check("Non-string token rejected", r.status === 400, `got ${r.status}`);
}

console.log("\nConfirmation completes the subscription");
const confirmToken = mintToken(TEST_ADDR, 3600);
{
  const r = await post("/api/subscribe/confirm", { token: confirmToken }, { ip: "203.0.113.19" });
  check("Valid confirmation accepted", r.status === 200 && r.json?.success === true, `got ${r.status} ${JSON.stringify(r.json)}`);

  const contact = await getContact(TEST_ADDR);
  check("Contact created on confirmation", contact !== null);
  check("Contact added to newsletter list", !!contact?.listIds?.includes(3), JSON.stringify(contact?.listIds));

  const welcomed = await waitFor(async () =>
    (await sentSubjects(TEST_ADDR)).some((s) => /note from florence/i.test(s))
  );
  check("Welcome email sent after confirmation", welcomed);

  const ownerNotified = await waitFor(async () =>
    (await sentSubjects("florence@innercreate.com")).some((s) => s.includes(TEST_ADDR))
  );
  check("Owner notification sent after confirmation", ownerNotified);
}

console.log("\nReplay safety");
{
  const r = await post("/api/subscribe/confirm", { token: confirmToken }, { ip: "203.0.113.20" });
  check("Replayed confirmation still succeeds (idempotent)", r.status === 200, `got ${r.status}`);

  // Assert the absolute invariant — exactly one welcome for this address —
  // rather than comparing against a count read before the replay. Brevo's log
  // lags by up to a minute, so a before/after delta can read 0 then 1 purely
  // from indexing catching up and report a phantom duplicate.
  await new Promise((res) => setTimeout(res, 90000));
  const welcomes = (await sentSubjects(TEST_ADDR)).filter((s) => /note from florence/i.test(s)).length;
  check("Exactly one welcome email exists after replay", welcomes === 1, `found ${welcomes}`);
}

console.log("\nRate limiting");
{
  const ip = "198.51.100.77";
  const codes = [];
  for (let i = 0; i < 6; i++) {
    const r = await post("/api/subscribe", { email: `rl${i}@innercreate.com` }, { ip });
    codes.push(r.status);
    if (r.status === 429) {
      check("429 carries Retry-After header", !!r.headers.get("retry-after"), "missing");
    }
  }
  check(
    "6th request from same IP is rate limited",
    codes[5] === 429,
    `codes=${codes.join(",")}`
  );
  const other = await post("/api/subscribe", { email: "rl-other@innercreate.com" }, { ip: "198.51.100.78" });
  check("Different IP is unaffected by that limit", other.status !== 429, `got ${other.status}`);
}

console.log("\nConfirmation page");
{
  const res = await fetch(`${BASE}/subscribe/confirm?token=${encodeURIComponent(confirmToken)}`);
  const html = await res.text();
  check("Confirm page renders", res.status === 200, `got ${res.status}`);
  check("Confirm page shows an explicit opt-in button", /Yes, subscribe me/.test(html));
  check("Confirm page is noindex", /noindex/i.test(html));
  const bare = await fetch(`${BASE}/subscribe/confirm`);
  check("Confirm page without token shows guidance", (await bare.text()).includes("Link incomplete"));
}

/* --------------------------------------------------------------- cleanup */
console.log("\nCleanup");
const del = await deleteContact(TEST_ADDR);
check("Test contact removed from Brevo", del === 204, `status ${del}`);

console.log(`\n${"─".repeat(60)}`);
console.log(`${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  • ${f}`);
  process.exit(1);
}
console.log("ALL GREEN");
