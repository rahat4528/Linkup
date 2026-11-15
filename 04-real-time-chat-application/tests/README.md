# Real-Time Chat Application Test Matrix

This directory orchestrates automated test suites verifying messaging lifecycles, role authorization, presence timeouts, and WebSocket event dispatches.

## Test Suites

| Suite | Focus |
|---|---|
| `receipt-transitions.spec.ts` | Monotonic receipt progression (`SENT` -> `DELIVERED` -> `READ`), regression prevention |
| `presence-ttl.spec.ts` | Presence heartbeats (60s TTL), typing indicator expiration (5s TTL) |
| `group-permissions.spec.ts` | Owner vs Admin vs Member authorization hierarchies, ownership transfer |
| `direct-messages.spec.ts` | Direct 1:1 conversation lifecycle, message editing, soft-deletion tombstones, emoji reactions |
| `group-messaging.spec.ts` | Group creation, membership management, multi-user messaging, unread counts |
| `message-search.spec.ts` | Full-text message search across conversations with authorization filtering |
| `socket-events.spec.ts` | WebSocket handshake JWT authentication, conversation room joins, real-time message dispatches |

## Running Tests

From this directory:
```bash
npm test
```

Or from backend:
```bash
cd ../backend && npm test
```
