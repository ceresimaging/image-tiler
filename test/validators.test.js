import { request, app } from './helpers';

const base = 'combo';
const imagery = '7326e81d-40b0-4053-8f33-bd22f9a53df9';

describe('validators', () => {
  test('should return an error if buffer format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}.png?buffer=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?buffer=1.5`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if minimum buffer format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}.png?minBuffer=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?minBuffer=1.5`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if size format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}.png?size=AAA`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}.png?size=1.5`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if ratio format is wrong', async done => {
    const imagery = 'c1923c08-5c61-420e-b569-5e00baf0c114';
    const flight = 'ebe0d55b-e957-44ab-8240-7202150a3789';

    const res = await request.get(`/${base}/issues/${imagery}/${flight}.png?ratio=AAA`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if XYZ format is wrong', async done => {
    let res = await request.get(`/${base}/${imagery}/AA/21455/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/AA/50471.png`);

    expect(res.status).toBe(400);

    res = await request.get(`/${base}/${imagery}/17/21455/AA.png`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if imagery UUID format is wrong', async done => {
    const res = await request.get(`/${base}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9/17/21455/50471.png`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if flight UUID format is wrong', async done => {
    const res = await request.get(`/${base}/${imagery}/AA-7326e81d-40b0-4053-8f33-bd22f9a53df9.png`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if age format is wrong', async done => {
    const base = '/cache';

    const res = await request.get(`${base}?age=AAA`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if wait format is wrong', async done => {
    const base = '/cache/invalidate';

    const res = await request.get(`${base}?wait=AAA`);

    expect(res.status).toBe(400);

    done();
  });

  test('should return an error if path format is wrong', async done => {
    const base = '/cache/invalidate';

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

    done();
  });

  afterAll(app.close);
});
