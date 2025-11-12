import { chatWithLLM, createGroqChatClient, systemPrompts } from "./ai"

import markdownit from "markdown-it"
const md = markdownit()

// Helper function to escape HTML
function escapeHtml(text: string): string {
  if (!text) return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
function sseEncode(html: string) {
  // Escape literal newlines inside HTML for SSE framing
  return html
    .replace(/\n/g, "") // remove or collapse newlines
    .replace(/\r/g, "")
}
// Helper function to format chat messages as HTML
function formatMessages(
  messages: Array<{ role: string; content: string }>,
  hideForm: boolean,
): string {
  if (messages.length === 0) {
    return `<div class="text-center text-gray-500 py-8">
              <p>Начните диалог с AI помощником</p>
            </div>`
  }
  const formAttribute = hideForm ? 'data-hide-form="true"' : ""
  return messages
    .map(msg => {
      const escapedContent = escapeHtml(msg.content)
      if (msg.role === "user") {
        return `<div class="message user-message mb-5">
                <div class="font-semibold mb-1">Вы</div>
                <div>${escapedContent}</div>
              </div>`
      } else {
        return `<div class="message ai-message mb-5" ${formAttribute}>
                <div class="font-semibold mb-1">${msg.role}</div>
                <div>${toMarkdown(escapedContent)}</div>
              </div>`
      }
    })
    .join("")
}

function toMarkdown(text: string) {
  return md.render(text)
}

async function* chat(question: string) {
  const answers = []
  for (const systemPrompt of systemPrompts) {
    // const llm = createGigaChatClient(
    const llm = createGroqChatClient(
      systemPrompt.expert,
      systemPrompt.model,
      systemPrompt.temperature,
      systemPrompt.maxTokens,
    )
    const start = Date.now()
    const response = await chatWithLLM(
      llm,
      systemPrompt.prompt,
      systemPrompt.userPrompt,
    )

    const time = Date.now() - start
    const tokens = `Input: ${response.usage_metadata.input_tokens} Output: ${response.usage_metadata.output_tokens}, Total: ${response.usage_metadata.total_tokens}`

    answers.push({
      expert: systemPrompt.expert,
      answer: response.content,
      tokens,
      time,
    })
    yield {
      expert: systemPrompt.expert,
      answer: response.content,
      tokens,
      time,
    }
    await Bun.sleep(2000)
  }
}

console.log("Starting server on http://localhost:5555")

Bun.serve({
  port: 5555,
  idleTimeout: 0,
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
    if (url.pathname === "/chat-stream" && req.method === "GET") {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()

          // Stream each message chunk from your LLM or generator
          for await (const { expert, answer, tokens, time } of chat("")) {
            const htmlChunk = formatMessages(
              [
                {
                  role: expert,
                  content:
                    answer +
                    (tokens && time
                      ? `\n\n${tokens}\n\nresponse time: ${time}`
                      : ""),
                },
              ],
              false,
            )

            controller.enqueue(
              encoder.encode(`data: ${sseEncode(htmlChunk)}\n\n`),
            )
            // Flush after each chunk
            await new Promise(r => setTimeout(r, 10))
          }
          controller.enqueue(encoder.encode(`event: end\ndata: done\n\n`))
          controller.close()
        },
      })
      // Stream response
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // Handle new chat
    if (url.pathname === "/new-chat" && req.method === "POST") {
      return new Response("", {
        headers: {
          "Content-Type": "text/html",
        },
      })
    }

    // 404 for other routes
    return new Response("Not Found", { status: 404 })
  },
})
