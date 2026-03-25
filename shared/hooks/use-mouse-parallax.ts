"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Mouse-driven parallax — subtly translates an element
 * based on mouse distance from viewport center.
 */
export function useMouseParallax<T extends HTMLElement = HTMLDivElement>(
  factor = 50,
): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const x = (window.innerWidth / 2 - e.clientX) / factor;
        const y = (window.innerHeight / 2 - e.clientY) / factor;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [factor]);

  return ref;
}
