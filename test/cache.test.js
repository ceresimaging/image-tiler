import { request } from "./helpers";

const base = "cache";
const imagery = "7326e81d-40b0-4053-8f33-cd22f9a53df9";
const custom = "0e220754-e251-41c2-ab8b-1f05962ab7e9";

jest.mock("aws-sdk");

describe("cache", () => {
  test("should remove an imagery cached file", async () => {
    const res = await request.get(`/${base}/imagery/${imagery}`);

    expect(res.body).toEqual({ invalidations: 4 });
  });

  test("should remove an imagery cached file and wait for invalidation", async () => {
    const res = await request.get(`/${base}/imagery/${imagery}?wait=true`);

    expect(res.body).toEqual({ invalidations: 4 });
  });

  test("should remove a custom layer cached file", async () => {
    const res = await request.get(`/${base}/custom/${custom}`);

    expect(res.body).toEqual({ invalidations: 1 });
  });

  test("should invalidate path", async () => {
    const res = await request.get(`/${base}/invalidate?key=${process.env.CLOUDFRONT_DISTRIBUTION}`);

    expect(res.body).toEqual({ invalidations: 1 });
  });
});
