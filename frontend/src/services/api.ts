import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Model {
  id: string
  name: string
  description?: string
  pricing?: {
    prompt: string
    completion: string
  }
}

export interface Conversation {
  id: string
  default_model: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  timestamp: string
}

export interface CreateConversationRequest {
  default_model?: string
}

export interface SendMessageRequest {
  message: string
  model?: string
}

// API methods
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/')
    return response.data
  },

  // Get available models
  async getModels(): Promise<{ models: Model[]; cached: boolean }> {
    const response = await api.get('/models')
    return response.data
  },

  // Create conversation
  async createConversation(data: CreateConversationRequest): Promise<Conversation> {
    const response = await api.post('/conversations', data)
    return response.data
  },

  // Get conversation
  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get(`/conversations/${id}`)
    return response.data
  },

  // List all conversations
  async listConversations(): Promise<{ conversations: Conversation[] }> {
    const response = await api.get('/conversations')
    return response.data
  },

  // Update conversation
  async updateConversation(id: string, default_model: string): Promise<Conversation> {
    const response = await api.patch(`/conversations/${id}`, { default_model })
    return response.data
  },

  // Send message
  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<Message> {
    const response = await api.post(`/conversations/${conversationId}/messages`, data)
    return response.data
  },

  // Get messages
  async getMessages(conversationId: string): Promise<{ messages: Message[] }> {
    const response = await api.get(`/conversations/${conversationId}/messages`)
    return response.data
  },

  // Stream response (returns EventSource-compatible URL)
  getStreamUrl(conversationId: string, model?: string): string {
    const params = model ? `?model=${encodeURIComponent(model)}` : ''
    return `${API_BASE_URL}/conversations/${conversationId}/stream${params}`
  },

  // Delete conversation
  async deleteConversation(id: string) {
    const response = await api.delete(`/conversations/${id}`)
    return response.data
  },
}

export default api
