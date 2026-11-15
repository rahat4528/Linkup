# Podcast Platform — API Reference

## Base URL
`http://localhost:4009`

## Endpoints

### 1. Podcasts & Shows
- `GET /api/podcasts`
  - Query parameters: `category`, `search`
  - Returns list of podcasts with author and metadata.
- `GET /api/podcasts/:id`
  - Returns single podcast details by ID or slug.
- `POST /api/podcasts`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ title, description, category?, author?, coverUrl?, language?, explicit? }`
  - Creates a new podcast show and auto-generates URL slug.
- `POST /api/podcasts/:id/subscribe`
  - Headers: `Authorization: Bearer <token>`
  - Toggles subscription status for authenticated listener.

### 2. Episodes & Chapters
- `GET /api/podcasts/:podcastId/episodes`
  - Returns list of published episodes for given podcast.
- `GET /api/episodes/:id`
  - Returns episode details with embedded chapter markers.
- `POST /api/episodes`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ podcastId, title, description, audioUrl, durationSeconds, chapters? }`
  - Validates chapter chronology and publishes new episode.

### 3. RSS Feeds & Security
- `GET /api/podcasts/:id/feed.xml`
  - Generates and returns valid RSS 2.0 XML feed with enclosures.
- `POST /api/feeds/validate`
  - Body: `{ feedUrl }`
  - Evaluates external feed URL against SSRF filters (blocks private subnets and metadata IPs).

### 4. Authentication
- `POST /api/auth/register`: `{ email, username, password, displayName, role? }` -> `{ user, token }`
- `POST /api/auth/login`: `{ email, password }` -> `{ user, token }`
- `GET /api/auth/me`: Authenticated profile check.
