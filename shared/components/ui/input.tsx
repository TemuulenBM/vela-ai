"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              "flex h-9 w-full rounded-[var(--radius-sm)] border border-border-default bg-surface-primary px-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-150",
              "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-9",
              suffix && "pr-9",
              error && "border-error focus:border-error focus:ring-error",
              className,
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
