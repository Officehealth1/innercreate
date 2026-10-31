/**
 * E2E checks for the cookie choices bar, Microsoft Clarity and Google Analytics.
 *
 * Usage, from the repo root:
 *   NEXT_PUBLIC_CLARITY_PROJECT_ID=<id> npm run build
 *   npm start -- -p 3100 &
 *   BASE_URL=http://localhost:3100 node scripts/e2e-consent.mjs
 *
 * BASE_URL=https://deploy-preview-N--innercreate.netlify.app checks a preview.
 * EXPECT_CLARITY=no checks a build made without the project id.
 * SCREENSHOT_DIR=<folder> saves the bar at 320, 375 and 1280 px.
 *
 * Drives the installed Google Chrome, so no browser download. Costs nothing,
 * but sends a few real visits to the Clarity project and to Google Analytics.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const EXPECT_CLARITY = process.env.EXPECT_CLARITY !== "no";
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR;
const CONFIRM_VALUE = "e2e-placeholder-value";

const CLARITY_HOST = /clarity\.ms|\.bing\.com/;
const COLLECT = /clarity\.ms\/collect/;
const GA_HOST = /googletagmanager\.com|google-analytics\.com/;
const CLARITY_COOKIE = /^(_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)$/;

let pass = 0;
const failures = [];

function check(name, cond, detail = "") {
  if (cond) {
    pass++;
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
  } else {
    failures.push(`${name}${detail ? ` - ${detail}` : ""}`);
    console.log(`  \x1b[31mFAIL\x1b[0m ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

/* One fresh browser profile per scenario, with its requests written down. */
async function visitor(browser, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    ...options,
  });
  const page = await context.newPage();
  const seen = { clarity: [], ga: [], errors: [] };
  page.on("request", (request) => {
    if (CLARITY_HOST.test(request.url())) seen.clarity.push(request);
    if (GA_HOST.test(request.url())) seen.ga.push(request);
  });
  page.on("pageerror", (error) => seen.errors.push(error.message));
  const cookies = async () => context.cookies();
  const named = async (name) => (await cookies()).find((c) => c.name === name);
  return { context, page, seen, cookies, named };
}

const bar = (page) => page.getByRole("region", { name: "Cookie choices" });

async function gotoHome(page, path = "/") {
  await page.goto(`${BASE}${path}`, { waitUntil: "load" });
}

/* Clarity uploads on a timer, so give it time before saying what did not happen. */
async function waitForCollect(page, seen) {
  if (!EXPECT_CLARITY) return page.waitForTimeout(3000);
  if (seen.clarity.some((r) => COLLECT.test(r.url()))) return;
  await page
    .waitForRequest(COLLECT, { timeout: 20000 })
    .catch(() => check("Clarity sent a collect request", false, "none in 20 s"));
}

async function waitForCookie(named, page, name) {
  for (let i = 0; i < 40; i++) {
    const found = await named(name);
    if (found) return found;
    await page.waitForTimeout(500);
  }
  return undefined;
}

/* ---------------------------------------------------------------- scenarios */

async function beforeAnyAnswer(browser) {
  console.log("\n1. Before any answer");
  const v = await visitor(browser);
  await gotoHome(v.page);
  await waitForCollect(v.page, v.seen);

  check("the bar is visible", await bar(v.page).isVisible().catch(() => false));
  check(
    "the Clarity tag loaded or was left out as this build expects",
    v.seen.clarity.length > 0 === EXPECT_CLARITY
  );

  const all = await v.cookies();
  console.log(`  cookies set: ${all.map((c) => `${c.name} (${c.domain})`).join(", ") || "none"}`);
  check(
    "no Clarity cookie before the answer",
    !all.some((c) => CLARITY_COOKIE.test(c.name)),
    all.map((c) => c.name).join(",")
  );
  check("no consent_choice cookie before the answer", !all.some((c) => c.name === "consent_choice"));
  check("no Google Analytics cookie before the answer", !all.some((c) => c.name.startsWith("_ga")));
  check("no Google Analytics request before the answer", v.seen.ga.length === 0, `${v.seen.ga.length} sent`);

  const collects = v.seen.clarity.filter((r) => COLLECT.test(r.url()));
  let withCookie = 0;
  for (const request of collects) {
    const header = (await request.allHeaders()).cookie || "";
    if (/_clck|_clsk|MUID|CLID/.test(header)) withCookie++;
  }
  check("no collect request carries a Clarity cookie", withCookie === 0, `${withCookie} of ${collects.length}`);
  check("no script error", v.seen.errors.length === 0, v.seen.errors.join(" | "));
  await v.context.close();
}

