import Baker from "cronbake"
import { chatWithAgent, createChatClient } from "./llm"

const baker = Baker.create()
const llm = createChatClient()
baker.add({
  immediate: true, // run the first time right away
  delay: "2s", // but wait 5 seconds before that first run
  name: "daily-job",
  cron: "0 0 0 * * *", // Runs daily at midnight
  callback: async () => {
    console.log("DAILY PITER NEWS START")
    const aiResponse = (await chatWithAgent(
      llm,
      "1",
      "Что сегодня случилось в Санкт Петербурге?",
    )) as string
    console.log("DONE")
    // console.log(aiResponse)
  },
})
baker.bakeAll()
