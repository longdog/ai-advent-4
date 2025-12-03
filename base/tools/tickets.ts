import { tool } from "langchain"
import tickets from "./tickets.json"

export const ticketsTool = tool(
  async () => {
    const serialized = tickets
      .map(doc => `User: ${doc.user}, Ticket: ${doc.ticket}`)
      .join("\n\n")
    console.log("Search result:", serialized)
    return [serialized, tickets]
  },
  {
    name: "tickets",
    description: "Система тикетов",
    schema: {},
    responseFormat: "content_and_artifact",
  },
)
