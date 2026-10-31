"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";
import ClarityTag from "@/components/ui/ClarityTag";
import {
  readConsent,
  startConsentBar,
  subscribeConsent,
} from "@/lib/consent-banner";

const GA_MEASUREMENT_ID = "G-DZ5XH2LR56";
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// An allowlist, so a new route stays untracked until someone adds it here. The
// confirm page must never join it: its address carries the subscriber's email
// inside the signed token.
const TRACKED_PATHS = new Set(["/", "/privacy"]);

// Google Analytics writes its cookies on the registrable domain, which a script
// cannot read back, so this tries the host and each of its parents.
function clearGoogleAnalyticsCookies() {
  const labels = location.hostname.split(".");
  const names = document.cookie
    .split("; ")
    .map((cookie) => cookie.split("=")[0])
    .filter((name) => name.startsWith("_ga"));

  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; Path=/`;
    labels.forEach((_, i) => {
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${labels.slice(i).join(".")}`;
    });
  }
}

export default function ConsentedAnalytics() {
  const tracked = TRACKED_PATHS.has(usePathname());
  const choice = useSyncExternalStore(subscribeConsent, readConsent, () => null);

  useEffect(() => {
    if (tracked) return startConsentBar();
  }, [tracked]);

  const acceptedOnThisPage = useRef(false);
  useEffect(() => {
    if (choice === "granted") acceptedOnThisPage.current = true;
    if (choice !== "denied") return;
    clearGoogleAnalyticsCookies();
    // gtag keeps sending once it has loaded, so withdrawing reloads the page
    // to drop it. The reloaded page starts with a fresh ref, so this cannot loop.
    if (acceptedOnThisPage.current) location.reload();
  }, [choice]);

  if (!tracked) return null;

  return (
    <>
      {CLARITY_PROJECT_ID && <ClarityTag projectId={CLARITY_PROJECT_ID} />}
      {process.env.NODE_ENV === "production" && choice === "granted" && (
        <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      )}
    </>
  );
}
