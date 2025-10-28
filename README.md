# Open Chat with API Integration

A full-stack chat application with OpenRouter API integration, built with FastAPI and React.

## 🏗️ Project Structure

```
CIS434_Project/
├── backend/          # FastAPI server
├── frontend/         # React + Vite + TypeScript
├── .env.example      # Environment variables template
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## 🚀 Features

- **Backend**: Advanced FastAPI server with:
  - Conversation management (create, update, delete)
  - Per-conversation model selection with per-message overrides
  - Real-time streaming responses via Server-Sent Events (SSE)
  - OpenRouter models discovery and caching
  - Full message history and context management
  - Comprehensive logging and error handling
  - Attribution headers (HTTP-Referer, X-Title)
- **Frontend**: Modern React app with TypeScript and Vite
- **Real-time Chat**: Interactive chat interface with streaming
- **API Integration**: Full OpenRouter API integration with streaming support

## 📋 Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ and npm/yarn (for frontend)
- OpenRouter API key ([Get one here](https://openrouter.ai/))

## ⚙️ Setup Instructions

You can run this application in two ways:

### Option 1: Docker (Recommended for Production)

**Quick Start with Docker:**

```bash
# 1. Add your API key to .env file
cp .env.example .env
# Edit .env and add: OPENROUTER_API_KEY=your_actual_api_key_here

# 2. Build and run with Docker Compose
docker-compose up -d --build

# 3. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

See **[DOCKER.md](./DOCKER.md)** for complete Docker deployment guide.

### Option 2: Local Development Setup

#### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd CIS434_Project

# Copy the example env file and configure it
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key:
```
OPENROUTER_API_KEY=your_actual_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
PORT=8001
MODEL_NAME=openai/gpt-3.5-turbo
APP_TITLE=Open Chat API
APP_URL=http://localhost:8001
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
venv\Scripts\Activate.ps1
# On Windows CMD:
venv\Scripts\activate.bat
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (recommended)
uvicorn main:app --reload

# Alternative: Run main.py directly
# python main.py
```

The backend will be available at `http://localhost:8001`

**Quick Start:** See `backend/QUICKSTART.md` for detailed setup instructions!

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 API Endpoints

### Backend API (v2.0)

#### Conversations
- `POST /conversations` - Create a new conversation with optional default model
- `GET /conversations` - List all conversations with message counts
- `GET /conversations/{id}` - Get conversation details
- `PATCH /conversations/{id}` - Update conversation's default model
- `DELETE /conversations/{id}` - Delete conversation and all messages

#### Messages
- `POST /conversations/{id}/messages` - Send a user message
- `GET /conversations/{id}/messages` - Get all messages in conversation
- `GET /conversations/{id}/stream?model=...` - **Stream AI response via SSE**

#### Models & Health
- `GET /models` - Fetch available OpenRouter models (cached 1 hour)
- `GET /` - Health check with statistics

**Full API documentation:** http://localhost:8001/docs (when server is running)

**Usage examples:** See `backend/example_usage.md`

## 🛠️ Development

### Backend Development

```bash
cd backend
# Activate virtual environment first (see setup instructions)
uvicorn main:app --reload

# Or with custom port
uvicorn main:app --reload --port 8001

# Test the API
python test_api.py
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Building for Production

#### Backend
```bash
cd backend
# The FastAPI app can be run with uvicorn in production
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Frontend
```bash
cd frontend
npm run build
# Built files will be in the dist/ directory
```

## 📦 Tech Stack

### Backend
- FastAPI - Modern Python web framework
- Uvicorn - ASGI server
- Python-dotenv - Environment variable management
- HTTPX - Async HTTP client for streaming
- Pydantic - Data validation

### Frontend
- React 18 - UI library
- TypeScript - Type-safe JavaScript
- Vite - Fast build tool
- Axios - HTTP client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is created for educational purposes (CIS434).

## 🐛 Troubleshooting

### Backend Issues
- Make sure your virtual environment is activated
- Verify your `.env` file has the correct API key
- Check that port 8001 is not in use

### Frontend Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that the backend is running on port 8001
- Verify CORS settings if API calls fail

## 📧 Support

For questions or issues, please open an issue in the repository.