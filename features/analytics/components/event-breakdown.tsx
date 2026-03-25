"use client";

import { AnimateList, ProgressBar, FadeIn, Skeleton } from "@/shared/components/ui";

interface EventBreakdownProps {
  data: Array<{ event: string; count: number }>;
  isLoading?: boolean;
}

const EVENT_LABELS: Record<string, { label: string; icon: string }> = {
  page_view: { label: "Хуудас үзэлт", icon: "visibility" },
  product_view: { label: "Бараа үзэлт", icon: "shopping_bag" },
  add_to_cart: { label: "Сагсанд нэмсэн", icon: "add_shopping_cart" },
  checkout_started: { label: "Захиалга эхэлсэн", icon: "shopping_cart_checkout" },
  checkout_completed: { label: "Захиалга дууссан", icon: "check_circle" },
  chat_interaction: { label: "Чат харилцаа", icon: "forum" },
  search_query: { label: "Хайлт", icon: "search" },
  recommendation_clicked: { label: "Санал болголт", icon: "recommend" },
};

export function EventBreakdown({ data, isLoading }: EventBreakdownProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-3xl p-10">
        <Skeleton className="mb-6 h-4 w-28" />
        <div className="flex flex-col gap-5">
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
      <div className="glass-card rounded-3xl p-10">
        <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-white/80">
          Үйл явдлын задаргаа
        </h3>

        <AnimateList stagger={0.04}>
          {data.map((item, index) => {
            const percent = (item.count / maxCount) * 100;
            const meta = EVENT_LABELS[item.event] ?? { label: item.event, icon: "data_usage" };
            return (
              <div key={item.event} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-white/30 text-[16px]">
                      {meta.icon}
                    </span>
                    <span className="text-[12px] text-white/60 font-light">{meta.label}</span>
                  </div>
                  <span className="text-[13px] font-medium text-white tabular-nums">
                    {item.count.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={percent}
                  height={3}
                  delay={index * 0.04}
                  color="rgba(255,255,255,0.15)"
                />
              </div>
            );
          })}
        </AnimateList>
      </div>
    </FadeIn>
  );
}
