import { tool } from "langchain"
import { z } from "zod"

const ticketPrioritySchema = z
  .enum(["high", "medium", "low"])
  .describe("Приоритет тикета: high, medium, low")

const ticketSchema = z.object({
  user: z.string().describe("Автор тикета"),
  priority: ticketPrioritySchema,
  ticket: z.string().describe("Текст тикета"),
})

const ticketsSchema = z.array(ticketSchema)

async function getTickets() {
  const file = Bun.file("./tickets.json")
  const content = await file.text()
  return ticketsSchema.parse(JSON.parse(content))
}

async function addTicket(ticket: z.infer<typeof ticketSchema>) {
  const file = Bun.file("./tickets.json")
  const content = await file.text()
  const tickets = ticketsSchema.parse(JSON.parse(content))
  tickets.push(ticket)
  await file.write(JSON.stringify(tickets))
}

const allTicketsTool = tool(
  async () => {
    const tickets = await getTickets()
    const serialized = tickets
      .map(
        ({ user, priority, ticket }) =>
          `User: ${user}, Priority: ${priority}, Ticket: ${ticket}`,
      )
      .join("\n\n")
    console.log("Search result:", serialized)
    return [serialized, tickets]
  },
  {
    name: "allTickets",
    description: "Tickets: Показать все тикеты",
    schema: z.object({}),
    responseFormat: "content_and_artifact",
  },
)

const getTicketsSchema = z.object({
  priority: ticketPrioritySchema,
})
const getTicketsTool = tool(
  async ({ priority }) => {
    const tickets = (await getTickets()).filter(
      ({ priority: p }) => p === priority,
    )
    const serialized = tickets
      .map(
        ({ user, priority, ticket }) =>
          `User: ${user}, Priority: ${priority}, Ticket: ${ticket}`,
      )
      .join("\n\n")
    console.log("Search result:", serialized)
    return [serialized, tickets]
  },
  {
    name: "getTickets",
    description: "Tickets: Получить тикеты по приоритету (high, medium, low)",
    schema: getTicketsSchema,
    responseFormat: "content_and_artifact",
  },
)

const addTicketSchema = z.object({
  priority: ticketPrioritySchema,
  ticket: z.string(),
  user: z.string(),
})
const addTicketTool = tool(
  async ({ priority, ticket, user }) => {
    await addTicket({ priority, ticket, user })
    return "Ticket added"
  },
  {
    name: "addTicket",
    description: "Tickets: Добавить тикет",
    schema: addTicketSchema,
    responseFormat: "content_and_artifact",
  },
)

export const ticketsTools = [allTicketsTool, getTicketsTool, addTicketTool]
