"use client";

import { Song } from "@/content/songs";
import SoundCloudEmbed from "@/components/ui/SoundCloudEmbed";
import CyclingText from "@/components/ui/CyclingText";

interface SongRowProps {
  song: Song;
  isOpen: boolean;
  onToggle: () => void;
}

export default function SongRow({ song, isOpen, onToggle }: SongRowProps) {
  return (
    <div className="bg-white/[0.03] rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-4 p-4 md:p-5 text-left cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-amber"
      >
        {/* Play/expand icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full border border-brand-amber flex items-center justify-center group-hover:bg-brand-amber/10 transition-colors">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`w-3.5 h-3.5 text-brand-amber transition-transform duration-300 ${
              isOpen ? "rotate-90" : "ml-0.5"
            }`}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <div className="font-serif text-lg text-brand-cream">{song.title}</div>
          <CyclingText text={song.teaser} className="text-sm" />
        </div>

        {/* Duration */}
        <span className="text-sm text-brand-gold tabular-nums flex-shrink-0">
          {song.duration}
        </span>
      </button>

      {/* Expandable content */}
      <div
        className="accordion-content"
        data-expanded={isOpen}
      >
        <div>
          <div className="px-4 md:px-5 pb-5 pt-1">
            <p className="text-brand-gold leading-relaxed text-sm md:text-base mb-4 whitespace-pre-line">
              {song.story}
            </p>
            <SoundCloudEmbed trackUrl={song.soundcloudUrl} title={song.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
