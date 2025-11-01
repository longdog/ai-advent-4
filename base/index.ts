import { chatWithGigaChat, createGigaChatClient, createConversationChain } from "./ai"

// Initialize GigaChat client
const llm = createGigaChatClient()

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
                <div>${escapedContent}</div>
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

      console.log("Session ID from cookie:", sessionId)

      if (!sessionId || !conversationChains.has(sessionId)) {
        sessionId = generateSessionId()
        const chain = createConversationChain(llm)
        conversationChains.set(sessionId, chain)
      }

      const chain = conversationChains.get(sessionId)!

      console.log("User message:", userMessage)

      // Get AI response using conversation chain with memory
      const aiResponse = await chatWithGigaChat(chain, userMessage)

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

      // Return empty chat interface
      const emptyHtml = formatMessages([])
      return new Response(emptyHtml, {
        headers: {
          "Content-Type": "text/html",
          "Set-Cookie":
            "session_id=; Path=/; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        },
      })
    }

    // 404 for other routes
    return new Response("Not Found", { status: 404 })
  },
})
