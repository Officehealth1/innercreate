"use client";

import { useMouseTilt } from "@/hooks/useMouseTilt";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Largest tilt in degrees. A wide card needs less: the same angle moves its edges further. */
  maxDeg?: number;
}

/**
 * 3D tilt on mouse hover — tactile, like picking up a vinyl record.
 * Falls back to flat on mobile/reduced-motion.
 */
export default function TiltCard({
  children,
  className = "",
  maxDeg = 6,
}: TiltCardProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt(maxDeg);
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
