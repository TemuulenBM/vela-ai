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
      <div className="glass-card rounded-3xl p-10">
        <Skeleton className="mb-4 h-4 w-32" />
        <Skeleton className="h-[340px] w-full" />
      </div>
    );
  }

  return (
    <FadeIn delay={0.15}>
      <div className="glass-card rounded-3xl p-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Ярианы график
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-white/60" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Эхэлсэн
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Дууссан
              </span>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="flex h-[340px] items-center justify-center">
            <p className="text-sm text-white/40 font-light">Энэ хугацаанд яриа алга</p>
          </div>
        ) : (
          <ChartContainer height={340}>
            {(w, h) => (
              <AreaChart data={data} width={w} height={h}>
                <defs>
                  <linearGradient id="gradStarted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.6)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.6)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                  dy={8}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="started"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={2}
                  fill="url(#gradStarted)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#000000",
                  }}
                  name="Эхэлсэн"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#gradCompleted)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    fill: "#000000",
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
