import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
  return (
    <div
      className={cn(
        "relative rounded-[var(--radius-md)] border border-border-default bg-surface-primary p-5 shadow-xs overflow-hidden",
        className,
      )}
    >
      {/* Subtle left accent */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-brand-500/30" />
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{label}</p>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] bg-surface-tertiary text-text-tertiary">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <p className="text-2xl font-semibold text-text-primary tracking-tight">{value}</p>
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
