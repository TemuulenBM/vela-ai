"use client";

import { useState, useEffect } from "react";
import {
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  PageHeader,
  EmptyState,
} from "@/shared/components/ui";
import { cn, formatPrice } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";
import { ProductEditModal } from "./_components/product-edit-modal";

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
  const [error, setError] = useState<string | null>(null);

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

  const [editingProduct, setEditingProduct] = useState<(typeof items)[number] | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<(typeof items)[number] | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const utils = trpc.useUtils();

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setDeletingProduct(null);
    },
    onError: (err) => {
      setError(`Delete error: ${err.message}`);
    },
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setEditingProduct(null);
    },
    onError: (err) => {
      setError(`Save error: ${err.message}`);
    },
  });

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      setShowCreateModal(false);
    },
    onError: (err) => {
      setError(`Бараа нэмэхэд алдаа: ${err.message}`);
    },
  });

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ["Нэр", "Ангилал", "Брэнд", "Үнэ", "Нөөц", "Төлөв"];
    const rows = items.map((p) => [
      p.name,
      p.category ?? "",
      p.brand ?? "",
      p.price,
      String(p.stockQty),
      p.isAvailable ? "Идэвхтэй" : "Идэвхгүй",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDuplicate = (product: (typeof items)[number]) => {
    createMutation.mutate({
      name: `${product.name} (copy)`,
      description: product.description ?? undefined,
      price: product.price,
      category: product.category ?? undefined,
      brand: product.brand ?? undefined,
      stockQty: product.stockQty,
      isAvailable: product.isAvailable,
    });
  };

  return (
    <div className="px-8 py-10 max-w-[1600px] mx-auto">
      {/* Editorial heading */}
      <FadeIn>
        <PageHeader
          title="Бараа"
          description="Бүх барааны жагсаалт, нэмэх, засах"
          className="mb-10"
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="glass"
                size="md"
                onClick={handleExportCSV}
                disabled={items.length === 0}
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                CSV татах
              </Button>
              <Button size="md" onClick={() => setShowCreateModal(true)}>
                <span className="material-symbols-outlined text-[18px]">add</span>
                Бараа нэмэх
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl bg-[#ffb4ab]/10 px-4 py-2 text-sm text-[#ffb4ab] mb-6">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-[#ffb4ab] hover:text-[#ffb4ab]/80">
            &times;
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <FadeIn delay={0.05}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="flex-1">
            <Input
              placeholder="Бараа хайх..."
              icon={<span className="material-symbols-outlined text-[18px]">search</span>}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
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
      </FadeIn>

      {/* Product table */}
      <FadeIn delay={0.1}>
        <div className="glass-panel rounded-[3rem] overflow-hidden">
          {listQuery.isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-white/[0.05]" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
              <p className="text-sm text-[#ffb4ab]">Бараа ачаалахад алдаа гарлаа</p>
              <button
                onClick={() => listQuery.refetch()}
                className="text-xs text-white/70 underline"
              >
                Дахин оролдох
              </button>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<span className="material-symbols-outlined text-[20px]">inventory_2</span>}
              title="Бараа олдсонгүй"
              description={
                debouncedSearch
                  ? "Хайлтад тохирох бараа алга"
                  : 'Дээрх "Бараа нэмэх" товчоор шинэ бараа нэмнэ үү'
              }
              className="p-16"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="w-16 px-6 py-4" />
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Бараа
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Үнэ
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Нөөц
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Төлөв
                      </th>
                      <th className="w-12 px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((product) => {
                      const CategoryIcon = CATEGORY_ICONS[product.category ?? ""] || Package;
                      const isLowStock = product.stockQty > 0 && product.stockQty < 10;

                      return (
                        <tr
                          key={product.id}
                          className="group transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="px-6 py-4">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-12 w-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] group-hover:scale-105 transition-transform duration-500">
                                <CategoryIcon className="h-5 w-5 text-white/40" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-white">{product.name}</span>
                            <p className="mt-0.5 text-xs text-white/40">
                              {product.category ?? "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm tabular-nums text-white font-medium">
                              {formatPrice(Number(product.price))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span
                              className={cn(
                                "text-sm tabular-nums",
                                product.stockQty === 0
                                  ? "font-medium text-[#ffb4ab]"
                                  : isLowStock
                                    ? "font-medium text-[#f0c777]"
                                    : "text-white/60",
                              )}
                            >
                              {product.stockQty}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  product.isAvailable
                                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                    : "bg-white/20",
                                )}
                              />
                              <span className="text-xs text-white/60">
                                {product.isAvailable ? "Идэвхтэй" : "Идэвхгүй"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                  <Pencil className="h-4 w-4" />
                                  Засах
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={createMutation.isPending}
                                  onClick={() => handleDuplicate(product)}
                                >
                                  <Copy className="h-4 w-4" />
                                  {createMutation.isPending ? "Хуулж байна..." : "Хуулах"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-[#ffb4ab]"
                                  onClick={() => setDeletingProduct(product)}
                                >
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
              <div className="flex items-center justify-between px-6 py-4">
                <p className="text-sm text-white/50">
                  <span className="font-medium text-white">{total}</span> нийт бараа
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-white/40 tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </FadeIn>

      {/* Delete confirmation modal */}
      <Modal open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Бараа устгах</ModalTitle>
            <ModalDescription>
              &ldquo;{deletingProduct?.name}&rdquo; барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг
              буцаах боломжгүй.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="glass" onClick={() => setDeletingProduct(null)}>
              Болих
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingProduct && deleteMutation.mutate({ id: deletingProduct.id })}
            >
              {deleteMutation.isPending ? "Устгаж байна..." : "Устгах"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit modal */}
      <ProductEditModal
        key={editingProduct?.id}
        product={editingProduct}
        isPending={updateMutation.isPending}
        onClose={() => setEditingProduct(null)}
        onSubmit={(data) => updateMutation.mutate(data)}
      />

      {/* Create modal */}
      {showCreateModal && (
        <ProductEditModal
          key="create"
          product={null}
          mode="create"
          isPending={createMutation.isPending}
          onClose={() => setShowCreateModal(false)}
          onSubmit={() => {}}
          onCreate={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}
