/**
 * Subtext API client.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import {
  CreateMessageRequest,
  CreateRunRequest,
  CreateThreadRequest,
  CreateThreadResponse,
  CreateMessageResponse,
  CreateRunResponse,
  Message,
  Run,
  Thread,
} from './models';
import {
  SubtextAPIError,
  SubtextAuthenticationError,
  SubtextConnectionError,
  SubtextNotFoundError,
  SubtextServerError,
  SubtextTimeoutError,
  SubtextValidationError,
} from './exceptions';

export interface SubtextClientOptions {
  /** Your Subtext API key */
  apiKey: string;
  /** @internal The base URL for your Subtext API (default: https://app.trysubtext.com/api) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum number of retries for failed requests (default: 3) */
  maxRetries?: number;
}

/**
 * Client for interacting with the Subtext API.
 *
 * This client provides methods for creating threads, submitting messages,
 * and recording LLM runs to your Subtext backend.
 *
 * @example
 * ```typescript
 * const client = new SubtextClient({ apiKey: "your-api-key" });
 * const thread = await client.thread({ threadId: "thread-123" });
 * const message = await client.message({
 *   threadId: thread.threadId,
 *   message: "Hello, world!",
 *   messageId: "msg-456"
 * });
 * const run = await client.run({
 *   threadId: thread.threadId,
 *   runId: "run-789",
 *   response: "Hello! How can I help you?"
 * });
 * console.log(message.id);
 * ```
 */
