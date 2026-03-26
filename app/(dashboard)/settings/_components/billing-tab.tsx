"use client";

import { useState } from "react";
import {
  CountUp,
  ProgressBar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES } from "./constants";
import { UpgradeModal } from "./upgrade-modal";
import { PaymentHistory } from "./payment-history";

export function BillingTab() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("upgrade-banner-dismissed") === "true";
  });

  const storeQuery = trpc.tenants.getStore.useQuery();
  const usageQuery = trpc.tenants.getUsage.useQuery();
  const subQuery = trpc.payments.getActiveSubscription.useQuery();
  const utils = trpc.useUtils();

  const cancelMutation = trpc.payments.cancelSubscription.useMutation({
    onSuccess: () => {
      utils.payments.getActiveSubscription.invalidate();
      utils.tenants.getStore.invalidate();
      utils.tenants.getUsage.invalidate();
      setShowCancelConfirm(false);
    },
  });

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
            ИДЭВХТЭЙ БАГЦ
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
              Багц солих
            </button>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="col-span-4 glass-card rounded-3xl p-8 flex flex-col justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            ЗАХИАЛГА
          </p>
          {subQuery.data ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-emerald-400">
                  verified
                </span>
                <span className="text-lg font-medium text-white">
                  {PLAN_LABELS[subQuery.data.plan] ?? subQuery.data.plan}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Хүчинтэй: {new Date(subQuery.data.periodEnd).toLocaleDateString("mn-MN")} хүртэл
                </p>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-[10px] font-semibold uppercase tracking-widest text-white/30 hover:text-[#ffb4ab] transition-colors"
                >
                  Цуцлах
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-white/30">
                  credit_card_off
                </span>
                <span className="text-sm text-white/50">Идэвхтэй захиалга алга</span>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-white/50 hover:text-white/70 transition-colors"
              >
                Багц сонгох →
              </button>
            </>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} currentPlan={plan} />

      {/* Cancel subscription confirm */}
      <Modal open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Захиалга цуцлах</ModalTitle>
            <ModalDescription>
              Захиалгаа цуцлахад Free багц руу буцна. Одоогийн хугацаа дуусах хүртэл үйлчилгээ
              үргэлжилнэ.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="glass" onClick={() => setShowCancelConfirm(false)}>
              Болих
            </Button>
            <Button
              variant="destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Цуцлаж байна..." : "Цуцлах"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Usage Stats */}
      <div className="glass-card rounded-3xl p-8">
        <div className="mb-6">
          <h2 className="font-headline text-2xl italic text-white">Ашиглалтын тойм</h2>
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
                  ЯРИА
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
                  БАРАА
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
                  БАГИЙН ГИШҮҮД
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
      {!bannerDismissed && (
        <div className="glass-card rounded-3xl p-8 flex items-start gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06]">
            <span className="material-symbols-outlined text-[24px] text-white/60">
              auto_awesome
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Багцаа шинэчлэх үү?</h3>
            <p className="mt-1 text-sm text-white/40">
              Таны одоогийн ашиглалт сарын хязгаартаа ойртож байна. Жилээр төлснөөр 20% хэмнэнэ.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setShowUpgrade(true)}
                className="rounded-full bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90"
              >
                Багц харах
              </button>
              <button
                onClick={() => {
                  setBannerDismissed(true);
                  localStorage.setItem("upgrade-banner-dismissed", "true");
                }}
                className="text-sm text-white/40 transition-colors hover:text-white/60"
              >
                Хаах
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
