"use client";

import { motion } from "motion/react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/components/ui/avatar";
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
      className={cn("flex gap-2.5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <Avatar size="xs" fallback="V" className="shrink-0 mt-0.5 bg-brand-100 text-brand-700" />
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-[var(--radius-lg)] px-3.5 py-2.5",
          isUser
            ? "bg-brand-600 text-white rounded-br-sm"
            : "bg-surface-tertiary text-text-primary rounded-bl-sm",
        )}
      >
        {/* Text content */}
        {message.parts.map((part, i) => {
          if (part.type === "text" && part.text) {
            return (
              <p key={i} className="text-[13px] leading-relaxed whitespace-pre-wrap">
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
              <div key={i} className="text-[11px] text-text-tertiary mt-1 italic">
                {toolName === "searchProducts" ? "Бараа хайж байна..." : "Шалгаж байна..."}
              </div>
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
}
