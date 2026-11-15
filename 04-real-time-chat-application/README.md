# Real-Time Chat Application

A high-performance real-time chat application featuring WebSocket communication, delivery and read receipts, ephemeral presence tracking, group role administration, and full-text message search.

## Features

- **WebSocket Communication & Gateways**:
  - Secure JWT authentication at socket handshake.
  - Room-based multi-user broadcasts and isolated personal user channels.
- **Message Receipt Lifecycle**:
  - Monotonic status progression: `SENT` -> `DELIVERED` -> `READ`.
  - Recipient viewing triggers aggregate receipt status updates back to sender sockets.
- **Ephemeral State Management (Redis)**:
  - Presence tracking with automated 60-second heartbeat TTLs.
  - Ephemeral typing indicators with automated 5-second inactivity timeouts.
- **Group Administration & Role Hierarchy**:
  - `OWNER` / `ADMIN` / `MEMBER` role boundaries.
  - Adding/removing members, updating group metadata, promoting admins, and transferring ownership.
- **Message Operations & Reactions**:
  - Soft deletion applying non-destructive `This message was deleted` tombstones.
  - Message editing with historical edit flags.
  - Emoji reaction badges with real-time participant aggregates.
  - Full-text keyword search across authorized conversation streams.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, Socket.IO Client |
| Backend | Node.js, Express, Socket.IO, TypeScript, Helmet, CORS, JWT |
| Database | PostgreSQL 16 (`linkup_chat_db`), Prisma ORM |
| Caching & Realtime | Redis 7 (Presence & Ephemeral State) |

---

## Directory Structure

```
04-real-time-chat-application/
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
