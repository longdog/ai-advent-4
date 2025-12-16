import { MemorySaver } from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { createAgent, ReactAgent } from "langchain"
import { calendarTool } from "../tools/calend"
import { dateTool } from "../tools/date"
import { fridgeTool } from "../tools/fridge"
import { voiceTool } from "../tools/voice"
const systemPrompt = `Ты - мой персональный ассистент.
Меня зовут Денис. Я специалист с мировым именем в области ИИ.
У меня есть жена Ольга, она увлекается вышиванием и дочка Алиса, она занимается синхронным плаванием.
Ты помогаешь мне: 
- вести ежедневные дела, 
- следить за расписанием, 
- отслеживать наличие продуктов в холодильнике
- даешь советы на основе моих интересов и интересов моей семьи.
ПРАВИЛА:
- Приветсвтуй меня по имени и спрашивай, чем ты мне можешь помочь
- Если нужен голосовой ввод - используй инструмент voice_salute
- Проверяй дату и время с помощью функции current_date_time
- Проверяй мое расписание с помощью функции my_calendar
- Проверяй наличие продуктов в холодильнике с помощью функции my_fridge
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
    systemPrompt,
    tools: [fridgeTool, calendarTool, dateTool, voiceTool!],
    // middleware: [toolMonitoringMiddleware],
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
