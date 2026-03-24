"use client";

import { AnimateList, ProgressBar, FadeIn, Skeleton } from "@/shared/components/ui";

interface EventBreakdownProps {
  data: Array<{ event: string; count: number }>;
  isLoading?: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Хуудас үзэлт",
  product_view: "Бараа үзэлт",
  add_to_cart: "Сагс нэмэлт",
  checkout_started: "Захиалга эхэлсэн",
  checkout_completed: "Захиалга дууссан",
  chat_interaction: "Чат харилцаа",
  search_query: "Хайлт",
  recommendation_clicked: "Санал дарсан",
};

export function EventBreakdown({ data, isLoading }: EventBreakdownProps) {
  if (isLoading) {
    return (
      <div className="border-t border-border-default pt-5">
        <Skeleton className="mb-4 h-4 w-28" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="mb-1.5 h-3 w-24" />
              <Skeleton className="h-1.5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxCount = data[0]?.count || 1;

  return (
    <FadeIn delay={0.3}>
      <div className="border-t border-border-default pt-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Эвентийн төрлүүд</h3>

        <AnimateList stagger={0.04}>
          {data.map((item, index) => {
            const percent = (item.count / maxCount) * 100;
            return (
              <div key={item.event} className="mb-3.5 last:mb-0">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[12px] text-text-secondary">
                    {EVENT_LABELS[item.event] ?? item.event}
                  </span>
                  <span className="text-[12px] font-semibold text-text-primary tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  height={4}
                  delay={index * 0.04}
                  color="var(--color-brand-500)"
                />
              </div>
            );
          })}
        </AnimateList>
      </div>
    </FadeIn>
  );
}
