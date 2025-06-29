/**
 * Subtext SDK data models and interfaces.
 */

export interface CreateThreadRequest {
  /** Request model for creating a thread. */
  thread_id: string;
  user_id?: string;
}

export interface ThreadData {
  /** Response data model for a thread. */
  id: string;
  thread_id: string;
  user_id?: string;
  created_at: string;
  modified_at: string;
}

export interface CreateThreadResponse {
  /** Response model for creating a thread. */
  data: ThreadData;
  status: number;
}

export interface CreateMessageRequest {
  /** Request model for creating a user message. */
  thread_id: string;
  message: string;
  message_id: string;
}

export interface MessageData {
  /** Response data model for a message. */
  id: string;
  thread_id: string;
  message: string;
  message_id: string;
  created_at: string;
}

export interface CreateMessageResponse {
  /** Response model for creating a user message. */
  data: MessageData;
  status: number;
}

export interface CreateRunRequest {
  /** Request model for creating a run. */
  run_id: string;
  thread_id: string;
  response: string;
}

export interface RunData {
  /** Response data model for a run. */
  run_id: string;
  thread_id: string;
  response: string;
  created_at: string;
}

export interface CreateRunResponse {
  /** Response model for creating a run. */
  data: RunData;
  status: number;
}

export interface ErrorResponse {
  /** Error response model. */
  error: string;
  status: number;
}

/**
 * Represents a user message.
 * 
 * This class provides a convenient interface for working with message data
 * returned from the API.
 */
export class Message {
  private _data: MessageData;

  constructor(data: MessageData) {
    this._data = data;
  }

  /** The unique identifier for this message. */
  get id(): string {
    return this._data.id;
  }

  /** The thread ID this message belongs to. */
  get threadId(): string {
    return this._data.thread_id;
  }

  /** The message content. */
  get message(): string {
    return this._data.message;
  }

  /** The user-provided message ID. */
  get messageId(): string {
    return this._data.message_id;
  }

  /** The timestamp when this message was created. */
  get createdAt(): string {
    return this._data.created_at;
  }

  /** Convert the message to a plain object. */
  toDict(): Record<string, any> {
    return { ...this._data };
  }

  toString(): string {
    const truncated = this.message.length > 50 
      ? `${this.message.substring(0, 50)}...` 
      : this.message;
    return `Message ${this.messageId} in thread ${this.threadId}: ${truncated}`;
  }
}

/**
 * Represents a thread.
 * 
 * This class provides a convenient interface for working with thread data
 * returned from the API.
 */
export class Thread {
  private _data: ThreadData;

  constructor(data: ThreadData) {
    this._data = data;
  }

  /** The unique identifier for this thread. */
  get id(): string {
    return this._data.id;
  }

  /** The user-provided thread ID. */
  get threadId(): string {
    return this._data.thread_id;
  }

  /** The user ID associated with this thread. */
  get userId(): string | undefined {
    return this._data.user_id;
  }

  /** The timestamp when this thread was created. */
  get createdAt(): string {
    return this._data.created_at;
  }

  /** The timestamp when this thread was last modified. */
  get modifiedAt(): string {
    return this._data.modified_at;
  }

  /** Convert the thread to a plain object. */
  toDict(): Record<string, any> {
    return { ...this._data };
  }

  toString(): string {
    const userPart = this.userId ? ` (user: ${this.userId})` : '';
    return `Thread ${this.threadId}${userPart}`;
  }
}

/**
 * Represents an LLM run.
 * 
 * This class provides a convenient interface for working with run data
 * returned from the API.
 */
export class Run {
  private _data: RunData;

  constructor(data: RunData) {
    this._data = data;
  }

  /** The unique identifier for this run. */
  get runId(): string {
    return this._data.run_id;
  }

  /** The thread ID this run belongs to. */
  get threadId(): string {
    return this._data.thread_id;
  }

  /** The LLM response content. */
  get response(): string {
    return this._data.response;
  }

  /** The timestamp when this run was created. */
  get createdAt(): string {
    return this._data.created_at;
  }

  /** Convert the run to a plain object. */
  toDict(): Record<string, any> {
    return { ...this._data };
  }

  toString(): string {
    return `Run ${this.runId} in thread ${this.threadId}`;
  }
}
