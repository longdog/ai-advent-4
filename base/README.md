# AI Chat with GigaChat

A simple web-based AI chat application powered by Bun, LangChain.js, and GigaChat.

## Features

- Real-time chat interface with AI assistant
- Conversation history maintained during session
- "New Chat" button to reset conversation context
- Built with Bun runtime for high performance
- HTMX for dynamic frontend updates without JavaScript
- Tailwind CSS for responsive styling

## Prerequisites

- Bun runtime installed
- GigaChat API key

## Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Set your GigaChat API key as an environment variable:
   ```bash
   export GIGACHAT_API_KEY="your-api-key-here"
   ```

## Running the Application

Start the server:
```bash
bun run index.ts
```

Access the application at http://localhost:5555

## Project Structure

- `index.ts` - Bun HTTP server, routes, and logic
- `ai.ts` - LangChain + GigaChat initialization and chat function
- `public/index.html` - HTMX-powered frontend
- `public/style.css` - Tailwind CSS styling

## Usage

1. Type your message in the input field at the bottom
2. Click "Send" or press Enter to submit
3. The AI response will appear in the chat history
4. Use "New Chat" button to start a fresh conversation

## How It Works

The application uses:
- Bun as the runtime and HTTP server
- LangChain.js for AI orchestration
- GigaChat as the AI model provider
- HTMX for dynamic HTML updates without writing JavaScript
- Tailwind CSS for styling
- In-memory storage for conversation history