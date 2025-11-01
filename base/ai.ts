import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";
import { HumanMessage, AIMessage } from "langchain/schema";

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

// Chat function that maintains conversation history
export async function chatWithGigaChat(llm: any, messages: Array<{role: string, content: string}>) {
  // Convert messages to LangChain format
  const langchainMessages = messages.map(msg => {
    if (msg.role === "user") {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });

  try {
    const response = await llm.invoke(langchainMessages);
    return response.content;
  } catch (error) {
    console.error("Error calling GigaChat:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}