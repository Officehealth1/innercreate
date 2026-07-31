"use client";

import Link from "next/link";
import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

/**
 * Confirmation is a deliberate button press rather than an automatic on-load
 * request: mail scanners fetch links in inbound email, and an auto-confirm
 * would let them opt in addresses the recipient never asked to subscribe.
 */
export default function ConfirmSubscription({ token }: { token: string }) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function confirm() {
    setState("loading");
    try {
      const res = await fetch("/api/subscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setState("success");
    } catch (err) {
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    }
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <p className="font-serif text-3xl text-brand-cream">You&rsquo;re in.</p>
        <p className="mt-4 text-brand-gold leading-relaxed">
          Thank you for confirming. A note from Florence is on its way to your
          inbox.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-brand-amber hover:text-brand-cream transition-colors"
        >
          Back to innercreate.com
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="font-serif text-3xl text-brand-cream">
        Confirm your subscription
      </p>
      <p className="mt-4 text-brand-gold leading-relaxed">
        One tap and you&rsquo;ll get a note from Florence when new music drops.
      </p>

      <button
        type="button"
        onClick={confirm}
        disabled={state === "loading"}
        className="mt-8 px-8 py-3 bg-brand-amber text-brand-dark text-xs font-semibold tracking-[0.1em] uppercase rounded hover:bg-brand-cream transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
      >
        {state === "loading" ? "Confirming…" : "Yes, subscribe me"}
      </button>

      {state === "error" && (
        <p
          className="mt-6 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
}
