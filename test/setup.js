import fs from 'fs-extra';

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
