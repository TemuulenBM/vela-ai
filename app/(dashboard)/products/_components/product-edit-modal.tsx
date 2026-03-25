"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Input,
  Textarea,
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
} from "@/shared/components/ui";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  brand: string | null;
  stockQty: number;
  isAvailable: boolean;
}

interface ProductEditModalProps {
  product: ProductData | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    name: string;
    description?: string;
    price: string;
    category?: string;
    brand?: string;
    stockQty: number;
    isAvailable: boolean;
  }) => void;
  mode?: "edit" | "create";
  onCreate?: (data: {
    name: string;
    description?: string;
    price: string;
    category?: string;
    brand?: string;
    stockQty: number;
    isAvailable: boolean;
  }) => void;
}

export function ProductEditModal({
  product,
  isPending,
  onClose,
  onSubmit,
  mode = "edit",
  onCreate,
}: ProductEditModalProps) {
  const isCreate = mode === "create";
  const isOpen = isCreate ? !product && !!onCreate : !!product;

  const [form, setForm] = useState(() => ({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    category: product?.category ?? "",
    brand: product?.brand ?? "",
    stockQty: product?.stockQty ?? 0,
    isAvailable: product?.isAvailable ?? true,
  }));

  const handleSubmit = () => {
    const data = {
      name: form.name,
      description: form.description || undefined,
      price: form.price,
      category: form.category || undefined,
      brand: form.brand || undefined,
      stockQty: form.stockQty,
      isAvailable: form.isAvailable,
    };

    if (isCreate && onCreate) {
      onCreate(data);
    } else if (product) {
      onSubmit({ id: product.id, ...data });
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{isCreate ? "Бараа нэмэх" : "Бараа засах"}</ModalTitle>
          <ModalDescription>
            {isCreate ? "Шинэ барааны мэдээлэл оруулах" : "Барааны мэдээллийг шинэчлэх"}
          </ModalDescription>
        </ModalHeader>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Нэр</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-text-secondary">Тайлбар</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Үнэ (₮)</label>
              <Input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Нөөц</label>
              <Input
                type="number"
                min="0"
                value={form.stockQty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stockQty: Math.max(0, Number(e.target.value)) }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Ангилал</label>
              <Select
                value={form.category || "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v === "none" ? "" : v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Сонгоогүй</SelectItem>
                  <SelectItem value="Электроник">Электроник</SelectItem>
                  <SelectItem value="Хувцас">Хувцас</SelectItem>
                  <SelectItem value="Гэр ахуй">Гэр ахуй</SelectItem>
                  <SelectItem value="Гутал">Гутал</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">Брэнд</label>
              <Input
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isAvailable}
              onCheckedChange={(checked) => setForm((f) => ({ ...f, isAvailable: checked }))}
            />
            <label className="text-sm text-text-secondary">Идэвхтэй</label>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Болих
          </Button>
          <Button disabled={isPending || !form.name || !form.price} onClick={handleSubmit}>
            {isPending
              ? isCreate
                ? "Нэмж байна..."
                : "Хадгалж байна..."
              : isCreate
                ? "Нэмэх"
                : "Хадгалах"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
