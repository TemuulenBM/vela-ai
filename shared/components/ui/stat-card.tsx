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
        "group relative rounded-3xl bg-surface-2 p-6 transition-all duration-300",
        "hover:bg-surface-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-light text-white/45 uppercase tracking-wider">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/70">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2.5">
        <p className="text-3xl font-light text-white tracking-tight leading-none tabular-nums">
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
              "flex items-center gap-0.5 text-xs font-medium mb-0.5 px-1.5 py-0.5 rounded-full",
              trend.isPositive
                ? "text-[#a8e6cf] bg-[#a8e6cf]/15"
                : "text-[#ffb4ab] bg-[#ffb4ab]/15",
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="tabular-nums">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { StatCard };
