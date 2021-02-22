import { request } from "./helpers";

const base = "tree";

describe("tree routes", () => {
  test("should return a vector tile with trees", async () => {
    const overlay = "4d5cca2a-5b18-4346-90af-8daa2bcbfc1e";

    const res = await request.get(`/${base}/count/${overlay}/15/5337/12656.mvt`).responseType("arraybuffer");

    expect(res.body).matchFixture("tree-vector-tile.mvt");
  });

  test("should return a raster tile with trees", async () => {
    const overlay = "4d5cca2a-5b18-4346-90af-8daa2bcbfc1e";

    const res = await request.get(`/${base}/count/${overlay}/15/5337/12656.png`);

    expect(res.body).matchFixture("tree-count-raster-tile.png");
  });

  test("should return a raster image with trees", async () => {
    const overlay = "4d5cca2a-5b18-4346-90af-8daa2bcbfc1e";

    const res = await request.get(`/${base}/count/${overlay}.png`);

    expect(res.body).matchFixture("tree-count-image.png");
  });

  test("should return a raster image with missing trees", async () => {
    const overlay = "4d5cca2a-5b18-4346-90af-8daa2bcbfc1e";

    const res = await request.get(`/${base}/count/${overlay}.png?missing=true`);

    expect(res.body).matchFixture("tree-count-missing-image.png");
  });

  test("should return a raster image with trees filtered by single varietal", async () => {
    const overlay = "041cfc7f-fd9e-4dc5-bf91-0d3775dcce1b";

    const res = await request.get(`/${base}/count/${overlay}.png?varietal=Nonpareil`);

    expect(res.body).matchFixture("tree-count-varietal-image.png");
  });

  test("should return a raster image with trees filtered by multiple varietals", async () => {
    const overlay = "041cfc7f-fd9e-4dc5-bf91-0d3775dcce1b";

    const res = await request.get(`/${base}/count/${overlay}.png?varietal=Nonpareil&varietal=Aldrich`);

    expect(res.body).matchFixture("tree-count-varietals-image.png");
  });

  test("should return a vector tile with tree data", async () => {
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/data/${overlay}/15/5337/12656.mvt`).responseType("arraybuffer");

    expect(res.body).matchFixture("tree-data-vector-tile.mvt");
  });

  test("should return a raster tile with tree data", async () => {
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/data/${overlay}/15/5337/12656.png`);

    expect(res.body).matchFixture("tree-data-raster-tile.png");
  });

  test("should return a raster image with tree data", async () => {
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/data/${overlay}.png`);

    expect(res.body).matchFixture("tree-data-image.png");
  });

  test("should return a raster image with tree data filtered by color", async () => {
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/data/${overlay}.png?color=%23ff0101&color=%230101ff`);

    expect(res.body).matchFixture("tree-data-color-image.png");
  });
});
