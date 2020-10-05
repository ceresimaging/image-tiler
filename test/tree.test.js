import { request, app } from './helpers';

const base = 'tree';
const field = 'fb23746c-edb0-49d0-884d-d2f64208d086';
const visit = '230675';
const overlay = 'water_stress';

describe('tree routes', () => {
  test('should return a vector tile with trees', async done => {
    const res = await request.get(`/${base}/${field}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-vector-tile.mvt');

    done();
  });

  test.skip('should return a vector tile with trees data', async done => {
    const res = await request.get(`/${base}/${field}/${visit}/${overlay}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-data-vector-tile.mvt');

    done();
  });

  afterAll(app.close);
});
