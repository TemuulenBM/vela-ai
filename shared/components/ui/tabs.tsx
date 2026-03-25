"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/shared/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-white/[0.03] p-1", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center px-3.5 py-1.5 text-[13px] font-medium text-white/45 rounded-full transition-all duration-200",
        "hover:text-white/70",
        "data-[state=active]:bg-white/[0.1] data-[state=active]:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-1 focus-visible:ring-offset-black",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn(
        "mt-5 focus-visible:outline-none",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
