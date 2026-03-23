"use client";

import { trpc } from "@/shared/lib/trpc";
import { ProductSummaryStrip } from "./product-summary-strip";
import { RankedProductList } from "./ranked-product-list";

export function ProductsTab({ days }: { days: number }) {
  const summary = trpc.analytics.getProductSummary.useQuery();
  const topProducts = trpc.analytics.getTopProducts.useQuery({ days, limit: 10 });

  const hasError = summary.isError || topProducts.isError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text-secondary">Өгөгдөл ачаалахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-text-tertiary">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            summary.refetch();
            topProducts.refetch();
          }}
          className="mt-4 rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div>
      <ProductSummaryStrip
        totalProducts={summary.data?.totalProducts ?? 0}
        activeProducts={summary.data?.activeProducts ?? 0}
        outOfStock={summary.data?.outOfStock ?? 0}
        isLoading={summary.isLoading}
      />

      <RankedProductList products={topProducts.data ?? []} isLoading={topProducts.isLoading} />
    </div>
  );
}
