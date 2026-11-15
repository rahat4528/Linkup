import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`[Spotify Clone Backend] Running on port ${config.port} in ${config.nodeEnv} mode`);
});
