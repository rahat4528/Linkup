# Social Media Platform — REST API & WebSocket Specification

## Base URL
`/api/v1`

All protected endpoints require an `Authorization: Bearer <access_token>` header.

---

## 1. Authentication & User Management

### `POST /auth/register`
- **Body**: `{ "email": "user@example.com", "password": "SecurePassword123!", "name": "Jane Doe", "username": "janedoe" }`
- **Response `201`**: `{ "user": { "id": "...", "email": "...", "name": "...", "username": "..." }, "token": "..." }`

### `POST /auth/login`
- **Body**: `{ "email": "user@example.com", "password": "SecurePassword123!" }`
- **Response `200`**: `{ "user": { ... }, "token": "..." }`

### `GET /users/me`
- **Response `200`**: Profile metadata, privacy settings, counts (friends, followers, posts).

### `PATCH /users/me/profile`
- **Body**: `{ "bio": "Software enthusiast", "location": "San Francisco", "education": "BS CS", "work": "Senior Engineer", "avatarUrl": "...", "coverUrl": "..." }`
- **Response `200`**: Updated profile object.

### `GET /users/:id`
- **Response `200`**: Public profile filtered by the requesting user's relationship level.

---

## 2. Relationships & Friends

### `POST /friends/request/:targetUserId`
- **Response `201` / `200`**: Returns created `FriendRequest` or auto-transitioned `Friendship` (simultaneous request handling).

### `POST /friends/request/:requestId/accept`
- **Response `200`**: Friendship established.

### `POST /friends/request/:requestId/reject`
- **Response `200`**: Request rejected.

### `DELETE /friends/request/:requestId/cancel`
- **Response `200`**: Request cancelled by initiator.

### `DELETE /friends/:targetUserId`
- **Response `200`**: Friendship removed.

### `POST /follow/:targetUserId`
- **Response `201`**: Following relationship established.

### `DELETE /follow/:targetUserId`
- **Response `200`**: Unfollowed.

### `GET /friends/suggestions`
- **Response `200`**: Suggested connections based on mutual connections and interests.

---

## 3. Posts & Activity Feed

### `POST /posts`
- **Body**:
  ```json
  {
    "content": "Excited to share our new project milestone!",
    "visibility": "PUBLIC", // PUBLIC, FRIENDS, ONLY_ME, GROUP_ONLY
    "groupId": null,
    "media": [
      { "url": "https://...", "type": "IMAGE" }
    ]
  }
  ```
- **Response `201`**: Complete created post object.

### `GET /posts/feed`
- **Query**: `?cursor=...&limit=20&mode=ranked|chronological`
- **Response `200`**:
  ```json
  {
    "items": [ ... ],
    "nextCursor": "...",
    "hasMore": true
  }
  ```

### `PATCH /posts/:id`
- **Body**: `{ "content": "Updated content..." }`
- **Response `200`**: Updated post with updated timestamp and edit history.

### `DELETE /posts/:id`
- **Response `204`**: Post deleted (author or administrator only).

### `POST /posts/:id/reactions`
- **Body**: `{ "type": "LIKE" }` // LIKE, LOVE, CELEBRATE, INSIGHTFUL, SUPPORT
- **Response `200`**: Upserted reaction and updated reaction counts.

### `DELETE /posts/:id/reactions`
- **Response `200`**: Reaction removed.

### `POST /posts/:id/comments`
- **Body**: `{ "content": "Great work!", "parentId": null }`
- **Response `201`**: Created comment.

---

## 4. Groups & Communities

### `POST /groups`
- **Body**: `{ "name": "React Developers", "description": "...", "privacy": "PUBLIC" }` // PUBLIC, PRIVATE
- **Response `201`**: Created group with creator assigned as `OWNER`.

### `GET /groups/:id`
- **Response `200`**: Group details. If private, requires membership to view full details.

### `POST /groups/:id/join`
- **Response `200`**: Direct join (public group) or membership request pending (private group).

### `GET /groups/:id/posts`
- **Response `200`**: Posts scoped to this group.

---

## 5. Ephemeral Stories & Events

### `POST /stories`
- **Body**: `{ "mediaUrl": "...", "caption": "Morning view!" }`
- **Response `201`**: Story with `expiresAt = createdAt + 24h`.

### `GET /stories`
- **Response `200`**: Active stories (`expiresAt > now()`) from friends and followed users.

### `POST /events`
- **Body**: `{ "title": "Community Tech Talk", "description": "...", "eventDate": "2026-12-01T18:00:00Z", "location": "Online" }`
- **Response `201`**: Created event.

### `POST /events/:id/rsvp`
- **Body**: `{ "status": "GOING" }` // GOING, INTERESTED, NOT_GOING
- **Response `200`**: Updated RSVP status.

---

## 6. Safety, Moderation & Blocking

### `POST /blocks/:targetUserId`
- **Response `201`**: Target user blocked; mutual connections and active links purged.

### `DELETE /blocks/:targetUserId`
- **Response `200`**: User unblocked.

### `POST /reports`
- **Body**: `{ "targetType": "POST", "targetId": "...", "reason": "SPAM", "description": "..." }`
- **Response `201`**: Report queued for moderation.

---

## 7. Real-Time Socket.IO Events

### Client -> Server
- `join:user`: Auto-joins personal notification room `user:<userId>`.
- `join:group`: Joins group room `group:<groupId>` (verified on server).

### Server -> Client
- `notification:new`: Emitted when receiving a friend request, reaction, comment, or mention.
- `post:new`: Emitted to group members when a new post is published in that group.
