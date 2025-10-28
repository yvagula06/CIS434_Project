import { useEffect, useRef, useCallback } from 'react'
import { apiService } from '../services/api'

export interface StreamMessage {
  content: string
  done: boolean
  messageId?: string
  model?: string
  error?: string
}

export interface UseChatStreamOptions {
  conversationId: string
  onMessage: (message: StreamMessage) => void
  onError?: (error: string) => void
  onComplete?: (messageId: string) => void
  model?: string
  enabled?: boolean
}

export interface UseChatStreamReturn {
  isStreaming: boolean
  startStream: () => void
  stopStream: () => void
  error: string | null
}

/**
 * Custom hook for managing SSE chat streaming
 * 
 * @param options - Configuration options
 * @returns Object with streaming state and controls
 * 
 * @example
 * ```tsx
 * const { isStreaming, startStream, stopStream } = useChatStream({
 *   conversationId: '123',
 *   onMessage: (msg) => {
 *     if (msg.content) {
 *       setStreamingContent(prev => prev + msg.content)
 *     }
 *     if (msg.done) {
 *       saveMessage(streamingContent)
 *     }
 *   }
 * })
 * ```
 */
export function useChatStream({
  conversationId,
  onMessage,
  onError,
  onComplete,
  model,
  enabled = true,
}: UseChatStreamOptions): UseChatStreamReturn {
  const eventSourceRef = useRef<EventSource | null>(null)
  const isStreamingRef = useRef(false)
  const errorRef = useRef<string | null>(null)

  // Cleanup function to close EventSource
  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      isStreamingRef.current = false
    }
  }, [])

  // Start streaming
  const startStream = useCallback(() => {
    if (!enabled || !conversationId) {
      console.warn('Stream not enabled or conversationId missing')
      return
    }

    // Close existing stream if any
    stopStream()

    try {
      // Get stream URL from API service
      const streamUrl = apiService.getStreamUrl(conversationId, model)
      
      // Create new EventSource
      const eventSource = new EventSource(streamUrl)
      eventSourceRef.current = eventSource
      isStreamingRef.current = true
      errorRef.current = null

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const data: StreamMessage = JSON.parse(event.data)

          // Call the message callback
          onMessage(data)

          // Handle completion
          if (data.done) {
            if (data.messageId && onComplete) {
              onComplete(data.messageId)
            }
            stopStream()
          }

          // Handle errors in message
          if (data.error) {
            errorRef.current = data.error
            if (onError) {
              onError(data.error)
            }
            stopStream()
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err)
          const errorMessage = 'Failed to parse server response'
          errorRef.current = errorMessage
          if (onError) {
            onError(errorMessage)
          }
        }
      }

      // Handle connection errors
      eventSource.onerror = (err) => {
        console.error('EventSource error:', err)
        const errorMessage = 'Connection to server lost'
        errorRef.current = errorMessage
        if (onError) {
          onError(errorMessage)
        }
        stopStream()
      }
    } catch (err: any) {
      console.error('Failed to start stream:', err)
      const errorMessage = err.message || 'Failed to start streaming'
      errorRef.current = errorMessage
      if (onError) {
        onError(errorMessage)
      }
    }
  }, [conversationId, model, enabled, onMessage, onError, onComplete, stopStream])

  // Auto-cleanup on unmount or when dependencies change
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    isStreaming: isStreamingRef.current,
    startStream,
    stopStream,
    error: errorRef.current,
  }
}

export default useChatStream
