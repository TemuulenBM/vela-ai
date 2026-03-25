"use client";

import { useCallback, useRef, type RefObject } from "react";

/**
 * 3D card tilt effect — tracks mouse position and applies
 * perspective rotateX/rotateY transforms for a liquid-glass feel.
 */
export function useTilt3D<T extends HTMLElement = HTMLDivElement>(
  intensity = 10,
): {
  ref: RefObject<T | null>;
  handlers: { onMouseMove: (e: React.MouseEvent) => void; onMouseLeave: () => void };
} {
  const ref = useRef<T | null>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / intensity;
      const rotateY = (centerX - x) / intensity;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    },
    [intensity],
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, []);

  return { ref, handlers: { onMouseMove, onMouseLeave } };
}
