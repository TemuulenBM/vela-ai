"use client";

import { PieChart, Pie, Cell } from "recharts";
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
      <div className="glass-card rounded-3xl p-10">
        <div className="flex justify-center py-6">
          <Skeleton className="h-[160px] w-[160px] rounded-full" />
        </div>
        <div className="space-y-4 mt-6">
          {[0, 1].map((i) => (
            <div key={i}>
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
    { name: "Resolved", value: resolved || 0 },
    { name: "Unresolved", value: unresolved || 1 },
  ];

  const metrics = [
    { label: "Нийт яриа", value: total, trend: totalTrend, icon: "forum" },
    { label: "Шийдсэн", value: resolved, trend: resolvedTrend, icon: "check_circle" },
  ];

  return (
    <FadeIn delay={0.05}>
      <div className="glass-card rounded-3xl p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-white text-[20px]">forum</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
              Ярианы шийдвэрлэлт
            </h3>
            <p className="text-xs text-white/30 font-light">Шийдвэрлэлтийн гүйцэтгэл</p>
          </div>
        </div>

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
              <Cell fill="rgba(255,255,255,0.7)" />
              <Cell fill="rgba(255,255,255,0.06)" />
            </Pie>
          </PieChart>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-serif italic leading-none text-white tabular-nums">
              {resolutionRate}%
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Шийдсэн
            </span>
          </div>
        </div>

        {/* Summary metrics below ring */}
        <div className="mt-8 space-y-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">{metric.label}</p>
                <p className="text-xs text-white/20 font-light">
                  {metric.label === "Нийт яриа" ? "Бүх сешн" : "AI шийдсэн"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-serif italic leading-none text-white tabular-nums">
                  <CountUp to={metric.value} format={(n) => Math.round(n).toLocaleString()} />
                </p>
                {metric.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-0.5 text-[10px] font-semibold",
                      metric.trend.isPositive ? "text-emerald-400" : "text-[#ffb4ab]",
                    )}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {metric.trend.isPositive ? "trending_up" : "trending_down"}
                    </span>
                    <span className="tabular-nums">{Math.abs(metric.trend.value)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}
