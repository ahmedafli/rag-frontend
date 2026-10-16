# 🧠 RAG Knowledge Assistant — Frontend

A modern, AI-powered knowledge base interface built with **Next.js 16** and **TypeScript**. Upload documents, index them into a vector store, and have natural language conversations with your data — all through a sleek, responsive UI.

> **Note:** This is the **frontend** repository only. The backend (FastAPI + RAG pipeline) lives in a separate repository with its own README.

---

## ✨ Features

- **Dashboard** — At-a-glance stats, quick actions, and onboarding guide
  
  <img width="1505" height="726" alt="dashbordrag" src="https://github.com/user-attachments/assets/181bce17-32d4-4460-896d-b7fcd86ee36f" />
  

- **Knowledge Base** — Upload, manage, and monitor indexed documents (PDF, DOCX, MD, TXT)
  
  <img width="1521" height="726" alt="knowledgebaserag" src="https://github.com/user-attachments/assets/941931c9-9324-42b3-8c84-0ba01cf0d95e" />
  

- **AI Chat** — Conversational Q&A grounded in your uploaded documents, with source citations
- **Conversation History** — Persistent chat sessions saved and resumable

  <img width="1521" height="730" alt="aichatrag" src="https://github.com/user-attachments/assets/d0223b81-f4a2-4e2d-a52a-c7bf2c5190c2" />

  
- **Demo Mode** — Locked upload area with a pre-loaded sample PDF so users can test the full pipeline instantly

---

## 🖥️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Icons | [Lucide React](https://lucide.dev/) |
| Runtime | React 19 |

---

## 📁 Project Structure

```
ragfront/
├── app/
│   ├── (main)/
│   │   ├── dashboard/        # Dashboard page (stats + quick actions)
│   │   ├── knowledge-base/   # Document management page
│   │   └── chat/             # AI chat interface
│   ├── layout.tsx
│   └── page.tsx              # Redirects → /dashboard
├── components/
│   ├── AddDocumentModal.tsx  # Upload modal (demo-locked)
│   ├── Breadcrumbs.tsx
│   ├── HeroSection.tsx       # Dashboard hero with "New Knowledge Base" button
│   ├── HowItWorks.tsx
│   ├── QuickActionCard.tsx
│   ├── Sidebar.tsx
│   └── StatsCard.tsx
└── public/
    └── sample_rag_notes.pdf  # Pre-loaded demo document
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- The backend API running (see the backend repo)

### Installation

```bash
# Clone the repo
git clone <your-frontend-repo-url>
cd ragfront

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

> If not set, the app defaults to `http://127.0.0.1:8000`.

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app redirects to `/dashboard` automatically.

---

## 🔌 Backend API Endpoints Used

The frontend communicates with the backend over REST. The following endpoints are expected:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload one or more documents |
| `GET` | `/documents` | List all indexed documents |
| `DELETE` | `/documents/:id` | Delete a document |
| `POST` | `/ask` | Query the RAG pipeline |
| `GET` | `/conversations` | List conversation sessions |
| `GET` | `/conversations/:id` | Get a single conversation |
| `DELETE` | `/conversations/:id` | Delete a conversation |

Refer to the **backend repository** for full API documentation and setup instructions.

---

## 🔒 Demo Mode

When users open the upload modal (via "New Knowledge Base" or "Add Document"), the upload is locked to a single pre-loaded demo file: `public/sample_rag_notes.pdf`.

This lets anyone test the full upload → index → chat pipeline without needing to provide their own files.

> To unlock unrestricted uploads, a **Premium** plan is required.

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🗺️ Pages

### `/dashboard`
Overview of the knowledge base with stats cards, quick-action shortcuts, and a "How It Works" guide.

### `/knowledge-base`
Table view of all uploaded documents with their processing status (Processing / Ready / Failed), chunk counts, upload timestamps, and delete actions.

### `/chat`
Full-featured chat interface with:
- Document selector (filter which indexed docs to query)
- Conversation sidebar with history
- Source citations shown alongside AI responses
'@
