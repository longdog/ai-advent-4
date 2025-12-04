import { ChatGroq } from "@langchain/groq"
import { createAgent, ReactAgent } from "langchain"
import { checkpointer } from "./memory"
import { systemPromptWithVector } from "./prompts"
import { altTool } from "./tools/rag"
import { ticketsTools } from "./tools/tickets"
// model: "meta-llama/llama-4-maverick-17b-128e-instruct",

export function createChatClient() {
  const model = new ChatGroq({
    model: "moonshotai/kimi-k2-instruct-0905",
    // model: "meta-llama/llama-4-maverick-17b-128e-instruct",
    temperature: 0.5,
  })
  const agent = createAgent({
    model,
    systemPrompt: systemPromptWithVector,
    tools: [...ticketsTools, altTool],
    checkpointer,
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  messages: string,
) {
  const memory = await checkpointer.get({ configurable: { thread_id: chatId } })

  // console.log("Memory: ", memory)

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
