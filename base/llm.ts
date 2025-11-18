import { ChatGroq } from "@langchain/groq"
import { createAgent, ReactAgent } from "langchain"
import { Agent } from "node:https"
import { tools } from "./mcp"
import { systemPrompt } from "./prompts"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createGigaChatClient() {
  const model = new ChatGroq({
    model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    temperature: 0.5,
  })

  const agent = createAgent({
    model,
    systemPrompt,
    tools,
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  message: string,
) {
  const result = await agent.invoke(
    {
      messages: message,
    },
    {
      configurable: { thread_id: chatId },
    },
  )

  const resultMessages = result.messages
  return resultMessages?.at(-1)?.content || ""
}
