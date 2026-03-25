"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Eye } from "lucide-react";
import {
  Avatar,
  Badge,
  Sparkline,
  ProgressBar,
  CountUp,
  FadeIn,
  AnimateList,
  PageHeader,
  EmptyState,
  Button,
} from "@/shared/components/ui";
import { cn, formatDay, formatRelativeTime } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

type ConvStatus = "active" | "resolved" | "abandoned" | "escalated";

const STATUS_BADGE: Record<ConvStatus, { variant: "success" | "default"; label: string }> = {
  active: { variant: "success", label: "Идэвхтэй" },
  resolved: { variant: "default", label: "Шийдсэн" },
  escalated: { variant: "success", label: "Дамжуулсан" },
  abandoned: { variant: "default", label: "Орхисон" },
};

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        isPositive ? "bg-[#a8e6cf]/15 text-[#a8e6cf]" : "bg-[#ffb4ab]/15 text-[#ffb4ab]",
      )}
    >
      <span className="material-symbols-outlined text-[14px]">
        {isPositive ? "trending_up" : "trending_down"}
      </span>
      {Math.abs(value)}%
    </span>
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
    <div className="px-8 py-10 max-w-[1600px] mx-auto">
      {/* Hero heading */}
      <FadeIn>
        <PageHeader
          title={
            <>
              Хяналтын <span className="text-white/40">самбар</span>
            </>
          }
          description="Бизнесийн ерөнхий мэдээлэл"
        />
      </FadeIn>

      {/* KPI Cards */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Total Sales / Conversations */}
        <FadeIn delay={0.05}>
          <div className="glass-card glass-glint rounded-3xl p-8 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] text-white/60">
                  chat_bubble
                </span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Нийт яриа
              </p>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-serif italic leading-none tracking-tight text-white tabular-nums">
                <CountUp
                  to={convSummary.data?.total ?? 0}
                  format={(n) => Math.round(n).toLocaleString()}
                />
              </p>
              {convSummary.data && <TrendBadge value={convSummary.data.totalTrend} />}
            </div>
            {sparklineData.length > 0 && (
              <div className="mt-6">
                <Sparkline data={sparklineData} width={200} height={50} />
              </div>
            )}
          </div>
        </FadeIn>

        {/* Active Chats */}
        <FadeIn delay={0.1}>
          <div className="glass-card glass-glint rounded-3xl p-8 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] text-white/60">forum</span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Чатын харилцаа
              </p>
            </div>
            <p className="text-4xl font-serif italic leading-none tracking-tight text-white tabular-nums">
              <CountUp
                to={overviewStats.data?.chatInteractions ?? 0}
                format={(n) => Math.round(n).toLocaleString()}
              />
            </p>
            {overviewStats.data && (
              <div className="mt-2">
                <TrendBadge value={overviewStats.data.chatInteractionsTrend} />
              </div>
            )}
          </div>
        </FadeIn>

        {/* Resolution Rate */}
        <FadeIn delay={0.15}>
          <div className="glass-card glass-glint rounded-3xl p-8 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-[20px] text-white/60">
                  check_circle
                </span>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Шийдвэрлэлт
              </p>
            </div>
            <p className="text-4xl font-serif italic leading-none tracking-tight text-white tabular-nums">
              {conversionRate}%
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Chart + Conversations + Products */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Usage Analytics Chart */}
        <FadeIn delay={0.2} className="lg:col-span-8">
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-6">
              Ашиглалтын график
            </h3>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConvOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.15)" stopOpacity={1} />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.01)" stopOpacity={1} />
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
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
                      dy={8}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "16px",
                        fontSize: 13,
                        color: "white",
                        backdropFilter: "blur(20px)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={2}
                      fill="url(#colorConvOverview)"
                      fillOpacity={1}
                      dot={false}
                      activeDot={{
                        r: 4,
                        strokeWidth: 2,
                        fill: "rgba(255,255,255,0.1)",
                      }}
                      name="Яриа"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  icon={<span className="material-symbols-outlined text-[20px]">bar_chart</span>}
                  title={convStats.isLoading ? "Ачааллаж байна..." : "Мэдээлэл алга"}
                  description="Өгөгдөл цуглагдсаны дараа график харагдана"
                  className="py-0 h-full"
                />
              )}
            </div>
          </div>
        </FadeIn>

        {/* Recent Conversations */}
        <FadeIn delay={0.25} className="lg:col-span-4">
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-6">
              Сүүлийн яриа
            </h3>
            {recentConvs.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.05]" />
                ))}
              </div>
            ) : (recentConvs.data ?? []).length === 0 ? (
              <EmptyState
                icon={<span className="material-symbols-outlined text-[20px]">forum</span>}
                title="Яриа алга байна"
                action={
                  <Button variant="link" asChild>
                    <Link href="/conversations">Яриа хуудас руу очих →</Link>
                  </Button>
                }
                className="py-8"
              />
            ) : (
              <AnimateList stagger={0.04}>
                {(recentConvs.data ?? []).map((conv) => {
                  const name = conv.shopperName ?? conv.shopperEmail ?? "Зочин";
                  const badge = STATUS_BADGE[conv.status as ConvStatus] ?? STATUS_BADGE.active;
                  return (
                    <div
                      key={conv.id}
                      className="flex items-center gap-3 rounded-2xl py-3 px-3 -mx-3 transition-colors hover:bg-white/[0.03]"
                    >
                      <Avatar size="sm" fallback={name.charAt(0)} alt={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{name}</span>
                          <Badge variant={badge.variant} size="sm">
                            {badge.label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-white/50">
                          {conv.lastMessage ?? "Мессеж алга"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-white/30">
                        {formatRelativeTime(conv.lastMessageAt ?? conv.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </AnimateList>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Top Products */}
      <div className="mt-8">
        <FadeIn delay={0.3}>
          <div className="glass-card rounded-3xl p-8">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-6">
              Шилдэг бараа
            </h3>
            {topProducts.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.05]" />
                ))}
              </div>
            ) : (topProducts.data ?? []).length === 0 ? (
              <EmptyState
                icon={<span className="material-symbols-outlined text-[20px]">inventory_2</span>}
                title="Бараа алга байна"
                action={
                  <Button variant="link" asChild>
                    <Link href="/products">Бараа нэмэх →</Link>
                  </Button>
                }
                className="py-8"
              />
            ) : (
              <AnimateList stagger={0.04}>
                {(topProducts.data ?? []).map((product, index) => {
                  const viewPercent = (product.views / maxViews) * 100;
                  const isTop = index === 0;
                  return (
                    <div
                      key={product.productId}
                      className={cn(
                        "rounded-2xl py-3 px-3 -mx-3 transition-colors hover:bg-white/[0.03]",
                        isTop && "bg-white/[0.04]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "shrink-0 tabular-nums font-serif italic",
                            isTop ? "text-2xl text-white" : "w-6 text-center text-sm text-white/40",
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{product.name}</p>
                          <div className="mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-xs text-white/40">
                              <Eye className="h-3 w-3" />
                              {product.views.toLocaleString()}
                            </span>
                            <span className="text-xs text-white/60">{product.orders} захиалга</span>
                            <span className="text-xs font-medium text-white/60">
                              {product.conversionRate}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <ProgressBar
                              value={viewPercent}
                              height={3}
                              delay={index * 0.04}
                              color="rgba(255,255,255,0.2)"
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
