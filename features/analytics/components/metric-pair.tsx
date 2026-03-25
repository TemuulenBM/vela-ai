"use client";

import { Sparkline, CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface MetricRow {
  label: string;
  value: number;
  trend?: { value: number; isPositive: boolean };
  sparklineData: number[];
  icon?: string;
  sublabel?: string;
}

interface MetricPairProps {
  metrics: MetricRow[];
  isLoading?: boolean;
}

export function MetricPair({ metrics, isLoading }: MetricPairProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 mt-6">
        {[0, 1].map((i) => (
          <div key={i} className="glass-card rounded-3xl p-8">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-10 w-28" />
          </div>
        ))}
      </div>
    );
  }

  const icons = ["psychology", "language"];
  const labels = ["Чат харилцаа", "Сагсанд нэмэлт"];
  const topLabels = ["Чат харилцаа", "Сагсанд нэмэлт"];

  return (
    <FadeIn delay={0.1}>
      <div className="flex flex-col gap-6 mt-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="glass-card rounded-3xl p-8 flex flex-col justify-between"
          >
            {/* Top row: icon + category label */}
            <div className="flex justify-between items-center">
              <span className="material-symbols-outlined text-white/60 text-[20px]">
                {icons[index] ?? "analytics"}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">
                {topLabels[index] ?? "Metric"}
              </span>
            </div>

            {/* Value */}
            <div className="mt-4">
              <p className="text-4xl font-serif italic leading-none text-white">
                <CountUp to={metric.value} format={(n) => Math.round(n).toLocaleString()} />
                {metric.trend && (
                  <span
                    className={cn(
                      "text-sm font-sans not-italic ml-2",
                      metric.trend.isPositive ? "text-emerald-400" : "text-[#ffb4ab]",
                    )}
                  >
                    {metric.trend.isPositive ? "+" : "-"}
                    {Math.abs(metric.trend.value)}%
                  </span>
                )}
              </p>
              <p className="text-xs text-white/40 mt-1 uppercase tracking-wider">
                {labels[index] ?? metric.label}
              </p>
            </div>

            {/* Sparkline or progress bar */}
            {metric.sparklineData.length > 0 && (
              <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, (metric.value / metric.sparklineData.reduce((a, b) => Math.max(a, b), 1)) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
