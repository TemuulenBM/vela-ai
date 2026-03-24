"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Scroll-driven parallax — translates element along Y based on scroll position.
 * `speed` controls the parallax factor (positive = same direction, negative = opposite).
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed = 0.2,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let rafId: number;

    const update = () => {
      const el = ref.current;
      if (!el) return;
      const scrolled = window.scrollY;
      el.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return ref;
}
