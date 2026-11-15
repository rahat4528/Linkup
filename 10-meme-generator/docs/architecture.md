# Meme Generator — Architecture & System Design

## Architecture Diagram

```
                       +-----------------------------+
                       |    Next.js 14 Frontend      |
                       |  (Canvas 2D Editor, Layers, |
                       |    Template Picker, Studio) |
                       +--------------+--------------+
                                      |
                           HTTP REST / Data URLs
                                      |
                       +--------------v--------------+
                       |    Express.js Backend       |
                       |   - SVG Compositor Engine   |
                       |   - Layer Schema Validator  |
                       |   - Template Manager        |
                       +--------------+--------------+
                                      |
                   +------------------+------------------+
                   |                                     |
         +---------v----------+                +---------v----------+
         |    PostgreSQL 16   |                |  Disk / S3 Storage |
         | (Templates, Memes, |                | (Template Images,  |
         |  Layers, Favorites)|                |  Exported PNGs)    |
         +--------------------+                +--------------------+
```

## Subsystems

### 1. Client-Side HTML5 Canvas 2D Engine (`frontend/src/components/MemeCanvas.tsx`)
Renders uploaded background templates and text layers with sub-pixel typography. Uses `ctx.strokeText` followed by `ctx.fillText` to produce the classic bold-outline meme visual format. Generates exportable PNG data URLs client-side with zero server round-trip.

### 2. Server-Side Compositor (`backend/src/services/compositor.service.ts`)
Converts layer JSON into standards-compliant SVG documents. Uses `paint-order="stroke fill"` and XML entity escaping to guarantee pixel parity with client-side canvas rendering while safeguarding against SVG script injection.

### 3. Layer Validator (`backend/src/services/layer-parser.service.ts`)
Sanitizes incoming text inputs by stripping HTML markup, clamping font sizes to safe bounds (12-120px), and restricting coordinates within the template boundaries.
