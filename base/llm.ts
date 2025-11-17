import { createAgent, ReactAgent } from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"
import { tools } from "./mcp"
import { systemPrompt } from "./prompts"
import { modelFix } from "./utils"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createGigaChatClient() {
  const model = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  const agent = createAgent({
    model: modelFix(model),
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
