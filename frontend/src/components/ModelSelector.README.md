# ModelSelector Component

A reusable React component for selecting AI models with automatic fetching from the backend.

## Features

- ✅ **Auto-fetch models** from `GET /models` endpoint
- ✅ **Stylized dropdown** with custom arrow and hover effects
- ✅ **Loading state** with spinner
- ✅ **Error handling** with fallback models
- ✅ **Optional descriptions** and pricing display
- ✅ **Fully typed** with TypeScript
- ✅ **Customizable** via props
- ✅ **Reusable** across multiple components

## Usage

### Basic Usage

```tsx
import ModelSelector from '../components/ModelSelector'

function MyComponent() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo')

  return (
    <ModelSelector
      value={selectedModel}
      onChange={setSelectedModel}
    />
  )
}
```

### With All Props

```tsx
<ModelSelector
  models={customModels}           // Optional: provide models directly
  value={selectedModel}            // Required: current selected model ID
  onChange={setSelectedModel}      // Required: callback when model changes
  disabled={false}                 // Optional: disable the dropdown
  className="w-full"               // Optional: additional CSS classes
  placeholder="Select a model"     // Optional: placeholder text
  showDescription={true}           // Optional: show model description & pricing
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `models` | `Model[]` | No | Auto-fetched | Provide models directly instead of fetching |
| `value` | `string` | **Yes** | - | Currently selected model ID |
| `onChange` | `(modelId: string) => void` | **Yes** | - | Callback when selection changes |
| `disabled` | `boolean` | No | `false` | Disable the dropdown |
| `className` | `string` | No | `''` | Additional CSS classes |
| `placeholder` | `string` | No | `'Select a model'` | Placeholder text |
| `showDescription` | `boolean` | No | `false` | Show model description and pricing |

## Types

```typescript
interface Model {
  id: string
  name: string
  description?: string
  pricing?: {
    prompt: string
    completion: string
  }
}

interface ModelSelectorProps {
  models?: Model[]
  value: string
  onChange: (modelId: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
  showDescription?: boolean
}
```

## Features in Detail

### 1. Auto-fetching Models

If `models` prop is not provided, the component automatically fetches from the backend:

```typescript
// Automatic on mount
GET /models

// Response:
{
  "models": [
    {
      "id": "openai/gpt-3.5-turbo",
      "name": "GPT-3.5 Turbo",
      "description": "Fast and affordable model",
      "pricing": {
        "prompt": "$0.0015 / 1K tokens",
        "completion": "$0.002 / 1K tokens"
      }
    }
  ]
}
```

### 2. Loading State

While fetching models, shows a loading spinner:

```tsx
<select disabled>
  <option>Loading models...</option>
</select>
```

### 3. Error Handling

If fetching fails, falls back to default models:

```typescript
// Fallback models
[
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'anthropic/claude-2', name: 'Claude 2' },
]
```

### 4. Custom Styling

Styled with TailwindCSS:
- Glass-morphism effect (`bg-white/20`, `backdrop-blur`)
- Custom dropdown arrow (replaces native arrow)
- Hover effects (`hover:bg-white/25`)
- Focus ring (`focus:ring-2 focus:ring-white/50`)
- Disabled state (`disabled:opacity-50`)

### 5. Description & Pricing (Optional)

When `showDescription={true}`:

```tsx
<ModelSelector
  value={model}
  onChange={setModel}
  showDescription={true}
/>
```

Shows:
- Model description below dropdown
- Pricing information (prompt + completion costs)

## Examples

### In Home Page

```tsx
// Home.tsx
import ModelSelector from '../components/ModelSelector'

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo')

  return (
    <div>
      <label>Choose AI Model</label>
      <ModelSelector
        value={selectedModel}
        onChange={setSelectedModel}
        className="w-full"
      />
    </div>
  )
}
```

### In Chat Header

```tsx
// ChatHeader.tsx
import ModelSelector from './ModelSelector'

export default function ChatHeader({ conversation }: Props) {
  const [selectedModel, setSelectedModel] = useState(conversation.default_model)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = async () => {
    await apiService.updateConversation(conversation.id, selectedModel)
    setIsEditing(false)
  }

  return (
    <div>
      {isEditing ? (
        <div className="flex gap-2">
          <ModelSelector
            value={selectedModel}
            onChange={setSelectedModel}
            className="min-w-[200px]"
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)}>
          {selectedModel}
        </button>
      )}
    </div>
  )
}
```

### With Pre-loaded Models

```tsx
// If you already have models loaded
const [models, setModels] = useState<Model[]>([])

useEffect(() => {
  // Load models once at app level
  apiService.getModels().then(data => setModels(data.models))
}, [])

// Pass to component to avoid re-fetching
<ModelSelector
  models={models}
  value={selectedModel}
  onChange={setSelectedModel}
/>
```

## Styling Customization

### Change Colors

```tsx
// Modify the className
<ModelSelector
  value={model}
  onChange={setModel}
  className="bg-blue-500/20 border-blue-500/50"
/>
```

### Full Width

```tsx
<ModelSelector
  value={model}
  onChange={setModel}
  className="w-full"
/>
```

### Inline

```tsx
<div className="flex items-center gap-2">
  <label>Model:</label>
  <ModelSelector
    value={model}
    onChange={setModel}
    className="w-auto min-w-[200px]"
  />
</div>
```

## Integration Points

Updated components to use `ModelSelector`:

1. **Home.tsx** - Main model selection
2. **ChatHeader.tsx** - Model editing in header

Both now use the reusable component instead of inline `<select>` elements.

## Benefits

- ✅ **DRY** - Single source of truth for model selection UI
- ✅ **Consistent** - Same styling and behavior everywhere
- ✅ **Maintainable** - Update once, affects all usages
- ✅ **Testable** - Isolated component with clear props
- ✅ **Accessible** - Native `<select>` element with enhancements
- ✅ **Performant** - Fetches once, caches models

## Future Enhancements

Possible additions:
- [ ] Search/filter models
- [ ] Model categories/groups
- [ ] Favorite models
- [ ] Model recommendations
- [ ] Custom rendering (cards instead of dropdown)
- [ ] Multi-select for comparison
