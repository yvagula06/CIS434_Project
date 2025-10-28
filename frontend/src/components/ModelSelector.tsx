import { useState, useEffect } from 'react'
import { apiService, Model } from '../services/api'

interface ModelSelectorProps {
  models?: Model[]
  value: string
  onChange: (modelId: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  showDescription?: boolean
}

export default function ModelSelector({
  models: propModels,
  value,
  onChange,
  disabled = false,
  className = '',
  placeholder = 'Select a model',
  showDescription = false,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>(propModels || [])
  const [loading, setLoading] = useState(!propModels)
  const [error, setError] = useState<string | null>(null)

  // Fetch models from backend if not provided via props
  useEffect(() => {
    if (propModels) {
      setModels(propModels)
      setLoading(false)
      return
    }

    const fetchModels = async () => {
      try {
        setLoading(true)
        const data = await apiService.getModels()
        setModels(data.models)
        setError(null)
      } catch (err: any) {
        console.error('Failed to fetch models:', err)
        setError('Failed to load models')
        // Use fallback models
        setModels([
          { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
          { id: 'openai/gpt-4', name: 'GPT-4' },
          { id: 'anthropic/claude-2', name: 'Claude 2' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [propModels])

  const selectedModel = models.find((m) => m.id === value)

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <select
          disabled
          className="w-full px-4 py-2.5 pr-10 glass-dark text-white border border-white/20 rounded-lg appearance-none cursor-wait opacity-70 focus:outline-none"
        >
          <option>Loading models...</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="animate-spin h-4 w-4 text-primary-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full px-4 py-2.5 pr-10 glass-dark text-white border border-white/20 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all hover:glass hover:border-white/30"
        >
          {placeholder && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {models.map((model) => (
            <option key={model.id} value={model.id} className="bg-dark-800 text-white py-2">
              {model.name || model.id}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-primary-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Description (optional) */}
      {showDescription && selectedModel?.description && (
        <div className="mt-2 glass p-3 rounded-lg border border-white/10">
          <p className="text-xs text-gray-300 leading-relaxed">
            {selectedModel.description}
          </p>
        </div>
      )}

      {/* Pricing (optional) */}
      {showDescription && selectedModel?.pricing && (
        <div className="mt-2 flex items-center gap-4 text-xs glass p-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-gray-500">Prompt:</span>
            <span className="font-mono text-primary-300">{selectedModel.pricing.prompt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="text-gray-500">Completion:</span>
            <span className="font-mono text-primary-300">{selectedModel.pricing.completion}</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-2 glass-dark p-2 rounded-lg border border-red-500/30">
          <p className="text-xs text-red-300 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  )
}
