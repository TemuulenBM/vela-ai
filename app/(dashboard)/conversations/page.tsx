"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Globe,
  MessageCircle,
  Mail,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input, Avatar, Badge, AnimateList } from "@/shared/components/ui";
import { cn, formatRelativeTime, formatTime } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

type ConvStatus = "active" | "resolved" | "abandoned" | "escalated";

const STATUS_OPTIONS: { value: ConvStatus | "all"; label: string }[] = [
  { value: "all", label: "Бүгд" },
  { value: "active", label: "Идэвхтэй" },
  { value: "resolved", label: "Шийдвэрлэсэн" },
  { value: "escalated", label: "Эскалацлагдсан" },
  { value: "abandoned", label: "Орхигдсон" },
];

const STATUS_BADGE: Record<
  ConvStatus,
  { variant: "success" | "default" | "warning" | "error"; label: string }
> = {
  active: { variant: "success", label: "Идэвхтэй" },
  resolved: { variant: "default", label: "Шийдвэрлэсэн" },
  escalated: { variant: "warning", label: "Эскалацлагдсан" },
  abandoned: { variant: "default", label: "Орхигдсон" },
};

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  web: <Globe className="h-3 w-3 shrink-0 text-text-tertiary" />,
  messenger: <MessageCircle className="h-3 w-3 shrink-0 text-text-tertiary" />,
  email: <Mail className="h-3 w-3 shrink-0 text-text-tertiary" />,
};

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConvStatus | "all">("all");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search changes (derived from debouncedSearch in query params)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusChange = (value: ConvStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  };

  const listQuery = trpc.chat.listConversations.useQuery({
    page,
    perPage: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
  });

  const items = listQuery.data?.items ?? [];

  // Derive effective selected ID — auto-select first if none selected
  const effectiveSelectedId =
    selectedId && items.some((c) => c.id === selectedId) ? selectedId : (items[0]?.id ?? null);

  const detailQuery = trpc.chat.getConversation.useQuery(
    { id: effectiveSelectedId! },
    { enabled: !!effectiveSelectedId },
  );
  const totalPages = listQuery.data?.totalPages ?? 1;
  const total = listQuery.data?.total ?? 0;
  const activeCount = items.filter((c) => c.status === "active").length;
  const selected = detailQuery.data;
  const visibleMessages =
    selected?.messages.filter((m) => m.role === "user" || m.role === "assistant") ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-[calc(100vh-theme(spacing.32))] overflow-hidden rounded-[var(--radius-lg)] border border-border-default bg-surface-primary shadow-xs">
        {/* Left panel - conversation list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-border-default">
          {/* List header */}
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Яриа</h2>
              <p className="text-[11px] text-text-tertiary">
                {listQuery.isLoading ? "..." : `${activeCount} идэвхтэй / ${total} нийт`}
              </p>
            </div>
          </div>

          <div className="space-y-2 p-3">
            <Input
              placeholder="Яриа хайх..."
              icon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as ConvStatus | "all")}
              className="w-full rounded-[var(--radius-md)] border border-border-default bg-surface-primary px-3 py-1.5 text-xs text-text-secondary outline-none focus:border-brand-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-[var(--radius-md)] bg-surface-secondary"
                  />
                ))}
              </div>
            ) : listQuery.isError ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-sm text-red-600">Алдаа гарлаа</p>
                <button
                  onClick={() => listQuery.refetch()}
                  className="text-xs text-brand-600 underline"
                >
                  Дахин оролдох
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-sm text-text-secondary">Яриа байхгүй байна</p>
                <p className="text-xs text-text-tertiary">
                  {debouncedSearch
                    ? "Хайлтын үр дүн олдсонгүй"
                    : "Chatbot-тай яриа эхлэхэд энд харагдана"}
                </p>
              </div>
            ) : (
              <AnimateList stagger={0.04}>
                {items.map((conv) => {
                  const name = conv.shopperName ?? conv.shopperEmail ?? "Зочин";
                  const badge = STATUS_BADGE[conv.status as ConvStatus] ?? STATUS_BADGE.active;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedId(conv.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors",
                        "hover:bg-surface-secondary",
                        conv.id === effectiveSelectedId
                          ? "border-l-2 border-brand-500 bg-surface-secondary"
                          : "border-l-2 border-transparent",
                      )}
                    >
                      <Avatar size="sm" fallback={name.charAt(0)} alt={name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate text-sm font-medium text-text-primary">
                              {name}
                            </span>
                            {CHANNEL_ICON[conv.channel ?? "web"]}
                            <Badge variant={badge.variant} size="sm">
                              {badge.label}
                            </Badge>
                          </div>
                          <span className="shrink-0 text-[11px] text-text-tertiary">
                            {formatRelativeTime(conv.lastMessageAt ?? conv.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-text-secondary">
                          {conv.lastMessage ?? conv.summary ?? "Мессеж байхгүй"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </AnimateList>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border-default px-3 py-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-[var(--radius-md)] p-1 text-text-tertiary hover:bg-surface-secondary disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-text-tertiary">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-[var(--radius-md)] p-1 text-text-tertiary hover:bg-surface-secondary disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right panel - conversation detail */}
        <div className="flex flex-1 flex-col">
          {!effectiveSelectedId || !selected ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-text-tertiary">
                {detailQuery.isLoading ? "Уншиж байна..." : "Яриа сонгоно уу"}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border-default px-5 py-3">
                <Avatar
                  size="sm"
                  fallback={(selected.shopperName ?? selected.shopperEmail ?? "З").charAt(0)}
                  alt={selected.shopperName ?? "Зочин"}
                />
                <div>
                  <span className="text-sm font-semibold text-text-primary">
                    {selected.shopperName ?? selected.shopperEmail ?? "Зочин"}
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    {selected.channel === "messenger"
                      ? "Messenger"
                      : selected.channel === "email"
                        ? "Имэйл"
                        : "Вэб"}{" "}
                    / {visibleMessages.length} мессеж
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <AnimateList
                  key={effectiveSelectedId}
                  stagger={0.03}
                  className="flex flex-col gap-3"
                >
                  {visibleMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      )}

                      <div
                        className={cn(
                          "max-w-[70%] rounded-[var(--radius-lg)] px-4 py-2.5",
                          msg.role === "user"
                            ? "rounded-br-[var(--radius-sm)] border border-brand-100 bg-brand-50 text-text-primary"
                            : "rounded-bl-[var(--radius-sm)] bg-surface-tertiary text-text-primary",
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={cn(
                            "mt-1 text-[11px]",
                            msg.role === "user"
                              ? "text-right text-brand-600/60"
                              : "text-text-tertiary",
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </AnimateList>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
