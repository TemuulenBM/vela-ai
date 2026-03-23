import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Claude Sonnet 4.6 — main chat conversations, tool calling */
export const chatModel = anthropic("claude-sonnet-4-6");

/** Claude Haiku 4.5 — cheap calls (recommendations, summaries) */
export const cheapModel = anthropic("claude-haiku-4-5-20251001");
