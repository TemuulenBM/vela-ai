"use client";

import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";
import {
  PageHeader,
  Avatar,
  Badge,
  Sparkline,
  ProgressBar,
  CountUp,
  FadeIn,
  AnimateList,
} from "@/shared/components/ui";
import { cn, formatDay, formatRelativeTime } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

type ConvStatus = "active" | "resolved" | "abandoned" | "escalated";

const STATUS_BADGE: Record<ConvStatus, { variant: "success" | "default"; label: string }> = {
  active: { variant: "success", label: "Идэвхтэй" },
  resolved: { variant: "default", label: "Шийдвэрлэсэн" },
  escalated: { variant: "success", label: "Эскалацлагдсан" },
  abandoned: { variant: "default", label: "Орхигдсон" },
};

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs font-medium",
        isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600",
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="tabular-nums">{Math.abs(value)}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const convSummary = trpc.analytics.getConversationSummary.useQuery({ days: 7 });
  const overviewStats = trpc.analytics.getOverviewStats.useQuery({ days: 7 });
  const convStats = trpc.analytics.getConversationStats.useQuery({ days: 7 });
  const topProducts = trpc.analytics.getTopProducts.useQuery({ days: 7, limit: 5 });
  const productSummary = trpc.analytics.getProductSummary.useQuery();
  const recentConvs = trpc.chat.getRecentConversations.useQuery({ limit: 5 });

  const chartData = (convStats.data ?? []).map((d) => ({
    day: formatDay(d.day),
    conversations: d.started,
  }));

  const sparklineData = chartData.map((d) => d.conversations);

  const conversionRate =
    overviewStats.data && overviewStats.data.pageViews > 0
      ? Math.round((overviewStats.data.checkouts / overviewStats.data.pageViews) * 1000) / 10
      : 0;

  const maxViews = Math.max(...(topProducts.data ?? []).map((p) => p.views), 1);

  return (
    <div className="flex flex-col gap-8">
      <FadeIn>
        <PageHeader title="Хянах самбар" description="Таны дэлгүүрийн ерөнхий мэдээлэл" />
      </FadeIn>

      {/* Top section: Bento grid — Hero metrics + Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Left: Hero metric + metric pair */}
        <div className="flex flex-col">
          {/* Hero metric — Нийт яриа */}
          <FadeIn delay={0.05}>
            <div className="border-t border-border-default pt-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                Нийт яриа
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p className="text-[42px] font-semibold leading-none tracking-tighter text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                  <CountUp
                    to={convSummary.data?.total ?? 0}
                    format={(n) => Math.round(n).toLocaleString()}
                  />
                </p>
                {convSummary.data && (
                  <div className="mb-1.5">
                    <TrendBadge value={convSummary.data.totalTrend} />
                  </div>
                )}
              </div>
              {sparklineData.length > 0 && (
                <div className="mt-4">
                  <Sparkline data={sparklineData} width={200} height={60} />
                </div>
              )}
            </div>
          </FadeIn>

          {/* Secondary metrics */}
          <FadeIn delay={0.1}>
            <div className="divide-y divide-border-default border-t border-border-default">
              {/* Chat interactions */}
              <div className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Чат харилцаа
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                      <CountUp
                        to={overviewStats.data?.chatInteractions ?? 0}
                        format={(n) => Math.round(n).toLocaleString()}
                      />
                    </p>
                    {overviewStats.data && (
                      <div className="mb-0.5">
                        <TrendBadge value={overviewStats.data.chatInteractionsTrend} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversion rate */}
              <div className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Хөрвүүлэлт
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                      {conversionRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                  Бараа
                </p>
                <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                  <CountUp
                    to={productSummary.data?.totalProducts ?? 0}
                    format={(n) => Math.round(n).toLocaleString()}
                  />
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right: Conversation trend chart */}
        <FadeIn delay={0.15}>
          <div className="border-t border-border-default pt-5">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Ярианы тоо</h3>
            <div className="h-[340px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConvOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
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
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface-primary)",
                        border: "1px solid var(--color-border-default)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke="var(--color-brand-500)"
                      strokeWidth={2}
                      fill="url(#colorConvOverview)"
                      fillOpacity={1}
                      dot={false}
                      activeDot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: "var(--color-surface-primary)",
                      }}
                      name="Яриа"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
                  {convStats.isLoading ? "Уншиж байна..." : "Мэдээлэл байхгүй"}
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Bottom section: Conversations + Products asymmetric */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent conversations */}
        <FadeIn delay={0.2}>
          <div className="border-t border-border-default pt-5">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Сүүлийн яриа</h3>
            {recentConvs.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
                  />
                ))}
              </div>
            ) : (recentConvs.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-text-tertiary">Яриа байхгүй байна</p>
            ) : (
              <AnimateList stagger={0.04}>
                {(recentConvs.data ?? []).map((conv) => {
                  const name = conv.shopperName ?? conv.shopperEmail ?? "Зочин";
                  const badge = STATUS_BADGE[conv.status as ConvStatus] ?? STATUS_BADGE.active;
                  return (
                    <div
                      key={conv.id}
                      className={cn(
                        "flex items-center gap-3 border-b border-border-subtle py-3 last:border-0",
                        "transition-colors hover:bg-surface-secondary rounded-[var(--radius-sm)] px-2 -mx-2",
                      )}
                    >
                      <div
                        className={cn(
                          "h-8 w-0.5 shrink-0 rounded-full",
                          conv.status === "active" ? "bg-brand-500" : "bg-gray-200",
                        )}
                      />
                      <Avatar size="sm" fallback={name.charAt(0)} alt={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{name}</span>
                          <Badge variant={badge.variant} size="sm">
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-text-secondary">
                          {conv.lastMessage ?? "Мессеж байхгүй"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-text-tertiary">
                        {formatRelativeTime(conv.lastMessageAt ?? conv.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </AnimateList>
            )}
          </div>
        </FadeIn>

        {/* Top products — ranked with inline bars */}
        <FadeIn delay={0.25}>
          <div className="border-t border-border-default pt-5">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Шилдэг бараа</h3>
            {topProducts.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
                  />
                ))}
              </div>
            ) : (topProducts.data ?? []).length === 0 ? (
              <p className="py-8 text-center text-sm text-text-tertiary">Мэдээлэл байхгүй</p>
            ) : (
              <AnimateList stagger={0.04}>
                {(topProducts.data ?? []).map((product, index) => {
                  const viewPercent = (product.views / maxViews) * 100;
                  const isTop = index === 0;

                  return (
                    <div
                      key={product.productId}
                      className={cn(
                        "border-b border-border-subtle py-3 last:border-0",
                        isTop && "rounded-[var(--radius-md)] bg-brand-50/30 px-3 -mx-3",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "shrink-0 tabular-nums font-[family-name:var(--font-geist)]",
                            isTop
                              ? "text-lg font-bold text-brand-500"
                              : "w-5 text-center text-[13px] font-medium text-text-tertiary",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-text-primary">
                            {product.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-text-tertiary">
                              <Eye className="h-3 w-3" />
                              {product.views.toLocaleString()}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {product.orders} захиалга
                            </span>
                            <span className="text-xs font-medium text-text-secondary">
                              {product.conversionRate}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <ProgressBar
                              value={viewPercent}
                              height={3}
                              delay={index * 0.04}
                              color="var(--color-brand-400)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </AnimateList>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
