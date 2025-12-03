# **Open Chat - Developer Guide**

**Version 1.0**  
**CIS 434 Software Engineering Project**  
**Team:** Luaiy Nawabit, Yuvaraj Vagula, Kayden Naida  
**Date:** December 3, 2025

---

## **Table of Contents**

1. [Introduction](#1-introduction)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Project Architecture](#3-project-architecture)
4. [Backend Development](#4-backend-development)
5. [Frontend Development](#5-frontend-development)
6. [Database Management](#6-database-management)
7. [Testing and Debugging](#7-testing-and-debugging)
8. [Docker Development](#8-docker-development)
9. [API Integration](#9-api-integration)
10. [Code Style and Standards](#10-code-style-and-standards)
11. [Common Development Tasks](#11-common-development-tasks)
12. [Troubleshooting](#12-troubleshooting)
13. [Contributing Guidelines](#13-contributing-guidelines)

---

## **1. Introduction**

### **1.1 Purpose**

This developer guide provides comprehensive instructions for setting up, developing, and maintaining the Open Chat application. It covers everything from initial setup to advanced development workflows.

### **1.2 Prerequisites**

**Required Knowledge:**
- Python 3.8+ and virtual environments
- JavaScript/TypeScript and React
- RESTful API design
- Git version control
- Basic Docker concepts

**Required Software:**
- Python 3.8 or higher
- Node.js 18+ and npm
- Git
- Docker Desktop (optional, for containerized development)
- Visual Studio Code (recommended) or preferred IDE

### **1.3 Repository Structure**

```
CIS434_Project/
├── backend/                 # FastAPI backend
│   ├── alembic/            # Database migrations
│   ├── services/           # Service modules
│   ├── main.py             # Application entry point
│   ├── models.py           # SQLAlchemy models
│   ├── database.py         # Database configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Route components
│   │   ├── services/      # API client
│   │   └── App.tsx        # Root component
│   ├── public/            # Static assets
│   └── package.json       # Node dependencies
├── docs/                  # Documentation
├── docker-compose.yml     # Docker orchestration
└── .env.example          # Environment template
```

---

## **2. Development Environment Setup**

### **2.1 Initial Setup**

#### **Step 1: Clone the Repository**

```bash
git clone <repository-url>
cd CIS434_Project
```

#### **Step 2: Set Up Environment Variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
# Required: OPENROUTER_API_KEY
# Optional: PORT, DATABASE_URL, etc.
```

**Environment Variables:**

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Optional (have defaults)
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=8001
MODEL_NAME=openai/gpt-3.5-turbo
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
DATABASE_URL=sqlite:///./chat_app.db
```

### **2.2 Backend Setup**

#### **Step 1: Create Virtual Environment**

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate
```

#### **Step 2: Install Dependencies**

```bash
pip install -r requirements.txt
```

**Key Dependencies:**
- `fastapi==0.109.0` - Web framework
- `uvicorn[standard]==0.27.0` - ASGI server
- `httpx==0.26.0` - Async HTTP client
- `sqlalchemy==2.0.25` - ORM
- `alembic==1.13.1` - Database migrations
- `python-dotenv==1.0.0` - Environment variables

#### **Step 3: Initialize Database**

```bash
# Run migrations to create database schema
alembic upgrade head

# Verify database was created
ls chat_app.db  # Should exist in backend directory
```

#### **Step 4: Start Backend Server**

```bash
# Start with auto-reload for development
uvicorn main:app --reload --port 8001

# Alternative: run main.py directly
python main.py
```

**Verify Backend:**
- Server: http://localhost:8001
- API Docs: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

### **2.3 Frontend Setup**

#### **Step 1: Install Dependencies**

```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install
```

**Key Dependencies:**
- `react@18.2.0` - UI library
- `react-router-dom@6.21.1` - Routing
- `axios@1.6.5` - HTTP client
- `tailwindcss@3.4.1` - CSS framework
- `typescript@5.2.2` - Type safety

#### **Step 2: Start Development Server**

```bash
npm run dev
```

**Verify Frontend:**
- Application: http://localhost:5173
- Hot reload should be working

### **2.4 Verify Full Stack**

1. **Backend health check:**
   ```bash
   curl http://localhost:8001/health
   ```

2. **Frontend loads:**
   - Open http://localhost:5173
   - Model dropdown should populate

3. **Create a test conversation:**
   - Select a model
   - Click "Start New Chat"
   - Send a test message

---

## **3. Project Architecture**

### **3.1 System Overview**

```
┌─────────────────┐
│   React SPA     │  ← User Interface
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/SSE
         ↓
┌─────────────────┐
│  FastAPI Server │  ← Backend API
│  (Port 8001)    │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│  OpenRouter API │  ← AI Model Gateway
└─────────────────┘
         │
         ↓
┌─────────────────┐
│   AI Models     │  ← GPT-4, Claude, etc.
└─────────────────┘
```

### **3.2 Data Flow**

**Creating a Conversation:**
```
User clicks "Start Chat"
  ↓
Frontend POST /conversations
  ↓
Backend creates conversation in memory
  ↓
Returns conversation ID
  ↓
Frontend navigates to /chat/:id
```

**Sending a Message:**
```
User types message and hits send
  ↓
Frontend POST /conversations/:id/messages
  ↓
Backend stores message
  ↓
Frontend connects to /conversations/:id/stream (SSE)
  ↓
Backend streams chunks to OpenRouter
  ↓
Backend forwards chunks to frontend via SSE
  ↓
Frontend displays streaming response in real-time
```

### **3.3 Key Design Patterns**

**Backend:**
- **Dependency Injection**: `get_db()` for database sessions
- **Service Layer**: `services/openrouter.py` abstracts API calls
- **In-Memory Storage**: Dictionaries for development (ready for DB migration)
- **Async Streaming**: Using `httpx.AsyncClient` and `yield`

**Frontend:**
- **Component-Based**: Reusable React components
- **Service Layer**: `services/api.ts` centralizes backend calls
- **Client-Side Routing**: React Router for SPA navigation
- **Real-Time Updates**: EventSource for SSE streaming

---

## **4. Backend Development**

### **4.1 Project Structure**

```
backend/
├── main.py              # FastAPI app and endpoints
├── models.py            # SQLAlchemy models
├── database.py          # Database configuration
├── services/
│   ├── __init__.py
│   └── openrouter.py    # OpenRouter API integration
├── alembic/             # Database migrations
├── test_api.py          # Integration tests
└── test_service.py      # Unit tests
```

### **4.2 Adding New Endpoints**

**Example: Add a "Get Conversation Stats" Endpoint**

```python
# In main.py

@app.get("/conversations/{conversation_id}/stats")
async def get_conversation_stats(conversation_id: str):
    """Get statistics about a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv = conversations[conversation_id]
    message_count = len(conv["messages"])
    
    # Count messages by role
    user_messages = sum(1 for m in conv["messages"] if m["role"] == "user")
    assistant_messages = sum(1 for m in conv["messages"] if m["role"] == "assistant")
    
    return {
        "conversation_id": conversation_id,
        "total_messages": message_count,
        "user_messages": user_messages,
        "assistant_messages": assistant_messages,
        "default_model": conv["default_model"],
        "created_at": conv["created_at"]
    }
```

### **4.3 Working with OpenRouter Service**

The [`openrouter.py`](../backend/services/openrouter.py) service provides clean abstractions:

```python
from services.openrouter import send_to_openrouter, get_available_models

# Streaming request
async for chunk in send_to_openrouter(messages, model):
    # Process chunk
    yield chunk

# Get models (cached for 1 hour)
models = await get_available_models()
```

### **4.4 Logging Best Practices**

```python
import logging

# Use module-level logger
logger = logging.getLogger(__name__)

# Log at appropriate levels
logger.info(f"Creating conversation with model: {default_model}")
logger.warning(f"Model override detected: {model}")
logger.error(f"OpenRouter API error: {e}")

# Log exceptions with stack traces
logger.exception("Unexpected error in stream_response")
```

### **4.5 Error Handling**

```python
from fastapi import HTTPException

# Client errors (4xx)
if conversation_id not in conversations:
    raise HTTPException(
        status_code=404,
        detail=f"Conversation {conversation_id} not found"
    )

# Server errors (5xx)
try:
    # API call
    response = await client.post(...)
except Exception as e:
    logger.exception("OpenRouter API failed")
    raise HTTPException(
        status_code=500,
        detail="Failed to communicate with OpenRouter"
    )
```

### **4.6 Testing Backend Changes**

```bash
# Run integration tests
python test_api.py

# Run service tests
python test_service.py

# Manual testing with curl
curl http://localhost:8001/conversations

# Test streaming
curl -N http://localhost:8001/conversations/{id}/stream
```

---

## **5. Frontend Development**

### **5.1 Project Structure**

```
frontend/src/
├── pages/
│   ├── Home.tsx         # Landing page
│   ├── Chat.tsx         # Chat interface
│   ├── LoginPage.tsx    # Login (scaffolded)
│   └── RegisterPage.tsx # Registration (scaffolded)
├── services/
│   └── api.ts           # API client
├── App.tsx              # Router setup
├── main.tsx             # Entry point
└── index.css            # Global styles
```

### **5.2 Component Development**

**Creating a New Component:**

```typescript
// src/components/MessageList.tsx
import React from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
}

interface MessageListProps {
  messages: Message[]
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${
            message.role === 'user'
              ? 'bg-blue-500/20 ml-auto'
              : 'bg-gray-500/20'
          }`}
        >
          <p className="text-white">{message.content}</p>
          {message.model && (
            <span className="text-xs text-gray-400">{message.model}</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### **5.3 API Service Layer**

All backend communication goes through [`api.ts`](../frontend/src/services/api.ts):

```typescript
// Add a new API method
export const apiService = {
  // Existing methods...
  
  async getConversationStats(conversationId: string) {
    const response = await api.get(`/conversations/${conversationId}/stats`)
    return response.data
  }
}
```

### **5.4 State Management**

**Using React Hooks:**

```typescript
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadConversation() {
      try {
        setIsLoading(true)
        const conv = await apiService.getConversation(conversationId)
        setMessages(conv.messages)
      } catch (err) {
        setError('Failed to load conversation')
      } finally {
        setIsLoading(false)
      }
    }
    loadConversation()
  }, [conversationId])

  // Component JSX...
}
```

### **5.5 Styling with Tailwind**

The project uses a custom glass morphism design. Key utilities:

```css
/* Glass card */
.glass {
  @apply bg-white/5 backdrop-blur-xl border border-white/10;
}

/* Glass with stronger effect */
.glass-strong {
  @apply bg-white/10 backdrop-blur-2xl border border-white/20;
}

/* Gradient backgrounds */
.bg-gradient-radial {
  background: radial-gradient(circle at center, ...);
}
```

**Using in Components:**

```tsx
<div className="glass-strong rounded-2xl p-6 shadow-2xl">
  <h2 className="text-2xl font-bold text-white">Chat</h2>
  {/* Content */}
</div>
```

### **5.6 Real-Time Streaming**

**Implementing SSE:**

```typescript
function useStreamingResponse(conversationId: string, model?: string) {
  const [response, setResponse] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const startStreaming = () => {
    const streamUrl = apiService.getStreamUrl(conversationId, model)
    const eventSource = new EventSource(streamUrl)

    setIsStreaming(true)
    setResponse('')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.content) {
        setResponse((prev) => prev + data.content)
      }
      if (data.done) {
        eventSource.close()
        setIsStreaming(false)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      setIsStreaming(false)
    }

    return () => eventSource.close()
  }

  return { response, isStreaming, startStreaming }
}
```

---

## **6. Database Management**

### **6.1 Database Schema**

The application uses SQLAlchemy ORM with the following models defined in [`models.py`](../backend/models.py):

**User Model:**
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    # ... more fields
```

**Conversation Model:**
```python
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, nullable=False, index=True)
    default_model = Column(String, nullable=False)
    # ... relationships
```

**Message Model:**
```python
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    model = Column(String)  # Optional override
```

### **6.2 Creating Migrations**

**After modifying models:**

```bash
# Generate migration automatically
alembic revision --autogenerate -m "Add user profile fields"

# Review the generated migration file
# Located in: alembic/versions/xxx_add_user_profile_fields.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

### **6.3 Working with Database Sessions**

```python
from database import SessionLocal, get_db
from fastapi import Depends
from sqlalchemy.orm import Session

@app.get("/conversations")
async def list_conversations(db: Session = Depends(get_db)):
    """List all conversations using database"""
    conversations = db.query(Conversation).all()
    return conversations

@app.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db)
):
    """Create conversation in database"""
    conv = Conversation(
        uuid=str(uuid4()),
        default_model=data.default_model
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv
```

### **6.4 Database Configuration**

**Development (SQLite):**
```python
# database.py
DATABASE_URL = "sqlite:///./chat_app.db"
```

**Production (PostgreSQL):**
```python
# database.py
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost/chat_app"
)
```

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@localhost/chat_app

# Run migrations
alembic upgrade head
```

### **6.5 Database Utilities**

**Initialize database (development):**
```python
from database import init_db

init_db()  # Creates all tables
```

**Reset database:**
```bash
# Delete database file
rm chat_app.db

# Re-run migrations
alembic upgrade head
```

---

## **7. Testing and Debugging**

### **7.1 Backend Testing**

**Integration Tests:**

```bash
# Run all API tests
python test_api.py
```

**Service Tests:**

```bash
# Run service-specific tests
python test_service.py
```

**Manual API Testing:**

```bash
# Test health endpoint
curl http://localhost:8001/health

# Test models endpoint
curl http://localhost:8001/models

# Create conversation
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-3.5-turbo"}'

# Send message
curl -X POST http://localhost:8001/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test streaming
curl -N http://localhost:8001/conversations/{id}/stream
```

### **7.2 Frontend Testing**

**Browser DevTools:**

1. **Console** - Check for JavaScript errors
2. **Network** - Monitor API calls and SSE streams
3. **Application** - Inspect localStorage/cookies
4. **React DevTools** - Component state and props

**Common Checks:**

```javascript
// Check API base URL
console.log(import.meta.env.VITE_API_BASE_URL)

// Test API service
import { apiService } from './services/api'
const models = await apiService.getModels()
console.log(models)
```

### **7.3 Debugging Techniques**

**Backend Debugging:**

```python
# Add print statements
print(f"DEBUG: Conversation ID: {conversation_id}")

# Use Python debugger
import pdb; pdb.set_trace()

# Check logs
logger.info(f"Request data: {data}")
logger.debug(f"Conversation state: {conversations[conversation_id]}")
```

**Frontend Debugging:**

```typescript
// Console logging
console.log('Message sent:', message)
console.error('API error:', error)

// Debugger statement
debugger

// React DevTools
// Right-click component → Inspect → Components tab
```

### **7.4 Common Issues and Solutions**

| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS middleware in [`main.py`](../backend/main.py) |
| SSE not connecting | Verify backend is running, check network tab |
| Database locked | Close other connections, use PostgreSQL in production |
| Module not found | Activate virtual environment, reinstall dependencies |
| Port already in use | Change port or kill existing process |

---

## **8. Docker Development**

### **8.1 Docker Architecture**

The application uses Docker Compose to orchestrate two services:

**Services:**
- **backend**: FastAPI on port 8001
- **frontend**: Nginx serving React build on port 5173

### **8.2 Building and Running**

```bash
# Build and start services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend
```

### **8.3 Development with Docker**

**Live code changes:**

The [`docker-compose.yml`](../docker-compose.yml) includes volume mounts for development:

```yaml
volumes:
  - ./backend:/app  # Backend code hot-reload
  - ./backend/data:/app/data  # Persist database
```

**Accessing containers:**

```bash
# Execute command in backend container
docker-compose exec backend bash

# Check logs
docker-compose logs backend

# Restart service
docker-compose restart backend
```

### **8.4 Docker Best Practices**

**Use .dockerignore:**

```
# Backend .dockerignore
__pycache__/
*.pyc
*.pyo
*.pyd
.env
venv/
*.db

# Frontend .dockerignore
node_modules/
dist/
.env*
*.log
```

**Multi-stage builds (frontend):**

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## **9. API Integration**

### **9.1 OpenRouter Integration**

The [`services/openrouter.py`](../backend/services/openrouter.py) module handles all OpenRouter API communication:

**Key Functions:**

```python
# Streaming request
async for chunk in send_to_openrouter(messages, model):
    yield chunk

# Non-streaming request
response = await send_to_openrouter_no_stream(messages, model)

# Get available models (cached)
models = await get_available_models()
```

### **9.2 Request Format**

**Chat Completion:**

```python
{
    "model": "openai/gpt-4",
    "messages": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"},
        {"role": "user", "content": "How are you?"}
    ],
    "stream": True
}
```

**Required Headers:**

```python
headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "HTTP-Referer": APP_URL,
    "X-Title": APP_TITLE,
    "Content-Type": "application/json"
}
```

### **9.3 Handling Responses**

**Streaming (SSE):**

```python
async for chunk in send_to_openrouter(messages, model):
    if chunk:
        # Parse Server-Sent Event
        if chunk.startswith("data: "):
            content = chunk[6:]  # Remove "data: " prefix
            if content.strip() == "[DONE]":
                break
            data = json.loads(content)
            if delta := data.get("choices", [{}])[0].get("delta", {}):
                if content := delta.get("content"):
                    yield content
```

**Non-Streaming:**

```python
response = await send_to_openrouter_no_stream(messages, model)
content = response["choices"][0]["message"]["content"]
```

### **9.4 Error Handling**

```python
try:
    async for chunk in send_to_openrouter(messages, model):
        yield chunk
except httpx.HTTPStatusError as e:
    logger.error(f"OpenRouter API error: {e.response.status_code}")
    raise HTTPException(
        status_code=e.response.status_code,
        detail="OpenRouter API request failed"
    )
except Exception as e:
    logger.exception("Unexpected error in OpenRouter streaming")
    raise HTTPException(
        status_code=500,
        detail="Internal server error"
    )
```

---

## **10. Code Style and Standards**

### **10.1 Python Style Guide**

**Follow PEP 8:**

```python
# Good: lowercase with underscores
def get_conversation_by_id(conversation_id: str):
    pass

# Good: descriptive names
user_messages = [m for m in messages if m["role"] == "user"]

# Good: type hints
def create_conversation(default_model: str) -> dict:
    return {...}

# Good: docstrings
def stream_response(conversation_id: str, model: Optional[str] = None):
    """
    Stream AI response using Server-Sent Events.
    
    Args:
        conversation_id: UUID of the conversation
        model: Optional model override
        
    Yields:
        Server-Sent Event chunks
    """
    pass
```

**Code formatting:**

```bash
# Install black (optional)
pip install black

# Format code
black main.py
```

### **10.2 TypeScript Style Guide**

**Type safety:**

```typescript
// Good: explicit types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
}

// Good: typed function
async function sendMessage(
  conversationId: string,
  message: string,
  model?: string
): Promise<Message> {
  // Implementation
}

// Good: React component types
interface ChatProps {
  conversationId: string
  defaultModel: string
}

const Chat: React.FC<ChatProps> = ({ conversationId, defaultModel }) => {
  // Component code
}
```

**Naming conventions:**

```typescript
// Components: PascalCase
const MessageList = () => {}

// Functions: camelCase
const formatTimestamp = (date: Date) => {}

// Constants: UPPER_CASE
const API_BASE_URL = 'http://localhost:8001'

// Interfaces: PascalCase with 'I' prefix (optional)
interface IUser {
  id: string
  name: string
}
```

### **10.3 Git Workflow**

**Branch naming:**

```bash
# Features
git checkout -b feature/add-user-authentication

# Bug fixes
git checkout -b fix/streaming-connection-error

# Documentation
git checkout -b docs/update-developer-guide
```

**Commit messages:**

```bash
# Good commits
git commit -m "Add user authentication endpoint"
git commit -m "Fix SSE reconnection bug in Chat component"
git commit -m "Update developer guide with Docker section"

# Bad commits
git commit -m "fix stuff"
git commit -m "wip"
```

**Pull request workflow:**

1. Create feature branch
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Request code review
6. Address feedback
7. Merge to main

---

## **11. Common Development Tasks**

### **11.1 Adding a New AI Model**

Models are automatically fetched from OpenRouter, but to set a new default:

```python
# Update .env
MODEL_NAME=anthropic/claude-3-opus

# Or in frontend dropdown, select different model
```

### **11.2 Implementing User Authentication**

**Step 1: Create auth endpoints (backend)**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/auth/register")
async def register(username: str, password: str, db: Session = Depends(get_db)):
    # Hash password
    hashed = hash_password(password)
    
    # Create user
    user = User(username=username, hashed_password=hashed)
    db.add(user)
    db.commit()
    
    return {"message": "User created"}

@app.post("/auth/login")
async def login(username: str, password: str, db: Session = Depends(get_db)):
    # Verify credentials
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session token
    token = create_access_token(user.id)
    return {"access_token": token}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    # Verify token and return user
    user_id = decode_token(credentials.credentials)
    return db.query(User).filter(User.id == user_id).first()
```

**Step 2: Protect endpoints**

```python
@app.get("/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Return only user's conversations
    return db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).all()
```

**Step 3: Frontend authentication**

```typescript
// services/api.ts
export const apiService = {
  async register(username: string, password: string) {
    const response = await api.post('/auth/register', { username, password })
    return response.data
  },

  async login(username: string, password: string) {
    const response = await api.post('/auth/login', { username, password })
    localStorage.setItem('token', response.data.access_token)
    return response.data
  },

  async logout() {
    localStorage.removeItem('token')
  }
}

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

### **11.3 Migrating from In-Memory to Database**

**Current (in-memory):**

```python
conversations = {}  # Dictionary

@app.post("/conversations")
async def create_conversation(data: ConversationCreate):
    conv_id = str(uuid4())
    conversations[conv_id] = {
        "id": conv_id,
        "default_model": data.default_model,
        "messages": []
    }
    return conversations[conv_id]
```

**Migrated (database):**

```python
@app.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    db: Session = Depends(get_db)
):
    conv = Conversation(
        uuid=str(uuid4()),
        default_model=data.default_model
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv
```

**Migration checklist:**
1. ✅ Models defined in [`models.py`](../backend/models.py)
2. ✅ Database configured in [`database.py`](../backend/database.py)
3. ✅ Migrations created with Alembic
4. Update all endpoints to use `db: Session = Depends(get_db)`
5. Replace dictionary operations with SQLAlchemy queries
6. Test thoroughly

### **11.4 Adding Markdown Support**

**Step 1: Install markdown library (frontend)**

```bash
npm install react-markdown
```

**Step 2: Update Message component**

```typescript
import ReactMarkdown from 'react-markdown'

function Message({ content }: { content: string }) {
  return (
    <div className="message">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
```

**Step 3: Style code blocks**

```tsx
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

<ReactMarkdown
  components={{
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }}
>
  {content}
</ReactMarkdown>
```

### **11.5 Adding Conversation Export**

**Backend endpoint:**

```python
@app.get("/conversations/{conversation_id}/export")
async def export_conversation(conversation_id: str):
    """Export conversation as JSON"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conv = conversations[conversation_id]
    
    # Format for export
    export_data = {
        "conversation_id": conversation_id,
        "default_model": conv["default_model"],
        "created_at": conv["created_at"],
        "messages": [
            {
                "role": msg["role"],
                "content": msg["content"],
                "timestamp": msg["timestamp"]
            }
            for msg in conv["messages"]
        ]
    }
    
    return JSONResponse(
        content=export_data,
        headers={
            "Content-Disposition": f"attachment; filename=conversation_{conversation_id}.json"
        }
    )
```

**Frontend button:**

```typescript
async function exportConversation(conversationId: string) {
  try {
    const response = await fetch(
      `http://localhost:8001/conversations/${conversationId}/export`
    )
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation_${conversationId}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

// In component
<button onClick={() => exportConversation(conversationId)}>
  Export Conversation
</button>
```

---

## **12. Troubleshooting**

### **12.1 Backend Issues**

**Problem: Server won't start**

```bash
# Check if port is in use
netstat -ano | findstr :8001

# Kill process using port (Windows)
taskkill /PID <PID> /F

# Use different port
uvicorn main:app --reload --port 8002
```

**Problem: Import errors**

```bash
# Verify virtual environment is activated
# Should see (venv) in prompt

# Reinstall dependencies
pip install -r requirements.txt

# Check Python version
python --version  # Should be 3.8+
```

**Problem: Database errors**

```bash
# Reset database
rm chat_app.db
alembic upgrade head

# Check migration status
alembic current

# View migration history
alembic history
```

**Problem: OpenRouter API errors**

```bash
# Verify API key in .env
cat .env | grep OPENROUTER_API_KEY

# Test API key
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"

# Check backend logs for detailed errors
# Look for HTTPStatusError messages
```

### **12.2 Frontend Issues**

**Problem: Frontend won't start**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+

# Try different port
npm run dev -- --port 5174
```

**Problem: API calls failing**

```javascript
// Check API base URL in browser console
console.log(import.meta.env.VITE_API_BASE_URL)

// Verify backend is running
curl http://localhost:8001/health

// Check CORS in Network tab
// Look for preflight OPTIONS requests
```

**Problem: Streaming not working**

```javascript
// Check EventSource connection
const streamUrl = `http://localhost:8001/conversations/${id}/stream`
const eventSource = new EventSource(streamUrl)

eventSource.addEventListener('error', (e) => {
  console.error('SSE Error:', e)
})

// Verify backend streaming endpoint
curl -N http://localhost:8001/conversations/{id}/stream
```

**Problem: Build errors**

```bash
# Clear dist folder
rm -rf dist

# Rebuild
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### **12.3 Docker Issues**

**Problem: Container won't start**

```bash
# Check logs
docker-compose logs backend

# Remove and rebuild
docker-compose down
docker-compose up --build

# Check if port is in use
docker ps -a
```

**Problem: Database not persisting**

```bash
# Check volume mounts in docker-compose.yml
volumes:
  - ./backend/data:/app/data

# Verify data directory exists
mkdir -p backend/data
```

**Problem: Environment variables not loading**

```bash
# Verify .env file exists in project root
ls -la .env

# Check docker-compose.yml env_file
env_file:
  - .env

# Rebuild after .env changes
docker-compose down
docker-compose up --build
```

### **12.4 Performance Issues**

**Problem: Slow API responses**

```python
# Add timing logs
import time

start = time.time()
# ... operation ...
logger.info(f"Operation took {time.time() - start:.2f}s")

# Profile OpenRouter calls
# Check if model is slow or API is congested
```

**Problem: Memory leaks**

```python
# Check for unclosed connections
# Always use context managers

async with httpx.AsyncClient() as client:
    # Use client

# Close EventSource connections
eventSource.close()
```

---

## **13. Contributing Guidelines**

### **13.1 Code Review Process**

**Before submitting PR:**

1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ Documentation updated
4. ✅ Commit messages are clear
5. ✅ No unnecessary files committed

**Review checklist:**

- Code is readable and well-documented
- Error handling is comprehensive
- Tests cover new functionality
- No security vulnerabilities
- Performance is acceptable

### **13.2 Testing Requirements**

**Backend changes require:**

```bash
# All integration tests pass
python test_api.py

# Service tests pass
python test_service.py

# Manual testing of affected endpoints
curl http://localhost:8001/your-new-endpoint
```

**Frontend changes require:**

- Visual testing in browser
- Responsive design check (mobile/desktop)
- Browser console has no errors
- Network tab shows expected API calls

### **13.3 Documentation Standards**

**Update documentation when:**

- Adding new endpoints → Update [`README.md`](../backend/README.md)
- Changing API contracts → Update [`documentation.md`](./documentation.md)
- Adding features → Update [`user_manual.md`](./user_manual.md)
- Changing setup → Update [`QUICKSTART.md`](../backend/QUICKSTART.md)

**Documentation should include:**

- Clear description of feature/change
- Code examples
- Configuration requirements
- Known limitations

### **13.4 Security Best Practices**

**Never commit:**
- `.env` files with real API keys
- Passwords or tokens
- Database files with real data
- API keys in code

**Always:**
- Use environment variables for secrets
- Validate user input
- Sanitize database queries
- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated

**Example: Secure endpoint**

```python
from pydantic import BaseModel, validator

class MessageCreate(BaseModel):
    message: str
    
    @validator('message')
    def validate_message(cls, v):
        if len(v) > 10000:
            raise ValueError('Message too long')
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()

@app.post("/messages")
async def create_message(data: MessageCreate):
    # Input is validated by Pydantic
    # No SQL injection risk with ORM
    pass
```

---

## **Conclusion**

This developer guide provides a comprehensive reference for working on the Open Chat project. For additional information, refer to:

- [Project Documentation](./documentation.md) - Complete technical documentation
- [User Manual](./user_manual.md) - End-user guide
- [Backend README](../backend/README.md) - Backend-specific docs
- [Frontend README](../frontend/README.md) - Frontend-specific docs
- [Docker Guide](../DOCKER.md) - Docker deployment
- [Architecture Guide](../ARCHITECTURE.md) - System architecture

**For Support:**
- Check troubleshooting section above
- Review existing documentation files
- Check GitHub issues (if applicable)
- Contact development team

**Happy coding!** 🚀

---

*Last Updated: December 3, 2025*
*Version: 1.0*
*Authors: Luaiy Nawabit, Yuvaraj Vagula, Kayden Naida*