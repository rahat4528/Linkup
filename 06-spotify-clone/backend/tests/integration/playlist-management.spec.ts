const request = require('supertest');
import { createApp } from '../../src/app';
import { musicStore } from '../../src/services/store.service';

describe('Playlist Management API Integration', () => {
  let app: any;
  let userToken: string;
  let userId: string;
  let track1Id: string;
  let track2Id: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    musicStore.clear();

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'curator@music.test',
        username: 'curator',
        password: 'password123',
        name: 'Playlist Curator'
      });
    userToken = userRes.body.token;
    userId = userRes.body.user.id;

    // Seed 2 tracks
    const t1 = await request(app)
      .post('/api/tracks')
      .send({ title: 'Song Alpha', artistId: 'a1', audioUrl: 'alpha.mp3' });
    track1Id = t1.body.track.id;

    const t2 = await request(app)
      .post('/api/tracks')
      .send({ title: 'Song Beta', artistId: 'a1', audioUrl: 'beta.mp3' });
    track2Id = t2.body.track.id;
  });

  it('should create playlist, add tracks, reorder, and remove tracks', async () => {
    // 1. Create playlist
    const plRes = await request(app)
      .post('/api/playlists')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Weekend Vibes', description: 'Upbeat weekend playlist' });

    expect(plRes.status).toBe(201);
    const playlistId = plRes.body.playlist.id;

    // 2. Add track 1 and track 2
    await request(app)
      .post(`/api/playlists/${playlistId}/tracks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ trackId: track1Id });

    await request(app)
      .post(`/api/playlists/${playlistId}/tracks`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ trackId: track2Id });

    // 3. Verify order [track1, track2]
    const getPlRes = await request(app).get(`/api/playlists/${playlistId}`);
    expect(getPlRes.status).toBe(200);
    expect(getPlRes.body.playlist.tracks.length).toBe(2);
    expect(getPlRes.body.playlist.tracks[0].id).toBe(track1Id);
    expect(getPlRes.body.playlist.tracks[1].id).toBe(track2Id);

    // 4. Reorder: move track 0 to index 1 -> becomes [track2, track1]
    const reorderRes = await request(app)
      .put(`/api/playlists/${playlistId}/reorder`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sourceIndex: 0, targetIndex: 1 });

    expect(reorderRes.status).toBe(200);

    const getReordered = await request(app).get(`/api/playlists/${playlistId}`);
    expect(getReordered.body.playlist.tracks[0].id).toBe(track2Id);
    expect(getReordered.body.playlist.tracks[1].id).toBe(track1Id);

    // 5. Remove track 2
    const removeRes = await request(app)
      .delete(`/api/playlists/${playlistId}/tracks/${track2Id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(removeRes.status).toBe(200);

    const getFinal = await request(app).get(`/api/playlists/${playlistId}`);
    expect(getFinal.body.playlist.tracks.length).toBe(1);
    expect(getFinal.body.playlist.tracks[0].id).toBe(track1Id);
  });
});
