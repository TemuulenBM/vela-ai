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
import { trpc } from "@/shared/lib/trpc";
import { PLAN_ANALYTICS, PLAN_LABELS } from "@/shared/lib/plan-config";
import { OverviewTab } from "@/features/analytics/components/overview-tab";
import { ConversationsTab } from "@/features/analytics/components/conversations-tab";
import { ProductsTab } from "@/features/analytics/components/products-tab";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [tab, setTab] = useState("overview");

  const storeQuery = trpc.tenants.getStore.useQuery();
  const plan = storeQuery.data?.plan ?? "trial";
  const analyticsLevel = PLAN_ANALYTICS[plan] ?? "none";
  const isBasic = analyticsLevel === "basic";
  // Basic план дээр зөвхөн overview tab → stale tab state сэргийлэх
  const activeTab = isBasic ? "overview" : tab;

  // Trial — аналитик хандалт хаах
  if (storeQuery.isLoading) {
    return (
      <div className="px-8 py-10 max-w-[1600px] mx-auto">
        <div className="h-64 animate-pulse rounded-3xl bg-white/[0.04]" />
      </div>
    );
  }

  if (analyticsLevel === "none") {
    return (
      <div className="px-8 py-10 max-w-[1600px] mx-auto flex flex-col gap-6">
        <FadeIn>
          <PageHeader
            title="Аналитик"
            description="Дэлгүүрийн үйл ажиллагааны дэлгэрэнгүй тайлан"
          />
        </FadeIn>
        <FadeIn delay={0.05}>
          <div className="glass-card rounded-3xl p-12 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
              <span className="material-symbols-outlined text-[32px] text-white/40">lock</span>
            </div>
            <h3 className="font-headline text-xl italic text-white">
              Аналитик {PLAN_LABELS[plan]} багцад хүртээмжгүй
            </h3>
            <p className="max-w-md text-sm text-white/40">
              Дэлгүүрийнхээ яриа, бараа, борлуулалтын статистик харахын тулд Solo эсвэл түүнээс дээш
              багц руу шинэчлээрэй.
            </p>
            <a
              href="/settings?tab=billing"
              className="mt-2 rounded-full bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90"
            >
              Багц шинэчлэх
            </a>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 max-w-[1600px] mx-auto flex flex-col gap-6">
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
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Ерөнхий</TabsTrigger>
            {!isBasic && <TabsTrigger value="conversations">Яриа</TabsTrigger>}
            {!isBasic && <TabsTrigger value="products">Бараа</TabsTrigger>}
          </TabsList>
        </Tabs>

        <div className="mt-5">
          {activeTab === "overview" && <OverviewTab days={days} />}
          {!isBasic && activeTab === "conversations" && <ConversationsTab days={days} />}
          {!isBasic && activeTab === "products" && <ProductsTab days={days} />}
        </div>

        {isBasic && (
          <div className="mt-6 glass-card rounded-3xl p-6 flex items-center gap-4">
            <span className="material-symbols-outlined text-[24px] text-white/40">info</span>
            <div className="flex-1">
              <p className="text-sm text-white/50">
                Яриа болон бараа аналитик Plus эсвэл Max багцад нээгдэнэ.
              </p>
            </div>
            <a
              href="/settings?tab=billing"
              className="shrink-0 rounded-full bg-white/[0.08] px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70 transition-all hover:bg-white/[0.12]"
            >
              Багц солих
            </a>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
