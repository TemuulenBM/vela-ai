"use client";

import { cn, formatPrice } from "@/shared/lib/utils";

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
    <div className="glass-card rounded-3xl p-3 flex gap-3">
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 rounded-2xl bg-white/[0.04] overflow-hidden">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external product image URL
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/20">
            <span className="material-symbols-outlined text-[24px]">image</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white leading-tight truncate">{name}</p>
        <p className="font-serif italic text-[18px] text-white/90 mt-0.5">
          {formatPrice(Number(price))}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {category && (
            <span className="text-[10px] uppercase tracking-widest text-white/40">{category}</span>
          )}
          {brand && (
            <span className="text-[10px] uppercase tracking-widest text-white/30">{brand}</span>
          )}
          <span
            className={cn(
              "text-[10px] uppercase tracking-widest",
              isAvailable && stockQty > 0 ? "text-success" : "text-error",
            )}
          >
            {isAvailable && stockQty > 0 ? "Байгаа" : "Дууссан"}
          </span>
        </div>
      </div>
    </div>
  );
}
