# Music Streaming App - Test Suite

## Test Architecture
- **Unit Tests (`backend/tests/unit/`)**:
  - `range-requests.spec.ts`: Validates HTTP/1.1 RFC 7233 range parsing, standard byte ranges, suffix ranges (`bytes=-500`), open-ended ranges, chunk slicing boundaries, and 416 Range Not Satisfiable responses.
  - `waveform-generator.spec.ts`: Tests amplitude peak extraction from audio buffers, downsampling into bins, and normalization bounds within [0, 100].
  - `cache-service.spec.ts`: Tests audio chunk caching, eviction policies, and cache size limits.
- **Integration Tests (`backend/tests/integration/`)**:
  - `audio-stream.spec.ts`: Validates end-to-end HTTP 206 Partial Content streaming, `Content-Range`, `Accept-Ranges`, and 416 status code compliance via supertest.
  - `track-api.spec.ts`: Tests track listing, genre filtering, waveform data retrieval, and track creation.
  - `auth-api.spec.ts`: Tests registration, login, and JWT-authenticated session routes.

## Execution
Run all tests:
```bash
cd backend && npm test
```
