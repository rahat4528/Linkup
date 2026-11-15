# Music Streaming App — API Reference

## Base URL
`http://localhost:4007`

## Endpoints

### 1. Audio Streaming
- `GET /api/stream/:id`
  - Headers: `Range: bytes=start-end` (Optional)
  - Responses:
    - `206 Partial Content`: Returns audio chunk with `Content-Range`, `Accept-Ranges`, `Content-Length`.
    - `416 Range Not Satisfiable`: Returned if requested range exceeds file boundaries.
    - `404 Not Found`: Track does not exist.
- `GET /api/stream-stats`
  - Returns streaming protocol, supported audio codecs, and cached chunk counts.

### 2. Track Catalog
- `GET /api/tracks`
  - Query parameters: `genre`, `search`
  - Returns array of track records with metadata and duration.
- `GET /api/tracks/:id`
  - Returns single track details.
- `POST /api/tracks`
  - Headers: `Authorization: Bearer <token>` (optional)
  - Body: `{ title, artist, album?, genre?, durationSeconds?, audioBufferBase64? }`
  - Calculates waveform peaks from audio buffer or generates preview peaks.
  - Returns created track object.
- `GET /api/tracks/:id/waveform`
  - Returns normalized array of amplitude peak values `[0-100]`.
- `POST /api/tracks/:id/favorite`
  - Headers: `Authorization: Bearer <token>`
  - Toggles favorite status for authenticated user.

### 3. Authentication
- `POST /api/auth/register`: `{ email, username, password, displayName?, role? }` -> `{ user, token }`
- `POST /api/auth/login`: `{ email, password }` -> `{ user, token }`
- `GET /api/auth/me`: Validates JWT token and returns authenticated user profile.
