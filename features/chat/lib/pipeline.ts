import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from "ai";
import { chatModel } from "@/server/ai/claude";
import { buildSystemPrompt } from "./system-prompt";
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
