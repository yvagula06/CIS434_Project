"""
OpenRouter API Service
Handles communication with the OpenRouter API for streaming chat completions
"""
import os
import json
import logging
from typing import AsyncGenerator, List, Dict, Any

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
APP_TITLE = os.getenv("APP_TITLE", "Open Chat API")
APP_URL = os.getenv("APP_URL", "http://localhost:8001")


def get_openrouter_headers() -> Dict[str, str]:
    """
    Build headers for OpenRouter API requests with attribution
    
    Returns:
        dict: Headers including Authorization and attribution
    """
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,
        "X-Title": APP_TITLE,
    }


async def send_to_openrouter(
    messages: List[Dict[str, str]], 
    model: str
) -> AsyncGenerator[str, None]:
    """
    Send messages to OpenRouter API and stream the response.
    
    This function creates a streaming connection to OpenRouter's chat completions
    endpoint and yields text chunks as they arrive from the AI model.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content' keys
                  Example: [{"role": "user", "content": "Hello!"}]
        model: The model identifier to use (e.g., "openai/gpt-3.5-turbo")
    
    Yields:
        str: Text chunks from the AI model response as they arrive
    
    Raises:
        httpx.HTTPError: If the request to OpenRouter fails
        ValueError: If API key is not configured
    
    Example:
        >>> messages = [{"role": "user", "content": "Hello!"}]
        >>> async for chunk in send_to_openrouter(messages, "openai/gpt-3.5-turbo"):
        ...     print(chunk, end="", flush=True)
    """
    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY not configured")
        raise ValueError("OPENROUTER_API_KEY not configured in environment")
    
    logger.info(f"Starting stream to OpenRouter with model: {model}")
    logger.debug(f"Message count: {len(messages)}")
    
    # Prepare the request payload
    payload = {
        "model": model,
        "messages": messages,
        "stream": True
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=get_openrouter_headers(),
                json=payload
            ) as response:
                # Check for HTTP errors
                response.raise_for_status()
                
                logger.info("Stream established successfully")
                chunk_count = 0
                
                # Process the streaming response
                async for line in response.aiter_lines():
                    # Skip empty lines
                    if not line.strip():
                        continue
                    
                    # Parse SSE data
                    if line.startswith("data: "):
                        data = line[6:]  # Remove "data: " prefix
                        
                        # Check for stream completion
                        if data == "[DONE]":
                            logger.info(f"Stream completed. Total chunks: {chunk_count}")
                            break
                        
                        try:
                            # Parse the JSON chunk
                            chunk_data = json.loads(data)
                            
                            # Extract content from the delta
                            delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            
                            # Yield non-empty content
                            if content:
                                chunk_count += 1
                                logger.debug(f"Yielding chunk {chunk_count}: {len(content)} chars")
                                yield content
                                
                        except json.JSONDecodeError as e:
                            logger.warning(f"Failed to parse chunk JSON: {data[:100]}... Error: {e}")
                            continue
                        except (KeyError, IndexError) as e:
                            logger.warning(f"Unexpected chunk structure: {e}")
                            continue
                            
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from OpenRouter: {e.response.status_code} - {e.response.text}")
        raise
    except httpx.TimeoutException as e:
        logger.error(f"Request to OpenRouter timed out: {e}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Request error communicating with OpenRouter: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in send_to_openrouter: {e}")
        raise


async def send_to_openrouter_no_stream(
    messages: List[Dict[str, str]], 
    model: str
) -> str:
    """
    Send messages to OpenRouter API without streaming (returns complete response).
    
    This is a convenience function for when you need the complete response at once
    rather than streaming it.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content' keys
        model: The model identifier to use
    
    Returns:
        str: Complete response from the AI model
    
    Raises:
        httpx.HTTPError: If the request to OpenRouter fails
        ValueError: If API key is not configured
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not configured in environment")
    
    logger.info(f"Sending request to OpenRouter with model: {model} (no streaming)")
    
    payload = {
        "model": model,
        "messages": messages,
        "stream": False
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                headers=get_openrouter_headers(),
                json=payload
            )
            response.raise_for_status()
            
            # Read the response content first
            response_data = await response.aread()
            data = json.loads(response_data)
            content = data["choices"][0]["message"]["content"]
            
            logger.info(f"Received complete response: {len(content)} chars")
            return content
            
    except httpx.HTTPError as e:
        logger.error(f"Error communicating with OpenRouter: {e}")
        raise
    except (KeyError, IndexError) as e:
        logger.error(f"Unexpected response format from OpenRouter: {e}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse response JSON: {e}")
        raise


async def get_available_models() -> List[Dict[str, Any]]:
    """
    Fetch the list of available models from OpenRouter.
    
    Returns:
        List[Dict]: List of model dictionaries with details
    
    Raises:
        httpx.HTTPError: If the request fails
        ValueError: If API key is not configured
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not configured in environment")
    
    logger.info("Fetching available models from OpenRouter")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{OPENROUTER_BASE_URL}/models",
                headers=get_openrouter_headers()
            )
            response.raise_for_status()
            
            data = response.json()
            models = data.get("data", [])
            
            logger.info(f"Retrieved {len(models)} models from OpenRouter")
            return models
            
    except httpx.HTTPError as e:
        logger.error(f"Error fetching models from OpenRouter: {e}")
        raise
