# Social Media Platform — Functional and Technical Requirements

## 1. Executive Overview

The Social Media Platform is a full-featured community social networking application designed for rich interactions, meaningful interpersonal relationships, interest-based communities, and event coordination. It provides a three-column interface: Left Navigation, Central Activity Stream, and Right Sidebar for active contacts, suggested connections, and upcoming events.

## 2. Functional Requirements

### 2.1 Authentication & Profiles
- **User Authentication**: Secure email/password registration, Argon2/bcrypt password hashing, JWT access and refresh token rotation.
- **Rich Profiles**: Avatar, banner cover photo, bio, work history, education history, location, relationship status.
- **Privacy Settings**: Global profile visibility (`PUBLIC`, `FRIENDS_ONLY`, `PRIVATE`), post default visibility, search indexing toggles.
- **Account Deletion & Export**: Users can delete their account; personal data, posts, and media are cleaned or anonymized.

### 2.2 Social Connections & Relationships
- **Friendship State Machine**:
  - `NONE` -> `REQUESTED` -> `ACCEPTED` (Friends).
  - Handles simultaneous mutual requests deterministically (if User A requested User B, and User B requests User A, transition directly to `ACCEPTED`).
  - Actions: Send, Accept, Reject, Cancel request, Unfriend.
- **Following System**: One-way asymmetric follow/unfollow capability in addition to mutual friendships.
- **Relationship Discovery**: Mutual friends computation, affinity-based connection suggestions.

### 2.3 Posts, Media & Activity Feeds
- **Content Creation**: Rich text posts with multi-media attachments (images, video references).
- **Post Ownership**: Authors can edit (capturing edit history) and soft-delete posts.
- **Reactions & Engagements**:
  - Multi-reaction system (`LIKE`, `LOVE`, `CELEBRATE`, `INSIGHTFUL`, `SUPPORT`).
  - Reaction idempotency (upsert: one active reaction per user per target).
- **Comments & Nested Replies**: Hierarchical threaded discussions with comment ownership and deletion.
- **Saved Posts & Bookmarks**: Private bookmarking of posts for future reference.
- **Post Sharing**: Direct share record tracking with optional quote text.

### 2.4 Feed Algorithm & Ranking
- **Feed Scoring Model**:
  $$\text{Score} = (\text{Affinity} \times 0.40) + (\text{Engagement} \times 0.35) + (\text{Recency} \times 0.25)$$
  - $\text{Affinity}$: Friendship (+1.0), Following (+0.6), Group Member (+0.5), Stranger (+0.1).
  - $\text{Engagement}$: $\log(1 + \text{Reactions} \times 1.5 + \text{Comments} \times 3.0 + \text{Shares} \times 4.0)$.
  - $\text{Recency}$: Exponential decay based on hours elapsed: $e^{-\lambda \cdot \Delta t}$.
- **Chronological Fallback**: Users can toggle to a strictly chronological stream.
- **Cursor Pagination**: Opaque base64 cursor based on `(score, id)` or `(createdAt, id)` to prevent pagination drift.

### 2.5 Interest Groups & Communities
- **Group Types**:
  - `PUBLIC`: Directory listed, posts viewable by all, anyone can join.
  - `PRIVATE`: Directory listed, posts viewable only by approved members, join requests require admin approval.
- **Role Hierarchy**:
  - `OWNER`: Full administrative rights, role delegation, group deletion.
  - `ADMIN`: Moderates posts, approves/rejects membership requests, manages members.
  - `MODERATOR`: Removes offensive posts and comments, mutes violators.
  - `MEMBER`: Creates group posts, comments, and reacts.
- **Group Discussions**: Dedicated feeds segregated from public feeds with strict member-only visibility for private groups.

### 2.6 Community Events & RSVPs
- **Event Management**: Create community events with title, description, banner, location/link, and datetime.
- **RSVP States**: `GOING`, `INTERESTED`, `NOT_GOING`.
- **Event Wall**: Discussion board for attendees.

### 2.7 24-Hour Ephemeral Stories
- **Temporary Publishing**: Images and text snippets visible for exactly 24 hours.
- **Query Filter**: `WHERE expiresAt > NOW()` enforced on all story queries.

### 2.8 Community Marketplace / Listings
- **Classifieds / Listings**: Item title, price, currency, category, condition, and contact button.

### 2.9 Content Moderation & Abuse Prevention
- **Reporting System**: Users can submit reports on posts, comments, or profiles with structured reason codes.
- **Moderator Queue**: Dedicated endpoint for community administrators to review and resolve reports.
- **Two-Way Blocking**:
  - When User A blocks User B:
    - User B's content disappears from User A's feeds, search, and groups.
    - User A's content disappears from User B's feeds, search, and groups.
    - Friendships, follow links, and pending requests are immediately severed.
    - Direct messaging and notifications between the two parties are silenced.

---

## 3. Visibility Matrix

| Content Visibility Level | Stranger | Follower | Friend | Group Member | Admin / Owner | Blocked User |
|---|---|---|---|---|---|---|
| **PUBLIC** | Allowed | Allowed | Allowed | Allowed | Allowed | Denied (404/Empty) |
| **FRIENDS** | Denied (403) | Denied (403) | Allowed | Denied (403) | Allowed | Denied (404/Empty) |
| **GROUP_ONLY (Public Group)** | Allowed | Allowed | Allowed | Allowed | Allowed | Denied (404/Empty) |
| **GROUP_ONLY (Private Group)** | Denied (403) | Denied (403) | Denied (403) | Allowed | Allowed | Denied (404/Empty) |
| **ONLY_ME** | Denied (403) | Denied (403) | Denied (403) | Denied (403) | Allowed | Denied (404/Empty) |
