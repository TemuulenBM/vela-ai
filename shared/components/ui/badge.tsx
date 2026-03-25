import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-semibold transition-colors select-none uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-white/[0.08] text-white/70",
        brand: "bg-white/[0.1] text-white",
        success: "bg-[#a8e6cf]/15 text-[#a8e6cf]",
        warning: "bg-[#ffd59e]/15 text-[#ffd59e]",
        error: "bg-[#ffb4ab]/15 text-[#ffb4ab]",
        info: "bg-[#90caf9]/15 text-[#90caf9]",
        outline: "border border-white/10 text-white/45",
      },
      size: {
        sm: "px-2 py-0.5 text-[9px] rounded-full",
        md: "px-2.5 py-0.5 text-[10px] rounded-full",
        lg: "px-3 py-1 text-[10px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };
