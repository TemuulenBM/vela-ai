"use client";

import { trpc } from "@/shared/lib/trpc";
import { formatDay } from "@/shared/lib/utils";
import { HeroMetric } from "./hero-metric";
import { MetricPair } from "./metric-pair";
import { ConversionFunnel } from "./conversion-funnel";
import { EventAreaChart } from "./event-area-chart";
import { EventBreakdown } from "./event-breakdown";

export function OverviewTab({ days }: { days: number }) {
  const stats = trpc.analytics.getOverviewStats.useQuery({ days });
  const eventsOverTime = trpc.analytics.getEventsOverTime.useQuery({ days });
  const eventTypeCounts = trpc.analytics.getEventTypeCounts.useQuery({ days });

  const hasError = stats.isError || eventsOverTime.isError || eventTypeCounts.isError;

  // Extract sparkline series per event type from time series data
  const pageViewSeries = eventsOverTime.data?.map((d) => d.page_view) ?? [];
  const chatSeries = eventsOverTime.data?.map((d) => d.chat_interaction) ?? [];
  const cartSeries = eventsOverTime.data?.map((d) => d.add_to_cart) ?? [];

  const chartData =
    eventsOverTime.data?.map((d) => ({
      ...d,
      day: formatDay(d.day),
    })) ?? [];

  // Conversion funnel stages
  const funnelStages = [
    { label: "Хуудас үзэлт", value: stats.data?.pageViews ?? 0 },
    { label: "Сагс нэмэлт", value: stats.data?.addToCarts ?? 0 },
    { label: "Захиалга", value: stats.data?.checkouts ?? 0 },
  ];

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

  const isLoading = stats.isLoading || eventsOverTime.isLoading;

  return (
    <div className="flex flex-col gap-8">
      {/* Row 1+2: Bento grid — hero metric + funnel + metric pair */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left column: Hero + MetricPair stacked */}
        <div className="flex flex-col gap-0">
          <HeroMetric
            label="Хуудас үзэлт"
            value={stats.data?.pageViews ?? 0}
            trend={
              stats.data
                ? {
                    value: Math.abs(stats.data.pageViewsTrend),
                    isPositive: stats.data.pageViewsTrend >= 0,
                  }
                : undefined
            }
            sparklineData={pageViewSeries}
            isLoading={isLoading}
          />

          <MetricPair
            metrics={[
              {
                label: "Чат харилцаа",
                value: stats.data?.chatInteractions ?? 0,
                trend: stats.data
                  ? {
                      value: Math.abs(stats.data.chatInteractionsTrend),
                      isPositive: stats.data.chatInteractionsTrend >= 0,
                    }
                  : undefined,
                sparklineData: chatSeries,
              },
              {
                label: "Сагс нэмэлт",
                value: stats.data?.addToCarts ?? 0,
                trend: stats.data
                  ? {
                      value: Math.abs(stats.data.addToCartsTrend),
                      isPositive: stats.data.addToCartsTrend >= 0,
                    }
                  : undefined,
                sparklineData: cartSeries,
              },
            ]}
            isLoading={isLoading}
          />
        </div>

        {/* Right column: Conversion Funnel */}
        <ConversionFunnel stages={funnelStages} isLoading={isLoading} />
      </div>

      {/* Row 3: Area chart + Event breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <EventAreaChart
          data={chartData}
          isLoading={eventsOverTime.isLoading}
          isEmpty={!chartData.length}
        />

        <EventBreakdown data={eventTypeCounts.data ?? []} isLoading={eventTypeCounts.isLoading} />
      </div>
    </div>
  );
}
