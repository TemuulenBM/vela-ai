"use client";

import { FadeIn } from "@/shared/components/ui/animate";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  return (
    <FadeIn trigger="scroll" delay={delay} className={className}>
      {children}
    </FadeIn>
  );
}
