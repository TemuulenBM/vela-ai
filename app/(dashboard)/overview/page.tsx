"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { MessageSquare, MessagesSquare, Package, TrendingUp, Eye } from "lucide-react";
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  Badge,
  FadeIn,
} from "@/shared/components/ui";
import { formatPrice } from "@/shared/lib/utils";

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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader title="Хянах самбар" description="Таны дэлгүүрийн ерөнхий мэдээлэл" />
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0.05}>
          <StatCard
            label="Нийт яриа"
            value="1,247"
            trend={{ value: 12.5, isPositive: true }}
            icon={<MessageSquare className="h-4 w-4" />}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <StatCard
            label="Өнөөдрийн мессеж"
            value="342"
            trend={{ value: 8.2, isPositive: true }}
            icon={<MessagesSquare className="h-4 w-4" />}
          />
        </FadeIn>
        <FadeIn delay={0.15}>
          <StatCard label="Бараа" value="186" icon={<Package className="h-4 w-4" />} />
        </FadeIn>
        <FadeIn delay={0.2}>
          <StatCard
            label="Хөрвүүлэлт"
            value="3.2%"
            trend={{ value: 0.4, isPositive: true }}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </FadeIn>
      </div>

      <FadeIn delay={0.25}>
        <Card padding="md">
          <CardHeader>
            <CardTitle>Ярианы тоо</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-default)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
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
                    fill="url(#colorConversations)"
                    name="Яриа"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FadeIn delay={0.3}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Сүүлийн яриа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-border-default">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar size="sm" fallback={conv.name.charAt(0)} alt={conv.name} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{conv.name}</span>
                        <Badge variant={conv.status === "active" ? "success" : "default"} size="sm">
                          {conv.status === "active" ? "Идэвхтэй" : "Хаагдсан"}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary truncate">{conv.message}</p>
                    </div>
                    <span className="text-xs text-text-tertiary shrink-0">{conv.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.35}>
          <Card padding="md">
            <CardHeader>
              <CardTitle>Шилдэг бараа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-border-default">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-surface-tertiary text-xs font-medium text-text-secondary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-text-tertiary">
                          <Eye className="h-3 w-3" />
                          {product.views.toLocaleString()}
                        </span>
                        <span className="text-xs text-text-tertiary">
                          {formatPrice(product.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
