import { ChatGroq } from "@langchain/groq"
import { createAgent } from "langchain"
import { saveText } from "../tools/doc"
import { genreTool } from "../tools/rag"

const system = `Ты - помошник писателя.
  На основе предложенной аннотации ты должен придумать 5 тегов для литературного произведения, 
  в полной мере характеризующих его содержание.

  Примеры тегов:
  - романтика
  - первая любовь
  - комические приключения
  - пираты
  - семейные тайны
  Правила:
  - Верни список из 5 тегов
  - Тег должен состоять из 1 - 3 слов
  - каждый тег с отдельной строки
  - только список тегов без дополнительной разметки, пояснений, рассуждений и т.д.
`
export async function genresChat(description: string) {
  console.log("Подбор жанров...")

  const model = new ChatGroq({
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.5,
  })
  const agent = createAgent({
    model,
    systemPrompt: system,
    tools: [genreTool],
  })

  const result = await agent.invoke({
    messages: description,
  })

  const resultMessages = result.messages
  const genres = resultMessages?.at(-1)?.content || ""
  return genres
}
