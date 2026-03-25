import { cn } from "@/shared/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-2xl bg-white/[0.05]", className)} {...props} />;
}

export { Skeleton };
