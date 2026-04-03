import Image from "next/image";
import { siteContent } from "@/content/site";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import Parallax from "@/components/ui/Parallax";

export default function OriginStory() {
  const { origin } = siteContent;

  return (
    <section
      aria-labelledby="origin-heading"
      className="py-24 md:py-32 bg-brand-dark"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
          <div className="flex-1 order-2 md:order-1">
            <FadeIn>
              <SectionLabel>{origin.label}</SectionLabel>
              <SectionHeading>
                <span id="origin-heading">{origin.heading}</span>
              </SectionHeading>
            </FadeIn>
            <div className="mt-6 space-y-4">
              {origin.body.split("\n\n").map((paragraph, i) => (
                <FadeIn key={i} delay={0.3 + i * 0.2}>
                  <p className="text-brand-gold leading-relaxed text-base md:text-lg">
                    {paragraph}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
          <FadeIn delay={0.2} className="flex-shrink-0 order-1 md:order-2 w-full md:w-72 lg:w-80">
            <Parallax speed={-0.15}>
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-brand-dark-deep group" style={{ perspective: "600px" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-dark-deep to-brand-dark flex items-center justify-center transition-transform duration-700 group-hover:scale-105 group-hover:[transform:scale(1.05)_rotateY(2deg)]">
                  <Image
                    src={origin.image.src}
                    alt={origin.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                {/* Warm vignette overlay on the photo */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent pointer-events-none" />
              </div>
            </Parallax>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
