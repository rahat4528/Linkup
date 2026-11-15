# Visual Media Discovery Platform — Technical Specifications

## 1. Executive Summary

The Visual Media Discovery Platform (`02-instagram-clone`) is a visual-first, mobile-responsive media publication and discovery application. It prioritizes high-resolution photographic carousels, full-bleed vertical short videos (reels), 24-hour expiring stories with progress indicators, hashtag exploration, and creator metrics.

---

## 2. Functional Requirements

### 2.1 Profiles & Privacy
- **Account Privacy**: Accounts can be `PUBLIC` or `PRIVATE`.
  - For `PUBLIC` accounts: Follow actions succeed immediately (`Follow` created).
  - For `PRIVATE` accounts: Follow actions create a `FollowRequest` in `PENDING` state. Only approved followers can view media, stories, and the profile grid.
- **Profile Presentation**: Profile avatar, bio, external link, follower/following counters, and 3-column responsive media grid.

### 2.2 Visual Media Publishing
- **Multi-Media Carousels**: Multiple image/video slides per post with horizontal pagination indicators.
- **Media Processing Lifecycle**:
  - `PROCESSING` -> `READY` (or `FAILED`).
  - Feeds strictly enforce `WHERE status = 'READY'` to prevent unrendered or incomplete uploads from leaking into user timelines.
- **Captions, Hashtags & Locations**:
  - Automatic extraction of `#hashtags` from captions.
  - Hashtags are normalized to lowercase without symbols.
  - Location tag metadata.

### 2.3 Ephemeral Stories
- **24-Hour Expiration**: Stories strictly expire 24 hours after publication:
  ```text
  expiresAt = createdAt + 24 hours
  ```
- **Query Filter**: Every story retrieval endpoint enforces `WHERE expiresAt > NOW()` at query time.
- **Audience Visibility**: Stories can be shared to `EVERYONE` or `CLOSE_FRIENDS`.
- **Story Viewers**: Track unique story views with timestamp and viewer counts.

### 2.4 Vertical Short-Video Feed (Reels)
- **Full-Bleed Vertical Stream**: Vertical video cards with aspect ratio optimization, autoplay triggers, audio toggle, like and comment overlays, and creator attribution.

### 2.5 Interactions & Direct Messaging
- **Likes & Comments**: Real-time reaction toggle, comment threads.
- **Bookmarks & Saved Posts**: Private collection saving.
- **In-App Direct Messages**: Simple one-to-one messaging between permitted connections.

### 2.6 Explore & Trending Hashtags
- **Trending Engine**: Hashtags ranked by velocity over a sliding 24-hour window.
- **Explore Grid**: Algorithmic grid combining trending tags, followed accounts, and high-engagement visual media.

---

## 3. Privacy & Access Matrix

| Account Status | Requesting User | Profile Grid | Posts in Feed | Active Stories | Follow Action |
|---|---|---|---|---|---|
| **PUBLIC** | Anyone (inc. guests) | Allowed | Allowed | Allowed | Direct Follow (`ACCEPTED`) |
| **PRIVATE** | Approved Follower | Allowed | Allowed | Allowed | Already Following |
| **PRIVATE** | Stranger | Denied (Locked) | Denied (Hidden) | Denied (Hidden) | Creates `FollowRequest` |
| **ANY** | Blocked User | Denied (404) | Denied (Hidden) | Denied (Hidden) | Denied (Blocked) |
