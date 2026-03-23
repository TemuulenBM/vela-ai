"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";
import { useVelaChat } from "../hooks/use-chat";
import { MessageBubble } from "./message-bubble";

interface ChatWidgetProps {
  apiKey: string;
}

function ChatWidget({ apiKey }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, resetChat } =
    useVelaChat({ apiKey });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col w-[380px] h-[560px] rounded-[var(--radius-xl)] border border-border-default bg-surface-primary shadow-xl overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-brand-600 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Vela AI</p>
              <p className="text-[11px] text-white/70">Борлуулалтын туслах</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              title="Шинэ яриа"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Welcome message when empty */}
          {messages.length === 0 && (
            <div className="flex gap-2.5">
              <Avatar
                size="xs"
                fallback="V"
                className="shrink-0 mt-0.5 bg-brand-100 text-brand-700"
              />
              <div className="max-w-[75%] rounded-[var(--radius-lg)] rounded-bl-sm bg-surface-tertiary text-text-primary px-3.5 py-2.5">
                <p className="text-[13px] leading-relaxed">
                  Сайн байна уу! Би Vela AI борлуулалтын туслах. Танд юугаар туслах вэ?
                </p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex gap-2.5">
              <Avatar
                size="xs"
                fallback="V"
                className="shrink-0 mt-0.5 bg-brand-100 text-brand-700"
              />
              <div className="bg-surface-tertiary rounded-[var(--radius-lg)] rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-text-tertiary animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-[var(--radius-md)] bg-error-light px-3 py-2 text-[12px] text-red-700">
                <p>Алдаа гарлаа. {error.message}</p>
                <button
                  onClick={() => reload()}
                  className="mt-1 text-[11px] font-medium underline hover:no-underline"
                >
                  Дахин оролдох
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="shrink-0 border-t border-border-default px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={onKeyDown}
              placeholder="Мессеж бичих..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-[var(--radius-md)] border border-border-default bg-surface-secondary px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 max-h-[100px] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors",
                input.trim() && !isLoading
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-surface-tertiary text-text-tertiary cursor-not-allowed",
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary text-center mt-2">Powered by Vela AI</p>
        </form>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen && "rotate-0",
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </>
  );
}

export { ChatWidget };
