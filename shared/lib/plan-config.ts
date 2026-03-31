export type PlanType = "trial" | "solo" | "plus" | "max";

export const PLAN_LIMITS: Record<
  string,
  { conversations: number; products: number; channels: number }
> = {
  trial: { conversations: 50, products: 30, channels: 1 },
  solo: { conversations: 300, products: 200, channels: 2 },
  plus: { conversations: 800, products: 500, channels: 3 },
  max: { conversations: 2000, products: 2000, channels: 999 },
};

export const PLAN_LABELS: Record<string, string> = {
  trial: "Туршилт",
  solo: "Solo",
  plus: "Plus",
  max: "Max",
};

export const PLAN_PRICES: Record<string, string> = {
  trial: "7 хоног үнэгүй",
  solo: "49,000₮/сар",
  plus: "99,000₮/сар",
  max: "199,000₮/сар",
};

export const PLAN_PRICES_MNT: Record<string, number> = {
  trial: 0,
  solo: 49_000,
  plus: 99_000,
  max: 199_000,
};

export const OVERAGE_PRICE_MNT: Record<string, number> = {
  trial: 0,
  solo: 0,
  plus: 0,
  max: 150,
};

export const OVERAGE_CAP_MNT = 30_000;
export const TRIAL_DAYS = 7;
export const SUBSCRIPTION_GRACE_DAYS = 3;
export const SUBSCRIPTION_RENEWAL_REMINDER_DAYS = 7;

/** Plan бүрт зөвшөөрөгдсөн AI tools */
export const PLAN_TOOLS: Record<string, string[]> = {
  trial: ["searchProducts"],
  solo: ["searchProducts", "getOrderStatus"],
  plus: ["searchProducts", "getOrderStatus", "getRecommendation"],
  max: ["searchProducts", "getOrderStatus", "getRecommendation", "initiateReturn"],
};

/** Аналитик хандалтын түвшин */
export const PLAN_ANALYTICS: Record<string, "none" | "basic" | "full" | "full_export"> = {
  trial: "none",
  solo: "basic",
  plus: "full",
  max: "full_export",
};
