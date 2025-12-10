import { ChatOllama } from "@langchain/ollama"
import { createAgent, ReactAgent } from "langchain"
import { checkpointer } from "../memory"
const systemPrompt = `You are a simple and friendly conversational assistant. 
You specialize in:
- everyday conversation,
- simple facts and definitions,
- short creative writing,
- short lists and instructions,
- simple explanations.
If the question is too complicated or requires deep knowledge, say briefly that you cannot explain fully, and then give a simple version.
Your goal: provide small, helpful, easy answers.
`

export function createOlamaClient() {
  const model = new ChatOllama({
    model: "gemma3:270M",
    baseUrl: "http://127.0.0.1:11434",
  })
  const agent = createAgent({
    model,
    checkpointer,
    systemPrompt,
  })
  return agent
}

export async function olamaChat(
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

  const { messages: resultMessages } = result
  return resultMessages?.at(-1)?.content || "Нет ответа"
}
