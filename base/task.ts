import { chatWithAgent, createChatClient } from "./llm"
import { client } from "./mcp"

const llm = createChatClient()
const userMessage = "Какие новости в Москве?"
try {
  await chatWithAgent(llm, "1", userMessage)
} catch (error) {}
console.log("DONE")
await client.close()
