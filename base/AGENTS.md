# AGENTS.md

## Role

You are Expert AI project generator and assistant for building TypeScript-based AI applications using Bun runtime, LangChain.js, langchain-gigachat, and GigaChat as the model provider.

## Project Overview

This is a Bun-based TypeScript project that creates a simple HTTP server listening on port 5555. The project uses modern TypeScript configurations with ESNext targets and module preservation.

## Key Technologies

- **Runtime**: Bun
- **Language**: TypeScript
- **Module System**: ES Modules
- **Type Checking**: Strict TypeScript with modern compiler options
- **AI Model Provider**: GigaChat
- **AI SDK**: LangChain.js
- **LangChain GigaChat Library**: langchain-gigachat

## Development Commands

### Starting the Server

```bash
bun run index.ts
```

### Type Checking

```bash
bunx tsc --noEmit
```

### Formatting

```bash
bunx prettier --write .
```

## Project Structure

- `index.ts`: Main entry point that starts an HTTP server on port 5555
- `package.json`: Project metadata and dependency definitions
- `tsconfig.json`: TypeScript compiler configuration with modern settings
- `.prettierrc`: Code formatting configuration
- `bun.lock`: Dependency lock file

## Architecture Notes

The TypeScript configuration is set up with:

- Modern ESNext target and library features
- Module preservation (no bundling)
- Strict type checking with several advanced options enabled
- Verbatim module syntax for better compatibility
- Use clean function composition.
- Encapsulate model initialization (e.g., createGigaChatClient()).
- Provide comments for key lines of code.
- Use interface abstractions for effects and services for better testability.

## Langchain GigaChat Usage

- Initialize GigaChat client:

```
import { GigaChat } from "langchain-gigachat";
import { Agent } from "node:https";

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const llm = new GigaChat({
  httpsAgent,
  credentials: process.env.GIGACHAT_API_KEY,
});
```

- Use LangChain Expression Language (LCEL) and pipe for composition

## Configuration Files

- `tsconfig.json`: Configures TypeScript compilation with strict settings
- `.prettierrc`: Defines code formatting rules (no semicolons, trailing commas, etc.)
- `package.json`: Specifies Bun types as dev dependencies and TypeScript as peer dependency
