"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { Sidebar } from "@/shared/components/ui/sidebar";
import { Avatar } from "@/shared/components/ui/avatar";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { TRPCProvider } from "@/shared/components/providers/trpc-provider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";
import Link from "next/link";
import { handleLogout } from "./_actions/auth";

function TopHeader() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end px-8 bg-black/40 backdrop-blur-xl border-b border-white/[0.04]">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/20">
            <Avatar size="sm" fallback={initials} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-white/80">{user?.name || "Хэрэглэгч"}</span>
              <span className="text-xs text-white/40 font-normal">{user?.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="gap-2">
              <span className="material-symbols-outlined text-[16px]">settings</span>
              Тохиргоо
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleLogout()}
            className="text-[#ffb4ab] focus:text-[#ffb4ab] focus:bg-[#ffb4ab]/10"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Гарах
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
