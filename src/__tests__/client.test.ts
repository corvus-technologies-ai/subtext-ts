/**
 * Tests for SubtextClient
 */

import axios from 'axios';
import { SubtextClient } from '../client';
import {
  SubtextAPIError,
  SubtextAuthenticationError,
  SubtextValidationError,
  SubtextNotFoundError,
  SubtextServerError,
  SubtextConnectionError,
  SubtextTimeoutError,
} from '../exceptions';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SubtextClient', () => {
  let client: SubtextClient;
  const mockAxiosInstance = {
    request: jest.fn(),
    interceptors: {
      request: { clear: jest.fn() },
      response: { 
        clear: jest.fn(),
        use: jest.fn()
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
    client = new SubtextClient({ apiKey: 'test-api-key' });
  });

  describe('constructor', () => {
    it('should throw error if no API key provided', () => {
      expect(() => new SubtextClient({ apiKey: '' })).toThrow('API key is required');
    });

    it('should set default values correctly', () => {
      const testClient = new SubtextClient({ apiKey: 'test-key' });
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://app.trysubtext.com/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-key',
          'User-Agent': 'subtext-typescript/0.1.0',
        },
      });
    });

    it('should use custom base URL', () => {
      new SubtextClient({ 
        apiKey: 'test-key', 
        baseUrl: 'https://custom.api.com/' 
      });
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://custom.api.com',
        })
      );
    });
  });

  describe('thread', () => {
    it('should create a thread successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: '1',
            thread_id: 'thread-123',
            user_id: 'user-456',
            created_at: '2023-01-01T00:00:00Z',
            modified_at: '2023-01-01T00:00:00Z',
          },
          status: 201,
        },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const thread = await client.thread({ 
        threadId: 'thread-123', 
        userId: 'user-456' 
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/threads',
        data: {
          thread_id: 'thread-123',
          user_id: 'user-456',
        },
      });

      expect(thread.threadId).toBe('thread-123');
      expect(thread.userId).toBe('user-456');
    });

    it('should throw error if threadId is missing', async () => {
      await expect(client.thread({ threadId: '' })).rejects.toThrow('threadId is required');
    });
  });

  describe('message', () => {
    it('should create a message successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            id: '1',
            thread_id: 'thread-123',
            message: 'Hello, world!',
            message_id: 'msg-456',
            created_at: '2023-01-01T00:00:00Z',
          },
          status: 201,
        },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const message = await client.message({
        threadId: 'thread-123',
        message: 'Hello, world!',
        messageId: 'msg-456',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/messages',
        data: {
          thread_id: 'thread-123',
          message: 'Hello, world!',
          message_id: 'msg-456',
        },
      });

      expect(message.messageId).toBe('msg-456');
      expect(message.message).toBe('Hello, world!');
    });

    it('should throw error if required fields are missing', async () => {
      await expect(client.message({ 
        threadId: '', 
        message: 'test', 
        messageId: 'msg-1' 
      })).rejects.toThrow('threadId is required');

      await expect(client.message({ 
        threadId: 'thread-1', 
        message: '', 
        messageId: 'msg-1' 
      })).rejects.toThrow('message is required');

      await expect(client.message({ 
        threadId: 'thread-1', 
        message: 'test', 
        messageId: '' 
      })).rejects.toThrow('messageId is required');
    });
  });

  describe('run', () => {
    it('should create a run successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            run_id: 'run-789',
            thread_id: 'thread-123',
            response: 'Hello! How can I help?',
            created_at: '2023-01-01T00:00:00Z',
          },
          status: 201,
        },
      };

      mockAxiosInstance.request.mockResolvedValue(mockResponse);

      const run = await client.run({
        threadId: 'thread-123',
        runId: 'run-789',
        response: 'Hello! How can I help?',
      });

      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/runs',
        data: {
          thread_id: 'thread-123',
          run_id: 'run-789',
          response: 'Hello! How can I help?',
        },
      });

      expect(run.runId).toBe('run-789');
      expect(run.response).toBe('Hello! How can I help?');
    });
  });

  describe('close', () => {
    it('should clear interceptors', () => {
      client.close();
      expect(mockAxiosInstance.interceptors.request.clear).toHaveBeenCalled();
      expect(mockAxiosInstance.interceptors.response.clear).toHaveBeenCalled();
    });
  });
});
