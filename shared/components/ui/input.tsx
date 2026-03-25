"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  labelRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, suffix, labelRight, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-2">
        {(label || labelRight) && (
          <div className="flex items-center justify-between px-1">
            {label && (
              <label
                htmlFor={inputId}
                className="text-[10px] font-semibold uppercase tracking-widest text-white/40"
              >
                {label}
              </label>
            )}
            {labelRight}
          </div>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
          )}
          <input
            id={inputId}
            className={cn(
              "flex h-14 w-full rounded-full bg-surface-container-lowest border-none px-6 text-sm text-white placeholder:text-white/30 transition-all duration-300",
              "focus:outline-none focus:bg-white/[0.08] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-12",
              suffix && "pr-12",
              error &&
                "shadow-[0_0_0_1px_rgba(255,180,171,0.3)] focus:shadow-[0_0_0_1px_rgba(255,180,171,0.5)]",
              className,
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30">{suffix}</div>
          )}
        </div>
        {error && <p className="text-xs text-[#ffb4ab] px-1">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
