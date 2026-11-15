# Visual Media Discovery Platform — Test Suite

This directory contains cross-cutting and integration verification instructions for `02-instagram-clone`.

## Test Execution

Execute the full automated test suite from the backend test runner:

```bash
cd ../backend
npm test
```

## Coverage Breakdown
- **Unit Tests**:
  - `story-expiry.spec.ts`: Tests exact 24h boundary for ephemeral stories (`expiresAt > now()` active, `expiresAt <= now()` excluded).
  - `privacy-follow.spec.ts`: Tests public direct follow (`ACCEPTED`), private account follow request (`PENDING`), and access gating.
  - `media-processor.spec.ts`: Tests multi-image carousel slide validation, thumbnail generation, and slide limit enforcement.
  - `hashtag-parser.spec.ts`: Tests hashtag extraction, symbol stripping, normalization, deduplication, and trending counters.
- **Integration Tests**:
  - `posts-carousels.spec.ts`: Multi-slide carousel creation, feed retrieval in `READY` status, idempotent like toggling, comments.
  - `private-gating.spec.ts`: Private profile locked grid, follow request creation, request approval, and feed unlock.
  - `reels-explore.spec.ts`: Vertical short-video reels feed, explore grid, and hashtag search endpoint.
  - `direct-messages.spec.ts`: One-to-one message exchange and history retrieval.
