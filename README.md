# Lenny Advisor

Thoughtful, podcast-powered guidance for your toughest work and life questions.

Describe a challenge you're facing and get AI-generated advice grounded in 300+ episodes of Lenny's Podcast, with direct links to the exact YouTube timestamps where the insights live.

## Features

- **Natural language Q&A** — describe your challenge in plain words
- **Grounded answers** — every insight comes from real podcast transcripts
- **YouTube deep-links** — jump to the exact moment in the video
- **Transcript downloads** — grab the full transcript for any cited episode
- **Copy & export** — save answers as Markdown files
- **Conversation history** — revisit past questions and answers
- **User accounts** — sign up, log in, private chat history

## Tech Stack

- **Next.js 15** (App Router, React 19, Tailwind CSS v4)
- **Supabase** (PostgreSQL + pgvector, Auth, RLS)
- **Zhipu AI** (GLM-4-plus for chat, Embedding-3 for vectors)
- **Impeccable** design skills for warm, professional UI

## Getting Started

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Zhipu AI](https://open.bigmodel.cn) API key

### 2. Set up Supabase

Run `supabase/schema.sql` in your Supabase SQL Editor to create:
- `transcript_chunks` table with pgvector embeddings
- `conversations` and `messages` tables
- Similarity search function
- Row Level Security policies

### 3. Configure environment

Copy `.env.local` and fill in your real values:

```
ZHIPU_API_KEY=your-zhipu-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Install & run

```bash
npm install
npm run dev
```

### 5. Ingest transcripts

Before the app can answer questions, you need to embed the podcast transcripts:

```bash
npm run ingest
```

This parses all 303 episode transcripts, chunks them by timestamp, generates embeddings via Zhipu, and stores them in Supabase. It takes ~20-30 minutes.

### 6. Deploy

```bash
npx vercel deploy
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with fonts
│   ├── (auth)/login/page.tsx    # Login
│   ├── (auth)/signup/page.tsx   # Signup
│   ├── chat/page.tsx            # New conversation
│   ├── chat/[id]/page.tsx       # Existing conversation
│   ├── history/page.tsx         # Conversation history
│   └── api/
│       ├── chat/route.ts        # RAG streaming endpoint
│       ├── transcript/[slug]/   # Transcript download
│       └── export/route.ts      # Answer export
├── components/
│   ├── ChatView.tsx             # Main chat interface
│   ├── SearchInput.tsx          # Natural language input
│   ├── AnswerCard.tsx           # Markdown answer + actions
│   ├── CitationCard.tsx         # Episode citation with YouTube link
│   └── ConversationSidebar.tsx  # Past conversations
├── lib/
│   ├── supabase/                # Supabase client + server
│   ├── zhipu.ts                 # Zhipu API wrapper
│   ├── rag.ts                   # RAG pipeline
│   └── utils.ts                 # Helpers
scripts/
└── ingest.ts                    # One-time data ingestion
supabase/
└── schema.sql                   # Database schema
```
