export const roleLabels: Record<string, string> = {
  owner: "Эзэмшигч",
  admin: "Админ",
  member: "Гишүүн",
  viewer: "Харагч",
};

export const roleBadgeVariant: Record<string, "brand" | "info" | "default"> = {
  owner: "brand",
  admin: "info",
  member: "default",
  viewer: "default",
};

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
