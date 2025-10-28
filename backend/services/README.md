# OpenRouter Service Module

This module provides a clean interface for communicating with the OpenRouter API.

## Overview

The `services/openrouter.py` module encapsulates all OpenRouter API interactions, providing:
- Streaming chat completions
- Non-streaming chat completions
- Model discovery
- Proper error handling and logging

## Functions

### `send_to_openrouter(messages, model)`

Main streaming function that yields text chunks as they arrive from OpenRouter.

**Signature:**
```python
async def send_to_openrouter(
    messages: List[Dict[str, str]], 
    model: str
) -> AsyncGenerator[str, None]:
```

**Parameters:**
- `messages` (List[Dict]): List of message dictionaries with 'role' and 'content' keys
  - Example: `[{"role": "user", "content": "Hello!"}]`
- `model` (str): Model identifier (e.g., "openai/gpt-3.5-turbo")

**Returns:**
- AsyncGenerator yielding str chunks

**Raises:**
- `ValueError`: If OPENROUTER_API_KEY is not configured
- `httpx.HTTPError`: If the request fails

**Example Usage:**
```python
from services.openrouter import send_to_openrouter

messages = [
    {"role": "user", "content": "What is Python?"}
]

async for chunk in send_to_openrouter(messages, "openai/gpt-3.5-turbo"):
    print(chunk, end="", flush=True)
```

**SSE Integration:**
```python
async def event_generator():
    async for chunk in send_to_openrouter(messages, model):
        yield f"data: {json.dumps({'content': chunk})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"

return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### `send_to_openrouter_no_stream(messages, model)`

Non-streaming version that returns the complete response.

**Signature:**
```python
async def send_to_openrouter_no_stream(
    messages: List[Dict[str, str]], 
    model: str
) -> str:
```

**Parameters:**
- Same as `send_to_openrouter`

**Returns:**
- str: Complete response text

**Example Usage:**
```python
from services.openrouter import send_to_openrouter_no_stream

messages = [{"role": "user", "content": "Hello!"}]
response = await send_to_openrouter_no_stream(messages, "openai/gpt-3.5-turbo")
print(response)
```

### `get_available_models()`

Fetches the list of available models from OpenRouter.

**Signature:**
```python
async def get_available_models() -> List[Dict[str, Any]]:
```

**Returns:**
- List[Dict]: List of model dictionaries with details

**Example Usage:**
```python
from services.openrouter import get_available_models

models = await get_available_models()
for model in models:
    print(f"{model['id']}: {model['name']}")
```

### `get_openrouter_headers()`

Helper function that builds headers for OpenRouter API requests.

**Signature:**
```python
def get_openrouter_headers() -> Dict[str, str]:
```

**Returns:**
- Dict[str, str]: Headers including Authorization, HTTP-Referer, X-Title

**Headers Included:**
- `Authorization`: Bearer token from OPENROUTER_API_KEY
- `Content-Type`: application/json
- `HTTP-Referer`: From APP_URL env variable
- `X-Title`: From APP_TITLE env variable

## Configuration

The module reads the following environment variables:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
```

## Architecture

### Streaming Flow

```
Client Request
    │
    ▼
FastAPI Endpoint
    │
    ▼
send_to_openrouter()
    │
    ├─► POST to OpenRouter API
    │   (with stream=true)
    │
    ├─► Receive SSE stream
    │
    ├─► Parse data chunks
    │
    ├─► Extract content
    │
    └─► Yield text chunks
         │
         ▼
     SSE Generator
         │
         ▼
     Client receives
     chunks in real-time
```

### Error Handling

The service handles multiple error types:

1. **Configuration Errors** (`ValueError`)
   - Missing API key
   - Invalid configuration

2. **HTTP Errors** (`httpx.HTTPError`)
   - Network failures
   - API errors (4xx, 5xx)
   - Timeout errors

3. **Parsing Errors**
   - Malformed JSON chunks
   - Unexpected response structure

All errors are logged with appropriate context.

## Logging

The module uses Python's standard logging:

```python
import logging
logger = logging.getLogger(__name__)
```

