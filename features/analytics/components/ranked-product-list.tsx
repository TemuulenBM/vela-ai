"use client";

import { AnimateList, ProgressBar, FadeIn, Skeleton } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface Product {
  productId: string;
  name: string;
  views: number;
  carts: number;
  orders: number;
  conversionRate: number;
}

interface RankedProductListProps {
  products: Product[];
  isLoading?: boolean;
}

export function RankedProductList({ products, isLoading }: RankedProductListProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-10">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="flex flex-col gap-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <FadeIn delay={0.15}>
        <div className="glass-card rounded-3xl p-10 text-center py-16">
          <span className="material-symbols-outlined text-white/20 text-[32px] mb-4">
            inventory_2
          </span>
          <p className="text-sm text-white/40 font-light">Мэдээлэл алга</p>
          <p className="mt-1 text-xs text-white/30 font-light">
            Барааны үзэлтийн мэдээлэл цуглахад хугацаа шаардлагатай
          </p>
        </div>
      </FadeIn>
    );
  }

  const maxViews = products[0]?.views || 1;

  return (
    <FadeIn delay={0.15}>
      <div className="glass-card rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Шилдэг бараа
          </h3>
          <button className="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em]">
            Бүх бараа харах
          </button>
        </div>

        <AnimateList stagger={0.04}>
          {products.map((product, index) => {
            const isTop = index === 0;
            const viewPercent = (product.views / maxViews) * 100;

            return (
              <div
                key={product.productId}
                className={cn(
                  "px-10 py-4 hover:bg-white/[0.03] transition-colors",
                  !isTop && "border-t border-white/[0.04]",
                  isTop && "bg-white/[0.03]",
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank number - serif italic for top positions */}
                  <span
                    className={cn(
                      "shrink-0 tabular-nums",
                      isTop
                        ? "text-2xl font-serif italic text-white w-8"
                        : "w-8 text-center text-[13px] font-serif italic text-white/40",
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Name + progress bar */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-white",
                        isTop ? "text-lg font-semibold tracking-tight" : "text-[13px] font-medium",
                      )}
                    >
                      {product.name}
                    </p>
                    <div className="mt-2 hidden sm:block">
                      <ProgressBar
                        value={viewPercent}
                        height={3}
                        delay={index * 0.04}
                        color="rgba(255,255,255,0.12)"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex shrink-0 items-center gap-6">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Үзэлт
                      </p>
                      <p className="text-sm font-serif italic text-white/70 tabular-nums">
                        {product.views.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Сагс
                      </p>
                      <p className="text-sm font-serif italic text-white/70 tabular-nums">
                        {product.carts.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                        Захиалга
                      </p>
                      <p className="text-sm font-serif italic text-white/70 tabular-nums">
                        {product.orders.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-semibold tabular-nums",
                        product.conversionRate > 0
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/40",
                      )}
                    >
                      {product.conversionRate}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </AnimateList>
      </div>
    </FadeIn>
  );
}
