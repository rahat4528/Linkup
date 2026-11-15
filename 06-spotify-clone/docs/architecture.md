# Audio Catalog & Discovery Platform — Architecture

## 1. System Overview

```
[ Next.js Music Client ] <---> [ Express API Gateway ]
        │                              │
        │ HTML5 Audio                  ▼
        ▼                      [ PostgreSQL 16 ]
 [ Playback Engine ]           - Artists, Albums, Tracks
 - Queue & Fisher-Yates        - Playlists & Position Indexes
 - Persistent Audio Bar        - Liked Songs & Saved Albums
```

---

## 2. Queue State Machine & Shuffling

- **State Fields**:
  - `currentTrack`: Active Track
  - `upNextQueue`: Tracks manually queued by user (dequeued first)
  - `contextQueue`: Sequence from current playlist/album
  - `originalOrder`: Stored context order before shuffle
  - `isShuffled`: Boolean flag
  - `repeatMode`: `OFF` | `ALL` | `ONE`

- **Fisher-Yates Implementation**:
```ts
for (let i = n - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]];
}
```
