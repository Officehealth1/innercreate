import { siteContent } from "@/content/site";
import { getLatestVideos } from "@/lib/youtube";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import YouTubeEmbed from "@/components/ui/YouTubeEmbed";
import TiltCard from "@/components/ui/TiltCard";
import CyclingText from "@/components/ui/CyclingText";

export default async function BehindTheMusic() {
  const { behindTheMusic } = siteContent;
  const videos = await getLatestVideos(2);

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
                <div className="mt-2 h-5">
                  <CyclingText text={video.context} className="text-sm" />
                </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
