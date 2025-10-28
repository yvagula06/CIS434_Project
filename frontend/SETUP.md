# Frontend Setup Guide

Quick setup guide for the React + Vite + TypeScript + TailwindCSS frontend.

## Prerequisites

- Node.js 18+ and npm installed
- Backend running at `http://localhost:8001`

## Installation

1. **Navigate to frontend directory:**
```powershell
cd frontend
```

2. **Install dependencies:**
```powershell
npm install
```

This will install:
- React 18 + React DOM
- React Router DOM (routing)
- Axios (HTTP client)
- TypeScript (type safety)
- Vite (build tool)
- TailwindCSS + PostCSS + Autoprefixer (styling)
- ESLint (linting)

## Running the App

**Start development server:**
```powershell
npm run dev
```

The app will be available at: **http://localhost:5173**

You should see:
```
VITE v5.0.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Testing the App

1. **Open browser** to `http://localhost:5173`

2. **Home page** should show:
   - "🤖 Open Chat" header
   - Model selection dropdown
   - "Start New Chat" button

3. **Select a model** from the dropdown

4. **Click "Start New Chat"**
   - Should create a conversation
   - Navigate to `/chat/{conversation-id}`

5. **Chat page** should show:
   - Header with back button
   - Empty chat area
   - Message input at bottom
   - Model override dropdown

6. **Send a message:**
   - Type in the input box
   - Press Enter or click send button
   - Should see user message appear
   - AI response should stream in real-time

## Common Issues

### "Failed to load models"
- **Cause:** Backend not running or CORS issue
- **Fix:** 
  - Start backend: `cd ../backend && uvicorn main:app --reload --port 8001`
  - Check backend has CORS enabled for `http://localhost:5173`

### "Failed to create conversation"
- **Cause:** Backend API not responding
- **Fix:** Check backend logs, ensure `/conversations` endpoint works

### Styling not working
- **Cause:** TailwindCSS not processing
- **Fix:** 
  - Ensure `npm install` completed successfully
  - Check `tailwind.config.js` and `postcss.config.js` exist
  - Restart dev server

### ESLint errors (red squiggles)
- **Cause:** Dependencies not installed
- **Fix:** Run `npm install` and restart VS Code

## Building for Production

```powershell
npm run build
```

Output will be in `dist/` directory:
- `dist/index.html` - Entry HTML
- `dist/assets/` - JS/CSS bundles

## Preview Production Build

```powershell
npm run preview
```

Serves the production build at `http://localhost:4173`

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── pages/          # Route components
│   │   ├── Home.tsx    # Landing page
│   │   └── Chat.tsx    # Chat interface
│   ├── services/       # API client
│   │   └── api.ts      # Backend integration
│   ├── App.tsx         # Router setup
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── tailwind.config.js  # Tailwind config
├── postcss.config.js   # PostCSS config
├── vite.config.ts      # Vite config
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
```

## Environment Variables

By default, the frontend connects to `http://localhost:8001`.

To change this, create `.env` file:

```env
VITE_API_BASE_URL=http://your-backend-url:port
```

Then update `src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Start frontend dev server
4. ✅ Test home page
5. ✅ Create a conversation
6. ✅ Send messages and verify streaming

## Features Implemented

- ✅ React Router for navigation
- ✅ Home page with model selection
- ✅ Chat page with real-time streaming
- ✅ TailwindCSS styling
- ✅ TypeScript types
- ✅ API client with typed methods
- ✅ SSE (Server-Sent Events) for streaming
- ✅ Model override per message
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

## Browser DevTools Tips

- **Console:** Check for API errors
- **Network:** Monitor API calls and SSE streams
  - Look for `/models`, `/conversations`, `/messages`, `/stream`
  - SSE streams show as "EventStream" type
- **React DevTools:** Inspect component state and props

## Troubleshooting

### Port already in use
```
Error: Port 5173 is already in use
```

**Fix:** Kill the process or use different port:
```powershell
npm run dev -- --port 3000
```

### Module not found errors
```
Cannot find module 'react-router-dom'
```

**Fix:** Install dependencies:
```powershell
npm install
```

### CORS errors in browser console
```
Access to fetch at 'http://localhost:8001' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Fix:** Backend must allow frontend origin in CORS:
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Happy coding! 🚀
