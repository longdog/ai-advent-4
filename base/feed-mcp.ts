import { parseFeed } from "@rowanmanning/feed-parser"

// import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"

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
    description: "Get daily news",
  },
  async () => {
    const output = await feed()
    return {
      content: [{ type: "text", text: output }],
    }
  },
)

// server.setRequestHandler(ListToolsRequestSchema, async () => {
//   return {
//     tools: [
//       {
//         name: "get",
//         description: "get daily news",
//       },
//     ],
//   }
// })

// server.setRequestHandler(CallToolRequestSchema, async request => {
//   switch (request.params.name) {
//     case "get": {
//       return {
//         content: [
//           {
//             type: "text",
//             text: await feed(),
//           },
//         ],
//       }
//     }
//     default:
//       throw new Error(`Unknown tool: ${request.params.name}`)
//   }
// })

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log("News MCP server running on stdio")
}

main()
