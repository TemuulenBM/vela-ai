"use client";

import { useState } from "react";
import { CountUp, ProgressBar } from "@/shared/components/ui";
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
      {/* Active Plan + Payment Method row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active Plan */}
        <div className="col-span-8 glass-card rounded-3xl p-8">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            ACTIVE PLAN
          </p>
          <h3 className="mt-2 font-serif text-3xl italic text-white">
            {PLAN_LABELS[plan] ?? plan}
          </h3>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-lg text-white/60">{PLAN_PRICES[plan] ?? "—"}</span>
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-full bg-white/[0.08] px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/70 transition-all hover:bg-white/[0.12]"
            >
              Change Plan
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="col-span-4 glass-card rounded-3xl p-8 flex flex-col justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            PAYMENT METHOD
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px] text-white/50">credit_card</span>
            <span className="font-mono text-lg text-white tracking-wider">•••• 8821</span>
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            EXPIRES 09/27
          </p>
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} currentPlan={plan} />

      {/* Usage Stats */}
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="font-serif text-2xl italic text-white">Usage Overview</h2>
          <p className="mt-1 text-sm text-white/40">Нийт ашиглалтын статистик</p>
        </div>

        {usageQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Conversations */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  CONVERSATIONS
                </span>
                <span className="text-sm text-white/50 tabular-nums">
                  <CountUp
                    to={usage?.conversations ?? 0}
                    format={(n) => Math.round(n).toLocaleString()}
                  />{" "}
                  / {limits.conversations.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={Math.min(((usage?.conversations ?? 0) / limits.conversations) * 100, 100)}
                height={6}
                color="rgba(255,255,255,0.20)"
              />
            </div>

            {/* Products */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  PRODUCTS
                </span>
                <span className="text-sm text-white/50 tabular-nums">
                  <CountUp
                    to={usage?.products ?? 0}
                    format={(n) => Math.round(n).toLocaleString()}
                  />{" "}
                  / {limits.products.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={Math.min(((usage?.products ?? 0) / limits.products) * 100, 100)}
                height={6}
                delay={0.1}
                color="rgba(255,255,255,0.20)"
              />
            </div>

            {/* Team Members */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  TEAM MEMBERS
                </span>
                <span className="text-sm text-white/50 tabular-nums">
                  <CountUp
                    to={usage?.members ?? 0}
                    format={(n) => Math.round(n).toLocaleString()}
                  />{" "}
                  / {limits.members}
                </span>
              </div>
              <ProgressBar
                value={Math.min(((usage?.members ?? 0) / limits.members) * 100, 100)}
                height={6}
                delay={0.2}
                color="rgba(255,255,255,0.20)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <PaymentHistory />

      {/* Upgrade banner */}
      <div className="glass-card rounded-3xl p-8 flex items-start gap-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06]">
          <span className="material-symbols-outlined text-[24px] text-white/60">auto_awesome</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Upgrade your compute limits?</h3>
          <p className="mt-1 text-sm text-white/40">
            Your current token usage is nearing its monthly threshold. Switching to yearly billing
            saves 20% on all enterprise features and unlocks dedicated GPU clusters.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowUpgrade(true)}
              className="rounded-full bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90"
            >
              Review Limits
            </button>
            <button className="text-sm text-white/40 transition-colors hover:text-white/60">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
