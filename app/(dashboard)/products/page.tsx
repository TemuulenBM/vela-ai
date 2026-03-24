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
    },
    onError: (err) => {
      setError(`Duplicate error: ${err.message}`);
    },
  });

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
        <div className="flex items-end justify-between mb-10">
          <h1 className="text-7xl font-serif italic tracking-tighter text-white">Catalogue</h1>
          <div className="flex items-center gap-3">
            <Button variant="glass" size="md">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </Button>
            <Button size="md">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Product
            </Button>
          </div>
        </div>
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
              placeholder="Search products..."
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
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Электроник">Electronics</SelectItem>
              <SelectItem value="Хувцас">Apparel</SelectItem>
              <SelectItem value="Гэр ахуй">Home</SelectItem>
              <SelectItem value="Гутал">Footwear</SelectItem>
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
              <p className="text-sm text-[#ffb4ab]">Error loading products</p>
              <button
                onClick={() => listQuery.refetch()}
                className="text-xs text-white/70 underline"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <span className="material-symbols-outlined text-[32px] text-white/30">
                inventory_2
              </span>
              <p className="text-sm text-white/60">No products found</p>
              <p className="text-xs text-white/40">
                {debouncedSearch
                  ? "No results matched your search"
                  : "Products will appear here once added"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="w-16 px-6 py-4" />
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Product
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Price
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Status
                      </th>
                      <th className="w-12 px-6 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((product) => {
                      const CategoryIcon = CATEGORY_ICONS[product.category ?? ""] || Package;
                      const isLowStock = product.stockQty > 0 && product.stockQty < 10;

                      return (
                        <tr key={product.id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="px-6 py-4">
                            {product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-12 w-12 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
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
                                {product.isAvailable ? "Synced" : "Inactive"}
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
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={createMutation.isPending}
                                  onClick={() => handleDuplicate(product)}
                                >
                                  <Copy className="h-4 w-4" />
                                  {createMutation.isPending ? "Duplicating..." : "Duplicate"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-[#ffb4ab]"
                                  onClick={() => setDeletingProduct(product)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
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
                  <span className="font-medium text-white">{total}</span> products total
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
            <ModalTitle>Delete Product</ModalTitle>
            <ModalDescription>
              Are you sure you want to delete &ldquo;{deletingProduct?.name}&rdquo;? This action
              cannot be undone.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="glass" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingProduct && deleteMutation.mutate({ id: deletingProduct.id })}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
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
    </div>
  );
}
