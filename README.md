# Linkup

Linkup is an open-source mono-repository containing 10 independent, standalone, production-ready applications in the domains of social networking, communication, media distribution, and creative tooling.

Each application is strictly decoupled with its own distinct frontend, backend, database schema, container orchestration, automated test suite, and operational documentation. There is zero runtime coupling or shared databases between applications.

---

## The 10 Applications

1. **`01-social-media-platform` — Social Media Platform**
   A community networking platform featuring user profiles, bidirectional connections, multi-media feeds, public and private interest groups, community events with RSVP tracking, real-time notifications, and tiered content visibility.

2. **`02-instagram-clone` — Visual Media Discovery Platform**
   A visual-first social discovery platform providing multi-image carousels, video reels, 24-hour temporary stories, explore feeds, creator analytics, and media processing pipelines.

3. **`03-twitter-clone` — Microblogging & Real-Time Feed Platform**
   A fast, conversational microblogging system supporting character-managed posts, conversation reply trees, reposts, quote posts, full-text search, and community-driven content moderation.

4. **`04-real-time-chat-application` — Real-Time Chat Application**
   An instant messaging solution with private and group messaging, WebSocket delivery receipts (sent, delivered, read), presence tracking, typing indicators, media uploads, and message search.

5. **`05-email-client` — Webmail & Communication Client**
   A productivity email client supporting standards-based mail sync (IMAP/SMTP and authorized mail APIs), conversation threading, rich-text composition, autosaved drafts, and sanitized HTML email rendering.

6. **`06-spotify-clone` — Audio Catalog & Discovery Platform**
   A music library and discovery platform featuring track, artist, and album catalog navigation, curated playlists, listening history tracking, and HTML5 audio playback engines.

7. **`07-music-streaming-app` — Minimalist Audio Streaming App**
   A focused audio player application with real-time waveform visualization, persistent layout player across page transitions, user upload management, and HTTP Range streaming.

8. **`08-video-conferencing-app` — Real-Time Video Conferencing**
   A real-time video conferencing application featuring WebRTC SFU media routing, participant waiting rooms, host permissions, screen sharing, meeting chat, and device previews.

9. **`09-podcast-platform` — Podcast Publishing & Audio Distribution**
   A creator and listener audio platform featuring RSS 2.0 feed generation, podcast imports with SSRF protection, season/episode management, audio waveform analysis, and subscription feeds.

10. **`10-meme-generator` — Graphic & Meme Generator**
    An interactive graphic creation studio with a layered canvas editor, custom typography, image manipulation, sticker overlays, and client/server parity image rendering.

---

## Architectural Principles

- **True Isolation**: Each project is an autonomous software artifact. No application shares backend servers, databases, or runtime dependencies with any other.
- **Modern Technology Stack**: Built with TypeScript across the stack (Node.js/NestJS, Next.js/React, Tailwind CSS, PostgreSQL, Redis, Docker).
- **Security & Privacy First**: Robust authentication, role-based and ownership-based access control, server-side input validation, rate limiting, and strict privacy boundary enforcement.
- **Tested & Verified**: Every application includes unit tests, integration tests, API tests, and end-to-end verification.

---

## Directory Structure

```text
Linkup/
  ├── README.md                      # Repository overview and master index
  ├── LICENSE                        # MIT License
  ├── PROGRESS.md                    # Multi-phase execution and verification tracker
  ├── docs/                          # Repository-level documentation
  │   ├── repository-overview.md
  │   ├── architecture.md
  │   ├── technology-stack.md
  │   ├── development-guide.md
  │   ├── project-index.md
  │   └── final-delivery-report.md
  │
  ├── 01-social-media-platform/      # Phase 1: Social Media Platform
  ├── 02-instagram-clone/            # Phase 2: Visual Media Discovery
  ├── 03-twitter-clone/              # Phase 3: Microblogging Platform
  ├── 04-real-time-chat-application/ # Phase 4: Instant Messaging
  ├── 05-email-client/               # Phase 5: Email Client
  ├── 06-spotify-clone/              # Phase 6: Audio Discovery Platform
  ├── 07-music-streaming-app/        # Phase 7: Streaming Audio Player
  ├── 08-video-conferencing-app/     # Phase 8: Video Conferencing
  ├── 09-podcast-platform/           # Phase 9: Podcast Distribution
  └── 10-meme-generator/             # Phase 10: Graphic Editor
```

---

## Master Development Guide

To run any application, navigate to its respective directory:

```bash
cd 01-social-media-platform

# Spin up dedicated infrastructure (PostgreSQL, Redis, Storage)
docker compose up -d

# Backend setup
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev

# Frontend setup (in a separate terminal)
cd ../frontend
npm install
npm run dev
```

For detailed per-application instructions, see the `README.md` and `docs/` inside each individual application folder.
