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
![Ollama](https://img.shields.io/badge/AI-Ollama-3F7CFF?logo=ollama&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## About

Cortex is a self-hosted knowledge base that reads your documents and answers questions about them. Upload **PDF**, **Word (DOCX)**, and **PowerPoint (PPTX)** files, organize them into folders, and chat with a **private AI** that is grounded only in your own files, with citations back to the exact source.

The AI runs **entirely on your local machine** via [Ollama](https://ollama.com). Your documents are never sent to a third-party model. File binaries are stored in **Cloudflare R2** through presigned URLs, and MongoDB only keeps metadata and AI embeddings.

## What I Built

This project demonstrates the full development lifecycle of a production-grade web application, from system design and architecture to deployment-ready code. It covers:

- **Retrieval-Augmented Generation (RAG):** Building a complete pipeline that chunks documents, generates embeddings locally, performs semantic search via cosine similarity, and streams AI-generated answers with source citations
- **Real-Time Streaming:** Implementing Server-Sent Events (SSE) to stream AI responses token-by-token to the frontend, providing an instant-feedback chat experience
- **Secure File Architecture:** Designing a system where file binaries never touch the application server, using presigned URLs for direct browser-to-cloud uploads
- **Authentication & Authorization:** Building JWT-based auth with bcrypt hashing, per-user data scoping, and ownership verification on every protected endpoint
- **Full-Stack State Management:** Managing complex frontend state across chat sessions, file uploads, folder navigation, and streaming responses in a single-page application

## Key Features

- **AI Chat with Citations** - Ask anything in plain language. Answers are generated from your uploaded files via RAG and cite the exact source documents
- **Persistent Chat History** - Full conversation history is saved to MongoDB and restored when you revisit a chat. Chats are auto-titled by the AI
- **Private by Design** - The AI runs locally with Ollama (embedding + chat models). No external AI APIs, no training on your data
- **Semantic Retrieval** - Documents are chunked, embedded, and searched by meaning, not just keywords
- **Secure Authentication** - Sign up / sign in with JWT and bcrypt. Per-user file scoping
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
| AI / RAG | Ollama (local chat + embedding models), semantic chunk search, streaming SSE |
| Auth | JWT + bcrypt |

## How the AI Chat Works

1. **Index** - When you send your first question, each file is fetched from R2 and its text is extracted (PDF via pdf-parse, DOCX via mammoth, PPTX via JSZip)
2. **Embed** - The text is split into overlapping chunks and embedded locally with `nomic-embed-text`
3. **Retrieve** - Your question is embedded and the top matching chunks are found by cosine similarity
4. **Generate** - The chunks are sent to your local chat model, which streams an answer back over SSE with cited sources

## Project Structure

```
src/
├── Backend/
│   ├── config/          # db.js, r2.js (S3 client), ollama.js (local AI + embeddings)
│   ├── controllers/     # auth, folder, file, chat (RAG pipeline) controllers
│   ├── middleware/      # protect (JWT)
│   ├── models/          # User, Folder, File, FileChunk, Chat schemas
│   ├── routes/          # /api/auth, /api/folders, /api/files, /api/chat
│   ├── utils/           # textExtractor.js (PDF/DOCX/PPTX to text)
│   └── server.js
└── (frontend)
    ├── components/      # Dashboard, Landing, FilePopup, FolderPopup, modals
    └── services/        # API clients (auth, folder, file, chat services)
```

## Getting Started

### 1. Install Ollama (required for AI chat)

1. Install [Ollama](https://ollama.com/download)
2. Pull an embedding model and a chat model:

```bash
ollama pull nomic-embed-text
ollama pull qwen3-coder:30b   # any chat model works, smaller ones are faster on CPU
```

3. Run the server: `ollama serve` (it runs automatically after install)

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
OLLAMA_CHAT_MODEL=qwen3-coder:30b
OLLAMA_EMBED_MODEL=nomic-embed-text
```

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
| GET | `/api/folders` | Yes | List all folders |
| POST | `/api/folders` | Yes | Create a folder |
| GET | `/api/files` | Yes | List all files (owner populated) |
| GET | `/api/files/storage` | Yes | Get total storage used (bytes) and file count |
| POST | `/api/files/upload-url` | Yes | Get a signed upload URL |
| POST | `/api/files` | Yes | Save file metadata after upload |
| GET | `/api/files/:id/download` | Yes | Get a signed download URL |
| DELETE | `/api/files/:id` | Yes | Delete from R2 + database |
| GET | `/api/chat` | Yes | List all chats (titles + timestamps) |
| POST | `/api/chat` | Yes | Ask a question, streams RAG answer over SSE |
| POST | `/api/chat/new` | Yes | Create a new empty chat |
| GET | `/api/chat/:id` | Yes | Load a chat with full message history |
| DELETE | `/api/chat/:id` | Yes | Delete a chat |

## Roadmap

- [x] Backend API with authentication
- [x] MongoDB integration
- [x] Cloud file storage (presigned URLs, Cloudflare R2)
- [x] Folder filtering and file management UI
- [x] AI chat with RAG over uploaded files (local Ollama, cited answers)
- [x] Persistent chat history with full conversation saving
- [x] AI-generated chat titles
- [x] Accurate storage usage on profile page
- [ ] AI reading for legacy `.doc` / `.ppt` files
- [ ] File re-indexing when documents change
- [ ] Export chat answers and saved conversations

## Contact

**Saif Jaber** | [GitHub](https://github.com/Saif-jaber)

---

<div align="center">

Built with passion for better knowledge management.

</div>
