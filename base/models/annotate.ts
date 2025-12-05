import { GigaChat } from "gigachat"
import { Agent } from "node:https"
import { saveText } from "../tools/doc"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const system = `Ты - редактор, помогающий создавать аннотации.
Твоя задача - создать аннотацию для литературного произведения.
Правила:
- аннотация должна быть короче 1000 символов
- аннотация должна быть длиннее 70 символов
- только текст анотации без дополнительной разметки, пояснений, рассуждений и т.д.
`

export async function annotateChat(description: string) {
  console.log("Генерация аннотации...")

  const client = new GigaChat({
    timeout: 10000,
    model: "GigaChat",
    httpsAgent: httpsAgent,
  })
  const resp = await client.chat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: description },
    ],
    function_call: "auto",
  })
  const annotation = resp.choices[0]?.message.content
  if (!annotation) {
    throw new Error("Annotation not found")
  }
  return annotation
}
