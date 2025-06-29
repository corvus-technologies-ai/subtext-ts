# Error Handling

This guide covers error handling patterns and best practices when using the Subtext TypeScript SDK.

## Exception Types

The SDK provides specific exception types to help you handle different error scenarios appropriately.

### SubtextAPIError

Base exception for all Subtext API errors.

```typescript
import { SubtextAPIError } from '@subtextai/subtext';

try {
  // SDK operation
} catch (error) {
  if (error instanceof SubtextAPIError) {
    console.log('Status Code:', error.statusCode);
    console.log('Response Data:', error.responseData);
    console.log('Message:', error.message);
  }
}
```

### SubtextAuthenticationError

Thrown when authentication fails (HTTP 401).

```typescript
import { SubtextAuthenticationError } from '@subtextai/subtext';

try {
  const thread = await client.thread({ threadId: "test" });
} catch (error) {
  if (error instanceof SubtextAuthenticationError) {
    console.error('Authentication failed. Please check your API key.');
    // Handle authentication error (e.g., redirect to login, refresh token)
  }
}
```

### SubtextValidationError

Thrown when request validation fails (HTTP 400).

```typescript
import { SubtextValidationError } from '@subtextai/subtext';

try {
  const message = await client.message({
    threadId: "", // Invalid: empty string
    message: "Hello",
    messageId: "msg-1"
  });
} catch (error) {
  if (error instanceof SubtextValidationError) {
    console.error('Validation error:', error.message);
    console.error('Details:', error.responseData);
    // Handle validation error (e.g., show user-friendly error message)
  }
}
```

### SubtextNotFoundError

Thrown when a resource is not found (HTTP 404).

```typescript
import { SubtextNotFoundError } from '@subtextai/subtext';

try {
  const message = await client.message({
    threadId: "non-existent-thread",
    message: "Hello",
    messageId: "msg-1"
  });
} catch (error) {
  if (error instanceof SubtextNotFoundError) {
    console.error('Thread not found. Creating a new thread...');
    // Handle by creating the thread first
    const thread = await client.thread({ threadId: "non-existent-thread" });
    // Retry the message creation
  }
}
```

### SubtextServerError

Thrown when there's a server error (HTTP 5xx).

```typescript
import { SubtextServerError } from '@subtextai/subtext';

try {
  const thread = await client.thread({ threadId: "test" });
} catch (error) {
  if (error instanceof SubtextServerError) {
    console.error('Server error:', error.message);
    console.error('Status code:', error.statusCode);
    // Handle server error (e.g., retry with backoff, show maintenance message)
  }
}
```

### SubtextConnectionError

Thrown when there's a connection error.

```typescript
import { SubtextConnectionError } from '@subtextai/subtext';

try {
  const thread = await client.thread({ threadId: "test" });
} catch (error) {
  if (error instanceof SubtextConnectionError) {
    console.error('Connection error:', error.message);
    // Handle connection error (e.g., check network, retry)
  }
}
```

### SubtextTimeoutError

Thrown when a request times out.

```typescript
import { SubtextTimeoutError } from '@subtextai/subtext';

try {
  const thread = await client.thread({ threadId: "test" });
} catch (error) {
  if (error instanceof SubtextTimeoutError) {
    console.error('Request timed out:', error.message);
    // Handle timeout (e.g., retry with longer timeout)
  }
}
```

## Error Handling Patterns

### Basic Error Handling

```typescript
import { SubtextClient, SubtextAPIError } from '@subtextai/subtext';

async function basicErrorHandling() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  try {
    const thread = await client.thread({
      threadId: "example-thread"
    });
    
    console.log('Thread created successfully:', thread.threadId);
  } catch (error) {
    if (error instanceof SubtextAPIError) {
      console.error('Subtext API Error:', error.message);
      console.error('Status Code:', error.statusCode);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

### Comprehensive Error Handling

```typescript
import {
  SubtextClient,
  SubtextAuthenticationError,
  SubtextValidationError,
  SubtextNotFoundError,
  SubtextServerError,
  SubtextConnectionError,
  SubtextTimeoutError
} from '@subtextai/subtext';

async function comprehensiveErrorHandling() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  try {
    const message = await client.message({
      threadId: "example-thread",
      message: "Hello, world!",
      messageId: "msg-1"
    });
    
    console.log('Message created:', message.messageId);
  } catch (error) {
    switch (true) {
      case error instanceof SubtextAuthenticationError:
        console.error('❌ Authentication failed - check your API key');
        // Redirect to authentication or refresh credentials
        break;
        
      case error instanceof SubtextValidationError:
        console.error('❌ Validation error:', error.message);
        console.error('Details:', error.responseData);
        // Show user-friendly validation errors
        break;
        
      case error instanceof SubtextNotFoundError:
        console.error('❌ Resource not found:', error.message);
        // Create missing resources or show appropriate message
        break;
        
      case error instanceof SubtextServerError:
        console.error('❌ Server error:', error.message);
        // Implement retry logic or show maintenance message
        break;
        
      case error instanceof SubtextConnectionError:
        console.error('❌ Connection error:', error.message);
        // Check network connectivity
        break;
        
      case error instanceof SubtextTimeoutError:
        console.error('❌ Request timeout:', error.message);
        // Retry with longer timeout or show timeout message
        break;
        
      default:
        console.error('❌ Unexpected error:', error);
        // Log for debugging and show generic error message
    }
  }
}
```

### Retry Logic with Exponential Backoff

```typescript
import { SubtextClient, SubtextServerError, SubtextTimeoutError } from '@subtextai/subtext';

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      if (!(error instanceof SubtextServerError) && 
          !(error instanceof SubtextTimeoutError)) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

