"use client";

import { motion } from "motion/react";
import { CountUp, FadeIn, Skeleton, EmptyState } from "@/shared/components/ui";

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

  const allZero = stages.every((s) => s.value === 0);
  const maxValue = stages[0]?.value || 1;
  const barColors = [
    "rgba(34, 197, 94, 0.20)",
    "rgba(34, 197, 94, 0.12)",
    "rgba(255, 255, 255, 0.08)",
  ];

  return (
    <FadeIn delay={0.15}>
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Хөрвүүлэлтийн шат
            </h3>
            <span className="material-symbols-outlined text-white/40 text-[20px]">filter_alt</span>
          </div>
          <p className="text-xs text-white/30 font-light mb-8">Хэрэглэгчийн замналын шатлал</p>

          {allZero ? (
            <EmptyState
              icon={<span className="material-symbols-outlined text-[24px]">filter_alt</span>}
              title="Хөрвүүлэлтийн мэдээлэл байхгүй"
              description="Дэлгүүрт холбогдсоны дараа энд хөрвүүлэлтийн шат харагдана"
              className="py-8"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {stages.map((stage, index) => {
                const widthPercent =
                  stage.value === 0 ? 0 : Math.max((stage.value / maxValue) * 100, 12);
                const nextStage = stages[index + 1];
                const dropRate =
                  nextStage && stage.value > 0
                    ? (((stage.value - nextStage.value) / stage.value) * 100).toFixed(1)
                    : null;

                return (
                  <div key={stage.label}>
                    {/* Label + value above bar */}
                    <div className="flex items-baseline justify-between mb-1.5 px-1">
                      <span className="text-xs font-medium text-white/60">{stage.label}</span>
                      <span className="text-sm font-medium text-white tabular-nums">
                        <CountUp to={stage.value} format={(n) => Math.round(n).toLocaleString()} />
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="min-w-0">
                      {stage.value === 0 ? (
                        <div className="rounded-2xl h-10 border border-dashed border-white/10" />
                      ) : (
                        <motion.div
                          className="rounded-2xl h-10"
                          style={{ backgroundColor: barColors[index] ?? "rgba(255,255,255,0.08)" }}
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 50,
                            damping: 20,
                            delay: index * 0.12,
                          }}
                        />
                      )}
                    </div>

                    {/* Drop-off indicator */}
                    {dropRate && (
                      <div className="flex items-center gap-2 py-1.5 pl-5">
                        <span className="material-symbols-outlined text-white/30 text-[16px]">
                          south
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30 tabular-nums">
                          {dropRate}% буурсан
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
