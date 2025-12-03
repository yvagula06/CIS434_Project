# **Open Chat - User Manual**

**Version 2.0**  
**CIS 434 Software Engineering Project**  
**Team:** Luaiy Nawabit, Yuvaraj Vagula, Kayden Naida  
**Date:** December 3, 2025

---

## **Table of Contents**

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Main Features](#3-main-features)
4. [Using the Application](#4-using-the-application)
5. [Managing Conversations](#5-managing-conversations)
6. [Working with AI Models](#6-working-with-ai-models)
7. [Tips and Best Practices](#7-tips-and-best-practices)
8. [Troubleshooting](#8-troubleshooting)
9. [Frequently Asked Questions](#9-frequently-asked-questions)

---

## **1. Introduction**

### **1.1 What is Open Chat?**

Open Chat is an AI-powered chat application that lets you have conversations with multiple artificial intelligence models through a single, easy-to-use interface. Instead of switching between different websites or services to talk to different AI assistants, Open Chat brings them all together in one place.

Think of it like having access to ChatGPT, Claude, and other AI models all in the same app, with the ability to switch between them whenever you want—even in the middle of a conversation!

### **1.2 Key Benefits**

**Unified Interface**: Access multiple AI models (GPT-4, Claude, Llama, Gemini, and more) without juggling different accounts or websites.

**Real-Time Streaming**: Watch AI responses appear word-by-word as they're being generated, just like ChatGPT. No more waiting for the complete response!

**Conversation History**: All your conversations are automatically saved, so you can return to them anytime.

**Model Flexibility**: Start with one AI model and switch to another mid-conversation to compare responses or use different models for different tasks.

**Modern Interface**: A sleek, visually appealing design with smooth animations and an intuitive layout.

### **1.3 Who Should Use This?**

- **Students** who want to compare different AI models for homework help or research
- **Developers** who need to test how different models respond to code-related questions
- **Writers** who want creative suggestions from multiple AI assistants
- **Researchers** comparing AI model capabilities and responses
- **Anyone** curious about exploring different AI models in one convenient place

---

## **2. Getting Started**

### **2.1 System Requirements**

**Web Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)  
**Internet Connection**: Required for accessing AI models  
**Screen Resolution**: 1024x768 or higher recommended

### **2.2 Accessing the Application**

**Local Installation**:
1. Navigate to `http://localhost:5173` in your web browser
2. The application should load and display the home page

**Docker Installation**:
1. After running `docker-compose up`, access the app at `http://localhost:5173`
2. The backend API runs at `http://localhost:8001`

### **2.3 First Time Setup**

When you first open Open Chat, you'll see the **Home Page** with:

- A large "AI Chat" title at the top
- A dropdown menu to select an AI model
- A button to "Start New Conversation"
- Three feature cards explaining the app's capabilities

**To start your first conversation:**

1. **Select an AI Model**: Click the dropdown menu labeled "Select AI Model"
   - You'll see a list of available models like "GPT-4o Mini", "Claude 3.5 Sonnet", etc.
   - Hover over models to see brief descriptions (if available)
   - Click on your preferred model to select it

2. **Start Chatting**: Click the large "Start New Conversation" button
   - The button will show a loading animation briefly
   - You'll be automatically taken to the chat interface

3. **Send Your First Message**: Type your message in the input box at the bottom and press Enter or click the send button

That's it! You're now chatting with AI.

---

## **3. Main Features**

### **3.1 Home Page**

The **Home Page** is your starting point for creating new conversations.

**Components:**

- **Model Selector**: A dropdown showing all available AI models
  - Models are organized by provider (OpenAI, Anthropic, Meta, Google, etc.)
  - Each model shows its name and sometimes pricing/description
  - Free models are highlighted

- **Start New Conversation Button**: A large, eye-catching button that creates a new chat
  - Features a smooth animation on hover
  - Shows a loading spinner when creating the conversation
  - Automatically navigates to the chat page once ready

- **Feature Cards**: Three informational cards explaining:
  - **Real-time Streaming**: Responses appear as they're generated
  - **Switch Models**: Change AI models during conversations
  - **Persistent History**: Conversations are saved automatically

### **3.2 Chat Interface**

The **Chat Interface** is where you interact with AI models.

**Layout:**
┌─────────────────────────────────────────────────────┐
│ [Sidebar] │ [Header with Model Info] │
│ ├───────────────────────────────────────┤
│ - Conv #1 │ │
│ - Conv #2 │ [Message List] │
│ - Conv #3 │ - User messages │
│ │ - AI responses │
│ [New Chat] │ - Streaming responses │
│ │ │
│ ├───────────────────────────────────────┤
│ │ [Message Input Box] │
└─────────────┴───────────────────────────────────────┘


**Main Areas:**

1. **Conversation Sidebar** (left): Shows all your conversations
2. **Chat Header** (top): Displays current conversation info and model
3. **Message Area** (center): Shows the conversation history
4. **Input Area** (bottom): Where you type messages

### **3.3 Real-Time Streaming**

When the AI responds to your message, you'll see the response appear **word-by-word** in real time:

- A new message bubble appears with a pulsing cursor
- Text fills in gradually as the AI generates it
- The cursor animation continues until the response is complete
- Once done, the full message is saved to history

This creates a more engaging experience compared to waiting for a complete response before seeing anything.

### **3.4 Message Display**

**User Messages**:
- Appear on the right side
- Dark glass background with red tint
- Your avatar (red gradient circle) on the right
- Timestamp below the message

**AI Messages**:
- Appear on the left side
- Light glass background
- AI avatar (gold gradient circle) on the left
- Model name badge showing which AI generated the response
- Timestamp and optional copy button

---

## **4. Using the Application**

### **4.1 Creating a New Conversation**

**From Home Page:**
1. Select your desired AI model from the dropdown
2. Click "Start New Conversation"
3. Wait for the chat interface to load

**From Chat Page:**
1. Click "New Chat" button in the sidebar
2. You'll be taken back to the home page
3. Select a model and start again

### **4.2 Sending Messages**

**Typing Your Message:**
1. Click in the message input box at the bottom
2. Type your question or prompt
3. The input box automatically expands as you type (up to 200px tall)
4. You'll see a character counter if implemented

**Sending Methods:**
- **Press Enter**: Sends the message immediately
- **Shift + Enter**: Adds a new line without sending
- **Click Send Button**: The paper plane icon on the right

**What Happens Next:**
1. Your message appears in the chat immediately
2. The input box clears
3. A new AI message bubble appears with a pulsing cursor
4. The AI response streams in word-by-word
5. When complete, the message is saved

### **4.3 Reading AI Responses**

**Streaming Responses:**
- Watch text appear gradually
- Pulsing cursor indicates active streaming
- Scroll is locked to bottom during streaming (so you don't miss new words)

**Complete Responses:**
- Full text is displayed
- Model badge shows which AI was used
- Timestamp shows when the response was received
- Copy button (if hovering) lets you copy the text

**Auto-Scroll:**
- Chat automatically scrolls to show new messages
- If you scroll up to read history, auto-scroll pauses
- When new messages arrive, you'll see a gentle scroll back down

### **4.4 Viewing Conversation History**

All messages in the current conversation are displayed in chronological order:

1. Scroll up to see older messages
2. User messages on the right, AI messages on the left
3. Timestamps show when each message was sent
4. Model badges show which AI answered which question

---

## **5. Managing Conversations**

### **5.1 Conversation Sidebar**

The sidebar on the left shows all your saved conversations.

**Sidebar Features:**

- **Collapse/Expand**: Click the arrow icon to hide/show the sidebar
  - Collapsed view shows just icons
  - Expanded view shows full conversation details

- **New Chat Button**: Green button at the top to create a new conversation

- **Conversation List**: All your conversations in reverse chronological order (newest first)

**Each Conversation Shows:**
- Conversation number (e.g., "Conversation #3")
- Active indicator (pulsing dot if it's the current conversation)
- Default model badge
- Last updated time (e.g., "2h ago", "Just now")
- Delete button (appears on hover)

### **5.2 Switching Between Conversations**

**To Open a Different Conversation:**
1. Look at the sidebar conversation list
2. Click on any conversation card
3. The chat area will load that conversation's messages
4. The clicked conversation becomes highlighted with a glow effect

**Visual Feedback:**
- Active conversation has a red/gold glowing border
- Previously active conversation returns to normal appearance
- Messages load with a brief animation

### **5.3 Deleting Conversations**

**To Delete a Conversation:**
1. Hover over the conversation in the sidebar
2. A trash icon appears on the right
3. Click the trash icon
4. Confirm the deletion in the popup dialog
5. The conversation is permanently removed

**Important Notes:**
- Deletion cannot be undone
- All messages in that conversation are also deleted
- If you delete the currently active conversation, you'll be redirected to the home page

### **5.4 Conversation Counter**

At the bottom of the sidebar, you'll see a count of total conversations:
- "5 conversations" if you have multiple
- "1 conversation" if you have only one
- Helpful for tracking how many chats you've saved

---

## **6. Working with AI Models**

### **6.1 Available Models**

Open Chat provides access to many AI models through OpenRouter:

**OpenAI Models:**
- GPT-4o Mini (fast, cost-effective)
- GPT-4o (most capable)
- GPT-3.5 Turbo (quick responses)

**Anthropic Models:**
- Claude 3.5 Sonnet (excellent for writing and analysis)
- Claude 3 Opus (most capable Claude model)
- Claude 3 Haiku (fast and efficient)

**Meta Models:**
- Llama 3.1 (various sizes)
- Llama 3 (open-source)

**Google Models:**
- Gemini Pro
- Gemini Flash

**Other Models:**
- Mistral, Qwen, and more

### **6.2 Setting a Default Model**

**When Creating a Conversation:**
1. On the home page, select your preferred model from the dropdown
2. This becomes the **default model** for that conversation
3. All messages will use this model unless you override it

**Example:**
If you select "GPT-4o Mini" as your default, every message you send will be answered by GPT-4o Mini.

### **6.3 Changing the Default Model**

**To Change Mid-Conversation:**
1. Look at the chat header at the top
2. Find the current model badge (e.g., "gpt-4o-mini")
3. Click on the model badge
4. A dropdown appears with all available models
5. Select a new model
6. Click "Save" or the checkmark icon
7. Future messages will use the new model

**Visual Confirmation:**
- The model badge updates to show the new model
- A brief animation confirms the change
- Previous messages keep their original model badges

### **6.4 Per-Message Model Override**

While not currently exposed in the UI, the system supports sending individual messages with different models. This is useful for:

- **Comparing responses**: Ask the same question to different models
- **Specialized tasks**: Use GPT-4 for coding, Claude for writing
- **Cost optimization**: Use cheaper models for simple questions

**How It Works** (for developers):
- The API accepts an optional `model` parameter on each message
- If provided, that message uses the specified model
- If not provided, the conversation's default model is used

### **6.5 Model Selection Tips**

**For General Questions:**
- GPT-4o Mini (fast and good quality)
- GPT-3.5 Turbo (very fast)

**For Complex Reasoning:**
- GPT-4o
- Claude 3.5 Sonnet
- Claude 3 Opus

**For Creative Writing:**
- Claude 3.5 Sonnet (excellent for storytelling)
- GPT-4o

**For Code Generation:**
- GPT-4o
- Claude 3.5 Sonnet

**For Long Conversations:**
- Claude models (larger context windows)

---

## **7. Tips and Best Practices**

### **7.1 Getting Better Responses**

**Be Specific**: Instead of "Tell me about dogs," try "What are the key differences between Golden Retrievers and Labrador Retrievers?"

**Provide Context**: If continuing a topic, remind the AI of previous points: "Based on our earlier discussion about Python, how would I..."

**Use Follow-Up Questions**: Build on previous responses to dive deeper into topics

**Try Different Models**: Some models are better at certain tasks—experiment to find what works best for your needs

### **7.2 Managing Multiple Conversations**

**Organize by Topic**: Create separate conversations for different projects or subjects
- One for coding help
- One for creative writing
- One for research questions

**Use Descriptive First Messages**: Your first message helps you remember what the conversation is about when viewing the sidebar

**Delete Old Conversations**: Keep your sidebar clean by removing conversations you no longer need

### **7.3 Model Switching Strategies**

**Start Broad, Then Specialize**: Begin with a fast model like GPT-3.5, then switch to GPT-4 or Claude for detailed follow-up

**Compare Responses**: Ask the same question with different models to see various perspectives

**Cost-Conscious Usage**: Use premium models (GPT-4, Claude Opus) only when you need their advanced capabilities

### **7.4 Keyboard Shortcuts**

**Enter**: Send message  
**Shift + Enter**: New line in message  
**Esc**: Clear input (if implemented)

### **7.5 Performance Tips**

**Slow Responses?**
- Check your internet connection
- Try a faster model (GPT-3.5 instead of GPT-4)
- Keep messages reasonably sized

**Streaming Issues?**
- Refresh the page if streaming freezes
- Check browser console for errors
- Verify backend is running (for local installations)

---

## **8. Troubleshooting**

### **8.1 Common Issues**

**Problem: "Failed to create conversation" Error**

*Possible Causes:*
- Backend server is not running
- No OpenRouter API key configured
- Network connectivity issues

*Solutions:*
1. Check if backend is accessible at `http://localhost:8001`
2. Verify `.env` file has valid `OPENROUTER_API_KEY`
3. Check browser console for detailed error messages
4. Try refreshing the page

---

**Problem: Messages Not Streaming**

*Possible Causes:*
- EventSource connection failed
- API rate limit reached
- Model temporarily unavailable

*Solutions:*
1. Check browser console for SSE errors
2. Refresh the page to re-establish connection
3. Try a different model
4. Wait a few moments and try again

---

**Problem: Sidebar Not Loading Conversations**

*Possible Causes:*
- Backend database/storage issue
- API endpoint failure

*Solutions:*
1. Check browser network tab for failed requests
2. Verify backend server is running
3. Try the "Retry" button if displayed
4. Create a new conversation to test

---

**Problem: Can't Delete a Conversation**

*Possible Causes:*
- Permission issues
- Backend error

*Solutions:*
1. Check if delete request completes in network tab
2. Refresh the page and try again
3. Check backend logs for errors

---

**Problem: Model Dropdown is Empty**

*Possible Causes:*
- Failed to fetch models from OpenRouter
- API key invalid
- OpenRouter service down

*Solutions:*
1. Check browser console for API errors
2. Verify OpenRouter API key is valid
3. Wait a few moments and refresh (cache may need to update)
4. Use the fallback default models

---

### **8.2 Browser Compatibility**

**Supported Browsers:**
- ✅ Chrome/Edge (version 90+)
- ✅ Firefox (version 88+)
- ✅ Safari (version 14+)

**Known Issues:**
- Safari may have EventSource reconnection delays
- Older browsers may not support backdrop-filter (glass effect)

**Best Experience:**
- Use Chrome or Edge for optimal performance
- Enable JavaScript
- Allow cookies for session management

---

### **8.3 Getting Help**

**Error Messages:**
- Read the error message carefully—it usually explains the problem
- Check browser console (F12 → Console tab) for technical details
- Look for red/yellow warning indicators in the UI

**Logs:**
- Backend logs show detailed information about API calls
- Frontend browser console shows client-side errors

**Reporting Issues:**
- Note what you were doing when the error occurred
- Save any error messages
- Check if the issue reproduces consistently

---

## **9. Frequently Asked Questions**

### **9.1 General Questions**

**Q: Do I need to create an account?**  
A: Currently, authentication is optional. The app works without logging in, but conversations are stored per-session.

**Q: Are my conversations private?**  
A: Conversations are stored locally on the server. For production use, implement proper authentication and encryption.

**Q: Can I use this offline?**  
A: No, an internet connection is required to communicate with AI models through the OpenRouter API.

**Q: How many conversations can I create?**  
A: There's no hard limit in the current version. However, performance may degrade with hundreds of conversations.

**Q: Can I export my conversations?**  
A: Export functionality is not currently implemented but is planned for future releases.

---

### **9.2 Model Questions**

**Q: Which model should I use?**  
A: Start with GPT-4o Mini for general questions. Use GPT-4o or Claude 3.5 Sonnet for complex tasks requiring deep reasoning.

**Q: Why do different models give different answers?**  
A: Each AI model is trained differently and has unique strengths. Different architectures lead to varied responses.

**Q: Can I use multiple models in the same conversation?**  
A: Yes! Change the default model at any time, and future messages will use the new model while keeping conversation context.

**Q: Are all models free?**  
A: Some models on OpenRouter are free. The app shows which models have costs. Free models are prioritized in the dropdown.

**Q: What's the difference between GPT-4 and GPT-3.5?**  
A: GPT-4 is more capable at complex reasoning, coding, and creative tasks, but slower. GPT-3.5 is faster and good for simpler questions.

---

### **9.3 Technical Questions**

**Q: What happens to my data when I refresh the page?**  
A: With the current in-memory storage, conversations are lost on backend restart. Database persistence (planned) will fix this.

**Q: Can I run this on my own server?**  
A: Yes! The project is dockerized. Deploy it to any server that supports Docker.

**Q: Does this work on mobile?**  
A: The interface is responsive and works on mobile browsers, though the experience is optimized for desktop.

**Q: How fast are the responses?**  
A: Response speed depends on the model and OpenRouter's current load. Streaming starts within 1-2 seconds typically.

**Q: Can I customize the UI colors?**  
A: For developers: Yes, edit `tailwind.config.js` to change the color theme. The current theme is red/black/gold.

---

### **9.4 Privacy & Security**

**Q: Who can see my conversations?**  
A: In the current implementation, anyone with access to the backend can see all conversations. Production deployment should add authentication.

**Q: Is my OpenRouter API key safe?**  
A: Yes, the API key is stored server-side and never exposed to the frontend or browser.

**Q: Can I delete my data?**  
A: Yes, you can delete individual conversations. For complete data deletion, contact your system administrator (or clear the database yourself if self-hosting).

---

## **Conclusion**

Open Chat provides a powerful, flexible interface for interacting with multiple AI models. Whether you're comparing model responses, managing multiple projects, or simply exploring AI capabilities, this application streamlines your workflow into a single, beautiful interface.

**Remember:**
- Start conversations with appropriate models for your task
- Use the sidebar to organize and navigate conversations
- Experiment with different models to find what works best
- Watch streaming responses appear in real-time

Enjoy chatting with AI! 

---

**For Additional Support:**
- Check the project README.md for technical documentation
- Review the API documentation at `http://localhost:8001/docs`
- Contact the development team for feature requests or bug reports

**Project Team:**
- Luaiy Nawabit
- Yuvaraj Vagula  
- Kayden Naida

**Course:** CIS 434 - Software Engineering  
**Instructor:** Professor Yongjian Fu

---

*Last Updated: December 3, 2025*
