import { app } from './app';

const PORT = process.env.PORT || 4009;

app.listen(PORT, () => {
  console.log(`[Podcast Platform] API & RSS Feed Server listening on port ${PORT}`);
});
