# Podcast Platform - Test Suite

## Test Architecture
- **Unit Tests (`backend/tests/unit/`)**:
  - `rss-generator.spec.ts`: Validates RSS 2.0 XML generation, RFC 822 publication dates, `<enclosure>` tags, XML entity escaping, and DRAFT episode filtering.
  - `rss-ssrf-protection.spec.ts`: Validates SSRF prevention against private IPv4 addresses (`127.0.0.1`, `10.0.0.1`, `192.168.1.1`, `172.20.0.1`), cloud metadata (`169.254.169.254`), `localhost`, and non-HTTP protocols.
  - `episode-chapters.spec.ts`: Validates chronological chapter marker sorting, negative timestamp rejection, and duration boundary checks.
- **Integration Tests (`backend/tests/integration/`)**:
  - `podcast-api.spec.ts`: Tests show retrieval, show creation, subscription toggling, and public XML RSS feed delivery (`/api/podcasts/:id/feed.xml`).
  - `episode-api.spec.ts`: Tests episode listing, single episode queries with chapter markers, and episode creation.
  - `auth-api.spec.ts`: Tests creator registration, login, and authenticated profile queries.

## Execution
Run all tests:
```bash
cd backend && npm test
```
