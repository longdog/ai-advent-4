import { MultiServerMCPClient } from "@langchain/mcp-adapters"

const client = new MultiServerMCPClient({
  logseq: {
    transport: "stdio",
    command: "uv",
    args: ["run", "--with", "mcp-logseq", "mcp-logseq"],
    env: {
      LOGSEQ_API_TOKEN: process.env.LOGSEQ_API_TOKEN!,
      LOGSEQ_API_URL: "http://localhost:12315",
    },
  },
})
export const tools = await client.getTools()

console.log("LOGSEQ MCP")

tools.forEach(tool => {
  console.log(tool.getName())
  console.log(tool.description)
})
