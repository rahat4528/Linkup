const request = require('supertest');
import { createApp } from '../../src/app';
import { musicStore } from '../../src/services/store.service';
import { PlaybackAdapter } from '../../../integrations/playback.adapter';

describe('Playback & Catalog Integration API', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    musicStore.clear();
  });

  it('should create and retrieve artist, album, and tracks', async () => {
    // 1. Create artist
    const artRes = await request(app)
      .post('/api/artists')
      .send({ name: 'Solar Sound', bio: 'Ambient chill artist' });

    expect(artRes.status).toBe(201);
    const artistId = artRes.body.artist.id;

    // 2. Create album
    const albRes = await request(app)
      .post('/api/albums')
      .send({ title: 'Atmospheres', artistId, coverUrl: 'cover.jpg', releaseYear: 2026 });

    expect(albRes.status).toBe(201);
    const albumId = albRes.body.album.id;

    // 3. Create track
    const trkRes = await request(app)
      .post('/api/tracks')
      .send({
        title: 'Morning Dew',
        artistId,
        albumId,
        durationMs: 240000,
        audioUrl: 'https://cdn.example.com/audio/morning-dew.mp3',
        trackNumber: 1
      });

    expect(trkRes.status).toBe(201);
    const trackId = trkRes.body.track.id;

    // 4. Fetch track
    const getTrkRes = await request(app).get(`/api/tracks/${trackId}`);
    expect(getTrkRes.status).toBe(200);
    expect(getTrkRes.body.track.title).toBe('Morning Dew');
    expect(getTrkRes.body.track.artistName).toBe('Solar Sound');
    expect(getTrkRes.body.track.albumTitle).toBe('Atmospheres');

    // 5. Test PlaybackAdapter resolution
    const adapter = new PlaybackAdapter();
    const streamUrl = await adapter.resolveStreamUrl(trackId);
    expect(streamUrl).toBe(`http://localhost:3005/audio/${trackId}.mp3`);
  });
});
