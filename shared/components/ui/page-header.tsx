import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="flex flex-col gap-1">
        <h1 className="text-5xl font-headline italic tracking-tight text-white">{title}</h1>
        {description && <p className="text-base text-white/50 font-light">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export { PageHeader };
