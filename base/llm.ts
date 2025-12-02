import { ChatGroq } from "@langchain/groq"
import { createAgent, createMiddleware, ReactAgent } from "langchain"
import { checkpointer } from "./memory"
import { systemPromptWithVector } from "./prompts"
import { githubTools } from "./tools/github"
import { createProjectTool } from "./tools/rag"
// model: "meta-llama/llama-4-maverick-17b-128e-instruct",
const toolMonitoringMiddleware = createMiddleware({
  name: "ToolMonitoringMiddleware",
  wrapToolCall: (request, handler) => {
    console.log(`\n\nExecuting tool: ${request.toolCall.name}`)
    console.log(`Arguments: ${JSON.stringify(request.toolCall.args)}`)
    try {
      const result = handler(request)
      console.log("Tool completed successfully")
      return result
    } catch (e) {
      console.log(`Tool failed: ${e}`)
      throw e
    }
  },
})

const llmMonitoringMiddleware = createMiddleware({
  name: "llmMonitoringMiddleware",
  beforeAgent: (req, handler) => {
    console.log("\n\nBefore Agent", JSON.stringify(req.messages))
  },

  afterAgent: (req, handler) => {
    console.log("\n\nAfter Agent", JSON.stringify(req.messages))
  },
  beforeModel: (req, handler) => {
    console.log("\n\nBefore Model Call", JSON.stringify(req.messages))
  },
  afterModel: (req, handler) => {
    console.log("\n\nAfter Model Call", JSON.stringify(req.messages))
  },
  wrapModelCall: (request, handler) => {
    console.log(`\n\nExecuting model: ${request.model.getName()}`)
    console.log(`Arguments: ${JSON.stringify(request.messages)}`)
    console.log(`Tool choice: ${JSON.stringify(request.toolChoice)}`)
    // console.log(`State: ${JSON.stringify(request.state)}`)
    // console.log(`Tools: ${JSON.stringify(request.tools)}`)
    try {
      const result = handler(request)
      console.log("Model completed successfully")
      return result
    } catch (e) {
      console.log(`Model failed: ${e}, ${JSON.stringify(request)}`)
      throw e
    }
  },
})

export async function createChatClient(path: string) {
  const model = new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    // model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.5,
  })
  const docTool = await createProjectTool(path)
  const agent = createAgent({
    model,
    systemPrompt: systemPromptWithVector,
    tools: [docTool, ...githubTools],
    // middleware: [toolMonitoringMiddleware, llmMonitoringMiddleware],
    checkpointer,
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  messages: string,
) {
  const memory = await checkpointer.get({ configurable: { thread_id: chatId } })

  // console.log("Memory: ", memory)

  const result = await agent.invoke(
    {
      messages,
    },
    {
      configurable: { thread_id: chatId },
    },
  )

  const resultMessages = result.messages
  return resultMessages?.at(-1)?.content || ""
}
