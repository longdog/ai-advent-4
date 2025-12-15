import { MemorySaver } from "@langchain/langgraph"
import { createAgent, ReactAgent } from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"
import { modelFix } from "../utils"
const system = `Ты - мой персональный ассистент.

`

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createAuthorClient() {
  const checkpointer = new MemorySaver()
  const model = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  const agent = createAgent({
    model: modelFix(model),
    checkpointer,
    systemPrompt: system,
  })
  return agent
}

export async function authorChat(
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
