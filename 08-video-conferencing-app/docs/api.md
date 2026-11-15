# Video Conferencing App — API Reference

## Base URL
`http://localhost:4008`

## REST Endpoints

### 1. Meeting Rooms
- `POST /api/rooms`
  - Body: `{ title?, waitingRoomEnabled?, customCode? }`
  - Creates a new meeting room and issues a host join token.
- `GET /api/rooms/:roomCode`
  - Returns meeting room metadata, lock status, and participant counts.
- `POST /api/rooms/:roomCode/token`
  - Body: `{ displayName }`
  - Issues attendee WebRTC join token. Returns 403 if room is locked.
- `POST /api/devices/test-audio`
  - Body: `{ samples: number[] }`
  - Evaluates microphone audio levels, peak amplitude, and clipping status.

### 2. User Authentication
- `POST /api/auth/register`: `{ email, username, password, displayName }` -> `{ user, token }`
- `POST /api/auth/login`: `{ email, password }` -> `{ user, token }`
- `GET /api/auth/me`: Validates JWT token and returns user profile.

## WebRTC Signaling Protocol (WebSocket `/signaling`)
- **`join-room`**: `{ roomCode, peerId, displayName, isHost }`
- **`offer`**: `{ targetPeerId, sdp }`
- **`answer`**: `{ targetPeerId, sdp }`
- **`ice-candidate`**: `{ targetPeerId, candidate }`
- **`host-action`**: `{ roomCode, action: 'ADMIT' | 'EXPEL' | 'MUTE', targetPeerId, hostPeerId }`
- **`chat-message`**: `{ roomCode, content }`
