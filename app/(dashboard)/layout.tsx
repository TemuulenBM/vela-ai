"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { TRPCProvider } from "@/shared/components/providers/trpc-provider";
import { cn } from "@/shared/lib/utils";

function TopHeader() {
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/settings");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-8 bg-black/40 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Left: Search + Nav tabs */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-white/30">
            search
          </span>
          <input
            type="text"
            placeholder="Хайх..."
            className="h-10 w-64 rounded-full bg-white/[0.05] border-none pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/[0.08] transition-all"
          />
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/overview"
            className={cn(
              "px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors",
              !isSettings
                ? "text-white border-b border-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Хяналтын самбар
          </Link>
          <Link
            href="/settings"
            className={cn(
              "px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors",
              isSettings ? "text-white border-b border-white" : "text-white/40 hover:text-white/70",
            )}
          >
            Дэлгүүрийн тохиргоо
          </Link>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-transparent px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white hover:bg-white/[0.05] transition-colors"
        >
          Бараа нэмэх
        </Link>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/[0.05] transition-colors text-white/50 hover:text-white">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/[0.05] transition-colors text-white/50 hover:text-white">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] text-sm font-medium text-white">
          A
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-dvh bg-black">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
              <TopHeader />
              <main className="flex-1">{children}</main>
            </div>
          </div>
        </TooltipProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
