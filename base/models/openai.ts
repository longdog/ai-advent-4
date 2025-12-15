import { MemorySaver } from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { createAgent, ReactAgent } from "langchain"
const system = `Ты - мой персональный ассистент.
`

export function createOpenAiClient() {
  const checkpointer = new MemorySaver()
  const model = new ChatOpenAI({
    apiKey: "key",
    configuration: {
      baseURL: "http://localhost:8090",
    },
  })
  const agent = createAgent({
    model,
    checkpointer,
    systemPrompt: system,
  })
  return agent
}

export async function openaiChat(
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
