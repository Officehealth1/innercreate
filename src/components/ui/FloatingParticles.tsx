"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Warm amber particles drifting upward — like dust caught in studio light.
 * Pure CSS, no canvas, no JS animation loop.
 */
export default function FloatingParticles({ count = 20 }: { count?: number }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  // Deterministic "random" values using index math — no Math.random() to avoid hydration mismatch
  const particles = Array.from({ length: count }, (_, i) => {
    const left = ((i * 37 + 13) % 100); // spread across width
    const size = 2 + (i % 3); // 2-4px
    const duration = 8 + (i * 3) % 12; // 8-20s
    const delay = (i * 1.7) % 10; // 0-10s staggered
    const opacity = 0.1 + ((i * 7) % 20) / 100; // 0.1-0.3

    return (
      <div
        key={i}
        className="particle"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          opacity,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles}
    </div>
  );
}
