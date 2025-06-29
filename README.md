# Subtext TypeScript SDK

A TypeScript client library for the Subtext Analytics API.

## Installation

```bash
npm install subtext-ts
```

## Quick Start

```typescript
import { SubtextClient } from 'subtext-ts';

// Initialize the client with your API key
const client = new SubtextClient({ apiKey: "your-api-key-here" });

// Create a thread
const thread = await client.thread({ threadId: "thread-123" });

// Create a message
const message = await client.message({
  threadId: thread.threadId,
  message: "Hello, world!",
  messageId: "msg-456"
});

// Record an LLM run
const run = await client.run({
  threadId: thread.threadId,
  runId: "run-789",
  response: "Hello! How can I help you today?",
});

console.log(message.id);
```

## API Reference

### SubtextClient

#### Constructor

```typescript
new SubtextClient(options: SubtextClientOptions)
```

**Options:**
- `apiKey` (string, required): Your Subtext API key
- `timeout` (number, optional): Request timeout in milliseconds (default: 30000)
- `maxRetries` (number, optional): Maximum number of retries for failed requests (default: 3)

#### Methods

##### `thread(options)`

Create a new thread.

```typescript
const thread = await client.thread({
  threadId: "thread-123",
  userId: "user-456" // Optional
});
```

**Parameters:**
- `threadId` (string, required): A unique identifier for this thread
- `userId` (string, optional): Optional user ID to associate with this thread

**Returns:** `Promise<Thread>`

##### `message(options)`

Create a new user message.

```typescript
const message = await client.message({
  threadId: "thread-123",
  message: "Hello, world!",
  messageId: "msg-456"
});
```

**Parameters:**
- `threadId` (string, required): The ID of the thread to add the message to
- `message` (string, required): The message content
- `messageId` (string, required): A unique identifier for this message

**Returns:** `Promise<Message>`

##### `run(options)`

Create a new run record for LLM calls.

```typescript
const run = await client.run({
  threadId: "thread-123",
  runId: "run-456",
  response: "Hello! How can I help you?"
});
```

**Parameters:**
- `threadId` (string, required): The ID of the thread this run belongs to
- `runId` (string, required): A unique identifier for this run
- `response` (string, required): The LLM response content

**Returns:** `Promise<Run>`

##### `close()`

Close the HTTP client and clean up resources.

```typescript
client.close();
```

### Data Models

#### Thread

Properties:
- `id`: The unique identifier for this thread
- `threadId`: The user-provided thread ID
- `userId`: The user ID associated with this thread (optional)
- `createdAt`: The timestamp when this thread was created
- `modifiedAt`: The timestamp when this thread was last modified

Methods:
- `toDict()`: Convert the thread to a plain object
- `toString()`: Get a string representation of the thread

#### Message

Properties:
- `id`: The unique identifier for this message
- `threadId`: The thread ID this message belongs to
- `message`: The message content
- `messageId`: The user-provided message ID
- `createdAt`: The timestamp when this message was created

Methods:
- `toDict()`: Convert the message to a plain object
- `toString()`: Get a string representation of the message

#### Run

Properties:
- `runId`: The unique identifier for this run
- `threadId`: The thread ID this run belongs to
- `response`: The LLM response content
- `createdAt`: The timestamp when this run was created

Methods:
- `toDict()`: Convert the run to a plain object
- `toString()`: Get a string representation of the run

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  SubtextAPIError,
  SubtextAuthenticationError,
  SubtextValidationError,
  SubtextNotFoundError,
  SubtextServerError,
  SubtextConnectionError,
  SubtextTimeoutError 
} from 'subtext-ts';

try {
  const thread = await client.thread({ threadId: "thread-123" });
} catch (error) {
  if (error instanceof SubtextAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof SubtextValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof SubtextNotFoundError) {
    console.error('Resource not found');
  } else if (error instanceof SubtextServerError) {
    console.error('Server error:', error.statusCode);
  } else if (error instanceof SubtextConnectionError) {
    console.error('Connection error');
  } else if (error instanceof SubtextTimeoutError) {
    console.error('Request timeout');
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Watch mode

```bash
npm run dev
```

## License

ISC
