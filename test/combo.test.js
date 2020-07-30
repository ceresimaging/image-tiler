import { app, request, fixture, downloadSatellite, downloadImagery } from './helpers';

const base = 'combo';
const imagery = '7326e81d-40b0-4053-8f33-bd22f9a53df9';

jest.mock('aws-sdk');

describe.skip('combo routes', () => {
  beforeAll(() => {
    downloadSatellite();
  });

  test('should return a raster tile', async done => {
    const res = await request.get(`/${base}/${imagery}/17/21455/50471.png`);

    expect(res.body).toEqual(fixture('combo-raster-tile.png'));

    done();
  });

  test('should return a single image', async done => {
    const res = await request.get(`/${base}/${imagery}.png`);

    expect(res.body).toEqual(fixture('combo-image.png'));

    done();
  });

  test('should return a single image with specific size', async done => {
    const res = await request.get(`/${base}/${imagery}.png?size=512`);

    expect(res.body).toEqual(fixture('combo-image-size.png'));

    done();
  });

  test('should return a single image with specific buffer', async done => {
    const res = await request.get(`/${base}/${imagery}.png?buffer=0.2`);

    expect(res.body).toEqual(fixture('combo-image-buffer.png'));

    done();
  });

  test('should return a single image with markers', async done => {
    const imagery = 'c1923c08-5c61-420e-b569-5e00baf0c114';
    const flight = 'ebe0d55b-e957-44ab-8240-7202150a3789';

    const res = await request.get(`/${base}/${imagery}/${flight}.png`);

    expect(res.body).toEqual(fixture('combo-marker.png'));

    done();
  });

  test('should return a single image with markers for notifications', async done => {
    const imagery = '4a6fa821-f022-4864-8e55-b8c9231693d4';
    const flight = '5e771760-a22f-4a98-aa38-f63e0de40827';

    const res = await request.get(`/${base}/issues/${imagery}/${flight}.png?minBuffer=50`);

    expect(res.body).toEqual(fixture('combo-issues.png'));

    done();
  });

  test('should return a single image with markers for notifications with specific aspect ratio', async done => {
    const imagery = '4a6fa821-f022-4864-8e55-b8c9231693d4';
    const flight = '5e771760-a22f-4a98-aa38-f63e0de40827';

    const res = await request.get(`/${base}/issues/${imagery}/${flight}.png??minBuffer=50&ratio=2`);

    expect(res.body).toEqual(fixture('combo-issues-ratio.png'));

    done();
  });

  afterAll(app.close);
});
