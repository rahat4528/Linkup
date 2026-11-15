# Email Client (Gmail Clone)

A full-featured webmail communications platform featuring IMAP/SMTP synchronization, GreenMail test container integration, RFC 5322 conversation threading, draft autosaving, sandboxed HTML email sanitization, and custom label taxonomy.

## Features

- **IMAP & SMTP Provider Integrations**:
  - Outgoing SMTP dispatch supporting multi-recipient headers (`to`, `cc`, `bcc`), subject, plaintext, sanitized HTML, and threading references.
  - Incoming IMAP polling with date-based incremental ingestion.
  - GreenMail container in `docker-compose.yml` for zero-dependency local testing.
- **Standardized RFC 5322 Conversation Threading**:
  - Deterministic thread grouping via `In-Reply-To` and `References` headers.
  - Subject normalization automatically stripping leading prefixes (`Re:`, `Fwd:`, `[EXTERNAL]`).
- **Sandboxed HTML Sanitization & Privacy Protection**:
  - Malicious script tags, inline event attributes (`onerror`, `onload`), and javascript URIs are strictly neutralized.
  - External tracking images are blocked by default with placeholder replacement and optional user unblocking.
- **Draft Autosave Engine**:
  - Real-time draft autosaving updating draft versions atomically without creating orphan records.
- **Folders & Custom Label Taxonomy**:
  - Unified system folders: `INBOX`, `SENT`, `DRAFTS`, `TRASH`, `SPAM`, `STARRED`, `ARCHIVE`.
  - User-defined colored labels with independent thread filtering.
- **Full-Text Email Search**:
  - Fast keyword search across sender, recipient, subject, body text, and labels.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, TypeScript, Helmet, CORS, JWT |
| Database | PostgreSQL 16 (`linkup_email_client_db`), Prisma ORM |
| Caching | Redis 7 |
| Mail Infrastructure | GreenMail Standalone / Standard IMAP & SMTP |

---

## Directory Structure

```
05-email-client/
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
│   ├── imap.adapter.ts
│   ├── mail-provider.interface.ts
│   └── smtp.adapter.ts
├── tests/
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### 1. Launch Containerized Services

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
