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
        <span className="material-symbols-outlined text-white/20 text-[32px] mb-4">cloud_off</span>
        <p className="text-sm font-medium text-white/70">Өгөгдөл ачааллахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-white/40 font-light">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            summary.refetch();
            stats.refetch();
          }}
          className="mt-4 glass-card rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
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
