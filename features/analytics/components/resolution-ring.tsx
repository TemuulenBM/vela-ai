"use client";

import { PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ResolutionRingProps {
  total: number;
  resolved: number;
  resolutionRate: number;
  totalTrend?: { value: number; isPositive: boolean };
  resolvedTrend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}

export function ResolutionRing({
  total,
  resolved,
  resolutionRate,
  totalTrend,
  resolvedTrend,
  isLoading,
}: ResolutionRingProps) {
  if (isLoading) {
    return (
      <div>
        <div className="flex justify-center py-6">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
        </div>
        <div className="divide-y divide-border-default border-t border-border-default">
          {[0, 1].map((i) => (
            <div key={i} className="py-3.5">
              <Skeleton className="mb-1.5 h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unresolved = Math.max(0, total - resolved);
  const ringData = [
    { name: "Шийдсэн", value: resolved || 0 },
    { name: "Шийдээгүй", value: unresolved || 1 },
  ];

  const metrics = [
    { label: "Нийт яриа", value: total, trend: totalTrend },
    { label: "Шийдсэн", value: resolved, trend: resolvedTrend },
  ];

  return (
    <FadeIn delay={0.05}>
      <div>
        {/* Donut ring with center text */}
        <div className="relative mx-auto w-fit">
          <PieChart width={160} height={160}>
            <Pie
              data={ringData}
              cx={75}
              cy={75}
              innerRadius={52}
              outerRadius={72}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
              animationDuration={1200}
              animationEasing="ease-out"
            >
              <Cell fill="var(--color-brand-500)" />
              <Cell fill="var(--color-surface-tertiary)" />
            </Pie>
          </PieChart>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
              {resolutionRate}%
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
              Шийдвэрлэлт
            </span>
          </div>
        </div>

        {/* Summary metrics below ring */}
        <div className="mt-4 divide-y divide-border-default border-t border-border-default">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between py-3.5">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-xl font-semibold leading-none text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                  <CountUp to={metric.value} format={(n) => Math.round(n).toLocaleString()} />
                </p>
              </div>
              {metric.trend && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[10px] font-medium",
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
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
