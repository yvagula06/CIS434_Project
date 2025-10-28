# API Usage Examples

Complete examples showing how to use the Open Chat API.

## Using curl

### 1. Create a Conversation

```bash
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-3.5-turbo"}'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "default_model": "openai/gpt-3.5-turbo",
  "created_at": "2025-10-27T10:30:00.123456",
  "updated_at": "2025-10-27T10:30:00.123456"
}
```

Save the `id` for subsequent requests!

### 2. Send a User Message

```bash
curl -X POST http://localhost:8001/conversations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "What is FastAPI?"}'
```

### 3. Stream the AI Response

```bash
curl -N http://localhost:8001/conversations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/stream
```

**SSE Output:**
```
data: {"content": "FastAPI"}

data: {"content": " is"}

data: {"content": " a"}

data: {"content": " modern"}

data: {"done": true, "message_id": "msg-uuid"}
```

### 4. Get All Messages

```bash
curl http://localhost:8001/conversations/a1b2c3d4-e5f6-7890-abcd-ef1234567890/messages
```

### 5. Update Model

```bash
curl -X PATCH http://localhost:8001/conversations/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-4"}'
```

### 6. List All Conversations

```bash
curl http://localhost:8001/conversations
```

### 7. Get Available Models

```bash
curl http://localhost:8001/models
```

### 8. Delete Conversation

```bash
curl -X DELETE http://localhost:8001/conversations/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## Using Python

### Basic Example

```python
import requests
import json

BASE_URL = "http://localhost:8001"

# 1. Create conversation
response = requests.post(
    f"{BASE_URL}/conversations",
    json={"default_model": "openai/gpt-3.5-turbo"}
)
conversation = response.json()
conv_id = conversation["id"]
print(f"Created conversation: {conv_id}")

# 2. Send message
response = requests.post(
    f"{BASE_URL}/conversations/{conv_id}/messages",
    json={"message": "Hello, how are you?"}
)
print(f"Sent message: {response.json()['content']}")

# 3. Get streaming response
response = requests.get(
    f"{BASE_URL}/conversations/{conv_id}/stream",
    stream=True
)

print("AI Response: ", end="", flush=True)
for line in response.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith('data: '):
            data = json.loads(line_str[6:])
            if 'content' in data:
                print(data['content'], end="", flush=True)
            elif 'done' in data:
                print("\n\nDone!")
                break
```

### Full Conversation Example

```python
import requests
import json

BASE_URL = "http://localhost:8001"

def stream_chat(conv_id, message, model=None):
    """Send a message and stream the response"""
    # Send user message
    requests.post(
        f"{BASE_URL}/conversations/{conv_id}/messages",
        json={"message": message}
    )
    
    # Stream response
    url = f"{BASE_URL}/conversations/{conv_id}/stream"
    if model:
        url += f"?model={model}"
    
    response = requests.get(url, stream=True)
    
    print(f"\nUser: {message}")
    print("AI: ", end="", flush=True)
    
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                data = json.loads(line_str[6:])
                if 'content' in data:
                    print(data['content'], end="", flush=True)
                elif 'done' in data:
                    print("\n")
                    break

# Create conversation
response = requests.post(
    f"{BASE_URL}/conversations",
    json={"default_model": "openai/gpt-3.5-turbo"}
)
conv_id = response.json()["id"]

# Have a conversation
stream_chat(conv_id, "What is the capital of France?")
stream_chat(conv_id, "What is it famous for?")
stream_chat(conv_id, "Tell me more about the Eiffel Tower.")

# Get message history
response = requests.get(f"{BASE_URL}/conversations/{conv_id}/messages")
messages = response.json()["messages"]
print(f"\nTotal messages: {len(messages)}")
```

## Using JavaScript/TypeScript

### Fetch API Example

```javascript
const BASE_URL = 'http://localhost:8001';

async function createConversation(model = 'openai/gpt-3.5-turbo') {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ default_model: model })
  });
  return await response.json();
}

async function sendMessage(conversationId, message) {
  const response = await fetch(
    `${BASE_URL}/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }
  );
  return await response.json();
}

async function streamResponse(conversationId) {
  const response = await fetch(
    `${BASE_URL}/conversations/${conversationId}/stream`
  );
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.content) {
          console.log(data.content);
        } else if (data.done) {
          console.log('Stream complete!');
          return;
        }
      }
    }
  }
}

// Usage
(async () => {
  const conv = await createConversation();
  await sendMessage(conv.id, 'Hello!');
  await streamResponse(conv.id);
})();
```

### EventSource (SSE) Example

```javascript
async function streamWithEventSource(conversationId) {
  const eventSource = new EventSource(
    `http://localhost:8001/conversations/${conversationId}/stream`
  );
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.content) {
      console.log(data.content);
    } else if (data.done) {
      console.log('Stream complete!');
      eventSource.close();
    } else if (data.error) {
      console.error('Error:', data.error);
      eventSource.close();
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE Error:', error);
    eventSource.close();
  };
}
```

## Testing with the Swagger UI

1. Start the server: `uvicorn main:app --reload`
2. Open http://localhost:8001/docs in your browser
3. Try out the endpoints interactively!

## Model Override Example

You can override the conversation's default model per message:

```bash
# Create conversation with GPT-3.5
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-3.5-turbo"}'

# Stream with GPT-4 instead
curl -N "http://localhost:8001/conversations/{id}/stream?model=openai/gpt-4"
```

## Error Handling

```python
import requests

try:
    response = requests.post(
        f"{BASE_URL}/conversations/{conv_id}/messages",
        json={"message": "Hello"}
    )
    response.raise_for_status()
    print(response.json())
except requests.exceptions.HTTPError as e:
    print(f"HTTP Error: {e.response.status_code}")
    print(f"Details: {e.response.json()}")
except requests.exceptions.ConnectionError:
    print("Could not connect to server")
```

## Complete Integration Test

Run the included test script:

```bash
python test_api.py
```

This will test all endpoints and show you the complete flow!
