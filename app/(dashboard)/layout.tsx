"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { TRPCProvider } from "@/shared/components/providers/trpc-provider";

function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-8 bg-black/40 backdrop-blur-xl border-b border-white/[0.04]">
      {/* Left: Search */}
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

      {/* Right: Utilities */}
      <div className="flex items-center gap-3">
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
