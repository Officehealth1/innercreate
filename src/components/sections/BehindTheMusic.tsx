import { siteContent } from "@/content/site";
import { videos } from "@/content/videos";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import YouTubeEmbed from "@/components/ui/YouTubeEmbed";
import TiltCard from "@/components/ui/TiltCard";

export default function BehindTheMusic() {
  const { behindTheMusic } = siteContent;

  return (
    <section
      aria-labelledby="behind-heading"
      className="py-24 md:py-32 bg-brand-dark"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionLabel>{behindTheMusic.label}</SectionLabel>
          <SectionHeading>
            <span id="behind-heading">{behindTheMusic.heading}</span>
          </SectionHeading>
          <p className="mt-4 text-brand-gold leading-relaxed text-base md:text-lg max-w-2xl">
            {behindTheMusic.intro}
          </p>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video, i) => (
            <FadeIn key={video.id} delay={i * 0.12}>
              <TiltCard className="group">
                <YouTubeEmbed videoId={video.id} title={video.title} />
                <h3 className="mt-3 font-serif text-lg text-brand-cream group-hover:text-brand-amber transition-colors duration-300">
                  {video.title}
                </h3>
                <p className="mt-1 text-sm text-brand-gold leading-relaxed">
                  {video.context}
                </p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
