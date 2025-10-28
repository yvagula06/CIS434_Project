# Backend Verification Checklist

Use this checklist to verify that the backend is properly set up and all features are working.

## ✅ Pre-Setup Checklist

- [ ] Python 3.8+ is installed (`python --version`)
- [ ] Have an OpenRouter API key ([get one here](https://openrouter.ai/))
- [ ] Located in correct directory (`CIS434_Project/backend`)

## ✅ Installation Checklist

- [ ] Virtual environment created (`python -m venv venv`)
- [ ] Virtual environment activated (see `(venv)` in prompt)
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] `.env` file created in project root (not in backend folder)
- [ ] `.env` file contains `OPENROUTER_API_KEY=...`

## ✅ Server Startup Checklist

Run: `uvicorn main:app --reload`

- [ ] Server starts without errors
- [ ] See "Uvicorn running on http://127.0.0.1:8001"
- [ ] See "Application startup complete"
- [ ] No import errors in console
- [ ] Port 8001 is available (or use `--port 8002`)

## ✅ Basic Endpoints Test

### Test 1: Health Check
```powershell
curl http://localhost:8001/
```

**Expected Response:**
```json
{
  "status": "online",
  "service": "Open Chat API",
  "version": "2.0.0",
  "conversations": 0,
  "total_messages": 0
}
```

- [ ] Status code: 200
- [ ] Response contains all fields
- [ ] `conversations` and `total_messages` are 0

### Test 2: Models Endpoint
```powershell
curl http://localhost:8001/models
```

**Expected Response:**
```json
{
  "models": [...],
  "cached": false
}
```

- [ ] Status code: 200
- [ ] `models` array is not empty
- [ ] `cached` is false on first call
- [ ] On second call within 1 hour, `cached` is true

### Test 3: Documentation
Open browser to: http://localhost:8001/docs

- [ ] Swagger UI loads
- [ ] All endpoints are listed (11 total)
- [ ] Can expand each endpoint
- [ ] "Try it out" buttons are present

## ✅ Conversation Flow Test

### Step 1: Create Conversation
```powershell
curl -X POST http://localhost:8001/conversations `
  -H "Content-Type: application/json" `
  -d '{"default_model": "openai/gpt-3.5-turbo"}'
```

**Copy the `id` from response!**

- [ ] Status code: 200
- [ ] Response has `id`, `default_model`, `created_at`, `updated_at`
- [ ] `default_model` is "openai/gpt-3.5-turbo"

### Step 2: Send Message
```powershell
$convId = "paste-id-here"
curl -X POST "http://localhost:8001/conversations/$convId/messages" `
  -H "Content-Type: application/json" `
  -d '{"message": "Hello!"}'
```

- [ ] Status code: 200
- [ ] Response has `id`, `role`, `content`, `timestamp`
- [ ] `role` is "user"
- [ ] `content` is "Hello!"

### Step 3: Stream Response
```powershell
curl -N "http://localhost:8001/conversations/$convId/stream"
```

- [ ] Connection stays open
- [ ] See `data: {"content": "..."}` events
- [ ] Content streams word by word
- [ ] Ends with `data: {"done": true, "message_id": "..."}`
- [ ] Connection closes automatically

### Step 4: Get Messages
```powershell
curl "http://localhost:8001/conversations/$convId/messages"
```

- [ ] Status code: 200
- [ ] `messages` array has 2 items
- [ ] First message is user message
- [ ] Second message is assistant message
- [ ] Assistant message has full response content

### Step 5: List Conversations
```powershell
curl http://localhost:8001/conversations
```

- [ ] Status code: 200
- [ ] `conversations` array has at least 1 item
- [ ] Each conversation has `message_count`
- [ ] The test conversation has `message_count: 2`

### Step 6: Update Model
```powershell
curl -X PATCH "http://localhost:8001/conversations/$convId" `
  -H "Content-Type: application/json" `
  -d '{"default_model": "openai/gpt-4"}'
```

- [ ] Status code: 200
- [ ] `default_model` is now "openai/gpt-4"
- [ ] `updated_at` timestamp has changed

### Step 7: Delete Conversation
```powershell
curl -X DELETE "http://localhost:8001/conversations/$convId"
```

- [ ] Status code: 200
- [ ] Response has `status: "deleted"`
- [ ] Listing conversations shows one fewer conversation

## ✅ Test Suite

Run the automated test script:
```powershell
python test_api.py
```

- [ ] All tests pass
- [ ] Health check succeeds
- [ ] Models endpoint succeeds (or shows API key warning)
- [ ] Conversation flow completes
- [ ] Streaming shows actual response
- [ ] See "✅ All tests completed successfully!"

## ✅ Logging Verification

Check the console where uvicorn is running:

- [ ] See log entries when creating conversation
- [ ] See log entries when sending messages
- [ ] See log entries when streaming
- [ ] Log format includes timestamp
- [ ] Log level (INFO/ERROR) is shown
- [ ] No ERROR logs during normal operation

**Example Good Logs:**
```
INFO:     127.0.0.1:12345 - "POST /conversations HTTP/1.1" 200 OK
2025-10-27 10:30:45 - __main__ - INFO - Created conversation abc-123 with model openai/gpt-3.5-turbo
```

## ✅ Error Handling Test

### Test 404: Invalid Conversation
```powershell
curl "http://localhost:8001/conversations/invalid-id/messages"
```

- [ ] Status code: 404
- [ ] Response has `detail: "Conversation not found"`

### Test 400: Empty Message
```powershell
curl -X POST "http://localhost:8001/conversations/$convId/messages" `
  -H "Content-Type: application/json" `
  -d '{"message": ""}'
```

- [ ] Status code: 400
- [ ] Error message indicates validation failure

### Test without API Key
1. Temporarily remove `OPENROUTER_API_KEY` from `.env`
2. Restart server
3. Try to fetch models or stream

- [ ] Status code: 500
- [ ] Error mentions "OPENROUTER_API_KEY not configured"
- [ ] Re-add API key and restart

## ✅ Performance Checks

### Models Caching
1. Call `/models` endpoint
2. Note the response time
3. Call `/models` again within 1 hour
4. Note the response time (should be faster)

- [ ] Second call has `"cached": true`
- [ ] Second call is significantly faster

### Streaming Performance
1. Send a message asking for a long response
2. Watch the streaming output

- [ ] Response starts appearing quickly (< 2 seconds)
- [ ] Content streams smoothly
- [ ] No long pauses between chunks
- [ ] Total time reasonable for response length

## ✅ CORS Verification

If you have the frontend running:

- [ ] Can make requests from `http://localhost:5173`
- [ ] No CORS errors in browser console
- [ ] Preflight OPTIONS requests succeed

## ✅ Documentation Quality

- [ ] README.md has uvicorn instructions
- [ ] All endpoints are documented
- [ ] Example requests are provided
- [ ] Error codes are explained
- [ ] Setup instructions are clear

## 🎯 Final Verification

All checks should pass! If any fail:

1. **Server won't start**: Check Python version, virtual env activated
2. **Import errors**: Run `pip install -r requirements.txt`
3. **API key errors**: Check `.env` file in project root
4. **404 errors**: Verify endpoints match documentation
5. **Streaming errors**: Ensure using `httpx` not `requests`
6. **CORS errors**: Check frontend is on allowed origin

## 📊 Success Criteria

Minimum requirements to consider backend complete:

- ✅ Server starts on port 8001
- ✅ Health check returns 200
- ✅ Can create conversations
- ✅ Can send messages
- ✅ Streaming works and returns content
- ✅ Messages are stored in conversation
- ✅ Models endpoint works (with valid API key)
- ✅ Documentation is accessible
- ✅ Logs show activity
- ✅ Test script passes

## 🚀 You're Ready!

If all checks pass, your backend is fully functional and ready for:
- Frontend integration
- Feature development
- Production deployment (with modifications)
- Team collaboration

---

**Need Help?**
- Check `backend/README.md` for detailed documentation
- Check `backend/QUICKSTART.md` for setup help
- Check `backend/example_usage.md` for API examples
- Run `python test_api.py` for automated testing
