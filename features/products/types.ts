export interface Product {
  id: string;
  tenantId: string;
  externalId: string | null;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  productId: string;
  tenantId: string;
  url: string;
  altText: string | null;
  position: number;
}
