import { z } from "zod/mini"
import { chatWithGigaChat, createGigaChatClient } from "./ai"

// Initialize GigaChat client
const llm = createGigaChatClient()

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

const format = z.object({
  существительное: z.number(),
  глагол: z.number(),
  прилагательное: z.number(),
  наречие: z.number(),
  местоимение: z.number(),
  предлог: z.number(),
  союз: z.number(),
  частица: z.number(),
  междометие: z.number(),
})

function validate(jsonText: string) {
  console.log("llm output", jsonText)

  const result = format.safeParse(JSON.parse(jsonText))

  if (!result.success) {
    console.log("Validation failed", result.error)
    return
  }

  console.log("Validation passed by ZOD", result.data)
}

// Helper function to format chat messages as HTML
function formatMessages(
  messages: Array<{ role: string; content: string }>,
): string {
  if (messages.length === 0) {
    return `<div class="text-center text-gray-500 py-8">
              <p>Start a conversation with the AI assistant</p>
            </div>`
  }

  return messages
    .map(msg => {
      const escapedContent = escapeHtml(msg.content)
      if (msg.role === "user") {
        return `<div class="message user-message">
                <div class="font-semibold mb-1">You</div>
                <div>${escapedContent}</div>
              </div>`
      } else {
        return `<div class="message ai-message">
                <div class="font-semibold mb-1">AI Assistant</div>
                <div><pre><code class="language-json">${escapedContent}</code></pre></div>
              </div>`
      }
    })
    .join("")
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

      console.log("User message:", userMessage)

      // Get AI response using conversation chain with memory
      const aiResponse = await chatWithGigaChat(llm, userMessage)

      validate(aiResponse)

      // Prepare response with both messages
      const messagesHtml = formatMessages([
        { role: "user", content: userMessage },
        { role: "assistant", content: aiResponse },
      ])

      // Set session ID in response cookie
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
