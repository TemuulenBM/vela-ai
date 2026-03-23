"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/shared/components/ui";

interface ChartContainerProps {
  height?: number;
  children: (width: number, height: number) => React.ReactElement;
}

export function ChartContainer({ height: targetHeight = 300, children }: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0 && h > 0) {
      setSize((prev) => (prev?.width === w && prev?.height === h ? prev : { width: w, height: h }));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Initial measure after paint
    const raf = requestAnimationFrame(() => measure());

    // Observe resize (window resize, sidebar toggle, etc.)
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  return (
    <div ref={containerRef} style={{ height: targetHeight }} className="w-full">
      {size ? children(size.width, size.height) : <Skeleton className="h-full w-full" />}
    </div>
  );
}
