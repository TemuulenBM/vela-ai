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
} from "lucide-react";
import {
  PageHeader,
  Card,
  Input,
  Button,
  Badge,
  Checkbox,
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
  AnimateList,
} from "@/shared/components/ui";
import { cn, formatPrice } from "@/shared/lib/utils";

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

      <FadeIn delay={0.05}>
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
                  <th className="w-10 px-4 py-3">
                    <Checkbox />
                  </th>
                  <th className="w-12 px-2 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Нэр
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Ангилал
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Үнэ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Нөөц
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Төлөв
                  </th>
                  <th className="w-12 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-secondary transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox />
                    </td>
                    <td className="px-2 py-3">
                      <div className="h-9 w-9 rounded-[var(--radius-sm)] bg-surface-tertiary" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">{product.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">{product.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "text-sm",
                          product.stock === 0 ? "text-red-500 font-medium" : "text-text-secondary",
                        )}
                      >
                        {product.stock}
                      </span>
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
                ))}
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
