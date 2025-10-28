"""
Test the OpenRouter service module
Run this to verify the service works correctly
"""
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import service functions
from services.openrouter import (
    send_to_openrouter,
    send_to_openrouter_no_stream,
    get_available_models
)


async def test_streaming():
    """Test streaming response"""
    print("\n" + "="*60)
    print("Testing Streaming Response")
    print("="*60)
    
    messages = [
        {"role": "user", "content": "Tell me a very short joke in one sentence."}
    ]
    model = "openai/gpt-3.5-turbo"
    
    print(f"\nUser: {messages[0]['content']}")
    print("AI: ", end="", flush=True)
    
    try:
        full_response = ""
        chunk_count = 0
        
        async for chunk in send_to_openrouter(messages, model):
            print(chunk, end="", flush=True)
            full_response += chunk
            chunk_count += 1
        
        print(f"\n\n✅ Streaming successful!")
        print(f"Total chunks: {chunk_count}")
        print(f"Response length: {len(full_response)} characters")
        return True
        
    except Exception as e:
        print(f"\n\n❌ Streaming failed: {e}")
        return False


async def test_no_stream():
    """Test non-streaming response"""
    print("\n" + "="*60)
    print("Testing Non-Streaming Response")
    print("="*60)
    
    messages = [
        {"role": "user", "content": "Say 'Hello, World!' and nothing else."}
    ]
    model = "openai/gpt-3.5-turbo"
    
    print(f"\nUser: {messages[0]['content']}")
    
    try:
        response = await send_to_openrouter_no_stream(messages, model)
        print(f"AI: {response}")
        print(f"\n✅ Non-streaming successful!")
        print(f"Response length: {len(response)} characters")
        return True
        
    except Exception as e:
        print(f"\n❌ Non-streaming failed: {e}")
        return False


async def test_get_models():
    """Test getting available models"""
    print("\n" + "="*60)
    print("Testing Get Available Models")
    print("="*60)
    
    try:
        models = await get_available_models()
        print(f"\n✅ Successfully fetched {len(models)} models")
        
        # Show first 5 models
        print("\nFirst 5 models:")
        for model in models[:5]:
            model_id = model.get('id', 'unknown')
            model_name = model.get('name', 'Unknown')
            print(f"  - {model_id}: {model_name}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Failed to fetch models: {e}")
        return False


async def test_multi_turn_conversation():
    """Test multi-turn conversation with context"""
    print("\n" + "="*60)
    print("Testing Multi-Turn Conversation")
    print("="*60)
    
    messages = [
        {"role": "user", "content": "My name is Alice."},
        {"role": "assistant", "content": "Hello Alice! Nice to meet you."},
        {"role": "user", "content": "What is my name?"}
    ]
    model = "openai/gpt-3.5-turbo"
    
    print("\nConversation history:")
    for msg in messages[:-1]:
        print(f"{msg['role'].title()}: {msg['content']}")
    
    print(f"\nUser: {messages[-1]['content']}")
    print("AI: ", end="", flush=True)
    
    try:
        full_response = ""
        async for chunk in send_to_openrouter(messages, model):
            print(chunk, end="", flush=True)
            full_response += chunk
        
        print("\n")
        
        # Check if AI remembered the name
        if "alice" in full_response.lower():
            print("✅ AI correctly remembered the name from context!")
        else:
            print("⚠️  AI may not have used context correctly")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Multi-turn conversation failed: {e}")
        return False


async def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  OpenRouter Service Test Suite")
    print("="*60)
    
    # Check API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("\n❌ OPENROUTER_API_KEY not found in environment!")
        print("Please set it in your .env file")
        return
    
    print(f"\n✓ API key configured (starts with: {api_key[:15]}...)")
    
    # Run tests
    results = []
    
    # Test 1: Get models
    results.append(await test_get_models())
    await asyncio.sleep(1)
    
    # Test 2: Streaming
    results.append(await test_streaming())
    await asyncio.sleep(1)
    
    # Test 3: Non-streaming
    results.append(await test_no_stream())
    await asyncio.sleep(1)
    
    # Test 4: Multi-turn
    results.append(await test_multi_turn_conversation())
    
    # Summary
    print("\n" + "="*60)
    print("  Test Summary")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests passed: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! Service is working correctly!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check errors above.")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    asyncio.run(main())
