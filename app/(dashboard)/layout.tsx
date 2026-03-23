"use client";

import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { TRPCProvider } from "@/shared/components/providers/trpc-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TRPCProvider>
        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-dvh bg-surface-secondary">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
            </main>
          </div>
        </TooltipProvider>
      </TRPCProvider>
    </SessionProvider>
  );
}
