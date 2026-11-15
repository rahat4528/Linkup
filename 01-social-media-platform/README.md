# Social Media Platform

A modern, standalone, full-featured community social networking platform built with a decoupled Next.js frontend, an Express/NestJS modular backend, PostgreSQL, and Socket.IO for real-time collaboration.

---

## 1. Features

### User Profiles & Accounts
- Secure authentication using bcrypt password hashing and signed JWT tokens.
- Custom profile editing (biography, location, work history, education).
- Profile visibility privacy settings (`PUBLIC`, `FRIENDS`, `ONLY_ME`).
- Complete account deletion with cascading removal of personal data.

### Connections & Relationships
- Deterministic friendship state machine (`NONE` -> `REQUESTED` -> `ACCEPTED`, `REJECTED`, `CANCELLED`, `UNFRIENDED`).
- Atomic handling of simultaneous mutual friend requests.
- Asymmetric follow/unfollow capabilities.
- Real-time mutual friend calculations and affinity-driven connection suggestions.

### Multi-Media Activity Feed & Posts
- Rich text posts with multi-image support and group associations.
- Granular post visibility controls (`PUBLIC`, `FRIENDS`, `GROUP_ONLY`, `ONLY_ME`).
- Post editing with `isEdited` tracking and author-verified deletion.
- Multi-reaction system (`LIKE`, `LOVE`, `CELEBRATE`) with strict upsert idempotency.
- Nested comment threads.
- Ranked activity feed combining relationship affinity, engagement volume, and 24h half-life recency decay, alongside a chronological fallback.

### Communities & Groups
- Public and private interest groups.
- Role-based membership hierarchy (`OWNER`, `ADMIN`, `MODERATOR`, `MEMBER`).
- Private group content strictly quarantined to active verified members.

### Community Events
- Create events with scheduled dates, descriptions, and venue/links.
- Real-time RSVP state tracking (`GOING`, `INTERESTED`, `NOT_GOING`).

### 24-Hour Ephemeral Stories
- Temporary photo/text stories with strict query-time expiry enforcement (`expiresAt > now()`).

### Safety & Moderation
- Two-way blocking: instantly severs friendships, cancels requests, removes follow links, and excludes content across feeds, suggestions, and notifications.
- Structured content reporting queue for community moderators.

---

## 2. Architecture & Technology Stack

| Component | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS | Clean server-side rendering, responsive three-column community UI, fast client interactivity |
| **Backend** | Express / Node.js with TypeScript | Modular service-oriented design, strong typing, clean separation of concerns |
| **Database** | PostgreSQL & Prisma ORM | Relational integrity, foreign key constraints, indexes, transactional safety |
| **Realtime** | Socket.IO | Handshake token authentication, authorized room subscriptions, instant notifications |
| **Containerization** | Docker & Docker Compose | Reproducible local development services |

---

## 3. Getting Started

### Prerequisites
- Node.js v20+ or v24+
- npm v10+
- Docker & Docker Compose (optional for local containers)

### 1. Configure Environment
```bash
cp .env.example .env
```

### 2. Start Services via Docker Compose (Optional)
```bash
docker compose up -d
```

### 3. Backend Setup & Run
```bash
cd backend
npm install
npm run start:dev
```
The API server starts on `http://localhost:4001`.

### 4. Frontend Setup & Run
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the application.

---

## 4. Running Automated Tests

Run the full automated test suite (unit tests, API integration tests, and Socket.IO authorization tests):

```bash
cd backend
npm test
```

---

## 5. Seed Accounts

For local evaluation, the seed script establishes realistic accounts (password: `Password123!`):
- `alice@example.com` (Alice Johnson)
- `bob@example.com` (Bob Smith)
- `charlie@example.com` (Charlie Davis)
- `dana@example.com` (Dana Vance)
