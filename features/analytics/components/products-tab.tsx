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
        <span className="material-symbols-outlined text-white/20 text-[32px] mb-4">cloud_off</span>
        <p className="text-sm font-medium text-white/70">Data loading failed</p>
        <p className="mt-1 text-xs text-white/40 font-light">Please try again</p>
        <button
          onClick={() => {
            summary.refetch();
            topProducts.refetch();
          }}
          className="mt-4 glass-card rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
