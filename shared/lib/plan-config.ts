export const PLAN_LIMITS: Record<
  string,
  { conversations: number; products: number; members: number }
> = {
  free: { conversations: 100, products: 50, members: 2 },
  starter: { conversations: 500, products: 200, members: 3 },
  growth: { conversations: 2000, products: 500, members: 5 },
  pro: { conversations: 10000, products: 2000, members: 20 },
};

export const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export const PLAN_PRICES: Record<string, string> = {
  free: "Үнэгүй",
  starter: "29,000₮/сар",
  growth: "59,000₮/сар",
  pro: "99,000₮/сар",
};

export const PLAN_PRICES_MNT: Record<string, number> = {
  free: 0,
  starter: 29_000,
  growth: 59_000,
  pro: 99_000,
};

export type PlanType = "free" | "starter" | "growth" | "pro";
