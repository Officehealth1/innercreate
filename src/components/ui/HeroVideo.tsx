"use client";

import { useState } from "react";

interface HeroVideoProps {
  videoId: string;
}

export default function HeroVideo({ videoId }: HeroVideoProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 scale-[1.2] transition-opacity duration-[2s] ${
          loaded ? "opacity-30" : "opacity-0"
        }`}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&iv_load_policy=3`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] md:w-[120%] md:h-[120%] pointer-events-none"
          title="Background video"
          onLoad={() => setLoaded(true)}
        />
      </div>
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-brand-dark/70" />
      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark to-transparent" />
    </div>
  );
}
