import { request, app } from './helpers';

const base = 'tree';
const field = 'fb23746c-edb0-49d0-884d-d2f64208d086';

describe('tree routes', () => {
  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${field}/15/5337/12656.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('tree-vector-tile.mvt');

    done();
  });

  afterAll(app.close);
});
