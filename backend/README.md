# Backend - FastAPI Server

Advanced FastAPI backend with conversation management, OpenRouter streaming, and Server-Sent Events (SSE).

## Features

- ✅ **Conversation Management**: Create, update, and manage multiple conversations
- ✅ **Model Selection**: Per-conversation default models with per-message overrides
- ✅ **Streaming Responses**: Real-time AI responses via Server-Sent Events
- ✅ **Model Discovery**: Fetch and cache available OpenRouter models
- ✅ **Message History**: Full conversation context maintained in memory
- ✅ **Attribution Headers**: Proper HTTP-Referer and X-Title headers for OpenRouter
- ✅ **Modular Architecture**: Separated OpenRouter service module for clean code
- ✅ **Logging**: Comprehensive logging for debugging and monitoring
- ✅ **CORS**: Configured for frontend integration
- ✅ **Auto Documentation**: Interactive API docs via Swagger/OpenAPI

## Project Structure

```
backend/
├── main.py                    # FastAPI application and endpoints
├── services/                  # Service modules
│   ├── __init__.py           # Package initialization
│   ├── openrouter.py         # OpenRouter API integration
│   └── README.md             # Service documentation
├── requirements.txt           # Python dependencies
├── test_api.py               # API integration tests
├── test_service.py           # Service unit tests
├── README.md                 # This file
├── QUICKSTART.md             # Quick setup guide
├── example_usage.md          # API usage examples
├── CHECKLIST.md              # Verification checklist
└── IMPLEMENTATION.md         # Implementation details
```

## Architecture

### Data Storage (In-Memory)
```python
conversations = {
    "conversation_id": {
        "id": "uuid",
        "default_model": "openai/gpt-3.5-turbo",
        "created_at": datetime,
        "updated_at": datetime
    }
}

messages_store = {
    "conversation_id": [
        {
            "id": "message_id",
            "role": "user|assistant",
            "content": "message text",
            "model": "model used (for assistant)",
            "timestamp": datetime
        }
    ]
}
```

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
```

### 2. Activate Virtual Environment
```bash
# Windows PowerShell
venv\Scripts\activate

# Windows CMD
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
Make sure your `.env` file in the project root contains:
```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=8001
MODEL_NAME=openai/gpt-3.5-turbo
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
```

### 5. Run the Server
```bash
# Recommended: Using uvicorn with reload
uvicorn main:app --reload

# Alternative: Run main.py directly
python main.py

# Production mode (no reload)
uvicorn main:app --host 0.0.0.0 --port 8001
```

Server will start at: **http://localhost:8001**

## API Endpoints

### Health & Info

#### `GET /`
Health check with statistics
```json
{
  "status": "online",
  "service": "Open Chat API",
  "version": "2.0.0",
  "conversations": 5,
  "total_messages": 42
}
```

### Models

#### `GET /models`
Fetch available OpenRouter models (cached for 1 hour)
```json
{
  "models": [...],
  "cached": false
}
```

### Conversations

#### `POST /conversations`
Create a new conversation
```json
// Request
{
  "default_model": "openai/gpt-4-turbo"  // optional
}

// Response
{
  "id": "uuid",
  "default_model": "openai/gpt-4-turbo",
  "created_at": "2025-10-27T...",
  "updated_at": "2025-10-27T..."
}
```

#### `GET /conversations`
List all conversations
```json
{
  "conversations": [
    {
      "id": "uuid",
      "default_model": "openai/gpt-3.5-turbo",
      "created_at": "...",
      "updated_at": "...",
      "message_count": 10
    }
  ]
}
```

#### `GET /conversations/{id}`
Get conversation details

#### `PATCH /conversations/{id}`
Update conversation's default model
```json
{
  "default_model": "anthropic/claude-3-opus"
}
```

#### `DELETE /conversations/{id}`
Delete a conversation and all messages

### Messages

