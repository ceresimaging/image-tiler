import { request, downloadSatellite, uploadSatellite } from "./helpers";

const base = "combo";
const imagery = "7326e81d-40b0-4053-8f33-bd22f9a53df9";

jest.mock("aws-sdk");

describe("combo routes", () => {
  beforeAll(() => {
    if (!process.env.REFRESH_FIXTURES) downloadSatellite();
  });

  test("should return a raster tile", async () => {
    const res = await request.get(`/${base}/${imagery}/17/21455/50471.png`);

    expect(res.body).matchFixture("combo-raster-tile.png");
  });

  test("should return a single image", async () => {
    const res = await request.get(`/${base}/${imagery}.png`);

    expect(res.body).matchFixture("combo-image.png");
  });

  test("should return a single image with specific size", async () => {
    const res = await request.get(`/${base}/${imagery}.png?size=512`);

    expect(res.body).matchFixture("combo-image-size.png");
  });

  test("should return a single image with specific buffer", async () => {
    const res = await request.get(`/${base}/${imagery}.png?buffer=0.2`);

    expect(res.body).matchFixture("combo-image-buffer.png");
  });

  test("should return a single image with markers", async () => {
    const imagery = "4a6fa821-f022-4864-8e55-b8c9231693d4";
    const visit = 191225;

    const res = await request.get(`/${base}/${imagery}/${visit}.png`);

    expect(res.body).matchFixture("combo-marker.png");
  });

  test("should return a single image with filtered markers", async () => {
    const imagery = "76bcbd2f-9e5a-44b4-a4a3-48ffc2f9b9c5";
    const visit = 210560;

    const res = await request.get(`/${base}/${imagery}/${visit}.png`);

    expect(res.body).matchFixture("combo-image-filter.png");
  });

  test("should return a single image with markers for notifications", async () => {
    const imagery = "4a6fa821-f022-4864-8e55-b8c9231693d4";
    const visit = 191225;

    const res = await request.get(
      `/${base}/issues/${imagery}/${visit}.png?minBuffer=50`
    );

    expect(res.body).matchFixture("combo-issues.png");
  });

  test("should return a single image with markers for notifications with specific aspect ratio", async () => {
    const imagery = "4a6fa821-f022-4864-8e55-b8c9231693d4";
    const visit = 191225;

    const res = await request.get(
      `/${base}/issues/${imagery}/${visit}.png?minBuffer=50&ratio=2`
    );

    expect(res.body).matchFixture("combo-issues-ratio.png");
  });

  afterAll(() => {
    if (process.env.REFRESH_FIXTURES) uploadSatellite();
  });
});
