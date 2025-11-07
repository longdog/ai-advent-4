import { GigaChat } from "langchain-gigachat"
import { HumanMessage, SystemMessage } from "langchain/schema"
import { Agent } from "node:https"

const question = `
Утром в понедельник профессор говорит студентам:
Я проведу экзамен на этой неделе, который будет для вас сюрпризом.
Он может состояться сегодня, во вторник, в среду, в четверг или в пятницу.
Утром в день экзамена, когда вы придете в класс, вы не будете знать, что это день экзамена.
В какой день состоится экзамен?
`

const systemPrompt1 = `
Ты - умный помощник, реши предложенную задачу, напиши только ответ.
`

const systemPrompt2 = `
Ты - ответственный помощник, реши предложенную задачу по шагам, распиши этапы решения.
`

const systemPrompt3 = `
Ты - специалист по написанию system prompt для LLM Gigachat. Напиши system prompt для предложенной задачи.
`

const systemPrompt4 = `
Ты включаешь в себя группу экспертов: математик-логик, студент - двоечник, военный, домохозяйка.
Напиши 4 ответа на предложенный вопрос от каждого эксперта.
`

const systemPrompt5 = `
Ты - анализатор ответов от llm. Нескольким llm дали один вопрос и получили несколько ответов.
Сравни эти ответы и напиши какая llm была точнее и лучше в рассуждении.
`
export const systemPrompts = [
  {
    prompt: systemPrompt1,
    expert: "умный помощник",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt2,
    expert: "ответственный помощник",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt3,
    expert: "специалист по написанию system prompt",
    temperature: 0.3,
  },
  {
    prompt: "",
    expert: "специалст с system prompt от другого llm",
    temperature: 0.7,
  },
  {
    prompt: systemPrompt4,
    expert: "группа экспертов",
    temperature: 1,
  },
  {
    prompt: systemPrompt5,
    expert: "анализатор ответов от llm",
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