async function accept(browser) {
  console.log("\n2. Accept");
  const v = await visitor(browser);
  await gotoHome(v.page);
  const before = v.seen.clarity.filter((r) => COLLECT.test(r.url())).length;
  await bar(v.page).getByRole("button", { name: "Accept" }).click();

  check("the bar closes", await bar(v.page).isHidden().catch(() => false));
  const saved = await v.named("consent_choice");
  check("consent_choice is granted", saved?.value === "granted", saved?.value);
  check("consent_choice is Path=/", saved?.path === "/");
  check("consent_choice is SameSite=Lax", saved?.sameSite === "Lax", saved?.sameSite);
  check("consent_choice is Secure", saved?.secure === true);
  const days = saved ? (saved.expires - Date.now() / 1000) / 86400 : 0;
  check("consent_choice lasts six months", days > 179 && days < 181, `${days} days`);

  if (EXPECT_CLARITY) {
    const clck = await waitForCookie(v.named, v.page, "_clck");
    const clsk = await waitForCookie(v.named, v.page, "_clsk");
    check("_clck appears", Boolean(clck));
    check("_clsk appears", Boolean(clsk));
    await v.page.waitForRequest(COLLECT, { timeout: 20000 }).catch(() => {});
    const after = v.seen.clarity.filter((r) => COLLECT.test(r.url())).length;
    check("a collect request goes out after Accept", after > before, `${before} then ${after}`);

    await gotoHome(v.page, "/privacy");
    await v.page.waitForTimeout(1500);
    const firstPart = (cookie) => decodeURIComponent(cookie?.value ?? "").split("^")[0];
    const clck2 = await v.named("_clck");
    const clsk2 = await v.named("_clsk");
    check("the visitor id survives a second page", firstPart(clck) && firstPart(clck2) === firstPart(clck));
    check("the session id survives a second page", firstPart(clsk) && firstPart(clsk2) === firstPart(clsk));
  }

  await v.page.waitForRequest(GA_HOST, { timeout: 15000 }).catch(() => {});
  check("Google Analytics loads after Accept", v.seen.ga.length > 0);

  await gotoHome(v.page);
  check("the bar stays closed on the next visit", await bar(v.page).isHidden().catch(() => false));
  check("no script error", v.seen.errors.length === 0, v.seen.errors.join(" | "));
  await v.context.close();
}

