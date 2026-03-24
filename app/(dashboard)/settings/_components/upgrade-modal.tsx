"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Button,
  Badge,
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

  // Stable ref for mutation to avoid re-creating interval on every render
  const checkPaymentRef = useRef(checkPayment.mutateAsync);
  checkPaymentRef.current = checkPayment.mutateAsync;

  const onPaymentSuccess = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStep("success");
    utils.tenants.getStore.invalidate();
    utils.tenants.getUsage.invalidate();
    utils.payments.getPaymentHistory.invalidate();
  }, [utils]);

  // Start polling when step becomes "paying"
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

    // 10 минутын timeout
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

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedPlan(null);
      setInvoiceData(null);
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [open]);

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
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        {step === "select" && (
          <>
            <ModalHeader>
              <ModalTitle>Багц шинэчлэх</ModalTitle>
              <ModalDescription>Өөрийн бизнест тохирох багцаа сонгоно уу</ModalDescription>
            </ModalHeader>

            <div className="mt-4 flex flex-col gap-3">
              {PAID_PLANS.map((plan) => {
                const isCurrent = currentPlan === plan;
                return (
                  <button
                    key={plan}
                    disabled={isCurrent || createInvoice.isPending}
                    onClick={() => handleUpgrade(plan)}
                    className={`flex items-start gap-4 rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                      isCurrent
                        ? "border-brand-500 bg-brand-50 cursor-default"
                        : "border-border-default hover:border-brand-300 hover:bg-surface-secondary cursor-pointer"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {PLAN_LABELS[plan]}
                        </span>
                        {isCurrent && (
                          <Badge variant="brand" size="sm">
                            Одоогийн
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium text-brand-600">
                        {PLAN_PRICES[plan]}
                      </span>
                      <ul className="mt-2 flex flex-col gap-1">
                        {PLAN_FEATURES[plan]?.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-center gap-1.5 text-xs text-text-secondary"
                          >
                            <Check className="h-3 w-3 text-brand-500 shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                );
              })}
            </div>

            {createInvoice.error && (
              <p className="mt-3 text-sm text-status-error">{createInvoice.error.message}</p>
            )}
          </>
        )}

        {step === "paying" && invoiceData && (
          <>
            <ModalHeader>
              <ModalTitle>QR кодоор төлөх</ModalTitle>
              <ModalDescription>Банкны аппликейшнээрээ QR кодыг уншуулна уу</ModalDescription>
            </ModalHeader>

            <div className="mt-4 flex flex-col items-center gap-4">
              {/* QR Code */}
              <div className="rounded-[var(--radius-md)] border border-border-default bg-white p-3">
                <img
                  src={`data:image/png;base64,${invoiceData.qrImage}`}
                  alt="QPay QR Code"
                  className="h-48 w-48"
                />
              </div>

              {/* Bank deeplinks */}
              {invoiceData.urls.length > 0 && (
                <div className="w-full">
                  <p className="mb-2 text-xs text-text-secondary">Эсвэл банкны апп-аар нээх:</p>
                  <div className="flex flex-wrap gap-2">
                    {invoiceData.urls.map((url, i) => (
                      <a
                        key={i}
                        href={url.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[var(--radius-sm)] border border-border-default px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-secondary transition-colors"
                      >
                        {url.name || url.description || "Банк"}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-text-tertiary">
                Төлбөр автоматаар шалгагдана. Удаан байвал доорх товчийг дарна уу.
              </p>
            </div>

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={handleManualCheck}
                disabled={checkPayment.isPending}
              >
                {checkPayment.isPending ? (
                  <>
                    <Spinner size="sm" />
                    Шалгаж байна...
                  </>
                ) : (
                  "Төлбөр шалгах"
                )}
              </Button>
            </ModalFooter>
          </>
        )}

        {step === "success" && (
          <>
            <ModalHeader>
              <ModalTitle>Амжилттай!</ModalTitle>
              <ModalDescription>
                Таны {selectedPlan && PLAN_LABELS[selectedPlan]} багц идэвхжлээ
              </ModalDescription>
            </ModalHeader>

            <div className="mt-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success/10">
                <Check className="h-8 w-8 text-status-success" />
              </div>
            </div>

            <ModalFooter>
              <Button onClick={() => onOpenChange(false)}>Хаах</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
