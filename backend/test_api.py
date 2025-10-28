"""
Test script for the FastAPI backend
Run this after starting the server to verify all endpoints work correctly
"""
import requests
import json
import time

BASE_URL = "http://localhost:8001"


def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def test_health():
    """Test health endpoint"""
    print_section("Testing Health Check")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_models():
    """Test models endpoint"""
    print_section("Testing Models Endpoint")
    response = requests.get(f"{BASE_URL}/models")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Cached: {data['cached']}")
        print(f"Models found: {len(data['models'])}")
        if data['models']:
            print(f"First model: {data['models'][0].get('id', 'N/A')}")
    else:
        print(f"Error: {response.text}")
    return response.status_code == 200


def test_conversation_flow():
    """Test complete conversation flow"""
    print_section("Testing Conversation Flow")
    
    # 1. Create conversation
    print("1. Creating conversation...")
    response = requests.post(
        f"{BASE_URL}/conversations",
        json={"default_model": "openai/gpt-3.5-turbo"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    conversation = response.json()
    conv_id = conversation["id"]
    print(f"Created conversation: {conv_id}")
    print(f"Default model: {conversation['default_model']}")
    
    # 2. Get conversation
    print("\n2. Getting conversation details...")
    response = requests.get(f"{BASE_URL}/conversations/{conv_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    # 3. Send a message
    print("\n3. Sending user message...")
    response = requests.post(
        f"{BASE_URL}/conversations/{conv_id}/messages",
        json={"message": "Hello! Can you tell me a very short joke?"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"Error: {response.text}")
        return False
    
    message = response.json()
    print(f"Message ID: {message['id']}")
    print(f"Content: {message['content']}")
    
    # 4. Stream response
    print("\n4. Streaming assistant response...")
    print("Response: ", end="", flush=True)
    
    try:
        response = requests.get(
            f"{BASE_URL}/conversations/{conv_id}/stream",
            stream=True,
            timeout=30
        )
        
        full_response = ""
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                if line_str.startswith('data: '):
                    data = json.loads(line_str[6:])
                    if 'content' in data:
                        print(data['content'], end="", flush=True)
                        full_response += data['content']
                    elif 'done' in data:
                        print(f"\n\nStreaming complete! Message ID: {data['message_id']}")
                        break
                    elif 'error' in data:
                        print(f"\nError: {data['error']}")
                        return False
    except Exception as e:
        print(f"\nError during streaming: {e}")
        return False
    
    # 5. Get all messages
    print("\n5. Getting all messages...")
    response = requests.get(f"{BASE_URL}/conversations/{conv_id}/messages")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total messages: {len(data['messages'])}")
    
    # 6. Update conversation model
    print("\n6. Updating conversation model...")
    response = requests.patch(
        f"{BASE_URL}/conversations/{conv_id}",
        json={"default_model": "openai/gpt-4-turbo"}
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"New model: {response.json()['default_model']}")
    
    # 7. List all conversations
    print("\n7. Listing all conversations...")
    response = requests.get(f"{BASE_URL}/conversations")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total conversations: {len(data['conversations'])}")
    
    # 8. Delete conversation
    print("\n8. Deleting conversation...")
    response = requests.delete(f"{BASE_URL}/conversations/{conv_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    return True


def main():
    print("\n" + "="*60)
    print("  FastAPI Backend Test Suite")
    print("  Make sure the server is running on http://localhost:8001")
    print("="*60)
    
    # Wait a moment to ensure server is ready
    time.sleep(0.5)
    
    try:
        # Test basic endpoints
        if not test_health():
            print("\n❌ Health check failed!")
            return
        
        if not test_models():
            print("\n⚠️  Models endpoint failed (check API key)")
        
        # Test conversation flow
        if test_conversation_flow():
            print("\n" + "="*60)
            print("  ✅ All tests completed successfully!")
            print("="*60)
        else:
            print("\n❌ Conversation flow test failed!")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server!")
        print("Make sure the server is running: uvicorn main:app --reload")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()
