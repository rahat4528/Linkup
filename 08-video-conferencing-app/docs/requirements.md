# Video Conferencing App — Requirements & Specifications

## 1. Overview
The Video Conferencing App provides real-time multi-party video meetings with WebRTC signaling, waiting room admissions, host moderation controls, and pre-meeting device checks.

## 2. Functional Requirements

### 2.1 WebRTC Signaling & Media Negotiation
- Signaling protocol supporting SDP offer/answer exchange and ICE candidate trickle forwarding.
- Structured signaling messages (`join-room`, `room-joined`, `peer-joined`, `peer-left`, `offer`, `answer`, `ice-candidate`).
- Direct peer-to-peer or SFU topology coordination.

### 2.2 Meeting Lifecycle & Room Management
- Room generation with human-readable room codes (`xxx-yyyy-zzz`).
- Room status endpoints returning participant counts, lock states, and waiting room configurations.
- Automatic host succession if the active meeting host disconnects.

### 2.3 Waiting Room & Host Moderation Controls
- Waiting room gate: when enabled, incoming attendees are placed in an admission queue awaiting host approval.
- Host admission queue management (Admit / Deny).
- In-meeting host controls:
  - Remote mute attendee microphone.
  - Expel attendee from meeting with instant socket termination.
  - Lock meeting room to block new join attempts.
- Non-host permission boundaries: regular participants cannot execute moderation actions.

### 2.4 Pre-Meeting Green Room Device Check
- Camera preview feed.
- Live microphone audio level meter (VU meter) with clipping detection.
- Audio and video mute pre-sets prior to room entry.

### 2.5 In-Meeting Interactive Features
- Active speaker highlight.
- Hand-raising queue with visual badge indicators.
- In-meeting text chat broadcasting.
- Screen sharing status indication.

## 3. Non-Functional Requirements
- **Latency**: Sub-200ms real-time audio and video round-trip time.
- **Security**: JWT-signed meeting join tokens, WebSocket connection handshakes, and input sanitization.
- **Scalability**: Decoupled signaling server capable of handling multiple concurrent rooms.
