"use client";

import { useState } from "react";
import { songs } from "@/content/songs";
import SectionLabel from "@/components/ui/SectionLabel";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import StaggerIn from "@/components/ui/StaggerIn";
import SongRow from "@/components/SongRow";

export default function SongsAndStories() {
  const [openId, setOpenId] = useState<string | null>(null);

  // Exclude the featured song (it's in NowPlaying)
  const collectionSongs = songs.filter((s) => !s.featured);

  return (
    <section
      aria-labelledby="collection-heading"
      className="py-24 md:py-32 bg-brand-dark-alt"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <FadeIn>
          <SectionLabel>The Collection</SectionLabel>
          <SectionHeading>
            <span id="collection-heading">Songs</span>
          </SectionHeading>
        </FadeIn>

        <StaggerIn className="mt-10 flex flex-col gap-3">
          {collectionSongs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              isOpen={openId === song.id}
              onToggle={() =>
                setOpenId((prev) => (prev === song.id ? null : song.id))
              }
            />
          ))}
        </StaggerIn>
      </div>
    </section>
  );
}
