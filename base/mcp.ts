import { MultiServerMCPClient } from "@langchain/mcp-adapters"

export const client = new MultiServerMCPClient({
  notification: {
    transport: "stdio",
    command: "./notify-mcp.sh",
    args: [],
  },
  news: {
    transport: "stdio",
    command: "bun",
    args: ["run", "feed-mcp.ts"],
    defaultToolTimeout: 20000,
    restart: {
      enabled: true,
      delayMs: 1000,
      maxAttempts: 3,
    },
  },
  logseq: {
    transport: "stdio",
    command: "bun",
    args: ["run", "logseq-mcp-tools/index.ts"],
    env: {
      LOGSEQ_TOKEN: process.env.LOGSEQ_API_TOKEN!,
      LOGSEQ_API_URL: "http://localhost:12315",
    },
  },
})

export const tools = await client.getTools()
