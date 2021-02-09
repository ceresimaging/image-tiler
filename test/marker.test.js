import { request } from "./helpers";

const base = "marker";
const visit = "122950";

describe("marker routes", () => {
  test("should return a raster tile", async () => {
    const res = await request.get(`/${base}/${visit}/18/42782/101024.png`);

    expect(res.body).matchFixture("marker-raster-tile.png");
  });

  test("should return a vector tile", async () => {
    const res = await request.get(`/${base}/${visit}/18/42782/101024.mvt`).responseType("arraybuffer");

    expect(res.body).matchFixture("marker-vector-tile.mvt");
  });
});
