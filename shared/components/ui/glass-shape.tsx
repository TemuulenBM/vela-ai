"use client";

import { useParallax } from "@/shared/hooks/use-parallax";
import { cn } from "@/shared/lib/utils";

interface GlassShapeProps {
  shape?: "sphere" | "torus";
  speed?: number;
  className?: string;
}

function GlassShape({ shape = "sphere", speed = 0.2, className }: GlassShapeProps) {
  const ref = useParallax<HTMLDivElement>(speed);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute pointer-events-none will-change-transform",
        "bg-white/[0.03] backdrop-blur-[15px]",
        "border border-white/[0.08]",
        "shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]",
        shape === "sphere" && "rounded-full",
        shape === "torus" &&
          "rounded-full [mask-image:radial-gradient(circle_35%_at_50%_50%,transparent_100%,black_100%)]",
        className,
      )}
    />
  );
}

export { GlassShape };
