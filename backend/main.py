"""
FastAPI backend for Open Chat with API Integration
Advanced conversation management with OpenRouter streaming support
"""
import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import httpx
import json

# Import OpenRouter service
from services.openrouter import send_to_openrouter, get_available_models

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Open Chat API",
    description="Advanced chat application with OpenRouter streaming and conversation management",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
PORT = int(os.getenv("PORT", 8001))
DEFAULT_MODEL = os.getenv("MODEL_NAME", "openai/gpt-3.5-turbo")
APP_TITLE = os.getenv("APP_TITLE", "Open Chat API")
APP_URL = os.getenv("APP_URL", "http://localhost:8001")

# In-memory storage
conversations: Dict[str, dict] = {}
messages_store: Dict[str, List[dict]] = {}
models_cache: Optional[List[dict]] = None
models_cache_time: Optional[datetime] = None


# ===== Pydantic Models =====

class Message(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    model: Optional[str] = None
    timestamp: datetime


class Conversation(BaseModel):
    id: str
    default_model: str
    created_at: datetime
    updated_at: datetime


class CreateConversationRequest(BaseModel):
    default_model: Optional[str] = Field(default=None, description="Model to use for this conversation")


class UpdateConversationRequest(BaseModel):
    default_model: str = Field(..., description="New default model for the conversation")


class SendMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message content")
    model: Optional[str] = Field(default=None, description="Override model for this message")


# ===== Helper Functions =====

def get_openrouter_headers() -> dict:
    """Build headers for OpenRouter API requests with attribution"""
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": APP_TITLE,
    }


def validate_api_key():
    """Validate that API key is configured"""
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY not configured")
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY not configured. Please check your .env file."
        )


# ===== API Endpoints =====

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Open Chat API",
        "version": "2.0.0",
        "conversations": len(conversations),
        "total_messages": sum(len(msgs) for msgs in messages_store.values())
    }


@app.get("/health")
async def health_check():
    """Docker health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/models")
async def get_models():
    """
    Fetch and cache the list of available models from OpenRouter.
    Cache is refreshed if older than 1 hour.
    """
    global models_cache, models_cache_time
    
    validate_api_key()
    
    # Check cache validity (1 hour)
    if models_cache and models_cache_time:
        cache_age = (datetime.now() - models_cache_time).total_seconds()
        if cache_age < 3600:
            logger.info(f"Returning cached models (age: {cache_age:.0f}s)")
            return {"models": models_cache, "cached": True}
    
    # Fetch fresh models list using the service
    try:
        models_cache = await get_available_models()
        models_cache_time = datetime.now()
        
        logger.info(f"Fetched {len(models_cache)} models from OpenRouter")
        return {"models": models_cache, "cached": False}
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except httpx.HTTPError as e:
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch models from OpenRouter: {str(e)}"
        )


@app.post("/conversations", response_model=Conversation)
async def create_conversation(request: CreateConversationRequest):
    """
    Create a new conversation with an optional default model.
    If no model is specified, uses the system default.
    """
    conversation_id = str(uuid4())
    model = request.default_model or DEFAULT_MODEL
    now = datetime.now()
    
    conversation = {
        "id": conversation_id,
        "default_model": model,
        "created_at": now,
        "updated_at": now
    }
    
    conversations[conversation_id] = conversation
    messages_store[conversation_id] = []
    
    logger.info(f"Created conversation {conversation_id} with model {model}")
    return Conversation(**conversation)


@app.get("/conversations/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get conversation details"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return Conversation(**conversations[conversation_id])


@app.get("/conversations")
async def list_conversations():
    """List all conversations"""
    return {
        "conversations": [
            {
                **conv,
                "message_count": len(messages_store.get(conv["id"], []))
            }
            for conv in conversations.values()
        ]
    }


@app.patch("/conversations/{conversation_id}", response_model=Conversation)
async def update_conversation(conversation_id: str, request: UpdateConversationRequest):
    """
    Update the default model for a conversation.
    """
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversations[conversation_id]
    conversation["default_model"] = request.default_model
    conversation["updated_at"] = datetime.now()
    
    logger.info(f"Updated conversation {conversation_id} model to {request.default_model}")
    return Conversation(**conversation)


@app.post("/conversations/{conversation_id}/messages", response_model=Message)
async def send_message(conversation_id: str, request: SendMessageRequest):
    """
    Send a user message to a conversation.
    The message is stored and will be used in the streaming response.
    """
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    validate_api_key()
    
    # Store user message
    message_id = str(uuid4())
    user_message = {
        "id": message_id,
        "role": "user",
        "content": request.message,
        "model": None,
        "timestamp": datetime.now()
    }
    
    messages_store[conversation_id].append(user_message)
    conversations[conversation_id]["updated_at"] = datetime.now()
    
    logger.info(f"Added user message to conversation {conversation_id}")
    return Message(**user_message)


@app.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str):
    """Get all messages in a conversation"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {
        "conversation_id": conversation_id,
        "messages": messages_store.get(conversation_id, [])
    }


@app.get("/conversations/{conversation_id}/stream")
async def stream_response(conversation_id: str, model: Optional[str] = None):
    """
    Stream assistant response using Server-Sent Events (SSE).
    Uses conversation history to maintain context.
    Optional model parameter overrides conversation default.
    """
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    validate_api_key()
    
    conversation = conversations[conversation_id]
    messages = messages_store.get(conversation_id, [])
    
    if not messages:
        raise HTTPException(status_code=400, detail="No messages in conversation")
    
    # Determine which model to use
    selected_model = model or conversation["default_model"]
    
    # Build message history for OpenRouter
    chat_messages = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in messages
    ]
    
    logger.info(f"Streaming response for conversation {conversation_id} with model {selected_model}")
    
    async def event_generator():
        """Generate Server-Sent Events from OpenRouter stream using the service helper"""
        assistant_message_id = str(uuid4())
        full_response = ""
        
        try:
            # Use the OpenRouter service to get streaming response
            async for content_chunk in send_to_openrouter(chat_messages, selected_model):
                full_response += content_chunk
                # Send content chunk as SSE
                yield f"data: {json.dumps({'content': content_chunk})}\n\n"
            
            # Stream finished - store complete assistant message
            assistant_message = {
                "id": assistant_message_id,
                "role": "assistant",
                "content": full_response,
                "model": selected_model,
                "timestamp": datetime.now()
            }
            messages_store[conversation_id].append(assistant_message)
            conversations[conversation_id]["updated_at"] = datetime.now()
            
            # Send final event
            yield f"data: {json.dumps({'done': True, 'message_id': assistant_message_id})}\n\n"
            logger.info(f"Completed streaming for conversation {conversation_id}")
            
        except ValueError as e:
            error_msg = f"Configuration error: {str(e)}"
            logger.error(error_msg)
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
        except httpx.HTTPError as e:
            error_msg = f"Error streaming from OpenRouter: {str(e)}"
            logger.error(error_msg)
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation and all its messages"""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    del conversations[conversation_id]
    del messages_store[conversation_id]
    
    logger.info(f"Deleted conversation {conversation_id}")
    return {"status": "deleted", "conversation_id": conversation_id}


if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Open Chat API server on port {PORT}")
    print(f"📚 API docs available at: http://localhost:{PORT}/docs")
    print(f"🔄 Streaming enabled via Server-Sent Events")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True
    )
