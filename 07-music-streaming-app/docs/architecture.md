# Music Streaming App — Architecture & System Design

## Architecture Overview

```
                      +-----------------------------+
                      |   Next.js 14 Web Frontend   |
                      |  (Canvas Waveform Scrubber, |
                      |    Persistent Compact Player)  |
                      +--------------+--------------+
                                     |
                          HTTP 206 Range Requests
                                     |
                      +--------------v--------------+
                      |    Express.js Audio Server  |
                      |   - Range Request Parser    |
                      |   - Waveform Peak Generator |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                     |                     |
     +---------v--------+   +--------v-------+    +--------v-------+
     |   Media Storage  |   |   Audio Cache  |    |   PostgreSQL   |
     | (Raw Audio Chunks|   | (In-Memory /   |    |  (Metadata &   |
     | & Slices on Disk)|   |  Redis Chunks) |    | Waveform Peaks)|
     +------------------+   +----------------+    +----------------+
```

## Key Subsystems

### 1. HTTP 206 Range Stream Handler
The `StreamingService` complies with RFC 7233. When an audio player requests partial byte intervals (e.g., `bytes=0-1048575`), the service validates the range against file size, extracts the byte slice, and streams it back with the required `Content-Range` and `Accept-Ranges` headers. This enables instant seeking without downloading the full audio file.

### 2. Waveform Peak Extraction
The `WaveformService` samples audio buffers or synthesized harmonics into 100 discrete bins. Values are normalized between 0 and 100, which are rendered client-side on an HTML5 `<canvas>` element for smooth 60fps scrubbing with zero layout thrashing.

### 3. Persistent Compact Player
The compact player component is rendered at the root layout level, decoupled from page routing. As the user navigates across playlists or discovery feeds, playback continues uninterrupted with synchronized waveform scrubbing.
