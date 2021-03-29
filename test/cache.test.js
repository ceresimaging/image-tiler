import { request, createImagery, createCustom, createFiles, wipeCache } from "./helpers";

const base = "cache";
const imagery = "7326e81d-40b0-4053-8f33-cd22f9a53df9";
const custom = "0e220754-e251-41c2-ab8b-1f05962ab7e9";

jest.mock("aws-sdk");

describe("cache", () => {
  beforeEach(() => {
    wipeCache();
  });

  test("should remove an imagery cached file", async () => {
    createImagery(imagery);

    const res = await request.get(`/${base}/imagery/${imagery}`);

    expect(res.body).toEqual({ files: 1, invalidations: 4 });
  });

  test("should remove an imagery cached file and wait for invalidation", async () => {
    createImagery(imagery);

    const res = await request.get(`/${base}/imagery/${imagery}?wait=true`);

    expect(res.body).toEqual({ files: 1, invalidations: 4 });
  });

  test("should remove a custom layer cached file", async () => {
    createCustom(custom);

    const res = await request.get(`/${base}/custom/${custom}`);

    expect(res.body).toEqual({ files: 1, invalidations: 1 });
  });

  test("should remove all files older than age", async () => {
    createFiles(2);
    createFiles(2, 3);
    createFiles(2, 5);

    const res = await request.get(`/${base}?key=${process.env.CLOUDFRONT_DISTRIBUTION}&age=3`);

    expect(res.body).toEqual({ files: 4, invalidations: 0 });
  });

  test("should flush all cache", async () => {
    createFiles(10);

    const res = await request.get(`/${base}?key=${process.env.CLOUDFRONT_DISTRIBUTION}&age=0`);

    expect(res.body).toEqual({ files: 10, invalidations: 0 });
  });

  test("should invalidate path", async () => {
    const res = await request.get(`/${base}/invalidate?key=${process.env.CLOUDFRONT_DISTRIBUTION}`);

    expect(res.body).toEqual({ files: 0, invalidations: 1 });
  });
});
