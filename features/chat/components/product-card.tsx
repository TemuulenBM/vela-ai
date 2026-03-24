"use client";

import { cn, formatPrice } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";

interface ProductCardProps {
  name: string;
  price: string;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

export function ProductCard({
  name,
  price,
  category,
  brand,
  stockQty,
  isAvailable,
  imageUrl,
}: ProductCardProps) {
  return (
    <div className="flex gap-3 rounded-[var(--radius-md)] border border-border-subtle bg-surface-secondary p-2.5">
      {/* Thumbnail */}
      <div className="h-14 w-14 shrink-0 rounded-[var(--radius-sm)] bg-surface-tertiary overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external product image URL
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary text-xs">
            Зураг
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-text-primary leading-tight truncate">{name}</p>
        <p className="text-[13px] font-semibold text-brand-600 mt-0.5">
          {formatPrice(Number(price))}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {category && <Badge size="sm">{category}</Badge>}
          {brand && (
            <Badge size="sm" variant="outline">
              {brand}
            </Badge>
          )}
          <span
            className={cn(
              "text-[10px]",
              isAvailable && stockQty > 0 ? "text-green-600" : "text-red-500",
            )}
          >
            {isAvailable && stockQty > 0 ? "Байгаа" : "Дууссан"}
          </span>
        </div>
      </div>
    </div>
  );
}
