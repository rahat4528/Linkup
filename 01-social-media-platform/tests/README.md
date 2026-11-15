# Social Media Platform — Test Suite

This directory contains cross-cutting and integration verification instructions for `01-social-media-platform`.

## Test Execution

All automated unit, integration, API contract, and real-time Socket.IO authorization tests are executed from the backend test runner:

```bash
cd ../backend
npm test
```

## Test Coverage
- **Unit Tests**:
  - `visibility.spec.ts`: Enforces visibility matrix (`PUBLIC`, `FRIENDS`, `GROUP_ONLY`, `ONLY_ME`) and reciprocal two-way blocking.
  - `friendship.spec.ts`: Tests friendship state transitions and deterministic simultaneous mutual request resolution.
  - `feed-ranking.spec.ts`: Tests affinity calculations, logarithmic engagement scoring, recency decay, and chronological fallback.
- **Integration Tests**:
  - `auth-user.spec.ts`: Authentication, duplicate prevention, profile privacy, and account deletion.
  - `posts-feed.spec.ts`: Post lifecycle, reaction idempotency (upsert), comments, and feed generation.
  - `groups-events.spec.ts`: Group creation, private group quarantine, event RSVPs, and 24h story expiry filtering.
  - `blocking-safety.spec.ts`: Two-way blocking purging connections, excluding content from feeds, and content reporting.
  - `socket-realtime.spec.ts`: Socket token handshake authentication, private group room authorization, and notification suppression.
