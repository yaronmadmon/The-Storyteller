# The Storyteller

Turn your story into a book—just talk. We'll write it.

A voice-first book writing app that helps non-writers turn their stories into professionally written books. Speak naturally about your experiences, ideas, or imagination, and AI organizes and polishes your words into structured chapters.

## Quick Start

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create `.env.local` and add:

```env
# Required for voice transcription and AI rewrite
OPENAI_API_KEY=sk-...

# Optional: for persistence (without this, data is stored in memory for the session)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Without Supabase**: The app works in-memory. Books and chapters persist during the dev session but are lost on restart. Ideal for testing.

**With Supabase**: Run the migration in your Supabase project:

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Add your project URL and anon key to `.env.local`

## Features

- **Landing** → **Setup** (book type + description) → **Intro questions** → **Writing interface**
- Voice recording (browser MediaRecorder) → Whisper transcription → GPT-4 polish
- Style buttons: More Casual, Formal, Humor, Darker, Simplify
- Dashboard with progress and **Export .docx**

## Tech Stack

- Next.js 16 (App Router)
- shadcn/ui, Tailwind CSS
- OpenAI (Whisper, GPT-4)
- Supabase (optional)

## MVP Success Checklist

- [x] Pick book type on setup
- [x] Record Chapter 1 (voice → transcript)
- [x] See polished version (GPT-4)
- [x] Click style button → polished text updates
- [x] Accept & Next → saves and moves to next chapter
