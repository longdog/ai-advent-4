import { parseFeed } from "@rowanmanning/feed-parser"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { $ } from "bun"

async function feed(url: string) {
  try {
    await $`echo "feed ${url}">>/home/denis/feed.log`
    const response = await fetch(url)
    const text = await response.text()
    // await $`echo "rest: ${text}">>/home/denis/feed.log`
    const feed = parseFeed(text)
    const titles = feed.items.map(item => item.title).slice(0, 20)
    await $`echo "titles: ${titles.join(", ")}">>/home/denis/feed.log`
    return titles.join("\n\n")
  } catch (error) {
    await $`echo "error ${error.message}">>/home/denis/feed.log`
    return ""
  }
}
const server = new McpServer({
  name: "news-server",
  version: "0.1.0",
  title: "News MCP Server",
})

server.registerTool(
  "getLentaNews",
  {
    title: "Get Lenta news",
    description: "Get news from Lenta",
    inputSchema: {},
  },
  async () => {
    const output = await feed("https://lenta.ru/rss")
    return {
      content: [{ type: "text", text: output }],
    }
  },
)
server.registerTool(
  "getSputnikNews",
  {
    title: "Get Sputnik news",
    description: "Get news from Sputnik",
    inputSchema: {},
  },
  async () => {
    const output = await feed(
      "https://radiosputnik.ru/export/rss2/archive/index.xml",
    )
    return {
      content: [{ type: "text", text: output }],
    }
  },
)
server.registerTool(
  "getRiaNews",
  {
    title: "Get RIA news",
    description: "Get news from RIA",
    inputSchema: {},
  },
  async () => {
    await $`echo "feed ria">>/home/denis/feed.log`
    const output = await feed("https://ria.ru/export/rss2/archive/index.xml")
    return {
      content: [{ type: "text", text: output }],
    }
  },
)
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log("News MCP server running on stdio")
}

main()
