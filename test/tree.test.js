import { request } from './helpers';

const base = 'tree';

describe('tree routes', () => {
  test('should return a vector tile with trees', async () => {
    const overlay = '4d5cca2a-5b18-4346-90af-8daa2bcbfc1e';

    const res = await request.get(`/${base}/count/${overlay}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-vector-tile.mvt');
  });

  test('should return a vector tile with tree data', async () => {
    const overlay = '98e1c50d-1d6e-40ac-b955-2c8ab5df07cb';

    const res = await request.get(`/${base}/data/${overlay}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-data-vector-tile.mvt');
  });
});
