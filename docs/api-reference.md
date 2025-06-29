# API Reference

Complete reference documentation for the Subtext TypeScript SDK.

## SubtextClient

The main client class for interacting with the Subtext API.

### Constructor

```typescript
new SubtextClient(options: SubtextClientOptions)
```

#### SubtextClientOptions

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your Subtext API key |
| `timeout` | number | No | `30000` | Request timeout in milliseconds |
| `maxRetries` | number | No | `3` | Maximum number of retries for failed requests |

#### Example

```typescript
import { SubtextClient } from '@subtextai/subtext';

const client = new SubtextClient({
  apiKey: "your-api-key-here"
});
```

### Methods

#### thread(options)

Create a new thread.

```typescript
async thread(options: {
  threadId: string;
  userId?: string;
}): Promise<Thread>
```

**Parameters:**
- `threadId` (string, required): Unique identifier for the thread
- `userId` (string, optional): User ID associated with the thread

**Returns:** Promise that resolves to a `Thread` object

**Throws:**
- `SubtextValidationError`: If required fields are missing or invalid
- `SubtextAuthenticationError`: If the API key is invalid
- `SubtextServerError`: If there's a server error
- `SubtextConnectionError`: If there's a connection error
- `SubtextTimeoutError`: If the request times out

**Example:**

```typescript
const thread = await client.thread({
  threadId: "conversation-123",
  userId: "user-456"
});
```

#### message(options)

Create a new user message.

```typescript
async message(options: {
  threadId: string;
  message: string;
  messageId: string;
}): Promise<Message>
```

**Parameters:**
- `threadId` (string, required): ID of the thread this message belongs to
- `message` (string, required): The message content
- `messageId` (string, required): Unique identifier for the message

**Returns:** Promise that resolves to a `Message` object

**Throws:**
- `SubtextValidationError`: If required fields are missing or invalid
- `SubtextAuthenticationError`: If the API key is invalid
- `SubtextNotFoundError`: If the thread doesn't exist
- `SubtextServerError`: If there's a server error
- `SubtextConnectionError`: If there's a connection error
- `SubtextTimeoutError`: If the request times out

**Example:**

```typescript
const message = await client.message({
  threadId: "conversation-123",
  message: "Hello, how can you help me?",
  messageId: "msg-456"
});
```

#### run(options)

Create a new run record for LLM calls.

```typescript
async run(options: {
  threadId: string;
  runId: string;
  response: string;
}): Promise<Run>
```

**Parameters:**
- `threadId` (string, required): ID of the thread this run belongs to
- `runId` (string, required): Unique identifier for the run
- `response` (string, required): The LLM response content

**Returns:** Promise that resolves to a `Run` object

**Throws:**
- `SubtextValidationError`: If required fields are missing or invalid
- `SubtextAuthenticationError`: If the API key is invalid
- `SubtextNotFoundError`: If the thread doesn't exist
- `SubtextServerError`: If there's a server error
- `SubtextConnectionError`: If there's a connection error
- `SubtextTimeoutError`: If the request times out

**Example:**

```typescript
const run = await client.run({
  threadId: "conversation-123",
  runId: "run-789",
  response: "I'm here to help! What would you like to know?"
});
```

## Data Models

### Thread

Represents a conversation thread.

#### Properties

- `id` (string): The unique identifier for this thread
- `threadId` (string): The user-provided thread ID
- `userId` (string | undefined): The user ID associated with this thread
- `createdAt` (string): The timestamp when this thread was created
- `modifiedAt` (string): The timestamp when this thread was last modified

#### Methods

- `toDict()`: Convert the thread to a plain object
- `toString()`: String representation of the thread

### Message

Represents a user message.

#### Properties

- `id` (string): The unique identifier for this message
- `threadId` (string): The thread ID this message belongs to
- `message` (string): The message content
- `messageId` (string): The user-provided message ID
- `createdAt` (string): The timestamp when this message was created

#### Methods

- `toDict()`: Convert the message to a plain object
- `toString()`: String representation of the message

### Run

Represents an LLM run.

#### Properties

- `runId` (string): The unique identifier for this run
- `threadId` (string): The thread ID this run belongs to
- `response` (string): The LLM response content
- `createdAt` (string): The timestamp when this run was created

#### Methods

- `toDict()`: Convert the run to a plain object
- `toString()`: String representation of the run

## Type Definitions

### Request Types

```typescript
interface CreateThreadRequest {
  thread_id: string;
  user_id?: string;
}

interface CreateMessageRequest {
  thread_id: string;
  message: string;
  message_id: string;
}

interface CreateRunRequest {
  run_id: string;
  thread_id: string;
  response: string;
}
```

### Response Types

```typescript
interface ThreadData {
  id: string;
  thread_id: string;
  user_id?: string;
  created_at: string;
  modified_at: string;
}

interface MessageData {
  id: string;
  thread_id: string;
  message: string;
  message_id: string;
  created_at: string;
}

interface RunData {
  run_id: string;
  thread_id: string;
  response: string;
  created_at: string;
}
```
