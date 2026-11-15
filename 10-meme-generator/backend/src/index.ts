import { app } from './app';

const PORT = process.env.PORT || 4010;

app.listen(PORT, () => {
  console.log(`[Meme Generator] API & Graphic Engine running on port ${PORT}`);
});