async function decline(browser) {
  console.log("\n3. Decline, then change your mind, then decline again");
  const v = await visitor(browser);
  await gotoHome(v.page);
  await bar(v.page).getByRole("button", { name: "Decline" }).click();
  check("the bar closes", await bar(v.page).isHidden().catch(() => false));
  check("consent_choice is denied", (await v.named("consent_choice"))?.value === "denied");

  await waitForCollect(v.page, v.seen);
  await v.page.waitForTimeout(3000);
  const all = await v.cookies();
  console.log(`  cookies set: ${all.map((c) => `${c.name} (${c.domain})`).join(", ") || "none"}`);
  check("no Clarity cookie after Decline", !all.some((c) => CLARITY_COOKIE.test(c.name)));
  check("no Google Analytics after Decline", v.seen.ga.length === 0, `${v.seen.ga.length} sent`);

  await gotoHome(v.page);
  check("the bar stays closed on the next visit", await bar(v.page).isHidden().catch(() => false));

  const reopen = v.page.locator("footer").getByRole("button", { name: "Cookie choices" });
  await reopen.click();
  check("the footer's Cookie choices reopens the bar", await bar(v.page).isVisible().catch(() => false));
  check(
    "focus moves into the bar",
    await v.page.evaluate(() => document.activeElement?.id === "consent-bar")
  );

  await bar(v.page).getByRole("button", { name: "Accept" }).click();
  check(
    "focus returns to the footer control",
    await v.page.evaluate(() => document.activeElement?.hasAttribute("data-consent-open"))
  );
  if (EXPECT_CLARITY) check("_clck appears after a later Accept", Boolean(await waitForCookie(v.named, v.page, "_clck")));
  const ga = await waitForCookie(v.named, v.page, "_ga");
  check("Google Analytics runs after a later Accept", Boolean(ga));

  await reopen.click();
  await bar(v.page).getByRole("button", { name: "Decline" }).click();
  await v.page.waitForTimeout(2000);
  const after = await v.cookies();
  console.log(`  cookies set: ${after.map((c) => `${c.name} (${c.domain})`).join(", ") || "none"}`);
  check("withdrawing clears Clarity's cookies", !after.some((c) => /^(_clck|_clsk)$/.test(c.name)));
  check("withdrawing clears Google Analytics' cookies", !after.some((c) => c.name.startsWith("_ga")));
  const gaBefore = v.seen.ga.length;
  await v.page.mouse.wheel(0, 2000);
  await v.page.waitForTimeout(3000);
  check("Google Analytics sends nothing after withdrawing", v.seen.ga.length === gaBefore);
  check("no script error", v.seen.errors.length === 0, v.seen.errors.join(" | "));
  await v.context.close();
}

async function excludedRoutes(browser) {
  console.log("\n4. Routes that never load the tag");
  const paths = [`/subscribe/confirm?token=${CONFIRM_VALUE}`, "/subscribe/confirm", "/no-such-page"];
  for (const path of paths) {
    for (const answered of [false, true]) {
      const v = await visitor(browser);
      if (answered) {
        await v.context.addCookies([{ name: "consent_choice", value: "granted", url: BASE }]);
      }
      await v.page.goto(`${BASE}${path}`, { waitUntil: "load" });
      await v.page.waitForTimeout(4000);
      const label = `${path}${answered ? " (accepted earlier)" : ""}`;
      check(`${label}: nothing from Clarity`, v.seen.clarity.length === 0, `${v.seen.clarity.length} requests`);
      check(`${label}: nothing from Google Analytics`, v.seen.ga.length === 0, `${v.seen.ga.length} requests`);
      check(`${label}: no bar`, await bar(v.page).isHidden().catch(() => false));
      await v.context.close();
    }
  }
}

