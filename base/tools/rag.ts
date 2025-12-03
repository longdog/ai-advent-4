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
export const altTool = tool(
  async ({ query }) => {
    console.log("\n\nSearch query:", query)
    const docs = await vectorStore.similaritySearch(query, 4)
    const serialized = docs
      .map(
        doc =>
          `Source: ${doc.metadata.source}, Page: ${doc.metadata.loc.pageNumber}, Line: ${doc.metadata.loc.lines.from}-${doc.metadata.loc.lines.to}\nContent: ${doc.pageContent}`,
      )
      .join("\n")
    console.log("Search result:", serialized)
    return [serialized, docs]
  },
  {
    name: "altLinux",
    description: "База знаний Alt Linux",
    schema: searchSchema,
    responseFormat: "content_and_artifact",
  },
)
