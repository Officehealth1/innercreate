import { songs } from "@/content/songs";
import SectionLabel from "@/components/ui/SectionLabel";
import FadeIn from "@/components/ui/FadeIn";
import SoundCloudEmbed from "@/components/ui/SoundCloudEmbed";

export default function NowPlaying() {
  const featured = songs.find((s) => s.featured) ?? songs[0];

  return (
    <section
      id="now-playing"
      aria-labelledby="now-playing-heading"
      className="py-24 md:py-32 bg-brand-dark-alt"
    >
      <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
        <FadeIn>
          <SectionLabel>Now Playing</SectionLabel>
          <h2
            id="now-playing-heading"
            className="font-serif text-3xl md:text-4xl font-semibold text-brand-cream mt-3"
          >
            {featured.title}
          </h2>
          <p className="mt-4 text-brand-gold leading-relaxed italic font-serif text-base md:text-lg max-w-lg mx-auto">
            {featured.story}
          </p>
          <div className="mt-8 glow-container">
            <SoundCloudEmbed
              trackUrl={featured.soundcloudUrl}
              title={featured.title}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
