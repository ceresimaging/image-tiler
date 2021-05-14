import { request } from "./helpers";

const base = "imagery";
const imagery = "7326e81d-40b0-4053-8f33-bd22f9a53df9";

jest.mock("aws-sdk");

describe("imagery routes", () => {
  test("should return a raster tile", async () => {
    const res = await request.get(`/${base}/${imagery}/17/21455/50471.png`);

    expect(res.body).matchFixture("imagery-raster-tile.png");
  });

  test("should return a single image", async () => {
    const res = await request.get(`/${base}/${imagery}.png`);

    expect(res.body).matchFixture("imagery-image.png");
  });

  test("should accept bucket as parameters", async () => {
    const res = await request.get(`/${base}/${imagery}.png?bucket=ceres-geotiff-data`);

    expect(res.body).matchFixture("imagery-image.png");
  });

  test("should return error if file is not found", async () => {
    const res = await request.get(`/${base}/${imagery}.png?bucket=no-bucket`);

    expect(res.status).toBe(500);
  });

  test("should return a single image with specific size", async () => {
    const res = await request.get(`/${base}/${imagery}.png?size=512`);

    expect(res.body).matchFixture("imagery-image-size.png");
  });
});
