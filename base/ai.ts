import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

// Create GigaChat client
export function createGigaChatClient() {
  const httpsAgent = new Agent({
    rejectUnauthorized: false,
  });

  const llm = new GigaChat({
    httpsAgent,
    credentials: process.env.GIGACHAT_API_KEY,
  });

  return llm;
}

// Create conversation chain with memory
export function createConversationChain(llm: any) {
  const chain = new ConversationChain({
    llm: llm,
    memory: new BufferMemory(),
  });

  return chain;
}

// Chat function that uses conversation chain with memory
export async function chatWithGigaChat(chain: any, message: string) {
  try {
    const response = await chain.call({ input: message });
    return response.response;
  } catch (error) {
    console.error("Error calling GigaChat:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}