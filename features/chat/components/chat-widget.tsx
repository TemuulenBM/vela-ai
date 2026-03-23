"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "Сайн байна уу! Би Vela AI борлуулалтын туслах. Танд юугаар туслах вэ?",
    timestamp: "12:00",
  },
];

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        role: "assistant",
        content:
          "Баярлалаа! Таны хүсэлтийг хүлээн авлаа. Бид танд тохирох бараа зөвлөхөд бэлэн байна. Ямар төрлийн бүтээгдэхүүн сонирхож байна вэ?",
        timestamp: new Date().toLocaleTimeString("mn-MN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.role === "user" ? 12 : -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <Avatar
                    size="xs"
                    fallback="V"
                    className="shrink-0 mt-0.5 bg-brand-100 text-brand-700"
                  />
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-[var(--radius-lg)] px-3.5 py-2.5",
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-br-sm"
                      : "bg-surface-tertiary text-text-primary rounded-bl-sm",
                  )}
                >
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      msg.role === "user" ? "text-white/60" : "text-text-tertiary",
                    )}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-border-default px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Мессеж бичих..."
              rows={1}
              className="flex-1 resize-none rounded-[var(--radius-md)] border border-border-default bg-surface-secondary px-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 max-h-[100px]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors",
                input.trim()
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-surface-tertiary text-text-tertiary cursor-not-allowed",
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary text-center mt-2">Powered by Vela AI</p>
        </div>
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
