# Video Conferencing App

Production-quality real-time video conferencing application featuring WebRTC signaling, waiting room admissions, host moderation controls, and pre-meeting device checks.

## Features
- **WebRTC Signaling**: WebSocket-based signaling server handling SDP offer/answer exchanges and ICE candidates.
- **Waiting Room Admissions**: Host-managed attendee queue with admission and denial controls.
- **Host Moderation**: Remote attendee muting, participant expulsion, and room locking.
- **Device Pre-Flight Check**: Microphone VU meter testing with clipping detection and camera preview.
- **Interactive Conferencing**: Active speaker highlighting, hand raising, screen sharing, and in-call chat.

## Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide icons
- **Backend**: Node.js, Express, WebSocket (`ws`), TypeScript, JWT, Helmet, CORS
- **Database**: PostgreSQL 16 (`linkup_video_conferencing_db`), Prisma ORM
- **Cache**: Redis 7
- **Containerization**: Docker Compose

## Getting Started

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run start:dev
```
Backend runs on `http://localhost:4008`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3008`.

### 4. Running Tests
```bash
cd backend
npm test
```
