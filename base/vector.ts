import { FaissStore } from "@langchain/community/vectorstores/faiss"
import { tool } from "langchain"
import { GigaChatEmbeddings } from "langchain-gigachat"
import { Agent } from "node:https"
import { z } from "zod"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
})

const vectorStore = await FaissStore.load("./faiss_store", model)

const searchSchema = z.object({
  query: z.string(),
})
export const marineTool = tool(
  async ({ query }) => {
    console.log("Search query:", query)
    const docs = await vectorStore.similaritySearch(query, 2)
    const serialized = docs
      .map(doc => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`)
      .join("\n")
    console.log("Search result:", serialized)
    return [serialized, docs]
  },
  {
    name: "marine",
    description: "Поис информации по запросу о морских воинских званиях.",
    schema: searchSchema,
    responseFormat: "content_and_artifact",
  },
)
