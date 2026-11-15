const request = require('supertest');
import { createApp } from '../../src/app';
import { musicStore } from '../../src/services/store.service';

describe('Search and Browse Discovery API Integration', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    musicStore.clear();

    musicStore.artists.push({
      id: 'art_synth',
      name: 'Retro Wave Masters',
      createdAt: new Date()
    });

    musicStore.albums.push({
      id: 'alb_synth',
      artistId: 'art_synth',
      title: 'Neon Horizon',
      releaseYear: 2026,
      createdAt: new Date()
    });

    musicStore.tracks.push({
      id: 'trk_synth',
      albumId: 'alb_synth',
      artistId: 'art_synth',
      title: 'City Lights At Dusk',
      durationMs: 200000,
      audioUrl: 'synth.mp3',
      trackNumber: 1,
      createdAt: new Date()
    });
  });

  it('should fetch browse categories with gradients', async () => {
    const res = await request(app).get('/api/browse/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThan(0);
    expect(res.body.categories[0].gradient).toContain('from-');
  });

  it('should search across tracks, albums, and artists', async () => {
    // Search track title
    const resTrack = await request(app).get('/api/search?q=City');
    expect(resTrack.status).toBe(200);
    expect(resTrack.body.results.tracks.length).toBe(1);
    expect(resTrack.body.results.tracks[0].title).toBe('City Lights At Dusk');

    // Search album title
    const resAlbum = await request(app).get('/api/search?q=Horizon');
    expect(resAlbum.status).toBe(200);
    expect(resAlbum.body.results.albums.length).toBe(1);
    expect(resAlbum.body.results.albums[0].title).toBe('Neon Horizon');

    // Search artist name
    const resArtist = await request(app).get('/api/search?q=Retro');
    expect(resArtist.status).toBe(200);
    expect(resArtist.body.results.artists.length).toBe(1);
    expect(resArtist.body.results.artists[0].name).toBe('Retro Wave Masters');
  });
});
