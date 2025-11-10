import { GigaChat } from "langchain-gigachat"
import { HumanMessage, SystemMessage } from "langchain/schema"
import { Agent } from "node:https"

const question = `
Существует ли разумная жизнь на других планетах и если есть - на что она похожа?
`

const systemPrompt1 = `
Ты - умный помощник`

const systemPrompt2 = `
Ты - анализатор ответов от llm. Нескольким llm с разной температурой в настройках дали один и тот же вопрос и получили несколько ответов.
- Сравни результаты (точность, креативность, разнообразие)
- Сформулируй, для каких задач лучше подходит каждая температура
`

export const systemPrompts = [
  {
    prompt: systemPrompt1,
    expert: "умный помощник с температурой 0",
    temperature: 0,
  },
  {
    prompt: systemPrompt1,
    expert: "умный помощник с температурой 0.7",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt1,
    expert: "умный помощник с температурой 1.2",
    temperature: 1.2,
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

export async function chatWithGigaChat(
  llm: any,
  systemPrompt: string,
  message: string,
) {
  try {
    const prompt = [new SystemMessage(systemPrompt), new HumanMessage(message)]
    const res = await llm.invoke(prompt)
    return res.content
  } catch (error) {
    console.error("Error calling GigaChat:", error)
    return "Sorry, I encountered an error processing your request."
  }
}
