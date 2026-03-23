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
  ResponsiveContainer,
} from "recharts";
import { BarChart3, Eye, MessageSquare, ShoppingCart, Package } from "lucide-react";
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Badge,
  FadeIn,
} from "@/shared/components/ui";

const eventsOverTime = [
  { day: "03/17", page_view: 1856, add_to_cart: 52 },
  { day: "03/18", page_view: 1742, add_to_cart: 48 },
  { day: "03/19", page_view: 2103, add_to_cart: 67 },
  { day: "03/20", page_view: 1934, add_to_cart: 55 },
  { day: "03/21", page_view: 2245, add_to_cart: 71 },
  { day: "03/22", page_view: 1678, add_to_cart: 43 },
  { day: "03/23", page_view: 1898, add_to_cart: 58 },
];

const topEventTypes = [
  { event: "page_view", count: 12456 },
  { event: "chat_open", count: 3421 },
  { event: "product_view", count: 2876 },
  { event: "add_to_cart", count: 1247 },
  { event: "search", count: 987 },
  { event: "checkout", count: 342 },
];

const conversationStats = [
  { day: "03/17", started: 178, completed: 145 },
  { day: "03/18", started: 165, completed: 132 },
  { day: "03/19", started: 201, completed: 167 },
  { day: "03/20", started: 189, completed: 156 },
  { day: "03/21", started: 212, completed: 178 },
  { day: "03/22", started: 156, completed: 123 },
  { day: "03/23", started: 186, completed: 152 },
];

const productStats = [
  { name: "Cashmere цамц", views: 1243, carts: 187, orders: 45 },
  { name: "Galaxy S24 Ultra", views: 987, carts: 134, orders: 23 },
  { name: "Nike Air Max 90", views: 876, carts: 98, orders: 34 },
  { name: "Xiaomi Band 8", views: 654, carts: 89, orders: 28 },
  { name: "Арьсан цүнх", views: 543, carts: 67, orders: 19 },
  { name: "Ноосон хөнжил", views: 432, carts: 56, orders: 15 },
];

