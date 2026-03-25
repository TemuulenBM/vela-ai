"use client";

import { Avatar, Badge } from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { roleLabels, roleBadgeVariant } from "./constants";

export function TeamTab() {
  const membersQuery = trpc.tenants.listMembers.useQuery();
  const members = membersQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header card */}
      <div className="glass-card rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl italic text-white">Багийн гишүүд</h2>
            <p className="mt-1 text-sm text-white/40">Дэлгүүрийн удирдлагын багийг удирдах</p>
          </div>
          <button
            disabled
            className="flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Гишүүн урих
          </button>
        </div>
      </div>

      {/* Members list */}
      <div className="glass-card rounded-3xl overflow-hidden">
        {membersQuery.isLoading ? (
          <div className="space-y-2 p-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <span className="material-symbols-outlined text-[32px] text-white/20">group</span>
            <p className="text-sm text-white/40">Гишүүн байхгүй байна</p>
            <p className="text-xs text-white/30">Удахгүй гишүүн урих боломжтой болно</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Гишүүн
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Имэйл
                  </th>
                  <th className="px-8 py-4 text-left text-[10px] font-semibold uppercase tracking-widest text-white/40">
                    Үүрэг
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          fallback={member.email.charAt(0).toUpperCase()}
                          alt={member.email}
                        />
                        <span className="text-sm font-medium text-white">
                          {member.email.split("@")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-white/50">{member.email}</td>
                    <td className="px-8 py-4">
                      <Badge variant={roleBadgeVariant[member.role] ?? "default"} size="md">
                        {roleLabels[member.role] ?? member.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
