async function notify(message: string) {
  const env = {
    ...process.env,
    DBUS_SESSION_BUS_ADDRESS:
      process.env.DBUS_SESSION_BUS_ADDRESS ||
      `unix:path=/run/user/${process.getuid()}/bus`,
  }
  await $`notify-send "Daily News" "${message}"`.env(env)
  return `${message} sent`
}

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { $ } from "bun"

const server = new Server(
  {
    name: "notification-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "show",
        description: "show notification",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Message to show",
            },
          },
          required: ["message"],
        },
      },
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async request => {
  switch (request.params.name) {
    case "show": {
      const { message } = request.params.arguments as { message: string }
      return {
        content: [
          {
            type: "text",
            text: await notify(message),
          },
        ],
      }
    }
    default:
      throw new Error(`Unknown tool: ${request.params.name}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.log("Notification MCP server running on stdio")
}

main()
