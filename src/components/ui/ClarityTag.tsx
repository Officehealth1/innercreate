"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";
import { readConsent, subscribeConsent } from "@/lib/consent-banner";

/**
 * Loads Microsoft Clarity and tells it the visitor's answer, now and on every
 * change. The answer is read from the cookie at call time: a denied call made
 * while React catches up would delete the cookies of a visitor who accepted.
 */
export default function ClarityTag({ projectId }: { projectId: string }) {
  useEffect(() => {
    function sendConsent() {
      Clarity.consentV2({
        ad_Storage: "denied",
        analytics_Storage: readConsent() === "granted" ? "granted" : "denied",
      });
    }

    Clarity.init(projectId);
    sendConsent();
    return subscribeConsent(sendConsent);
  }, [projectId]);

  return null;
}
