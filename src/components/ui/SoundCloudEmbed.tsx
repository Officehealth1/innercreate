"use client";

import { useState } from "react";

interface SoundCloudEmbedProps {
  trackUrl: string;
  title: string;
}

export default function SoundCloudEmbed({ trackUrl, title }: SoundCloudEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    trackUrl
  )}&color=%23c4956a&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true`;

  if (!loaded) {
    return (
      <button
        onClick={() => setLoaded(true)}
        className="w-full h-[166px] bg-brand-dark-deep rounded-lg flex items-center justify-center gap-3 group cursor-pointer transition-colors hover:bg-brand-dark-deep/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
        aria-label={`Play ${title} on SoundCloud`}
      >
        <div className="w-12 h-12 rounded-full border-2 border-brand-amber flex items-center justify-center group-hover:bg-brand-amber/10 transition-colors">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-brand-amber ml-0.5"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="text-brand-gold text-sm">Play on SoundCloud</span>
      </button>
    );
  }

  return (
    <iframe
      src={embedUrl}
      width="100%"
      height={166}
      frameBorder="0"
      allow="autoplay"
      loading="lazy"
      title={`Listen to ${title} by Florence Dhaemer on SoundCloud`}
      className="rounded-lg"
    />
  );
}
