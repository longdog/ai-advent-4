import { createAgent, ReactAgent, summarizationMiddleware } from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"
import { checkpointer, getHistory } from "./memory"
import { systemPrompt } from "./prompts"
import { modelFix } from "./tools"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createGigaChatClient() {
  const model = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  const summarizationModel = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  const agent = createAgent({
    model: modelFix(model),
    checkpointer,
    systemPrompt,
    middleware: [
      summarizationMiddleware({
        model: modelFix(summarizationModel),
        trigger: { messages: 6 },
        keep: { messages: 4 },
      }),
    ],
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  message: string,
) {
  const prevMessages = await getHistory(chatId)
  console.log("HISTORY FROM CHECKPOINTER", prevMessages)

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
