# Media Storage

This directory contains raw audio files, transcoded streams, and cached byte ranges for the Music Streaming App.

## Audio Processing Pipeline
- Audio files are stored under `media/<track-id>.<format>`.
- The streaming engine reads file slices via `fs.createReadStream` with `{ start, end }` offsets matching HTTP 206 Range headers.
- Waveform peak arrays are precomputed during ingestion into 100-bin normalized peak arrays [0-100] for responsive client-side canvas visualization.
