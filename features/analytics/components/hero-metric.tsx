"use client";

import { Sparkline, CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface HeroMetricProps {
  label: string;
  value: number;
  trend?: { value: number; isPositive: boolean };
  sparklineData: number[];
  isLoading?: boolean;
}

export function HeroMetric({ label, value, trend, sparklineData, isLoading }: HeroMetricProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-10">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-4 h-14 w-48" />
        <Skeleton className="h-[80px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={0.05}>
      <div className="glass-card rounded-3xl p-10 relative overflow-hidden">
        {/* Top-right growth velocity label */}
        {trend && (
          <div className="absolute top-8 right-8 flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">
              Growth Velocity
            </span>
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-bold",
                trend.isPositive ? "text-emerald-400" : "text-[#ffb4ab]",
              )}
            >
              <span className="material-symbols-outlined text-sm">
                {trend.isPositive ? "trending_up" : "trending_down"}
              </span>
              <span className="tabular-nums">
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
            </div>
          </div>
        )}

        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
          Revenue Flow
        </p>

        <p className="mt-3 text-5xl font-serif italic leading-none text-white">
          <CountUp to={value} format={(n) => Math.round(n).toLocaleString()} />
        </p>

        {sparklineData.length > 0 && (
          <div className="mt-8">
            <Sparkline data={sparklineData} width={280} height={80} />
          </div>
        )}
      </div>
    </FadeIn>
  );
}
