"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function FadeIn({ children, delay = 0, className = "" }: FadeInProps) {
  const { ref, isVisible } = useIntersectionObserver(0.1);
  const reducedMotion = useReducedMotion();

  const style = reducedMotion
    ? { opacity: isVisible ? 1 : 0, transition: "opacity 0.4s ease-out" }
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.7s ease-out ${delay}s, transform 0.7s ease-out ${delay}s`,
      };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
