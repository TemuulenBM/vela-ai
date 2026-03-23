"use client";

import { CountUp, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface ProductSummaryStripProps {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  isLoading?: boolean;
}

export function ProductSummaryStrip({
  totalProducts,
  activeProducts,
  outOfStock,
  isLoading,
}: ProductSummaryStripProps) {
  if (isLoading) {
    return (
      <div className="flex gap-8 border-b border-border-default pb-5">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Нийт бараа", value: totalProducts },
    { label: "Идэвхтэй", value: activeProducts },
    { label: "Нөөцгүй", value: outOfStock, warn: outOfStock > 0 },
  ];

  return (
    <FadeIn delay={0.05}>
      <div className="flex divide-x divide-border-default border-b border-border-default pb-5">
        {items.map((item, index) => (
          <div key={item.label} className={cn("pr-8", index > 0 && "pl-8")}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
              {item.label}
            </p>
            <p
              className={cn(
                "mt-1 text-2xl font-semibold leading-none tracking-tight tabular-nums font-[family-name:var(--font-geist)]",
                item.warn ? "text-[var(--color-warning)]" : "text-text-primary",
              )}
            >
              <CountUp to={item.value} format={(n) => Math.round(n).toLocaleString()} />
            </p>
          </div>
        ))}
      </div>
    </FadeIn>
  );
}
