"use client";

import { trpc } from "@/shared/lib/trpc";
import { formatDay } from "@/shared/lib/utils";
import { ResolutionRing } from "./resolution-ring";
import { ConversationAreaChart } from "./conversation-area-chart";

export function ConversationsTab({ days }: { days: number }) {
  const summary = trpc.analytics.getConversationSummary.useQuery({ days });
  const stats = trpc.analytics.getConversationStats.useQuery({ days });

  const chartData =
    stats.data?.map((d) => ({
      ...d,
      day: formatDay(d.day),
    })) ?? [];

  const hasError = summary.isError || stats.isError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text-secondary">Өгөгдөл ачаалахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-text-tertiary">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            summary.refetch();
            stats.refetch();
          }}
          className="mt-4 rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      {/* Left: Resolution ring + summary */}
      <ResolutionRing
        total={summary.data?.total ?? 0}
        resolved={summary.data?.resolved ?? 0}
        resolutionRate={summary.data?.resolutionRate ?? 0}
        totalTrend={
          summary.data
            ? {
                value: Math.abs(summary.data.totalTrend),
                isPositive: summary.data.totalTrend >= 0,
              }
            : undefined
        }
        resolvedTrend={
          summary.data
            ? {
                value: Math.abs(summary.data.resolvedTrend),
                isPositive: summary.data.resolvedTrend >= 0,
              }
            : undefined
        }
        isLoading={summary.isLoading}
      />

      {/* Right: Area chart */}
      <ConversationAreaChart
        data={chartData}
        isLoading={stats.isLoading}
        isEmpty={!chartData.length}
      />
    </div>
  );
}
