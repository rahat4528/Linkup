# Microblogging & Real-Time Feed Platform — Specifications

## 1. Executive Summary

The Microblogging & Real-Time Feed Platform (`03-twitter-clone`) is a fast, text-centric, conversational publication and discovery service. It prioritizes short-form real-time commentary, threaded conversation trees, interactive polls, quote posts and reposts, mention parsing, community notes moderation, and sliding-window trending topics.

---

## 2. Functional Requirements

### 2.1 Short-Form Publishing & Character Counting
- **Character Budget**: 280-character limit.
- **Unicode-Aware Counting Rule**:
  - Grapheme cluster calculation ensuring complex emojis (e.g. 👩‍💻, 🏳️‍🌈) count as 1 character.
  - URLs are transformed and weighted at a fixed 23 characters regardless of raw URL string length.
- **Attachments**: Up to 4 images or 1 video attachment per post.
- **Editing Window**: Posts may be edited within a 60-minute window, with an `isEdited` badge and immutable versioned edit history.
- **Pinned Posts**: Authors can pin one post to the top of their profile.

### 2.2 Thread Ordering & Conversation Trees
- **Tree Topology**:
  - Each post in a thread carries `conversationId` (id of the root post) and optional `parentId` (direct parent in the reply hierarchy).
  - Deleting a parent post leaves a `[deleted]` tombstone preserving reply subtrees.
  - Thread ordering algorithm sorts replies deterministically: `(parentId, createdAt ASC)`.

### 2.3 Reposts, Quotes & Engagements
- **Reposts**: Instant redistribution of another user's post to one's followers without added commentary.
- **Quote Posts**: Distinct record referencing target post with newly authored commentary.
- **Likes & Bookmarks**: Fast toggles; likes contribute to discoverability and ranking.
- **Mentions**: `@username` detection generating single-dispatch notifications.

### 2.4 Interactive Polls
- **Poll Parameters**: 2 to 4 custom options; expiration duration between 1 hour and 7 days.
- **Constraint Enforcement**: Strictly one vote per user per poll (enforced via database unique constraint `[pollId, userId]`).
- **Results Privacy**: Real-time percentage display; voter identities are kept private.

### 2.5 Community Notes Moderation Engine
- **Proposals**: Users can propose explanatory context notes on ambiguous or misleading posts.
- **Helpfulness Matrix**: A note achieves `HELPFUL` status and displays beneath the post only when rated positively by a diverse rater group with opposing baseline agreement profiles.

### 2.6 Feeds & Discovery
- **Following Feed**: Reverse-chronological timeline of accounts the user follows, paginated via cursors.
- **Discovery (For You) Feed**: Algorithmic stream weighted by author affinity, velocity of engagement, and recency.
- **Trending Topics**: Sliding 24-hour window frequency counters computing trending hashtags and keywords.

---

## 3. Mute vs Block Semantics

| Feature | Muted User | Blocked User |
|---|---|---|
| **Follow Relationship** | Retained (user still follows) | Immediately severed |
| **Visibility in Feed** | Silently hidden from feed | Completely hidden |
| **Profile Access** | Can still view profile | Denied (404/Locked) |
| **Direct Mentions** | Notifications silenced | Blocked from mentioning |
| **Notification to User** | Never notified (silent) | Silent (no explicit alert) |
