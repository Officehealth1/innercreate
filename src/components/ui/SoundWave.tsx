"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Breathing equalizer bars — a living heartbeat behind the music.
 * Pure CSS animation, no JS.
 */
export default function SoundWave() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="flex items-end justify-center gap-[3px] h-16 opacity-[0.12]"
      aria-hidden="true"
    >
      {Array.from({ length: 24 }, (_, i) => {
        const baseHeight = 20 + ((i * 13 + 7) % 40); // 20-60%
        const duration = 1.2 + ((i * 3) % 8) / 10; // 1.2-2.0s
        const delay = (i * 0.15) % 2; // staggered

        return (
          <div
            key={i}
            className="sound-bar w-[3px] rounded-full bg-brand-amber"
            style={{
              height: `${baseHeight}%`,
              animationDuration: reducedMotion ? "0s" : `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
