# Spotify Clone — Audio Catalog & Discovery Platform

A full-featured music discovery and audio streaming platform featuring hierarchical artist/album/track catalogs, persistent HTML5 audio player bar, queue management with Fisher-Yates shuffling and repeat modes, customizable playlist reordering, and user library collections.

## Features

- **Audio Catalog & Metadata Structure**:
  - Normalized relational entities: `Artist`, `Album`, `Track`, `Playlist`, `PlaylistTrack`, `UserLikedTrack`, and `UserSavedAlbum`.
  - Track duration formatting, track numbering, and album cover art association.
- **Queue Management & Playback Algorithms**:
  - Dual-queue system: "Up Next" user-prioritized tracks dequeued ahead of context album/playlist tracks.
  - Fisher-Yates uniform shuffle algorithm ensuring unbiased permutations in $O(n)$ time while preserving the ability to restore original sequential order.
  - Repeat modes: `OFF` (finishes after last track), `ALL` (loops queue upon completion), `ONE` (loops active track indefinitely).
- **Playlist Curation & Deterministic Reordering**:
  - Dynamic user playlist creation with cover art and descriptions.
  - Position index management ($0, 1, 2, \dots$): moving tracks reindexes affected items continuously and deletion automatically compacts remaining positions.
- **User Library**:
  - "Liked Songs" collection with instant heart toggling.
  - Album bookmarking and saved collections.
- **Search & Browse Categories**:
  - Full catalog search across tracks, albums, artists, and playlists.
  - Vibrant categorical exploration cards with gradient themes.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, TypeScript, Helmet, CORS, JWT |
| Database | PostgreSQL 16 (`linkup_spotify_db`), Prisma ORM |
| Caching | Redis 7 |

---

## Directory Structure

```
06-spotify-clone/
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
├── integrations/
│   ├── catalog.adapter.ts
│   ├── music-provider.interface.ts
│   └── playback.adapter.ts
├── tests/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### 1. Launch Services

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run start:dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## Running Automated Tests

Run the comprehensive 7-suite test matrix:

```bash
cd backend
npm test
```
