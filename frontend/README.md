# Frontend - React + Vite + TypeScript + TailwindCSS

Modern React frontend for the Open Chat application, built with Vite, TypeScript, TailwindCSS, and React Router.

## Features

- ⚡ **Vite** - Lightning-fast build tool
- ⚛️ **React 18** - Modern React with hooks
- 🔷 **TypeScript** - Full type safety
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 🛣️ **React Router** - Client-side routing
- 💬 **Real-time Chat** - SSE streaming from backend
- � **Responsive Design** - Mobile-friendly UI
- 🔄 **Model Selection** - Choose AI models per conversation

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **EventSource** - SSE for streaming

## Project Structure

```
src/
├── pages/
│   ├── Home.tsx              # Landing page with model selection
│   └── Chat.tsx              # Real-time chat interface
├── services/
│   └── api.ts                # API client and types
├── App.tsx                   # Router setup
├── main.tsx                  # Entry point
└── index.css                 # Global styles with Tailwind
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Pages

### Home Page (`/`)

Landing page with:
- **Model Selection Dropdown** - Choose from available OpenRouter models
- **New Chat Button** - Creates a conversation and navigates to chat
- Beautiful gradient background
- Model list fetched from backend

**Features:**
- Fetches available models from `/models` endpoint
- Creates conversation with selected model as default
- Handles loading and error states
- Responsive design

### Chat Page (`/chat/:conversationId`)

Real-time chat interface with:
- **Message History** - All messages in the conversation
- **Streaming Responses** - Real-time AI responses via SSE
- **Model Override** - Change model per message
- **Auto-scroll** - Automatically scrolls to latest message
- **Back Button** - Return to home

**Features:**
- Loads conversation and message history
- Sends messages with optional model override
- Streams AI responses in real-time using EventSource (SSE)
- Shows typing indicator during streaming
- Handles connection errors gracefully
- Clean, modern chat UI

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8001`.

### API Service (`src/services/api.ts`)

Provides typed methods for all backend endpoints:

```typescript
// Get available models
const { models } = await apiService.getModels()

// Create conversation
const conversation = await apiService.createConversation({
  default_model: 'openai/gpt-3.5-turbo'
})

// Send message
const message = await apiService.sendMessage(conversationId, {
  message: 'Hello!',
  model: 'openai/gpt-4' // optional override
})

// Stream response (SSE)
const streamUrl = apiService.getStreamUrl(conversationId, model)
const eventSource = new EventSource(streamUrl)
```

## Routing

Uses React Router DOM for navigation:

```typescript
<Router>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/chat/:conversationId" element={<Chat />} />
  </Routes>
</Router>
```

**Routes:**
- `/` - Home page with model selection
- `/chat/:conversationId` - Chat page for specific conversation

## Styling with TailwindCSS

The app uses TailwindCSS for all styling:

```tsx
// Example usage
<button className="bg-gradient-to-r from-primary-500 to-secondary-500 
                   text-white font-semibold py-4 px-6 rounded-lg 
                   hover:from-primary-600 hover:to-secondary-600 
                   transition-all duration-200">
  Start New Chat
</button>
```

**Custom Colors:**
- `primary-*` - Purple gradient (500: #667eea)
- `secondary-*` - Purple gradient (500: #764ba2)

**Configuration:**
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS setup
- `src/index.css` - Tailwind directives

## Real-time Streaming

Chat uses Server-Sent Events (SSE) for real-time streaming:

```typescript
const eventSource = new EventSource(streamUrl)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  
  if (data.content) {
    // Append chunk to streaming message
    setStreamingContent(prev => prev + data.content)
  } else if (data.done) {
    // Stream complete - save message
    addMessageToHistory(streamingContent)
  }
}
```

## TypeScript Types

All API types are defined in `src/services/api.ts`:

```typescript
interface Conversation {
  id: string
  default_model: string
  created_at: string
  updated_at: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  timestamp: string
}
```
