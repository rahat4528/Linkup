# Podcast Platform — Architecture & System Design

## Architecture Diagram

```
                       +-----------------------------+
                       |    Next.js 14 Frontend      |
                       |  (Chapter Player, Studio,   |
                       |    Show Discovery Feed)     |
                       +--------------+--------------+
                                      |
                           HTTP / REST / RSS XML
                                      |
                       +--------------v--------------+
                       |    Express.js Backend       |
                       |   - RSS 2.0 XML Generator   |
                       |   - SSRF Protection Filter  |
                       |   - Chapter Engine          |
                       +--------------+--------------+
                                      |
                   +------------------+------------------+
                   |                                     |
         +---------v----------+                +---------v----------+
         |    PostgreSQL 16   |                |      Redis 7       |
         | (Shows, Episodes,  |                | (Feed Caching,     |
         |  Chapters, Users)  |                |  Rate Limiting)    |
         +--------------------+                +--------------------+
```

## Subsystems

### 1. RSS 2.0 XML Generator (`backend/src/services/rss-generator.service.ts`)
Converts podcast and episode relational data into standard XML feeds. It automatically formats RFC 822 publication dates, calculates duration strings (HH:MM:SS), generates audio `<enclosure>` elements with file sizes and MIME types, and filters out draft episodes.

### 2. SSRF Protection Filter (`backend/src/services/rss-parser.service.ts`)
Validates outgoing URLs before fetching external RSS feeds. It enforces protocol rules (HTTP/HTTPS only) and blocks loopback addresses, private IP ranges (RFC 1918), and link-local / cloud instance metadata addresses (`169.254.169.254`).

### 3. Chapter Processing Engine (`backend/src/services/chapter.service.ts`)
Validates episode chapter markers, ensuring non-negative start times, chronological sorting, and boundary validation against the total episode duration.
