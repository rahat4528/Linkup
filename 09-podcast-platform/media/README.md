# Podcast Media Assets

Audio files and episode enclosures are stored or cached in this directory.

## Pipeline
- Audio episodes are encoded as standard MP3/AAC audio files (`audio/mpeg`).
- The RSS generator emits standard `<enclosure url="..." length="..." type="audio/mpeg"/>` XML nodes pointing to CDN or server-hosted audio files.
