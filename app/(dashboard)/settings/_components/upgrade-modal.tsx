"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Spinner,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { PLAN_LABELS, PLAN_PRICES } from "@/shared/lib/plan-config";

type Step = "select" | "paying" | "success";
type PaidPlan = "starter" | "growth" | "pro";

const PAID_PLANS: PaidPlan[] = ["starter", "growth", "pro"];

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["500 яриа / сар", "200 бараа", "3 багийн гишүүн", "Аналитик дашбоард"],
  growth: [
    "2,000 яриа / сар",
    "500 бараа",
    "5 багийн гишүүн",
    "Аналитик дашбоард",
    "Нэмэлт тохиргоо",
  ],
  pro: [
    "10,000 яриа / сар",
    "2,000 бараа",
    "20 багийн гишүүн",
    "Аналитик дашбоард",
    "Нэмэлт тохиргоо",
    "Тусгай дэмжлэг",
  ],
};

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
}

export function UpgradeModal({ open, onOpenChange, currentPlan }: UpgradeModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan | null>(null);
  const [invoiceData, setInvoiceData] = useState<{
    subscriptionId: string;
    qrImage: string;
    qrText: string;
    urls: Array<{ name?: string; description?: string; link?: string }>;
  } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utils = trpc.useUtils();

  const createInvoice = trpc.payments.createInvoice.useMutation({
    onSuccess: (data) => {
      setInvoiceData(data);
      setStep("paying");
    },
  });

  const checkPayment = trpc.payments.checkPayment.useMutation();

  const checkPaymentRef = useRef(checkPayment.mutateAsync);
  useEffect(() => {
    checkPaymentRef.current = checkPayment.mutateAsync;
  });

  const onPaymentSuccess = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep("success");
    utils.tenants.getStore.invalidate();
    utils.tenants.getUsage.invalidate();
    utils.payments.getPaymentHistory.invalidate();
  }, [utils]);

  useEffect(() => {
    if (step !== "paying" || !invoiceData) return;

    pollRef.current = setInterval(async () => {
      try {
        const result = await checkPaymentRef.current({
          subscriptionId: invoiceData.subscriptionId,
        });
        if (result.paid) onPaymentSuccess();
      } catch {
        // QPay-аас хариу ирэхгүй байж болно, үргэлжлүүлнэ
      }
    }, 5000);

    timeoutRef.current = setTimeout(
      () => {
        if (pollRef.current) clearInterval(pollRef.current);
      },
      10 * 60 * 1000,
    );

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [step, invoiceData, onPaymentSuccess]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep("select");
      setSelectedPlan(null);
      setInvoiceData(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
    onOpenChange(nextOpen);
  };

  const handleUpgrade = (plan: PaidPlan) => {
    setSelectedPlan(plan);
    createInvoice.mutate({ plan });
  };

  const handleManualCheck = async () => {
    if (!invoiceData) return;
    const result = await checkPayment.mutateAsync({
      subscriptionId: invoiceData.subscriptionId,
    });
    if (result.paid) onPaymentSuccess();
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="max-w-lg">
        {step === "select" && (
          <>
            <ModalHeader>
              <ModalTitle>
                <span className="font-headline text-2xl italic">Багц сонгох</span>
              </ModalTitle>
              <ModalDescription>Өөрийн бизнест тохирох багцаа сонгоно уу</ModalDescription>
            </ModalHeader>

            <div className="mt-6 flex flex-col gap-3">
              {PAID_PLANS.map((plan) => {
                const isCurrent = currentPlan === plan;
                return (
                  <button
                    key={plan}
                    disabled={isCurrent || createInvoice.isPending}
                    onClick={() => handleUpgrade(plan)}
                    className={`group flex items-start gap-4 rounded-3xl p-5 text-left transition-all ${
                      isCurrent
                        ? "glass-card cursor-default ring-1 ring-white/20"
                        : "glass-card cursor-pointer hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-headline text-lg italic text-white">
                          {PLAN_LABELS[plan]}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                            Одоогийн
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-white/50">{PLAN_PRICES[plan]}</span>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {PLAN_FEATURES[plan]?.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-2 text-xs text-white/50"
                          >
                            <span className="material-symbols-outlined text-[14px] text-emerald-400/60">
                              check
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {!isCurrent && (
                      <span className="material-symbols-outlined mt-1 text-[20px] text-white/20 transition-colors group-hover:text-white/40">
                        arrow_forward
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {createInvoice.error && (
              <p className="mt-3 text-sm text-red-400">{createInvoice.error.message}</p>
            )}
          </>
        )}

        {step === "paying" && invoiceData && (
          <>
            <ModalHeader>
              <ModalTitle>
                <span className="font-headline text-2xl italic">QR уншуулах</span>
              </ModalTitle>
              <ModalDescription>Банкны аппликейшнээрээ QR кодыг уншуулна уу</ModalDescription>
            </ModalHeader>

            <div className="mt-6 flex flex-col items-center gap-5">
              {/* QR Code */}
              <div className="rounded-3xl bg-white p-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 QR code from QPay API */}
                <img
                  src={`data:image/png;base64,${invoiceData.qrImage}`}
                  alt="QPay QR Code"
                  className="h-48 w-48"
                />
              </div>

              {/* Bank deeplinks */}
              {invoiceData.urls.length > 0 && (
                <div className="w-full">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    ЭСВЭЛ БАНКНЫ АПП-ААР НЭЭХ
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {invoiceData.urls.map((url, i) => (
                      <a
                        key={i}
                        href={url.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-white/[0.06] px-4 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {url.name || url.description || "Банк"}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-white/30">
                Төлбөр автоматаар шалгагдана. Удаан байвал доорх товчийг дарна уу.
              </p>
            </div>

            <ModalFooter>
              <button
                onClick={handleManualCheck}
                disabled={checkPayment.isPending}
                className="flex items-center gap-2 rounded-full bg-white/[0.08] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/70 transition-all hover:bg-white/[0.12] disabled:opacity-50"
              >
                {checkPayment.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Шалгаж байна...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    Төлбөр шалгах
                  </>
                )}
              </button>
            </ModalFooter>
          </>
        )}

        {step === "success" && (
          <>
            <ModalHeader>
              <ModalTitle>
                <span className="font-headline text-2xl italic">Амжилттай!</span>
              </ModalTitle>
              <ModalDescription>
                Таны {selectedPlan && PLAN_LABELS[selectedPlan]} багц идэвхжлээ
              </ModalDescription>
            </ModalHeader>

            <div className="mt-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10">
                <span className="material-symbols-outlined text-[40px] text-emerald-400">
                  check_circle
                </span>
              </div>
            </div>

            <ModalFooter>
              <button
                onClick={() => handleOpenChange(false)}
                className="rounded-full bg-white px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-white/90"
              >
                Болсон
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
