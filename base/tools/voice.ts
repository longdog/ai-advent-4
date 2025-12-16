import { MultiServerMCPClient } from "@langchain/mcp-adapters"

export const mcpClient = new MultiServerMCPClient({
  voiceToText: {
    transport: "stdio",
    command: "uvx",
    args: ["--from", "mcp_voice_salute", "mcp-salutespeech"],
    env: {
      SALUTE_SPEECH: process.env.SALUTE_SPEECH!,
    },
  },
})

export const voiceTool = (await mcpClient.getTools()).at(0)
