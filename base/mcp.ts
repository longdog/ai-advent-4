import { MultiServerMCPClient } from "@langchain/mcp-adapters"

const client = new MultiServerMCPClient({
  notification: {
    transport: "stdio",
    command: "bun",
    args: ["run", "notify-mcp.ts"],
  },
})
export const tools = await client.getTools()
