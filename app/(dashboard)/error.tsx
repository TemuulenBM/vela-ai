"use client";

import { useEffect } from "react";
import { ErrorIcon } from "@/shared/components/ui/error-icon";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Sentry суулгасны дараа captureException(error) болгоно
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-8">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ErrorIcon size={18} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-semibold tracking-tight">Хуудас ачааллахад алдаа гарлаа</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Мэдээллийг дахин татаж авахыг оролдоно уу.
          </p>
          {error.digest && (
            <p className="text-xs text-white/20 font-mono mt-0.5">Код: {error.digest}</p>
          )}
        </div>

        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-colors cursor-pointer"
        >
          Дахин оролдох
        </button>
      </div>
    </div>
  );
}
