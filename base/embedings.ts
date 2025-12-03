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
    chunkSize: 500,
    chunkOverlap: 100,
  })
  const chunks = await splitter.splitDocuments(documents)
  return chunks
}

async function generateVector() {
  console.log("Load Pdf...")
  const documents = await loadPdf("./alt.pdf")
  console.log("Documents: ", documents.length)
  console.log("Split Pdf...")
  const chunks = await split(documents)
  console.log("Chunks: ", chunks.length)
  console.log("Store embeddings...")
  await store(chunks)
  console.log("DONE")
}
if (import.meta.main) {
  generateVector()
}
