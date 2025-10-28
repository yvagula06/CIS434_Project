import { useState, useEffect } from 'react'
import { apiService, Conversation } from '../services/api'
import ModelSelector from './ModelSelector'

interface ChatHeaderProps {
  conversation: Conversation | null
  onModelChange: (modelId: string) => void
}

export default function ChatHeader({ conversation, onModelChange }: ChatHeaderProps) {
  const [isEditingModel, setIsEditingModel] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [updating, setUpdating] = useState(false)

  // Set selected model when conversation loads
  useEffect(() => {
    if (conversation) {
      setSelectedModel(conversation.default_model)
    }
  }, [conversation])

  const handleModelChange = async (newModel: string) => {
    if (!conversation || newModel === conversation.default_model) {
      setIsEditingModel(false)
      return
    }

    setUpdating(true)

    try {
      await apiService.updateConversation(conversation.id, newModel)
      setSelectedModel(newModel)
      onModelChange(newModel)
      setIsEditingModel(false)
    } catch (err: any) {
      console.error('Failed to update model:', err)
      alert('Failed to update model: ' + (err.response?.data?.detail || err.message))
      setSelectedModel(conversation.default_model)
    } finally {
      setUpdating(false)
    }
  }

  if (!conversation) {
    return (
      <header className="glass-dark border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Chat</h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
                Initializing conversation...
              </p>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="glass-dark border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              AI Chat
              <span className="text-xs font-normal glass px-2 py-0.5 rounded-md text-gray-400">
                #{conversation.id.substring(0, 8)}
              </span>
            </h1>
            <p className="text-sm text-gray-400 flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-glow"></div>
              Connected & ready
            </p>
          </div>
        </div>

        {/* Right side - Model selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Model:
          </span>
          
          {isEditingModel ? (
            <div className="flex items-center gap-2">
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                disabled={updating}
                className="min-w-[220px]"
              />
              
              <button
                onClick={() => handleModelChange(selectedModel)}
                disabled={updating}
                className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 shadow-lg"
                title="Save model change"
              >
                {updating ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={() => {
                  setIsEditingModel(false)
                  setSelectedModel(conversation.default_model)
                }}
                className="p-2.5 glass-dark hover:glass text-white rounded-lg text-sm font-medium transition-all border border-white/10 hover:border-white/20"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingModel(true)}
              className="group flex items-center gap-2 px-4 py-2.5 glass hover:glass-dark border border-white/10 hover:border-primary-500/30 text-white rounded-lg transition-all shadow-md"
            >
              <span className="font-medium text-sm text-primary-300">{conversation.default_model.split('/').pop()}</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Model Update Indicator */}
      {updating && (
        <div className="mt-3 text-center glass p-2 rounded-lg border border-primary-500/20">
          <span className="text-xs text-primary-300 font-medium flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse"></div>
            Updating conversation model...
          </span>
        </div>
      )}
    </header>
  )
}
