"use client";

import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Eye } from "lucide-react";
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
import { cn, formatPrice } from "@/shared/lib/utils";

/* ─── Demo data ─── */

const chartData = [
  { day: "Дав", conversations: 156 },
  { day: "Мяг", conversations: 189 },
  { day: "Лха", conversations: 172 },
  { day: "Пүр", conversations: 210 },
  { day: "Баа", conversations: 198 },
  { day: "Бям", conversations: 145 },
  { day: "Ням", conversations: 177 },
];

const recentConversations = [
  {
    id: 1,
    name: "Болд",
    message: "Энэ cashmere цамцны хэмжээ яаж сонгох вэ?",
    time: "5 мин",
    status: "active" as const,
  },
  {
    id: 2,
    name: "Сарнай",
    message: "Захиалга хүргэлтийн хугацаа хэд хоног вэ?",
    time: "12 мин",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Батаа",
    message: "Samsung Galaxy S24 нөөцөд байна уу?",
    time: "34 мин",
    status: "closed" as const,
  },
  {
    id: 4,
    name: "Оюунаа",
    message: "Буцаалт хийх боломжтой юу?",
    time: "1 цаг",
    status: "active" as const,
  },
  {
    id: 5,
    name: "Дорж",
    message: "Гэрийн тавилгын хөнгөлөлт байна уу?",
    time: "2 цаг",
    status: "closed" as const,
  },
];

const topProducts = [
  { id: 1, name: "Cashmere цамц (Gobi)", views: 1243, revenue: 2890000 },
  { id: 2, name: "Samsung Galaxy S24 Ultra", views: 987, revenue: 4560000 },
  { id: 3, name: "Nike Air Max 90", views: 876, revenue: 1780000 },
  { id: 4, name: "Ухаалаг цаг Xiaomi Band 8", views: 654, revenue: 890000 },
  { id: 5, name: "Арьсан цүнх (Монгол)", views: 543, revenue: 1250000 },
];

const sparklineData = chartData.map((d) => d.conversations);
const maxRevenue = Math.max(...topProducts.map((p) => p.revenue));

export default function DashboardPage() {
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
                  <CountUp to={1247} format={(n) => Math.round(n).toLocaleString()} />
                </p>
                <div className="mb-1.5 flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  <TrendingUp className="h-3 w-3" />
                  <span className="tabular-nums">12.5%</span>
                </div>
              </div>
              <div className="mt-4">
                <Sparkline data={sparklineData} width={200} height={60} />
              </div>
            </div>
          </FadeIn>

          {/* Secondary metrics */}
          <FadeIn delay={0.1}>
            <div className="divide-y divide-border-default border-t border-border-default">
              {/* Мессеж */}
              <div className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Өнөөдрийн мессеж
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                      <CountUp to={342} format={(n) => Math.round(n).toLocaleString()} />
                    </p>
                    <div className="mb-0.5 flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span className="tabular-nums">8.2%</span>
                    </div>
                  </div>
                </div>
                <Sparkline
                  data={[120, 135, 110, 145, 160, 138, 155]}
                  width={64}
                  height={28}
                  className="opacity-60"
                />
              </div>

              {/* Хөрвүүлэлт */}
              <div className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                    Хөрвүүлэлт
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <p className="text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                      3.2%
                    </p>
                    <div className="mb-0.5 flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
                      <TrendingUp className="h-2.5 w-2.5" />
                      <span className="tabular-nums">0.4%</span>
                    </div>
                  </div>
                </div>
                <Sparkline
                  data={[2.1, 2.4, 2.8, 3.0, 2.9, 3.1, 3.2]}
                  width={64}
                  height={28}
                  color="var(--color-success)"
                  className="opacity-60"
                />
              </div>

              {/* Бараа */}
              <div className="py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                  Бараа
                </p>
                <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-text-primary tabular-nums font-[family-name:var(--font-geist)]">
                  <CountUp to={186} format={(n) => Math.round(n).toLocaleString()} />
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
            <AnimateList stagger={0.04}>
              {recentConversations.map((conv) => (
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
                  <Avatar size="sm" fallback={conv.name.charAt(0)} alt={conv.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">{conv.name}</span>
                      <Badge variant={conv.status === "active" ? "success" : "default"} size="sm">
                        {conv.status === "active" ? "Идэвхтэй" : "Хаагдсан"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[13px] text-text-secondary">
                      {conv.message}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-text-tertiary">{conv.time}</span>
                </div>
              ))}
            </AnimateList>
          </div>
        </FadeIn>

        {/* Top products — ranked with inline bars */}
        <FadeIn delay={0.25}>
          <div className="border-t border-border-default pt-5">
            <h3 className="mb-4 text-sm font-semibold text-text-primary">Шилдэг бараа</h3>
            <AnimateList stagger={0.04}>
              {topProducts.map((product, index) => {
                const revenuePercent = (product.revenue / maxRevenue) * 100;
                const isTop = index === 0;

                return (
                  <div
                    key={product.id}
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
                          <span className="text-xs font-medium text-text-secondary">
                            {formatPrice(product.revenue)}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar
                            value={revenuePercent}
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
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
