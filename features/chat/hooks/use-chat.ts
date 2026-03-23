"use client";

import { useChat as useAIChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useRef, useMemo } from "react";

interface UseVelaChatOptions {
  apiKey: string;
}

function getAnonymousId(): string {
  if (typeof window === "undefined") return "ssr";

  const key = "vela_anonymous_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/**
 * Custom chat hook wrapping Vercel AI SDK's useChat.
 * Manages anonymous ID, API key auth, and conversation tracking.
 */
export function useVelaChat({ apiKey }: UseVelaChatOptions) {
  const conversationIdRef = useRef<string | null>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: {
          "x-api-key": apiKey,
        },
        body: () => ({
          anonymousId: typeof window !== "undefined" ? getAnonymousId() : "ssr",
          conversationId: conversationIdRef.current,
        }),
      }),
    [apiKey],
  );

  const chat = useAIChat({
    transport,
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!input.trim()) return;
      chat.sendMessage({ text: input.trim() });
      setInput("");
    },
    [input, chat],
  );

  const resetChat = useCallback(() => {
    conversationIdRef.current = null;
    chat.setMessages([]);
    setInput("");
  }, [chat]);

  const isLoading = chat.status === "submitted" || chat.status === "streaming";

  return {
    messages: chat.messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chat.error,
    reload: chat.regenerate,
    resetChat,
  };
}
