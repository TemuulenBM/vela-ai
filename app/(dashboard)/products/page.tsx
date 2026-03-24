"use client";

import { useState, useEffect } from "react";
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
import { trpc } from "@/shared/lib/trpc";

const CATEGORY_ICONS: Record<string, typeof Package> = {
  Хувцас: Shirt,
  Электроник: Smartphone,
  Гутал: Package,
  "Гэр ахуй": Home,
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const listQuery = trpc.products.list.useQuery({
    page,
    perPage: 20,
    category: category === "all" ? undefined : category,
    search: debouncedSearch || undefined,
  });

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const activeCount = items.filter((p) => p.isAvailable).length;
  const outOfStockCount = items.filter((p) => p.stockQty === 0).length;

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
            Нийт{" "}
            <span className="font-medium text-text-secondary">
              {listQuery.isLoading ? "..." : total}
            </span>{" "}
            бараа
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
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүгд</SelectItem>
                <SelectItem value="Электроник">Электроник</SelectItem>
                <SelectItem value="Хувцас">Хувцас</SelectItem>
                <SelectItem value="Гэр ахуй">Гэр ахуй</SelectItem>
                <SelectItem value="Гутал">Гутал</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card padding="none">
          {listQuery.isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
                />
              ))}
            </div>
          ) : listQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <p className="text-sm text-red-600">Алдаа гарлаа</p>
              <button
                onClick={() => listQuery.refetch()}
                className="text-xs text-brand-600 underline"
              >
                Дахин оролдох
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <Package className="h-8 w-8 text-text-tertiary" />
              <p className="text-sm text-text-secondary">Бараа байхгүй байна</p>
              <p className="text-xs text-text-tertiary">
                {debouncedSearch ? "Хайлтын үр дүн олдсонгүй" : "Бараа нэмэхэд энд харагдана"}
              </p>
            </div>
          ) : (
            <>
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
                    {items.map((product) => {
                      const CategoryIcon = CATEGORY_ICONS[product.category ?? ""] || Package;
                      const isLowStock = product.stockQty > 0 && product.stockQty < 10;

                      return (
                        <tr
                          key={product.id}
                          className="transition-colors hover:bg-surface-secondary"
                        >
                          <td className="px-4 py-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-10 w-10 rounded-[var(--radius-md)] object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-surface-tertiary">
                                <CategoryIcon className="h-4 w-4 text-text-tertiary" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-text-primary">
                              {product.name}
                            </span>
                            <p className="mt-0.5 text-xs text-text-tertiary">
                              {product.category ?? "—"}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm tabular-nums text-text-primary">
                              {formatPrice(Number(product.price))}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={cn(
                                "text-sm tabular-nums",
                                product.stockQty === 0
                                  ? "font-medium text-red-500"
                                  : isLowStock
                                    ? "font-medium text-amber-600"
                                    : "text-text-secondary",
                              )}
                            >
                              {product.stockQty}
                            </span>
                            {isLowStock && <p className="text-[10px] text-amber-500">Бага нөөц</p>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={product.isAvailable ? "success" : "default"} size="sm">
                              {product.isAvailable ? "Идэвхтэй" : "Идэвхгүй"}
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

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border-default px-4 py-3">
                <p className="text-sm text-text-secondary">
                  Нийт <span className="font-medium text-text-primary">{total}</span> бараа
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Өмнөх
                    </Button>
                    <span className="text-xs text-text-tertiary">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Дараах
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
