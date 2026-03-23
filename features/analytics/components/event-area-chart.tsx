"use client";

import { AreaChart, Area, XAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { FadeIn, Skeleton } from "@/shared/components/ui";
import { ChartContainer } from "./chart-container";
import { ChartTooltip } from "./chart-tooltip";

interface EventAreaChartProps {
  data: Array<{ day: string; page_view: number; add_to_cart: number }>;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function EventAreaChart({ data, isLoading, isEmpty }: EventAreaChartProps) {
  if (isLoading) {
    return (
      <div className="border-t border-border-default pt-5">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="h-[260px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={0.25}>
      <div className="border-t border-border-default pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Эвентийн чиг хандлага</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span className="text-[11px] text-text-tertiary">Үзэлт</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-[11px] text-text-tertiary">Сагс</span>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex h-[260px] items-center justify-center">
            <p className="text-sm text-text-tertiary">Энэ хугацаанд өгөгдөл байхгүй</p>
          </div>
        ) : (
          <ChartContainer height={260}>
            {(w, h) => (
              <AreaChart data={data} width={w} height={h}>
                <defs>
                  <linearGradient id="gradPageView" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradAddToCart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-subtle)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                  dy={8}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="page_view"
                  stroke="var(--color-brand-500)"
                  strokeWidth={2}
                  fill="url(#gradPageView)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--color-surface-primary)",
                  }}
                  name="Хуудас үзэлт"
                />
                <Area
                  type="monotone"
                  dataKey="add_to_cart"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  fill="url(#gradAddToCart)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--color-surface-primary)",
                  }}
                  name="Сагс нэмэлт"
                />
              </AreaChart>
            )}
          </ChartContainer>
        )}
      </div>
    </FadeIn>
  );
}
