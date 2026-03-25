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

export { PLAN_LIMITS, PLAN_LABELS, PLAN_PRICES, PLAN_PRICES_MNT } from "@/shared/lib/plan-config";
