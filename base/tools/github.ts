import { MultiServerMCPClient } from "@langchain/mcp-adapters"

const githubToken = process.env.GITHUB_API_TOKEN!

const client = new MultiServerMCPClient({
  github: {
    url: "https://api.githubcopilot.com/mcp/",
    type: "http",
    headers: {
      Authorization: `Bearer ${githubToken}`,
    },
  },
})

export const githubTools = await client.getTools("github")
