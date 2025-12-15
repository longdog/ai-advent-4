import { tool } from "langchain"
import { z } from "zod"

export const dateTool = tool(async () => new Date().toISOString(), {
  schema: z.object({}),
  responseFormat: "content_and_artifact",
  name: "current_date_time",
  description: "Возвращает текущую дату и время в формате ISO.",
})
