"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  FadeIn,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { formatDay } from "@/shared/lib/utils";
import { ChartTooltip } from "./chart-tooltip";
import { ChartContainer } from "./chart-container";

export function ConversationsTab({ days }: { days: number }) {
  const summary = trpc.analytics.getConversationSummary.useQuery({ days });
  const stats = trpc.analytics.getConversationStats.useQuery({ days });

  const chartData = stats.data?.map((d) => ({
    ...d,
    day: formatDay(d.day),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FadeIn delay={0.05}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Нийт яриа"
              value={summary.data?.total ?? 0}
              trend={{
                value: Math.abs(summary.data?.totalTrend ?? 0),
                isPositive: (summary.data?.totalTrend ?? 0) >= 0,
              }}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.1}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Шийдсэн"
              value={summary.data?.resolved ?? 0}
              trend={{
                value: Math.abs(summary.data?.resolvedTrend ?? 0),
                isPositive: (summary.data?.resolvedTrend ?? 0) >= 0,
              }}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.15}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard label="Шийдвэрлэлтийн хувь" value={`${summary.data?.resolutionRate ?? 0}%`} />
          )}
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 pt-5 pb-1">
            <CardHeader>
              <CardTitle>Ярианы динамик</CardTitle>
            </CardHeader>
          </div>
          <CardContent className="px-2 pb-4">
            {stats.isLoading ? (
              <div className="px-3">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <ChartContainer height={300}>
                {(w, h) => (
                  <LineChart data={chartData} width={w} height={h}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border-default)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      dx={-4}
                      width={36}
                    />
                    <RechartsTooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="started"
                      stroke="var(--color-brand-500)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface-primary)" }}
                      name="Эхэлсэн"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="var(--color-success)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface-primary)" }}
                      name="Дууссан"
                    />
                  </LineChart>
                )}
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
