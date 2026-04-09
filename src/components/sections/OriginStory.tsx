import Image from "next/image";
import { siteContent } from "@/content/site";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";

export default function OriginStory() {
  const { origin } = siteContent;

  return (
    <section
      aria-labelledby="origin-heading"
      className="py-24 md:py-32 bg-brand-dark"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <FadeIn>
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

        <FadeIn delay={0.4} className="mt-10">
          <div className="relative aspect-[2707/842] w-full rounded-sm overflow-hidden bg-brand-dark-deep">
            <Image
              src={origin.image.src}
              alt={origin.image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent pointer-events-none" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
