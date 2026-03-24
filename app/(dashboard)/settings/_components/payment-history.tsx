"use client";

import { Badge } from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { PLAN_LABELS } from "@/shared/lib/plan-config";

const STATUS_MAP: Record<string, { label: string; variant: "brand" | "info" | "default" }> = {
  pending: { label: "Хүлээгдэж байна", variant: "default" },
  success: { label: "Амжилттай", variant: "brand" },
  failed: { label: "Амжилтгүй", variant: "default" },
  refunded: { label: "Буцаалт", variant: "info" },
};

export function PaymentHistory() {
  const { data: history, isLoading } = trpc.payments.getPaymentHistory.useQuery();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary" />;
  }

  if (!history || history.length === 0) {
    return <p className="py-6 text-center text-sm text-text-tertiary">Төлбөрийн түүх алга</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-default">
            <th className="py-2 text-left font-medium text-text-secondary">Огноо</th>
            <th className="py-2 text-left font-medium text-text-secondary">Багц</th>
            <th className="py-2 text-right font-medium text-text-secondary">Дүн</th>
            <th className="py-2 text-right font-medium text-text-secondary">Төлөв</th>
          </tr>
        </thead>
        <tbody>
          {history.map((log) => {
            const statusInfo = STATUS_MAP[log.status] ?? STATUS_MAP.pending;
            return (
              <tr key={log.id} className="border-b border-border-default last:border-0">
                <td className="py-2.5 text-text-primary">
                  {new Date(log.createdAt).toLocaleDateString("mn-MN")}
                </td>
                <td className="py-2.5 text-text-primary">{PLAN_LABELS[log.plan] ?? log.plan}</td>
                <td className="py-2.5 text-right tabular-nums text-text-primary">
                  {Number(log.amount).toLocaleString()}₮
                </td>
                <td className="py-2.5 text-right">
                  <Badge variant={statusInfo.variant} size="sm">
                    {statusInfo.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
