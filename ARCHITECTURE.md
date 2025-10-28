# System Architecture

## Overview

The Open Chat application is a full-stack system that enables conversations with AI models through the OpenRouter API. It features real-time streaming responses, conversation management, and a modern web interface.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           React + TypeScript + Vite Frontend              │  │
│  │                                                           │  │
│  │  • ChatInterface Component                                │  │
│  │  • State Management (useState)                            │  │
│  │  • HTTP Client (Axios)                                    │  │
│  │  • EventSource for SSE                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              ▲                                    │
│                              │                                    │
│                       HTTP/SSE (Port 5173)                        │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                        ┌──────┴──────┐
                        │    CORS     │
                        │  Middleware │
                        └──────┬──────┘
                               │
┌──────────────────────────────┼───────────────────────────────────┐
│                   BACKEND (FastAPI Server)                        │
│                         Port 8001                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                           │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │  │
│  │  │  Models  │  │Conversations│ │Messages │  │  Stream  │  │  │
│  │  │  /models │  │/conversations│ │/messages│  │  /stream │  │  │
│  │  └──────────┘  └──────────┘  └─────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              In-Memory Data Store                          │  │
│  │                                                            │  │
│  │  conversations = {                                         │  │
│  │    "conv_id": {                                            │  │
│  │      id, default_model, created_at, updated_at            │  │
│  │    }                                                       │  │
│  │  }                                                         │  │
│  │                                                            │  │
│  │  messages_store = {                                        │  │
│  │    "conv_id": [                                            │  │
│  │      {id, role, content, model, timestamp},               │  │
│  │      ...                                                   │  │
│  │    ]                                                       │  │
│  │  }                                                         │  │
│  │                                                            │  │
│  │  models_cache = [model_list]  # Cached 1 hour            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │               HTTPX Async Client                           │  │
│  │                                                            │  │
│  │  • Streaming Support (stream=True)                         │  │
│  │  • Attribution Headers:                                    │  │
│  │    - Authorization: Bearer <API_KEY>                       │  │
│  │    - HTTP-Referer: <APP_URL>                               │  │
│  │    - X-Title: <APP_TITLE>                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                        HTTPS (Port 443)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenRouter API                              │
│                  https://openrouter.ai/api/v1                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Endpoints:                                                │  │
│  │  • GET  /models                                            │  │
│  │  • POST /chat/completions (with stream=true)               │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AI Model Providers                        │
│                                                                   │
│  • OpenAI (GPT-3.5, GPT-4)                                       │
│  • Anthropic (Claude)                                            │
│  • Meta (Llama)                                                  │
│  • Google (Gemini)                                               │
│  • And many more...                                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Creating a Conversation

```
Client                  Backend                 Storage
  │                       │                       │
  ├──POST /conversations─►│                       │
  │   {default_model}     │                       │
  │                       ├──Generate UUID───────►│
  │                       │                       │
  │                       ├──Store conversation──►│
  │                       │                       │
  │◄──201 Created─────────┤                       │
  │   {id, model, ...}    │                       │
```

### 2. Sending a Message

```
Client                  Backend                 Storage
  │                       │                       │
  ├──POST /conversations/{id}/messages───────────►│
  │   {message}           │                       │
  │                       ├──Generate UUID───────►│
  │                       │                       │
  │                       ├──Store user message──►│
  │                       │                       │
  │◄──200 OK──────────────┤                       │
  │   {message_id, ...}   │                       │
```

### 3. Streaming Response (SSE)

```
Client              Backend                OpenRouter           Storage
  │                   │                        │                  │
  ├──GET /stream─────►│                        │                  │
  │                   ├──Retrieve messages────►│                  │
  │                   │                        │                  │
  │                   ├──POST /chat/completions►                  │
  │                   │   {messages, stream:true}                 │
  │                   │                        │                  │
  │                   │◄──SSE Stream───────────┤                  │
  │◄──data: chunk─────┤   data: {delta}        │                  │
  │                   │                        │                  │
  │◄──data: chunk─────┤◄──data: {delta}────────┤                  │
  │                   │                        │                  │
  │◄──data: chunk─────┤◄──data: {delta}────────┤                  │
  │                   │                        │                  │
  │◄──data: done──────┤◄──data: [DONE]─────────┤                  │
  │                   │                        │                  │
  │                   ├──Store assistant msg──────────────────────►│
```

