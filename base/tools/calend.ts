import { tool } from "langchain"
import { z } from "zod"

export const calendarTool = tool(
  async () => [
    "07:30 - Подъем",
    "08:00 - Завтрак с семьей",
    "10:00 - Спортзал",
    "12:00 - Созвон с командой",
    "13:00 - Обед",
    "14:30 - Встреча с клиентом",
    "18:00 - Ужин",
    "20:00 - Просмотр фильма с женой",
    "23:00 - Сон",
  ],
  {
    schema: z.object({}),
    responseFormat: "content_and_artifact",
    name: "my_calendar",
    description: "Возвращает события и задачи из календаря.",
  },
)
