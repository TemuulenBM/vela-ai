"use client";

import { useState } from "react";
import {
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  FadeIn,
} from "@/shared/components/ui";
import { OverviewTab } from "@/features/analytics/components/overview-tab";
import { ConversationsTab } from "@/features/analytics/components/conversations-tab";
import { ProductsTab } from "@/features/analytics/components/products-tab";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState("overview");

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Аналитик"
          description="Дэлгүүрийн үйл ажиллагааны дэлгэрэнгүй тайлан"
          actions={
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
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
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Ерөнхий</TabsTrigger>
            <TabsTrigger value="conversations">Яриа</TabsTrigger>
            <TabsTrigger value="products">Бараа</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-5">
          {tab === "overview" && <OverviewTab days={days} />}
          {tab === "conversations" && <ConversationsTab days={days} />}
          {tab === "products" && <ProductsTab days={days} />}
        </div>
      </FadeIn>
    </div>
  );
}
