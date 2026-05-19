"use client";

import { useEffect, useRef, useState } from "react";

interface HeroVideoProps {
  videoId: string;
}

interface YTPlayer {
  mute: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

interface YTStateEvent {
  data: number;
  target: YTPlayer;
}

interface YTReadyEvent {
  target: YTPlayer;
}

interface YTNamespace {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      host?: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (e: YTReadyEvent) => void;
        onStateChange: (e: YTStateEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { ENDED: number };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Hero background video.
 * Uses the YouTube IFrame API so we can loop via seekTo(0)+playVideo() on ENDED.
 * Avoids the `playlist=...&loop=1` trick, which makes YouTube show
 * prev/pause/next playlist-navigation buttons in the center of the embed.
 */
export default function HeroVideo({ videoId }: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || !containerRef.current || !window.YT) return;

      // YT.Player replaces this target element with the iframe.
      const target = document.createElement("div");
      target.className = "absolute inset-0";
      containerRef.current.appendChild(target);

      playerRef.current = new window.YT.Player(target, {
        videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            e.target.playVideo();
            const iframe = e.target.getIframe();
            iframe.className =
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[180%] md:w-[120%] md:h-[120%] pointer-events-none";
            iframe.setAttribute("title", "Background video");
            iframe.setAttribute("tabindex", "-1");
            setLoaded(true);
          },
          onStateChange: (e) => {
            if (e.data === window.YT?.PlayerState.ENDED) {
              e.target.seekTo(0, true);
              e.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        createPlayer();
      };
      if (!existing) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        // player may already be detached
      }
    };
  }, [videoId]);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 scale-[1.2] transition-opacity duration-[2s] ${
          loaded ? "opacity-30" : "opacity-0"
        }`}
      >
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-brand-dark/70" />
      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark to-transparent" />
    </div>
  );
}
