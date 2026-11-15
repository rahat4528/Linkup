# Audio Catalog & Discovery Platform — Specifications

## 1. Executive Summary

The Audio Catalog & Discovery Platform (`06-spotify-clone`) is a music streaming, playlist curation, and catalog exploration service. It provides track and album metadata indexing, playback queue management with Fisher-Yates shuffling and repeat modes, customizable playlist reordering, user library collections, and category-based exploration.

---

## 2. Functional Requirements

### 2.1 Audio Catalog Structure & Relations
- **Hierarchical Models**:
  - `Artist` -> Multiple `Album`s.
  - `Album` -> Ordered list of `Track`s (track numbers, durations).
  - `Genre` / Categories with vibrant visual gradient themes for exploration.
- **Audio Delivery**:
  - HTML5 audio streaming resolution with duration, seek offsets, and volume management.

### 2.2 Playback Queue Management & Algorithms
- **Active Track & Queue**:
  - Current playing track state.
  - "Up Next" queue: user-appended priority tracks.
  - Context queue: album or playlist natural order.
- **Fisher-Yates Shuffle**:
  - Shuffling preserves current playing track at position 0 and uniformly randomizes remaining queue tracks in $O(n)$ time.
  - Un-shuffling restores original sequential album/playlist track order.
- **Repeat Modes**:
  - `OFF`: Queue finishes after last track.
  - `ALL`: Queue loops back to first track upon completion.
  - `ONE`: Current track loops indefinitely upon completion.

### 2.3 Playlist Curation & Deterministic Reordering
- **User Playlists**:
  - Custom title, description, cover image.
  - `PlaylistTrack` junction model storing `position` index ($0, 1, 2, \dots$).
  - **Reordering Algorithm**: Moving track from `sourceIndex` to `targetIndex` updates affected tracks' position indices atomically.

### 2.4 User Library & Engagements
- **Saved Tracks**: Users can "Like" tracks into their "Liked Songs" collection.
- **Saved Albums & Followed Artists**: Bookmarking albums and artists for quick library access.

### 2.5 Catalog Search & Categorical Discovery
- Fast search across tracks, albums, artists, and playlists.
- Curated categories (e.g. Pop, Hip-Hop, Electronic, Rock, Indie, Chill).
