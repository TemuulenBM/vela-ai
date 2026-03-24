"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  MessageSquare,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";

const navItems = [
  {
    section: "Ерөнхий",
    items: [
      { label: "Хянах самбар", href: "/overview", icon: LayoutDashboard },
      { label: "Аналитик", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Контент",
    items: [
      { label: "Бараа", href: "/products", icon: Package },
      { label: "Яриа", href: "/conversations", icon: MessageSquare },
    ],
  },
  {
    section: "Систем",
    items: [{ label: "Тохиргоо", href: "/settings", icon: Settings }],
  },
];

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

  const isActive = (href: string) => {
    if (href === "/overview") return pathname === "/overview";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-dvh border-r border-border-default bg-surface-secondary transition-all duration-300 ease-out",
        collapsed ? "w-16" : "w-60",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn("flex items-center gap-3 px-4 h-14 border-b border-border-default shrink-0")}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-600 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-text-primary truncate">Vela AI</span>
            <span className="text-[11px] text-text-tertiary truncate">AI борлуулалт</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((section, sectionIndex) => (
          <div
            key={section.section}
            className={cn(sectionIndex > 0 && "mt-3 border-t border-border-subtle pt-3")}
          >
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                {section.section}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
                      active
                        ? "border-l-2 border-brand-500 bg-brand-50/60 pl-2 text-brand-700"
                        : "border-l-2 border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-tertiary",
                      collapsed && "justify-center border-l-0 px-0",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-brand-600" : "text-text-tertiary",
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-default p-2 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          {darkMode ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>{darkMode ? "Цайвар горим" : "Харанхуй горим"}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronsLeft className="h-4 w-4 shrink-0" />
          )}
          {!collapsed && <span>Хураах</span>}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2.5 w-full rounded-[var(--radius-sm)] px-2 py-2 hover:bg-surface-tertiary transition-colors",
                collapsed && "justify-center px-0",
              )}
            >
              <Avatar size="xs" fallback="А" />
              {!collapsed && (
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[13px] font-medium text-text-primary truncate">Админ</span>
                  <span className="text-[11px] text-text-tertiary truncate">admin@vela.mn</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuLabel>Миний бүртгэл</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Тохиргоо
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-error">
              <LogOut className="h-4 w-4 mr-2" />
              Гарах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export { Sidebar };
