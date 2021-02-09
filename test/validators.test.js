import { request } from "./helpers";

const base = "combo";
const imagery = "7326e81d-40b0-4053-8f33-bd22f9a53df9";

describe("validators", () => {
  test("should return an error if buffer format is wrong", async () => {
    let res = await request.get(`/${base}/${imagery}.png?buffer=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?buffer=1.5`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?buffer=1&buffer=1&buffer=1`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?buffer=1&buffer=1&buffer=1&buffer=a`);

    expect(res.status).toBe(400);
  });

  test("should return an error if minimum buffer format is wrong", async () => {
    let res = await request.get(`/${base}/${imagery}.png?minBuffer=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?minBuffer=1.5`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?minBuffer=1&minBuffer=1&minBuffer=1`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?minBuffer=1&minBuffer=1&minBuffer=1&minBuffer=a`);

    expect(res.status).toBe(400);
  });

  test("should return an error if size format is wrong", async () => {
    let res = await request.get(`/${base}/${imagery}.png?size=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?size=1.5`);

    expect(res.status).toBe(400);
  });

  test("should return an error if ratio format is wrong", async () => {
    const imagery = "c1923c08-5c61-420e-b569-5e00baf0c114";
    const flight = "ebe0d55b-e957-44ab-8240-7202150a3789";

    const res = await request.get(`/${base}/issues/${imagery}/${flight}.png?ratio=AAA`);

    expect(res.status).toBe(400);
  });

  test("should return an error if XYZ format is wrong", async () => {
    let res = await request.get(`/${base}/${imagery}/AA/21455/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/AA/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/21455/AA.png`);

    expect(res.status).toBe(400);
  });

  test("should return an error if imagery UUID format is wrong", async () => {
    const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png`);

    expect(res.status).toBe(400);
  });

  test("should return an error if farm or field UUID format are wrong", async () => {
    const base = "fieldgeo";

    let res = await request.get(`/${base}/the-farm/7355293c-e23d-4aab-8ff0-e2f8f1b83f4e/15/7068/12884.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/7355293c-e23d-4aab-8ff0-e2f8f1b83f4e/the-field/15/7068/12884.png`);

    expect(res.status).toBe(400);
  });

  test("should return an error if marker UUID format is wrong", async () => {
    const res = await request.get(`/${base}/marker/e6437d6f-4637-4133-bb17-9da0eff0b963/the-marker.png`);

    expect(res.status).toBe(400);
  });

  test("should return an error if custom layer UUID format is wrong", async () => {
    const res = await request.get(`/custom/the-layer/14/2680/6344.mvt`).responseType("arraybuffer");

    expect(res.status).toBe(400);
  });

  test("should return an error if overlay UUID format is wrong", async () => {
    const res = await request.get(`/tree/count/aaa.png`);

    expect(res.status).toBe(400);
  });

  test("should return an error if age format is wrong", async () => {
    const base = "/cache";

    const res = await request.get(`${base}?age=AAA`);

    expect(res.status).toBe(400);
  });

  test("should return an error if wait format is wrong", async () => {
    const base = "/cache/invalidate";

    const res = await request.get(`${base}?wait=AAA`);

    expect(res.status).toBe(400);
  });

  test("should return an error if region/bucket format are wrong", async () => {
    const base = "/imagery/0e220754-e251-41c2-ab8b-0f05962ab7e9.png";

    let res = await request.get(`${base}?region[]=aaa`);

    expect(res.status).toBe(400);

    res = await request.get(`${base}?bucket[]=aaa`);

    expect(res.status).toBe(400);
  });

  test("should return an error if path format is wrong", async () => {
    const base = "/cache/invalidate";

    let res = await request.get(`${base}?path=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`${base}?path=foo/bar/*`);

    expect(res.status).toBe(400);

    res = await request.get(`${base}?path=foo/bar/`);

    expect(res.status).toBe(400);

    res = await request.get(`${base}?path=foo/bar`);

    expect(res.status).toBe(400);

    res = await request.get(`${base}?path=/foo/bar/`);

    expect(res.status).toBe(400);
  });

  test("should return an error if color format is wrong", async () => {
    const base = "tree";
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    let res = await request.get(`/${base}/data/${overlay}/15/5337/12656.png?color=xxx`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/data/${overlay}/15/5337/12656.png?color=xxx&color=yyy`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/data/${overlay}/15/5337/12656.png?color=%23AAAAAA&color=yyy`);

    expect(res.status).toBe(400);
  });

  test("should return an error if varietal format is wrong", async () => {
    const base = "tree";
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/data/${overlay}/15/5337/12656.png?varietal=aaa&varietal=`);

    expect(res.status).toBe(400);
  });

  test("should return an error if missing format is wrong", async () => {
    const base = "tree";
    const overlay = "98e1c50d-1d6e-40ac-b955-2c8ab5df07cb";

    const res = await request.get(`/${base}/count/${overlay}/15/5337/12656.png?missing=123`);

    expect(res.status).toBe(400);
  });
});
