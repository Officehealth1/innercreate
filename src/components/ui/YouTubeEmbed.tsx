"use client";

import { useState } from "react";
import Image from "next/image";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  aspect?: "video" | "short";
}

export default function YouTubeEmbed({
  videoId,
  title,
  aspect = "video",
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const isShort = aspect === "short";
  const aspectClass = isShort ? "aspect-[9/16]" : "aspect-video";

  if (playing) {
    return (
      <div className={`relative w-full ${aspectClass} rounded-md overflow-hidden`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playlist=${videoId}&loop=1`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className={`relative w-full ${aspectClass} rounded-md overflow-hidden group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber`}
      aria-label={`Play ${title}`}
    >
      <Image
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={`Thumbnail for ${title}`}
        fill
        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        sizes={
          isShort
            ? "(max-width: 768px) 45vw, 220px"
            : "(max-width: 768px) 100vw, 50vw"
        }
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <div
          className={`${
            isShort ? "w-10 h-10" : "w-14 h-14"
          } rounded-full bg-brand-amber/90 flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${
              isShort ? "w-4 h-4" : "w-6 h-6"
            } text-brand-dark ml-0.5`}
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  );
}
