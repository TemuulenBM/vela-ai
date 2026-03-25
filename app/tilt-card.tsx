"use client";

import { useTilt3D } from "@/shared/hooks/use-tilt-3d";
import { cn } from "@/shared/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 10 }: TiltCardProps) {
  const { ref, handlers } = useTilt3D<HTMLDivElement>(intensity);

  return (
    <div
      ref={ref}
      className={cn("tilt-3d group", className)}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    >
      {children}
    </div>
  );
}