async function resilientOperation() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  try {
    const thread = await withRetry(() => 
      client.thread({ threadId: "resilient-thread" })
    );
    
    console.log('Thread created with retry logic:', thread.threadId);
  } catch (error) {
    console.error('Operation failed after retries:', error.message);
  }
}
```

### Graceful Degradation

```typescript
import { SubtextClient, SubtextAPIError } from '@subtextai/subtext';

class ResilientSubtextTracker {
  private client: SubtextClient;
  private fallbackMode: boolean = false;

  constructor(apiKey: string) {
    this.client = new SubtextClient({ apiKey });
  }

  async trackMessage(threadId: string, message: string, messageId: string) {
    if (this.fallbackMode) {
      console.log('Fallback mode: logging locally');
      this.logLocally({ threadId, message, messageId, type: 'message' });
      return null;
    }

    try {
      return await this.client.message({ threadId, message, messageId });
    } catch (error) {
      if (error instanceof SubtextAPIError) {
        console.warn('Subtext tracking failed, enabling fallback mode');
        this.fallbackMode = true;
        this.logLocally({ threadId, message, messageId, type: 'message' });
        
        // Try to recover after some time
        setTimeout(() => this.attemptRecovery(), 60000);
      }
      return null;
    }
  }

  private logLocally(data: any) {
    // Log to local storage, file, or queue for later processing
    console.log('Local log:', JSON.stringify(data));
  }

  private async attemptRecovery() {
    try {
      // Test with a simple operation
      await this.client.thread({ threadId: `recovery-test-${Date.now()}` });
      this.fallbackMode = false;
      console.log('Subtext tracking recovered');
    } catch (error) {
      console.log('Recovery failed, staying in fallback mode');
      // Try again later
      setTimeout(() => this.attemptRecovery(), 300000); // 5 minutes
    }
  }
}
```

### Error Logging and Monitoring

```typescript
import { SubtextClient, SubtextAPIError } from '@subtextai/subtext';

interface ErrorLog {
  timestamp: string;
  operation: string;
  error: string;
  statusCode?: number;
  responseData?: any;
}

class MonitoredSubtextClient {
  private client: SubtextClient;
  private errorLogs: ErrorLog[] = [];

  constructor(apiKey: string) {
    this.client = new SubtextClient({ apiKey });
  }

  async thread(options: { threadId: string; userId?: string }) {
    try {
      return await this.client.thread(options);
    } catch (error) {
      this.logError('thread', error);
      throw error;
    }
  }

  async message(options: { threadId: string; message: string; messageId: string }) {
    try {
      return await this.client.message(options);
    } catch (error) {
      this.logError('message', error);
      throw error;
    }
  }

  async run(options: { threadId: string; runId: string; response: string }) {
    try {
      return await this.client.run(options);
    } catch (error) {
      this.logError('run', error);
      throw error;
    }
  }

  private logError(operation: string, error: any) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      operation,
      error: error.message || String(error)
    };

    if (error instanceof SubtextAPIError) {
      errorLog.statusCode = error.statusCode;
      errorLog.responseData = error.responseData;
    }

    this.errorLogs.push(errorLog);
    
    // Send to monitoring service
    this.sendToMonitoring(errorLog);
  }

  private sendToMonitoring(errorLog: ErrorLog) {
    // Send to your monitoring service (e.g., Sentry, DataDog, etc.)
    console.error('Subtext Error:', errorLog);
  }

  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  clearErrorLogs() {
    this.errorLogs = [];
  }
}
```

## Best Practices

### 1. Always Handle Specific Error Types

```typescript
// ✅ Good: Handle specific error types
try {
  await client.message(options);
} catch (error) {
  if (error instanceof SubtextValidationError) {
    // Handle validation errors
  } else if (error instanceof SubtextNotFoundError) {
    // Handle not found errors
  }
}

// ❌ Bad: Generic error handling
try {
  await client.message(options);
} catch (error) {
  console.error('Something went wrong');
}
```

### 2. Implement Appropriate Retry Logic

```typescript
// ✅ Good: Retry on transient errors only
const retryableErrors = [SubtextServerError, SubtextTimeoutError, SubtextConnectionError];

if (retryableErrors.some(ErrorType => error instanceof ErrorType)) {
  // Implement retry logic
}

// ❌ Bad: Retry on all errors
// This could cause infinite loops on validation errors
```

### 3. Use Graceful Degradation

```typescript
// ✅ Good: Continue operation even if tracking fails
try {
  await subtextClient.message(options);
} catch (error) {
  console.warn('Analytics tracking failed:', error.message);
  // Continue with main application logic
}

// ❌ Bad: Let tracking errors break the main flow
await subtextClient.message(options); // Throws and breaks the app
```

### 4. Log Errors Appropriately

```typescript
// ✅ Good: Log with context and structured data
catch (error) {
  if (error instanceof SubtextAPIError) {
    logger.error('Subtext API Error', {
      operation: 'create_message',
      statusCode: error.statusCode,
      responseData: error.responseData,
      threadId: options.threadId
    });
  }
}

// ❌ Bad: Generic logging without context
catch (error) {
  console.log('Error:', error);
}
```

By following these error handling patterns, you can build robust applications that gracefully handle various failure scenarios while maintaining a good user experience.
