# Visual Media Discovery Platform — REST API Specification

## Base URL
`/api/v1`

All protected routes require `Authorization: Bearer <token>`.

---

## 1. Auth & Profiles

### `POST /auth/register`
- **Body**: `{ "email": "creator@example.com", "username": "creator", "password": "...", "name": "Visual Creator" }`
- **Response `201`**: `{ "user": { ... }, "token": "..." }`

### `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response `200`**: `{ "user": { ... }, "token": "..." }`

### `GET /profiles/:username`
- **Response `200`**: Profile metadata, privacy status (`isPrivate`), follower/following count, and media grid (if permitted).

### `PATCH /profiles/me`
- **Body**: `{ "bio": "...", "avatarUrl": "...", "website": "...", "isPrivate": true|false }`
- **Response `200`**: Updated profile.

---

## 2. Follows & Approval Flow

### `POST /users/:id/follow`
- **Response `200` / `201`**:
  - For public accounts: `{ "status": "ACCEPTED", "message": "Following" }`
  - For private accounts: `{ "status": "PENDING", "message": "Follow request sent" }`

### `POST /follow-requests/:requestId/approve`
- **Response `200`**: Follow request approved.

### `POST /follow-requests/:requestId/reject`
- **Response `200`**: Follow request rejected.

### `DELETE /users/:id/follow`
- **Response `200`**: Unfollowed.

---

## 3. Visual Media & Posts

### `POST /posts`
- **Body**:
  ```json
  {
    "caption": "Sunset over Santorini #travel #vibes",
    "location": "Santorini, Greece",
    "media": [
      { "url": "https://...", "type": "IMAGE", "order": 0 },
      { "url": "https://...", "type": "IMAGE", "order": 1 }
    ]
  }
  ```
- **Response `201`**: Created post (status: `READY`).

### `GET /posts/feed`
- **Response `200`**: Timeline of posts from followed accounts in `READY` status.

### `POST /posts/:id/like`
- **Response `200`**: Like recorded (idempotent toggle).

### `POST /posts/:id/comments`
- **Body**: `{ "content": "Stunning lighting!" }`
- **Response `201`**: Created comment.

---

## 4. Stories & Short Videos (Reels)

### `POST /stories`
- **Body**: `{ "mediaUrl": "...", "caption": "...", "audience": "EVERYONE" }`
- **Response `201`**: Story with `expiresAt = createdAt + 24h`.

### `GET /stories`
- **Response `200`**: Active stories (`expiresAt > now()`) from followed accounts.

### `POST /stories/:id/view`
- **Response `200`**: Records view event for viewer analytics.

### `POST /reels`
- **Body**: `{ "videoUrl": "...", "caption": "Dance routine #reels", "audioTrack": "Original Audio" }`
- **Response `201`**: Created vertical video.

### `GET /reels/feed`
- **Response `200`**: Algorithmic vertical video feed.

---

## 5. Explore & Hashtags

### `GET /explore`
- **Response `200`**: Trending posts, suggested accounts, and popular media.

### `GET /tags/:hashtag`
- **Response `200`**: Posts matching `#hashtag` and tag volume.

---

## 6. Direct Messaging

### `POST /messages`
- **Body**: `{ "recipientId": "...", "content": "Hey, love your photography!" }`
- **Response `201`**: Sent message.

### `GET /messages/:conversationUserId`
- **Response `200`**: Message exchange history.
