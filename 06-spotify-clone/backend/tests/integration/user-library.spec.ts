const request = require('supertest');
import { createApp } from '../../src/app';
import { musicStore } from '../../src/services/store.service';

describe('User Library API Integration', () => {
  let app: any;
  let userToken: string;
  let trackId: string;
  let albumId: string;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(async () => {
    musicStore.clear();

    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'listener@music.test',
        username: 'listener',
        password: 'password123',
        name: 'Music Listener'
      });
    userToken = userRes.body.token;

    const t = await request(app)
      .post('/api/tracks')
      .send({ title: 'Favorite Song', artistId: 'a1', audioUrl: 'fav.mp3' });
    trackId = t.body.track.id;

    const a = await request(app)
      .post('/api/albums')
      .send({ title: 'Classic Album', artistId: 'a1' });
    albumId = a.body.album.id;
  });

  it('should toggle like track and retrieve liked songs', async () => {
    // Like track
    const likeRes = await request(app)
      .post(`/api/library/tracks/${trackId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.liked).toBe(true);

    // List liked tracks
    const listRes = await request(app)
      .get('/api/library/liked-tracks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.tracks.length).toBe(1);
    expect(listRes.body.tracks[0].id).toBe(trackId);

    // Unlike track
    const unlikeRes = await request(app)
      .post(`/api/library/tracks/${trackId}/like`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.liked).toBe(false);

    // List again -> 0
    const listEmpty = await request(app)
      .get('/api/library/liked-tracks')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listEmpty.body.tracks.length).toBe(0);
  });

  it('should toggle save album and retrieve saved albums', async () => {
    // Save album
    const saveRes = await request(app)
      .post(`/api/library/albums/${albumId}/save`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.saved).toBe(true);

    // List saved albums
    const listRes = await request(app)
      .get('/api/library/albums')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.albums.length).toBe(1);
    expect(listRes.body.albums[0].id).toBe(albumId);
  });
});
