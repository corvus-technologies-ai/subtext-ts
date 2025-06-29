/**
 * Basic usage example for Subtext TypeScript SDK
 */

import { SubtextClient } from '../src';

async function main() {
  // Initialize the client with your API key
  const client = new SubtextClient({
    apiKey: "your-api-key-here"
  });

  try {
    console.log('Creating a thread...');
    
    // Create a thread
    const thread = await client.thread({ 
      threadId: "thread-123",
      userId: "user-456" // Optional
    });
    
    console.log('Thread created:', thread.toString());
    console.log('Thread ID:', thread.threadId);
    console.log('User ID:', thread.userId);
    console.log('Created at:', thread.createdAt);

    console.log('\nCreating a message...');
    
    // Create a message
    const message = await client.message({
      threadId: thread.threadId,
      message: "Hello, world!",
      messageId: "msg-456"
    });
    
    console.log('Message created:', message.toString());
    console.log('Message ID:', message.messageId);
    console.log('Message content:', message.message);

    console.log('\nRecording an LLM run...');
    
    // Record an LLM run
    const run = await client.run({
      threadId: thread.threadId,
      runId: "run-789",
      response: "Hello! How can I help you today?",
    });
    
    console.log('Run recorded:', run.toString());
    console.log('Run ID:', run.runId);
    console.log('Response:', run.response);

    console.log('\nConverting to plain objects:');
    console.log('Thread data:', JSON.stringify(thread.toDict(), null, 2));
    console.log('Message data:', JSON.stringify(message.toDict(), null, 2));
    console.log('Run data:', JSON.stringify(run.toDict(), null, 2));

  } catch (error) {
    console.error('Error occurred:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
  } finally {
    // Clean up resources
    client.close();
    console.log('\nClient closed.');
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
