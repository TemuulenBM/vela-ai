"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { Avatar } from "@/shared/components/ui/avatar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { TRPCProvider } from "@/shared/components/providers/trpc-provider";

function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end px-8 bg-black/40 backdrop-blur-xl border-b border-white/[0.04]">
      <Avatar size="sm" fallback="A" />
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
