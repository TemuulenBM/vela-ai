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
    { label: "Сагсанд нэмсэн", value: stats.data?.addToCarts ?? 0 },
    { label: "Захиалга", value: stats.data?.checkouts ?? 0 },
  ];

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-symbols-outlined text-white/20 text-[32px] mb-4">cloud_off</span>
        <p className="text-sm font-medium text-white/70">Мэдээлэл ачаалахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-white/40 font-light">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            stats.refetch();
            eventsOverTime.refetch();
            eventTypeCounts.refetch();
          }}
          className="mt-4 glass-card rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
        >
          Дахин
        </button>
      </div>
    );
  }

  const isLoading = stats.isLoading || eventsOverTime.isLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Bento grid — hero metric + side stats + funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Hero metric (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
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
        </div>

        {/* Right column: MetricPair side stats (4 cols) */}
        <div className="lg:col-span-4">
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
                label: "Сагсанд нэмэлт",
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
      </div>

      {/* Row 2: Conversion funnel full width */}
      <ConversionFunnel stages={funnelStages} isLoading={isLoading} />

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
