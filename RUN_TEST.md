# Local Testing Guide

## Prerequisites

Before running the test, ensure you have:
- Python 3.9+ installed
- Node.js 18+ installed
- OpenRouter API key (get from https://openrouter.ai/)

## Setup Steps

### 1. Create .env file

Create `.env` in the project root:

```bash
# Copy from example
copy .env.example .env
```

Then edit `.env` and add your OpenRouter API key:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=8001
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
DATABASE_URL=sqlite:///./chat_app.db
```

### 2. Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```powershell
cd ..\frontend
npm install
```

## Running the Application

### Terminal 1: Start Backend

```powershell
cd backend
uvicorn main:app --reload --port 8001
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Backend will be available at: **http://localhost:8001**
- API docs: http://localhost:8001/docs
- Health check: http://localhost:8001/

### Terminal 2: Start Frontend

```powershell
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.11  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Frontend will be available at: **http://localhost:5173**

## Testing Workflow

### Test 1: Fetch Models

1. Open http://localhost:5173
2. **Verify**: Model dropdown should populate with available models
3. **Check**: Browser DevTools → Network → Look for `GET /models` request
4. **Expected**: List of models from OpenRouter

### Test 2: Create Conversation with gpt-4o-mini

1. Select **gpt-4o-mini** from dropdown
2. Click **"Start New Chat"**
3. **Verify**: Redirects to `/chat/{conversation-id}`
4. **Check**: Network → `POST /conversations` with `{"default_model": "openai/gpt-4o-mini"}`
5. **Expected**: Conversation created successfully

### Test 3: Send Message "Hello"

1. Type **"Hello"** in message input
2. Press Enter or click Send
3. **Verify**: 
   - User message appears immediately
   - Assistant response starts streaming
   - Text appears word-by-word
4. **Check**: Network → EventStream connection to `/conversations/{id}/stream`
5. **Expected**: AI responds with greeting

### Test 4: Switch Model to claude-3.5-sonnet

1. In chat header, click the model dropdown
2. Select **"claude-3.5-sonnet"** (or anthropic/claude-3.5-sonnet)
3. Click the **✓** (checkmark) to save
4. **Verify**: 
   - Header updates to show new model
   - Network → `PATCH /conversations/{id}` with `{"default_model": "anthropic/claude-3.5-sonnet"}`
5. **Expected**: "Model updated successfully" or similar feedback

### Test 5: Verify New Model is Used

1. Send another message: **"What model are you?"**
2. **Verify**:
   - Message sends successfully
   - Response streams in
   - **Model badge** on assistant message shows "anthropic/claude-3.5-sonnet"
3. **Expected**: Claude identifies itself (not GPT)

## Troubleshooting

### CORS Issues

**Symptom**: Browser console shows CORS errors

**Solution**: Verify backend CORS settings in `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### SSE Connection Issues

**Symptom**: Streaming doesn't work, connection fails

**Fixes**:
1. Check EventSource URL in browser DevTools → Network
2. Should be: `http://localhost:8001/conversations/{id}/stream`
3. Verify no proxy or firewall blocking EventSource
4. Check backend logs for errors

### Model Not Available

**Symptom**: Error "Model not found" or 404

**Fixes**:
1. Check exact model ID in OpenRouter docs
2. Common IDs:
   - `openai/gpt-4o-mini`
   - `openai/gpt-4`
   - `anthropic/claude-3.5-sonnet`
   - `google/gemini-pro`
3. Update dropdown selection to match available models

### API Key Issues

**Symptom**: 401 Unauthorized errors

**Fixes**:
1. Verify `.env` file exists in project root
2. Check `OPENROUTER_API_KEY` is set correctly
3. Restart backend server after changing .env
4. Test API key: `curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models`

### Backend Not Starting

**Symptom**: Import errors or missing modules

**Fixes**:
```powershell
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Not Starting

**Symptom**: Module not found errors

**Fixes**:
```powershell
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Verification Checklist

- [ ] Backend running on http://localhost:8001
- [ ] Frontend running on http://localhost:5173
- [ ] `/models` endpoint returns model list
- [ ] Can create conversation with gpt-4o-mini
- [ ] Can send message "Hello" and receive streaming response
- [ ] Can switch model to claude-3.5-sonnet via header dropdown
- [ ] New messages use updated model (verify via badge)
- [ ] No CORS errors in browser console
- [ ] No SSE connection errors
- [ ] Model badges show correct model for each response

## API Testing (Alternative)

If you want to test backend separately:

### 1. Get Models
```bash
curl http://localhost:8001/models
```

### 2. Create Conversation
```bash
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-4o-mini"}'
```

### 3. Send Message
```bash
curl -X POST http://localhost:8001/conversations/{CONV_ID}/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### 4. Stream Response
```bash
curl http://localhost:8001/conversations/{CONV_ID}/stream
```

### 5. Update Model
```bash
curl -X PATCH http://localhost:8001/conversations/{CONV_ID} \
  -H "Content-Type: application/json" \
  -d '{"default_model": "anthropic/claude-3.5-sonnet"}'
```

## Success Criteria

✅ All models load in dropdown
✅ Conversation created with correct default model
✅ Messages send and stream successfully
✅ Model can be changed mid-conversation
✅ New messages use updated model
✅ Model badges display correctly
✅ No errors in browser console or backend logs