/* The token holds the subscriber's e-mail, so it must not reach the tags on the next page either. */
async function tokenStaysHome(browser) {
  console.log("\n5. The confirm link's token never reaches the tags");
  const v = await visitor(browser);
  await v.context.addCookies([{ name: "consent_choice", value: "granted", url: BASE }]);
  await v.page.route("**/api/subscribe/confirm", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
  await v.page.goto(`${BASE}/subscribe/confirm?token=${CONFIRM_VALUE}`, { waitUntil: "load" });
  await v.page.getByRole("button", { name: "Yes, subscribe me" }).click();
  await v.page.getByRole("link", { name: "Back to innercreate.com" }).click();
  await v.page.waitForURL(`${BASE}/`);
  await v.page.waitForRequest(GA_HOST, { timeout: 15000 }).catch(() => {});
  await v.page.waitForTimeout(4000);

  const urls = [...v.seen.clarity, ...v.seen.ga].map((r) => r.url());
  check("the tags load on the home page", urls.length > 0);
  check("no tag request carries the token", !urls.some((u) => u.includes(CONFIRM_VALUE)));
  check("document.referrer holds no token", !(await v.page.evaluate(() => document.referrer)).includes(CONFIRM_VALUE));

  await v.page.goBack().catch(() => {});
  await v.page.waitForTimeout(500);
  check("Back does not return to the token address", !v.page.url().includes(CONFIRM_VALUE), v.page.url());
  await v.context.close();

  const hard = await visitor(browser);
  await hard.context.addCookies([{ name: "consent_choice", value: "granted", url: BASE }]);
  await hard.page.goto(`${BASE}/subscribe/confirm?token=${CONFIRM_VALUE}`, { waitUntil: "load" });
  await hard.page.evaluate(() => {
    location.href = "/";
  });
  await hard.page.waitForURL(`${BASE}/`);
  check(
    "a full page load from the confirm page gets no referrer",
    !(await hard.page.evaluate(() => document.referrer)).includes(CONFIRM_VALUE)
  );
  await hard.context.close();
}

async function layoutAndKeyboard(browser) {
  console.log("\n6. Layout, keyboard and the privacy page");
  if (SCREENSHOT_DIR) mkdirSync(SCREENSHOT_DIR, { recursive: true });

  for (const width of [320, 375, 1280]) {
    const v = await visitor(browser, { viewport: { width, height: width === 1280 ? 800 : 700 } });
    await gotoHome(v.page);
    await bar(v.page).waitFor({ timeout: 5000 }).catch(() => {});
    const accept = bar(v.page).getByRole("button", { name: "Accept" });
    const reject = bar(v.page).getByRole("button", { name: "Decline" });
    const a = await accept.boundingBox().catch(() => null);
    const d = await reject.boundingBox().catch(() => null);
    const inside = (box) => box && box.x >= 0 && box.x + box.width <= width;
    check(`${width} px: both buttons sit inside the screen`, inside(a) && inside(d));
    check(`${width} px: the buttons are the same size`, a && d && a.width === d.width && a.height === d.height);
    check(`${width} px: the buttons are at least 44 px tall`, a && a.height >= 44, `${a?.height}`);
    const barBox = await bar(v.page).boundingBox().catch(() => null);
    check(`${width} px: the bar fits the screen`, barBox && barBox.x === 0 && barBox.width === width, `${barBox?.width}`);
    // At 320 px the newsletter form already pushes the page 42 px wide, with or without the bar.
    if (width > 320) {
      const overflow = await v.page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      check(`${width} px: no sideways scroll`, !overflow);
    }
    if (SCREENSHOT_DIR) {
      await v.page.waitForTimeout(2500);
      await v.page.screenshot({ path: join(SCREENSHOT_DIR, `home-bar-${width}.png`) });
      await v.page.goto(`${BASE}/privacy`, { waitUntil: "load" });
      await v.page.waitForTimeout(800);
      await v.page.screenshot({ path: join(SCREENSHOT_DIR, `privacy-bar-${width}.png`) });
      await v.page.evaluate(() => document.getElementById("consent-bar")?.remove());
      await v.page.screenshot({ path: join(SCREENSHOT_DIR, `privacy-${width}.png`), fullPage: true });
      await gotoHome(v.page);
      await v.page.locator("footer").getByRole("button", { name: "Cookie choices" }).scrollIntoViewIfNeeded();
      await v.page.evaluate(() => document.getElementById("consent-bar")?.remove());
      await v.page.waitForTimeout(1500);
      await v.page.screenshot({ path: join(SCREENSHOT_DIR, `footer-${width}.png`) });
    }
    await v.context.close();
  }

  const v = await visitor(browser);
  await gotoHome(v.page);
  await bar(v.page).waitFor({ timeout: 5000 }).catch(() => {});
  const reached = [];
  for (let i = 0; i < 4; i++) {
    await v.page.keyboard.press("Tab");
    reached.push(await v.page.evaluate(() => document.activeElement?.textContent?.trim()));
  }
  check("Tab reaches Accept and Decline first", reached.includes("Accept") && reached.includes("Decline"), reached.join(", "));
  const modal = await bar(v.page).getAttribute("aria-modal").catch(() => null);
  check("the bar is not a modal", modal === null);

  const privacy = await v.page.locator("footer").getByRole("link", { name: "Privacy" }).getAttribute("href").catch(() => null);
  check("the footer links to the privacy page", privacy === "/privacy", privacy);
  const response = await v.page.goto(`${BASE}/privacy`);
  check("the privacy page answers 200", response?.status() === 200, `${response?.status()}`);
  const text = await v.page.locator("main").innerText().catch(() => "");
  check(
    "the privacy page carries the agreed Clarity paragraph",
    text.includes(
      "We use Microsoft Clarity to see how visitors use the public pages of this site (mouse movement, clicks, scrolling, page views). Text you type is never recorded. Microsoft collects this data under its own privacy statement and may use it for its own purposes. We set its cookies only if you accept them."
    )
  );
  const statement = await v.page.getByRole("link", { name: "privacy statement" }).getAttribute("href").catch(() => null);
  check("the paragraph links to Microsoft's privacy statement", /microsoft\.com\/.*privacy/.test(statement || ""), statement);
  const canonical = await v.page.locator('link[rel="canonical"]').getAttribute("href").catch(() => null);
  check("the privacy page has its own canonical address", canonical === "https://innercreate.com/privacy", canonical);
  await bar(v.page).getByRole("button", { name: "Decline" }).click();
  await v.page.locator("main").getByRole("button", { name: "Cookie choices" }).click();
  check("the privacy page's Cookie choices reopens the bar", await bar(v.page).isVisible().catch(() => false));
  await v.context.close();
}

async function failurePaths(browser) {
  console.log("\n7. When something fails");
  const blocked = await visitor(browser);
  await blocked.page.route(CLARITY_HOST, (route) => route.abort());
  await blocked.page.route(GA_HOST, (route) => route.abort());
  await gotoHome(blocked.page);
  await bar(blocked.page).getByRole("button", { name: "Accept" }).click();
  await blocked.page.waitForTimeout(2000);
  check("an ad blocker breaks nothing: the page still shows", await blocked.page.locator("main").isVisible());
  check("an ad blocker breaks nothing: no script error", blocked.seen.errors.length === 0, blocked.seen.errors.join(" | "));
  await blocked.context.close();

  const noJs = await visitor(browser, { javaScriptEnabled: false });
  await gotoHome(noJs.page);
  check("no JavaScript: the page still shows", await noJs.page.locator("main").isVisible());
  check("no JavaScript: no bar", await bar(noJs.page).isHidden().catch(() => false));
  check("no JavaScript: no cookies", (await noJs.cookies()).length === 0);
  check("no JavaScript: no tags", noJs.seen.clarity.length === 0 && noJs.seen.ga.length === 0);
  await noJs.context.close();
}

/* ---------------------------------------------------------------- run */

const browser = await chromium.launch({ channel: "chrome", headless: true });
console.log(`Checking ${BASE} (expect Clarity: ${EXPECT_CLARITY ? "yes" : "no"})`);
try {
  await beforeAnyAnswer(browser);
  await accept(browser);
  await decline(browser);
  await excludedRoutes(browser);
  await tokenStaysHome(browser);
  await layoutAndKeyboard(browser);
  await failurePaths(browser);
} finally {
  await browser.close();
}

console.log(`\n${pass} passed, ${failures.length} failed`);
for (const failure of failures) console.log(`  - ${failure}`);
process.exit(failures.length ? 1 : 0);
