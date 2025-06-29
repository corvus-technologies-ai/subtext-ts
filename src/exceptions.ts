/**
 * Subtext SDK custom exceptions.
 */

/**
 * Base exception for all Subtext API errors.
 */
export class SubtextAPIError extends Error {
  public statusCode?: number;
  public responseData?: Record<string, any>;

  constructor(
    message: string,
    statusCode?: number,
    responseData?: Record<string, any>
  ) {
    super(message);
    this.name = 'SubtextAPIError';
    this.statusCode = statusCode;
    this.responseData = responseData;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SubtextAPIError);
    }
  }
}

/**
 * Exception raised when authentication fails.
 */
export class SubtextAuthenticationError extends SubtextAPIError {
  constructor(message: string = 'Authentication failed. Please check your API key.') {
    super(message, 401);
    this.name = 'SubtextAuthenticationError';
  }
}

/**
 * Exception raised when a validation error occurs.
 */
export class SubtextValidationError extends SubtextAPIError {
  constructor(
    message: string = 'Validation error',
    responseData?: Record<string, any>
  ) {
    super(message, 400, responseData);
    this.name = 'SubtextValidationError';
  }
}

/**
 * Exception raised when a resource is not found.
 */
export class SubtextNotFoundError extends SubtextAPIError {
  constructor(
    message: string = 'Resource not found',
    responseData?: Record<string, any>
  ) {
    super(message, 404, responseData);
    this.name = 'SubtextNotFoundError';
  }
}

/**
 * Exception raised when there's a server error.
 */
export class SubtextServerError extends SubtextAPIError {
  constructor(
    message: string = 'Internal server error',
    statusCode: number = 500,
    responseData?: Record<string, any>
  ) {
    super(message, statusCode, responseData);
    this.name = 'SubtextServerError';
  }
}

/**
 * Exception raised when there's a connection error.
 */
export class SubtextConnectionError extends SubtextAPIError {
  constructor(message: string = 'Connection error') {
    super(message);
    this.name = 'SubtextConnectionError';
  }
}

/**
 * Exception raised when a request times out.
 */
export class SubtextTimeoutError extends SubtextAPIError {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'SubtextTimeoutError';
  }
}
