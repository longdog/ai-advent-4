import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
// import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import { FaissStore } from "@langchain/community/vectorstores/faiss"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { GigaChatEmbeddings } from "langchain-gigachat"
import { Agent } from "node:https"

const httpsAgent = new Agent({
  rejectUnauthorized: false,
})

const model = new GigaChatEmbeddings({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
})

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

  console.log("Get sources from github...")
  // const githubDocs = await githubLoad(await getGithubUrl())
  console.log("Documents: ", mdDocs.length)
  console.log("Split documents...")
  const chunks = await split([...mdDocs])
  console.log("Chunks: ", chunks.length)
  console.log("Store embeddings...")
  await store(path, chunks)
  console.log("DONE")
}
