<div align="center">

<img src="public/logo.svg" alt="Cortex" width="80" />

# Cortex

**A full-stack, AI-powered knowledge base that lets you upload documents and have real conversations about their content.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?logo=cloudflare&logoColor=white)
![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?logo=openai&logoColor=white)
![Anthropic](https://img.shields.io/badge/AI-Anthropic-D97757?logo=anthropic&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2?logo=googlegemini&logoColor=white)
![Ollama](https://img.shields.io/badge/AI-Ollama%20Local-3F7CFF?logo=ollama&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## About

Cortex is a self-hosted knowledge base that reads your documents and answers questions about them. Upload **PDF**, **Word (DOCX)**, and **PowerPoint (PPTX)** files, organize them into folders, and chat with an AI grounded only in your own files, with citations back to the exact source.

The AI is **bring-your-own**: every user connects their own model from the settings form, either a **cloud provider** (OpenAI, Anthropic, Google Gemini, Groq, OpenRouter) or a **local model** (Ollama or any OpenAI-compatible endpoint such as LM Studio or vLLM). Chat stays locked until a real connection is verified, so the app never calls an AI you did not explicitly provide. File binaries are stored in **Cloudflare R2** through presigned URLs, and MongoDB only keeps metadata and AI embeddings.

## What I Built

This project demonstrates the full development lifecycle of a production-grade web application, from system design and architecture to deployment-ready code. It covers:

- **Retrieval-Augmented Generation (RAG):** Building a complete pipeline that chunks documents, generates embeddings, performs semantic search via cosine similarity, and streams AI-generated answers with source citations
- **Multi-Provider AI Integration:** Designing a unified adapter layer that normalizes streaming, validation, and embeddings across three wire protocols (OpenAI-compatible SSE, Anthropic Messages, Gemini generateContent), plus live credential verification against each provider before saving
- **Real-Time Streaming:** Implementing Server-Sent Events (SSE) to stream AI responses token-by-token to the frontend, providing an instant-feedback chat experience
- **Secure File Architecture:** Designing a system where file binaries never touch the application server, using presigned URLs for direct browser-to-cloud uploads
- **Authentication & Authorization:** Building JWT-based auth with bcrypt hashing, per-user data scoping, ownership verification on every protected endpoint, and AES-256-GCM encryption for stored API keys
- **Full-Stack State Management:** Managing complex frontend state across chat sessions, file uploads, folder navigation, and streaming responses in a single-page application

## Key Features

- **Bring Your Own AI** - Connect an API key from OpenAI, Anthropic, Gemini, Groq, or OpenRouter, or point Cortex at a local model (Ollama, LM Studio, any OpenAI-compatible URL). Keys are verified against the live provider before saving and encrypted at rest
- **AI Chat with Citations** - Ask anything in plain language. Answers are generated from your uploaded files via RAG and cite the exact source documents
- **Persistent Chat History** - Full conversation history is saved to MongoDB and restored when you revisit a chat. Chats are auto-titled by the connected model
- **Adaptive Retrieval** - Uses the connected provider's native embeddings when available (OpenAI / Gemini), falls back to local Ollama embeddings, then to keyword search. Chunks re-index automatically when the embedding model changes
- **Semantic Retrieval** - Documents are chunked, embedded, and searched by meaning, not just keywords
- **Secure Authentication** - Sign up / sign in with JWT and bcrypt. Per-user file scoping and a locked profile editor (email is permanent)
- **Folder Organization** - Create folders, filter files by folder, live file counts
- **Cloud File Storage** - Files stored in Cloudflare R2 via presigned URLs, validated by type and size (max 50 MB)
- **Storage Dashboard** - Profile page shows accurate total storage used across all uploaded files
- **Ownership Checks** - Download, delete, and chat endpoints verify the file belongs to the requester
- **Dark Mode UI** - Clean, minimal, responsive interface designed for focus

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Storage | Cloudflare R2 (S3-compatible presigned URLs) |
| AI / RAG | Multi-provider: OpenAI, Anthropic, Gemini, Groq, OpenRouter, Ollama, custom endpoints. Streaming SSE, semantic chunk search, keyword fallback |
| Auth | JWT + bcrypt, AES-256-GCM encrypted provider keys |

## Bring Your Own AI

Cortex has no built-in model and no server-wide API key. Each user connects their own credentials through the **AI Model** form:

1. **Pick a provider** - a cloud API (OpenAI, Anthropic, Google Gemini, Groq, OpenRouter) or a local option (Ollama, or any custom OpenAI-compatible URL)
2. **Enter your credentials** - an API key for cloud providers, or a base URL plus model name for local servers
3. **Verify & Save** - the backend calls the live provider to confirm the credentials actually work before storing anything. Invalid keys are rejected with the provider's real error message

Until a verified connection exists, chat stays locked in the UI and the API refuses chat requests. Keys are AES-256-GCM encrypted at rest and only ever decrypted server-side to talk to the chosen provider; the frontend only receives a masked hint like `••••1234`.

## How the AI Chat Works

1. **Connect** - Chat requires a verified provider connection (see above)
2. **Index** - When you send your first question, each file is fetched from R2 and its text is extracted (PDF via pdf-parse, DOCX via mammoth, PPTX via JSZip)
3. **Embed** - Text is split into overlapping chunks and embedded with the best available source: the connected provider's embedding API (OpenAI / Gemini), then local Ollama (`nomic-embed-text`), otherwise chunks are stored unembedded for keyword search
4. **Retrieve** - Your question is embedded and the top matching chunks are found by cosine similarity, or scored by term overlap when no embedding source exists
5. **Generate** - The context is sent to your connected model over its native protocol, which streams the answer back over SSE with cited sources

## Project Structure

```
src/
├── Backend/
│   ├── config/          # db.js, r2.js (S3 client), ollama.js, aiProviders.js (multi-provider adapters)
│   ├── controllers/     # auth, folder, file, chat (RAG pipeline), ai (provider connection) controllers
│   ├── middleware/      # protect (JWT)
│   ├── models/          # User (with embedded AI config), Folder, File, FileChunk, Chat schemas
│   ├── routes/          # /api/auth, /api/folders, /api/files, /api/chat, /api/ai
│   ├── utils/           # textExtractor.js (PDF/DOCX/PPTX to text), crypto.js (key encryption)
│   └── server.js
└── (frontend)
    ├── components/      # Dashboard, Landing, FilePopup, FolderPopup, AI settings modal
    └── services/        # API clients (auth, folder, file, chat, ai services)
```

## Getting Started

### 1. Choose your AI setup

**Option A: Cloud provider (easiest).** Grab an API key from [OpenAI](https://platform.openai.com/api-keys), [Anthropic](https://console.anthropic.com/settings/keys), [Google AI Studio](https://aistudio.google.com/app/apikey), [Groq](https://console.groq.com/keys), or [OpenRouter](https://openrouter.ai/settings/keys) and connect it inside the app (AI Chat sidebar → **AI Model**).

**Option B: Fully local.** Install [Ollama](https://ollama.com/download) and pull models:

```bash
ollama pull nomic-embed-text   # used for embeddings when the chat provider has no embedding API
ollama pull llama3.2           # or any chat model you like
```

Then run `ollama serve` and connect with server URL `http://localhost:11434/v1`.

### 2. Clone and install

```bash
git clone https://github.com/Saif-jaber/Cortex.git
cd Cortex
npm install
```

### 3. Configure environment

Create `src/Backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/Cortex
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=cortex-files

# Optional, defaults are shown
OLLAMA_BASE_URL=http://localhost:11434
AI_KEY_SECRET=another_long_random_secret
```

> **Note:** `OLLAMA_BASE_URL` is only used as an embedding fallback for providers without their own embedding API (e.g. Anthropic, Groq). `AI_KEY_SECRET` encrypts stored provider API keys; it falls back to `JWT_SECRET` if unset.

### 4. Set up Cloudflare R2

1. Create a free account at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Create an **R2 bucket** (e.g. `cortex-files`)
3. Create an **R2 API token** (User token, *Object Read & Write*) and copy the Access Key ID + Secret
4. Add a **CORS policy** to the bucket so browser uploads work:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. Run

```bash
# terminal 1 - backend (port 5000)
node src/Backend/server.js

# terminal 2 - frontend (port 5173)
npm run dev
```

> **Note:** File indexing is lazy. The first question you ask in a chat indexes all your files. Legacy `.doc` and `.ppt` files can be stored but are not yet readable by the AI.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create an account |
| POST | `/api/auth/login` | No | Log in, receive JWT |
| PUT | `/api/auth/profile` | Yes | Update first/last name (email is permanent), re-issues JWT |
| GET | `/api/ai/providers` | Yes | List connectable AI providers |
| GET | `/api/ai/config` | Yes | Get the current provider connection (masked) |
| PUT | `/api/ai/config` | Yes | Verify credentials against the live provider, then save (encrypted) |
| DELETE | `/api/ai/config` | Yes | Disconnect the current provider |
| GET | `/api/folders` | Yes | List all folders |
| POST | `/api/folders` | Yes | Create a folder |
| GET | `/api/files` | Yes | List all files (owner populated) |
| GET | `/api/files/storage` | Yes | Get total storage used (bytes) and file count |
| POST | `/api/files/upload-url` | Yes | Get a signed upload URL |
| POST | `/api/files` | Yes | Save file metadata after upload |
| GET | `/api/files/:id/download` | Yes | Get a signed download URL |
| DELETE | `/api/files/:id` | Yes | Delete from R2 + database |
| GET | `/api/chat` | Yes | List all chats (titles + timestamps) |
| POST | `/api/chat` | Yes | Ask a question, streams RAG answer over SSE (requires connected AI) |
| POST | `/api/chat/new` | Yes | Create a new empty chat |
| GET | `/api/chat/:id` | Yes | Load a chat with full message history |
| DELETE | `/api/chat/:id` | Yes | Delete a chat |

## Roadmap

- [x] Backend API with authentication
- [x] MongoDB integration
- [x] Cloud file storage (presigned URLs, Cloudflare R2)
- [x] Folder filtering and file management UI
- [x] AI chat with RAG over uploaded files, cited answers
- [x] Persistent chat history with full conversation saving
- [x] AI-generated chat titles
- [x] Accurate storage usage on profile page
- [x] Bring-your-own AI: multi-provider connections with live key verification and encryption at rest
- [ ] AI reading for legacy `.doc` / `.ppt` files
- [ ] File re-indexing when documents change
- [ ] Export chat answers and saved conversations

## Contact

**Saif Jaber** | [GitHub](https://github.com/Saif-jaber)

---

<div align="center">

Built with passion for better knowledge management.

</div>
