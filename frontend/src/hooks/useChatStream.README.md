# useChatStream Hook

Custom React hook for managing Server-Sent Events (SSE) chat streaming with automatic cleanup and error handling.

## Purpose

Encapsulates the complexity of SSE streaming into a reusable hook that handles:
- EventSource connection management
- Message parsing and callbacks
- Automatic cleanup on unmount
- Error handling
- Connection state tracking

## Installation

The hook is located at `src/hooks/useChatStream.ts` and can be imported:

```typescript
import { useChatStream } from '../hooks/useChatStream'
```

## Type Definitions

```typescript
interface StreamMessage {
  content: string      // Text chunk from stream
  done: boolean        // Whether stream is complete
  messageId?: string   // Final message ID
  model?: string       // Model used for response
  error?: string       // Error message if any
}

interface UseChatStreamOptions {
  conversationId: string                        // Required: conversation ID
  onMessage: (message: StreamMessage) => void   // Required: callback for each chunk
  onError?: (error: string) => void             // Optional: error callback
  onComplete?: (messageId: string) => void      // Optional: completion callback
  model?: string                                // Optional: model override
  enabled?: boolean                             // Optional: enable/disable streaming
}

interface UseChatStreamReturn {
  isStreaming: boolean      // Current streaming state
  startStream: () => void   // Start the stream
  stopStream: () => void    // Stop the stream
  error: string | null      // Current error if any
}
```

## Usage

### Basic Example

```tsx
import { useState } from 'react'
import { useChatStream } from '../hooks/useChatStream'

function ChatComponent({ conversationId }: Props) {
  const [streamingContent, setStreamingContent] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const { isStreaming, startStream, stopStream } = useChatStream({
    conversationId,
    onMessage: (msg) => {
      if (msg.content) {
        // Append incoming text
        setStreamingContent(prev => prev + msg.content)
      }
      
      if (msg.done) {
        // Stream complete - save message
        setMessages(prev => [...prev, {
          id: msg.messageId || `msg-${Date.now()}`,
          role: 'assistant',
          content: streamingContent,
          model: msg.model,
        }])
        setStreamingContent('')
      }
    }
  })

  const handleSendMessage = async (text: string) => {
    // Send message to backend
    await apiService.sendMessage(conversationId, { message: text })
    
    // Start streaming response
    setStreamingContent('')
    startStream()
  }

  return (
    <div>
      {/* Messages display */}
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      
      {/* Streaming message */}
      {isStreaming && (
        <div className="streaming">
          {streamingContent}
          <LoadingDots />
        </div>
      )}
      
      {/* Input */}
      <input
        onSubmit={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  )
}
```

### With Error Handling

```tsx
const { isStreaming, startStream, stopStream, error } = useChatStream({
  conversationId,
  onMessage: (msg) => {
    // Handle messages
  },
  onError: (error) => {
    console.error('Stream error:', error)
    showNotification('Connection lost', 'error')
  },
  onComplete: (messageId) => {
    console.log('Stream completed:', messageId)
    showNotification('Response received', 'success')
  }
})

// Display error
{error && (
  <div className="error-banner">
    ⚠️ {error}
  </div>
)}
```

### With Model Override

```tsx
const [selectedModel, setSelectedModel] = useState('openai/gpt-4')

const { startStream } = useChatStream({
  conversationId,
  model: selectedModel,  // Override conversation default
  onMessage: (msg) => {
    // Handle messages
  }
})
```

### Conditional Streaming

```tsx
const { startStream } = useChatStream({
  conversationId,
  enabled: !!conversationId,  // Only enable if conversation exists
  onMessage: (msg) => {
    // Handle messages
  }
})
```

## Features

### 1. Automatic Cleanup

The hook automatically closes the EventSource connection when:
- Component unmounts
- Dependencies change (conversationId, model, etc.)
- `stopStream()` is called manually

```typescript
useEffect(() => {
  return () => {
    stopStream()  // Auto-cleanup on unmount
  }
}, [stopStream])
```

### 2. Message Parsing

Automatically parses incoming SSE messages:

```typescript
// Server sends:
data: {"content": "Hello"}
data: {"content": " world"}
data: {"done": true, "message_id": "123"}

// Hook calls onMessage() for each:
onMessage({ content: "Hello", done: false })
onMessage({ content: " world", done: false })
onMessage({ done: true, messageId: "123", content: "" })
```

