<div align="center">

<img src="public/logo.svg" alt="Cortex" width="80" />

# Cortex

**A private, AI-powered knowledge base. Upload your documents, ask anything, and get answers grounded in your files with citations.**

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

## What is Cortex?

Cortex is a self-hosted knowledge base that reads your documents and answers your questions about them. Upload **PDF, Word (DOCX)** and **PowerPoint (PPTX)** files, organize them into folders, and chat with a **private AI** that is grounded only in your own files, with citations back to the exact source.

The AI runs **locally on your machine** via [Ollama](https://ollama.com), so your documents are never sent to a third-party model. File binaries are stored in **Cloudflare R2** through presigned URLs, never through your application server, and MongoDB only keeps metadata and AI embeddings.

## Key Features

- **AI Chat with Citations** | Ask anything in plain language. Answers are generated from your uploaded files via retrieval-augmented generation (RAG) and cite the exact source documents
- **Persistent Chat History** | Full conversation history is saved to MongoDB and restored when you revisit a chat. Chats are auto-titled by the AI based on the conversation
- **Private by Design** | The AI runs locally with Ollama (embedding model + chat model). No external AI APIs, no training on your data
- **Semantic Retrieval** | Documents are chunked, embedded and searched by meaning, not just keywords
- **Secure Authentication** | Sign up / sign in with JWT and bcrypt password hashing, per-user file scoping
- **Folder Organization** | Create folders, click to filter files by folder, live file counts per folder
- **Cloud File Storage** | Files stored in Cloudflare R2 via presigned URLs, validated by type (PDF/DOC/DOCX/PPT/PPTX) and size (max 50 MB)
- **Storage Dashboard** | Profile page shows accurate total storage used across all uploaded files
- **Metadata in MongoDB** | File records and AI chunk embeddings live in Mongo, binaries never touch the database
- **Ownership Checks** | Download, delete and chat endpoints verify the file belongs to the requester
- **Dark Mode UI** | Clean, minimal, responsive interface designed for focus

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Storage | Cloudflare R2 (S3-compatible presigned URLs) |
| AI / RAG | Ollama (local chat + embedding models), semantic chunk search, streaming SSE |
| Auth | JWT + bcrypt |

## How the AI chat works

1. **Index** — when you send your first question, each of your files is fetched from R2 and its text is extracted (PDF via pdf-parse, DOCX via mammoth, PPTX via JSZip)
2. **Embed** — the text is split into overlapping chunks and embedded locally with `nomic-embed-text`
3. **Retrieve** — your question is embedded and the top matching chunks are found by cosine similarity
4. **Generate** — the chunks are sent to your local chat model, which streams an answer back over SSE with cited sources

## Project Structure

```
src/
├── Backend/
│   ├── config/          # db.js, r2.js (S3 client), ollama.js (local AI + embeddings)
│   ├── controllers/     # auth, folder, file, chat (RAG pipeline) controllers
│   ├── middleware/      # protect (JWT)
│   ├── models/          # User, Folder, File, FileChunk, Chat schemas
│   ├── routes/          # /api/auth, /api/folders, /api/files, /api/chat
│   ├── utils/           # textExtractor.js (PDF/DOCX/PPTX → text)
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
ollama pull qwen3-coder:30b   # any chat model works — smaller ones are faster on CPU
```

3. Run the server: `ollama serve` (it runs automatically after install)

### 2. Clone & install

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

# Optional — defaults are shown
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
# terminal 1 — backend (port 5000)
node src/Backend/server.js

# terminal 2 — frontend (port 5173)
npm run dev
```

> **Note:** `r2.dev` URLs are for local development only. Add a custom domain under your bucket's Settings before going to production.

> **Note:** File indexing is lazy — the first question you ask in a chat indexes all your files. Legacy `.doc` and `.ppt` files can be stored but aren't readable by the AI yet.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, receive JWT |
| GET | `/api/folders` | ✅ | List all folders |
| POST | `/api/folders` | ✅ | Create a folder |
| GET | `/api/files` | ✅ | List all files (owner populated) |
| GET | `/api/files/storage` | ✅ | Get total storage used (bytes) and file count |
| POST | `/api/files/upload-url` | ✅ | Get a signed upload URL |
| POST | `/api/files` | ✅ | Save file metadata after upload |
| GET | `/api/files/:id/download` | ✅ | Get a signed download URL |
| DELETE | `/api/files/:id` | ✅ | Delete from R2 + database |
| GET | `/api/chat` | ✅ | List all chats (titles + timestamps) |
| POST | `/api/chat` | ✅ | Ask a question — streams RAG answer over SSE (`status`, `delta`, `sources`, `chatId`, `title`, `done`, `error` events) |
| POST | `/api/chat/new` | ✅ | Create a new empty chat |
| GET | `/api/chat/:id` | ✅ | Load a chat with full message history |
| DELETE | `/api/chat/:id` | ✅ | Delete a chat |

## Screenshots

> Dashboard UI featuring dark mode, responsive layout with sidebar navigation, folder management, file browser, and AI chat with cited sources.

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
