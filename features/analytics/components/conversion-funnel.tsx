"use client";

import { motion } from "motion/react";
import { CountUp, FadeIn, Skeleton } from "@/shared/components/ui";

interface FunnelStage {
  label: string;
  value: number;
  rate?: number;
}

interface ConversionFunnelProps {
  stages: FunnelStage[];
  isLoading?: boolean;
}

export function ConversionFunnel({ stages, isLoading }: ConversionFunnelProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-10">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="flex flex-col gap-4">
            {[100, 60, 30, 15].map((w, i) => (
              <Skeleton key={i} className="h-14" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxValue = stages[0]?.value || 1;
  const opacities = [1, 0.7, 0.5, 0.35];

  return (
    <FadeIn delay={0.15}>
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Conversion Pipeline
            </h3>
            <span className="material-symbols-outlined text-white/40 text-[20px]">filter_alt</span>
          </div>
          <p className="text-xs text-white/30 font-light mb-8">
            Customer journey stage progression
          </p>

          <div className="flex flex-col gap-3">
            {stages.map((stage, index) => {
              const widthPercent = Math.max((stage.value / maxValue) * 100, 12);
              const nextStage = stages[index + 1];
              const dropRate =
                nextStage && stage.value > 0
                  ? (((stage.value - nextStage.value) / stage.value) * 100).toFixed(1)
                  : null;

              return (
                <div key={stage.label}>
                  {/* Bar row */}
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <motion.div
                        className="flex items-center justify-between rounded-2xl px-5 py-3.5"
                        style={{
                          backgroundColor: `rgba(255,255,255,${(opacities[index] ?? 0.35) * 0.12})`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 50,
                          damping: 20,
                          delay: index * 0.12,
                        }}
                      >
                        <span className="truncate text-[12px] font-medium text-white/80">
                          {stage.label}
                        </span>
                        <span className="ml-2 shrink-0 text-lg font-serif italic text-white tabular-nums">
                          <CountUp
                            to={stage.value}
                            format={(n) => Math.round(n).toLocaleString()}
                          />
                        </span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Drop-off indicator */}
                  {dropRate && (
                    <div className="flex items-center gap-2 py-1.5 pl-5">
                      <span className="material-symbols-outlined text-white/30 text-[16px]">
                        south
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30 tabular-nums">
                        {dropRate}% drop-off
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
