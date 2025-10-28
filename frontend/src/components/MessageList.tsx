import { useState, useEffect, useRef } from 'react'
import { apiService, Message as MessageType } from '../services/api'
import Message from './Message'

interface MessageListProps {
  conversationId: string
  messages: MessageType[]
  streamingMessage: MessageType | null
  onMessagesUpdate: (messages: MessageType[]) => void
}

export default function MessageList({ 
  conversationId, 
  messages, 
  streamingMessage,
  onMessagesUpdate 
}: MessageListProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) return

    const loadMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getMessages(conversationId)
        onMessagesUpdate(data.messages || [])
      } catch (err: any) {
        console.error('Failed to load messages:', err)
        setError(err.response?.data?.detail || 'Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [conversationId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 animate-pulse"></div>
            <svg className="absolute inset-0 animate-spin h-20 w-20 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-300 font-medium">Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center glass-dark p-8 rounded-2xl border border-red-500/30 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-300 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-ghost text-sm"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty State */}
        {messages.length === 0 && !streamingMessage && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 mb-6 animate-float">
              <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Ready to chat!</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Type your message below to start a conversation with AI. Your messages will appear here in real-time.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span>Connected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Streaming enabled</span>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {/* Streaming Message */}
        {streamingMessage && (
          <Message message={streamingMessage} isStreaming />
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
