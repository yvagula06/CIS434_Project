# Quick Start Guide

Get the backend up and running in 5 minutes!

## Prerequisites

- Python 3.8 or higher
- OpenRouter API key ([Get one here](https://openrouter.ai/))

## Step-by-Step Setup

### 1. Open PowerShell in the backend directory

```powershell
cd c:\Users\yuvar\Desktop\VSProjects\CIS434_Project\backend
```

### 2. Create and activate virtual environment

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

You should see `(venv)` in your prompt.

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

This will install:
- FastAPI
- uvicorn
- httpx
- python-dotenv
- pydantic
- requests (for testing)

### 4. Configure environment variables

Copy the example file:
```powershell
cd ..
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

### 5. Start the server

```powershell
cd backend
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Note:** If it starts on port 8000 instead of 8001, use:
```powershell
uvicorn main:app --reload --port 8001
```

### 6. Test the server

Open a new PowerShell window and run:

```powershell
cd c:\Users\yuvar\Desktop\VSProjects\CIS434_Project\backend
.\venv\Scripts\Activate.ps1
python test_api.py
```

Or test manually:
```powershell
curl http://localhost:8001/
```

### 7. View API documentation

Open your browser and visit:
- **http://localhost:8001/docs** (Swagger UI - Interactive)
- **http://localhost:8001/redoc** (ReDoc - Pretty docs)

## Quick Test

### Using PowerShell

```powershell
# Create a conversation
$response = Invoke-RestMethod -Uri "http://localhost:8001/conversations" -Method Post -ContentType "application/json" -Body '{"default_model": "openai/gpt-3.5-turbo"}'
$convId = $response.id

# Send a message
Invoke-RestMethod -Uri "http://localhost:8001/conversations/$convId/messages" -Method Post -ContentType "application/json" -Body '{"message": "Hello!"}'

# Get the streaming response (basic check)
Invoke-WebRequest -Uri "http://localhost:8001/conversations/$convId/stream"
```

### Using curl (if installed)

```bash
# Health check
curl http://localhost:8001/

# Get models
curl http://localhost:8001/models

# Create conversation
curl -X POST http://localhost:8001/conversations \
  -H "Content-Type: application/json" \
  -d '{"default_model": "openai/gpt-3.5-turbo"}'
```

## Common Issues

### Port already in use
```powershell
# Use a different port
uvicorn main:app --reload --port 8002
```

### Virtual environment won't activate
```powershell
# Change execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.\venv\Scripts\Activate.ps1
```

### ImportError: No module named 'fastapi'
```powershell
# Make sure virtual environment is activated (should see (venv) in prompt)
# Then install dependencies
pip install -r requirements.txt
```

### API key errors
- Make sure `.env` file exists in the PROJECT ROOT (not in backend folder)
- Check that `OPENROUTER_API_KEY` is set correctly
- No quotes needed around the key value

## Next Steps

1. ✅ Server is running
2. 📖 Read `example_usage.md` for API examples
3. 🔧 Try the endpoints in Swagger UI at http://localhost:8001/docs
4. 🧪 Run the test suite: `python test_api.py`
5. 🚀 Build the frontend to complete the full-stack app!

## Stopping the Server

Press `Ctrl+C` in the terminal where uvicorn is running.

## Restarting Later

```powershell
cd c:\Users\yuvar\Desktop\VSProjects\CIS434_Project\backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

That's it! You're ready to build amazing chat applications! 🎉
