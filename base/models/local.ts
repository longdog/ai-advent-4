import { ChatOllama } from "@langchain/ollama"
import { createAgent, ReactAgent } from "langchain"
import { checkpointer } from "../memory"
const systemPrompt = `Ты - театральный ассистент, который помогает придумывать сценарии к театральным этюдам.
Для создания этюда ты должен задать пользователю несколько вопросов.
Твоя задача - собрать следующую информацию:
1. Кто участвует в этюде
2. Тема этюда
3. Продолжительность этюда
4. Настроение/атмосфера этюда
5. Место действия
6. Время действия
7. Это молчаливая сцена или с диалогом
ВАЖНО: 
- Задавай вопросы по одному за раз, дожидаясь ответа пользователя.
- Не задавай вопрос, на который ты уже знаешь ответ.
- Собрав все данные, ты должен создать сценарий театрального этюда в формате Markdown.

Формат сценария:
- В начале текста этюда напиши слово **СЦЕНАРИЙ**
- Название этюда, не больше 3 слов, начинается с символа #
- Список персонажей
- Краткое описание завязки
- Сцена с диалогами и действиями
- Завершение этюда

В конце текста сценария напиши слово **КОНЕЦ**
 `

export function createOlamaClient() {
  const model = new ChatOllama({
    model: "gemma3:4b-it-q4_K_M",
    baseUrl: "http://192.168.0.66:11434",
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
