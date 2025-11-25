import { ChatGroq } from "@langchain/groq"
import { createAgent, ReactAgent } from "langchain"
import { checkpointer } from "./memory"
import { systemPromptWithVector } from "./prompts"
import { marineTool } from "./vector"

export function createChatClient() {
  const model = new ChatGroq({
    // model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.7,
  })

  const agent = createAgent({
    model,
    systemPrompt: systemPromptWithVector,
    tools: [marineTool],
    checkpointer,
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  messages: string,
) {
  const result = await agent.invoke(
    {
      messages,
    },
    {
      configurable: { thread_id: chatId },
    },
  )

  const resultMessages = result.messages
  return resultMessages?.at(-1)?.content || ""
}
