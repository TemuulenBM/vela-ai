"use client";

import { Reveal3D } from "@/shared/components/ui/animate";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  return (
    <Reveal3D delay={delay} className={className}>
      {children}
    </Reveal3D>
  );
}
