"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Package,
  Smartphone,
  Shirt,
  Home,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Input,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  FadeIn,
} from "@/shared/components/ui";
import { cn, formatPrice } from "@/shared/lib/utils";

const CATEGORY_ICONS: Record<string, typeof Package> = {
  Хувцас: Shirt,
  Электроник: Smartphone,
  Гутал: Package,
  "Гэр ахуй": Home,
};

const products = [
  {
    id: 1,
    name: "Cashmere цамц (Gobi)",
    category: "Хувцас",
    price: 289000,
    stock: 45,
    status: "active" as const,
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    category: "Электроник",
    price: 4560000,
    stock: 12,
    status: "active" as const,
  },
  {
    id: 3,
    name: "Nike Air Max 90",
    category: "Гутал",
    price: 356000,
    stock: 28,
    status: "active" as const,
  },
  {
    id: 4,
    name: "Ухаалаг цаг Xiaomi Band 8",
    category: "Электроник",
    price: 89000,
    stock: 67,
    status: "active" as const,
  },
  {
    id: 5,
    name: "Арьсан цүнх (Гар урлал)",
    category: "Хувцас",
    price: 185000,
    stock: 15,
    status: "active" as const,
  },
  {
    id: 6,
    name: "Ноосон хөнжил (2 хүний)",
    category: "Гэр ахуй",
    price: 420000,
    stock: 0,
    status: "inactive" as const,
  },
  {
    id: 7,
    name: "iPhone 15 Pro Max",
    category: "Электроник",
    price: 5890000,
    stock: 8,
    status: "active" as const,
  },
  {
    id: 8,
    name: "Дээл (Эрэгтэй, торго)",
    category: "Хувцас",
    price: 750000,
    stock: 22,
    status: "active" as const,
  },
  {
    id: 9,
    name: "Гэрийн тавилга - Буйдан",
    category: "Гэр ахуй",
    price: 1890000,
    stock: 3,
    status: "active" as const,
  },
  {
    id: 10,
    name: "Монгол гутал (Арьсан)",
    category: "Гутал",
    price: 245000,
    stock: 0,
    status: "inactive" as const,
  },
];

const activeCount = products.filter((p) => p.status === "active").length;
const outOfStockCount = products.filter((p) => p.stock === 0).length;

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Бараа бүтээгдэхүүн"
          description="Бүх бараа бүтээгдэхүүнийг удирдах"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Бараа нэмэх
            </Button>
          }
        />
      </FadeIn>

      {/* Summary strip + filters */}
      <FadeIn delay={0.05}>
        <div className="mb-1 flex items-center gap-4 text-xs text-text-tertiary">
          <span>
            Нийт <span className="font-medium text-text-secondary">{products.length}</span> бараа
          </span>
          <span className="h-3 w-px bg-border-default" />
          <span>
            <span className="font-medium text-text-secondary">{activeCount}</span> идэвхтэй
          </span>
          {outOfStockCount > 0 && (
            <>
              <span className="h-3 w-px bg-border-default" />
              <span className="text-[var(--color-warning)]">
                <span className="font-medium">{outOfStockCount}</span> нөөцгүй
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Бараа хайх..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүгд</SelectItem>
                <SelectItem value="electronics">Электроник</SelectItem>
                <SelectItem value="clothing">Хувцас</SelectItem>
                <SelectItem value="home">Гэр ахуй</SelectItem>
                <SelectItem value="shoes">Гутал</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">Бүх төлөв</SelectItem>
                <SelectItem value="active">Идэвхтэй</SelectItem>
                <SelectItem value="inactive">Идэвхгүй</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="w-12 px-4 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Бараа
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Үнэ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Нөөц
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Төлөв
                  </th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {products.map((product) => {
                  const CategoryIcon = CATEGORY_ICONS[product.category] || Package;
                  const isLowStock = product.stock > 0 && product.stock < 10;

                  return (
                    <tr key={product.id} className="transition-colors hover:bg-surface-secondary">
                      <td className="px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface-tertiary">
                          <CategoryIcon className="h-4 w-4 text-text-tertiary" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-text-primary">
                          {product.name}
                        </span>
                        <p className="mt-0.5 text-xs text-text-tertiary">{product.category}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm tabular-nums text-text-primary">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={cn(
                            "text-sm tabular-nums",
                            product.stock === 0
                              ? "font-medium text-red-500"
                              : isLowStock
                                ? "font-medium text-amber-600"
                                : "text-text-secondary",
                          )}
                        >
                          {product.stock}
                        </span>
                        {isLowStock && <p className="text-[10px] text-amber-500">Бага нөөц</p>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={product.status === "active" ? "success" : "default"}
                          size="sm"
                        >
                          {product.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4" />
                              Засах
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4" />
                              Хуулах
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                              Устгах
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
            <p className="text-sm text-text-secondary">
              Нийт <span className="font-medium text-text-primary">24</span> бараа
            </p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" disabled>
                <ChevronLeft className="h-4 w-4" />
                Өмнөх
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="bg-brand-50 text-brand-700">
                  1
                </Button>
                <Button variant="ghost" size="sm">
                  2
                </Button>
                <Button variant="ghost" size="sm">
                  3
                </Button>
              </div>
              <Button variant="secondary" size="sm">
                Дараах
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
