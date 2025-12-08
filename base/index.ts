import markdownit from "markdown-it"
import { annotateChat } from "./models/annotate"
import { authorChat, createAuthorClient } from "./models/author"
import { genresChat } from "./models/genres"
import { createImageChat } from "./models/image"
import { createCover } from "./tools/cover"
import { saveText } from "./tools/doc"
const md = markdownit()

async function publishBook(text: string) {
  console.log(text)
  const [titleLine, ...rest] = text
    .replace("**КОНЕЦ**", "")
    .replace("**СЦЕНАРИЙ**", "")
    .split("\n")
    .filter(l => l.trim() !== "")
  const title = titleLine?.replace("#", "").trim()
  if (!title) {
    throw new Error("Title not found")
  }
  const body = rest.join("\n")
  if (!body) {
    throw new Error("Body not found")
  }
  await saveText("title.md", title)
  console.log("Название сохранено в book/title.md")
  await saveText("book.md", body)
  console.log("Книга сохранена в book/book.md")
  // await saveDocx("book.md")
  // console.log("Книга сконвертирована в docx book/book.docx")
  const annotation = await annotateChat(body)
  await saveText("annotation.md", annotation)
  console.log("Аннотация сохранена в book/annotation.md")
  const genres = await genresChat(body)
  await saveText("genres.md", genres.toString())
  console.log("Жанры сохранены в book/genres.md")
  await createImageChat(annotation)
  await createCover()
}

// Initialize GigaChat client
const llmSummary = createAuthorClient()

// In-memory storage for conversation chains (in a real app, you'd use a database)
const conversationChains = new Map<string, any>()

// Helper function to generate a simple session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Helper function to format chat messages as HTML
function formatMessages(
  messages: Array<{ role: string; content: string }>,
  hideForm: boolean,
): string {
  if (messages.length === 0) {
    return `<div class="text-center text-gray-500 py-8">
              <p>Start a conversation with the AI assistant</p>
            </div>`
  }
  const formAttribute = hideForm ? 'data-hide-form="true"' : ""
  return messages
    .map(msg => {
      const escapedContent = escapeHtml(msg.content)
      if (msg.role === "user") {
        return `<div class="message user-message">
                <div class="font-semibold mb-1">Вы</div>
                <div>${escapedContent}</div>
              </div>`
      } else {
        return `<div class="message ai-message" ${formAttribute}>
                <div class="font-semibold mb-1">AI</div>
                <div>${toMarkdown(escapedContent)}</div>
              </div>`
      }
    })
    .join("")
}

function toMarkdown(text: string) {
  return md.render(text)
}
console.log("Starting server on http://localhost:5555")

Bun.serve({
  port: 5555,
  async fetch(req) {
    const url = new URL(req.url)

    // Serve static files
    if (url.pathname === "/") {
      return new Response(Bun.file("./public/index.html"), {
        headers: { "Content-Type": "text/html" },
      })
    }

    if (url.pathname === "/style.css") {
      return new Response(Bun.file("./public/style.css"), {
        headers: { "Content-Type": "text/css" },
      })
    }

    // Handle chat messages
    if (url.pathname === "/chat" && req.method === "POST") {
      const formData = await req.formData()
      const userMessage = formData.get("message") as string

      if (!userMessage) {
        return new Response("Message is required", { status: 400 })
      }

      // Get or create session ID from cookies
      let sessionId: string | null = null
      const cookieHeader = req.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").map(cookie => cookie.trim())
        const sessionCookie = cookies.find(cookie =>
          cookie.startsWith("session_id="),
        )
        if (sessionCookie) {
          sessionId = sessionCookie.split("=")[1] || null
        }
      }

      console.log("Session ID from cookie:", sessionId)

      // if (!sessionId || !conversationChains.has(sessionId)) {
      //   sessionId = generateSessionId()
      //   const chat = createChat(sessionId)
      //   conversationChains.set(sessionId, chat)
      // }

      if (!sessionId) {
        return new Response("Session not found", { status: 404 })
      }

      // Get AI response using conversation chain with memory
      const aiResponse = (await authorChat(
        llmSummary,
        sessionId,
        userMessage,
      )) as string

      // Prepare response with both messages
      const messagesHtml = formatMessages(
        [
          { role: "user", content: userMessage },
          { role: "assistant", content: aiResponse },
        ],
        aiResponse.includes("КОНЕЦ"),
      )
      // Set session ID in response cookie
      return new Response(messagesHtml, {
        headers: {
          "Content-Type": "text/html",
          "Set-Cookie": `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict`,
        },
      })
    }

    // Handle new chat
    if (url.pathname === "/new-chat" && req.method === "POST") {
      // Clear conversation chain for this session
      let sessionId: string | null = null
      const cookieHeader = req.headers.get("cookie")
      if (cookieHeader) {
        const cookies = cookieHeader.split(";").map(cookie => cookie.trim())
        const sessionCookie = cookies.find(cookie =>
          cookie.startsWith("session_id="),
        )
        if (sessionCookie) {
          sessionId = sessionCookie.split("=")[1] || null
        }
      }

      if (sessionId && conversationChains.has(sessionId)) {
        conversationChains.delete(sessionId)
      }

      sessionId = generateSessionId()

      const aiResponse = (await authorChat(llmSummary, sessionId, "")) as string

      // Prepare response with both messages
      const messagesHtml = formatMessages(
        [{ role: "assistant", content: aiResponse }],
        false,
      )
      return new Response(messagesHtml, {
        headers: {
          "Content-Type": "text/html",
          "Set-Cookie": `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Strict`,
        },
      })
    }

    // 404 for other routes
    return new Response("Not Found", { status: 404 })
  },
})
