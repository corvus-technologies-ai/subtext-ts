# Subtext TypeScript SDK Documentation

Welcome to the Subtext TypeScript SDK documentation! This SDK provides a simple and powerful way to integrate with the Subtext Analytics API from your TypeScript or JavaScript applications.

## What is Subtext?

Subtext is an analytics platform designed to help you track and analyze conversations, messages, and LLM interactions in your applications. The SDK makes it easy to:

- Create and manage conversation threads
- Track user messages
- Record LLM runs and responses
- Analyze conversation patterns and performance

## Quick Navigation

- [Installation Guide](./installation.md) - Get started with installing and setting up the SDK
- [API Reference](./api-reference.md) - Complete reference for all SDK methods and classes
- [Examples](./examples.md) - Practical examples and common usage patterns
- [Error Handling](./error-handling.md) - How to handle errors and exceptions
- [Configuration](./configuration.md) - Configuration options and best practices

## Quick Start

Here's a simple example to get you started:

```typescript
import { SubtextClient } from 'subtext-ts';

// Initialize the client
const client = new SubtextClient({ 
  apiKey: "your-api-key-here" 
});

// Create a conversation thread
const thread = await client.thread({ 
  threadId: "conversation-123" 
});

// Add a user message
const message = await client.message({
  threadId: thread.threadId,
  message: "Hello, how can you help me?",
  messageId: "msg-456"
});

// Record an LLM response
const run = await client.run({
  threadId: thread.threadId,
  runId: "run-789",
  response: "I'm here to help! What would you like to know?"
});

console.log('Conversation tracked successfully!');
```

## Key Concepts

### Threads
Threads represent conversation sessions or chat contexts. Each thread can contain multiple messages and LLM runs.

### Messages
Messages represent user inputs or communications within a thread. They help track what users are saying.

### Runs
Runs represent LLM executions or AI responses within a thread. They help track AI performance and responses.

## Features

- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with specific exception types
- **Retry Logic**: Built-in retry mechanism for failed requests
- **Flexible Configuration**: Customizable timeouts and retry settings
- **Promise-based**: Modern async/await API
- **Lightweight**: Minimal dependencies

## Support

For questions, issues, or feature requests, please refer to:
- [API Reference](./api-reference.md) for detailed method documentation
- [Examples](./examples.md) for common usage patterns
- [Error Handling](./error-handling.md) for troubleshooting

## Next Steps

1. [Install the SDK](./installation.md)
2. [Explore the API Reference](./api-reference.md)
3. [Check out examples](./examples.md)
4. Start building with Subtext!
