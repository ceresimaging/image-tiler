import supertest from 'supertest';
import fs from 'fs-extra';

import app from '../server';

jest.setTimeout(60000);

global.request = supertest(app);

expect.extend({
  matchFixture (data, fixture) {
    return {
      pass: data.equals(fs.readFileSync(`${process.cwd()}/test/fixtures/${fixture}`)),
      message: () => 'Response does not match fixture'
    };
  }
});
