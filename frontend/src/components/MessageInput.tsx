import { useState } from 'react'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled: boolean
  placeholder?: string
}

export default function MessageInput({ onSendMessage, disabled, placeholder }: MessageInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = () => {
    if (!input.trim() || disabled) return
    
    onSendMessage(input.trim())
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  return (
    <div className="glass-dark border-t border-white/10 backdrop-blur-2xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder || "Type your message... (Shift+Enter for new line)"}
              disabled={disabled}
              className="w-full px-5 py-4 pr-12 rounded-2xl glass border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 custom-scrollbar"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            {/* Character counter */}
            {input.length > 0 && (
              <div className="absolute bottom-3 right-4 text-xs text-gray-500 pointer-events-none">
                {input.length}
              </div>
            )}
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="group relative px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg hover:shadow-primary-500/50"
            title="Send message (Enter)"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rounded-2xl"></div>
            {disabled ? (
              <svg className="animate-spin h-5 w-5 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Helper text */}
        <div className="mt-3 flex items-center justify-between text-xs">
          {disabled ? (
            <div className="flex items-center gap-2 text-primary-400 animate-pulse">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
              <span className="font-medium">AI is thinking and typing...</span>
            </div>
          ) : (
            <div className="text-gray-500 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-dark-700 border border-white/10 rounded text-gray-400">Enter</kbd>
                <span>to send</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-dark-700 border border-white/10 rounded text-gray-400">Shift+Enter</kbd>
                <span>for new line</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
