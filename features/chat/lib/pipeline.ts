import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";
import { chatModel, cheapModel } from "@/server/ai/claude";
import { buildSystemPrompt, buildDemoSystemPrompt } from "./system-prompt";
import { createChatTools } from "./tools";
import { PLAN_TOOLS } from "@/shared/lib/plan-config";

interface PipelineParams {
  tenantId: string;
  tenantName: string;
  productCategories: string[];
  messages: UIMessage[];
  plan: string;
}

/**
 * Truncate message history to keep costs down.
 * Keeps the first message (greeting context) and the most recent messages.
 */
function truncateMessages(messages: UIMessage[], maxMessages = 10): UIMessage[] {
  if (messages.length <= maxMessages) return messages;
  return [messages[0], ...messages.slice(-(maxMessages - 1))];
}

/**
 * Execute the demo pipeline for landing page bot.
 * No tool calling, uses cheap model, platform intro only.
 */
export async function executeDemoPipeline(messages: UIMessage[]) {
  const system = buildDemoSystemPrompt();
  const limited = truncateMessages(messages);
  const modelMessages = await convertToModelMessages(limited);

  return streamText({
    model: cheapModel,
    system,
    messages: modelMessages,
  });
}

/**
 * Execute the RAG chat pipeline.
 * Tools are filtered based on the tenant's plan.
 */
export async function executeChatPipeline(params: PipelineParams) {
  const { tenantId, tenantName, productCategories, messages, plan } = params;

  const system = buildSystemPrompt(tenantName, productCategories);
  const allTools = createChatTools(tenantId);
  const allowedToolNames = PLAN_TOOLS[plan] ?? PLAN_TOOLS.trial;

  const tools = Object.fromEntries(
    Object.entries(allTools).filter(([name]) => allowedToolNames.includes(name)),
  );

  const limited = truncateMessages(messages);
  const modelMessages = await convertToModelMessages(limited);

  return streamText({
    model: chatModel,
    system,
    messages: modelMessages,
    tools,
    maxOutputTokens: 500,
    stopWhen: stepCountIs(3),
    providerOptions: {
      anthropic: {
        cacheControl: { type: "ephemeral" },
      },
    },
  });
}
