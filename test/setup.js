import fs from 'fs-extra';
import { execFile } from 'child_process';

// Override env variables
process.env.CORE_DB_HOST = 'postgres-tiler';
process.env.CORE_DB_PORT = '5432';
process.env.CORE_DB_USER = 'tiler';
process.env.CORE_DB_PASS = 'tiler';
process.env.CORE_DB_NAME = 'tiler';

// Jest global config
jest.setTimeout(30000);

// Clean log directory
const logDir = `${process.cwd()}/test/log`;
fs.emptyDirSync(logDir);

// Restore database
beforeAll((done) => {
  const child = execFile(`${process.cwd()}/scripts/restore_db.sh`, [], (error, stdout, stderr) => {
    if (error) throw error;
    done();
  });
});

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
