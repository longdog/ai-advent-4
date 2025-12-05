import { GigaChat, detectImage } from "gigachat"
import * as fs from "node:fs"
import { Agent } from "node:https"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const system = `Ты - иллюстратор, помогающий создавать обложки для театральных этюдов.
  На основе предложенной аннотации ты должен создать обложку для книги.
  Правила:
  - Реалистичная техника
  - Изображение соответствует содержанию книги
  - Квадратный формат
`

export async function createImageChat(description: string) {
  console.log("Генерация изображения для обложки...")

  const client = new GigaChat({
    timeout: 10000,
    model: "GigaChat",
    credentials: process.env.GIGACHAT_API_KEY,
    httpsAgent: httpsAgent,
  })
  const resp = await client.chat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: description },
    ],
    function_call: "auto",
  })
  const detectedImage = detectImage(resp.choices[0]?.message.content ?? "")
  if (detectedImage && detectedImage.uuid) {
    const image = await client.getImage(detectedImage.uuid)
    fs.writeFile("./book/input.jpg", image.content, "binary", function (err) {
      if (err) throw err
      console.log("Изображение сохранено в book/input.jpg")
      console.log(`Сообщение к изображению: "${detectedImage.postfix}"`)
    })
  } else {
    console.log(resp.choices[0]?.message.content)
    console.log("Изображение не сгенерировалось")
  }
}
