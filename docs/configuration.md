# Configuration

This guide covers configuration options and best practices for the Subtext TypeScript SDK.

## Client Configuration

### Basic Configuration

```typescript
import { SubtextClient } from '@subtextai/subtext';

const client = new SubtextClient({
  apiKey: "your-api-key-here"
});
```

### Full Configuration

```typescript
const client = new SubtextClient({
  apiKey: "your-api-key-here",
  timeout: 30000,
  maxRetries: 3
});
```

## Configuration Options

### apiKey (required)

Your Subtext API key for authentication.

```typescript
// ✅ Good: Use environment variables
const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!
});

// ❌ Bad: Hardcode API keys
const client = new SubtextClient({
  apiKey: "sk-1234567890abcdef" // Never do this!
});
```

### timeout (optional)

Request timeout in milliseconds. Defaults to `30000` (30 seconds).

```typescript
// Short timeout for real-time applications
const realtimeClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  timeout: 5000 // 5 seconds
});

// Long timeout for batch processing
const batchClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  timeout: 120000 // 2 minutes
});
```

### maxRetries (optional)

Maximum number of retries for failed requests. Defaults to `3`.

```typescript
// No retries for time-sensitive operations
const noRetryClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  maxRetries: 0
});

// More retries for critical operations
const resilientClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  maxRetries: 10
});
```

## Environment-Based Configuration

### Using Environment Variables

Create a `.env` file:

```bash
# .env
SUBTEXT_API_KEY=your-production-api-key
SUBTEXT_TIMEOUT=30000
SUBTEXT_MAX_RETRIES=3

# Development overrides
SUBTEXT_DEV_API_KEY=your-development-api-key
```

Configuration helper:

```typescript
import { SubtextClient } from '@subtextai/subtext';

interface SubtextConfig {
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

function getSubtextConfig(): SubtextConfig {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    apiKey: isDev
      ? process.env.SUBTEXT_DEV_API_KEY!
      : process.env.SUBTEXT_API_KEY!,
    timeout: parseInt(process.env.SUBTEXT_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.SUBTEXT_MAX_RETRIES || '3')
  };
}

const client = new SubtextClient(getSubtextConfig());
```

### Multi-Environment Setup

```typescript
import { SubtextClient } from '@subtextai/subtext';

interface EnvironmentConfig {
  subtext: {
    apiKey: string;
    timeout: number;
    maxRetries: number;
  };
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    subtext: {
      apiKey: process.env.SUBTEXT_DEV_API_KEY!,
      timeout: 10000,
      maxRetries: 1
    }
  },
  staging: {
    subtext: {
      apiKey: process.env.SUBTEXT_STAGING_API_KEY!,
      timeout: 20000,
      maxRetries: 2
    }
  },
  production: {
    subtext: {
      apiKey: process.env.SUBTEXT_API_KEY!,
      timeout: 30000,
      maxRetries: 5
    }
  }
};

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

const client = new SubtextClient(config.subtext);
```

## Configuration Patterns

### Singleton Pattern

```typescript
import { SubtextClient } from '@subtextai/subtext';

class SubtextManager {
  private static instance: SubtextClient;

  static getInstance(): SubtextClient {
    if (!SubtextManager.instance) {
      SubtextManager.instance = new SubtextClient({
        apiKey: process.env.SUBTEXT_API_KEY!,
        timeout: parseInt(process.env.SUBTEXT_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.SUBTEXT_MAX_RETRIES || '3')
      });
    }
    return SubtextManager.instance;
  }
}

// Usage
const client = SubtextManager.getInstance();
```

### Factory Pattern

```typescript
import { SubtextClient } from '@subtextai/subtext';

class SubtextClientFactory {
  static createClient(environment: 'dev' | 'staging' | 'prod'): SubtextClient {
    const configs = {
      dev: {
        apiKey: process.env.SUBTEXT_DEV_API_KEY!,
        timeout: 10000,
        maxRetries: 1
      },
      staging: {
        apiKey: process.env.SUBTEXT_STAGING_API_KEY!,
        timeout: 20000,
        maxRetries: 2
      },
      prod: {
        apiKey: process.env.SUBTEXT_API_KEY!,
        timeout: 30000,
        maxRetries: 5
      }
    };

    return new SubtextClient(configs[environment]);
  }
}

// Usage
const client = SubtextClientFactory.createClient('prod');
```

