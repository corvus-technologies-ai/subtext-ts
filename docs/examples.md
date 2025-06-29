# Examples

This guide provides practical examples and common usage patterns for the Subtext TypeScript SDK.

## Basic Usage

### Simple Conversation Tracking

```typescript
import { SubtextClient } from '@subtextai/subtext';

const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!
});

async function trackConversation() {
  // Create a thread for the conversation
  const thread = await client.thread({
    threadId: `conversation-${Date.now()}`,
    userId: "user-123"
  });

  // Track user message
  const userMessage = await client.message({
    threadId: thread.threadId,
    message: "What's the weather like today?",
    messageId: `msg-${Date.now()}`
  });

  // Track AI response
  const aiResponse = await client.run({
    threadId: thread.threadId,
    runId: `run-${Date.now()}`,
    response: "I'd be happy to help with weather information! However, I don't have access to real-time weather data."
  });

  console.log('Conversation tracked successfully!');
  console.log('Thread:', thread.threadId);
  console.log('Message:', userMessage.message);
  console.log('Response:', aiResponse.response);
}

trackConversation().catch(console.error);
```

## Advanced Patterns

### Chatbot Integration

```typescript
import { SubtextClient } from '@subtextai/subtext';

class ChatbotWithAnalytics {
  private subtextClient: SubtextClient;
  private currentThreadId: string;

  constructor(apiKey: string) {
    this.subtextClient = new SubtextClient({ apiKey });
    this.currentThreadId = `chat-${Date.now()}`;
  }

  async startConversation(userId?: string) {
    const thread = await this.subtextClient.thread({
      threadId: this.currentThreadId,
      userId
    });
    
    console.log(`Started conversation: ${thread.threadId}`);
    return thread;
  }

  async processUserMessage(message: string, userId?: string) {
    // Track the user message
    const messageRecord = await this.subtextClient.message({
      threadId: this.currentThreadId,
      message,
      messageId: `msg-${Date.now()}`
    });

    // Simulate AI processing
    const aiResponse = await this.generateResponse(message);

    // Track the AI response
    const runRecord = await this.subtextClient.run({
      threadId: this.currentThreadId,
      runId: `run-${Date.now()}`,
      response: aiResponse
    });

    return {
      userMessage: messageRecord,
      aiResponse: runRecord,
      response: aiResponse
    };
  }

  private async generateResponse(message: string): Promise<string> {
    // Simulate AI response generation
    const responses = [
      "That's an interesting question!",
      "I understand what you're asking.",
      "Let me help you with that.",
      "Here's what I think about that..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Usage
async function runChatbot() {
  const chatbot = new ChatbotWithAnalytics(process.env.SUBTEXT_API_KEY!);
  
  await chatbot.startConversation("user-456");
  
  const result1 = await chatbot.processUserMessage("Hello!");
  console.log('AI:', result1.response);
  
  const result2 = await chatbot.processUserMessage("How are you?");
  console.log('AI:', result2.response);
}

runChatbot().catch(console.error);
```

### Batch Processing

```typescript
import { SubtextClient } from '@subtextai/subtext';

async function batchProcessConversations() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  const conversations = [
    {
      threadId: "batch-thread-1",
      userId: "user-1",
      messages: [
        { content: "Hello", messageId: "msg-1-1" },
        { content: "How can I help?", messageId: "msg-1-2", isAI: true }
      ]
    },
    {
      threadId: "batch-thread-2", 
      userId: "user-2",
      messages: [
        { content: "I need support", messageId: "msg-2-1" },
        { content: "I'm here to help!", messageId: "msg-2-2", isAI: true }
      ]
    }
  ];

  for (const conversation of conversations) {
    // Create thread
    const thread = await client.thread({
      threadId: conversation.threadId,
      userId: conversation.userId
    });

    console.log(`Processing thread: ${thread.threadId}`);

    // Process messages
    for (const msg of conversation.messages) {
      if (msg.isAI) {
        // Track AI response
        await client.run({
          threadId: thread.threadId,
          runId: `run-${msg.messageId}`,
          response: msg.content
        });
      } else {
        // Track user message
        await client.message({
          threadId: thread.threadId,
          message: msg.content,
          messageId: msg.messageId
        });
      }
    }
  }

  console.log('Batch processing completed!');
}

batchProcessConversations().catch(console.error);
```

