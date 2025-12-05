import { createAgent, ReactAgent } from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"
import { checkpointer } from "../memory"
import { modelFix } from "../utils"
const system = `Ты - театральный ассистент, который помогает придумывать сценарии к театральным этюдам.
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

Правила для маркдауна:
- между тегами заголовка (#, ##, ###) и текстом заголовка должен быть пробел
- после каждого заголовка должна быть пустая строка

Формат сценария:
- В начале текста этюда напиши слово **СЦЕНАРИЙ**
- Название этюда, не больше 3 слов, начинается с символа #
- Список персонажей
- Краткое описание завязки
- Сцена с диалогами и действиями
- Завершение этюда

В конце текста сценария напиши слово **КОНЕЦ**
 `

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createAuthorClient() {
  const model = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  const agent = createAgent({
    model: modelFix(model),
    checkpointer,
    systemPrompt: system,
  })
  return agent
}

export async function authorChat(
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
