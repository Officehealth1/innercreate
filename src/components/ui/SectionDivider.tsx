"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function SectionDivider() {
  const { ref, isVisible } = useIntersectionObserver(0.5);

  return (
    <div ref={ref} className="max-w-4xl mx-auto px-6 md:px-8" aria-hidden="true">
      <div className={`section-divider ${isVisible ? "visible" : ""}`} />
    </div>
  );
}
