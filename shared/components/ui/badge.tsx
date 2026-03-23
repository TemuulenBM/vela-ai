import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva("inline-flex items-center font-medium transition-colors select-none", {
  variants: {
    variant: {
      default: "bg-surface-tertiary text-text-secondary",
      brand: "bg-brand-50 text-brand-700",
      success: "bg-success-light text-green-700",
      warning: "bg-warning-light text-amber-700",
      error: "bg-error-light text-red-700",
      info: "bg-info-light text-blue-700",
      outline: "border border-border-default text-text-secondary",
    },
    size: {
      sm: "px-1.5 py-0.5 text-[10px] rounded-[4px]",
      md: "px-2 py-0.5 text-xs rounded-[var(--radius-sm)]",
      lg: "px-2.5 py-1 text-xs rounded-[var(--radius-sm)]",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };
