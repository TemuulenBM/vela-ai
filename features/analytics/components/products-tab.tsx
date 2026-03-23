"use client";

import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
  FadeIn,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";

export function ProductsTab({ days }: { days: number }) {
  const summary = trpc.analytics.getProductSummary.useQuery();
  const topProducts = trpc.analytics.getTopProducts.useQuery({ days, limit: 10 });

  const hasError = summary.isError || topProducts.isError;

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-text-secondary">Өгөгдөл ачаалахад алдаа гарлаа</p>
        <p className="mt-1 text-xs text-text-tertiary">Дахин оролдоно уу</p>
        <button
          onClick={() => {
            summary.refetch();
            topProducts.refetch();
          }}
          className="mt-4 rounded-[var(--radius-md)] bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FadeIn delay={0.05}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard label="Нийт бараа" value={summary.data?.totalProducts ?? 0} />
          )}
        </FadeIn>
        <FadeIn delay={0.1}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard label="Идэвхтэй бараа" value={summary.data?.activeProducts ?? 0} />
          )}
        </FadeIn>
        <FadeIn delay={0.15}>
          {summary.isLoading ? (
            <Skeleton className="h-[104px]" />
          ) : (
            <StatCard label="Нөөцгүй бараа" value={summary.data?.outOfStock ?? 0} />
          )}
        </FadeIn>
      </div>

      <FadeIn delay={0.2}>
        <Card padding="none" className="overflow-hidden">
          <div className="px-5 pt-5">
            <CardHeader>
              <CardTitle>Барааны статистик</CardTitle>
            </CardHeader>
          </div>
          <CardContent className="px-0">
            {topProducts.isLoading ? (
              <div className="px-5 pb-5">
                <Skeleton className="h-[200px]" />
              </div>
            ) : topProducts.data?.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-text-tertiary">Өгөгдөл олдсонгүй</p>
                <p className="mt-1 text-xs text-text-tertiary">
                  Бараа үзэлтийн мэдээлэл хуримтлагдахад хугацаа шаардлагатай
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-default">
                      <th className="px-5 py-2.5 text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider w-8">
                        #
                      </th>
                      <th className="px-5 py-2.5 text-left text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Бараа
                      </th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Үзэлт
                      </th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Сагс
                      </th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Захиалга
                      </th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                        Хөрвүүлэлт
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.data?.map((product, index) => (
                      <tr
                        key={product.productId}
                        className="border-b border-border-subtle last:border-0 transition-colors hover:bg-surface-secondary"
                      >
                        <td className="px-5 py-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-surface-tertiary text-[10px] font-semibold text-text-tertiary tabular-nums">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[13px] font-medium text-text-primary">
                          {product.name}
                        </td>
                        <td className="px-5 py-3 text-[13px] text-text-secondary text-right tabular-nums">
                          {product.views.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[13px] text-text-secondary text-right tabular-nums">
                          {product.carts.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-[13px] text-text-secondary text-right tabular-nums">
                          {product.orders.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Badge
                            variant={product.conversionRate > 0 ? "brand" : "default"}
                            size="sm"
                          >
                            {product.conversionRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
