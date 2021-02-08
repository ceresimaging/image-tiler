import { request } from "./helpers";

const base = "fieldgeo";
const farm = "7355293c-e23d-4aab-8ff0-e2f8f1b83f4e";
const field = "e6437d6f-4637-4133-bb17-9da0eff0b963";

describe("fieldgeo routes", () => {
  test("should return a vector tile filter by farm", async () => {
    const res = await request
      .get(`/${base}/${farm}/14/3534/6442.mvt`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-farm-vector-tile.mvt");
  });

  test("should return a vector tile filter by field", async () => {
    const res = await request
      .get(`/${base}/${farm}/${field}/15/7068/12884.mvt`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-field-vector-tile.mvt");
  });

  test("should return a raster tile filter by farm", async () => {
    const res = await request
      .get(`/${base}/${farm}/14/3534/6442.png`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-farm-tile.png");
  });

  test("should return a raster tile filter by field", async () => {
    const res = await request
      .get(`/${base}/${farm}/${field}/15/7068/12884.png`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-field-tile.png");
  });

  test("should return a raster image filter by farm", async () => {
    const res = await request
      .get(`/${base}/${farm}.png`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-farm.png");
  });

  test("should return a raster image filter by field", async () => {
    const res = await request
      .get(`/${base}/${farm}/${field}.png`)
      .responseType("arraybuffer");

    expect(res.body).matchFixture("fieldgeo-field.png");
  });
});
