# Music Streaming App — Functional & Technical Requirements

## 1. Overview
The Music Streaming App is a high-performance audio playback platform focusing on low-latency partial content delivery, real-time waveform visualization, and a floating persistent compact player.

## 2. Functional Requirements

### 2.1 Audio Streaming Engine
- Support RFC 7233 HTTP/1.1 Range Requests returning HTTP 206 Partial Content.
- Implement streaming chunking to deliver audio in responsive byte slices (default 1MB or specified byte ranges).
- Return proper standard HTTP headers:
  - `Content-Range: bytes <start>-<end>/<total>`
  - `Accept-Ranges: bytes`
  - `Content-Length: <chunk-size>`
  - `Content-Type: audio/mpeg`
- Reject out-of-bound ranges with HTTP 416 Range Not Satisfiable and `Content-Range: bytes */<total>`.

### 2.2 Waveform Peak Extraction & Visualization
- Extract peak amplitudes from raw audio buffers or synthesize normalized peaks.
- Downsample peaks into configurable bins (e.g., 100-120 bins) scaled from 0 to 100.
- Render interactive Canvas waveform scrubber displaying:
  - Gradient peak bars
  - Dynamic playback progress fill
  - Hover timestamp tooltip
  - Direct seek-on-click

### 2.3 Floating Persistent Compact Player
- Floating dockable widget persisting across route changes.
- Expandable to view volume slider and detailed track metadata.
- Collapsible to compact bottom-right player footprint.
- Play, pause, skip, seek, and volume mute controls.

### 2.4 Track Catalog & Storage
- Index audio metadata (title, artist, album, genre, duration, file size, MIME type).
- Filter tracks by genre and full-text keyword search.
- In-memory/Redis audio chunk caching for instant seeking.

## 3. Non-Functional Requirements
- **Performance**: Audio range stream initialization latency under 50ms.
- **Reliability**: Graceful fallback to mock streaming chunks when physical disk files are absent during dev/test.
- **Security**: JWT-based creator authentication, CORS allowlist, and secure HTTP response headers.
