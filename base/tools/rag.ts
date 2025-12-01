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

const searchSchema = z.object({
  query: z.string(),
})

export async function createProjectTool(path: string) {
  const vectorStore = await FaissStore.load(path + "/faiss_store", model)

  return tool(
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
      name: "documentation",
      description: "Документация к проекту - Project Documentation",
      schema: searchSchema,
      responseFormat: "content_and_artifact",
    },
  )
}
