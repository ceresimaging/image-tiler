const base = 'custom';
const custom = '0e220754-e251-41c2-ab8b-0f05962ab7e9';

jest.mock('aws-sdk');

describe('custom routes', () => {
  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/${custom}/14/2680/6344.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('custom-vector-tile.mvt');

    done();
  });
});
