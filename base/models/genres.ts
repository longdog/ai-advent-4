import { ChatGroq } from "@langchain/groq"
import { createAgent } from "langchain"
import { genreTool } from "../tools/rag"

const system = `Ты - помошник писателя. Тебе доступен инструмент подбора жанров для литературного произведения.
  На основе предложенной аннотации ты должен подобрать 3 жанра для литературного произведения, используй инструмент.
  Правила:
  - Верни список из 3 жанров
  - каждый жанр с отдельной строки
  - только список жанров без дополнительной разметки, пояснений, рассуждений и т.д.
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
