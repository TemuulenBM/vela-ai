"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Eye, MessageSquare, ShoppingCart, Package } from "lucide-react";
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

export function OverviewTab({ days }: { days: number }) {
  const stats = trpc.analytics.getOverviewStats.useQuery({ days });
  const eventsOverTime = trpc.analytics.getEventsOverTime.useQuery({ days });
  const eventTypeCounts = trpc.analytics.getEventTypeCounts.useQuery({ days });

  const chartData = eventsOverTime.data?.map((d) => ({
    ...d,
    day: formatDay(d.day),
  }));

  const hasError = stats.isError || eventsOverTime.isError || eventTypeCounts.isError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text-secondary">Өгөгдөл ачаалахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-text-tertiary">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            stats.refetch();
            eventsOverTime.refetch();
            eventTypeCounts.refetch();
          }}
          className="mt-4 rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.05}>
          {stats.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Хуудас үзэлт"
              value={stats.data?.pageViews ?? 0}
              trend={{
                value: Math.abs(stats.data?.pageViewsTrend ?? 0),
                isPositive: (stats.data?.pageViewsTrend ?? 0) >= 0,
              }}
              icon={<Eye className="h-4 w-4" />}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.1}>
          {stats.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Чат харилцаа"
              value={stats.data?.chatInteractions ?? 0}
              trend={{
                value: Math.abs(stats.data?.chatInteractionsTrend ?? 0),
                isPositive: (stats.data?.chatInteractionsTrend ?? 0) >= 0,
              }}
              icon={<MessageSquare className="h-4 w-4" />}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.15}>
          {stats.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Сагс нэмэлт"
              value={stats.data?.addToCarts ?? 0}
              trend={{
                value: Math.abs(stats.data?.addToCartsTrend ?? 0),
                isPositive: (stats.data?.addToCartsTrend ?? 0) >= 0,
              }}
              icon={<ShoppingCart className="h-4 w-4" />}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.2}>
          {stats.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard
              label="Захиалга"
              value={stats.data?.checkouts ?? 0}
              trend={{
                value: Math.abs(stats.data?.checkoutsTrend ?? 0),
                isPositive: (stats.data?.checkoutsTrend ?? 0) >= 0,
              }}
              icon={<Package className="h-4 w-4" />}
            />
          )}
        </FadeIn>
      </div>

      {/* Charts — asymmetric: line chart 3/5, bar chart 2/5 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <FadeIn delay={0.25} className="lg:col-span-3">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 pt-5 pb-1">
              <CardHeader>
                <CardTitle>Эвентийн график</CardTitle>
              </CardHeader>
            </div>
            <CardContent className="px-2 pb-4">
              {eventsOverTime.isLoading ? (
                <div className="px-3">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : !chartData?.length ? (
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-sm text-text-tertiary">Энэ хугацаанд өгөгдөл байхгүй</p>
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
                        dataKey="page_view"
                        stroke="var(--color-brand-500)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface-primary)" }}
                        name="Хуудас үзэлт"
                      />
                      <Line
                        type="monotone"
                        dataKey="add_to_cart"
                        stroke="var(--color-success)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface-primary)" }}
                        name="Сагс нэмэлт"
                      />
                    </LineChart>
                  )}
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3} className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="px-5 pt-5 pb-1">
              <CardHeader>
                <CardTitle>Эвентийн төрлүүд</CardTitle>
              </CardHeader>
            </div>
            <CardContent className="px-2 pb-4">
              {eventTypeCounts.isLoading ? (
                <div className="px-3">
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <ChartContainer height={300}>
                  {(w, h) => (
                    <BarChart data={eventTypeCounts.data} layout="vertical" width={w} height={h}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border-default)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="event"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                        width={120}
                      />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="count"
                        fill="var(--color-brand-500)"
                        radius={[0, 4, 4, 0]}
                        name="Тоо"
                      />
                    </BarChart>
                  )}
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
