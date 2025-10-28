# Chat UI Components

Complete chat UI implementation with sidebar, header, message list, and input components.

## Components Overview

### 1. **ConversationSidebar** (`ConversationSidebar.tsx`)

Displays list of all conversations with ability to:
- Create new conversation (navigates to Home)
- Select/switch between conversations
- Delete conversations
- Collapse/expand sidebar
- Show conversation metadata (model, timestamp)

**Features:**
- Auto-refreshes on route change
- Highlights current conversation
- Shows relative timestamps (e.g., "5m ago", "2h ago")
- Collapsible to save space
- Delete confirmation dialog

**Props:**
```typescript
interface ConversationSidebarProps {
  currentConversationId?: string
  onSelectConversation: (id: string) => void
}
```

### 2. **ChatHeader** (`ChatHeader.tsx`)

Header showing conversation info and model selector:
- Current conversation ID
- **Model dropdown** with live update
- Click to edit, select new model, save/cancel
- PATCH request to `/conversations/:id` on save
- Updates local conversation state

**Features:**
- Inline model editing
- Fetches available models on mount
- Shows loading state during update
- Displays model name (not just ID)
- Save/cancel buttons

**Props:**
```typescript
interface ChatHeaderProps {
  conversation: Conversation | null
  onModelChange: (modelId: string) => void
}
```

### 3. **MessageList** (`MessageList.tsx`)

Displays all messages in conversation:
- User messages (right-aligned, white/transparent)
- Assistant messages (left-aligned, white background)
- Streaming message with typing indicator
- Auto-scrolls to bottom
- Empty state with friendly message

**Features:**
- Loads messages from backend on mount
- Auto-scroll on new messages
- Loading spinner
- Error handling with retry
- Empty state UI

**Props:**
```typescript
interface MessageListProps {
  conversationId: string
  messages: Message[]
  streamingMessage: Message | null
  onMessagesUpdate: (messages: Message[]) => void
}
```

### 4. **Message** (`Message.tsx`)

Individual message component:
- Shows role icon (👤 You / 🤖 Assistant)
- Timestamp
- Message content with wrapping
- **Model badge** for assistant messages
- Typing indicator for streaming
- Different styling for user vs assistant

**Features:**
- Model badge shows which model generated response
- Supports streaming state
- Responsive design
- Proper text wrapping

**Props:**
```typescript
interface MessageProps {
  message: Message
  isStreaming?: boolean
}
```

### 5. **MessageInput** (`MessageInput.tsx`)

Text input with send button:
- Auto-resizing textarea
- Enter to send, Shift+Enter for new line
- Send button with loading spinner
- Disabled during streaming
- Character counter (optional)

**Features:**
- Auto-resize up to 200px height
- Keyboard shortcuts
- Disabled state during AI response
- Clear input after send

**Props:**
```typescript
interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled: boolean
  placeholder?: string
}
```

## Updated Chat Page

The `Chat.tsx` page now:
- Uses all the components above
- Manages conversation state
- Handles SSE streaming
- Syncs local state with backend
- Updates conversation model via PATCH

**Key Features:**
1. ✅ **Sidebar** - All conversations listed
2. ✅ **Header** - Model dropdown with live update (PATCH)
3. ✅ **Message List** - User + assistant messages
4. ✅ **Input Box** - Send button with keyboard shortcuts
5. ✅ **Streaming** - EventSource with real-time chunks
6. ✅ **Model Badges** - Shows which model generated each response
7. ✅ **State Sync** - Local state stays in sync with backend APIs

## State Management

### Local State (React)
- `conversation` - Current conversation object
- `messages` - Array of all messages
- `streamingMessage` - Temporary message being streamed
- `isStreaming` - Boolean flag
- `error` - Error message string

### Backend Sync
- **Load conversation:** GET `/conversations/:id`
- **Load messages:** GET `/conversations/:id/messages`
- **Send message:** POST `/conversations/:id/messages`
- **Stream response:** EventSource `/conversations/:id/stream`
- **Update model:** PATCH `/conversations/:id` (from header dropdown)
- **List conversations:** GET `/conversations` (sidebar)
- **Delete conversation:** DELETE `/conversations/:id` (sidebar)

## SSE Streaming Flow

1. User sends message
2. Add user message to local state immediately
3. Create EventSource connection to `/conversations/:id/stream`
4. Receive chunks via `onmessage`:
   - `{ content: "..." }` - Append to streaming message
   - `{ done: true, message_id: "..." }` - Finalize and add to messages
   - `{ model: "..." }` - Track which model was used
   - `{ error: "..." }` - Show error
5. Close EventSource when done

## Model Badge Implementation

Each assistant message shows a badge with the model used:

```tsx
{!isUser && message.model && (
  <div className="mt-3 pt-2 border-t border-gray-200/20">
    <div className="flex items-center gap-1">
      <svg className="w-3 h-3 opacity-60" ... />
      <span className="text-xs opacity-70 font-mono">
        {message.model}
      </span>
    </div>
  </div>
)}
```

This shows which model actually generated the response (could be conversation default or per-message override).

## Component Hierarchy

```
Chat.tsx
├── ConversationSidebar
│   ├── New Chat Button
│   ├── Conversation List
│   └── Collapse/Expand Button
├── Main Area
│   ├── ChatHeader
│   │   ├── Title
│   │   └── Model Dropdown (PATCH on change)
│   ├── Error Banner (if error)
│   ├── MessageList
│   │   ├── Message (user)
│   │   ├── Message (assistant) with model badge
│   │   └── Message (streaming)
│   └── MessageInput
│       ├── Auto-resize Textarea
│       └── Send Button
```

## Styling

All components use TailwindCSS with:
- Gradient background (primary/secondary colors)
- Backdrop blur effects
- Smooth transitions
- Responsive design
- Custom scrollbars
- Loading animations

## Type Safety

All components are fully typed with TypeScript:
- Props interfaces
- API response types
- Event handlers
- State management

No `any` types (except for error handling).
