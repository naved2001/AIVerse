# 🤖 AIVerse — AI-Powered Conversational Assistant

AIVerse is a modern AI-powered conversational assistant built with **React.js**, **Google Gemini API**, and **Supabase**.

The application provides a Gemini-inspired chat experience with persistent conversations, authentication, streaming AI responses, Markdown rendering, code blocks, conversation management, dark/light mode, and responsive design.

---

## 🌐 Live Demo

🔗 **Live Demo:**  https://ai-verse-gamma.vercel.app/

🔗 **GitHub Repository:** https://github.com/naved2001/AIVerse

---

## 📸 Preview

### 💬 AI Chat

![AIVerse Chat](./screenshots/chat.png)

### 🌙 Dark Mode

![AIVerse Dark Mode](./screenshots/dark-mode.png)

### 🔐 Authentication

![AIVerse Authentication](./screenshots/auth.png)
![AIVerse Authentication](./screenshots/auth1.png)

---

# ✨ Features

## 🤖 AI-Powered Conversations

- Integrated with Google Gemini API
- Natural-language conversations
- Context-aware conversation history
- Streaming AI responses
- Loading and typing indicators
- Error handling for failed requests

## 💬 Chat Management

- Create new conversations
- Automatically generate conversation titles
- View previous conversations
- Select previous conversations
- Rename conversations
- Delete individual conversations
- Delete all conversations
- Search conversations

## ✏️ Message Features

- Edit user messages
- Regenerate AI responses
- Markdown rendering
- Headings
- Lists
- Links
- Blockquotes
- Inline code
- Code blocks

## 💻 Developer-Friendly Code Blocks

- Syntax-aware code rendering
- Language labels
- Copy code functionality
- Responsive code blocks

## 🔐 Authentication

- User registration
- User login
- User logout
- Protected application interface
- Persistent user sessions

Authentication and data persistence are handled using Supabase.

## 💾 Persistent Conversations

Conversation history is stored in Supabase so users can return to previous conversations after refreshing or logging back into the application.

## 🎨 User Interface

- Modern Gemini-inspired interface
- Light mode
- Dark mode
- Responsive layout
- Mobile sidebar navigation
- Profile menu
- Search interface
- Loading states
- Error states
- Responsive chat window

## ⌨️ Keyboard Support

- Enter → Send message
- Shift + Enter → New line

## 🖼️ Image Input

AIVerse also supports image input for AI-powered image-related interactions.

---

# 🛠️ Tech Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### AI

- Google Gemini API

### Backend / Database

- Supabase
- Supabase Authentication
- Supabase Database

### Libraries

- React Markdown
- Lucide React
- Syntax highlighting / code rendering

### Deployment

- Vercel

---

# 🏗️ Application Architecture

The application follows a component-based React architecture.

```text
AIVerse
│
├── Authentication
│   ├── Login
│   ├── Signup
│   └── User Session
│
├── Chat Interface
│   ├── Navbar
│   ├── Sidebar
│   ├── Welcome Screen
│   ├── Chat Window
│   ├── Chat Message
│   └── Message Input
│
├── AI Service
│   └── Gemini API
│
├── Conversation Management
│   ├── Create
│   ├── Read
│   ├── Update
│   ├── Rename
│   └── Delete
│
├── Database
│   └── Supabase
│
└── UI Features
    ├── Dark / Light Mode
    ├── Search
    ├── Markdown
    ├── Code Blocks
    ├── Edit Message
    └── Regenerate Response