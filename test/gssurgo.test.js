import { request } from './helpers';

const base = 'soil';

describe('soil routes', () => {
  test('should return a raster tile', async () => {
    const res = await request.get(`/${base}/17/22151/51660.png`);

    expect(res.body).matchFixture('soil-raster-tile.png');
  });

  test('should return a vector tile', async () => {
    const res = await request.get(`/${base}/17/22151/51660.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('soil-vector-tile.mvt');
  });
});
