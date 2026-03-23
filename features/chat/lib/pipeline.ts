import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";
import { chatModel, cheapModel } from "@/server/ai/claude";
import { buildSystemPrompt, buildDemoSystemPrompt } from "./system-prompt";
import { createChatTools } from "./tools";

interface PipelineParams {
  tenantId: string;
  tenantName: string;
  productCategories: string[];
  messages: UIMessage[];
}

/**
 * Execute the RAG chat pipeline.
 * Builds system prompt, configures tools, and streams Claude's response.
 * Returns the streamText result — caller handles SSE response.
 */
/**
 * Execute the demo pipeline for landing page bot.
 * No tool calling, uses cheap model, platform intro only.
 */
export async function executeDemoPipeline(messages: UIMessage[]) {
  const system = buildDemoSystemPrompt();
  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model: cheapModel,
    system,
    messages: modelMessages,
  });
}

/**
 * Execute the RAG chat pipeline.
 */
export async function executeChatPipeline(params: PipelineParams) {
  const { tenantId, tenantName, productCategories, messages } = params;

  const system = buildSystemPrompt(tenantName, productCategories);
  const tools = createChatTools(tenantId);
  const modelMessages = await convertToModelMessages(messages);

  return streamText({
    model: chatModel,
    system,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(3),
  });
}