#### `POST /conversations/{id}/messages`
Send a user message
```json
// Request
{
  "message": "What is FastAPI?",
  "model": "openai/gpt-4"  // optional override
}

// Response
{
  "id": "message_uuid",
  "role": "user",
  "content": "What is FastAPI?",
  "model": null,
  "timestamp": "2025-10-27T..."
}
```

#### `GET /conversations/{id}/messages`
Get all messages in conversation
```json
{
  "conversation_id": "uuid",
  "messages": [...]
}
```

#### `GET /conversations/{id}/stream?model=optional-model`
**Stream assistant response via Server-Sent Events**

This endpoint streams the AI response in real-time. The response format is SSE:

```
data: {"content": "Hello"}

data: {"content": " there"}

data: {"content": "!"}

data: {"done": true, "message_id": "uuid"}
```

**Query Parameters:**
- `model` (optional): Override the conversation's default model

**Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

## Usage Flow

### 1. Create a Conversation
```bash
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-3.5-turbo"}'
```

### 2. Send a Message
```bash
curl -X POST http://localhost:8001/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

### 3. Stream the Response
```bash
curl -N http://localhost:8001/conversations/{id}/stream
```

Or with model override:
```bash
curl -N "http://localhost:8001/conversations/{id}/stream?model=openai/gpt-4"
```

## Development

### API Documentation
Once running, access interactive docs:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Testing

#### Test the Full API
```bash
python test_api.py
```

Tests all endpoints including:
- Health check
- Models fetching
- Conversation CRUD
- Message sending
- Streaming responses

#### Test the OpenRouter Service
```bash
python test_service.py
```

Tests the service module directly:
- Streaming functionality
- Non-streaming functionality
- Model discovery
- Multi-turn conversations

### Logging
Logs are output to console with timestamps:
```
2025-10-27 10:30:45 - __main__ - INFO - Created conversation abc-123 with model openai/gpt-3.5-turbo
2025-10-27 10:30:50 - services.openrouter - INFO - Starting stream to OpenRouter with model: openai/gpt-3.5-turbo
2025-10-27 10:31:05 - services.openrouter - INFO - Stream completed. Total chunks: 42
```

### Hot Reload
When using `uvicorn main:app --reload`, the server automatically restarts on code changes.

## Error Handling

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad request (invalid input) |
| 404 | Conversation/resource not found |
| 500 | Server error (missing API key) |
| 502 | OpenRouter API error |

## Dependencies

- **FastAPI**: Modern web framework
- **uvicorn**: ASGI server
- **httpx**: Async HTTP client for streaming
- **python-dotenv**: Environment configuration
- **pydantic**: Data validation

## Service Architecture

The backend uses a modular service architecture:

### `services/openrouter.py`

Handles all OpenRouter API interactions:

```python
from services.openrouter import send_to_openrouter

# Stream responses
async for chunk in send_to_openrouter(messages, model):
    yield chunk

# Or get complete response
response = await send_to_openrouter_no_stream(messages, model)

# Get available models
models = await get_available_models()
```

**Benefits:**
- Clean separation of concerns
- Reusable across endpoints
- Easy to test in isolation
- Centralized error handling
- Consistent logging

See `services/README.md` for detailed documentation.

## Production Considerations

⚠️ **Current implementation uses in-memory storage**. For production:

1. **Replace with persistent storage** (PostgreSQL, MongoDB, Redis)
2. **Add authentication** (JWT, OAuth)
3. **Implement rate limiting**
4. **Add request/response validation**
5. **Set up proper error tracking** (Sentry, etc.)
6. **Use a reverse proxy** (nginx)
7. **Enable HTTPS**
8. **Add database migrations** (Alembic)

## Troubleshooting

### Server won't start
- Ensure virtual environment is activated
- Check that port 8001 is not in use
- Verify `.env` file exists and has `OPENROUTER_API_KEY`

### Streaming not working
- Check that `httpx` is installed (not `requests`)
- Verify OpenRouter API key is valid
- Check logs for error messages

### CORS errors
- Frontend must be running on `http://localhost:5173` or `http://localhost:3000`
- Add additional origins in `allow_origins` if needed
