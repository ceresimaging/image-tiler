import { app, request, createImagery, createCustom, createFiles, wipeCache } from './helpers';

const base = 'cache';
const imagery = '7326e81d-40b0-4053-8f33-cd22f9a53df9';
const custom = '0e220754-e251-41c2-ab8b-1f05962ab7e9';

jest.mock('aws-sdk', () => {
  const fs = require('fs-extra');

  return {
    CloudFront: jest.fn(() => ({
      createInvalidation: jest.fn((params) => ({
        promise: jest.fn().mockResolvedValue({
          Invalidation: params
        })
      })),
      waitFor: jest.fn((state, params) => ({
        promise: jest.fn().mockResolvedValue()
      }))
    })),
    S3: jest.fn(() => ({
      getObject: jest.fn(({ Bucket, Key }) => ({
        promise: jest.fn().mockResolvedValue({
          Body: fs.readFileSync(`./fixtures/${Bucket}/${Key}${Bucket === process.env.CUSTOM_LAYERS_BUCKET ? '.zip' : ''}`)
        })
      })),
    }))
  };
});

describe('cache', () => {
  beforeEach(() => {
    wipeCache();
  });

  test('should remove an imagery cached file', async done => {
    createImagery(imagery);

    const res = await request.get(`/${base}/imagery/${imagery}`);

    expect(res.body).toEqual({ files: 1, invalidations: 1 });

    done();
  });

  test('should remove an imagery cached file and wait for invalidation', async done => {
    createImagery(imagery);

    const res = await request.get(`/${base}/imagery/${imagery}?wait=true`);

    expect(res.body).toEqual({ files: 1, invalidations: 1 });

    done();
  });

  test('should remove a custom layer cached file', async done => {
    createCustom(custom);

    const res = await request.get(`/${base}/custom/${custom}`);

    expect(res.body).toEqual({ files: 1, invalidations: 1 });

    done();
  });

  test('should remove all files older than age', async done => {
    createFiles(2);
    createFiles(2, 3);
    createFiles(2, 5);

    const res = await request.get(`/${base}?key=${process.env.CLOUDFRONT_DISTRIBUTION}&age=3`);

    expect(res.body).toEqual({ files: 4, invalidations: 0 });

    done();
  });

  test('should flush all cache', async done => {
    createFiles(10);

    const res = await request.get(`/${base}?key=${process.env.CLOUDFRONT_DISTRIBUTION}&age=0`);

    expect(res.body).toEqual({ files: 10, invalidations: 0 });

    done();
  });

  test('should invalidate path', async done => {
    const res = await request.get(`/${base}/invalidate?key=${process.env.CLOUDFRONT_DISTRIBUTION}`);

    expect(res.body).toEqual({ files: 0, invalidations: 1 });

    done();
  });

  afterAll(app.close);
});
