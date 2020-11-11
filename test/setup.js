import fs from 'fs-extra';

// Override env variables
process.env.CORE_DB_HOST = process.env.TEST_DB_HOST;
process.env.CORE_DB_USER = process.env.TEST_DB_USER;
process.env.CORE_DB_PASS = process.env.TEST_DB_PASS;
process.env.CORE_DB_NAME = process.env.TEST_DB_NAME;
process.env.NODE_ENV = 'test';

// Jest global config
jest.setTimeout(30000);

// Clean log directory
const logDir = `${process.cwd()}/test/log`;
fs.emptyDirSync(logDir);

expect.extend({
  matchFixture (data, fixture) {
    fs.writeFileSync(`${logDir}/${fixture}`, data);

    return {
      pass:
        Buffer.isBuffer(data) &&
        data.equals(
          fs.readFileSync(`${process.cwd()}/test/fixtures/${fixture}`)
        ),
      message: () => 'Response does not match fixture'
    };
  }
});
