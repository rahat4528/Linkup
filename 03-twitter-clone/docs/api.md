# Microblogging Platform — REST API Specification

## Base URL
`/api/v1`

---

## 1. Authentication & Profiles

### `POST /auth/register`
- **Body**: `{ "email": "...", "username": "...", "password": "...", "name": "..." }`
- **Response `201`**: `{ "user": { ... }, "token": "..." }`

### `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response `200`**: `{ "user": { ... }, "token": "..." }`

### `GET /users/:username`
- **Response `200`**: User profile, stats (posts, followers, following), pinned post.

---

## 2. Posts, Threads & Engagements

### `POST /posts`
- **Body**:
  ```json
  {
    "text": "Shipping Linkup Phase 3 today! What do you think? https://example.com/demo #engineering",
    "parentId": null,
    "media": [],
    "poll": {
      "options": ["Love it", "Looks promising", "Needs polish"],
      "durationHours": 24
    }
  }
  ```
- **Response `201`**: Created post object.

### `GET /posts/feed`
- **Query**: `?tab=following|for_you&cursor=...`
- **Response `200`**: Feed items with author details, engagement counts, and polls.

### `GET /posts/:id/thread`
- **Response `200`**: Full conversation thread tree rooted at `conversationId`.

### `PATCH /posts/:id`
- **Body**: `{ "text": "Updated refined text" }`
- **Response `200`**: Updated post with edit history record.

### `DELETE /posts/:id`
- **Response `200`**: Deletes post or places a tombstone if child replies exist.

### `POST /posts/:id/repost`
- **Response `200`**: Repost recorded (toggle).

### `POST /posts/:id/quote`
- **Body**: `{ "text": "This is a great update!" }`
- **Response `201`**: Quote post created.

### `POST /posts/:id/like`
- **Response `200`**: Like toggled.

---

## 3. Polls & Voting

### `POST /polls/:pollId/vote`
- **Body**: `{ "optionIndex": 1 }`
- **Response `200`**: Vote recorded; returns updated vote distributions.

---

## 4. Community Notes

### `POST /posts/:id/notes`
- **Body**: `{ "text": "Official documentation shows this was released in v2.0." }`
- **Response `201`**: Note proposed in `NEEDS_MORE_RATINGS` status.

### `POST /notes/:noteId/rate`
- **Body**: `{ "isHelpful": true }`
- **Response `200`**: Recorded rating; updates diversity evaluation.

---

## 5. Mute & Block Safety

### `POST /users/:id/mute`
- **Response `200`**: User muted (posts silently omitted from feed).

### `POST /users/:id/block`
- **Response `200`**: User blocked (connections severed, two-way barrier).

---

## 6. Full-Text Search & Trending

### `GET /search?q=engineering`
- **Response `200`**: Posts matching search query using PostgreSQL full-text search.

### `GET /trends`
- **Response `200`**: Trending hashtags and topics over the sliding 24h window.
