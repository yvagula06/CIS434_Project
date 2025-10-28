import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import ModelSelector from '../components/ModelSelector'

export default function Home() {
  const navigate = useNavigate()
  const [selectedModel, setSelectedModel] = useState<string>('openai/gpt-4o-mini')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNewChat = async () => {
    setLoading(true)
    setError(null)

    try {
      const conversation = await apiService.createConversation({
        default_model: selectedModel,
      })
      navigate(`/chat/${conversation.id}`)
    } catch (err: any) {
      console.error('Failed to create conversation:', err)
      setError(err.response?.data?.detail || 'Failed to create conversation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 mb-6 shadow-glow animate-float">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 text-shadow-lg">
            <span className="gradient-text">AI Chat</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of conversational AI with multiple models powered by OpenRouter
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-dark rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-white/10 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="space-y-8">
            {/* Model Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 uppercase tracking-wide">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Select AI Model
              </label>
              <ModelSelector
                value={selectedModel}
                onChange={setSelectedModel}
                showDescription={false}
                className="w-full"
              />
              <p className="text-sm text-gray-400 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Choose your default model - you can switch or override it anytime during the conversation</span>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-5 py-4 rounded-xl backdrop-blur-sm animate-slide-down">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              disabled={loading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-glow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              {loading ? (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Creating your conversation...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-lg">Start New Conversation</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/30 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Real-time Streaming</h3>
                  <p className="text-xs text-gray-400 mt-1">Watch responses appear as they're generated</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-secondary-500/30 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-secondary-500/10 group-hover:bg-secondary-500/20 transition-colors">
                  <svg className="w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Switch Models</h3>
                  <p className="text-xs text-gray-400 mt-1">Change AI models mid-conversation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/30 transition-all duration-300 group">
                <div className="p-2 rounded-lg bg-accent-500/10 group-hover:bg-accent-500/20 transition-colors">
                  <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Persistent History</h3>
                  <p className="text-xs text-gray-400 mt-1">All conversations are automatically saved</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-primary-400">OpenRouter</span>
            <span>•</span>
            <span className="font-semibold text-secondary-400">FastAPI</span>
            <span>•</span>
            <span className="font-semibold text-accent-400">React</span>
          </p>
        </div>
      </div>
    </div>
  )
}
