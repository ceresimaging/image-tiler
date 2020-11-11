import { request } from './helpers';

const base = 'tree';

describe('tree routes', () => {
  test('should return a vector tile with trees', async done => {
    const overlay = '14d04294-6636-4fda-a82d-23dc1cd9e0e3';

    const res = await request.get(`/${base}/count/${overlay}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-vector-tile.mvt');

    done();
  });

  test('should return a vector tile with tree data', async done => {
    const overlay = '8bcf2e4b-a18b-4857-90c2-8ee80fd8df98';

    const res = await request.get(`/${base}/data/${overlay}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-data-vector-tile.mvt');

    done();
  });
});
