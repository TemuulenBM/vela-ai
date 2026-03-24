"use client";

import { UserPlus } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Avatar,
} from "@/shared/components/ui";
import { trpc } from "@/shared/lib/trpc";
import { roleLabels, roleBadgeVariant } from "./constants";

export function TeamTab() {
  const membersQuery = trpc.tenants.listMembers.useQuery();
  const members = membersQuery.data ?? [];

  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-5 pb-0 pt-5">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Багийн гишүүд</CardTitle>
          <CardDescription>Дэлгүүрийн удирдлагын багийг удирдах</CardDescription>
        </div>
        <Button size="sm" disabled>
          <UserPlus className="h-4 w-4" />
          Гишүүн урих
        </Button>
      </div>
      <CardContent className="px-0">
        {membersQuery.isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
              />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-secondary">Гишүүн байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Гишүүн
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Имэйл
                  </th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Үүрэг
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          fallback={member.email.charAt(0).toUpperCase()}
                          alt={member.email}
                        />
                        <span className="text-sm font-medium text-text-primary">
                          {member.email.split("@")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{member.email}</td>
                    <td className="px-5 py-3">
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
      </CardContent>
    </Card>
  );
}
