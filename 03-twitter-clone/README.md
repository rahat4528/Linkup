# Twitter Clone — Microblogging & Real-Time Feed Platform

A high-velocity, short-form microblogging and conversational discovery platform built with Next.js, Node.js, Express, PostgreSQL, and Prisma.

## Key Features

- **Short-Form Publishing & Grapheme Counter**:
  - Strict 280-character limit calculated using Unicode grapheme segmentation (complex emoji sequences like `👩‍💻` and flags count as 1 character).
  - Web URLs are automatically detected and weighted at a fixed 23 characters regardless of raw length.
  - 60-minute edit window with immutable edit history tracking.
- **Thread Hierarchy & Conversation Trees**:
  - Deterministic thread ordering based on `conversationId` and `parentId`.
  - Parent deletion applies a non-destructive `[This post has been deleted]` tombstone, maintaining intact subtrees for all replies.
- **Interactive Polls**:
  - Native 2 to 4 option polls with expiration timers.
  - Atomic database-level constraints enforcing strictly one vote per user per poll.
  - Real-time percentage breakdowns.
- **Community Notes Moderation**:
  - Contextual annotation engine powered by a diversity consensus algorithm.
  - Notes achieve `HELPFUL` status only when approved by raters with opposing baseline agreement profiles (variance $\ge 0.25$).
- **Mute vs Block Semantics**:
  - **Mute**: Silently removes user's posts from the timeline while keeping the follow relationship intact; muter can still view their profile.
  - **Block**: Instantly severs follow relationships in both directions, denies profile access (`403 Forbidden`), and completely removes user from feeds and search.
- **Discovery & Sliding-Window Trending**:
  - Dual-stream home feeds: "For You" (ranked by velocity and affinity) and "Following" (reverse-chronological).
  - Sliding 24-hour window topic aggregator computing real-time hashtag velocity.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, TypeScript, Helmet, CORS, JWT |
| Database | PostgreSQL 16 (`linkup_twitter_db`), Prisma ORM |
| Caching & Realtime | Redis 7, Socket.IO |
| Storage | MinIO S3-Compatible Object Store |

---

## Directory Structure

```
03-twitter-clone/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── index.ts
│   └── tests/
│       ├── unit/
│       └── integration/
├── database/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
│   ├── api.md
│   ├── architecture.md
│   ├── completion-report.md
│   └── requirements.md
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       └── services/
├── storage/
├── tests/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### 1. Start Infrastructure Services

```bash
docker-compose up -d
```

### 2. Configure Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

### 3. Start Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be accessible at `http://localhost:3002`.

---

## Running Automated Tests

Run the complete 7-suite test matrix:

```bash
cd backend
npm test
```
