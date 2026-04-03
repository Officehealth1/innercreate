"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a 0→1 progress value as the element scrolls through the viewport.
 * 0 = element just entered at the bottom, 1 = element reached the top.
 */
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        // 0 when bottom of viewport touches element top, 1 when element top reaches viewport top
        const raw = 1 - rect.top / windowHeight;
        setProgress(Math.max(0, Math.min(1, raw)));
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { ref, progress };
}
