import { siteContent } from "@/content/site";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import NewsletterForm from "@/components/ui/NewsletterForm";
import SocialLinks from "@/components/ui/SocialLinks";

export default function StayClose() {
  const { stayClose } = siteContent;

  return (
    <footer
      aria-labelledby="stay-close-heading"
      className="py-24 md:py-32 bg-brand-dark"
    >
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        <FadeIn>
          <SectionLabel>{stayClose.label}</SectionLabel>
          <SectionHeading>
            <span id="stay-close-heading">{stayClose.heading}</span>
          </SectionHeading>
          <p className="mt-4 text-brand-gold leading-relaxed text-base md:text-lg max-w-md mx-auto">
            {stayClose.body}
          </p>

          <div className="mt-8">
            <NewsletterForm />
          </div>

          <div className="mt-12">
            <SocialLinks />
          </div>

          <div className="mt-10">
            <p className="text-xs text-brand-gold/60">
              For press inquiries:{" "}
              <a
                href={`mailto:${stayClose.pressEmail}`}
                className="text-brand-gold hover:text-brand-amber transition-colors underline underline-offset-2"
              >
                {stayClose.pressEmail}
              </a>
            </p>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5">
            <p className="text-xs text-brand-gold/40">
              &copy; {new Date().getFullYear()} Florence Dhaemer. All rights reserved.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
