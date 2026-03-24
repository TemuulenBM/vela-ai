"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  ProgressBar,
  CountUp,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES } from "./constants";
import { UpgradeModal } from "./upgrade-modal";
import { PaymentHistory } from "./payment-history";

export function BillingTab() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const storeQuery = trpc.tenants.getStore.useQuery();
  const usageQuery = trpc.tenants.getUsage.useQuery();

  const plan = storeQuery.data?.plan ?? "free";
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const usage = usageQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <Card padding="md" className="border-l-2 border-l-brand-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <CardTitle>Одоогийн багц</CardTitle>
              <CardDescription>Таны идэвхтэй захиалгын багц</CardDescription>
            </div>
            <Badge variant="brand" size="lg">
              {PLAN_LABELS[plan] ?? plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">
                {PLAN_LABELS[plan] ?? plan} багц
              </span>
              <span className="text-sm font-semibold text-text-primary">
                {PLAN_PRICES[plan] ?? "—"}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              <li className="text-sm text-text-secondary">
                {limits.conversations.toLocaleString()} яриа / сар
              </li>
              <li className="text-sm text-text-secondary">
                {limits.products.toLocaleString()} бараа хүртэл
              </li>
              <li className="text-sm text-text-secondary">Аналитик дашбоард</li>
              <li className="text-sm text-text-secondary">{limits.members} багийн гишүүн</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" onClick={() => setShowUpgrade(true)}>
            Шинэчлэх
          </Button>
        </CardFooter>
      </Card>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} currentPlan={plan} />

      <Card padding="md">
        <CardHeader>
          <CardTitle>Ашиглалтын мэдээлэл</CardTitle>
          <CardDescription>Нийт ашиглалтын статистик</CardDescription>
        </CardHeader>
        <CardContent>
          {usageQuery.isLoading ? (
            <div className="h-32 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary" />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Яриа</span>
                  <span className="text-sm text-text-secondary tabular-nums">
                    <CountUp
                      to={usage?.conversations ?? 0}
                      format={(n) => Math.round(n).toLocaleString()}
                    />{" "}
                    / {limits.conversations.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(((usage?.conversations ?? 0) / limits.conversations) * 100, 100)}
                  height={8}
                  color="var(--color-brand-500)"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Бараа</span>
                  <span className="text-sm text-text-secondary tabular-nums">
                    <CountUp
                      to={usage?.products ?? 0}
                      format={(n) => Math.round(n).toLocaleString()}
                    />{" "}
                    / {limits.products.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(((usage?.products ?? 0) / limits.products) * 100, 100)}
                  height={8}
                  delay={0.1}
                  color="var(--color-brand-500)"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Багийн гишүүн</span>
                  <span className="text-sm text-text-secondary tabular-nums">
                    <CountUp
                      to={usage?.members ?? 0}
                      format={(n) => Math.round(n).toLocaleString()}
                    />{" "}
                    / {limits.members}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(((usage?.members ?? 0) / limits.members) * 100, 100)}
                  height={8}
                  delay={0.2}
                  color="var(--color-brand-500)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Төлбөрийн түүх</CardTitle>
          <CardDescription>Өмнөх төлбөрүүдийн жагсаалт</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistory />
        </CardContent>
      </Card>
    </div>
  );
}
