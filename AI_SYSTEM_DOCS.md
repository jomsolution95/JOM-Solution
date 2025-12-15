# 🧠 JOM AI System Documentation

This document describes the implementation of the Artificial Intelligence features within the JOM Platform.

## 🌟 Overview
The platform uses **Google Gemini 1.5 Flash** via the official Node.js SDK. The AI is integrated into three main components:
1. **User Concierge:** A helpful assistant for end-users.
2. **Admin Copilot:** A data-aware assistant for Super Admins.
3. **Proactive Sentinel:** An automated background monitoring system.

---

## 1. User Concierge (The "Memory" Chatbot)

### Purpose
To assist standard users with navigation, detailed platform questions, and general inquiries.

### Architecture
- **Endpoint:** `POST /ai/chat`
- **Service Method:** `AiService.chatWithHistory(userId, message)`
- **Persistence:** MongoDB `ChatMessage` collection.

### Logic Flow
1. **Context Loading:** On every request, the backend fetches the **last 10 messages** for this `userId` from MongoDB.
2. **Prompt Injection:** A "System Prompt" is prepended to the history, defining the AI's persona ("You are a helpful assistant for JOM Academy...").
3. **Generation:** The full conversation history + new message is sent to Gemini.
4. **Storage:** Both the user's question and the AI's response are saved to MongoDB asynchronously.

**Security:** This agent has **NO access** to backend tools or database records. It relies purely on the conversation context.

---

## 2. Admin Copilot (The "Data" Expert)

### Purpose
To allow Super Admins to query platform data using natural language (e.g., "Combien d'utilisateurs ?", "Revenus du mois ?").

### Architecture
- **Endpoint:** `POST /ai/admin-chat`
- **Service Method:** `AiService.adminChat(question)`
- **Tool Use:** Native Tool Calling pattern (Simulated).

### Logic Flow (Tool Calling Pattern)
1. **Intent Recognition:** The AI analyzes the question to decide if it needs a tool.
   - *Prompt:* "Available tools: [get_stats, search_user]..."
2. **Tool Execution:**
   - If AI requests `get_stats`, the backend runs the aggregation query.
   - If AI requests `search_user`, the backend queries the `UsersService`.
3. **Response Generation:** The raw JSON data from the tool is fed back to Gemini to generate a human-readable answer.

---

## 3. Proactive Sentinel (The "Watchdog")

### Purpose
To monitor the system 24/7 and initiate communication with the Admin when needed.

### Architecture
- **Service:** `AiSchedulerService` (NestJS Schedule).
- **Mechanism:** Cron Jobs.

### Features
1. **Daily Morning Briefing (08:00 AM)**
   - Collects key metrics (New Signups, Revenue).
   - Generates a summary text via Gemini.
   - **Push Mechanism:** Saves the message directly to the Admin's chat history with `role: 'assistant'`.
   - The Frontend `AdminChatWidget` polls every 30s to detect these new messages.

2. **Security Watch (Hourly)**
   - Checks error logs (e.g., failed login spikes).
   - If threshold exceeded -> Pushes an "ALERTE SÉCURITÉ" message to the Admin.

---

## 🛠️ Key Files

- **`backend/src/modules/ai/ai.service.ts`**: Core logic for Gemini interaction.
- **`backend/src/modules/ai/ai.scheduler.service.ts`**: Cron jobs for Sentinel.
- **`backend/src/modules/ai/schemas/chat-message.schema.ts`**: MongoDB Schema for history.
- **`src/components/chat/UserChatWidget.tsx`**: Frontend UI for Users.
- **`src/components/admin/AdminChatWidget.tsx`**: Frontend UI for Admins.

---

## ⚠️ Troubleshooting

**"Je suis en mode simulation"**
- This means the `GEMINI_API_KEY` is missing in `backend/.env`.

**"Chat doesn't remember me"**
- Verify MongoDB connection.
- Check `userId` is correctly passed in the JWT token.

**"Admin Chat not showing new reports"**
- The widget polls every 30 seconds. Refresh the page to force a fetch using `/ai/history`.
