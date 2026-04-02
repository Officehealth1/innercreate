import Hero from "@/components/sections/Hero";
import OriginStory from "@/components/sections/OriginStory";
import NowPlaying from "@/components/sections/NowPlaying";
import BehindTheMusic from "@/components/sections/BehindTheMusic";
import SongsAndStories from "@/components/sections/SongsAndStories";
import StayClose from "@/components/sections/StayClose";
import SectionDivider from "@/components/ui/SectionDivider";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <main id="main-content">
        <Hero />
        <SectionDivider />
        <OriginStory />
        <SectionDivider />
        <NowPlaying />
        <SectionDivider />
        <BehindTheMusic />
        <SectionDivider />
        <SongsAndStories />
        <SectionDivider />
        <StayClose />
      </main>
    </>
  );
}