export class SubtextClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private httpClient: AxiosInstance;

  constructor(options: SubtextClientOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || 'https://app.trysubtext.com').replace(/\/$/, '');
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;

    // Set up axios instance with retry logic
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'User-Agent': 'subtext-typescript/0.1.0',
      },
    });

    // Add retry interceptor
    this.setupRetryInterceptor();
  }

  private setupRetryInterceptor(): void {
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        if (!config || config.__retryCount >= this.maxRetries) {
          return Promise.reject(error);
        }

        config.__retryCount = config.__retryCount || 0;
        config.__retryCount += 1;

        // Retry on specific status codes
        const retryStatusCodes = [429, 500, 502, 503, 504];
        if (error.response && retryStatusCodes.includes(error.response.status)) {
          // Exponential backoff
          const delay = Math.pow(2, config.__retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.httpClient(config);
        }

        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, any>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.httpClient.request({
        method,
        url: endpoint,
        data,
      });

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error; // This line should never be reached due to handleError throwing
    }
  }

  private handleError(error: AxiosError): never {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new SubtextTimeoutError(`Request to ${error.config?.url} timed out`);
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new SubtextConnectionError(`Failed to connect to ${error.config?.url}`);
    }

    if (!error.response) {
      throw new SubtextConnectionError(`Request failed: ${error.message}`);
    }

    const status = error.response.status;
    const errorData = this.parseErrorResponse(error.response);

    switch (status) {
      case 401:
        throw new SubtextAuthenticationError();
      case 400:
        throw new SubtextValidationError(
          errorData.error || 'Validation error',
          errorData
        );
      case 404:
        throw new SubtextNotFoundError(
          errorData.error || 'Resource not found',
          errorData
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new SubtextServerError(
          errorData.error || 'Internal server error',
          status,
          errorData
        );
      default:
        throw new SubtextAPIError(
          errorData.error || `HTTP ${status}`,
          status,
          errorData
        );
    }
  }

  private parseErrorResponse(response: AxiosResponse): Record<string, any> {
    try {
      return response.data || {};
    } catch {
      return { error: response.statusText || `HTTP ${response.status}` };
    }
  }

  /**
   * Create a new thread.
   *
   * @param options - Thread creation options
   * @returns Promise that resolves to the created thread object
   *
   * @throws {SubtextValidationError} If required fields are missing or invalid
   * @throws {SubtextAuthenticationError} If the API key is invalid
   * @throws {SubtextServerError} If there's a server error
   * @throws {SubtextConnectionError} If there's a connection error
   * @throws {SubtextTimeoutError} If the request times out
   *
   * @example
   * ```typescript
   * const thread = await client.thread({
   *   threadId: "thread-123",
   *   userId: "user-456" // Optional
   * });
   * ```
   */
  async thread(options: { threadId: string; userId?: string }): Promise<Thread> {
    if (!options.threadId) {
      throw new Error('threadId is required');
    }

    const requestData: CreateThreadRequest = {
      thread_id: options.threadId,
      user_id: options.userId,
    };

    const responseData = await this.makeRequest<CreateThreadResponse>(
      'POST',
      '/api/threads',
      requestData
    );

    // Validate response structure
    if (!responseData.data) {
      throw new SubtextAPIError('Invalid response format: missing "data" field', 200);
    }

    return new Thread(responseData.data);
  }

  /**
   * Create a new user message.
   *
   * @param options - Message creation options
   * @returns Promise that resolves to the created message object
   *
   * @throws {SubtextValidationError} If required fields are missing or invalid
   * @throws {SubtextAuthenticationError} If the API key is invalid
   * @throws {SubtextNotFoundError} If the thread doesn't exist
   * @throws {SubtextServerError} If there's a server error
   * @throws {SubtextConnectionError} If there's a connection error
   * @throws {SubtextTimeoutError} If the request times out
   *
   * @example
   * ```typescript
   * const message = await client.message({
   *   threadId: "thread-123",
   *   message: "Hello, world!",
   *   messageId: "msg-456"
   * });
   * ```
   */
  async message(options: {
    threadId: string;
    message: string;
    messageId: string;
  }): Promise<Message> {
    if (!options.threadId) {
      throw new Error('threadId is required');
    }
    if (!options.message) {
      throw new Error('message is required');
    }
    if (!options.messageId) {
      throw new Error('messageId is required');
    }

    const requestData: CreateMessageRequest = {
      thread_id: options.threadId,
      message: options.message,
      message_id: options.messageId,
    };

    const responseData = await this.makeRequest<CreateMessageResponse>(
      'POST',
      '/api/messages',
      requestData
    );

    // Validate response structure
    if (!responseData.data) {
      throw new SubtextAPIError('Invalid response format: missing "data" field', 200);
    }

    return new Message(responseData.data);
  }

  /**
   * Create a new run record for LLM calls.
   *
   * @param options - Run creation options
   * @returns Promise that resolves to the created run object
   *
   * @throws {SubtextValidationError} If required fields are missing or invalid
   * @throws {SubtextAuthenticationError} If the API key is invalid
   * @throws {SubtextNotFoundError} If the thread doesn't exist
   * @throws {SubtextServerError} If there's a server error
   * @throws {SubtextConnectionError} If there's a connection error
   * @throws {SubtextTimeoutError} If the request times out
   *
   * @example
   * ```typescript
   * const run = await client.run({
   *   threadId: "thread-123",
   *   runId: "run-456",
   *   response: "Hello! How can I help you?"
   * });
   * ```
   */
  async run(options: {
    threadId: string;
    runId: string;
    response: string;
  }): Promise<Run> {
    if (!options.threadId) {
      throw new Error('threadId is required');
    }
    if (!options.runId) {
      throw new Error('runId is required');
    }
    if (!options.response) {
      throw new Error('response is required');
    }

    const requestData: CreateRunRequest = {
      thread_id: options.threadId,
      run_id: options.runId,
      response: options.response,
    };

    const responseData = await this.makeRequest<CreateRunResponse>(
      'POST',
      '/api/runs',
      requestData
    );

    // Validate response structure
    if (!responseData.data) {
      throw new SubtextAPIError('Invalid response format: missing "data" field', 200);
    }

    return new Run(responseData.data);
  }

  /**
   * Close the HTTP client and clean up resources.
   */
  close(): void {
    // Axios doesn't require explicit cleanup, but we can clear interceptors
    this.httpClient.interceptors.request.clear();
    this.httpClient.interceptors.response.clear();
  }
}
