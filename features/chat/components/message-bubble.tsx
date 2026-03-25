"use client";

import { motion } from "motion/react";
import { cn } from "@/shared/lib/utils";
import { ToolResult } from "./tool-result";
import { isToolUIPart, getToolName, type UIMessage } from "ai";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="space-y-1.5"
    >
      <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[80%] px-4 py-3.5",
            isUser ? "bg-white text-black" : "glass-card text-white/90",
          )}
          style={{
            borderRadius: isUser ? "2rem 2rem 0.5rem 2rem" : "2rem 2rem 2rem 0.5rem",
          }}
        >
          {/* Content parts */}
          {message.parts.map((part, i) => {
            if (part.type === "text" && part.text) {
              return (
                <p
                  key={i}
                  className={cn(
                    "text-[13.5px] leading-relaxed whitespace-pre-wrap",
                    isUser ? "text-black" : "text-white/90",
                  )}
                >
                  {part.text}
                </p>
              );
            }

            if (isToolUIPart(part)) {
              const toolName = getToolName(part);
              if (part.state === "output-available") {
                return <ToolResult key={i} toolName={toolName} result={part.output} />;
              }

              // Tool is being called — show loading
              return (
                <div key={i} className="text-[11px] text-white/35 mt-2 italic font-serif">
                  {toolName === "searchProducts" ? "Бараа хайж байна..." : "Шалгаж байна..."}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Metadata line under AI messages */}
      {!isUser && (
        <div className="pl-1">
          <p className="text-[10px] text-white/30">
            <span className="text-white/40">Vela AI</span> &bull; Delivered
          </p>
        </div>
      )}

      {/* Timestamp under user messages */}
      {isUser && (
        <div className="flex justify-end pr-1">
          <p className="text-[10px] text-white/25 flex items-center gap-1.5">
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
            <span className="material-symbols-outlined text-[12px] text-white/25">done_all</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
