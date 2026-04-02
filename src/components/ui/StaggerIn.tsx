"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface StaggerInProps {
  children: React.ReactNode;
  className?: string;
}

export default function StaggerIn({ children, className = "" }: StaggerInProps) {
  const { ref, isVisible } = useIntersectionObserver(0.1);
  const reducedMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className={`stagger-children ${isVisible || reducedMotion ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
