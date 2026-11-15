# Meme Generator - Test Suite

## Test Architecture
- **Unit Tests (`backend/tests/unit/`)**:
  - `compositor.spec.ts`: Validates SVG generation, XML character escaping, uppercase transformation, and paint-order stroke fill alignment.
  - `layer-parser.spec.ts`: Validates layer JSON schemas, coordinate clamping within canvas bounds, font size bounds, and malicious HTML stripping.
- **Integration Tests (`backend/tests/integration/`)**:
  - `render-api.spec.ts`: Tests server-side meme rendering via `/api/render` and `/api/memes/:id/render` producing valid SVG output.
  - `template-api.spec.ts`: Tests template catalogue listing, category filters, and retrieval by slug.
  - `meme-api.spec.ts`: Tests community meme gallery listing, meme creation with layer state, and upvote increments.
  - `auth-api.spec.ts`: Tests user registration, login, and authenticated profile queries.

## Execution
Run all tests:
```bash
cd backend && npm test
```
