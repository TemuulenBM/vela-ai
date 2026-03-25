"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input, Avatar, Badge, AnimateList, Button } from "@/shared/components/ui";
import { cn, formatRelativeTime, formatTime } from "@/shared/lib/utils";
import { trpc } from "@/shared/lib/trpc";

type ConvStatus = "active" | "resolved" | "abandoned" | "escalated";

const STATUS_OPTIONS: { value: ConvStatus | "all"; label: string }[] = [
  { value: "all", label: "Бүгд" },
  { value: "active", label: "Идэвхтэй" },
  { value: "resolved", label: "Шийдсэн" },
  { value: "escalated", label: "Дамжуулсан" },
  { value: "abandoned", label: "Орхисон" },
];

const STATUS_BADGE: Record<
  ConvStatus,
  { variant: "success" | "default" | "warning" | "error"; label: string }
> = {
  active: { variant: "success", label: "Идэвхтэй" },
  resolved: { variant: "default", label: "Шийдсэн" },
  escalated: { variant: "warning", label: "Дамжуулсан" },
  abandoned: { variant: "default", label: "Орхисон" },
};

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ConvStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
  const effectiveSelectedId =
    selectedId && items.some((c) => c.id === selectedId) ? selectedId : (items[0]?.id ?? null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessageInput("");
      if (effectiveSelectedId) {
        utils.chat.getConversation.invalidate({ id: effectiveSelectedId });
        utils.chat.listConversations.invalidate();
      }
    },
  });

  const updateStatusMutation = trpc.chat.updateStatus.useMutation({
    onSuccess: () => {
      if (effectiveSelectedId) {
        utils.chat.getConversation.invalidate({ id: effectiveSelectedId });
      }
      utils.chat.listConversations.invalidate();
    },
  });

  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !effectiveSelectedId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({ conversationId: effectiveSelectedId, content: trimmed });
  };

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
  const isResolved = selected?.status === "resolved" || selected?.status === "abandoned";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  return (
    <div className="flex h-[calc(100vh-64px)] gap-0 overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="flex w-96 shrink-0 flex-col border-r border-white/[0.04]">
        <div className="px-6 pt-8 pb-4">
          <h2 className="text-4xl font-headline italic tracking-tight text-white">Яриа</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {listQuery.isLoading ? "..." : `${activeCount} идэвхтэй сешн`}
          </p>
        </div>

        <div className="space-y-3 px-4 pb-3">
          <Input
            placeholder="Яриа хайх..."
            icon={<span className="material-symbols-outlined text-[18px]">search</span>}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusChange(opt.value)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  statusFilter === opt.value
                    ? "bg-white/[0.12] text-white"
                    : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] hover:text-white/60",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {listQuery.isLoading ? (
            <div className="space-y-2 p-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/[0.05]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
              <span className="material-symbols-outlined text-[28px] text-white/20">forum</span>
              <p className="text-sm text-white/50">Яриа алга</p>
              <p className="text-xs text-white/30">Виджетээр дамжуулан яриа эхлэх боломжтой</p>
            </div>
          ) : (
            <AnimateList stagger={0.04}>
              {items.map((conv) => {
                const name = conv.shopperName ?? conv.shopperEmail ?? "Зочин";
                const isActive = conv.id === effectiveSelectedId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-[2rem] px-5 py-4 text-left transition-all duration-200",
                      isActive
                        ? "bg-white/[0.1] border-l-4 border-white"
                        : "bg-white/[0.02] hover:bg-white/[0.06]",
                    )}
                  >
                    <Avatar size="sm" fallback={name.charAt(0)} alt={name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">{name}</span>
                        <span className="shrink-0 text-[10px] text-white/30 uppercase tracking-wider">
                          {formatRelativeTime(conv.lastMessageAt ?? conv.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-white/50 font-light">
                        {conv.lastMessage ?? conv.summary ?? "Мессеж алга"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </AnimateList>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-full p-1.5 text-white/40 hover:bg-white/[0.05] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-white/30 tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-full p-1.5 text-white/40 hover:bg-white/[0.05] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right panel — conversation detail */}
      <div className="flex flex-1 flex-col">
        {!effectiveSelectedId || !selected ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[32px] text-white/15">forum</span>
              <p className="mt-2 text-sm text-white/40">
                {detailQuery.isLoading ? "Ачааллаж байна..." : "Яриа сонгоно уу"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-white">
                  {(selected.shopperName ?? selected.shopperEmail ?? "G").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {selected.shopperName ?? selected.shopperEmail ?? "Зочин"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          selected.status === "active"
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                            : "bg-white/30",
                        )}
                      />
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        {STATUS_BADGE[selected.status as ConvStatus]?.label ?? selected.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="glass"
                size="md"
                disabled={isResolved || updateStatusMutation.isPending}
                onClick={() => {
                  if (!effectiveSelectedId) return;
                  updateStatusMutation.mutate({ id: effectiveSelectedId, status: "resolved" });
                }}
              >
                {updateStatusMutation.isPending
                  ? "Шийдэж байна..."
                  : isResolved
                    ? "Шийдсэн"
                    : "Шийдэх"}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <AnimateList key={effectiveSelectedId} stagger={0.03} className="flex flex-col gap-4">
                {visibleMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                        <span className="material-symbols-outlined text-[16px] text-white/60">
                          auto_awesome
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[65%] px-5 py-3.5 hover:scale-[1.01] transition-transform duration-200",
                        msg.role === "user"
                          ? "rounded-t-3xl rounded-bl-3xl bg-white text-black"
                          : "rounded-t-3xl rounded-br-3xl bg-white/[0.05] glass-glint",
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          msg.role === "user" ? "text-black" : "text-white",
                        )}
                      >
                        {msg.content}
                      </p>
                      <p
                        className={cn(
                          "mt-2 text-[10px]",
                          msg.role === "user" ? "text-right text-black/40" : "text-white/30",
                        )}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </AnimateList>
              <div ref={messagesEndRef} />
            </div>

            {/* Input footer */}
            {isResolved ? (
              <div className="px-8 py-4 border-t border-white/[0.04] text-center">
                <p className="text-xs text-white/30">Энэ яриа шийдэгдсэн байна</p>
              </div>
            ) : (
              <div className="px-8 py-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Мессеж бичих..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="w-full h-12 rounded-3xl bg-white/[0.05] border-none px-5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
                {/* Quick replies */}
                <div className="flex gap-2 mt-3">
                  {["Юугаар тусалж болох вэ?", "Захиалгын төлөв", "Буцаалтын бодлого"].map(
                    (text) => (
                      <button
                        key={text}
                        onClick={() => {
                          if (!effectiveSelectedId || sendMessageMutation.isPending) return;
                          sendMessageMutation.mutate({
                            conversationId: effectiveSelectedId,
                            content: text,
                          });
                        }}
                        disabled={sendMessageMutation.isPending}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-colors disabled:opacity-40"
                      >
                        {text}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
