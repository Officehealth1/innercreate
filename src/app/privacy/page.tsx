import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy - Innercreate",
  description:
    "What this site records about visitors, which outside services receive it, and how to change your cookie choice.",
  alternates: {
    canonical: "https://innercreate.com/privacy",
  },
};

const linkClass =
  "text-brand-amber underline underline-offset-2 hover:text-brand-cream transition-colors";

export default function PrivacyPage() {
  const { pressEmail } = siteContent.stayClose;

  return (
    <main className="min-h-screen px-6 py-24">
      <div className="mx-auto max-w-[65ch] space-y-6 leading-relaxed text-brand-gold">
        <h1 className="font-serif text-4xl text-brand-cream">Privacy</h1>

        <p>
          We use Microsoft Clarity to see how visitors use the public pages of
          this site (mouse movement, clicks, scrolling, page views). Text you
          type is never recorded. Microsoft collects this data under its own{" "}
          <a
            href="https://www.microsoft.com/en-us/privacy/privacystatement"
            className={linkClass}
          >
            privacy statement
          </a>{" "}
          and may use it for its own purposes. We set its cookies only if you
          accept them.
        </p>

        <p>
          We also use Google Analytics to count visits. It loads only if you
          accept cookies. Google&apos;s{" "}
          <a href="https://policies.google.com/privacy" className={linkClass}>
            privacy policy
          </a>{" "}
          covers what it collects.
        </p>

        <p>
          The video at the top of the home page plays from YouTube, which sets
          its own cookies when the page opens, whatever you answer.
        </p>

        <p>
          If you join the newsletter, we email you a confirmation link first.
          Your address goes on our list only after you confirm. Brevo sends our
          email and keeps that list.
        </p>

        <p>
          You can change your answer at any time:{" "}
          <button
            type="button"
            data-consent-open
            className={`cursor-pointer ${linkClass}`}
          >
            Cookie choices
          </button>
          . For questions about your data, write to{" "}
          <a href={`mailto:${pressEmail}`} className={linkClass}>
            {pressEmail}
          </a>
          .
        </p>

        <Link
          href="/"
          className="inline-block pt-4 text-xs font-semibold uppercase tracking-[0.1em] text-brand-amber hover:text-brand-cream transition-colors"
        >
          Back to innercreate.com
        </Link>
      </div>
    </main>
  );
}
