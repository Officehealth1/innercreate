"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number; // 0 = static, 0.5 = half speed, -0.3 = opposite direction
  className?: string;
}

/**
 * Scroll-driven parallax. Elements move at a different speed
 * than the page — creating the feeling of depth, like entering
 * deeper into Florence's world.
 */
export default function Parallax({ children, speed = 0.3, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) { ticking = false; return; }
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        const delta = (center - viewCenter) * speed;
        setOffset(delta);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed, reducedMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: reducedMotion ? "none" : `translateY(${offset}px)`,
        willChange: reducedMotion ? "auto" : "transform",
      }}
    >
      {children}
    </div>
  );
}
