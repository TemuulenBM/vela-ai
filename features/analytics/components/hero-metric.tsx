"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
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
      <div className="border-t border-border-default pt-5">
        <Skeleton className="mb-3 h-3 w-24" />
        <Skeleton className="mb-4 h-12 w-32" />
        <Skeleton className="h-[60px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={0.05}>
      <div className="border-t border-border-default pt-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
          {label}
        </p>

        <div className="mt-2 flex items-end gap-3">
          <p className="text-[42px] font-semibold leading-none tracking-tighter text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
            <CountUp to={value} format={(n) => Math.round(n).toLocaleString()} />
          </p>

          {trend && (
            <div
              className={cn(
                "mb-1.5 flex items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium",
                trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="tabular-nums">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {sparklineData.length > 0 && (
          <div className="mt-4">
            <Sparkline data={sparklineData} width={200} height={60} />
          </div>
        )}
      </div>
    </FadeIn>
  );
}
