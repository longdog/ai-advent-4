import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
// import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import { FaissStore } from "@langchain/community/vectorstores/faiss"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { GigaChatEmbeddings } from "langchain-gigachat"
import fs from "node:fs"
import { Agent } from "node:https"
import path from "node:path"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
})

// recursively scan directory
async function scanFiles(dir: string, ext: string): Promise<Document> {
  let results: Document = []

  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (!fullPath.includes("node_modules")) {
        results = results.concat(await scanFiles(fullPath, ext))
      }
    } else if (file.endsWith(ext)) {
      console.log("Read file", fullPath)
      const loader = new TextLoader(fullPath)
      const documents = await loader.load()
      results.push(...documents)
    }
  }
  return results
}

async function store(path: string, documents: any) {
  const vectorStore = await FaissStore.fromDocuments(documents, model)
  await vectorStore.save(path + "/faiss_store")
}

// async function getGithubUrl() {
//   const ret = await $`git config --get remote.origin.url`
//   return ret.text()
// }

// async function githubLoad(url: string) {
//   const loader = new GithubRepoLoader(url, {
//     branch: "main",
//     recursive: false,
//     unknown: "warn",
//     maxConcurrency: 5, // Defaults to 2
//     ignorePaths: ["*.md"],
//   })
//   const docs = await loader.load()
//   return docs
// }

async function markdownLoad(path: string) {
  const loader = new TextLoader(path)
  const documents = await loader.load()
  return documents
}

type Document = Awaited<ReturnType<typeof markdownLoad>>

async function split(documents: Document) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  })
  const chunks = await splitter.splitDocuments(documents)
  return chunks
}
export async function generateVector(path: string) {
  console.log("Get README data...")
  const mdDocs = await markdownLoad(path + "/README.md")

  const projectDir = process.cwd()
  console.log("Get sources...", projectDir)
  const tsFiles = await scanFiles(projectDir, ".ts")
  console.log("Documents: ", tsFiles.length + mdDocs.length)
  console.log("Split documents...")
  const chunks = await split([...mdDocs, ...tsFiles])
  console.log("Chunks: ", chunks.length)
  console.log("Store embeddings...")
  await store(path, chunks)
  console.log("DONE")
}
