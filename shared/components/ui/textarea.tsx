"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[10px] font-semibold uppercase tracking-widest text-white/40 px-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[120px] w-full rounded-xl bg-surface-container-lowest border-none px-6 py-4 text-sm text-white placeholder:text-white/30 transition-all duration-300 resize-y",
            "focus:outline-none focus:bg-white/[0.08] focus:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "shadow-[0_0_0_1px_rgba(255,180,171,0.3)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[#ffb4ab] px-1">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
