# Podcast Platform

Creator-centric podcast publishing and audio distribution platform featuring compliant RSS 2.0 XML feed generation, SSRF-protected external feed ingestion, chapter navigation, and a modern audio player.

## Features
- **RSS 2.0 XML Generation**: Standard podcast feeds with audio `<enclosure>` metadata, RFC 822 pubDates, and draft episode filtering.
- **SSRF Defense Architecture**: Outbound feed validator blocking private subnets and cloud metadata endpoints.
- **Chapter Marker Management**: Interactive chapter markers with timestamp jumps and duration bounds checks.
- **Chapter-Aware Audio Player**: 15s/30s skipping, 1x-2x playback speed selectors, and chapter scrubber.
- **Creator Studio & Catalog**: Multi-show publishing, show notes markdown, and category filtering.

## Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide icons
- **Backend**: Node.js, Express, TypeScript, JWT, Helmet, CORS
- **Database**: PostgreSQL 16 (`linkup_podcast_db`), Prisma ORM
- **Cache**: Redis 7
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
Backend runs on `http://localhost:4009`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3009`.

### 4. Running Tests
```bash
cd backend
npm test
```
