import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { apiService, Message, Conversation } from '../services/api'
import ConversationSidebar from '../components/ConversationSidebar'
import ChatHeader from '../components/ChatHeader'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'

export default function Chat() {
  const { conversationId } = useParams<{ conversationId: string }>()
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const eventSourceRef = useRef<EventSource | null>(null)

  // Load conversation when conversationId changes
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) return

      try {
        const conv = await apiService.getConversation(conversationId)
        setConversation(conv)
        setError(null)
      } catch (err: any) {
        console.error('Failed to load conversation:', err)
        setError(err.response?.data?.detail || 'Failed to load conversation')
      }
    }

    loadConversation()
  }, [conversationId])

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const handleSendMessage = async (messageText: string) => {
    if (!conversationId || isStreaming) return

    setError(null)

    try {
      // Send user message
      const userMessage = await apiService.sendMessage(conversationId, {
        message: messageText,
      })

      // Add user message to local state
      setMessages((prev) => [...prev, userMessage])

      // Start streaming response
      setIsStreaming(true)
      
      // Initialize streaming message
      const tempMessage: Message = {
        id: 'streaming-temp',
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }
      setStreamingMessage(tempMessage)

      // Start SSE stream
      const streamUrl = apiService.getStreamUrl(conversationId)
      const eventSource = new EventSource(streamUrl)
      eventSourceRef.current = eventSource

      let fullResponse = ''
      let actualModel = conversation?.default_model

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.content) {
            fullResponse += data.content
            setStreamingMessage({
              ...tempMessage,
              content: fullResponse,
            })
          } else if (data.done) {
            // Streaming complete - add final assistant message
            const assistantMessage: Message = {
              id: data.message_id || `msg-${Date.now()}`,
              role: 'assistant',
              content: fullResponse,
              model: actualModel,
              timestamp: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setStreamingMessage(null)
            setIsStreaming(false)
            eventSource.close()
          } else if (data.model) {
            actualModel = data.model
          } else if (data.error) {
            setError(data.error)
            setStreamingMessage(null)
            setIsStreaming(false)
            eventSource.close()
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err)
        }
      }

      eventSource.onerror = () => {
        setError('Connection to server lost')
        setStreamingMessage(null)
        setIsStreaming(false)
        eventSource.close()
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      setError(err.response?.data?.detail || 'Failed to send message')
      setIsStreaming(false)
    }
  }

  const handleModelChange = (newModel: string) => {
    if (conversation) {
      setConversation({
        ...conversation,
        default_model: newModel,
      })
    }
  }

  const handleConversationSelect = (_id: string) => {
    // Navigation handled by sidebar
    // Just reset state
    setMessages([])
    setStreamingMessage(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar */}
      <ConversationSidebar 
        currentConversationId={conversationId}
        onSelectConversation={handleConversationSelect}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Decorative background elements - Red & Gold */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-primary-600/12 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-secondary-500/12 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <ChatHeader 
            conversation={conversation}
            onModelChange={handleModelChange}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="relative z-10 mx-4 mt-4 glass-dark rounded-xl border-l-4 border-red-500">
            <div className="px-6 py-4 flex items-center gap-3 text-white animate-slide-down">
              <div className="p-2 rounded-lg bg-red-500/20">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="relative z-10 flex-1">
          <MessageList 
            conversationId={conversationId || ''}
            messages={messages}
            streamingMessage={streamingMessage}
            onMessagesUpdate={setMessages}
          />
        </div>

        {/* Input */}
        <div className="relative z-10">
          <MessageInput 
            onSendMessage={handleSendMessage}
            disabled={isStreaming}
          />
        </div>
      </div>
    </div>
  )
}
