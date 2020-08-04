
const base = 'soil';

describe('soil routes', () => {
  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/17/22151/51660.png`);

    expect(res.body).matchFixture('soil-raster-tile.png');

    done();
  });

  test('should return a vector tile', async done => {
    const res = await request.get(`/${base}/14/3364/6683.mvt`).responseType('arraybuffer');

    expect(res.body).matchFixture('soil-vector-tile.mvt');

    done();
  });
});
