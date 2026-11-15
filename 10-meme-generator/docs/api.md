# Meme Generator — API Reference

## Base URL
`http://localhost:4010`

## Endpoints

### 1. Templates
- `GET /api/templates`
  - Query parameters: `category`, `search`
  - Returns list of available meme templates.
- `GET /api/templates/:id`
  - Returns template by ID or slug.

### 2. Memes & Gallery
- `GET /api/memes`
  - Returns public community memes.
- `GET /api/memes/:id`
  - Returns single meme with layer JSON array.
- `POST /api/memes`
  - Headers: `Authorization: Bearer <token>` (optional)
  - Body: `{ title, templateId, layers, isPublic? }`
  - Validates layers and saves meme graphic.
- `POST /api/memes/:id/upvote`
  - Increments meme upvote counter.

### 3. Server-Side Compositing
- `POST /api/render`
  - Body: `{ templateId?, width?, height?, baseImageUrl?, layers: [] }`
  - Returns rendered SVG graphic with `Content-Type: image/svg+xml`.
- `GET /api/memes/:id/render`
  - Renders saved meme directly as SVG graphic.

### 4. Authentication
- `POST /api/auth/register`: `{ email, username, password, displayName }` -> `{ user, token }`
- `POST /api/auth/login`: `{ email, password }` -> `{ user, token }`
- `GET /api/auth/me`: Authenticated profile check.
