# Cortex

An AI-powered knowledge base application built on the MERN stack. Organize, search, and retrieve documents across connected sources with intelligent folder hierarchies and semantic search.

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, Vite 8
- **Backend:** Node.js, Express *(planned)*
- **Database:** MongoDB *(planned)*
- **AI:** Semantic search and tagging *(planned)*

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/cortex.git
cd cortex

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

## Project Structure

```
cortex/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.svg
├── src/
│   ├── components/
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Features

- Dark mode dashboard UI
- Sidebar navigation with folder tree
- Hierarchical folder organization with expand/collapse
- Folder cards with multi-source integration badges (Notion, Google Drive, Slack, Figma)
- File table with type icons, sizes, dates, and contributor avatars
- Breadcrumb navigation with dropdown folder selector
- Search with keyboard shortcut hint
- Responsive layout

## Status

Currently in active development. The frontend UI is built; backend, database, and AI features are planned.

## License

MIT