**Log Levels:**
- `INFO`: Stream start/completion, model fetching
- `DEBUG`: Individual chunk details
- `WARNING`: Parsing failures (non-fatal)
- `ERROR`: API errors, configuration issues

**Example Logs:**
```
INFO - Starting stream to OpenRouter with model: openai/gpt-3.5-turbo
DEBUG - Message count: 3
INFO - Stream established successfully
DEBUG - Yielding chunk 1: 5 chars
DEBUG - Yielding chunk 2: 8 chars
INFO - Stream completed. Total chunks: 42
```

## Implementation Details

### Streaming Response Parsing

The service parses Server-Sent Events (SSE) from OpenRouter:

```python
async for line in response.aiter_lines():
    if line.startswith("data: "):
        data = line[6:]  # Remove "data: " prefix
        
        if data == "[DONE]":
            break
        
        chunk_data = json.loads(data)
        content = chunk_data["choices"][0]["delta"]["content"]
        
        if content:
            yield content
```

### Attribution Headers

OpenRouter requires attribution headers for proper tracking:

```python
headers = {
    "HTTP-Referer": APP_URL,    # Your app's URL
    "X-Title": APP_TITLE,       # Your app's name
}
```

These help OpenRouter track usage and provide analytics.

## Testing

### Unit Test Example

```python
import pytest
from services.openrouter import send_to_openrouter

@pytest.mark.asyncio
async def test_send_to_openrouter():
    messages = [{"role": "user", "content": "Say 'test'"}]
    
    chunks = []
    async for chunk in send_to_openrouter(messages, "openai/gpt-3.5-turbo"):
        chunks.append(chunk)
    
    full_response = "".join(chunks)
    assert len(full_response) > 0
    assert "test" in full_response.lower()
```

### Integration Test

```python
@pytest.mark.asyncio
async def test_streaming_endpoint(client):
    # Create conversation
    conv_response = await client.post("/conversations")
    conv_id = conv_response.json()["id"]
    
    # Send message
    await client.post(
        f"/conversations/{conv_id}/messages",
        json={"message": "Hello!"}
    )
    
    # Stream response
    response = await client.get(f"/conversations/{conv_id}/stream")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream"
```

## Best Practices

### 1. Always use async/await

```python
# Good
async for chunk in send_to_openrouter(messages, model):
    await process_chunk(chunk)

# Bad - will not work
for chunk in send_to_openrouter(messages, model):  # Error!
    process_chunk(chunk)
```

### 2. Handle errors appropriately

```python
try:
    async for chunk in send_to_openrouter(messages, model):
        yield chunk
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    # Handle missing API key
except httpx.HTTPError as e:
    logger.error(f"API error: {e}")
    # Handle network/API errors
```

### 3. Use timeouts

The service uses 60-second timeout for streaming:

```python
async with httpx.AsyncClient(timeout=60.0) as client:
    # ... streaming code
```

Adjust if needed for longer responses.

### 4. Accumulate responses

```python
full_response = ""
async for chunk in send_to_openrouter(messages, model):
    full_response += chunk
    # Process or yield chunk

# Now have complete response
save_to_database(full_response)
```

## Migration from Direct httpx Usage

**Before (in main.py):**
```python
async with httpx.AsyncClient() as client:
    async with client.stream(...) as response:
        async for line in response.aiter_lines():
            # Parse SSE manually
            if line.startswith("data: "):
                data = line[6:]
                chunk = json.loads(data)
                content = chunk["choices"][0]["delta"]["content"]
                yield content
```

**After (using service):**
```python
from services.openrouter import send_to_openrouter

async for chunk in send_to_openrouter(messages, model):
    yield chunk
```

Much cleaner and reusable! 🎉

## Future Enhancements

Potential improvements:

1. **Retry Logic**: Automatic retries on transient failures
2. **Rate Limiting**: Built-in rate limit handling
3. **Caching**: Cache responses for identical requests
4. **Metrics**: Collect performance metrics
5. **Mock Mode**: Testing without API calls
6. **Streaming Options**: Temperature, max_tokens, etc.

## See Also

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [HTTPX Documentation](https://www.python-httpx.org/)
- [FastAPI Streaming](https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse)
