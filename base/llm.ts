import { MemorySaver } from "@langchain/langgraph"
import {
  AIMessage,
  BaseMessage,
  countTokensApproximately,
  createAgent,
  HumanMessage,
  ReactAgent,
  summarizationMiddleware,
  SystemMessage,
} from "langchain"
import { GigaChat } from "langchain-gigachat"
import { Agent } from "node:https"
import { systemPrompt } from "./prompts"

const checkpointer = new MemorySaver()

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

export function createChat(id: string) {
  let history: BaseMessage[] = [new SystemMessage(systemPrompt)]
  return {
    id,
    history,
    addHumanMessage: (message: string) => {
      console.log("HISTORY", history)
      history.push(new HumanMessage(message))
    },
    addAIMessage: (message: string) => {
      console.log("HISTORY", history)
      history.push(new AIMessage(message))
    },
    update: (messages: BaseMessage[]) => {
      console.log("HISTORY", history)

      history = messages
    },
  }
}

export type Chat = ReturnType<typeof createChat>

export function createGigaChatClient(withSummary = true) {
  const model = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  if (!model.bind) {
    model.bind = function (params) {
      return Object.assign(
        Object.create(Object.getPrototypeOf(this)),
        this,
        params,
      )
    }
  }
  const summarizationModel = new GigaChat({
    model: "GigaChat",
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  })
  if (!summarizationModel.bind) {
    summarizationModel.bind = function (params) {
      return Object.assign(
        Object.create(Object.getPrototypeOf(this)),
        this,
        params,
      )
    }
  }
  const agent = createAgent({
    model,
    checkpointer,
    systemPrompt,
    middleware: [
      summarizationMiddleware({
        model: summarizationModel,
        trigger: { messages: 6 },
        keep: { messages: 4 },
      }),
    ],
  })
  return agent
}

export async function chatWithAgent(
  agent: ReactAgent,
  chatId: string,
  message: string,
) {
  const history = await checkpointer.get({
    configurable: { thread_id: chatId },
  })
  const prevMessages = history?.channel_values?.messages || []
  const tokensBefore = countTokensApproximately(prevMessages)
  // console.log("HISTORY FROM CHECKPOINTER", prevMessages)

  const result = await agent.invoke(
    {
      messages: message,
    },
    {
      configurable: { thread_id: chatId },
    },
  )

  const resultMessages = result.messages
  // console.log("RESULT", resultMessages)

  const totalTokensAfter = countTokensApproximately(resultMessages)
  const systemMessage = resultMessages[0]
  const systemContent =
    typeof systemMessage?.content === "string" ? systemMessage.content : ""
  if (systemContent.includes("summary")) {
    console.log("SUMMARIZATION")
    console.log(
      `Number of messages after summarization: ${resultMessages.length}`,
    )
    console.log(`Tokens after summarization: ${totalTokensAfter}`)
  }
  return resultMessages?.at(-1)?.content || ""
}
