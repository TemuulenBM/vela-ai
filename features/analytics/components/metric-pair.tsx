"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline, CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface MetricRow {
  label: string;
  value: number;
  trend?: { value: number; isPositive: boolean };
  sparklineData: number[];
}

interface MetricPairProps {
  metrics: MetricRow[];
  isLoading?: boolean;
}

export function MetricPair({ metrics, isLoading }: MetricPairProps) {
  if (isLoading) {
    return (
      <div className="divide-y divide-border-default border-t border-border-default">
        {[0, 1].map((i) => (
          <div key={i} className="py-4">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <FadeIn delay={0.1}>
      <div className="divide-y divide-border-default border-t border-border-default">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between py-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                {metric.label}
              </p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                  <CountUp to={metric.value} format={(n) => Math.round(n).toLocaleString()} />
                </p>
                {metric.trend && (
                  <div
                    className={cn(
                      "mb-0.5 flex items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium",
                      metric.trend.isPositive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {metric.trend.isPositive ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : (
                      <TrendingDown className="h-2.5 w-2.5" />
                    )}
                    <span className="tabular-nums">{Math.abs(metric.trend.value)}%</span>
                  </div>
                )}
              </div>
            </div>

            {metric.sparklineData.length > 0 && (
              <Sparkline
                data={metric.sparklineData}
                width={64}
                height={28}
                className="opacity-60"
              />
            )}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
