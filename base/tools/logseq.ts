import { MultiServerMCPClient } from "@langchain/mcp-adapters"

export const mcpClient = new MultiServerMCPClient({
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

export const logseqTool = (await mcpClient.getTools()).at(0)
