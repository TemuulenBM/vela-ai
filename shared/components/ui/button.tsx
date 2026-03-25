"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer focus-ring disabled:opacity-50 disabled:pointer-events-none select-none hover:-translate-y-px active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-white text-black hover:bg-white/90",
        secondary: "glass glass-hover text-white/70 hover:text-white",
        glass: "glass-card text-white hover:bg-white/[0.08] border border-white/[0.06]",
        ghost: "text-white/45 hover:text-white/70 hover:bg-white/[0.05]",
        destructive: "bg-[#ffb4ab]/15 text-[#ffb4ab] hover:bg-[#ffb4ab]/25",
        link: "text-white/70 hover:text-white underline-offset-4 hover:underline p-0 h-auto hover:translate-y-0",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-full",
        md: "h-9 px-4 text-sm rounded-full",
        lg: "h-12 px-6 text-sm rounded-full",
        xl: "h-14 px-8 text-sm font-semibold uppercase tracking-widest rounded-full",
        icon: "h-9 w-9 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
