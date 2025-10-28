import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiService, Conversation } from '../services/api'

interface ConversationSidebarProps {
  currentConversationId?: string
  onSelectConversation: (id: string) => void
}

export default function ConversationSidebar({ currentConversationId, onSelectConversation }: ConversationSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Refresh when route changes
  useEffect(() => {
    loadConversations()
  }, [location.pathname])

  const loadConversations = async () => {
    try {
      setLoading(true)
      const data = await apiService.listConversations()
      setConversations(data.conversations || [])
      setError(null)
    } catch (err: any) {
      console.error('Failed to load conversations:', err)
      setError('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    navigate('/')
  }

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id)
    navigate(`/chat/${id}`)
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Delete this conversation?')) return

    try {
      await apiService.deleteConversation(id)
      setConversations(conversations.filter(c => c.id !== id))
      
      // If we deleted the current conversation, go home
      if (id === currentConversationId) {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err)
      alert('Failed to delete conversation')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (isCollapsed) {
    return (
      <div className="w-16 glass-dark border-r border-white/10 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          title="Expand sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button
          onClick={handleNewConversation}
          className="mt-4 p-2 text-white hover:bg-gradient-to-br hover:from-primary-500/20 hover:to-secondary-500/20 rounded-lg transition-all"
          title="New conversation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <div className="mt-4 flex-1 overflow-y-auto w-full custom-scrollbar">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`w-full p-2 mb-2 rounded-lg transition-all ${
                conv.id === currentConversationId
                  ? 'bg-gradient-to-br from-primary-500/30 to-secondary-500/30 shadow-glow'
                  : 'hover:bg-white/10'
              }`}
              title={`Conversation - ${conv.default_model}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {conversations.indexOf(conv) + 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 glass-dark border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 animate-pulse"></div>
            Conversations
          </h2>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        <button
          onClick={handleNewConversation}
          className="btn-primary w-full group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative flex items-center justify-center gap-2">
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </div>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {loading ? (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 opacity-20 animate-pulse"></div>
              <svg className="absolute inset-0 animate-spin h-16 w-16 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="glass-dark p-4 rounded-xl border border-red-500/30 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm mb-3">{error}</p>
            <button
              onClick={loadConversations}
              className="btn-ghost text-sm"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-2">No conversations yet</p>
            <p className="text-gray-500 text-sm">Click "New Chat" to start chatting with AI</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in ${
                  conv.id === currentConversationId
                    ? 'glass border border-primary-500/30 shadow-glow'
                    : 'glass-dark hover:glass hover:border-white/20'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        conv.id === currentConversationId
                          ? 'bg-gradient-to-r from-primary-400 to-secondary-400 animate-pulse shadow-glow'
                          : 'bg-gradient-to-r from-primary-400/60 to-secondary-400/60'
                      }`}></div>
                      <span className="text-white font-semibold text-sm">
                        Conversation #{conversations.length - index}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-xs font-medium text-primary-300 border border-primary-500/20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        {conv.default_model.split('/').pop()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(conv.updated_at || conv.created_at)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}
