"use client";

import { AreaChart, Area, XAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { FadeIn, Skeleton } from "@/shared/components/ui";
import { ChartContainer } from "./chart-container";
import { ChartTooltip } from "./chart-tooltip";

interface ConversationAreaChartProps {
  data: Array<{ day: string; started: number; completed: number }>;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function ConversationAreaChart({ data, isLoading, isEmpty }: ConversationAreaChartProps) {
  if (isLoading) {
    return (
      <div className="border-t border-border-default pt-5">
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-[340px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={0.15}>
      <div className="border-t border-border-default pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Ярианы динамик</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span className="text-[11px] text-text-tertiary">Эхэлсэн</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-[11px] text-text-tertiary">Дууссан</span>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex h-[340px] items-center justify-center">
            <p className="text-sm text-text-tertiary">Энэ хугацаанд яриа байхгүй</p>
          </div>
        ) : (
          <ChartContainer height={340}>
            {(w, h) => (
              <AreaChart data={data} width={w} height={h}>
                <defs>
                  <linearGradient id="gradStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="started"
                  stroke="var(--color-brand-500)"
                  strokeWidth={2}
                  fill="url(#gradStarted)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--color-surface-primary)",
                  }}
                  name="Эхэлсэн"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--color-success)"
                  strokeWidth={2}
                  fill="url(#gradCompleted)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "var(--color-surface-primary)",
                  }}
                  name="Дууссан"
                />
              </AreaChart>
            )}
          </ChartContainer>
        )}
      </div>
    </FadeIn>
  );
}
