// The cookie choices bar. Plain JavaScript with no dependency, so the same file
// runs on our Next.js sites and our static ones. Its look lives in each site's
// CSS under .consent-bar.

const PRIVACY_PATH = "/privacy";
const CHANGE_EVENT = "consent-choice";

/** @returns {"granted" | "denied" | null} */
export function readConsent() {
  const match = document.cookie.match(/(?:^|; )consent_choice=(granted|denied)(?:;|$)/);
  return match ? /** @type {"granted" | "denied"} */ (match[1]) : null;
}

/** @param {() => void} listener */
export function subscribeConsent(listener) {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

function saveChoice(choice) {
  // Six months. The value and its date are the whole record of the answer.
  document.cookie = `consent_choice=${choice}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function showBar(opener) {
  if (document.getElementById("consent-bar")) return;

  const bar = document.createElement("div");
  bar.id = "consent-bar";
  bar.className = "consent-bar";
  bar.tabIndex = -1;
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookie choices");
  bar.innerHTML = `
    <p>We use cookies to understand how visitors use this site. Text you type is never recorded. <a href="${PRIVACY_PATH}">Cookie choices</a></p>
    <div class="consent-bar-buttons">
      <button type="button" data-choice="granted">Accept</button>
      <button type="button" data-choice="denied">Decline</button>
    </div>`;

  bar.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-choice]")?.dataset.choice;
    if (!choice) return;
    bar.remove();
    opener?.focus();
    saveChoice(choice);
  });

  // First in the body so the keyboard reaches it before the page, not after.
  document.body.prepend(bar);
  if (opener) bar.focus();
}

/** Shows the bar if the visitor has not answered and wires up [data-consent-open]. */
export function startConsentBar() {
  if (!readConsent()) showBar();

  const onClick = (event) => {
    const opener = event.target.closest("[data-consent-open]");
    if (opener) showBar(opener);
  };
  document.addEventListener("click", onClick);

  return () => {
    document.removeEventListener("click", onClick);
    document.getElementById("consent-bar")?.remove();
  };
}
