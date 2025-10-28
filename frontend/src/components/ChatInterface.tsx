import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import './ChatInterface.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post('http://localhost:8001/api/chat', {
        message: input
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      console.error('Error sending message:', err)
      setError(
        err.response?.data?.detail || 
        'Failed to get response. Make sure the backend is running and configured correctly.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat</h2>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-button">
            Clear Chat
          </button>
        )}
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 Start a conversation!</p>
            <p className="empty-hint">Type a message below to get started</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.role}`}
            >
              <div className="message-header">
                <span className="message-role">
                  {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-header">
              <span className="message-role">🤖 Assistant</span>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="message-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="send-button"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}

export default ChatInterface
