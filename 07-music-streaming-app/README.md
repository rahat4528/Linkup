# Music Streaming App

High-fidelity, minimalist music streaming player featuring RFC 7233 HTTP 206 Range request slicing, interactive Canvas waveform visualization, and a dockable, persistent compact player.

## Features
- **HTTP 206 Partial Content Streaming**: Fast byte-range seeking with standard `Content-Range` and `Accept-Ranges` headers.
- **Canvas Waveform Visualizer**: Smooth 60fps waveform peak scrubbing with hover timestamp indicators and playback progress fill.
- **Dockable Compact Player**: Persistent player maintaining uninterrupted audio playback across route transitions.
- **Audio Chunk Caching**: Low-latency byte range memory cache for instant seek performance.
- **Track Catalog & Search**: Multi-genre filter pills, title/artist search, and favorite tracking.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide icons, Canvas API
- **Backend**: Node.js, Express, TypeScript, Helmet, CORS, JWT
- **Database**: PostgreSQL 16 (`linkup_music_streaming_db`), Prisma ORM
- **Cache**: Redis 7 / In-memory LRU audio slice cache
- **Containerization**: Docker Compose

## Getting Started

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run start:dev
```
Backend runs on `http://localhost:4007`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3007`.

### 4. Running Tests
```bash
cd backend
npm test
```
