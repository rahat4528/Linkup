# Visual Media Discovery Platform — Architecture & Design

## 1. System Architecture

```mermaid
graph TD
    Client["Next.js Visual Client (Mobile-First)"] -->|REST API| ApiServer["NestJS API Server"]
    Client -->|WebSocket| WsServer["Socket.IO (DMs & Notifications)"]

    subgraph Backend["Modular Backend Architecture"]
        AuthMod["Authentication & Profiles Module"]
        MediaMod["Media Publishing & Carousels"]
        StoryMod["Stories & Ephemeral Views Engine"]
        FollowMod["Follow & Request Approval System"]
        ExploreMod["Explore & Hashtag Engine"]
        ReelMod["Vertical Video (Reels) Module"]
        DmMod["Direct Messaging Module"]
    end

    ApiServer --> AuthMod
    ApiServer --> MediaMod
    ApiServer --> StoryMod
    ApiServer --> FollowMod
    ApiServer --> ExploreMod
    ApiServer --> ReelMod
    ApiServer --> DmMod

    Backend --> DB[(PostgreSQL: linkup_instagram_db)]
    Backend --> Cache[(Redis: Sessions & Trending Counters)]
    Backend --> S3[(S3 / MinIO Object Storage)]
```

---

## 2. Follow Request State Machine (Private Accounts)

```mermaid
stateDiagram-v2
    [*] --> NONE
    NONE --> ACCEPTED : Follow Public Account
    NONE --> PENDING : Follow Private Account
    PENDING --> ACCEPTED : Approve Request
    PENDING --> REJECTED : Reject Request
    PENDING --> CANCELLED : Cancel Request
    ACCEPTED --> UNFOLLOWED : Unfollow
    REJECTED --> NONE : Reset
    CANCELLED --> NONE : Reset
    UNFOLLOWED --> NONE : Reset
```

---

## 3. Media Processing Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PROCESSING : Upload Initiated
    PROCESSING --> READY : Validation & Thumbnails Complete
    PROCESSING --> FAILED : Invalid Format or Dimension
    READY --> [*] : Visible in Feeds & Explore
```

Only media in `READY` status is ever indexed or returned in feed queries.
