import { request } from "./helpers";

describe("main routes", () => {
  test("index should redirect to status", async () => {
    const res = await request.get("/");

    expect(res.status).toBe(302);
    expect(res.header.location).toBe("/status");
  });

  test("status should return current version", async () => {
    const res = await request.get("/status");

    expect(res.status).toBe(200);
    expect(res.text).toBe(process.env.npm_package_version);
  });

  test("url with bad format should return a 404 error", async () => {
    const res = await request.get("/something");

    expect(res.status).toBe(404);
  });
});
