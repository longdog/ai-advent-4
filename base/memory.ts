import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres"
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite"
import type { BaseMessage } from "langchain"
import path from "path"

const createCheckpointer = async () => {
  const checkpointer = PostgresSaver.fromConnString(Bun.env.DATABASE_URL!)
  await checkpointer.setup()
  return checkpointer
}

export const checkpointer = await createCheckpointer()

export function createSqliteMemory(): SqliteSaver {
  const dbPath = path.resolve(import.meta.dir, "memory.db")
  return SqliteSaver.fromConnString(dbPath)
}

/**
 * Retrieves the message history for a specific thread.
 * @param threadId - The ID of the thread to retrieve history for.
 * @returns An array of messages associated with the thread.
 */
export const getHistory = async (threadId: string): Promise<BaseMessage[]> => {
  const history = await checkpointer.get({
    configurable: { thread_id: threadId },
  })
  return Array.isArray(history?.channel_values?.messages)
    ? history.channel_values.messages
    : []
}