### Error Handling with Retry Logic

```typescript
import { SubtextClient, SubtextAPIError, SubtextTimeoutError } from '@subtextai/subtext';

async function robustMessageTracking() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!,
    maxRetries: 5,
    timeout: 60000
  });

  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    try {
      const thread = await client.thread({
        threadId: `robust-thread-${Date.now()}`
      });

      const message = await client.message({
        threadId: thread.threadId,
        message: "This is a test message",
        messageId: `msg-${Date.now()}`
      });

      console.log('Message tracked successfully:', message.messageId);
      break;

    } catch (error) {
      attempt++;
      
      if (error instanceof SubtextTimeoutError) {
        console.log(`Attempt ${attempt} timed out, retrying...`);
        if (attempt >= maxAttempts) {
          console.error('Max attempts reached, giving up');
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else if (error instanceof SubtextAPIError) {
        console.error('API Error:', error.message);
        throw error; // Don't retry API errors
      } else {
        console.error('Unexpected error:', error);
        throw error;
      }
    }
  }
}

robustMessageTracking().catch(console.error);
```

### Working with Data Objects

```typescript
import { SubtextClient } from '@subtextai/subtext';

async function workWithDataObjects() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  // Create thread
  const thread = await client.thread({
    threadId: "data-example-thread",
    userId: "user-789"
  });

  // Create message
  const message = await client.message({
    threadId: thread.threadId,
    message: "Hello, world!",
    messageId: "data-example-msg"
  });

  // Create run
  const run = await client.run({
    threadId: thread.threadId,
    runId: "data-example-run",
    response: "Hello! How can I help you?"
  });

  // Access properties
  console.log('Thread Info:');
  console.log('- ID:', thread.id);
  console.log('- Thread ID:', thread.threadId);
  console.log('- User ID:', thread.userId);
  console.log('- Created:', thread.createdAt);

  console.log('\nMessage Info:');
  console.log('- ID:', message.id);
  console.log('- Content:', message.message);
  console.log('- Message ID:', message.messageId);
  console.log('- Created:', message.createdAt);

  console.log('\nRun Info:');
  console.log('- Run ID:', run.runId);
  console.log('- Response:', run.response);
  console.log('- Created:', run.createdAt);

  // Convert to plain objects
  console.log('\nAs plain objects:');
  console.log('Thread:', JSON.stringify(thread.toDict(), null, 2));
  console.log('Message:', JSON.stringify(message.toDict(), null, 2));
  console.log('Run:', JSON.stringify(run.toDict(), null, 2));

  // String representations
  console.log('\nString representations:');
  console.log('Thread:', thread.toString());
  console.log('Message:', message.toString());
  console.log('Run:', run.toString());
}

workWithDataObjects().catch(console.error);
```



## Integration Examples

### Express.js Middleware

```typescript
import express from 'express';
import { SubtextClient } from '@subtextai/subtext';

const app = express();
const subtextClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!
});

app.use(express.json());

// Middleware to track API requests
app.use('/api/chat', async (req, res, next) => {
  try {
    // Create or get thread
    const threadId = req.headers['x-thread-id'] as string || `api-${Date.now()}`;
    
    await subtextClient.thread({
      threadId,
      userId: req.headers['x-user-id'] as string
    });

    req.threadId = threadId;
    next();
  } catch (error) {
    console.error('Subtext tracking error:', error);
    next(); // Continue even if tracking fails
  }
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const threadId = req.threadId;

  try {
    // Track user message
    await subtextClient.message({
      threadId,
      message,
      messageId: `msg-${Date.now()}`
    });

    // Generate AI response (placeholder)
    const aiResponse = "This is a simulated AI response";

    // Track AI response
    await subtextClient.run({
      threadId,
      runId: `run-${Date.now()}`,
      response: aiResponse
    });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

These examples demonstrate various ways to use the Subtext TypeScript SDK in real-world scenarios. For more specific use cases or questions, refer to the [API Reference](./api-reference.md) or [Error Handling](./error-handling.md) documentation.
