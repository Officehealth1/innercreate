import type { Metadata } from "next";
import Link from "next/link";
import ConfirmSubscription from "@/components/ui/ConfirmSubscription";

export const metadata: Metadata = {
  title: "Confirm your subscription — Innercreate",
  // Confirmation links are per-subscriber; keep them out of search results.
  robots: { index: false, follow: false },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        {value ? (
          <ConfirmSubscription token={value} />
        ) : (
          <div className="text-center">
            <p className="font-serif text-3xl text-brand-cream">
              Link incomplete
            </p>
            <p className="mt-4 text-brand-gold leading-relaxed">
              That confirmation link is missing its token. Please use the link
              from your email, or sign up again.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-brand-amber hover:text-brand-cream transition-colors"
            >
              Back to innercreate.com
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
