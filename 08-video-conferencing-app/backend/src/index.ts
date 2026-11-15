import * as http from 'http';
import { app } from './app';
import { SignalingServer } from '../../realtime/signaling-server';
import { roomManager } from './controllers/room.controller';

const PORT = process.env.PORT || 4008;

const server = http.createServer(app);
const signalingServer = new SignalingServer(server, roomManager);

server.listen(PORT, () => {
  console.log(`[Video Conferencing] HTTP and WebRTC Signaling server running on port ${PORT}`);
});
