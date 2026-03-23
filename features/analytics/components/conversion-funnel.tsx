"use client";

import { motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { Card, CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

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
      <Card padding="none" className="overflow-hidden">
        <div className="p-6">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="flex flex-col gap-4">
            {[100, 60, 30, 15].map((w, i) => (
              <Skeleton key={i} className="h-12" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const maxValue = stages[0]?.value || 1;
  const opacities = [1, 0.7, 0.5, 0.35];

  return (
    <FadeIn delay={0.15}>
      <Card padding="none" className="overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-sm font-semibold text-text-primary">Хөрвүүлэлтийн шүүлтүүр</h3>
          <p className="mt-0.5 text-[11px] text-text-tertiary">Хэрэглэгчийн аялалын шат дамжлага</p>
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col gap-1.5">
            {stages.map((stage, index) => {
              const widthPercent = Math.max((stage.value / maxValue) * 100, 8);
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
                        className={cn(
                          "flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2.5",
                        )}
                        style={{
                          backgroundColor: `var(--color-brand-500)`,
                          opacity: opacities[index] ?? 0.35,
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
                        <span className="truncate text-[12px] font-medium text-white">
                          {stage.label}
                        </span>
                        <span className="ml-2 shrink-0 text-[13px] font-semibold text-white tabular-nums">
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
                    <div className="flex items-center gap-1.5 py-1 pl-3">
                      <ArrowDown className="h-3 w-3 text-text-tertiary" />
                      <span className="text-[10px] font-medium text-text-tertiary tabular-nums">
                        {dropRate}% алдагдал
                      </span>
                      {stage.rate !== undefined && (
                        <span className="text-[10px] text-text-tertiary">
                          {" "}
                          ({nextStage.value.toLocaleString()} үлдсэн)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </FadeIn>
  );
}
