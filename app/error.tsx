"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorIcon } from "@/shared/components/ui/error-icon";

export default function Error({
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
    <div className="flex flex-1 flex-col items-center justify-center bg-black text-white px-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ErrorIcon size={20} />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Алдаа гарлаа</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Хуудсыг ачааллахад алдаа гарсан байна. Дахин оролдоно уу.
          </p>
          {error.digest && (
            <p className="text-xs text-white/25 font-mono mt-1">Код: {error.digest}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Дахин оролдох
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Нүүр хуудас
          </Link>
        </div>
      </div>
    </div>
  );
}
