# Real-Time Chat Application — Architecture

## 1. System Overview

```
[ Next.js Client ] <--- Socket.IO (WSS) / REST ---> [ Express & Socket Gateway ]
                                                              │
                                       ┌──────────────────────┴──────────────────────┐
                                       ▼                                             ▼
                             [ Redis 7 Engine ]                            [ PostgreSQL 16 ]
                             - Presence TTL (60s)                          - Conversations & Members
                             - Typing State (5s)                           - Messages & Edit History
                             - Pub/Sub Channel Broadcast                   - Receipts (SENT, DELIVERED, READ)
                                                                           - Emoji Reactions
```

---

## 2. Communication Topology

- **Transport**: WebSocket via Socket.IO with fallback to long-polling.
- **Channels**:
  - `user:{userId}`: Personal notification and receipt updates channel.
  - `conv:{conversationId}`: Real-time broadcast channel for all active room participants.
- **Receipt Workflow**:
  1. Sender sends `message:send` with `clientMessageId`.
  2. Server persists message -> status `SENT` -> acknowledges to sender.
  3. Server broadcasts message to `conv:{conversationId}`.
  4. Active recipients emit `message:delivered` -> status `DELIVERED`.
  5. Focused recipient emits `message:read` -> status `READ`.
  6. Server pushes receipt updates back to sender socket.
