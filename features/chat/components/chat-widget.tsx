"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { cn } from "@/shared/lib/utils";
import { useVelaChat } from "../hooks/use-chat";
import { MessageBubble } from "./message-bubble";

interface ChatWidgetProps {
  apiKey?: string;
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

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col w-[380px] h-[600px] rounded-3xl overflow-hidden",
          "bg-surface-1 transition-all duration-300 origin-bottom-right",
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo circle with V */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2332]">
              <span className="font-serif italic text-lg text-white/90">V</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-wide text-white">Vela AI</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">
                AI Борлуулалтын Платформ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors text-white/50"
              title="Шинэ яриа"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/[0.06] transition-colors text-white/50"
            >
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5">
          {/* Date separator pill */}
          <div className="flex justify-center">
            <div className="rounded-full bg-white/[0.06] px-4 py-1.5">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                Today &bull; {timeStr}
              </span>
            </div>
          </div>

          {/* Welcome message when empty */}
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div
                className="max-w-[80%] glass-card px-4 py-3.5"
                style={{ borderRadius: "2rem 2rem 2rem 0.5rem" }}
              >
                <p className="text-[13.5px] leading-relaxed text-white/90">
                  Сайн байна уу! Би{" "}
                  <span className="font-serif italic text-[15px] text-white">Vela AI</span> — AI
                  борлуулалтын платформ. Таны дэлгүүрт хэрхэн туслахыг мэдэхийг хүсвэл асууна уу.
                </p>
              </div>
            </div>
          )}

          {messages.length === 0 && (
            <div className="pl-1">
              <p className="text-[10px] text-white/30">
                <span className="text-white/40">Vela AI</span> &bull; Хүргэгдсэн
              </p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="glass-card px-5 py-3.5"
                style={{ borderRadius: "2rem 2rem 2rem 0.5rem" }}
              >
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex justify-center">
              <div className="rounded-3xl bg-error-light px-4 py-3 text-[12px] text-error">
                <p>Алдаа гарлаа. {error.message}</p>
                <button
                  onClick={() => reload()}
                  className="mt-1.5 text-[11px] font-medium underline hover:no-underline text-error/80"
                >
                  Дахин оролдох
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-4 pb-3 pt-2">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-3">
              {/* Plus button */}
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/50 hover:bg-white/[0.1] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">add</span>
              </button>

              {/* Input field */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                placeholder="Vela AI-аас асуух..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-full bg-white/[0.04] px-5 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none max-h-[100px] disabled:opacity-50"
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  input.trim() && !isLoading
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/[0.06] text-white/25 cursor-not-allowed",
                )}
              >
                <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen && "rotate-0",
        )}
      >
        {isOpen ? (
          <span className="material-symbols-outlined text-[24px]">close</span>
        ) : (
          <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
        )}
      </button>
    </>
  );
}

export { ChatWidget };
