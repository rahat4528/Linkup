# Microblogging Platform Test Suite

This directory contains integration test runners and harnesses verifying cross-cutting system behavior.

## Test Matrix

| Suite | Category | Focus |
|---|---|---|
| `character-counter.spec.ts` | Unit | Grapheme clusters, emoji counting, URL 23-char weighting, 280 boundary |
| `thread-tree.spec.ts` | Unit | Recursive thread hierarchy, reply ordering, `[deleted]` tombstones |
| `poll-voting.spec.ts` | Unit | 2-4 option validation, one-vote-per-user enforcement, percentage math |
| `community-notes.spec.ts` | Unit | Viewpoint diversity matrix, rating variance consensus (`>= 0.25`) |
| `posts-replies.spec.ts` | Integration | End-to-end post publication, replies, likes, reposts, 60-min edit window |
| `safety-mute-block.spec.ts` | Integration | Mute vs Block semantics (feed silence, follow retention vs severance, 403 access) |
| `search-trending.spec.ts` | Integration | Sliding 24h window trending hashtags, full-text post and user search |

## Running Tests

From this directory:
```bash
npm test
```

Or from `backend`:
```bash
cd ../backend && npm test
```
