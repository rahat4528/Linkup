# Podcast Platform — Specifications & Requirements

## 1. Overview
The Podcast Platform is a creator-oriented audio publishing system providing RSS 2.0 XML podcast feeds, chapter marker management, and SSRF-protected external feed validation.

## 2. Functional Requirements

### 2.1 RSS 2.0 XML Generation
- Generate standard RSS 2.0 XML documents compliant with podcast namespace extensions (`xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"`).
- Include `<enclosure>` audio metadata tags (`url`, `length`, `type="audio/mpeg"`).
- Output RFC 822 publication dates (`<pubDate>`).
- Filter out DRAFT or unpublished episodes from public feeds.
- Properly escape XML special entities (`&`, `<`, `>`, `"`, `'`).

### 2.2 SSRF-Protected External Feed Parsing
- Validate external feed URLs before ingestion.
- Enforce HTTP/HTTPS protocols.
- Detect and block private IPv4 subnets (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- Block cloud instance metadata IP (`169.254.169.254`).
- Block internal hostnames (`localhost`, `.local`, `.internal`).

### 2.3 Chapter Marker Processing
- Validate and order chapter markers chronologically.
- Enforce valid timestamps within episode duration.
- Associate chapters with titles, start times, and optional URLs.

### 2.4 Podcast Catalog & Audio Playback
- Podcast show management with slug generation, categorization, and artwork.
- Chapter-aware audio player supporting variable playback speeds (1x, 1.25x, 1.5x, 2x), 15s/30s skipping, and chapter progress ticks.
- Show subscriptions and listening history tracking.

## 3. Non-Functional Requirements
- **Security**: Strict SSRF defenses on outbound requests, JWT authentication for publishing endpoints.
- **Reliability**: Deterministic XML generation with valid schemas.
- **Performance**: Sub-50ms XML feed generation and caching.
