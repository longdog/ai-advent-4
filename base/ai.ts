import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain"
import { GigaChat } from "langchain-gigachat"
import { ConversationChain } from "langchain/chains"
import { BufferMemory } from "langchain/memory"
import { Agent } from "node:https"

const systemPrompt = `
Ты - театральный ассистент, который помогает придумывать сценарии к театральным этюдам.
Для создания этюда ты должен задать пользователю несколько вопросов.
Твоя задача - собрать следующую информацию:
1. Кто участвует в этюде
2. Тема этюда
3. Продолжительность этюда
4. Настроение/атмосфера этюда
Задавай вопросы по одному за раз, дожидаясь ответа пользователя.
Не задавай вопрос, на который ты уже знаешь ответ.
Собрав все данные, ты должен создать короткий сценарий театрального этюда в формате Markdown.

Формат сценария:
- В начале текста этюда напиши слово **СЦЕНАРИЙ**
- Название этюда (в заголовке #)
- Список персонажей
- Краткое описание завязки
- Сцена с диалогами и действиями
- Завершение этюда

В конце текста сценария напиши слово **КОНЕЦ**
`

// Create GigaChat client
export function createGigaChatClient() {
  const httpsAgent = new Agent({
    rejectUnauthorized: false,
  })

  const llm = new GigaChat({
    model: "GigaChat-Pro",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })

  return llm
}

// Create conversation chain with memory
export function createConversationChain(llm: any) {
  const chatPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemPrompt),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ])

  const chain = new ConversationChain({
    llm,
    memory: new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
    }),
    prompt: chatPrompt,
  })

  return chain
}

// Chat function that uses conversation chain with memory
export async function chatWithGigaChat(chain: any, message: string) {
  try {
    const response = await chain.call({ input: message || " " })
    return response.response
  } catch (error) {
    console.error("Error calling GigaChat:", error)
    return "Sorry, I encountered an error processing your request."
  }
}
