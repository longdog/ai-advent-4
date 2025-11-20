import { parseFeed } from "@rowanmanning/feed-parser"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

async function feed() {
  try {
    const response = await fetch("https://ria.ru/export/rss2/archive/index.xml")
    const feed = parseFeed(await response.text())
    const titles = feed.items.map(item => item.title)
    return titles.join("\n\n")
  } catch (error) {
    console.log("ERROR", error)
    return ""
  }
}
const server = new McpServer({
  name: "news-server",
  version: "0.1.0",
})

server.registerTool(
  "getDailyNews",
  {
    title: "Get daily news",
    description: "Get daily news from RIA.RU",
    inputSchema: {},
  },
  async () => {
    const output = await feed()
    return {
      content: [{ type: "text", text: output }],
    }
  },
)

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log("Ria News MCP server running on stdio")
}

main()
