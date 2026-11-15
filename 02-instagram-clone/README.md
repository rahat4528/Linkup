# Instagram Clone — Visual Media Discovery Platform

A modern, standalone, visual-first and mobile-responsive media publication platform designed for photography, multi-slide carousels, vertical video reels, and 24-hour expiring stories.

---

## 1. Features

### Photographic Carousels & Publishing
- Multi-slide image and video carousels (up to 10 slides per post).
- Media processing pipeline (`PROCESSING` -> `READY`) with thumbnail generation.
- Caption hashtag extraction, normalization, and volume velocity tracking.
- Location tagging and metadata.

### Ephemeral 24-Hour Stories
- Temporary photo/video stories with exact 24h expiration (`expiresAt = createdAt + 24 hours`).
- Query-time filtering strictly enforcing `expiresAt > now()`.
- Viewer analytics and interactive progress bar player.

### Vertical Short-Video Feed (Reels)
- Full-bleed vertical video stream with audio track attribution and sound toggle.
- Real-time like counts, views, and comment overlays.

### Privacy & Follow Requests
- Public and private accounts.
- Private accounts gate their profile grid and posts behind an explicit follow request flow (`PENDING` -> `ACCEPTED` / `REJECTED`).

### Explore & Discovery
- Trending hashtags computed across a 24-hour sliding window.
- 3-column explore grid with hover engagement metrics.
- Hashtag discovery pages.

### Direct Messaging
- In-app one-to-one messaging between connected creators.

---

## 2. Architecture & Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS | Mobile-first bottom navigation, carousel slider, vertical reels feed |
| **Backend** | Express / Node.js with TypeScript | Clean modular architecture, validation pipes, fast API responses |
| **Database** | PostgreSQL & Prisma ORM | Relational integrity, foreign key cascades, strict indexes |
| **Realtime** | Socket.IO | Instant DM alerts and notifications |
| **Containerization** | Docker & Docker Compose | Isolated local development environment |

---

## 3. Getting Started

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Setup Instructions

1. Configure Environment:
   ```bash
   cp .env.example .env
   ```

2. Start Local Containers (Optional):
   ```bash
   docker compose up -d
   ```

3. Backend Setup & Run:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
   API runs on `http://localhost:4002`.

4. Frontend Setup & Run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Application runs on `http://localhost:3001`.

---

## 4. Running Automated Tests

Run the full automated test suite:
```bash
cd backend
npm test
```

---

## 5. Seed Accounts

- `elena@example.com` (Elena Rostova - Public Photographer)
- `marcus@example.com` (Marcus Chen - Motion Designer)
- `sophia@example.com` (Sophia Laurent - Private Account)
Password: `Password123!`
