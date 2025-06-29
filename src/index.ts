/**
 * Subtext TypeScript SDK
 * 
 * A TypeScript client library for the Subtext Analytics API.
 * 
 * @example
 * ```typescript
 * import { SubtextClient } from 'subtext';
 * 
 * const client = new SubtextClient({ apiKey: "your-api-key-here" });
 * 
 * // Create a thread
 * const thread = await client.thread({ threadId: "thread-123" });
 * 
 * // Create a message
 * const message = await client.message({
 *   threadId: thread.threadId,
 *   message: "Hello, world!",
 *   messageId: "msg-456"
 * });
 * 
 * // Record an LLM run
 * const run = await client.run({
 *   threadId: thread.threadId,
 *   runId: "run-789",
 *   response: "Hello! How can I help you today?",
 * });
 * ```
 */

// Export the main client
export { SubtextClient, SubtextClientOptions } from './client';

// Export data models and classes
export {
  Message,
  Thread,
  Run,
  CreateThreadRequest,
  CreateMessageRequest,
  CreateRunRequest,
  ThreadData,
  MessageData,
  RunData,
  CreateThreadResponse,
  CreateMessageResponse,
  CreateRunResponse,
  ErrorResponse,
} from './models';

// Export exceptions
export {
  SubtextAPIError,
  SubtextAuthenticationError,
  SubtextValidationError,
  SubtextNotFoundError,
  SubtextServerError,
  SubtextConnectionError,
  SubtextTimeoutError,
} from './exceptions';

// Default export for convenience
export { SubtextClient as default } from './client';
