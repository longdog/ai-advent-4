import { MultiServerMCPClient } from "@langchain/mcp-adapters"

const client = new MultiServerMCPClient({
  notification: {
    transport: "stdio",
    command: "./notify-mcp.sh",
    args: [],
  },
  news: {
    transport: "stdio",
    command: "bun",
    args: ["run", "feed-mcp.ts"],
  },
})
export const tools = await client.getTools()
