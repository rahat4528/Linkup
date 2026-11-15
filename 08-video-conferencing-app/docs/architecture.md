# Video Conferencing App — Architecture & System Design

## Architecture Diagram

```
                        +---------------------------+
                        |   Next.js 14 Frontend     |
                        | (Device Preview, Stages,  |
                        |   Host Controls, Chat)    |
                        +-------------+-------------+
                                      |
                      WebSocket (Signaling) / REST API
                                      |
                        +-------------v-------------+
                        |      Express.js Backend   |
                        |  - WebRTC Signaling Hub   |
                        |  - Room State Manager     |
                        |  - Host Moderation Engine |
                        +-------------+-------------+
                                      |
                   +------------------+------------------+
                   |                                     |
         +---------v----------+                +---------v----------+
         |    PostgreSQL 16   |                |      Redis 7       |
         | (Rooms, Users, Log)|                | (Ephemeral State,  |
         |                    |                |  Active Peers)     |
         +--------------------+                +--------------------+
```

## Core Modules

### 1. Signaling Protocol Engine (`realtime/signaling-protocol.ts`)
Coordinates peer-to-peer WebRTC connections by routing session description protocol (SDP) offers, answers, and Interactive Connectivity Establishment (ICE) candidates between participants.

### 2. Conference Room Manager (`realtime/room-manager.ts`)
Encapsulates all room state mutations, maintaining separate active participant collections and waiting room admission queues. It enforces host privileges (only hosts can admit, expel, mute, or lock rooms) and provides automatic host succession if the host disconnects while other members remain.

### 3. Pre-Flight Device Check (`backend/src/services/meeting.service.ts`)
Analyzes microphone audio samples to compute real-time VU meter values (average and peak amplitudes) and detect signal clipping prior to meeting admission.
