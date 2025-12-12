import { MemorySaver } from "@langchain/langgraph"
import { ChatOllama } from "@langchain/ollama"
import { createAgent, ReactAgent } from "langchain"
const systemPrompt = `You are a sports analytics assistant.  
Below is a static dataset of athletes.  
Use it to answer all future questions.  
Do not modify the dataset.  
Do not hallucinate values.
## DATASET BEGIN
[
  {
    "name": "Rudzma Abubakar","gender": "Female","delegation": "Philippines","division": "S 16-40 Female -48kg"
  },
  {
    "name": "Kim Ryan Asense","gender": "Male","delegation": "Philippines","division": "S 16-40 Male -63.5kg"
  },
  {
    "name": "Saksit Atidsam","gender": "Male","delegation": "Thailand","division": "S 16-40 Male -60kg"
  },
  {
    "name": "Damia Husna Azian","gender": "Female","delegation": "Malaysia","division": "S 16-40 Female -45kg"
  },
  {
    "name": "Thang Bang Quang","gender": "Male","delegation": "Vietnam","division": "S 16-40 Male -71kg"
  },
  {
    "name": "Galih Bangkit Permadi","gender": "Male","delegation": "Indonesia","division": "S 16-40 Male -48kg"
  },
  {
    "name": "Duong Duc Bao","gender": "Male","delegation": "Vietnam","division": "S 16-40 Male -48kg"
  },
  {
    "name": "Ahmad Nor Iman Aliff Bin Rakib","gender": "Male","delegation": "Malaysia","division": "S 16-40 Male -60kg"
  },
  {
    "name": "Mohamad Shahrul hakim Bin Rosli","gender": "Male","delegation": "Malaysia","division": "S 16-40 Male -71kg"
  },
  {
    "name": "Wassof Bin Rumijam","gender": "Male","delegation": "Malaysia","division": "S 16-40 Male -54kg"
  },
  {
    "name": "Muhammad Mikail Ghazali Bin Zulfikar","gender": "Male","delegation": "Malaysia","division": "S 16-40 Male -57kg"
  },
  {
    "name": "Nur Amisha Binti Azrilrizal","gender": "Female","delegation": "Malaysia","division": "S 16-40 Female -51kg"
  }
]
## DATASET END

Division format rules:
- Example: "S 16-40 Female -51kg"
  * Group type: Senior (S)
  * Age group: 16-40
  * Gender: Female
  * Weight class: -51kg

Important rules:
- Always base your answers strictly on the dataset inside DATASET BEGIN/END.
- Never invent or guess missing information.
- Treat the JSON dataset as read-only.
- Always recount from scratch when answering queries.
`

export function createOlamaClient() {
  const checkpointer = new MemorySaver()
  const model = new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL!,
    temperature: 0.4,
    model: "gemma3:4b-it-q4_K_M",
  })
  const agent = createAgent({
    model,
    checkpointer,
    systemPrompt,
  })
  return agent
}

export async function olamaChat(
  agent: ReactAgent,
  chatId: string,
  messages: string,
) {
  const result = await agent.invoke(
    {
      messages,
    },
    {
      configurable: { thread_id: new Date().toISOString() },
    },
  )

  const { messages: resultMessages } = result
  return resultMessages?.at(-1)?.content || "Нет ответа"
}
