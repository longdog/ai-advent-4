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
import { summaryPrompt, systemPrompt } from "./prompts"

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
    model: "GigaChat-Pro",
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
    middleware: withSummary
      ? [
          summarizationMiddleware({
            model: summarizationModel,
            trigger: { messages: 5 },
            keep: { messages: 3 },
            summaryPrompt,
          }),
        ]
      : [],
  })
  return agent
}

export async function chatWithAgent(agent: ReactAgent, chat: Chat) {
  const totalTokensBefore = countTokensApproximately(chat.history)
  // console.log("HISTORY", chat)

  const result = await agent.invoke({
    messages: chat.history,
  })

  const resultMessages = result.messages
  // console.log("RESULT", resultMessages)

  const totalTokensAfter = countTokensApproximately(resultMessages)
  const systemMessage = resultMessages[0]
  if (resultMessages.length < chat.history.length) {
    console.log("SUMMARIZATION TRIGGERED")
    console.log("SUMMARIZATION MESSAGE")
    console.log(systemMessage.content)
    console.log("SUMMARIZATION INFO")
    console.log(
      `Number of messages before summarization: ${chat.history.length}`,
    )
    console.log(
      `Number of messages after summarization: ${resultMessages.length}`,
    )
    console.log(`Tokens before summarization: ${totalTokensBefore}`)
    console.log(`Tokens after summarization: ${totalTokensAfter}`)
  }
  chat.update(resultMessages)
  return resultMessages.at(-1).content || ""
}
