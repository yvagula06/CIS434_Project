import { Message as MessageType } from '../services/api'

interface MessageProps {
  message: MessageType
  isStreaming?: boolean
}

export default function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}>
      <div className={`max-w-[80%] lg:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' 
              : 'bg-gradient-to-br from-secondary-500 to-secondary-600 shadow-lg shadow-secondary-500/30'
          }`}>
            {isUser ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Message Bubble */}
            <div className={`group relative ${isUser ? 'ml-auto' : 'mr-auto'}`}>
              <div
                className={`rounded-2xl px-5 py-4 transition-all duration-300 ${
                  isUser
                    ? 'glass-dark border border-primary-500/30 hover:border-primary-500/50'
                    : 'glass border border-secondary-500/20 hover:border-secondary-500/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isUser ? 'text-primary-300' : 'text-secondary-300'
                  }`}>
                    {isUser ? 'You' : 'AI Assistant'}
                  </span>
                  {message.timestamp && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </>
                  )}
                  {isStreaming && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-primary-400 font-medium">Typing</span>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`whitespace-pre-wrap break-words leading-relaxed ${
                  isUser ? 'text-gray-100' : 'text-gray-100'
                }`}>
                  {message.content}
                  {isStreaming && (
                    <span className="inline-block w-2 h-5 ml-1 bg-primary-400 animate-pulse"></span>
                  )}
                </div>

                {/* Model Badge (for assistant messages) */}
                {!isUser && message.model && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-500/20 border border-secondary-500/30">
                      <svg className="w-3.5 h-3.5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                      <span className="text-xs text-secondary-200 font-mono font-medium">
                        {message.model}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Actions */}
              <div className={`absolute top-0 ${isUser ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2`}>
                <button className="p-2 rounded-lg bg-dark-700/80 hover:bg-dark-700 border border-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
