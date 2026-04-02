"use client";

import { useState, FormEvent } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setState("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
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
      <div className="text-center py-4">
        <p className="font-serif text-xl text-brand-cream">
          You&apos;re in. Watch your inbox.
        </p>
        <p className="text-sm text-brand-gold mt-2">
          Something good is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      <div className="flex gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="your@email.com"
          required
          className="flex-1 px-4 py-3 bg-brand-dark-deep border border-white/10 rounded text-brand-cream text-sm placeholder:text-brand-gold/50 focus:outline-none focus:border-brand-amber transition-colors"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-6 py-3 bg-brand-amber text-brand-dark text-xs font-semibold tracking-[0.1em] uppercase rounded hover:bg-brand-cream transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
        >
          {state === "loading" ? "..." : "Subscribe"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-400" role="alert" aria-live="polite">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