### 3. Error Handling

Handles multiple error scenarios:
- JSON parsing errors
- EventSource connection errors
- Server-sent errors in message data

```typescript
// Server error
data: {"error": "Model unavailable"}

// Hook calls onError:
onError("Model unavailable")
```

### 4. Connection State

Track streaming state:

```tsx
const { isStreaming } = useChatStream({ ... })

// Disable input during streaming
<input disabled={isStreaming} />

// Show loading indicator
{isStreaming && <LoadingSpinner />}
```

## API Reference

### Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `conversationId` | `string` | ✅ Yes | Conversation ID for streaming |
| `onMessage` | `(msg: StreamMessage) => void` | ✅ Yes | Callback for each message chunk |
| `onError` | `(error: string) => void` | ❌ No | Callback for errors |
| `onComplete` | `(messageId: string) => void` | ❌ No | Callback when streaming completes |
| `model` | `string` | ❌ No | Model override for this stream |
| `enabled` | `boolean` | ❌ No | Enable/disable streaming (default: true) |

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `isStreaming` | `boolean` | Whether stream is currently active |
| `startStream` | `() => void` | Function to start streaming |
| `stopStream` | `() => void` | Function to stop streaming |
| `error` | `string \| null` | Current error message if any |

## Integration Example

Here's how to integrate with the Chat page:

```tsx
// Chat.tsx
import { useChatStream } from '../hooks/useChatStream'

export default function Chat() {
  const { conversationId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  
  // Use the hook
  const { isStreaming, startStream } = useChatStream({
    conversationId: conversationId || '',
    onMessage: (msg) => {
      if (msg.content) {
        // Update streaming message
        setStreamingMessage(prev => ({
          ...prev!,
          content: (prev?.content || '') + msg.content,
        }))
      }
      
      if (msg.done) {
        // Add final message
        setMessages(prev => [...prev, {
          id: msg.messageId || `msg-${Date.now()}`,
          role: 'assistant',
          content: streamingMessage?.content || '',
          model: msg.model,
          timestamp: new Date().toISOString(),
        }])
        setStreamingMessage(null)
      }
    },
    onError: (error) => {
      setError(error)
      setStreamingMessage(null)
    }
  })
  
  const handleSendMessage = async (text: string) => {
    // Send user message
    const userMsg = await apiService.sendMessage(conversationId!, {
      message: text
    })
    setMessages(prev => [...prev, userMsg])
    
    // Initialize streaming message
    setStreamingMessage({
      id: 'temp',
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    })
    
    // Start stream
    startStream()
  }
  
  return (
    <div>
      <MessageList
        messages={messages}
        streamingMessage={streamingMessage}
      />
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  )
}
```

## Benefits

✅ **Reusable** - Use in any component that needs streaming
✅ **Type-safe** - Full TypeScript support
✅ **Memory-safe** - Automatic cleanup prevents memory leaks
✅ **Error-resilient** - Handles connection and parsing errors
✅ **Testable** - Isolated logic easy to test
✅ **Maintainable** - Single source of truth for streaming logic

## Comparison: Before vs After

### Before (Inline)

```tsx
// 60+ lines of streaming logic in component
const [isStreaming, setIsStreaming] = useState(false)
const eventSourceRef = useRef<EventSource | null>(null)

useEffect(() => {
  return () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
  }
}, [])

const handleSend = async () => {
  const eventSource = new EventSource(url)
  eventSourceRef.current = eventSource
  
  eventSource.onmessage = (event) => {
    // 30+ lines of parsing logic
  }
  
  eventSource.onerror = () => {
    // Error handling
  }
}
```

### After (With Hook)

```tsx
// 10 lines with hook
const { isStreaming, startStream } = useChatStream({
  conversationId,
  onMessage: (msg) => {
    if (msg.content) setContent(prev => prev + msg.content)
    if (msg.done) saveMessage()
  }
})

const handleSend = async () => {
  await apiService.sendMessage(...)
  startStream()
}
```

## Future Enhancements

Possible additions:
- [ ] Reconnection logic with exponential backoff
- [ ] Stream pause/resume
- [ ] Message buffering
- [ ] Progress callbacks
- [ ] Partial message validation
- [ ] Token counting during stream
- [ ] Stream metrics (latency, throughput)
