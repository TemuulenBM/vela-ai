"use client";

import { AnimateList, Badge, ProgressBar, FadeIn, Skeleton } from "@/shared/components/ui";
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
      <div className="mt-6">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-6 w-6 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <FadeIn delay={0.15}>
        <div className="mt-6 py-12 text-center">
          <p className="text-sm text-text-tertiary">Өгөгдөл олдсонгүй</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Бараа үзэлтийн мэдээлэл хуримтлагдахад хугацаа шаардлагатай
          </p>
        </div>
      </FadeIn>
    );
  }

  const maxViews = products[0]?.views || 1;

  return (
    <FadeIn delay={0.15}>
      <div className="mt-6">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Шилдэг бараанууд</h3>

        <AnimateList stagger={0.04}>
          {products.map((product, index) => {
            const isTop = index === 0;
            const viewPercent = (product.views / maxViews) * 100;

            return (
              <div
                key={product.productId}
                className={cn(
                  "border-b border-border-subtle py-3.5 last:border-0",
                  isTop && "rounded-[var(--radius-md)] bg-brand-50/30 px-3 -mx-3",
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <span
                    className={cn(
                      "shrink-0 tabular-nums font-[family-name:var(--font-geist)]",
                      isTop
                        ? "text-lg font-bold text-brand-500"
                        : "w-5 text-center text-[13px] font-medium text-text-tertiary",
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Name + views bar */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate font-medium text-text-primary",
                        isTop ? "text-[14px]" : "text-[13px]",
                      )}
                    >
                      {product.name}
                    </p>
                    <div className="mt-1.5 hidden sm:block">
                      <ProgressBar
                        value={viewPercent}
                        height={3}
                        delay={index * 0.04}
                        color="var(--color-brand-400)"
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex shrink-0 items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <p className="text-[10px] text-text-tertiary">Үзэлт</p>
                      <p className="text-[13px] font-medium text-text-secondary tabular-nums">
                        {product.views.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[10px] text-text-tertiary">Сагс</p>
                      <p className="text-[13px] font-medium text-text-secondary tabular-nums">
                        {product.carts.toLocaleString()}
                      </p>
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="text-[10px] text-text-tertiary">Захиалга</p>
                      <p className="text-[13px] font-medium text-text-secondary tabular-nums">
                        {product.orders.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={product.conversionRate > 0 ? "brand" : "default"} size="sm">
                      {product.conversionRate}%
                    </Badge>
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
