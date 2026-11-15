# Microblogging Platform — Architecture & System Design

## 1. System Topology

```mermaid
graph TD
    Client["Next.js Microblogging Client"] -->|REST / OpenAPI| ApiServer["NestJS API Server"]
    Client -->|WebSocket| WsGateway["Socket.IO Gateway (Timeline Updates & Mentions)"]

    subgraph Backend["Core Domain Modules"]
        PostMod["Posts & Unicode Character Budget"]
        ThreadMod["Thread & Conversation Tree Engine"]
        PollMod["Polls & Atomic Voting Engine"]
        NoteMod["Community Notes & Rating Matrix"]
        TrendMod["Sliding Window Trending Engine"]
        SearchMod["PostgreSQL Full-Text Search (GIN)"]
        SafetyMod["Mute & Two-Way Block Systems"]
    end

    ApiServer --> PostMod
    ApiServer --> ThreadMod
    ApiServer --> PollMod
    ApiServer --> NoteMod
    ApiServer --> TrendMod
    ApiServer --> SearchMod
    ApiServer --> SafetyMod

    Backend --> DB[(PostgreSQL: linkup_twitter_db)]
    Backend --> Redis[(Redis: Sliding Window Trending & Caching)]
```

---

## 2. Conversation Tree Data Model

```mermaid
graph TD
    RootPost["Root Post (conversationId: P1, parentId: null)"]
    Reply1["Reply 1 (conversationId: P1, parentId: P1)"]
    Reply2["Reply 2 (conversationId: P1, parentId: P1)"]
    NestedReply["Nested Reply (conversationId: P1, parentId: R1)"]

    RootPost --> Reply1
    RootPost --> Reply2
    Reply1 --> NestedReply
```

### Deterministic Tree Reconstruction
1. Given a post $P$, query all records where `conversationId = P.conversationId`.
2. Construct adjacency map `parentId -> children[]`.
3. Perform breadth-first or depth-first walk ordered by `createdAt ASC` to render branching discussion lines without orphaned nodes.

---

## 3. Simplified Community Notes Rating Algorithm

Let $R$ be the set of raters for a proposed note $N$.
Each rater $r \in R$ submits a rating $v_r \in \{+1 \text{ (Helpful)}, -1 \text{ (Not Helpful)}\}$.
Each rater carries a baseline topic bias $b_r \in [-1, 1]$ computed from their historical rating patterns.

A note is published with status `HELPFUL` when:
1. Total helpful ratings exceed a minimum threshold ($|R| \ge 3$).
2. The diversity variance $Var(\{b_r \mid v_r = +1\}) \ge 0.25$, demonstrating cross-perspective consensus.
