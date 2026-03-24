"use client";

import { motion } from "motion/react";
import { cn } from "@/shared/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  height?: number;
  animated?: boolean;
  delay?: number;
  className?: string;
}

function ProgressBar({
  value,
  color = "var(--color-brand-500)",
  height = 6,
  animated = true,
  delay = 0,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-tertiary", className)}
      style={{ height }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={animated ? { width: 0 } : { width: `${clampedValue}%` }}
        animate={{ width: `${clampedValue}%` }}
        transition={
          animated ? { type: "spring", stiffness: 60, damping: 20, delay } : { duration: 0 }
        }
      />
    </div>
  );
}

export { ProgressBar, type ProgressBarProps };
