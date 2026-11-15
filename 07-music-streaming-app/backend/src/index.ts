import { app } from './app';

const PORT = process.env.PORT || 4007;

app.listen(PORT, () => {
  console.log(`[Music Streaming] Backend server listening on port ${PORT}`);
});
