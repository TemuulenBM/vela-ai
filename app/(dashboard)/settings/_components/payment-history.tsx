"use client";

import { trpc } from "@/shared/lib/trpc";
import { PLAN_LABELS } from "@/shared/lib/plan-config";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "ХҮЛЭЭГДЭЖ БУЙ", color: "text-yellow-400" },
  success: { label: "АМЖИЛТТАЙ", color: "text-emerald-400" },
  failed: { label: "АМЖИЛТГҮЙ", color: "text-red-400" },
  refunded: { label: "БУЦААСАН", color: "text-blue-400" },
};

export function PaymentHistory() {
  const { data: history, isLoading } = trpc.payments.getPaymentHistory.useQuery();

  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-8">
        <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-8 pb-6">
        <h2 className="font-headline text-2xl italic text-white">Төлбөрийн түүх</h2>
        <button className="text-[10px] font-semibold uppercase tracking-widest text-white/40 transition-colors hover:text-white/60">
          CSV ТАТАХ
        </button>
      </div>

      {!history || history.length === 0 ? (
        <div className="flex flex-col items-center justify-center pb-12 pt-4">
          <span className="material-symbols-outlined mb-3 text-[32px] text-white/20">
            receipt_long
          </span>
          <p className="text-sm text-white/40">Төлбөрийн түүх алга</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-8 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Огноо
                </th>
                <th className="px-8 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Гүйлгээний ID
                </th>
                <th className="px-8 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Төлбөрийн систем
                </th>
                <th className="px-8 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Дүн
                </th>
                <th className="px-8 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Төлөв
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => {
                const statusInfo = STATUS_MAP[log.status] ?? STATUS_MAP.pending;
                return (
                  <tr
                    key={log.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-8 py-4 text-sm text-white">
                      {new Date(log.createdAt).toLocaleDateString("mn-MN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-8 py-4">
                      <code className="text-xs font-mono text-white/50">
                        VLA-{log.id.slice(0, 5).toUpperCase()}-QP
                      </code>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-sm text-white/60">QPay</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span className="text-sm font-semibold tabular-nums text-white">
                        {Number(log.amount).toLocaleString()}₮
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-widest ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
