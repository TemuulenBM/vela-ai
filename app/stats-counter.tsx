"use client";

import { CountUp } from "@/shared/components/ui/animate";

type FormatType = "locale" | "integer" | "percent" | "seconds";

const formatters: Record<FormatType, (n: number) => string> = {
  locale: (n) => n.toLocaleString(),
  integer: (n) => Math.round(n).toString(),
  percent: (n) => n.toFixed(1) + "%",
  seconds: (n) => n.toFixed(1) + "s",
};

interface StatsCounterProps {
  to: number;
  formatType: FormatType;
  className?: string;
}

export function StatsCounter({ to, formatType, className }: StatsCounterProps) {
  return <CountUp to={to} format={formatters[formatType]} className={className} />;
}
