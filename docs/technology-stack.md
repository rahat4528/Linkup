# Linkup — Technology Stack Guide

## Core Technologies

The Linkup repository leverages a modern, type-safe stack:

| Layer | Primary Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js (App Router) / React 19 / TypeScript | High performance, server-side rendering, strong typing, robust routing |
| **Styling & UI** | Tailwind CSS & Accessible Component Primitives | Clean styling, responsive layout capabilities, accessible UI elements |
| **Backend Framework** | NestJS / Express with TypeScript | Modular enterprise architecture, dependency injection, validation pipes |
| **Database & ORM** | PostgreSQL & Prisma ORM | Relational integrity, migrations, type-safe queries, strong indexing |
| **Caching & Queues** | Redis & BullMQ | Fast in-memory state, pub/sub, rate limiting, resilient background workers |
| **Realtime** | Socket.IO / WebSocket / LiveKit SFU | Bi-directional messaging, rooms, presence tracking, WebRTC video |
| **Media & Canvas** | Sharp, FFmpeg, HTML5 Canvas API | Image manipulation, audio/video transcoding, client/server rendering |
| **Containers** | Docker & Docker Compose | Reproducible local development and service orchestration |

## Database Catalog

Each application maintains its own dedicated database:
- `linkup_social_media_db`
- `linkup_instagram_db`
- `linkup_twitter_db`
- `linkup_chat_db`
- `linkup_email_client_db`
- `linkup_spotify_db`
- `linkup_music_streaming_db`
- `linkup_video_conferencing_db`
- `linkup_podcast_db`
- `linkup_meme_generator_db`
