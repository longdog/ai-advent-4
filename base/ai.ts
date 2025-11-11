import { ChatGroq } from "@langchain/groq"
import { HumanMessage, SystemMessage } from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"

const question = `
Существует ли разумная жизнь на других планетах и если есть - на что она похожа?
`

const systemPrompt1 = `
Ты - умный помощник`

const systemPrompt2 = `
Ты - анализатор ответов от разных моделей. Нескольким моделям дали один и тот же вопрос и получили несколько ответов.
- Сравни качество ответов моделей
- Сравни количество токенов в ответах
- Сравни скорость ответов моделей
`

export const systemPrompts = [
  {
    prompt: systemPrompt1,
    expert: "allam-2-7b",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt1,
    expert: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt1,
    expert: "moonshotai/kimi-k2-instruct",
    temperature: 0.7,
  },

  {
    prompt: systemPrompt1,
    expert: "openai/gpt-oss-20b",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt1,
    expert: "qwen/qwen3-32b",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt2,
    expert: "анализатор",
    temperature: 0.5,
  },
]

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})
// Create GigaChat client
export function createGigaChatClient(name: string, temperature: number) {
  const llm = new GigaChat({
    model: "GigaChat-Pro",
    httpsAgent,
    temperature,
    metadata: { name },
    credentials: process.env.GIGACHAT_API_KEY,
  })
  return llm
}

export function createGroqChatClient(name: string, temperature: number) {
  const llm = new ChatGroq({
    model: name,
    temperature,
  })
  return llm
}

export async function chatWithLLM(
  llm: any,
  systemPrompt: string,
  message: string,
) {
  try {
    const prompt = [new SystemMessage(systemPrompt), new HumanMessage(message)]
    const res = await llm.invoke(prompt)
    return res
  } catch (error) {
    console.error("Error calling GigaChat:", error)
    return "Sorry, I encountered an error processing your request."
  }
}
