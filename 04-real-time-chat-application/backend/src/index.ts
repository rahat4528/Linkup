import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { config } from './config';
import { SocketService } from './services/socket.service';

const app = createApp();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

SocketService.initialize(io);

server.listen(config.port, () => {
  console.log(`[Chat Application Gateway] Running on port ${config.port} in ${config.nodeEnv} mode`);
});
