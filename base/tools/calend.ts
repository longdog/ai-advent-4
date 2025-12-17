import { $ } from "bun"
import { tool } from "langchain"
import { z } from "zod"

async function notify(message: string) {
  const env = {
    ...process.env,
    DBUS_SESSION_BUS_ADDRESS:
      process.env.DBUS_SESSION_BUS_ADDRESS ||
      `unix:path=/run/user/${process?.getuid?.()}/bus`,
  }
  await $`notify-send "Никифор" "${message}"`.env(env)
  return `${message} sent`
}

const readCalendar = async () => {
  const file = Bun.file("./tools/calend.json")
  const content = await file.text()
  return JSON.parse(content) as { time: string; activity: string }[]
}

const formatCalendar = (calendar: { time: string; activity: string }[]) => {
  return calendar.map(item => `${item.time} - ${item.activity}`).join("\n")
}

const addActivity = async (time: string, activity: string) => {
  const file = Bun.file("./tools/calend.json")
  const content = await file.text()
  const calendar = JSON.parse(content) as { time: string; activity: string }[]
  calendar.push({ time, activity })
  calendar.sort((a, b) =>
    a.time.replace(":", "").localeCompare(b.time.replace(":", "")),
  )
  await file.write(JSON.stringify(calendar))
  await notify(`Добавлено событие: ${time} - ${activity}`)
}

const calendarTool = tool(async () => formatCalendar(await readCalendar()), {
  schema: z.object({}),
  responseFormat: "content_and_artifact",
  name: "my_calendar",
  description: "Возвращает события и задачи из календаря.",
})

const addActivitySchema = z.object({
  time: z.string(),
  activity: z.string(),
})

const addActivityTool = tool(
  async ({ time, activity }: z.infer<typeof addActivitySchema>) => {
    await addActivity(time, activity)
    return ""
  },
  {
    schema: addActivitySchema,
    responseFormat: "content_and_artifact",
    name: "add_event_to_calendar",
    description: "Добавляет событие в календарь.",
  },
)
export const calendTools = [calendarTool, addActivityTool]
