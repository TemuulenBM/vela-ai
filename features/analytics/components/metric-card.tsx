"use client";

import { Sparkline, CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  trend?: { value: number; isPositive: boolean };
  sparklineData: number[];
  icon: string;
  accentColor: string;
  delay?: number;
  isLoading?: boolean;
}

export function MetricCard({
  label,
  value,
  trend,
  sparklineData,
  icon,
  accentColor,
  delay = 0,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <Skeleton className="mb-3 h-3 w-20" />
        <Skeleton className="mb-4 h-8 w-28" />
        <Skeleton className="h-[48px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={delay}>
      <div className="glass-card glass-card-interactive rounded-3xl p-6 group">
        {/* Header: icon + label */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accentColor}10` }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: accentColor }}>
              {icon}
            </span>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/45">{label}</p>
        </div>

        {/* Value + trend */}
        <div className="flex items-end gap-2.5">
          <p className="text-3xl font-light leading-none tracking-tight text-white tabular-nums">
            <CountUp to={value} format={(n) => Math.round(n).toLocaleString()} />
          </p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold mb-0.5",
                trend.isPositive
                  ? "bg-[#a8e6cf]/15 text-[#a8e6cf]"
                  : "bg-[#ffb4ab]/15 text-[#ffb4ab]",
              )}
            >
              <span className="material-symbols-outlined text-[12px]">
                {trend.isPositive ? "trending_up" : "trending_down"}
              </span>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData.length > 0 && (
          <div className="mt-5">
            <Sparkline
              data={sparklineData}
              width={200}
              height={48}
              color={accentColor}
              className="w-full"
            />
          </div>
        )}
      </div>
    </FadeIn>
  );
}
