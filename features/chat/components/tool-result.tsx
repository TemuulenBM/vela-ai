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
        <div className="rounded-[var(--radius-md)] bg-surface-tertiary px-3 py-2 text-[12px] text-text-secondary">
          Уучлаарай, тохирох бараа олдсонгүй.
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    );
  }

  if (toolName === "getOrderStatus") {
    const order = result as OrderResult;

    return (
      <div className="rounded-[var(--radius-md)] border border-border-subtle bg-surface-secondary p-3 mt-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-text-secondary">Захиалга #{order.orderId}</span>
          <span className="text-[12px] font-medium text-brand-600">{order.statusText}</span>
        </div>
        <p className="text-[12px] text-text-secondary mt-1">{order.message}</p>
        <p className="text-[11px] text-text-tertiary mt-1">Хүргэлт: {order.estimatedDelivery}</p>
      </div>
    );
  }

  return null;
}
