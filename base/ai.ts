import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"

const systemPrompt = `
Ты — инструмент для анализа текста. Твоя задача: принимать текст, присланный пользователем, 
определять части речи каждого слова и подсчитывать количество слов каждой части речи. 
Используй стандартные категории частей речи: существительное, глагол, прилагательное, наречие, местоимение, предлог, союз, частица, междометие. 
Возвращай результат строго в JSON-формате:\n\n{\n  \"существительное\": число,\n  \"глагол\": число,\n  \"прилагательное\": число,\n  \"наречие\": число,\n  \"местоимение\": число,\n  \"предлог\": число,\n  \"союз\": число,\n  \"частица\": число,\n  \"междометие\": число}\n\nНикаких других объяснений, текста или комментариев не добавляй. Работай только с текстом, который прислал пользователь.
Пример:
Вход: "Кошка бежит быстро по двору."
Выход:

{
    "существительное": 2,
    "глагол": 1,
    "прилагательное": 0,
    "наречие": 1,
    "местоимение": 0,
    "предлог": 1,
    "союз": 0,
    "частица": 0,
    "междометие": 0
}
`

// Create GigaChat client
export function createGigaChatClient() {
  const httpsAgent = new Agent({
    rejectUnauthorized: false,
  })

  const llm = new GigaChat({
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
    temperature: 0,
  })

  return llm
}

// Chat function that maintains conversation history
export async function chatWithGigaChat(llm: any, text: string) {
  const prompt = [
    { role: "system", content: systemPrompt },
    { role: "user", content: text },
  ]

  try {
    const response = await llm.invoke(prompt)
    return response.content
  } catch (error) {
    console.error("Error calling GigaChat:", error)
    return "Sorry, I encountered an error processing your request."
  }
}
