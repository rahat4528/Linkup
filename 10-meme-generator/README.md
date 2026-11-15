# Meme Generator

Interactive multi-layer graphic editor and meme creation platform featuring client-side HTML5 Canvas 2D editing, server-side SVG compositing, custom typography styling, and instant image export.

## Features
- **Multi-Layer Canvas 2D Editor**: Draggable/resizable text layers, stroke outlines, color pickers, and font size adjustment.
- **Server-Side SVG Compositing**: Node rendering engine generating vector SVG graphics from layer JSON.
- **Template Library**: Pre-built categorized templates (Decisions, Reactions, Classic) with support for custom image uploads.
- **Instant Image Export**: Client-side PNG export via Canvas data URLs with zero server round-trip latency.
- **Community Gallery**: Public meme showcase with upvoting.

## Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide icons, HTML5 Canvas API
- **Backend**: Node.js, Express, TypeScript, JWT, Helmet, CORS
- **Database**: PostgreSQL 16 (`linkup_meme_generator_db`), Prisma ORM
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
Backend runs on `http://localhost:4010`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3010`.

### 4. Running Tests
```bash
cd backend
npm test
```