### Configuration Validation

```typescript
import { z } from 'zod';
import { SubtextClient } from '@subtextai/subtext';

const SubtextConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  timeout: z.number().positive().optional(),
  maxRetries: z.number().min(0).optional()
});

function createValidatedClient(config: unknown): SubtextClient {
  const validatedConfig = SubtextConfigSchema.parse(config);
  return new SubtextClient(validatedConfig);
}

// Usage
try {
  const client = createValidatedClient({
    apiKey: process.env.SUBTEXT_API_KEY,
    timeout: parseInt(process.env.SUBTEXT_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.SUBTEXT_MAX_RETRIES || '3')
  });
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

## Performance Optimization

### Connection Pooling

The SDK uses axios internally, which handles connection pooling automatically. You can optimize by reusing client instances:

```typescript
import { SubtextClient } from '@subtextai/subtext';

// ✅ Good: Reuse client instances
const client = new SubtextClient({ apiKey: process.env.SUBTEXT_API_KEY! });

async function trackMultipleMessages() {
  // Reuse the same client for multiple requests
  await client.message({ /* ... */ });
  await client.message({ /* ... */ });
  await client.message({ /* ... */ });
}

// ❌ Bad: Create new clients for each request
async function trackMultipleMessagesBad() {
  await new SubtextClient({ apiKey: process.env.SUBTEXT_API_KEY! }).message({ /* ... */ });
  await new SubtextClient({ apiKey: process.env.SUBTEXT_API_KEY! }).message({ /* ... */ });
  await new SubtextClient({ apiKey: process.env.SUBTEXT_API_KEY! }).message({ /* ... */ });
}
```

### Timeout Configuration

Configure timeouts based on your use case:

```typescript
import { SubtextClient } from '@subtextai/subtext';

// Real-time chat applications
const realtimeClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  timeout: 3000, // 3 seconds
  maxRetries: 1
});

// Background processing
const backgroundClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  timeout: 60000, // 1 minute
  maxRetries: 5
});

// Batch operations
const batchClient = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!,
  timeout: 120000, // 2 minutes
  maxRetries: 3
});
```

## Security Best Practices

### API Key Management

```typescript
import { SubtextClient } from '@subtextai/subtext';

// ✅ Good: Use environment variables
const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!
});

// ✅ Good: Use secret management services
import { getSecret } from './secret-manager';

const client = new SubtextClient({
  apiKey: await getSecret('subtext-api-key')
});

// ❌ Bad: Hardcode API keys
const client = new SubtextClient({
  apiKey: "sk-1234567890abcdef"
});
```

### Environment Separation

```typescript
import { SubtextClient } from '@subtextai/subtext';

// Separate API keys for different environments
const getApiKey = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return process.env.SUBTEXT_PROD_API_KEY!;
    case 'staging':
      return process.env.SUBTEXT_STAGING_API_KEY!;
    case 'development':
      return process.env.SUBTEXT_DEV_API_KEY!;
    default:
      throw new Error('Unknown environment');
  }
};

const client = new SubtextClient({
  apiKey: getApiKey()
});
```



## Testing Configuration

### Mock Configuration for Tests

```typescript
// test-utils.ts
import { SubtextClient } from '@subtextai/subtext';

export function createTestClient(): SubtextClient {
  return new SubtextClient({
    apiKey: 'test-api-key',
    timeout: 5000,
    maxRetries: 0 // No retries in tests
  });
}

// test.ts
import { createTestClient } from './test-utils';

describe('Subtext Integration', () => {
  const client = createTestClient();
  
  it('should create a thread', async () => {
    // Test implementation
  });
});
```

### Environment-Specific Test Configuration

```typescript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  testEnvironment: 'node'
};

// test-setup.ts
process.env.SUBTEXT_API_KEY = 'test-api-key';
process.env.SUBTEXT_TIMEOUT = '5000';
process.env.SUBTEXT_MAX_RETRIES = '0';
```

By following these configuration patterns and best practices, you can ensure your Subtext SDK integration is secure, performant, and maintainable across different environments.
