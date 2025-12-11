import { MemorySaver } from "@langchain/langgraph"
import { ChatOllama } from "@langchain/ollama"
import { createAgent, ReactAgent } from "langchain"
const systemPrompt = `You are a sports data parser. 
You will receive a string describing a Muay Thai division.
Your task is to extract the following information:
- weight group
- age group
- sex
and return it in format:
weight group: <extracted weight group>;
age group: <extracted age group>;
sex: <extracted sex>;
Do not return any extra text. Only output these three fields with extracted data.
`

const models = [
  {
    temperature: 0.9,
    model: "gemma3:270m-it-qat",
    metadata: {
      name: "gemma3:270m-it-qat",
      quantization: "Q4_0",
      size: "241MB",
    },
  },
  {
    model: "gemma3:270m-it-q8_0",
    temperature: 0.9,
    metadata: {
      name: "gemma3:270m-it-q8_0",
      quantization: "Q8_0",
      size: "292MB",
    },
  },
]

const question = `
J 10-11 Male Youth -32kg
J 10-11 Female Youth -38kg
U 23 Female +67kg
S Female Elite 54 kg
S Male Elite 96 kg
ELIT Male ELIT -63.5kg
ELIT Female ELIT +75kg
`

export function createOlamaClient() {
  const checkpointer = new MemorySaver()
  const model = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL!,
    ...models[1],
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
      configurable: { thread_id: new Date().toISOString() },
    },
  )

  const { messages: resultMessages } = result
  return resultMessages?.at(-1)?.content || "Нет ответа"
}
