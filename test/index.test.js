describe('main routes', () => {
  test('index should redirect to status', async done => {
    const res = await request.get('/');

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/status');

    done();
  });

  test('status should return current version', async done => {
    const res = await request.get('/status');

    expect(res.status).toBe(200);
    expect(res.text).toBe(process.env.npm_package_version);

    done();
  });

  test('url with bad format should return a 404 error', async done => {
    const res = await request.get('/something');

    expect(res.status).toBe(404);

    done();
  });
});