const tooltipStyle = {
  backgroundColor: "var(--color-surface-primary)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: 13,
};

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Аналитик"
          description="Дэлгүүрийн үйл ажиллагааны дэлгэрэнгүй тайлан"
          actions={
            <Select defaultValue="7">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Сүүлийн 7 хоног</SelectItem>
                <SelectItem value="30">Сүүлийн 30 хоног</SelectItem>
                <SelectItem value="90">Сүүлийн 90 хоног</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Ерөнхий</TabsTrigger>
            <TabsTrigger value="conversations">Яриа</TabsTrigger>
            <TabsTrigger value="products">Бараа</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FadeIn delay={0.1}>
                  <StatCard
                    label="Хуудас үзэлт"
                    value="12,456"
                    trend={{ value: 5.3, isPositive: true }}
                    icon={<Eye className="h-4 w-4" />}
                  />
                </FadeIn>
                <FadeIn delay={0.15}>
                  <StatCard
                    label="Чат харилцаа"
                    value="1,247"
                    trend={{ value: 12.5, isPositive: true }}
                    icon={<MessageSquare className="h-4 w-4" />}
                  />
                </FadeIn>
                <FadeIn delay={0.2}>
                  <StatCard
                    label="Сагс нэмэлт"
                    value="342"
                    trend={{ value: 3.1, isPositive: true }}
                    icon={<ShoppingCart className="h-4 w-4" />}
                  />
                </FadeIn>
                <FadeIn delay={0.25}>
                  <StatCard
                    label="Захиалга"
                    value="89"
                    trend={{ value: 2.4, isPositive: false }}
                    icon={<Package className="h-4 w-4" />}
                  />
                </FadeIn>
              </div>

              <FadeIn delay={0.3}>
                <Card padding="md">
                  <CardHeader>
                    <CardTitle>Эвентийн график</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={eventsOverTime}>
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
                          <RechartsTooltip contentStyle={tooltipStyle} />
                          <Line
                            type="monotone"
                            dataKey="page_view"
                            stroke="var(--color-brand-500)"
                            strokeWidth={2}
                            dot={false}
                            name="Хуудас үзэлт"
                          />
                          <Line
                            type="monotone"
                            dataKey="add_to_cart"
                            stroke="var(--color-success)"
                            strokeWidth={2}
                            dot={false}
                            name="Сагс нэмэлт"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              <FadeIn delay={0.4}>
                <Card padding="md">
                  <CardHeader>
                    <CardTitle>Эвентийн төрлүүд</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topEventTypes} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border-default)"
                            horizontal={false}
                          />
                          <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "var(--color-text-tertiary)" }}
                          />
                          <YAxis
                            type="category"
                            dataKey="event"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                            width={100}
                          />
                          <RechartsTooltip contentStyle={tooltipStyle} />
                          <Bar
                            dataKey="count"
                            fill="var(--color-brand-500)"
                            radius={[0, 4, 4, 0]}
                            name="Тоо"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </TabsContent>

          <TabsContent value="conversations">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FadeIn delay={0.1}>
                  <StatCard
                    label="Нийт яриа"
                    value="1,287"
                    trend={{ value: 8.7, isPositive: true }}
                  />
                </FadeIn>
                <FadeIn delay={0.15}>
                  <StatCard
                    label="Дундаж хугацаа"
                    value="4.2 мин"
                    trend={{ value: 1.2, isPositive: false }}
                  />
                </FadeIn>
                <FadeIn delay={0.2}>
                  <StatCard
                    label="Шийдсэн"
                    value="1,053"
                    trend={{ value: 6.1, isPositive: true }}
                  />
                </FadeIn>
                <FadeIn delay={0.25}>
                  <StatCard
                    label="Сэтгэл ханамж"
                    value="94%"
                    trend={{ value: 2.3, isPositive: true }}
                  />
                </FadeIn>
              </div>

              <FadeIn delay={0.3}>
                <Card padding="md">
                  <CardHeader>
                    <CardTitle>Ярианы динамик</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={conversationStats}>
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
                          <RechartsTooltip contentStyle={tooltipStyle} />
                          <Line
                            type="monotone"
                            dataKey="started"
                            stroke="var(--color-brand-500)"
                            strokeWidth={2}
                            dot={false}
                            name="Эхэлсэн"
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="var(--color-success)"
                            strokeWidth={2}
                            dot={false}
                            name="Дууссан"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <FadeIn delay={0.1}>
                  <StatCard label="Нийт бараа" value="186" />
                </FadeIn>
                <FadeIn delay={0.15}>
                  <StatCard label="Идэвхтэй бараа" value="172" />
                </FadeIn>
                <FadeIn delay={0.2}>
                  <StatCard label="Нөөцгүй бараа" value="14" />
                </FadeIn>
              </div>

              <FadeIn delay={0.25}>
                <Card padding="none">
                  <div className="px-5 pt-5">
                    <CardHeader>
                      <CardTitle>Барааны статистик</CardTitle>
                    </CardHeader>
                  </div>
                  <CardContent className="px-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border-default">
                            <th className="px-5 py-2.5 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                              Бараа
                            </th>
                            <th className="px-5 py-2.5 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                              Үзэлт
                            </th>
                            <th className="px-5 py-2.5 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                              Сагс
                            </th>
                            <th className="px-5 py-2.5 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                              Захиалга
                            </th>
                            <th className="px-5 py-2.5 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                              Хөрвүүлэлт
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-default">
                          {productStats.map((product) => (
                            <tr key={product.name}>
                              <td className="px-5 py-3 text-sm font-medium text-text-primary">
                                {product.name}
                              </td>
                              <td className="px-5 py-3 text-sm text-text-secondary text-right">
                                {product.views.toLocaleString()}
                              </td>
                              <td className="px-5 py-3 text-sm text-text-secondary text-right">
                                {product.carts.toLocaleString()}
                              </td>
                              <td className="px-5 py-3 text-sm text-text-secondary text-right">
                                {product.orders}
                              </td>
                              <td className="px-5 py-3 text-right">
                                <Badge variant="brand" size="sm">
                                  {((product.orders / product.views) * 100).toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  );
}
