<div align="center">

<img src="public/logo.svg" alt="Cortex" width="80" />

# Cortex

**An AI-powered knowledge base that connects your tools, organizes your knowledge, and makes everything searchable.**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare%20R2-F38020?logo=cloudflare&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## What is Cortex?

Cortex is a modern knowledge management platform that brings documents from **Notion**, **Google Drive**, **Slack**, **Figma**, and more into a single, searchable workspace. It combines a full-stack **MERN** architecture with industry-standard object storage so documents are uploaded directly to the cloud — never through your application server.

## Key Features

- **Secure Authentication** | Sign up / sign in with JWT, bcrypt password hashing, and server-side validation
- **Folder Organization** | Create folders, click to filter files by folder, live file counts per folder
- **Cloud File Storage** | Files stored in **Cloudflare R2** via presigned URLs — the client uploads straight to the bucket, your server only signs URLs
- **Document Support** | Upload and manage Word, PDF, and PowerPoint files (type + size validated server-side)
- **Metadata in MongoDB** | File records store name, type, size, folder, and owner — binaries never touch the database
- **Ownership Checks** | Download and delete endpoints verify the file belongs to the requester
- **AI-Powered Search** *(roadmap)* | Semantic search that understands context, not just keywords
- **Dark Mode UI** | Clean, minimal interface designed for focus

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Vite |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| Storage | Cloudflare R2 (S3-compatible presigned URLs) |
| Auth | JWT + bcrypt |

## Project Structure

```
src/
├── Backend/
│   ├── config/          # db.js, r2.js (S3 client)
│   ├── controllers/     # auth, folder, file controllers
│   ├── middleware/      # protect (JWT), role guards
│   ├── models/          # User, Folder, File schemas
│   ├── routes/          # /api/auth, /api/folders, /api/files
│   └── server.js
└── (frontend)
    ├── components/      # Dashboard, FilePopup, FolderPopup, modals
    └── services/        # API clients (auth, folder, file services)
```

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Saif-jaber/Cortex.git
cd Cortex
npm install
```

### 2. Configure environment

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
```

### 3. Set up Cloudflare R2

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

### 4. Run

```bash
# terminal 1 — backend (port 5000)
node src/Backend/server.js

# terminal 2 — frontend (port 5173)
npm run dev
```

> **Note:** `r2.dev` URLs are for local development only. Add a custom domain under your bucket's Settings before going to production.

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create an account |
| POST | `/api/auth/login` | — | Log in, receive JWT |
| GET | `/api/folders` | ✅ | List all folders |
| POST | `/api/folders` | ✅ | Create a folder |
| GET | `/api/files` | ✅ | List all files (owner populated) |
| POST | `/api/files/upload-url` | ✅ | Get a signed upload URL |
| POST | `/api/files` | ✅ | Save file metadata after upload |
| GET | `/api/files/:id/download` | ✅ | Get a signed download URL |
| DELETE | `/api/files/:id` | ✅ | Delete from R2 + database |

## Screenshots

> Dashboard UI featuring dark mode, responsive layout with sidebar navigation, folder management, and file browser.

## Roadmap

- [x] Backend API with authentication
- [x] MongoDB integration
- [x] Cloud file storage (presigned URLs, Cloudflare R2)
- [x] Folder filtering and file management UI
- [ ] AI-powered document indexing and search
- [ ] OAuth for third-party integrations
- [ ] Real-time collaboration

## Contact

**Saif Jaber** | [GitHub](https://github.com/Saif-jaber)

---

<div align="center">

Built with passion for better knowledge management.

</div>
