# Real-Time Chat Application — API Reference

## 1. REST Endpoints

### 1.1 Authentication
- `POST /api/auth/register` — Register user. Returns user object & JWT.
- `POST /api/auth/login` — Authenticate credentials. Returns user object & JWT.

### 1.2 Conversations
- `GET /api/conversations` — List conversations for authenticated user.
- `POST /api/conversations/direct` — Get or create 1:1 direct conversation.
- `POST /api/conversations/group` — Create new group conversation.
- `GET /api/conversations/:id/messages` — Fetch message history with `since` or cursor pagination.

### 1.3 Messages
- `POST /api/conversations/:id/messages` — Send message (REST fallback).
- `PUT /api/messages/:id` — Edit message content.
- `DELETE /api/messages/:id` — Soft-delete message.
- `POST /api/messages/:id/reactions` — Toggle emoji reaction.

### 1.4 Group Administration
- `POST /api/groups/:id/members` — Add member (Admin/Owner only).
- `DELETE /api/groups/:id/members/:userId` — Remove member (Admin/Owner only).
- `PUT /api/groups/:id/role` — Update member role (`ADMIN`, `MEMBER`).
- `PUT /api/groups/:id/transfer-ownership` — Transfer owner role to another member.

### 1.5 Search & Presence
- `GET /api/search/messages` — Full-text search messages by keyword across user conversations.
- `GET /api/presence/:userId` — Query current presence status (`ONLINE`, `OFFLINE`).

---

## 2. WebSocket Events

| Event Name | Direction | Payload |
|---|---|---|
| `auth` | Client -> Server | `{ token: string }` |
| `message:send` | Client -> Server | `{ conversationId: string, content: string, clientMessageId: string }` |
| `message:new` | Server -> Client | Message entity with `conversationId`, `senderId`, `status: 'SENT'` |
| `message:delivered` | Client -> Server | `{ messageId: string, conversationId: string }` |
| `message:read` | Client -> Server | `{ messageId: string, conversationId: string }` |
| `receipt:update` | Server -> Client | `{ messageId: string, status: 'DELIVERED' \| 'READ', userId: string }` |
| `typing:start` | Client -> Server | `{ conversationId: string }` |
| `typing:stop` | Client -> Server | `{ conversationId: string }` |
| `typing:update` | Server -> Client | `{ conversationId: string, userId: string, isTyping: boolean }` |
| `presence:update` | Server -> Client | `{ userId: string, status: 'ONLINE' \| 'OFFLINE' }` |
