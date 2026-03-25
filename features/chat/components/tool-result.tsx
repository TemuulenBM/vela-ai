"use client";

import { ProductCard } from "./product-card";

interface ProductResult {
  id: string;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

interface OrderResult {
  orderId: string;
  status: string;
  statusText: string;
  estimatedDelivery: string;
  message: string;
}

interface ToolResultProps {
  toolName: string;
  result: unknown;
}

export function ToolResult({ toolName, result }: ToolResultProps) {
  if (toolName === "searchProducts") {
    const products = result as ProductResult[];

    if (!products || products.length === 0) {
      return (
        <div className="glass-card rounded-3xl px-4 py-3 text-[12px] text-white/40 mt-3">
          Уучлаарай, тохирох бараа олдсонгүй.
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    );
  }

  if (toolName === "getOrderStatus") {
    const order = result as OrderResult;

    return (
      <div className="glass-card rounded-3xl p-4 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-white/40">
            Захиалга #{order.orderId}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">
            {order.statusText}
          </span>
        </div>
        <p className="font-serif italic text-[16px] text-white/90 mt-2">{order.message}</p>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mt-2">
          Хүргэлт: {order.estimatedDelivery}
        </p>
      </div>
    );
  }

  // Analytics / stat inline cards (grid-cols-2 like screenshot)
  if (toolName === "getAnalytics" || toolName === "getCampaignStats") {
    const data = result as Record<string, string | number>;

    if (!data) return null;

    const entries = Object.entries(data).slice(0, 4);

    return (
      <div className="grid grid-cols-2 gap-2 mt-3">
        {entries.map(([label, value]) => (
          <div key={label} className="glass-card rounded-3xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{label}</p>
            <p className="font-serif italic text-[22px] text-white/90">{String(value)}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