## Component Responsibilities

### Frontend (React)
- **Responsibility**: User interface and user experience
- **Key Functions**:
  - Render chat interface
  - Manage local UI state
  - Send HTTP requests to backend
  - Handle SSE streaming events
  - Display messages in real-time

### Backend (FastAPI)
- **Responsibility**: Business logic and API gateway
- **Key Functions**:
  - Manage conversations and messages
  - Validate requests
  - Orchestrate OpenRouter API calls
  - Transform streaming data
  - Handle errors and logging
  - Enforce CORS policies

### OpenRouter API
- **Responsibility**: AI model routing and inference
- **Key Functions**:
  - Route requests to appropriate AI models
  - Stream responses from models
  - Handle billing and rate limiting
  - Provide model discovery

## Security Considerations

### API Key Protection
```
┌──────────────┐
│   .env file  │  ← API key stored here (gitignored)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Backend    │  ← Reads key, adds to headers
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  OpenRouter  │  ← Validates key
└──────────────┘

Frontend NEVER sees the API key!
```

### CORS Configuration
```python
allow_origins = [
    "http://localhost:5173",  # Development frontend
    "http://localhost:3000"   # Alternative port
]
```

## Scalability Considerations

### Current Implementation (Development)
- ✅ In-memory storage (fast, simple)
- ✅ Single-server deployment
- ✅ No authentication required
- ❌ Data lost on restart
- ❌ Not horizontally scalable

### Production Recommendations

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                     (nginx/AWS)                          │
└────┬──────────────────────────┬──────────────────────────┘
     │                          │
     ▼                          ▼
┌─────────┐              ┌─────────┐
│ Backend │              │ Backend │
│Instance1│              │Instance2│
└────┬────┘              └────┬────┘
     │                        │
     └───────┬────────────────┘
             │
             ▼
     ┌───────────────┐
     │   PostgreSQL  │  ← Persistent storage
     │   or MongoDB  │
     └───────────────┘
             │
             ▼
     ┌───────────────┐
     │     Redis     │  ← Session cache
     └───────────────┘
```

## Logging Flow

```
Request Received
    │
    ├─► INFO: "Created conversation {id} with model {model}"
    │
Message Sent
    │
    ├─► INFO: "Added user message to conversation {id}"
    │
Streaming Started
    │
    ├─► INFO: "Streaming response for conversation {id} with model {model}"
    │
    ├─► DEBUG: Chunk received
    │
Streaming Complete
    │
    ├─► INFO: "Completed streaming for conversation {id}"
    │
Error Occurred
    │
    └─► ERROR: "Error details..."
```

## Environment Configuration

```
.env file (Project Root)
    │
    ├─► OPENROUTER_API_KEY    ─► Authentication
    ├─► OPENROUTER_BASE_URL   ─► API endpoint
    ├─► PORT                  ─► Server port
    ├─► MODEL_NAME            ─► Default model
    ├─► APP_TITLE             ─► Attribution header
    └─► APP_URL               ─► Attribution header
```

## Technology Stack Summary

| Layer        | Technology      | Purpose                    |
|--------------|-----------------|----------------------------|
| Frontend     | React 18        | UI framework               |
| Frontend     | TypeScript      | Type safety                |
| Frontend     | Vite            | Build tool                 |
| Frontend     | Axios           | HTTP client                |
| Backend      | FastAPI         | Web framework              |
| Backend      | Uvicorn         | ASGI server                |
| Backend      | HTTPX           | Async HTTP client          |
| Backend      | Pydantic        | Data validation            |
| Storage      | Python dict     | In-memory store (dev)      |
| External API | OpenRouter      | AI model routing           |
| External API | OpenAI/etc      | AI model providers         |

## Next Steps for Production

1. **Add Database**: Replace in-memory storage with PostgreSQL
2. **Add Authentication**: Implement JWT or OAuth2
3. **Add Rate Limiting**: Prevent abuse
4. **Add Monitoring**: Prometheus + Grafana
5. **Add Caching**: Redis for sessions and model cache
6. **Add Queue**: Celery for background tasks
7. **Containerize**: Docker + Docker Compose
8. **Deploy**: Kubernetes or cloud platform
9. **Add Tests**: Unit, integration, e2e tests
10. **Add CI/CD**: GitHub Actions or similar
