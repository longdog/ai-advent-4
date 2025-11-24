import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
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

async function store(documents: any) {
  const vectorStore = await FaissStore.fromDocuments(documents, model)
  await vectorStore.save("./faiss_store")
}

async function loadPdf(pdfPath: string) {
  const loader = new PDFLoader(pdfPath)
  const documents = await loader.load()
  return documents
}

type PdfDocument = Awaited<ReturnType<typeof loadPdf>>

async function split(documents: PdfDocument) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 0,
  })
  const chunks = await splitter.splitDocuments(documents)
  return chunks
}

async function main() {
  console.log("Load Pdf...")
  const documents = await loadPdf("./sea.pdf")
  console.log("Documents: ", documents.length)
  console.log("Split Pdf...")
  const chunks = await split(documents)
  console.log("Chunks: ", chunks.length)
  console.log("Store embeddings...")
  await store(chunks)
  console.log("DONE")
}
if (import.meta.main) {
  main()
}
