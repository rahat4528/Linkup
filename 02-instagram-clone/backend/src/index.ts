const http = require('http');
import { createApp } from './app';
import { config } from './config';

const app = createApp();
const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`[Visual Media Platform] Server listening on port ${config.port}`);
});

export { server, app };
