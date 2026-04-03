"use client";

import { useCallback, useRef, useState } from "react";

interface TiltStyle {
  transform: string;
  transition: string;
}

/**
 * 3D tilt effect on mouse move — like picking up a vinyl record.
 * Returns a ref to attach to the element and a style object.
 */
export function useMouseTilt(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<TiltStyle>({
    transform: "perspective(800px) rotateX(0deg) rotateY(0deg)",
    transition: "transform 0.6s ease-out",
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setStyle({
        transform: `perspective(800px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: "transform 0.1s ease-out",
      });
    },
    [maxDeg]
  );

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.6s ease-out",
    });
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}
