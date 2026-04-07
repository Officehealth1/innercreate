"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CyclingTextProps {
  text: string;
  interval?: number;
  className?: string;
}

export default function CyclingText({
  text,
  interval = 4000,
  className = "",
}: CyclingTextProps) {
  const lines = text.split("\n").filter(Boolean);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (lines.length <= 1 || reducedMotion) return;

    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setVisible(true);
      }, 600);
    }, interval);

    return () => clearInterval(timer);
  }, [lines.length, interval, reducedMotion]);

  return (
    <span
      className={`inline-block italic font-serif text-brand-gold transition-opacity duration-600 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
        visible ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {lines[index]}
    </span>
  );
}
