"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { label: "Overview", href: "/overview", icon: "dashboard" },
  { label: "Products", href: "/products", icon: "inventory_2" },
  { label: "Conversations", href: "/conversations", icon: "forum" },
  { label: "Analytics", href: "/analytics", icon: "monitoring" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

interface SidebarProps {
  className?: string;
}

function MaterialIcon({ name, className }: { name: string; className?: string }) {
  return <span className={cn("material-symbols-outlined text-[20px]", className)}>{name}</span>;
}

function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/overview") return pathname === "/overview";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen w-72 sticky left-0 top-0 bg-black py-10 px-6 gap-8",
        "shadow-[40px_0_60px_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
          <span className="text-white text-base font-serif italic">V</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-lg font-serif italic text-white tracking-tight">Vela AI</span>
          <span className="text-[9px] text-white/30 uppercase tracking-[0.15em]">
            E-commerce Assistant
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-light tracking-tight transition-all duration-200",
                active
                  ? "bg-white/[0.1] backdrop-blur-xl text-white font-normal"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]",
              )}
            >
              <MaterialIcon
                name={item.icon}
                className={cn("shrink-0", active ? "text-white" : "text-white/40")}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer — New Campaign */}
      <div className="px-2">
        <button className="flex items-center justify-center gap-2 w-full rounded-full bg-white text-black px-4 py-3 text-[13px] font-semibold hover:bg-white/90 transition-all duration-200">
          New Campaign
        </button>
      </div>
    </aside>
  );
}

export { Sidebar };
