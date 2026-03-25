"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/utils";

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full bg-white/[0.08]", {
  variants: {
    size: {
      xs: "h-6 w-6 text-[10px]",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface AvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

function Avatar({ className, size, src, alt, fallback, ...props }: AvatarProps) {
  const initials = fallback || alt?.charAt(0)?.toUpperCase() || "?";

  return (
    <AvatarPrimitive.Root className={cn(avatarVariants({ size, className }))} {...props}>
      <AvatarPrimitive.Image
        className="aspect-square h-full w-full object-cover"
        src={src}
        alt={alt}
      />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-white/[0.08] text-white/70 font-medium">
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export { Avatar };
