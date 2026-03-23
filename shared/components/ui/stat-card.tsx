"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CountUp } from "./animate";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;
  const isNumeric = !isNaN(numericValue) && typeof value !== "string";
  const hasPercentSign = typeof value === "string" && value.includes("%");
  const displayPrefix = typeof value === "string" ? value.replace(/[0-9,.%]/g, "").trim() : "";

  return (
    <div
      className={cn(
        "group relative rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-5 transition-all duration-200",
        "hover:border-border-strong hover:shadow-sm hover:-translate-y-px",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-text-tertiary">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2.5">
        <p className="text-[28px] font-semibold text-text-primary tracking-tight leading-none font-[family-name:var(--font-geist)]">
          {displayPrefix}
          {isNumeric ? (
            <CountUp to={numericValue} format={(n) => Math.round(n).toLocaleString()} />
          ) : (
            value
          )}
          {hasPercentSign && "%"}
        </p>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium mb-0.5 px-1.5 py-0.5 rounded-[var(--radius-sm)]",
              trend.isPositive ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };
