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
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-card rounded-3xl p-8 flex-1">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-10 w-12" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: "Total Products", value: totalProducts, icon: "inventory_2" },
    { label: "Active", value: activeProducts, icon: "check_circle" },
    { label: "Out of Stock", value: outOfStock, warn: outOfStock > 0, icon: "warning" },
  ];

  return (
    <FadeIn delay={0.05}>
      <div className="flex gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="glass-card rounded-3xl p-8 flex-1 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="material-symbols-outlined text-white/40 text-[20px]">
                {item.icon}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">
                {item.label}
              </span>
            </div>
            <p
              className={cn(
                "mt-4 text-4xl font-serif italic leading-none tabular-nums",
                item.warn ? "text-[#ffd59e]" : "text-white",
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
