# Installation Guide

This guide will help you install and set up the Subtext TypeScript SDK in your project.

## Prerequisites

- Node.js 14.0 or higher
- npm, yarn, or pnpm package manager
- TypeScript 4.0 or higher (for TypeScript projects)

## Installation

### Using npm

```bash
npm install @subtextai/subtext
```

### Using yarn

```bash
yarn add @subtextai/subtext
```

### Using pnpm

```bash
pnpm add @subtextai/subtext
```

## Setup

### 1. Get Your API Key

Before using the SDK, you'll need to obtain an API key from your Subtext dashboard:

1. Log in to your Subtext account
2. Navigate to the API settings
3. Generate or copy your API key
4. Keep this key secure and never commit it to version control

### 2. Environment Variables (Recommended)

For security, store your API key in environment variables:

```bash
# .env file
SUBTEXT_API_KEY=your-api-key-here
```

### 3. Initialize the Client

#### TypeScript

```typescript
import { SubtextClient } from '@subtextai/subtext';

const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY!
});
```

#### JavaScript (ES6+)

```javascript
import { SubtextClient } from '@subtextai/subtext';

const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY
});
```

#### JavaScript (CommonJS)

```javascript
const { SubtextClient } = require('@subtextai/subtext');

const client = new SubtextClient({
  apiKey: process.env.SUBTEXT_API_KEY
});
```

## Configuration Options

The `SubtextClient` constructor accepts the following options:

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | Yes | - | Your Subtext API key |
| `timeout` | number | No | `30000` | Request timeout in milliseconds |
| `maxRetries` | number | No | `3` | Maximum number of retries for failed requests |

## Verification

To verify your installation and setup, try this simple test:

```typescript
import { SubtextClient } from '@subtextai/subtext';

async function testConnection() {
  const client = new SubtextClient({
    apiKey: process.env.SUBTEXT_API_KEY!
  });

  try {
    // Create a test thread
    const thread = await client.thread({
      threadId: `test-${Date.now()}`
    });
    
    console.log('✅ Connection successful!');
    console.log('Thread created:', thread.threadId);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

## TypeScript Configuration

If you're using TypeScript, make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2018",
    "module": "commonjs",
    "lib": ["ES2018"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true
  }
}
```

## Next Steps

Now that you have the SDK installed and configured:

1. [Explore the API Reference](./api-reference.md) to understand available methods
2. [Check out examples](./examples.md) for common usage patterns
3. [Learn about error handling](./error-handling.md) for robust applications

## Troubleshooting

### Common Issues

**"Module not found" error**
- Ensure you've installed the package: `npm install @subtextai/subtext`
- Check your import statement syntax

**"API key is required" error**
- Verify your API key is set in environment variables
- Check that you're passing the API key to the constructor

**Connection timeout errors**
- Check your internet connection
- Consider increasing the timeout value

**TypeScript compilation errors**
- Ensure you're using TypeScript 4.0 or higher
- Check your tsconfig.json configuration
